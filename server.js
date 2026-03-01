require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');
const crypto = require('crypto');
const admin = require('firebase-admin');

const app = express();

// Initialize Firebase Admin SDK with service account credentials
const serviceAccount = require('./ui-chroma-app-firebase-adminsdk-fbsvc-ecc476714d.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

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
    const querySnapshot = await db.collection('palettes')
      .where('permalink', '==', permalink).get();

    if (!querySnapshot.empty) {
      const palette = querySnapshot.docs[0].data();
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
    const docRef = await db.collection('palettes').add({
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
    const querySnapshot = await db.collection('palettes')
      .where('permalink', '==', permalink).get();

    if (!querySnapshot.empty) {
      const palette = querySnapshot.docs[0].data();
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

// Semantic hue ranges for validation
const SEMANTIC_HUE_RANGES = {
  warning: { min: 25, max: 60 },
  danger:  { min: 340, max: 20, wraps: true },  // wraps around 0
  success: { min: 90, max: 165 },
  info:    { min: 185, max: 245 }
};

// Check if a hue falls within a range (handles wrap-around for danger)
function hueInRange(hue, range) {
  if (range.wraps) {
    return hue >= range.min || hue <= range.max;
  }
  return hue >= range.min && hue <= range.max;
}

// Nudge a hue into its valid range (pick nearest bound)
function nudgeHue(hue, range) {
  if (hueInRange(hue, range)) return hue;
  if (range.wraps) {
    const distToMin = Math.min(Math.abs(hue - range.min), 360 - Math.abs(hue - range.min));
    const distToMax = Math.min(Math.abs(hue - range.max), 360 - Math.abs(hue - range.max));
    return distToMin <= distToMax ? range.min : range.max;
  }
  const mid = (range.min + range.max) / 2;
  const distToMin = Math.abs(hue - range.min);
  const distToMax = Math.abs(hue - range.max);
  return distToMin <= distToMax ? range.min : range.max;
}

// Validate and auto-correct palette colors
function validatePalette(colors) {
  // 1. Ensure each color has HSL from its hex
  const keys = ['primary','secondary','accent','warning','danger','success','info'];
  for (const key of keys) {
    const c = colors[key];
    if (!c) continue;
    if (c.h == null || c.s == null || c.l == null) {
      const hsl = hexToHSL(c.hex);
      c.h = hsl.h;
      c.s = hsl.s;
      c.l = hsl.l;
    }
  }

  // 2. Enforce semantic hue ranges
  for (const key of ['warning','danger','success','info']) {
    const c = colors[key];
    if (!c) continue;
    const range = SEMANTIC_HUE_RANGES[key];
    if (!hueInRange(c.h, range)) {
      c.h = nudgeHue(c.h, range);
      c.hex = hslToHex(c.h, c.s, c.l);
    }
  }

  // 3. Enforce accent contrast: clamp lightness to 25–55 for CTA usability
  const accent = colors['accent'];
  if (accent) {
    if (accent.l < 25) {
      accent.l = 25;
      accent.hex = hslToHex(accent.h, accent.s, accent.l);
    } else if (accent.l > 55) {
      accent.l = 55;
      accent.hex = hslToHex(accent.h, accent.s, accent.l);
    }
  }

  return colors;
}

const PALETTE_SYSTEM_PROMPT = `You are an expert AI color system designer. The user will describe a project, brand, mood, or aesthetic. Generate a cohesive 7-color UI palette that captures their vision.

COLOR ROLES:
- Primary: The dominant brand color. Can be any hue/lightness that fits the described mood.
- Secondary: Complements the primary. Should feel cohesive but distinguishable.
- Accent: Used for call-to-action buttons and interactive highlights. MUST have good contrast on white backgrounds (lightness 25–55, saturation >= 50).
- Warning: Should feel cautionary. Must be in the yellow-orange family (hue 30–55).
- Danger: Should feel urgent/negative. Must be in the red family (hue 340–360 or 0–15).
- Success: Should feel positive/confirmatory. Must be in the green family (hue 100–160).
- Info: Should feel neutral/informational. Must be in the blue family (hue 190–240).

GUIDELINES:
- Interpret the user's prompt holistically — if they say "dark luxury brand", primary could be near-black or deep purple. If they say "playful kids app", use bright saturated colors.
- Primary and secondary have NO fixed lightness or saturation rules — choose what best matches the prompt.
- The overall palette should feel intentional and cohesive, like a professional designer chose it.
- Each color's description should explain how it serves the user's stated vision.

For each color provide a hex code, HSL values (h 0-360, s 0-100, l 0-100), and a brief description explaining the design choice.`;

async function generateColorPalette(feelings) {
  const apiKey = process.env.API_KEY;
  const colorSchema = {
    type: "object",
    properties: {
      hex:         { type: "string", description: "Hex color code e.g. #3A86FF" },
      h:           { type: "number", description: "Hue 0-360" },
      s:           { type: "number", description: "Saturation 0-100" },
      l:           { type: "number", description: "Lightness 0-100" },
      description: { type: "string", description: "Brief design rationale" }
    },
    required: ["hex", "h", "s", "l", "description"]
  };
  const paletteFunction = [
    {
      name: "generate_palette",
      description: "Generate a 7-color UI palette with hex, HSL values, and descriptions",
      parameters: {
        type: "object",
        properties: {
          primary:   colorSchema,
          secondary: colorSchema,
          accent:    colorSchema,
          warning:   colorSchema,
          danger:    colorSchema,
          success:   colorSchema,
          info:      colorSchema
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
          { role: "system", content: PALETTE_SYSTEM_PROMPT },
          { role: "user", content: feelings }
        ],
        functions: paletteFunction,
        function_call: { name: "generate_palette" },
        temperature: 0.5
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
      const validated = validatePalette(args);
      return { colors: validated, aiResponse: JSON.stringify(validated) };
    }
    // Unexpected response format
    throw new Error('OpenAI did not return a function call');
  } catch (error) {
    console.error(`Error in generateColorPalette: ${error.message}`);
    throw error;
  }
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

