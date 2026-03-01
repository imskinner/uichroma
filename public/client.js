// Stores normalized palette colors for export functions
var currentPaletteColors = null;

var PALETTE_KEYS = ["primary","secondary","accent","warning","danger","success","info","neutral"];

function createCheckboxField(feeling) {
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.id = `feeling-${feeling}`;
  checkbox.value = feeling;
  
  const label = document.createElement("label");
  label.htmlFor = `feeling-${feeling}`;
  label.textContent = feeling;
  
  const checkboxField = document.createElement("div");
  checkboxField.className = "checkboxField";
  
  checkboxField.appendChild(checkbox);
  checkboxField.appendChild(label);
  
  return checkboxField;
}

function positionPickr(pickr, top, left) {
  const pickrRoot = pickr.getRoot();
  pickrRoot.app.style.position = 'absolute';
  pickrRoot.app.style.top = `${top}px`;
  pickrRoot.app.style.left = `${left}px`;
}


function openColorPicker(colorBoxElement, top, left) {
  const existingPickr = document.querySelector('.pcr-app');
  if (existingPickr) existingPickr.remove();
  
  const pickrContainer = document.createElement('div');
  pickrContainer.style.position = 'absolute';
  pickrContainer.style.zIndex = '100';
  
  const rect = colorBoxElement.getBoundingClientRect();
  
  const pickrDiv = document.createElement('div');
  pickrDiv.className = 'pickr';
  pickrDiv.style.top = `${rect.top + window.scrollY}px`;
  pickrDiv.style.left = `${rect.left + window.scrollX}px`;
  pickrDiv.appendChild(pickrContainer);

  const pickr = Pickr.create({
    el: pickrContainer,
    appClass: 'color-picker',
    defaultRepresentation: 'HSLA',
    theme: 'classic',
    default: colorBoxElement.style.backgroundColor,
    comparison: false,
    swatches: null,
    components: {
      preview: true,
      opacity: false,
      hue: true,
      interaction: {
        hex: true,
        rgba: true,
        hsla: true,
        hsva: false,
        cmyk: false,
        input: true,
        clear: false,
        save: true,
      },
    },
  });
  
  pickr.on('init', () => {
    positionPickr(pickr, top, left);
  });
  
  pickr.on('save', (color, instance) => {
    const hexColor = color.toHEXA().toString();
    updateColor(hexColor, colorBoxElement);
    instance.hide();
    instance.destroyAndRemove();
  });
  
  pickr.on('hide', (color, instance) => {
    const hexColor = color.toHEXA().toString();
    updateColor(hexColor, colorBoxElement);
    instance.hide();
    instance.destroyAndRemove();
  });
  
  document.body.addEventListener('click', function closePickr(event) {
    if (event.target.closest('.pickr') === null) {
      pickr.hide();
      document.body.removeEventListener('click', closePickr);
    }
  });
}

function updateColor(hexColor, colorBoxElement) {
  colorBoxElement.style.backgroundColor = hexColor;
  colorBoxElement.querySelector('span').innerText = hexColor;
}


function createColorBox(color, index) {
  const colorLabels = [
    "Primary",
    "Secondary",
    "Accent",
    "Warning",
    "Danger",
    "Success",
    "Info",
    "Neutral"
  ]
  const colorBox = document.createElement('div');
  colorBox.className = 'color-box';
  colorBox.style.backgroundColor = color;
  colorBox.innerHTML = `<span class="hex">${color}</span><span class="color-label">${colorLabels[index]}</span>`;
  colorBox.querySelector('.hex').addEventListener('click', (event) => {
    event.stopPropagation();
    const span = event.target;
    const hex = span.innerText;
    navigator.clipboard.writeText(hex)
      .then(() => {
        span.innerText = 'Copied!';
        setTimeout(() => { span.innerText = hex; }, 3000);
      })
      .catch(err => console.error('Error copying hex to clipboard:', err));
  });
  colorBox.onclick = (event) => {
    event.stopPropagation();
    const rect = colorBox.getBoundingClientRect();
    const top = rect.top + window.scrollY + 48;
    const left = rect.left + window.scrollX;
    openColorPicker(colorBox, top, left);
  };
  return colorBox;
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
  const cmin = Math.min(r,g,b), cmax = Math.max(r,g,b);
  const delta = cmax - cmin;
  let h = 0, s = 0;
  const l = (cmax + cmin) / 2;
  if (delta !== 0) {
    s = delta / (1 - Math.abs(2*l - 1));
    switch (cmax) {
      case r: h = ((g - b) / delta) % 6; break;
      case g: h = (b - r) / delta + 2; break;
      case b: h = (r - g) / delta + 4; break;
    }
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }
  s = +(s * 100).toFixed(1);
  return { h, s, l: +(l * 100).toFixed(1) };
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

// Utility: generate tonal variations for a given HSL
function generateTonesForColor(h, s, count = 10, minL = 10, maxL = 95) {
  const tones = [];
  for (let i = 0; i < count; i++) {
    const lightness = Math.round(minL + (maxL - minL) * (i / (count - 1)));
    const hex = hslToHex(h, s, lightness);
    tones.push({ h, s, l: lightness, hex });
  }
  return tones;
}

// Normalize palette colors to HSL rules
function normalizePaletteColors(colors) {
  if (Array.isArray(colors)) return colors;
  const normalized = {};
  const primaryHSL = hexToHSL(colors.primary.hex);
  PALETTE_KEYS.forEach(key => {
    const orig = colors[key];
    if (!orig) return;
    let h, s, l, hex;
    if (key === 'neutral') {
      // derive neutral from primary hue
      h = primaryHSL.h;
      s = 10;
      l = 10;
      hex = hslToHex(h, s, l);
    } else if (["warning","danger","success","info"].includes(key)) {
      // normalize these colors to L=50
      const hslObj = hexToHSL(orig.hex);
      h = hslObj.h;
      s = hslObj.s;
      l = 50;
      hex = hslToHex(h, s, l);
    } else {
      // keep original for primary, secondary, accent
      hex = orig.hex;
      const hslObj = hexToHSL(orig.hex);
      h = hslObj.h;
      s = hslObj.s;
      l = hslObj.l;
    }
    const tones = generateTonesForColor(h, s);
    normalized[key] = { ...orig, hex, h, s, l, tones };
  });
  return normalized;
}

// --- Export generators ---

function generateCSSVariables(colors) {
  var lines = [':root {'];
  PALETTE_KEYS.forEach(function(key) {
    var color = colors[key];
    if (!color) return;
    lines.push('  --color-' + key + ': ' + color.hex + ';');
    if (color.tones && color.tones.length) {
      color.tones.forEach(function(tone) {
        lines.push('  --color-' + key + '-' + tone.l + ': ' + tone.hex + ';');
      });
    }
  });
  lines.push('}');
  return lines.join('\n');
}

function generateSCSSVariables(colors) {
  var lines = ['// UI Chroma Palette — SCSS Variables'];
  PALETTE_KEYS.forEach(function(key) {
    var color = colors[key];
    if (!color) return;
    lines.push('$color-' + key + ': ' + color.hex + ';');
    if (color.tones && color.tones.length) {
      color.tones.forEach(function(tone) {
        lines.push('$color-' + key + '-' + tone.l + ': ' + tone.hex + ';');
      });
    }
  });
  return lines.join('\n');
}

function generateTailwindConfig(colors) {
  var lines = [
    '// UI Chroma Palette — Tailwind CSS Config',
    '// Add to your tailwind.config.js under theme.extend.colors',
    '',
    'module.exports = {',
    '  theme: {',
    '    extend: {',
    '      colors: {'
  ];
  PALETTE_KEYS.forEach(function(key, idx) {
    var color = colors[key];
    if (!color) return;
    var comma = (idx < PALETTE_KEYS.length - 1) ? ',' : '';
    lines.push("        '" + key + "': {");
    lines.push("          DEFAULT: '" + color.hex + "',");
    if (color.tones && color.tones.length) {
      color.tones.forEach(function(tone, tIdx) {
        var toneComma = (tIdx < color.tones.length - 1) ? ',' : '';
        lines.push("          '" + tone.l + "': '" + tone.hex + "'" + toneComma);
      });
    }
    lines.push('        }' + comma);
  });
  lines.push('      }', '    }', '  }', '};');
  return lines.join('\n');
}

function generateJSONExport(colors) {
  var exportObj = {};
  PALETTE_KEYS.forEach(function(key) {
    var color = colors[key];
    if (!color) return;
    exportObj[key] = {
      hex: color.hex,
      h: color.h,
      s: color.s,
      l: color.l,
      tones: (color.tones || []).map(function(t) {
        return { hex: t.hex, h: t.h, s: t.s, l: t.l };
      })
    };
  });
  return JSON.stringify(exportObj, null, 2);
}

// --- Tab switching ---
function initViewTabs() {
  var tabNav = document.getElementById('view-tabs');
  if (!tabNav) return;
  tabNav.addEventListener('click', function(e) {
    var btn = e.target.closest('.view-tab');
    if (!btn) return;
    var view = btn.getAttribute('data-view');
    tabNav.querySelectorAll('.view-tab').forEach(function(t) { t.classList.remove('active'); });
    btn.classList.add('active');
    document.querySelectorAll('.view-panel').forEach(function(p) { p.classList.remove('active'); });
    var target = document.getElementById('view-' + view);
    if (target) target.classList.add('active');
  });
}

// --- Shades View ---
function renderShadesView(colors) {
  var container = document.getElementById('view-shades');
  if (!container) return;
  container.innerHTML = '';
  var labels = { primary:'Primary', secondary:'Secondary', accent:'Accent', warning:'Warning', danger:'Danger', success:'Success', info:'Info', neutral:'Neutral' };
  PALETTE_KEYS.forEach(function(key) {
    var color = colors[key];
    if (!color || !color.tones || !color.tones.length) return;
    var card = document.createElement('div');
    card.className = 'shade-card';
    // Header
    var header = document.createElement('div');
    header.className = 'shade-card-header';
    header.innerHTML = '<span class="shade-color-name">' + labels[key] + '</span><span class="shade-hex-value">' + color.hex + '</span>';
    card.appendChild(header);
    // Strip
    var strip = document.createElement('div');
    strip.className = 'shade-strip';
    color.tones.forEach(function(tone) {
      var swatch = document.createElement('div');
      swatch.className = 'shade-swatch';
      swatch.style.backgroundColor = tone.hex;
      var textColor = tone.l < 50 ? '#fff' : '#1B1A18';
      swatch.style.color = textColor;
      swatch.innerHTML = '<span class="shade-label">' + tone.l + '</span><span class="shade-hex">' + tone.hex + '</span>';
      swatch.addEventListener('click', function() {
        navigator.clipboard.writeText(tone.hex).then(function() {
          var lbl = swatch.querySelector('.shade-hex');
          lbl.textContent = 'Copied!';
          lbl.style.opacity = '1';
          setTimeout(function() { lbl.textContent = tone.hex; lbl.style.opacity = ''; }, 1500);
        });
      });
      strip.appendChild(swatch);
    });
    card.appendChild(strip);
    container.appendChild(card);
  });
}

// --- Demo View ---
function renderDemoView(colors) {
  var container = document.getElementById('view-demo');
  if (!container) return;

  function getTone(key, index) {
    var c = colors[key];
    if (c && c.tones && c.tones[index]) return c.tones[index].hex;
    return c ? c.hex : '#888';
  }
  function textOn(hex) {
    var r = parseInt(hex.substr(1,2),16), g = parseInt(hex.substr(3,2),16), b = parseInt(hex.substr(5,2),16);
    return (r*0.299 + g*0.587 + b*0.114) > 150 ? '#1B1A18' : '#FFFFFF';
  }

  var p = colors.primary, s = colors.secondary, a = colors.accent;
  var w = colors.warning, d = colors.danger, su = colors.success, inf = colors.info, n = colors.neutral;

  var html = '';

  // Navbar
  html += '<div class="demo-section">';
  html += '<div class="demo-section-title">Navigation</div>';
  html += '<div class="demo-navbar" style="background:' + p.hex + ';">';
  html += '<span class="demo-nav-brand">AppName</span>';
  html += '<div class="demo-nav-links"><span>Home</span><span>Features</span><span>Pricing</span><span>Contact</span></div>';
  html += '</div></div>';

  // Hero
  html += '<div class="demo-section">';
  html += '<div class="demo-section-title">Hero Section</div>';
  html += '<div class="demo-hero" style="background: linear-gradient(135deg, ' + p.hex + ', ' + s.hex + ');">';
  html += '<div class="demo-hero-title">Build something amazing</div>';
  html += '<div class="demo-hero-sub">A beautiful color palette generated just for you.</div>';
  html += '<span class="demo-btn" style="background:' + a.hex + ';color:' + textOn(a.hex) + ';">Get Started</span>';
  html += '</div></div>';

  // Buttons
  html += '<div class="demo-section">';
  html += '<div class="demo-section-title">Buttons</div>';
  html += '<div class="demo-button-row">';
  var btnColors = [
    {key:'primary',label:'Primary',c:p}, {key:'secondary',label:'Secondary',c:s},
    {key:'accent',label:'Accent',c:a}, {key:'danger',label:'Danger',c:d}
  ];
  btnColors.forEach(function(b) {
    html += '<span class="demo-btn" style="background:' + b.c.hex + ';color:' + textOn(b.c.hex) + ';">' + b.label + '</span>';
  });
  html += '<span class="demo-btn-outline" style="border-color:' + p.hex + ';color:' + p.hex + ';">Outline</span>';
  html += '</div></div>';

  // Alerts
  html += '<div class="demo-section">';
  html += '<div class="demo-section-title">Alerts</div>';
  var alertColors = [
    {key:'success',label:'Success! Operation completed.',c:su},
    {key:'warning',label:'Warning: Please review your input.',c:w},
    {key:'danger',label:'Error: Something went wrong.',c:d},
    {key:'info',label:'Info: New updates are available.',c:inf}
  ];
  alertColors.forEach(function(al) {
    var bg = getTone(al.key, 8);  // light tone
    var fg = getTone(al.key, 1);  // dark tone
    html += '<div class="demo-alert" style="background:' + bg + ';color:' + fg + ';border-left-color:' + al.c.hex + ';">' + al.label + '</div>';
  });
  html += '</div>';

  // Card
  html += '<div class="demo-section">';
  html += '<div class="demo-section-title">Card</div>';
  html += '<div class="demo-card" style="border-left-color:' + a.hex + ';">';
  html += '<div class="demo-card-title" style="color:' + p.hex + ';">Feature Highlight</div>';
  html += '<div class="demo-card-text">This card showcases how your palette colors work together in a typical UI component with accent borders and primary headings.</div>';
  html += '</div></div>';

  // Badges
  html += '<div class="demo-section">';
  html += '<div class="demo-section-title">Badges</div>';
  html += '<div class="demo-badge-row">';
  var badgeLabels = { primary:'Primary', secondary:'Secondary', accent:'Accent', warning:'Warning', danger:'Danger', success:'Success', info:'Info', neutral:'Neutral' };
  PALETTE_KEYS.forEach(function(key) {
    var c = colors[key];
    if (!c) return;
    var bg = getTone(key, 8);
    var fg = getTone(key, 1);
    html += '<span class="demo-badge" style="background:' + bg + ';color:' + fg + ';">' + badgeLabels[key] + '</span>';
  });
  html += '</div></div>';

  // Form
  html += '<div class="demo-section">';
  html += '<div class="demo-section-title">Form</div>';
  html += '<div class="demo-form" style="--demo-focus-color:' + p.hex + ';--demo-focus-ring:' + getTone('primary', 8) + '40;">';
  html += '<div class="demo-form-group"><label class="demo-form-label">Email address</label><input class="demo-input" type="text" placeholder="you@example.com"></div>';
  html += '<div class="demo-form-group"><label class="demo-form-label">Message</label><input class="demo-input" type="text" placeholder="Write something..."></div>';
  html += '<span class="demo-btn" style="background:' + p.hex + ';color:' + textOn(p.hex) + ';">Submit</span>';
  html += '</div></div>';

  // Stats
  html += '<div class="demo-section">';
  html += '<div class="demo-section-title">Stats</div>';
  html += '<div class="demo-stat-row">';
  var stats = [
    {color:p.hex, value:'12.4k', label:'Users'},
    {color:s.hex, value:'98.2%', label:'Uptime'},
    {color:a.hex, value:'$3.2M', label:'Revenue'}
  ];
  stats.forEach(function(st) {
    html += '<div class="demo-stat-card" style="border-top-color:' + st.color + ';">';
    html += '<div class="demo-stat-value" style="color:' + st.color + ';">' + st.value + '</div>';
    html += '<div class="demo-stat-label">' + st.label + '</div>';
    html += '</div>';
  });
  html += '</div></div>';

  container.innerHTML = html;
}

var EXPORT_FORMATS = {
  css:      { generator: generateCSSVariables,  filename: 'palette.css',         mime: 'text/css' },
  scss:     { generator: generateSCSSVariables,  filename: '_palette.scss',       mime: 'text/x-scss' },
  tailwind: { generator: generateTailwindConfig, filename: 'tailwind.palette.js', mime: 'application/javascript' },
  json:     { generator: generateJSONExport,     filename: 'palette.json',        mime: 'application/json' }
};

function getExportText(format) {
  if (!currentPaletteColors || !EXPORT_FORMATS[format]) return '';
  return EXPORT_FORMATS[format].generator(currentPaletteColors);
}

function copyExportToClipboard(text, btn) {
  navigator.clipboard.writeText(text)
    .then(function() {
      var original = btn.textContent;
      btn.textContent = 'Copied!';
      setTimeout(function() { btn.textContent = original; }, 2000);
    })
    .catch(function(err) {
      console.error('Error copying to clipboard:', err);
    });
}

function downloadExportFile(text, filename, mimeType) {
  var blob = new Blob([text], { type: mimeType });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function updateUI(data) {
  let { colors, permalink, keywords } = data;
  // Normalize colors using HSL logic before rendering
  colors = normalizePaletteColors(colors);
  // Update page title with keywords
  const title = document.getElementById('palette-title');
  if (keywords) {
    title.innerText = `Your Color Palette for ${keywords}`;
  }
  // Prepare description list
  const descUl = document.getElementById('descriptions');
  descUl.innerHTML = '';
  // Update palette display
  const paletteContainer = document.getElementById('palette');
  paletteContainer.innerHTML = '';
  if (Array.isArray(colors)) {
    colors.forEach((hex, index) => {
      const colorBox = createColorBox(hex, index);
      paletteContainer.appendChild(colorBox);
    });
  } else if (colors && typeof colors === 'object') {
    // Store for export functions
    currentPaletteColors = colors;
    var exportSection = document.getElementById('export-section');
    if (exportSection) exportSection.style.display = 'block';

    // Render structured palettes in a fixed order
    const DISPLAY_LABELS = {
      primary: "Primary",
      secondary: "Secondary",
      accent: "Accent",
      warning: "Warning",
      danger: "Danger",
      success: "Success",
      info: "Info",
      neutral: "Neutral"
    };
    PALETTE_KEYS.forEach((key, index) => {
      const val = colors[key];
      if (!val) return;
      const { hex, description } = val;
      // Render swatch and label
      const colorBox = createColorBox(hex, index);
      paletteContainer.appendChild(colorBox);
      // Add description to list in same order
      const li = document.createElement('li');
      li.innerHTML = `<strong>${DISPLAY_LABELS[key]}:</strong> ${description}`;
      descUl.appendChild(li);
    });
  }
  
  // Update permalink
  const permalinkContainer = document.getElementById('permalink-container');
  const base = window.location.origin;
  if (permalink) {
    permalinkContainer.innerHTML = `<a href="${base}/palette/${permalink}" class="button permalink" onclick="copyPermalinkToClipboard(event)">${base}/palette/${permalink}</a>`;
  } else {
    permalinkContainer.innerHTML = '';
  }

  // Show tabs and render shades/demo views
  if (currentPaletteColors) {
    var viewTabs = document.getElementById('view-tabs');
    if (viewTabs) viewTabs.style.display = 'flex';
    renderShadesView(currentPaletteColors);
    renderDemoView(currentPaletteColors);
  }
}

if(!(window.location.pathname.split('/')[2])){
  document.getElementById('generate').addEventListener('click', async () => {
    const loader = document.getElementById("loader");
    document.getElementById("response-container").innerHTML = "";
    document.getElementById("permalink-container").innerHTML = "";
    document.getElementById("placeholder-template").innerHTML = "";
    document.getElementById("palette").innerHTML = "";
    loader.style.display = "inline-block"; // Show loader
    
    const feelingsInput = document.getElementById('feelings').value;
    const checkboxes = document.querySelectorAll('#feelingsCheckboxes input:checked');
    let checkedFeelings = '';
    
    checkboxes.forEach((checkbox) => {
      checkedFeelings += ` ${checkbox.value}`;
    });
    
    checkboxes.forEach((checkbox) => {
      checkbox.checked = false;
    });
    
    const feelings = `${feelingsInput}${checkedFeelings}`;
    console.log('feelings:', feelings);
    
    const response = await fetch('/generatePalette', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ feelings }),
    });
    
    loader.style.display = "none"; // Hide loader
    if (!response.ok) {
      const errText = await response.text();
      console.error('Generate palette failed:', errText);
      alert('Error generating palette: ' + errText);
      return;
    }
    const data = await response.json();
    if (!data.permalink) {
      console.error('Missing permalink in response', data);
      alert('Failed to generate palette. Please try again.');
      return;
    }
    window.location.href = `/palette/${data.permalink}`;
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  // Init view tabs (palette page)
  initViewTabs();

  //Picker
  const colorBoxes = document.querySelectorAll('.color-box');
  colorBoxes.forEach((colorBox) => {
    colorBox.addEventListener('click', (event) => {
      event.stopPropagation();
      const rect = colorBox.getBoundingClientRect();
      const top = rect.top + window.scrollY;
      const left = rect.left + window.scrollX;
      openColorPicker(colorBox, top, left);
    });
  });
  
  document.body.addEventListener('click', () => {
    const existingPickr = document.querySelector('.pickr');
    if (existingPickr) existingPickr.remove();
  });
  
  //Show existing palette on /palette
  const paletteId = window.location.pathname.split('/')[2];
  if (paletteId && paletteId !== 'undefined') {
    await showPalette(paletteId);
  }

  // Export section event listeners (palette page only)
  if (document.getElementById('export-section')) {
    document.querySelectorAll('.export-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var format = btn.getAttribute('data-format');
        var text = getExportText(format);
        var preview = document.getElementById('export-preview');
        var code = document.getElementById('export-preview-code');

        // Toggle off if same format already shown
        if (preview.style.display !== 'none' && preview.getAttribute('data-active-format') === format) {
          preview.style.display = 'none';
          preview.removeAttribute('data-active-format');
          btn.classList.remove('active');
          return;
        }

        code.textContent = text;
        preview.style.display = 'block';
        preview.setAttribute('data-active-format', format);

        document.querySelectorAll('.export-btn').forEach(function(b) { b.classList.remove('active'); });
        btn.classList.add('active');
      });
    });

    document.querySelectorAll('.export-copy').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var format = btn.getAttribute('data-format');
        var text = getExportText(format);
        if (text) copyExportToClipboard(text, btn);
      });
    });

    document.querySelectorAll('.export-download').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var format = btn.getAttribute('data-format');
        var text = getExportText(format);
        var meta = EXPORT_FORMATS[format];
        if (text && meta) downloadExportFile(text, meta.filename, meta.mime);
      });
    });
  }

  //Generate color types checkboxes
  const predefinedFeelings = [
    "Vibrant",            // high saturation & contrast
    "Muted",              // low chroma, soft sophistication
    "Pastel",             // light, low‑saturation “soft” tones
    "Earthy",             // natural terracottas, ochres, mossy greens
    "Warm",               // reds, oranges, yellows – cozy & inviting
    "Cool",               // blues, greens, purples – calm & modern
    "Neutral",            // greys, beiges, whites, blacks – clean base
    "Monochromatic",      // variations of one hue for ultra‑cohesion
    "Analogous",          // three adjacent hues – gentle harmony
    "Complementary",      // opposite hues – maximum contrast
    "Split-Complementary",// hue + the two adjacent to its complement
    "Triadic",            // three equidistant hues – balanced vibrancy
    "Duotone"             // only two main colors – bold graphic impact
  ];
  
  const feelingsCheckboxesContainer = document.getElementById("feelingsCheckboxes");
  predefinedFeelings.forEach(feeling => {
    const checkboxField = createCheckboxField(feeling);
    feelingsCheckboxesContainer.appendChild(checkboxField);
  });
});

//Show Palette
async function showPalette(paletteId) {
  loader.style.display = "inline-block"; // Show loader
  try {
    const response = await fetch(`/palette/${paletteId}/data`);
    loader.style.display = "none";
    if (!response.ok) {
      console.error(`Failed to load palette data: ${response.status}`);
      return;
    }
    const data = await response.json();
    updateUI(data);
  } catch (error) {
    console.error(error);
  }
}

//Copy permalink to clipboard
function copyPermalinkToClipboard(event) {
  event.preventDefault();
  const linkElement = event.target;
  const textToCopy = linkElement.text;
  navigator.clipboard.writeText(textToCopy)
    .then(() => {
      linkElement.textContent = "Link copied to clipboard";
      setTimeout(() => linkElement.textContent = textToCopy, 3000);
    })
    .catch(err => console.error("Error copying permalink to clipboard:", err));
}