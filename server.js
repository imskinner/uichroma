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
} = require('./db');

const app = express();

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

    // Generate MD5 hash for permalink
    const md5 = crypto.createHash('md5');
    const timestamp = Date.now().toString();
    const permalink = md5.update(timestamp).digest('hex');

    // Persist to Supabase
    const id = await insertTheme({
      permalink,
      keywords: feelings,
      colors: paletteData,
      aiResponse,
      style,
    });

    res.json({
      permalink,
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

// Endpoint: update palette colors
app.post('/api/updatePalette', async (req, res) => {
  try {
    const { permalink, colors } = req.body;
    if (!permalink || !colors) {
      return res.status(400).json({ error: 'permalink and colors are required' });
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

//Endpoint to fetch a palette data
app.get('/palette/:permalink/data', async (req, res) => {
  try {
    const row = await getThemeByPermalink(req.params.permalink);
    if (row) {
      res.json({ colors: row.colors, aiResponse: row.ai_response, keywords: row.keywords, style: row.style });
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
