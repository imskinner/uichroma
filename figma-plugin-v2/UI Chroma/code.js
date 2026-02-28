figma.showUI(__html__, { width: 400, height: 560 });

const API_BASE = 'https://www.uichroma.com';

// Tonal stops used for Paint Style scale
const TONAL_STOPS = [10, 20, 30, 40, 50, 60, 70, 80, 90, 95];
const NEUTRAL_STOPS = [5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 100];

// hex string → { h: 0-360, s: 0-1, l: 0-1 }
function hexToHsl(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = d / (1 - Math.abs(2 * l - 1));
  let h = 0;
  switch (max) {
    case r: h = ((g - b) / d) % 6; break;
    case g: h = (b - r) / d + 2; break;
    case b: h = (r - g) / d + 4; break;
  }
  h = h * 60;
  if (h < 0) h += 360;
  return { h, s, l };
}

// { h: 0-360, s: 0-1, l: 0-1 } → { r, g, b } each 0-1
function hslToRgb(h, s, l) {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;
  let r, g, b;
  if (h < 60)       [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else              [r, g, b] = [c, 0, x];
  return { r: r + m, g: g + m, b: b + m };
}

async function fetchPalette(permalink) {
  const response = await fetch(`${API_BASE}/api/getPalette`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ permalink }),
  });
  if (!response.ok) throw new Error(`Could not fetch palette (${response.status})`);
  const data = await response.json();
  if (!data.palette) throw new Error('Palette not found. Check the permalink.');
  return data.palette;
}

async function createPaintStyles(colors) {
  const COLOR_KEYS = ['primary', 'secondary', 'accent', 'warning', 'danger', 'success', 'info'];

  for (const key of COLOR_KEYS) {
    const colorData = colors[key];
    if (!colorData || !colorData.hex) continue;
    const label = key.charAt(0).toUpperCase() + key.slice(1);
    const { h, s } = hexToHsl(colorData.hex);

    for (const stop of TONAL_STOPS) {
      const paintStyle = figma.createPaintStyle();
      paintStyle.name = `Color/${label}/${stop}`;
      paintStyle.paints = [{ type: 'SOLID', color: hslToRgb(h, s, stop / 100) }];
    }
  }

  // Neutral: low saturation, derived from primary hue
  const primaryHex = (colors.neutral || colors.primary).hex;
  const { h: neutralH } = hexToHsl(primaryHex);
  for (const stop of NEUTRAL_STOPS) {
    const paintStyle = figma.createPaintStyle();
    paintStyle.name = `Color/Neutral/${stop}`;
    paintStyle.paints = [{ type: 'SOLID', color: hslToRgb(neutralH, 0.05, stop / 100) }];
  }
}

async function createButtonComponentSet(bodyFont) {
  const fontStr = bodyFont || 'Inter-Regular';
  const hyphenIdx = fontStr.indexOf('-');
  const family = hyphenIdx !== -1 ? fontStr.slice(0, hyphenIdx) : fontStr;
  const style  = hyphenIdx !== -1 ? fontStr.slice(hyphenIdx + 1) : 'Regular';
  const fontName = { family, style };
  await figma.loadFontAsync(fontName);

  // Build a lookup: styleMap['Primary']['50'] = PaintStyle
  const localPaintStyles = await figma.getLocalPaintStylesAsync();
  const styleMap = {};
  for (const ps of localPaintStyles) {
    const parts = ps.name.split('/'); // ["Color", "Primary", "50"]
    if (parts.length === 3) {
      const [, cat, stop] = parts;
      if (!styleMap[cat]) styleMap[cat] = {};
      styleMap[cat][stop] = ps;
    }
  }

  const colorVariants = ['Primary', 'Secondary', 'Danger'];
  const stateStops = { Default: '50', Hover: '40', Active: '30', Disabled: '70' };

  const components = [];
  for (const color of colorVariants) {
    for (const [state, stop] of Object.entries(stateStops)) {
      const comp = figma.createComponent();
      comp.name = `Color=${color}, State=${state}`;
      comp.layoutMode = 'HORIZONTAL';
      comp.primaryAxisSizingMode = 'AUTO';
      comp.counterAxisSizingMode = 'AUTO';
      comp.paddingLeft = comp.paddingRight = 20;
      comp.paddingTop = comp.paddingBottom = 12;
      comp.cornerRadius = 8;
      comp.itemSpacing = 0;

      const paintStyle = styleMap[color] && styleMap[color][stop];
      if (paintStyle) {
        await comp.setFillStyleIdAsync(paintStyle.id);
      } else {
        comp.fills = [{ type: 'SOLID', color: { r: 0.09, g: 0.63, b: 0.98 } }];
      }

      const textNode = figma.createText();
      textNode.fontName = fontName;
      textNode.characters = 'Button';
      textNode.fontSize = 14;
      textNode.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
      comp.appendChild(textNode);

      // Components must be on the page before combineAsVariants
      figma.currentPage.appendChild(comp);
      components.push(comp);
    }
  }

  const componentSet = figma.combineAsVariants(components, figma.currentPage);
  componentSet.name = 'Button';
  componentSet.x = 0;
  componentSet.y = 0;
  return componentSet;
}

figma.ui.onmessage = async (msg) => {
  if (msg.type === 'get-fonts') {
    const fonts = await figma.listAvailableFontsAsync();
    figma.ui.postMessage({ type: 'fonts', fonts });
    return;
  }

  if (msg.type === 'create-styles-components') {
    try {
      const { permalink, projectName, titleFont, bodyFont } = msg;

      const palette = await fetchPalette(permalink);
      const colors = palette.colors;

      const newPage = figma.createPage();
      newPage.name = projectName || palette.keywords || 'UI Chroma Palette';
      await figma.setCurrentPageAsync(newPage);

      await createPaintStyles(colors);
      await createButtonComponentSet(bodyFont);

      figma.ui.postMessage({ type: 'done' });
    } catch (error) {
      console.error(error);
      figma.ui.postMessage({ type: 'error', message: error.message });
    }
    return;
  }
};
