require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');

// Shared color/theme engine — single source of truth (see packages/core).
const { runPalettePipeline } = require('./packages/core');
// Supabase data layer — replaces Firestore (see db/index.js).
const {
  getThemeByPermalink,
  insertTheme,
  updateThemeColors,
  getUserId,
  getThemeOwner,
  getThemesByUser,
  createTeam,
  getTeamsForUser,
  getTeamByInviteCode,
  addTeamMember,
  getTeamRole,
  getTeamThemes,
  shareThemeToTeam,
} = require('./db');

const app = express();

// Extract the Supabase access token from the Authorization header, if present.
function bearerToken(req) {
  const h = req.headers['authorization'] || '';
  return h.startsWith('Bearer ') ? h.slice(7) : null;
}

// Build a human-readable, URL-safe slug from the prompt (uniqueness comes from the suffix).
function slugify(text) {
  return (
    String(text || '')
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40)
      .replace(/-+$/g, '') || 'theme'
  );
}

app.use(cors());
app.use(express.static(path.join(__dirname, 'client', 'dist')));
app.use(bodyParser.json());

// --- Lightweight in-memory rate limiter (stopgap) ---
// Fine for a single instance; it does NOT share state across serverless instances. Replace
// with an Upstash/Redis-backed limiter for multi-instance Vercel (see docs/PIVOT-PLAN.md §3.4).
// Guards the expensive OpenAI endpoint, where each generation can trigger a second (critique) call.
const RATE_LIMIT_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS) || 60_000;
const RATE_LIMIT_MAX = Number(process.env.RATE_LIMIT_MAX) || 10;
const rateHits = new Map(); // ip -> { count, resetAt }

function rateLimit(req, res, next) {
  const fwd = req.headers['x-forwarded-for'];
  const ip = (fwd && fwd.split(',')[0].trim()) || req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  let entry = rateHits.get(ip);
  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };
    rateHits.set(ip, entry);
  }
  entry.count++;
  if (entry.count > RATE_LIMIT_MAX) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    res.set('Retry-After', String(retryAfter));
    return res.status(429).json({ error: 'Too many requests. Please slow down.', retryAfter });
  }
  next();
}

// Bound memory by sweeping expired entries; unref so the timer never holds the process open.
const rateSweep = setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateHits) {
    if (now > entry.resetAt) rateHits.delete(ip);
  }
}, RATE_LIMIT_WINDOW_MS);
if (rateSweep.unref) rateSweep.unref();

// Get a palette from the database
async function getPaletteFromDatabase(permalink) {
  try {
    const row = await getThemeByPermalink(permalink);
    return row ? { colors: row.colors, aiResponse: row.ai_response, style: row.style } : null;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    return null;
  }
}

//API Endpoint to return the palette to the Figma Plugin
app.post('/api/getPalette', async (req, res) => {
  const { permalink } = req.body;
  try {
    const palette = await getPaletteFromDatabase(permalink);
    res.json({ palette });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch palette.' });
  }
});

//Endpoint to Generate the palette from the prompts
app.post('/generatePalette', rateLimit, async (req, res) => {
  try {
    const feelings = req.body.feelings;

    // Generate → score → critique (if needed) → derive neutral + non-color style. All in packages/core.
    const { colors: paletteData, style, aiResponse } = await runPalettePipeline(feelings, process.env.API_KEY);

    // Generate MD5 hash for permalink + a human-readable slug (suffix keeps it unique).
    const md5 = crypto.createHash('md5');
    const timestamp = Date.now().toString();
    const permalink = md5.update(timestamp).digest('hex');
    const slug = `${slugify(feelings)}-${permalink.slice(0, 10)}`;

    // If the caller is signed in, attribute the theme to them (otherwise anonymous).
    const userId = await getUserId(bearerToken(req));

    // Persist to Supabase
    const id = await insertTheme({
      permalink,
      slug,
      keywords: feelings,
      colors: paletteData,
      aiResponse,
      style,
      userId,
    });

    res.json({
      permalink,
      slug,
      colors: paletteData,
      style,
      aiResponse,
      id,
    });
  } catch (error) {
    console.error('Error in /generatePalette:', error);
    res.status(500).json({
      error: 'An error occurred while generating the palette.',
      details: error.message
    });
  }
});

// Endpoint: update palette colors (owner-only once a theme is claimed by a user)
app.post('/api/updatePalette', async (req, res) => {
  try {
    const { permalink, colors } = req.body;
    if (!permalink || !colors) {
      return res.status(400).json({ error: 'permalink and colors are required' });
    }
    const owner = await getThemeOwner(permalink);
    if (owner === undefined) {
      return res.status(404).json({ error: 'Palette not found.' });
    }
    // Owned themes may only be edited by their owner; unowned (legacy/anon) themes stay editable.
    if (owner) {
      const userId = await getUserId(bearerToken(req));
      if (owner !== userId) {
        return res.status(403).json({ error: 'You do not have permission to edit this theme.' });
      }
    }
    const updated = await updateThemeColors(permalink, colors);
    if (!updated) {
      return res.status(404).json({ error: 'Palette not found.' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Error in /api/updatePalette:', error);
    res.status(500).json({ error: 'Failed to update palette.' });
  }
});

// Endpoint: the signed-in user's saved themes
app.get('/api/myThemes', async (req, res) => {
  try {
    const userId = await getUserId(bearerToken(req));
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated.' });
    }
    const themes = await getThemesByUser(userId);
    res.json({ themes });
  } catch (error) {
    console.error('Error in /api/myThemes:', error);
    res.status(500).json({ error: 'Failed to load your themes.' });
  }
});

// --- Teams (Phase 3.2) ---

// List the signed-in user's teams
app.get('/api/teams', async (req, res) => {
  try {
    const userId = await getUserId(bearerToken(req));
    if (!userId) return res.status(401).json({ error: 'Not authenticated.' });
    const teams = await getTeamsForUser(userId);
    res.json({ teams });
  } catch (error) {
    console.error('Error in GET /api/teams:', error);
    res.status(500).json({ error: 'Failed to load teams.' });
  }
});

// Create a team (the caller becomes its owner)
app.post('/api/teams', async (req, res) => {
  try {
    const userId = await getUserId(bearerToken(req));
    if (!userId) return res.status(401).json({ error: 'Not authenticated.' });
    const name = (req.body.name || '').trim();
    if (!name) return res.status(400).json({ error: 'A team name is required.' });
    const inviteCode = crypto.randomBytes(9).toString('base64url');
    const team = await createTeam({ name, ownerId: userId, inviteCode });
    res.json({ team: { id: team.id, name: team.name, invite_code: team.invite_code, role: 'owner' } });
  } catch (error) {
    console.error('Error in POST /api/teams:', error);
    res.status(500).json({ error: 'Failed to create team.' });
  }
});

// Join a team by its invite code
app.post('/api/teams/join', async (req, res) => {
  try {
    const userId = await getUserId(bearerToken(req));
    if (!userId) return res.status(401).json({ error: 'Not authenticated.' });
    const code = (req.body.code || '').trim();
    if (!code) return res.status(400).json({ error: 'An invite code is required.' });
    const team = await getTeamByInviteCode(code);
    if (!team) return res.status(404).json({ error: 'Invite not found.' });
    await addTeamMember(team.id, userId, 'member');
    res.json({ team: { id: team.id, name: team.name } });
  } catch (error) {
    console.error('Error in POST /api/teams/join:', error);
    res.status(500).json({ error: 'Failed to join team.' });
  }
});

// A team's shared themes (members only)
app.get('/api/teams/:teamId/themes', async (req, res) => {
  try {
    const userId = await getUserId(bearerToken(req));
    if (!userId) return res.status(401).json({ error: 'Not authenticated.' });
    const role = await getTeamRole(req.params.teamId, userId);
    if (!role) return res.status(403).json({ error: 'You are not a member of this team.' });
    const themes = await getTeamThemes(req.params.teamId);
    res.json({ themes });
  } catch (error) {
    console.error('Error in GET /api/teams/:teamId/themes:', error);
    res.status(500).json({ error: 'Failed to load team themes.' });
  }
});

// Share a theme to a team (must own the theme and be a member of the team)
app.post('/api/theme/share', async (req, res) => {
  try {
    const userId = await getUserId(bearerToken(req));
    if (!userId) return res.status(401).json({ error: 'Not authenticated.' });
    const { permalink, teamId } = req.body;
    if (!permalink || !teamId) {
      return res.status(400).json({ error: 'permalink and teamId are required.' });
    }
    const owner = await getThemeOwner(permalink);
    if (owner === undefined) return res.status(404).json({ error: 'Theme not found.' });
    if (owner !== userId) {
      return res.status(403).json({ error: 'You can only share themes you own.' });
    }
    const role = await getTeamRole(teamId, userId);
    if (!role) return res.status(403).json({ error: 'You are not a member of this team.' });
    const shared = await shareThemeToTeam(permalink, teamId);
    if (!shared) return res.status(404).json({ error: 'Theme not found.' });
    res.json({ success: true });
  } catch (error) {
    console.error('Error in POST /api/theme/share:', error);
    res.status(500).json({ error: 'Failed to share theme.' });
  }
});

//Endpoint to fetch a palette data
app.get('/palette/:permalink/data', async (req, res) => {
  try {
    const row = await getThemeByPermalink(req.params.permalink);
    if (row) {
      res.json({
        permalink: row.permalink,
        slug: row.slug,
        colors: row.colors,
        aiResponse: row.ai_response,
        keywords: row.keywords,
        style: row.style,
      });
    } else {
      res.status(404).json({ error: 'Palette not found.' });
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    res.status(500).json({ error: 'An error occurred while fetching the palette data.' });
  }
});

// SPA catch-all: serve index.html for client-side routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
});

// Export the app for serverless (Vercel) wrapping; listen only when run directly (npm start / dev).
module.exports = app;

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
