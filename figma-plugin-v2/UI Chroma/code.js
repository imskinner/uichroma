figma.showUI(__html__, { width: 400, height: 560 });

const API_BASE = 'https://www.uichroma.com';
const TONAL_STOPS = [10, 20, 30, 40, 50, 60, 70, 80, 90, 95];
const NEUTRAL_STOPS = [5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 100];

function hexToHsl(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l: l };
  const d = max - min;
  const s = d / (1 - Math.abs(2 * l - 1));
  let h = 0;
  switch (max) {
    case r: h = ((g - b) / d) % 6; break;
    case g: h = (b - r) / d + 2;   break;
    case b: h = (r - g) / d + 4;   break;
  }
  h = h * 60;
  if (h < 0) h += 360;
  return { h: h, s: s, l: l };
}

function hslToRgb(h, s, l) {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if      (h < 60)  { r = c; g = x; b = 0; }
  else if (h < 120) { r = x; g = c; b = 0; }
  else if (h < 180) { r = 0; g = c; b = x; }
  else if (h < 240) { r = 0; g = x; b = c; }
  else if (h < 300) { r = x; g = 0; b = c; }
  else              { r = c; g = 0; b = x; }
  return {
    r: Math.max(0, Math.min(1, r + m)),
    g: Math.max(0, Math.min(1, g + m)),
    b: Math.max(0, Math.min(1, b + m)),
  };
}

function extractPermalink(input) {
  const parts = input.trim().split('/').filter(function(p) { return p.length > 0; });
  return parts[parts.length - 1] || input.trim();
}

function getHex(colorData) {
  if (!colorData) return null;
  if (typeof colorData === 'string') return colorData;
  return colorData.hex || null;
}

function normalizeHex(hex) {
  if (!hex) return null;
  const h = hex.trim();
  return h.startsWith('#') ? h : '#' + h;
}

function parseFontString(fontStr) {
  const str = fontStr || 'Inter-Regular';
  const idx = str.indexOf('-');
  return idx !== -1
    ? { family: str.slice(0, idx), style: str.slice(idx + 1) }
    : { family: str, style: 'Regular' };
}

function normalizePaletteColors(colors) {
  if (!colors) return {};
  if (!Array.isArray(colors)) return colors;
  var keys = ['primary', 'secondary', 'accent', 'info', 'warning', 'danger', 'success', 'neutral'];
  var obj = {};
  for (var i = 0; i < Math.min(colors.length, keys.length); i++) {
    if (colors[i]) obj[keys[i]] = colors[i];
  }
  return obj;
}
async function fetchPalette(permalink) {
  const res = await fetch(API_BASE + '/api/getPalette', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ permalink: permalink }),
  });
  if (!res.ok) throw new Error('Could not fetch palette (' + res.status + ')');
  const data = await res.json();
  if (!data.palette) throw new Error('Palette not found. Check the permalink.');
  return data.palette;
}

async function createPaintStyles(rawColors) {
  if (!rawColors) throw new Error('Invalid palette data — no colors found.');
  const colors = normalizePaletteColors(rawColors);
  const COLOR_KEYS = ['primary', 'secondary', 'accent', 'warning', 'danger', 'success', 'info'];
  const styleMap = {};
  for (let ki = 0; ki < COLOR_KEYS.length; ki++) {
    const key = COLOR_KEYS[ki];
    const hex = normalizeHex(getHex(colors[key]));
    if (!hex) continue;
    const label = key.charAt(0).toUpperCase() + key.slice(1);
    const hsl = hexToHsl(hex);
    styleMap[label] = {};
    for (let si = 0; si < TONAL_STOPS.length; si++) {
      const stop = TONAL_STOPS[si];
      const ps = figma.createPaintStyle();
      ps.name = 'Color/' + label + '/' + stop;
      ps.paints = [{ type: 'SOLID', color: hslToRgb(hsl.h, hsl.s, stop / 100) }];
      styleMap[label][String(stop)] = ps;
    }
  }
  const neutralHex = normalizeHex(getHex(colors.neutral) || getHex(colors.primary));
  if (neutralHex) {
    const neutralHsl = hexToHsl(neutralHex);
    styleMap['Neutral'] = {};
    for (let si = 0; si < NEUTRAL_STOPS.length; si++) {
      const stop = NEUTRAL_STOPS[si];
      const ps = figma.createPaintStyle();
      ps.name = 'Color/Neutral/' + stop;
      ps.paints = [{ type: 'SOLID', color: hslToRgb(neutralHsl.h, 0.05, stop / 100) }];
      styleMap['Neutral'][String(stop)] = ps;
    }
  }
  return styleMap;
}

async function createTextStyles(titleFont, bodyFont) {
  const defs = [
    { name: 'Type/Display',    font: titleFont, size: 56, lineHeight: 110 },
    { name: 'Type/Heading 1',  font: titleFont, size: 40, lineHeight: 115 },
    { name: 'Type/Heading 2',  font: titleFont, size: 30, lineHeight: 120 },
    { name: 'Type/Heading 3',  font: titleFont, size: 22, lineHeight: 130 },
    { name: 'Type/Body',       font: bodyFont,  size: 16, lineHeight: 150 },
    { name: 'Type/Body Small', font: bodyFont,  size: 13, lineHeight: 150 },
    { name: 'Type/Caption',    font: bodyFont,  size: 11, lineHeight: 140 },
    { name: 'Type/Label',      font: bodyFont,  size: 12, lineHeight: 140 },
  ];
  const tsMap = {};
  for (let i = 0; i < defs.length; i++) {
    const def = defs[i];
    const ts = figma.createTextStyle();
    ts.name = def.name;
    ts.fontName = def.font;
    ts.fontSize = def.size;
    ts.lineHeight = { unit: 'PERCENT', value: def.lineHeight };
    tsMap[def.name] = ts;
  }
  return tsMap;
}

async function applyFill(node, styleMap, colorName, stop) {
  const bucket = styleMap[colorName];
  const ps = bucket && bucket[String(stop)];
  if (!ps) return false;
  const c = ps.paints[0].color;
  node.fills = [{ type: 'SOLID', color: { r: c.r, g: c.g, b: c.b } }];
  try {
    await node.setFillStyleIdAsync(ps.id);
  } catch (e) {
    console.error('setFillStyleIdAsync failed for ' + colorName + '/' + stop + ':', e);
  }
  return true;
}

async function applyTextStyle(node, tsMap, tsKey) {
  if (!tsMap || !tsMap[tsKey]) return;
  try {
    await node.setTextStyleIdAsync(tsMap[tsKey].id);
  } catch (e) {
    console.error('setTextStyleIdAsync failed for ' + tsKey + ':', e);
  }
}

function sectionLabel(text, font) {
  const t = figma.createText();
  t.fontName = font;
  t.characters = text;
  t.fontSize = 11;
  t.fills = [{ type: 'SOLID', color: { r: 0.5, g: 0.5, b: 0.55 } }];
  return t;
}

function applyComponentSetLayout(set, gap) {
  set.layoutMode = 'HORIZONTAL';
  set.layoutWrap = 'WRAP';
  set.primaryAxisSizingMode = 'AUTO';
  set.counterAxisSizingMode = 'AUTO';
  set.itemSpacing = gap;
  set.counterAxisSpacing = gap;
  set.paddingLeft = set.paddingRight = gap;
  set.paddingTop = set.paddingBottom = gap;
}

function findButtonVariant(buttonSet, color, state) {
  if (!buttonSet) return null;
  const children = buttonSet.children;
  for (let i = 0; i < children.length; i++) {
    if (children[i].name === 'Color=' + color + ', State=' + state) return children[i];
  }
  return null;
}
async function createButtonSet(bodyFont, styleMap) {
  const colors = ['Primary', 'Secondary', 'Accent', 'Danger', 'Success'];
  const states = [
    { state: 'Default',  stop: '50' },
    { state: 'Hover',    stop: '40' },
    { state: 'Active',   stop: '30' },
    { state: 'Disabled', stop: '80' },
  ];
  const components = [];
  for (let ci = 0; ci < colors.length; ci++) {
    const color = colors[ci];
    for (let si = 0; si < states.length; si++) {
      const state = states[si].state;
      const stop  = states[si].stop;
      const comp = figma.createComponent();
      comp.name = 'Color=' + color + ', State=' + state;
      comp.layoutMode = 'HORIZONTAL';
      comp.primaryAxisAlignItems = 'CENTER';
      comp.counterAxisAlignItems = 'CENTER';
      comp.primaryAxisSizingMode = 'AUTO';
      comp.counterAxisSizingMode = 'AUTO';
      comp.paddingLeft = comp.paddingRight = 24;
      comp.paddingTop = comp.paddingBottom = 12;
      comp.cornerRadius = 8;
      comp.itemSpacing = 8;
      figma.currentPage.appendChild(comp);
      const filled = await applyFill(comp, styleMap, color, stop);
      if (!filled) comp.fills = [{ type: 'SOLID', color: { r: 0.09, g: 0.45, b: 0.85 } }];
      const label = figma.createText();
      label.fontName = bodyFont;
      label.characters = state === 'Disabled' ? 'Disabled' : 'Button';
      label.fontSize = 14;
      label.fills = parseInt(stop) < 65
        ? [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }]
        : [{ type: 'SOLID', color: { r: 0.12, g: 0.12, b: 0.18 } }];
      comp.appendChild(label);
      components.push(comp);
    }
  }
  const set = figma.combineAsVariants(components, figma.currentPage);
  set.name = 'Button';
  applyComponentSetLayout(set, 20);
  return set;
}

async function createInputSet(bodyFont, styleMap) {
  const states = ['Default', 'Focused', 'Error', 'Disabled'];
  const components = [];
  for (let si = 0; si < states.length; si++) {
    const state = states[si];
    const comp = figma.createComponent();
    comp.name = 'State=' + state;
    comp.layoutMode = 'HORIZONTAL';
    comp.counterAxisAlignItems = 'CENTER';
    comp.primaryAxisSizingMode = 'FIXED';
    comp.counterAxisSizingMode = 'AUTO';
    comp.resize(280, 10);
    comp.paddingLeft = comp.paddingRight = 16;
    comp.paddingTop = comp.paddingBottom = 12;
    comp.cornerRadius = 8;
    comp.itemSpacing = 8;
    comp.fills = [{ type: 'SOLID', color: state === 'Disabled' ? { r: 0.96, g: 0.96, b: 0.97 } : { r: 1, g: 1, b: 1 } }];
    let borderColor = { r: 0.8, g: 0.8, b: 0.83 };
    if (state === 'Focused') {
      const ps = styleMap['Primary'] && styleMap['Primary']['50'];
      borderColor = ps ? ps.paints[0].color : { r: 0.09, g: 0.45, b: 0.85 };
    } else if (state === 'Error') {
      const ps = styleMap['Danger'] && styleMap['Danger']['50'];
      borderColor = ps ? ps.paints[0].color : { r: 0.85, g: 0.2, b: 0.2 };
    }
    comp.strokes = [{ type: 'SOLID', color: borderColor }];
    comp.strokeWeight = state === 'Focused' ? 2 : 1;
    comp.strokeAlign = 'INSIDE';
    figma.currentPage.appendChild(comp);
    const placeholder = figma.createText();
    placeholder.fontName = bodyFont;
    placeholder.characters = state === 'Disabled' ? 'Disabled input' : 'Placeholder text';
    placeholder.fontSize = 14;
    placeholder.fills = [{ type: 'SOLID', color: { r: 0.6, g: 0.6, b: 0.65 } }];
    comp.appendChild(placeholder);
    components.push(comp);
  }
  const set = figma.combineAsVariants(components, figma.currentPage);
  set.name = 'Input';
  applyComponentSetLayout(set, 20);
  return set;
}

async function createBadgeSet(bodyFont, styleMap) {
  const types = ['Primary', 'Success', 'Warning', 'Danger', 'Info'];
  const components = [];
  for (let ti = 0; ti < types.length; ti++) {
    const type = types[ti];
    const comp = figma.createComponent();
    comp.name = 'Type=' + type;
    comp.layoutMode = 'HORIZONTAL';
    comp.primaryAxisAlignItems = 'CENTER';
    comp.counterAxisAlignItems = 'CENTER';
    comp.primaryAxisSizingMode = 'AUTO';
    comp.counterAxisSizingMode = 'AUTO';
    comp.paddingLeft = comp.paddingRight = 10;
    comp.paddingTop = comp.paddingBottom = 4;
    comp.cornerRadius = 100;
    comp.itemSpacing = 4;
    figma.currentPage.appendChild(comp);
    const bgFilled = await applyFill(comp, styleMap, type, '90');
    if (!bgFilled) comp.fills = [{ type: 'SOLID', color: { r: 0.9, g: 0.95, b: 1 } }];
    const label = figma.createText();
    label.fontName = bodyFont;
    label.characters = type;
    label.fontSize = 12;
    comp.appendChild(label);
    const textFilled = await applyFill(label, styleMap, type, '30');
    if (!textFilled) label.fills = [{ type: 'SOLID', color: { r: 0.1, g: 0.3, b: 0.7 } }];
    components.push(comp);
  }
  const set = figma.combineAsVariants(components, figma.currentPage);
  set.name = 'Badge';
  applyComponentSetLayout(set, 20);
  return set;
}
async function createCardComponent(bodyFont, titleFont, styleMap, parent) {
  const comp = figma.createComponent();
  comp.name = 'Card';
  comp.layoutMode = 'VERTICAL';
  comp.primaryAxisSizingMode = 'AUTO';
  comp.counterAxisSizingMode = 'FIXED';
  comp.resize(300, 100);
  comp.paddingLeft = comp.paddingRight = 24;
  comp.paddingTop = comp.paddingBottom = 24;
  comp.itemSpacing = 12;
  comp.cornerRadius = 12;
  comp.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
  comp.effects = [{
    type: 'DROP_SHADOW',
    color: { r: 0, g: 0, b: 0, a: 0.08 },
    offset: { x: 0, y: 4 },
    radius: 16,
    spread: 0,
    visible: true,
    blendMode: 'NORMAL',
  }];
  parent.appendChild(comp);
  const imgRect = figma.createRectangle();
  imgRect.resize(252, 140);
  imgRect.layoutAlign = 'STRETCH';
  imgRect.cornerRadius = 8;
  comp.appendChild(imgRect);
  const imgFilled = await applyFill(imgRect, styleMap, 'Primary', '90');
  if (!imgFilled) imgRect.fills = [{ type: 'SOLID', color: { r: 0.9, g: 0.94, b: 1 } }];
  const tag = figma.createFrame();
  tag.layoutMode = 'HORIZONTAL';
  tag.primaryAxisSizingMode = 'AUTO';
  tag.counterAxisSizingMode = 'AUTO';
  tag.paddingLeft = tag.paddingRight = 10;
  tag.paddingTop = tag.paddingBottom = 4;
  tag.cornerRadius = 100;
  comp.appendChild(tag);
  const tagFilled = await applyFill(tag, styleMap, 'Accent', '90');
  if (!tagFilled) tag.fills = [{ type: 'SOLID', color: { r: 0.9, g: 1, b: 0.93 } }];
  const tagText = figma.createText();
  tagText.fontName = bodyFont;
  tagText.characters = 'New';
  tagText.fontSize = 11;
  tag.appendChild(tagText);
  const tagTextFilled = await applyFill(tagText, styleMap, 'Accent', '30');
  if (!tagTextFilled) tagText.fills = [{ type: 'SOLID', color: { r: 0.08, g: 0.45, b: 0.28 } }];
  const cardTitle = figma.createText();
  cardTitle.fontName = titleFont;
  cardTitle.characters = 'Card Title';
  cardTitle.fontSize = 18;
  cardTitle.layoutAlign = 'STRETCH';
  cardTitle.fills = [{ type: 'SOLID', color: { r: 0.08, g: 0.08, b: 0.12 } }];
  comp.appendChild(cardTitle);
  const cardBody = figma.createText();
  cardBody.fontName = bodyFont;
  cardBody.characters = 'A brief description of this card. Keep it short and informative.';
  cardBody.fontSize = 13;
  cardBody.layoutAlign = 'STRETCH';
  cardBody.fills = [{ type: 'SOLID', color: { r: 0.4, g: 0.4, b: 0.46 } }];
  comp.appendChild(cardBody);
  return comp;
}

async function createColorPaletteSection(styleMap, bodyFont, parent) {
  const wrap = figma.createFrame();
  wrap.name = 'Colour Palette';
  wrap.layoutMode = 'VERTICAL';
  wrap.primaryAxisSizingMode = 'AUTO';
  wrap.counterAxisSizingMode = 'AUTO';
  wrap.itemSpacing = 10;
  wrap.fills = [];
  parent.appendChild(wrap);
  const colorNames = Object.keys(styleMap).sort();
  for (let ci = 0; ci < colorNames.length; ci++) {
    const colorName = colorNames[ci];
    const row = figma.createFrame();
    row.name = colorName;
    row.layoutMode = 'HORIZONTAL';
    row.primaryAxisSizingMode = 'AUTO';
    row.counterAxisSizingMode = 'AUTO';
    row.counterAxisAlignItems = 'CENTER';
    row.itemSpacing = 6;
    row.fills = [];
    wrap.appendChild(row);
    const nameLabel = figma.createText();
    nameLabel.fontName = bodyFont;
    nameLabel.characters = colorName;
    nameLabel.fontSize = 11;
    nameLabel.resize(76, nameLabel.height);
    nameLabel.fills = [{ type: 'SOLID', color: { r: 0.45, g: 0.45, b: 0.5 } }];
    row.appendChild(nameLabel);
    const stops = Object.keys(styleMap[colorName]).sort(function(a, b) { return parseInt(a) - parseInt(b); });
    for (let si = 0; si < stops.length; si++) {
      const stop = stops[si];
      const swatch = figma.createRectangle();
      swatch.name = stop;
      swatch.resize(36, 36);
      swatch.cornerRadius = 6;
      row.appendChild(swatch);
      await applyFill(swatch, styleMap, colorName, stop);
    }
  }
}

async function createTypographySection(titleFont, bodyFont, tsMap, parent) {
  const wrap = figma.createFrame();
  wrap.name = 'Typography Samples';
  wrap.layoutMode = 'VERTICAL';
  wrap.primaryAxisSizingMode = 'AUTO';
  wrap.counterAxisSizingMode = 'AUTO';
  wrap.itemSpacing = 14;
  wrap.fills = [];
  parent.appendChild(wrap);
  const samples = [
    { text: 'Heading 1 — Display',                                  tsKey: 'Type/Heading 1',  font: titleFont, size: 40 },
    { text: 'Heading 2 — Section',                                  tsKey: 'Type/Heading 2',  font: titleFont, size: 30 },
    { text: 'Heading 3 — Subsection',                               tsKey: 'Type/Heading 3',  font: titleFont, size: 22 },
    { text: 'Body — The quick brown fox jumps over the lazy dog.',  tsKey: 'Type/Body',       font: bodyFont,  size: 16 },
    { text: 'Small — Supporting text and descriptions go here.',    tsKey: 'Type/Body Small', font: bodyFont,  size: 13 },
    { text: 'Caption — Labels, hints, and metadata',                tsKey: 'Type/Caption',    font: bodyFont,  size: 11 },
  ];
  for (let i = 0; i < samples.length; i++) {
    const sample = samples[i];
    const t = figma.createText();
    t.fontName = sample.font;
    t.fontSize = sample.size;
    t.characters = sample.text;
    wrap.appendChild(t);
    await applyTextStyle(t, tsMap, sample.tsKey);
    t.fills = [{ type: 'SOLID', color: { r: 0.08, g: 0.08, b: 0.12 } }];
  }
}
async function createUIKitFrame(styleMap, tsMap, titleFont, bodyFont, pageName) {
  const outer = figma.createFrame();
  outer.name = pageName + ' — UI Kit';
  outer.layoutMode = 'VERTICAL';
  outer.primaryAxisSizingMode = 'AUTO';
  outer.counterAxisSizingMode = 'AUTO';
  outer.itemSpacing = 48;
  outer.paddingLeft = outer.paddingRight = 48;
  outer.paddingTop = outer.paddingBottom = 48;
  outer.fills = [{ type: 'SOLID', color: { r: 0.96, g: 0.96, b: 0.97 } }];
  figma.currentPage.appendChild(outer);
  function makeSection(name) {
    const f = figma.createFrame();
    f.name = name;
    f.layoutMode = 'VERTICAL';
    f.primaryAxisSizingMode = 'AUTO';
    f.counterAxisSizingMode = 'AUTO';
    f.itemSpacing = 20;
    f.paddingLeft = f.paddingRight = 28;
    f.paddingTop = f.paddingBottom = 28;
    f.cornerRadius = 12;
    f.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
    outer.appendChild(f);
    return f;
  }
  const palSection = makeSection('Colours');
  palSection.appendChild(sectionLabel('COLOUR PALETTE', bodyFont));
  await createColorPaletteSection(styleMap, bodyFont, palSection);
  const typoSection = makeSection('Typography');
  typoSection.appendChild(sectionLabel('TYPOGRAPHY', bodyFont));
  await createTypographySection(titleFont, bodyFont, tsMap, typoSection);
  const compSection = makeSection('Components');
  compSection.itemSpacing = 28;
  compSection.appendChild(sectionLabel('BUTTONS', bodyFont));
  const buttonSet = await createButtonSet(bodyFont, styleMap);
  compSection.appendChild(buttonSet);
  compSection.appendChild(sectionLabel('BADGES', bodyFont));
  const badgeSet = await createBadgeSet(bodyFont, styleMap);
  compSection.appendChild(badgeSet);
  compSection.appendChild(sectionLabel('INPUTS', bodyFont));
  const inputSet = await createInputSet(bodyFont, styleMap);
  compSection.appendChild(inputSet);
  compSection.appendChild(sectionLabel('CARD', bodyFont));
  const cardComp = await createCardComponent(bodyFont, titleFont, styleMap, compSection);
  outer.x = 0;
  outer.y = 0;
  return { frame: outer, buttonSet: buttonSet, cardComp: cardComp };
}
async function createLandingPage(styleMap, tsMap, titleFont, bodyFont, pageName, components) {
  const W = 1440;
  const page = figma.createFrame();
  page.name = pageName + ' — Landing Page';
  page.layoutMode = 'VERTICAL';
  page.primaryAxisSizingMode = 'AUTO';
  page.counterAxisSizingMode = 'AUTO';
  page.itemSpacing = 0;
  page.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
  figma.currentPage.appendChild(page);
  function makeSection(name, layoutMode, height) {
    const s = figma.createFrame();
    s.name = name;
    s.layoutMode = layoutMode;
    s.primaryAxisSizingMode = height ? 'FIXED' : 'AUTO';
    s.counterAxisSizingMode = 'FIXED';
    s.resize(W, height || 100);
    page.appendChild(s);
    return s;
  }
  {
    const nav = makeSection('Navbar', 'HORIZONTAL', 72);
    nav.primaryAxisAlignItems = 'SPACE_BETWEEN';
    nav.counterAxisAlignItems = 'CENTER';
    nav.paddingLeft = nav.paddingRight = 80;
    nav.paddingTop = nav.paddingBottom = 16;
    nav.itemSpacing = 0;
    const navFilled = await applyFill(nav, styleMap, 'Primary', '50');
    if (!navFilled) nav.fills = [{ type: 'SOLID', color: { r: 0.09, g: 0.35, b: 0.75 } }];
    const logo = figma.createText();
    logo.fontName = titleFont;
    logo.characters = pageName || 'Brand';
    logo.fontSize = 22;
    logo.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
    nav.appendChild(logo);
    await applyTextStyle(logo, tsMap, 'Type/Heading 3');
    const linksRow = figma.createFrame();
    linksRow.layoutMode = 'HORIZONTAL';
    linksRow.primaryAxisSizingMode = 'AUTO';
    linksRow.counterAxisSizingMode = 'AUTO';
    linksRow.fills = [];
    linksRow.itemSpacing = 32;
    nav.appendChild(linksRow);
    const links = ['Features', 'Pricing', 'About', 'Contact'];
    for (let i = 0; i < links.length; i++) {
      const t = figma.createText();
      t.fontName = bodyFont;
      t.characters = links[i];
      t.fontSize = 14;
      t.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
      linksRow.appendChild(t);
      await applyTextStyle(t, tsMap, 'Type/Body Small');
    }
  }  {
    const hero = makeSection('Hero', 'VERTICAL', 600);
    hero.primaryAxisAlignItems = 'CENTER';
    hero.counterAxisAlignItems = 'CENTER';
    hero.paddingLeft = hero.paddingRight = 80;
    hero.paddingTop = hero.paddingBottom = 96;
    hero.itemSpacing = 24;
    const heroBgFilled = await applyFill(hero, styleMap, 'Primary', '95');
    if (!heroBgFilled) hero.fills = [{ type: 'SOLID', color: { r: 0.93, g: 0.96, b: 1 } }];
    const pill = figma.createFrame();
    pill.layoutMode = 'HORIZONTAL';
    pill.primaryAxisSizingMode = 'AUTO';
    pill.counterAxisSizingMode = 'AUTO';
    pill.paddingLeft = pill.paddingRight = 14;
    pill.paddingTop = pill.paddingBottom = 6;
    pill.cornerRadius = 100;
    hero.appendChild(pill);
    const pillFilled = await applyFill(pill, styleMap, 'Accent', '80');
    if (!pillFilled) pill.fills = [{ type: 'SOLID', color: { r: 0.85, g: 1, b: 0.9 } }];
    const pillText = figma.createText();
    pillText.fontName = bodyFont;
    pillText.characters = 'Introducing something amazing';
    pillText.fontSize = 13;
    pill.appendChild(pillText);
    await applyTextStyle(pillText, tsMap, 'Type/Body Small');
    const pillTextFilled = await applyFill(pillText, styleMap, 'Accent', '20');
    if (!pillTextFilled) pillText.fills = [{ type: 'SOLID', color: { r: 0.08, g: 0.38, b: 0.22 } }];
    const h1 = figma.createText();
    h1.fontName = titleFont;
    h1.characters = 'Build beautiful products\nfaster than ever';
    h1.fontSize = 56;
    h1.textAlignHorizontal = 'CENTER';
    h1.fills = [{ type: 'SOLID', color: { r: 0.07, g: 0.07, b: 0.1 } }];
    hero.appendChild(h1);
    await applyTextStyle(h1, tsMap, 'Type/Display');
    const sub = figma.createText();
    sub.fontName = bodyFont;
    sub.characters = 'A powerful UI system built from your colour palette.\nStart designing with cohesive, accessible colours from day one.';
    sub.fontSize = 18;
    sub.textAlignHorizontal = 'CENTER';
    sub.fills = [{ type: 'SOLID', color: { r: 0.35, g: 0.35, b: 0.42 } }];
    hero.appendChild(sub);
    await applyTextStyle(sub, tsMap, 'Type/Body');
    const ctaRow = figma.createFrame();
    ctaRow.layoutMode = 'HORIZONTAL';
    ctaRow.primaryAxisSizingMode = 'AUTO';
    ctaRow.counterAxisSizingMode = 'AUTO';
    ctaRow.primaryAxisAlignItems = 'CENTER';
    ctaRow.counterAxisAlignItems = 'CENTER';
    ctaRow.fills = [];
    ctaRow.itemSpacing = 16;
    hero.appendChild(ctaRow);
    const primaryComp = findButtonVariant(components && components.buttonSet, 'Primary', 'Default');
    if (primaryComp) {
      const inst = primaryComp.createInstance();
      ctaRow.appendChild(inst);
      const tNodes = inst.findAll(function(n) { return n.type === 'TEXT'; });
      if (tNodes.length > 0) tNodes[0].characters = 'Get Started Free';
    } else {
      const btn1 = figma.createFrame();
      btn1.layoutMode = 'HORIZONTAL';
      btn1.primaryAxisAlignItems = 'CENTER';
      btn1.counterAxisAlignItems = 'CENTER';
      btn1.primaryAxisSizingMode = 'AUTO';
      btn1.counterAxisSizingMode = 'AUTO';
      btn1.paddingLeft = btn1.paddingRight = 28;
      btn1.paddingTop = btn1.paddingBottom = 14;
      btn1.cornerRadius = 8;
      ctaRow.appendChild(btn1);
      const btn1Filled = await applyFill(btn1, styleMap, 'Primary', '50');
      if (!btn1Filled) btn1.fills = [{ type: 'SOLID', color: { r: 0.09, g: 0.35, b: 0.75 } }];
      const btn1T = figma.createText();
      btn1T.fontName = titleFont;
      btn1T.characters = 'Get Started Free';
      btn1T.fontSize = 15;
      btn1T.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
      btn1.appendChild(btn1T);
    }
    const secondaryComp = findButtonVariant(components && components.buttonSet, 'Secondary', 'Default');
    if (secondaryComp) {
      const inst2 = secondaryComp.createInstance();
      ctaRow.appendChild(inst2);
      const tNodes2 = inst2.findAll(function(n) { return n.type === 'TEXT'; });
      if (tNodes2.length > 0) tNodes2[0].characters = 'View Demo';
    } else {
      const btn2 = figma.createFrame();
      btn2.layoutMode = 'HORIZONTAL';
      btn2.primaryAxisAlignItems = 'CENTER';
      btn2.counterAxisAlignItems = 'CENTER';
      btn2.primaryAxisSizingMode = 'AUTO';
      btn2.counterAxisSizingMode = 'AUTO';
      btn2.paddingLeft = btn2.paddingRight = 28;
      btn2.paddingTop = btn2.paddingBottom = 14;
      btn2.cornerRadius = 8;
      btn2.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
      btn2.strokes = [{ type: 'SOLID', color: { r: 0.8, g: 0.8, b: 0.85 } }];
      btn2.strokeWeight = 1.5;
      ctaRow.appendChild(btn2);
      const btn2T = figma.createText();
      btn2T.fontName = bodyFont;
      btn2T.characters = 'View Demo';
      btn2T.fontSize = 15;
      btn2T.fills = [{ type: 'SOLID', color: { r: 0.1, g: 0.1, b: 0.18 } }];
      btn2.appendChild(btn2T);
    }
  }