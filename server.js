require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');
const crypto = require('crypto');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, query, where, getDocs } = require('firebase/firestore');

const app = express();

// Initialize Firebase
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/css', express.static(path.join(__dirname, 'public', 'css')));
app.use('/img', express.static(path.join(__dirname, 'public', 'img')));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Get a palette from Firestore
async function getPaletteFromDatabase(permalink) {
  try {
    const palettesRef = collection(db, 'palettes');
    const q = query(palettesRef, where('permalink', '==', permalink));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const paletteDoc = querySnapshot.docs[0];
      const palette = paletteDoc.data();
      return { colors: palette.colors, aiResponse: palette.ai_response };
    } else {
      return null;
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    return null;
  }
}

// Utility: convert hex to HSL
function hexToHSL(H) {
  let r = 0, g = 0, b = 0;
  if (H.length === 4) {
    r = parseInt(H[1] + H[1], 16);
    g = parseInt(H[2] + H[2], 16);
    b = parseInt(H[3] + H[3], 16);
  } else if (H.length === 7) {
    r = parseInt(H.substr(1,2), 16);
    g = parseInt(H.substr(3,2), 16);
    b = parseInt(H.substr(5,2), 16);
  }
  r /= 255; g /= 255; b /= 255;
  const cmin = Math.min(r, g, b), cmax = Math.max(r, g, b);
  const delta = cmax - cmin;
  let h = 0, s = 0;
  const l = (cmax + cmin) / 2;
  if (delta !== 0) {
    s = delta / (1 - Math.abs(2 * l - 1));
    switch (cmax) {
      case r: h = ((g - b) / delta) % 6; break;
      case g: h = (b - r) / delta + 2; break;
      case b: h = (r - g) / delta + 4; break;
    }
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }
  s = +((s * 100).toFixed(1));
  return { h, s, l: +((l * 100).toFixed(1)) };
}

// Utility: convert HSL to hex
function hslToHex(h, s, l) {
  s /= 100; l /= 100;
  const k = n => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const toHex = x => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
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
app.post('/generatePalette', async (req, res) => {
  try {
    const feelings = req.body.feelings;
    const { colors, aiResponse } = await generateColorPalette(feelings);
    
    // Generate MD5 hash for permalink
    const md5 = crypto.createHash('md5');
    const timestamp = Date.now().toString();
    const permalink = md5.update(timestamp).digest('hex');
    
    // Normalize and validate palette (array or structured)
    let paletteData;
    if (Array.isArray(colors)) {
      if (colors.length < 7) throw new Error('Invalid colors array received from palette generation');
      paletteData = {
        primary:   { hex: colors[0] },
        secondary: { hex: colors[1] },
        accent:    { hex: colors[2] },
        warning:   { hex: colors[3] },
        danger:    { hex: colors[4] },
        success:   { hex: colors[5] },
        info:      { hex: colors[6] }
      };
    } else if (colors && typeof colors === 'object') {
      const keys = ['primary','secondary','accent','warning','danger','success','info'];
      for (const key of keys) {
        if (!colors[key] || typeof colors[key].hex !== 'string') {
          throw new Error(`Missing or invalid color field: ${key}`);
        }
      }
      paletteData = colors;
    } else {
      throw new Error('Invalid colors format received from palette generation');
    }
    
    // Generate neutral based on primary
    const primaryHSL = hexToHSL(paletteData.primary.hex);
    const neutralHex = hslToHex(primaryHSL.h, 10, 10);
    paletteData.neutral = {
      hex: neutralHex,
      description: 'A blackish color that elegantly integrates the palette. Best for text, lines, backgrounds, etc'
    };
    
    // Add palette to Firestore
    const palettesRef = collection(db, 'palettes');
    const docRef = await addDoc(palettesRef, {
      keywords: feelings,
      colors: paletteData,
      ai_response: aiResponse,
      created_at: new Date().toISOString(),
      permalink: permalink
    });
    
    res.json({
      permalink,
      colors: paletteData,
      aiResponse,
      id: docRef.id
    });
  } catch (error) {
    console.error('Error in /generatePalette:', error);
    res.status(500).json({ 
      error: 'An error occurred while generating the palette.',
      details: error.message
    });
  }
});

//Endpoint to fetch a palette data
app.get('/palette/:permalink/data', async (req, res) => {
  try {
    const permalink = req.params.permalink;
    const palettesRef = collection(db, 'palettes');
    const q = query(palettesRef, where('permalink', '==', permalink));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const paletteDoc = querySnapshot.docs[0];
      const palette = paletteDoc.data();
      res.json({ colors: palette.colors, aiResponse: palette.ai_response, keywords: palette.keywords });
    } else {
      res.status(404).json({ error: 'Palette not found.' });
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    res.status(500).json({ error: 'An error occurred while fetching the palette data.' });
  }
});

//Render the palette.html as the template for an existing palette
app.get('/palette/:permalink', async (req, res) => {
  res.sendFile(path.join(__dirname,'public', 'palette.html'));
});

async function generateColorPalette(feelings) {
  const apiKey = process.env.API_KEY;
  // Define function schema for structured JSON output
  const paletteFunction = [
    {
      name: "generate_palette",
      description: "Generate an 8-color UI palette with hex codes and descriptions for primary, secondary, accent, warning, danger, success, info, and neutral",
      parameters: {
        type: "object",
        properties: {
          primary:   { type: "object", properties: { hex: { type: "string" }, description: { type: "string" } }, required: ["hex"] },
          secondary: { type: "object", properties: { hex: { type: "string" }, description: { type: "string" } }, required: ["hex"] },
          accent:    { type: "object", properties: { hex: { type: "string" }, description: { type: "string" } }, required: ["hex"] },
          warning:   { type: "object", properties: { hex: { type: "string" }, description: { type: "string" } }, required: ["hex"] },
          danger:    { type: "object", properties: { hex: { type: "string" }, description: { type: "string" } }, required: ["hex"] },
          success:   { type: "object", properties: { hex: { type: "string" }, description: { type: "string" } }, required: ["hex"] },
          info:      { type: "object", properties: { hex: { type: "string" }, description: { type: "string" } }, required: ["hex"] }
        },
        required: ["primary","secondary","accent","warning","danger","success","info"]
      }
    }
  ];
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are a UI/UX designer. Use function generate_palette to return a palette with primary, secondary, accent, warning, danger, success, info, and neutral colors including hex codes and brief descriptions." },
          { role: "user", content: `Keywords: \"${feelings}\".` }
        ],
        functions: paletteFunction,
        function_call: { name: "generate_palette" },
        temperature: 0.7
      })
    });
    // Handle HTTP errors
    if (!response.ok) {
      const errText = await response.text();
      console.error(`OpenAI API Error: ${response.status} - ${errText}`);
      throw new Error('OpenAI API request failed');
    }
    const data = await response.json();
    // Parse structured JSON from function call
    const choiceMsg = data.choices?.[0]?.message;
    if (choiceMsg?.function_call) {
      const args = JSON.parse(choiceMsg.function_call.arguments);
      return { colors: args, aiResponse: JSON.stringify(args) };
    }
    // Unexpected response format
    throw new Error('OpenAI did not return a function call');
  } catch (error) {
    console.error(`Error in generateColorPalette: ${error.message}`);
    throw error;
  }
}

// Routes
app.post('/api/palettes', async (req, res) => {
  try {
    const { name, colors, userId } = req.body;
    const docRef = await addDoc(collection(db, 'palettes'), {
      name,
      colors,
      userId,
      createdAt: new Date()
    });
    res.json({ id: docRef.id });
  } catch (error) {
    console.error('Error saving palette:', error);
    res.status(500).json({ error: 'Failed to save palette' });
  }
});

app.get('/api/palettes', async (req, res) => {
  try {
    const { userId } = req.query;
    const q = query(collection(db, 'palettes'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    const palettes = [];
    querySnapshot.forEach((doc) => {
      palettes.push({ id: doc.id, ...doc.data() });
    });
    res.json(palettes);
  } catch (error) {
    console.error('Error fetching palettes:', error);
    res.status(500).json({ error: 'Failed to fetch palettes' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

