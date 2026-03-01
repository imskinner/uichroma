const { onRequest } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const crypto = require('crypto');

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// Express App
const app = express();
app.use(cors({ origin: true }));
app.use(bodyParser.json());

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
  r/=255; g/=255; b/=255;
  const cmin = Math.min(r,g,b), cmax = Math.max(r,g,b), delta = cmax - cmin;
  let h=0, s=0;
  const l = (cmax + cmin)/2;
  if (delta !== 0) {
    s = delta / (1 - Math.abs(2*l -1));
    switch(cmax) {
      case r: h = ((g - b)/delta) % 6; break;
      case g: h = (b - r)/delta + 2; break;
      case b: h = (r - g)/delta + 4; break;
    }
    h = Math.round(h*60);
    if (h<0) h+=360;
  }
  s = +(s*100).toFixed(1);
  return { h, s, l: +(l*100).toFixed(1) };
}

// Utility: convert HSL to hex
function hslToHex(h, s, l) {
  s/=100; l/=100;
  const k = n => (n + h/30) % 12;
  const a = s * Math.min(l,1-l);
  const f = n => l - a * Math.max(-1, Math.min(k(n)-3, Math.min(9-k(n),1)));
  const toHex = x => {
    const hex = Math.round(x*255).toString(16);
    return hex.length ===1 ? '0'+hex : hex;
  };
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
}

// Generate tonal variations if needed
function generateTonesForColor(h, s, count=10, minL=10, maxL=95) {
  const tones=[];
  for(let i=0;i<count;i++){
    const l = Math.round(minL + (maxL-minL)*(i/(count-1)));
    const hex = hslToHex(h, s, l);
    tones.push({ h, s, l, hex });
  }
  return tones;
}

// Semantic hue ranges for validation
const SEMANTIC_HUE_RANGES = {
  warning: { min: 25, max: 60 },
  danger:  { min: 340, max: 20, wraps: true },
  success: { min: 90, max: 165 },
  info:    { min: 185, max: 245 }
};

function hueInRange(hue, range) {
  if (range.wraps) return hue >= range.min || hue <= range.max;
  return hue >= range.min && hue <= range.max;
}

function nudgeHue(hue, range) {
  if (hueInRange(hue, range)) return hue;
  if (range.wraps) {
    const distToMin = Math.min(Math.abs(hue - range.min), 360 - Math.abs(hue - range.min));
    const distToMax = Math.min(Math.abs(hue - range.max), 360 - Math.abs(hue - range.max));
    return distToMin <= distToMax ? range.min : range.max;
  }
  const distToMin = Math.abs(hue - range.min);
  const distToMax = Math.abs(hue - range.max);
  return distToMin <= distToMax ? range.min : range.max;
}

function hueDist(a, b) {
  const d = Math.abs(a - b);
  return Math.min(d, 360 - d);
}

// Validate and auto-correct palette colors
function validatePalette(colors) {
  const keys = ['primary','secondary','accent','warning','danger','success','info'];
  for (const key of keys) {
    const c = colors[key];
    if (!c) continue;
    if (c.h == null || c.s == null || c.l == null) {
      const hsl = hexToHSL(c.hex);
      c.h = hsl.h; c.s = hsl.s; c.l = hsl.l;
    }
  }
  // Enforce semantic hue ranges
  for (const key of ['warning','danger','success','info']) {
    const c = colors[key];
    if (!c) continue;
    const range = SEMANTIC_HUE_RANGES[key];
    if (!hueInRange(c.h, range)) {
      c.h = nudgeHue(c.h, range);
      c.hex = hslToHex(c.h, c.s, c.l);
    }
  }
  // Enforce hue separation between primary/secondary/accent (>= 25°)
  const brandKeys = ['primary','secondary','accent'];
  for (let i = 0; i < brandKeys.length; i++) {
    for (let j = i + 1; j < brandKeys.length; j++) {
      const a = colors[brandKeys[i]], b = colors[brandKeys[j]];
      if (!a || !b) continue;
      if (hueDist(a.h, b.h) < 25) {
        b.h = (b.h + 25) % 360;
        b.hex = hslToHex(b.h, b.s, b.l);
      }
    }
  }
  // Soften L normalization for semantic colors: clamp to 35–65
  for (const key of ['warning','danger','success','info']) {
    const c = colors[key];
    if (!c) continue;
    if (c.l < 35) { c.l = 35; c.hex = hslToHex(c.h, c.s, c.l); }
    else if (c.l > 65) { c.l = 65; c.hex = hslToHex(c.h, c.s, c.l); }
  }
  return colors;
}

// Normalize: derive neutral + soft L clamp (no more hard L=50)
function normalizePaletteColors(colors) {
  const orig = { ...colors };
  // derive neutral from primary
  const p = hexToHSL(orig.primary.hex);
  orig.neutral = {
    hex: hslToHex(p.h,10,10),
    description: 'A blackish color that elegantly integrates the palette. Best for text, lines, backgrounds, etc'
  };
  return orig;
}

const PALETTE_SYSTEM_PROMPT = `You are an expert UI color system designer. Generate a cohesive 7-color palette for a user interface based on the user's keywords and mood.

RULES:
- Primary, Secondary, and Accent must be visually distinct — at least 30° hue separation between each pair.
- Primary is the dominant brand color. Secondary complements it. Accent is for highlights and CTAs.
- Semantic colors must stay in their expected hue families:
  • Warning: yellow-orange range (H 30–55)
  • Danger: red range (H 340–360 or 0–15)
  • Success: green range (H 100–160)
  • Info: blue range (H 190–240)
- All colors should have saturation >= 40 unless the mood calls for muted/pastel tones.
- Lightness for primary/secondary/accent should be 30–60 (usable on white backgrounds with good contrast).

MOOD INTERPRETATION:
- "Vibrant" → high saturation (70–100), full lightness range
- "Muted" → low saturation (25–45), mid lightness
- "Pastel" → low-mid saturation (30–50), high lightness (65–80)
- "Earthy" → warm hues (0–60, 20–50), moderate saturation
- "Warm" → hue range 0–60 (reds, oranges, yellows)
- "Cool" → hue range 180–300 (blues, greens, purples)
- "Monochromatic" → all colors from the same hue, vary saturation and lightness
- "Analogous" → primary/secondary/accent within 30° of each other
- "Complementary" → primary and secondary ~180° apart
- "Triadic" → primary/secondary/accent ~120° apart
- "Duotone" → two dominant hues only, semantic colors still follow their hue families

For each color provide a hex code, HSL values (h 0-360, s 0-100, l 0-100), and a brief description explaining the design choice.`;

// Function to call OpenAI
async function generateColorPalette(feelings) {
  const apiKey = process.env.OPENAI_KEY;
  if (!apiKey) throw new Error('OPENAI_KEY secret is not set.');
  const colorSchema = {
    type:'object', properties:{
      hex:{ type:'string', description:'Hex color code e.g. #3A86FF' },
      h:{ type:'number', description:'Hue 0-360' },
      s:{ type:'number', description:'Saturation 0-100' },
      l:{ type:'number', description:'Lightness 0-100' },
      description:{ type:'string', description:'Brief design rationale' }
    }, required:['hex','h','s','l','description']
  };
  const paletteFunction=[{
    name:'generate_palette',
    description:'Generate a 7-color UI palette with hex, HSL values, and descriptions',
    parameters:{ type:'object', properties:{
      primary: colorSchema, secondary: colorSchema, accent: colorSchema,
      warning: colorSchema, danger: colorSchema, success: colorSchema, info: colorSchema
    }, required:['primary','secondary','accent','warning','danger','success','info']}
  }];
  const res = await fetch('https://api.openai.com/v1/chat/completions',{
    method:'POST', headers:{'Content-Type':'application/json','Authorization':`Bearer ${apiKey}`},
    body:JSON.stringify({model:'gpt-4o', messages:[
      {role:'system', content: PALETTE_SYSTEM_PROMPT},
      {role:'user', content:`Keywords: "${feelings}".`}
    ], functions:paletteFunction, function_call:{name:'generate_palette'}, temperature:0.5})
  });
  if(!res.ok){throw new Error(await res.text());}
  const data=await res.json();
  const msg=data.choices[0].message;
  if(msg.function_call){
    const args = JSON.parse(msg.function_call.arguments);
    return validatePalette(args);
  }
  throw new Error('OpenAI did not return function_call');
}

// Endpoint: generate palette
app.post('/generatePalette', async (req,res)=>{
  try{
    const { feelings }=req.body;
    let colors=await generateColorPalette(feelings);
    colors=normalizePaletteColors(colors);
    const permalink=crypto.createHash('md5').update(Date.now().toString()).digest('hex');
    await db.collection('palettes').doc(permalink).set({ keywords:feelings, colors, created_at: new Date().toISOString() });
    res.json({ permalink, colors });
  }catch(err){ console.error(err); res.status(500).send(err.message); }
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

// Endpoint: get palette data
app.get('/palette/:permalink/data', async (req,res)=>{
  try{
    const doc=await db.collection('palettes').doc(req.params.permalink).get();
    if(!doc.exists) return res.status(404).send('Not found');
    return res.json({
      colors: doc.data().colors,
      keywords: doc.data().keywords,
      permalink: req.params.permalink
    });
  }catch(err){ console.error(err); res.status(500).send(err.message); }
});

const openAiKey = defineSecret('OPENAI_KEY');
exports.app = onRequest({ secrets: [openAiKey] }, app); 