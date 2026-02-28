const functions = require('firebase-functions');
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

// Normalize only warning, danger, success, info + derive neutral
function normalizePaletteColors(colors) {
  const orig = { ...colors };
  // derive neutral from primary
  const p = hexToHSL(orig.primary.hex);
  orig.neutral = {
    hex: hslToHex(p.h,10,10),
    description: 'A blackish color that elegantly integrates the palette. Best for text, lines, backgrounds, etc'
  };
  ['warning','danger','success','info'].forEach(key => {
    if(orig[key]){
      const o = hexToHSL(orig[key].hex);
      orig[key] = {
        ...orig[key],
        ...{ hex: hslToHex(o.h,o.s,50), h:o.h, s:o.s, l:50 }
      };
    }
  });
  return orig;
}

// Function to call OpenAI
async function generateColorPalette(feelings) {
  const apiKey = process.env.OPENAI_KEY;
  if (!apiKey) throw new Error('OPENAI_KEY secret is not set.');
  const paletteFunction=[{
    name:'generate_palette',
    description:'Generate a 7-color UI palette (no neutral)',
    parameters:{ type:'object', properties:{
      primary:{ type:'object', properties:{hex:{type:'string'},description:{type:'string'}}, required:['hex']},
      secondary:{ type:'object', properties:{hex:{type:'string'},description:{type:'string'}}, required:['hex']},
      accent:{ type:'object', properties:{hex:{type:'string'},description:{type:'string'}}, required:['hex']},
      warning:{ type:'object', properties:{hex:{type:'string'},description:{type:'string'}}, required:['hex']},
      danger:{ type:'object', properties:{hex:{type:'string'},description:{type:'string'}}, required:['hex']},
      success:{ type:'object', properties:{hex:{type:'string'},description:{type:'string'}}, required:['hex']},
      info:{ type:'object', properties:{hex:{type:'string'},description:{type:'string'}}, required:['hex']}
    }, required:['primary','secondary','accent','warning','danger','success','info']}
  }];
  const res = await fetch('https://api.openai.com/v1/chat/completions',{
    method:'POST', headers:{'Content-Type':'application/json','Authorization':`Bearer ${apiKey}`},
    body:JSON.stringify({model:'gpt-4o', messages:[
      {role:'system', content:'You are a UI/UX designer. Return primary, secondary, accent, warning, danger, success, info as JSON.'},
      {role:'user', content:`Keywords: "${feelings}".`}
    ], functions:paletteFunction, function_call:{name:'generate_palette'}, temperature:0.7})
  });
  if(!res.ok){throw new Error(await res.text());}
  const data=await res.json();
  const msg=data.choices[0].message;
  if(msg.function_call){
    return JSON.parse(msg.function_call.arguments);
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

exports.app = functions.runWith({ secrets: ['OPENAI_KEY'] }).https.onRequest(app); 