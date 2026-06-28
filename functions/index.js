const { onRequest } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const crypto = require('crypto');

// Shared color/theme engine — single source of truth (see packages/core).
const { runPalettePipeline } = require('@uichroma/core');

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// Express App
const app = express();
app.use(cors({ origin: true }));
app.use(bodyParser.json());

// Endpoint: generate palette
app.post('/generatePalette', async (req, res) => {
  try {
    const { feelings } = req.body;

    // Generate → score → critique (if needed) → derive neutral. All in packages/core.
    const { colors } = await runPalettePipeline(feelings, process.env.OPENAI_KEY);

    const permalink = crypto.createHash('md5').update(Date.now().toString()).digest('hex');
    await db.collection('palettes').doc(permalink).set({ keywords: feelings, colors, created_at: new Date().toISOString() });
    res.json({ permalink, colors });
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

// Endpoint: get palette for Figma plugin
app.post('/api/getPalette', async (req, res) => {
  try {
    const { permalink } = req.body;
    if (!permalink) return res.status(400).json({ error: 'permalink is required' });
    const doc = await db.collection('palettes').doc(permalink).get();
    if (!doc.exists) return res.json({ palette: null });
    const data = doc.data();
    res.json({ palette: { colors: data.colors, keywords: data.keywords } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch palette.' });
  }
});

// Endpoint: update palette colors
app.post('/api/updatePalette', async (req, res) => {
  try {
    const { permalink, colors } = req.body;
    if (!permalink || !colors) {
      return res.status(400).json({ error: 'permalink and colors are required' });
    }
    const doc = await db.collection('palettes').doc(permalink).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Palette not found.' });
    }
    await db.collection('palettes').doc(permalink).update({
      colors: colors,
      updated_at: new Date().toISOString()
    });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update palette.' });
  }
});

// Endpoint: get palette data
app.get('/palette/:permalink/data', async (req, res) => {
  try {
    const doc = await db.collection('palettes').doc(req.params.permalink).get();
    if (!doc.exists) return res.status(404).send('Not found');
    return res.json({
      colors: doc.data().colors,
      keywords: doc.data().keywords,
      permalink: req.params.permalink
    });
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

const openAiKey = defineSecret('OPENAI_KEY');
exports.app = onRequest({ secrets: [openAiKey] }, app);
