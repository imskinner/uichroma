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

// Which LLM backs generation: Anthropic when ANTHROPIC_API_KEY is set, else OpenAI (API_KEY).
// Read per-request so flipping the env var takes effect without a code change.
function llmConfig() {
  if (process.env.ANTHROPIC_API_KEY) {
    return { apiKey: process.env.ANTHROPIC_API_KEY, provider: 'anthropic' };
  }
  return { apiKey: process.env.API_KEY, provider: 'openai' };
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

// A separate, more lenient limiter for the cheap mood-suggestion endpoint, which fires as the
// user types (so it must not consume the generation budget). Its own IP map + sweep.
const MOODS_RATE_MAX = Number(process.env.MOODS_RATE_MAX) || 40;
const moodHits = new Map();
function rateLimitMoods(req, res, next) {
  const fwd = req.headers['x-forwarded-for'];
  const ip = (fwd && fwd.split(',')[0].trim()) || req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  let entry = moodHits.get(ip);
  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + 60_000 };
    moodHits.set(ip, entry);
  }
  entry.count++;
  if (entry.count > MOODS_RATE_MAX) {
    res.set('Retry-After', '30');
    return res.status(429).json({ error: 'Too many requests. Please slow down.' });
  }
  next();
}
const moodSweep = setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of moodHits) if (now > entry.resetAt) moodHits.delete(ip);
}, 60_000);
if (moodSweep.unref) moodSweep.unref();

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
    const { apiKey, provider } = llmConfig();
    const { colors: paletteData, style, aiResponse } = await runPalettePipeline(feelings, apiKey, { provider });

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
      details: error.message,
    });
  }
});

// --- Mood suggestions: assists the home-page prompt box ---
// A richer, mood-qualified brief produces a more distinctive palette. Given the user's
// in-progress description we suggest a few evocative "moods" they can tap to add.
const MOODS_SYSTEM_PROMPT = `You are a senior brand designer helping someone describe a brand so an AI can generate a distinctive color palette.
Given their short description, suggest color "moods": evocative one- or two-word adjectives (tone, feeling, or material) that push the palette toward something specific and fitting — NOT generic filler.

Rules:
- Return exactly 5 moods, ordered most-fitting first.
- Prefer concrete, palette-shaping words (e.g. earthy, warm, muted, neon, pastel, moody, premium, playful, organic, industrial, airy, vintage, high-contrast) over vague ones (nice, good, cool, beautiful).
- Do NOT repeat words already present in the description.
- Lowercase, no punctuation, each mood 1-2 words.
- Tailor to the domain: a coffee shop -> earthy, warm, artisanal, cozy, premium; a crypto app -> futuristic, neon, high-contrast, sleek, bold.

Respond ONLY as JSON: {"moods": ["...", "...", "...", "...", "..."]}`;

function sanitizeMoods(raw) {
  const arr = Array.isArray(raw) ? raw : [];
  const seen = new Set();
  const moods = [];
  for (const m of arr) {
    if (typeof m !== 'string') continue;
    const clean = m.trim().toLowerCase();
    if (clean.length < 2 || clean.length > 22) continue;
    if (!/^[a-z][a-z -]*$/.test(clean)) continue; // letters, spaces, hyphens only
    if (seen.has(clean)) continue;
    seen.add(clean);
    moods.push(clean);
    if (moods.length >= 6) break;
  }
  return moods;
}

async function suggestMoodsAI(prompt) {
  const { apiKey, provider } = llmConfig();
  if (!apiKey) throw new Error('LLM API key is not set.');

  if (provider === 'anthropic') {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 150,
        temperature: 0.8,
        system: MOODS_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: prompt }],
        tools: [{
          name: 'suggest_moods',
          description: 'Return the list of suggested color moods.',
          input_schema: {
            type: 'object',
            properties: { moods: { type: 'array', items: { type: 'string' } } },
            required: ['moods'],
          },
        }],
        tool_choice: { type: 'tool', name: 'suggest_moods' },
      }),
    });
    if (!response.ok) throw new Error(`Anthropic API ${response.status}: ${await response.text()}`);
    const data = await response.json();
    const block = (data.content || []).find(b => b.type === 'tool_use');
    return sanitizeMoods(block?.input?.moods);
  }

  // OpenAI JSON mode.
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      temperature: 0.8,
      max_tokens: 120,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: MOODS_SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
    }),
  });
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenAI API ${response.status}: ${errText}`);
  }
  const data = await response.json();
  let parsed = {};
  try {
    parsed = JSON.parse(data.choices?.[0]?.message?.content || '{}');
  } catch {
    parsed = {};
  }
  return sanitizeMoods(parsed.moods);
}

app.post('/api/suggestMoods', rateLimitMoods, async (req, res) => {
  try {
    const prompt = String(req.body.prompt || '').trim().slice(0, 300);
    if (prompt.length < 3) return res.json({ moods: [] });
    const moods = await suggestMoodsAI(prompt);
    res.json({ moods });
  } catch (error) {
    console.error('Error in /api/suggestMoods:', error);
    res.status(500).json({ error: 'Failed to suggest moods.' });
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
