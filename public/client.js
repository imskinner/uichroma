// Stores normalized palette colors for export functions
var currentPaletteColors = null;
var currentPermalink = null;
var isDirty = false;
var activeDemoLayout = 'components';

var PALETTE_KEYS = ["primary","secondary","accent","warning","danger","success","info","neutral"];

function markDirty() {
  isDirty = true;
  var saveBtn = document.getElementById('save-changes-btn');
  if (saveBtn) {
    saveBtn.style.display = 'inline-block';
    saveBtn.textContent = 'Save Changes';
    saveBtn.disabled = false;
  }
}

function clearDirty() {
  isDirty = false;
  var saveBtn = document.getElementById('save-changes-btn');
  if (saveBtn) saveBtn.style.display = 'none';
}

function positionPickr(pickr, top, left) {
  var pickrRoot = pickr.getRoot();
  pickrRoot.app.style.position = 'fixed';
  pickrRoot.app.style.zIndex = '1000';
  // Viewport-aware: prevent off-screen overflow
  var vw = window.innerWidth;
  var vh = window.innerHeight;
  var appW = 320;
  var appH = 320;
  if (left + appW > vw) left = vw - appW - 16;
  if (left < 8) left = 8;
  if (top + appH > vh) top = top - appH - 16;
  if (top < 8) top = 8;
  pickrRoot.app.style.top = top + 'px';
  pickrRoot.app.style.left = left + 'px';
}


function openColorPicker(colorBoxElement, top, left) {
  var existingPickr = document.querySelector('.pcr-app');
  if (existingPickr) existingPickr.remove();

  var pickrContainer = document.createElement('div');
  pickrContainer.style.position = 'absolute';
  pickrContainer.style.zIndex = '100';

  var rect = colorBoxElement.getBoundingClientRect();
  var originalHex = colorBoxElement.style.backgroundColor;
  // Convert rgb(...) to hex for Pickr
  var tempEl = document.createElement('div');
  tempEl.style.color = originalHex;
  document.body.appendChild(tempEl);
  var computed = getComputedStyle(tempEl).color;
  document.body.removeChild(tempEl);
  // Parse rgb(r,g,b)
  var rgbMatch = computed.match(/(\d+)/g);
  if (rgbMatch && rgbMatch.length >= 3) {
    originalHex = '#' + rgbMatch.slice(0,3).map(function(c) {
      var h = parseInt(c).toString(16);
      return h.length === 1 ? '0' + h : h;
    }).join('');
  }

  var originalHexText = colorBoxElement.querySelector('.hex').innerText;
  var hasSaved = false;

  var pickrDiv = document.createElement('div');
  pickrDiv.className = 'pickr';
  pickrDiv.style.top = (rect.top + window.scrollY) + 'px';
  pickrDiv.style.left = (rect.left + window.scrollX) + 'px';
  pickrDiv.appendChild(pickrContainer);

  var pickr = Pickr.create({
    el: pickrContainer,
    appClass: 'color-picker',
    defaultRepresentation: 'HSLA',
    theme: 'classic',
    default: originalHex,
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

  pickr.on('init', function() {
    positionPickr(pickr, rect.bottom + 8, rect.left);
  });

  // Live preview as user drags
  pickr.on('change', function(color) {
    var hex = color.toHEXA().toString();
    colorBoxElement.style.backgroundColor = hex;
    colorBoxElement.querySelector('.hex').innerText = hex;
  });

  pickr.on('save', function(color, instance) {
    hasSaved = true;
    var hexColor = color.toHEXA().toString();
    var key = colorBoxElement.getAttribute('data-key');
    if (key && currentPaletteColors) {
      applyColorChange(key, hexColor);
    } else {
      updateColor(hexColor, colorBoxElement);
    }
    instance.hide();
    instance.destroyAndRemove();
  });

  pickr.on('hide', function(color, instance) {
    if (!hasSaved) {
      // Revert to original color
      colorBoxElement.style.backgroundColor = originalHex;
      colorBoxElement.querySelector('.hex').innerText = originalHexText;
    }
    instance.destroyAndRemove();
  });

  document.body.addEventListener('click', function closePickr(event) {
    if (event.target.closest('.pickr') === null && event.target.closest('.pcr-app') === null) {
      pickr.hide();
      document.body.removeEventListener('click', closePickr);
    }
  });
}

function updateColor(hexColor, colorBoxElement) {
  colorBoxElement.style.backgroundColor = hexColor;
  colorBoxElement.querySelector('span').innerText = hexColor;
}

function applyColorChange(key, newHex) {
  if (!currentPaletteColors) return;

  // Recalculate HSL and tones for the changed color
  var hsl = hexToHSL(newHex);
  var tones = generateTonesForColor(hsl.h, hsl.s);
  var existing = currentPaletteColors[key];
  currentPaletteColors[key] = {
    hex: newHex,
    h: hsl.h,
    s: hsl.s,
    l: hsl.l,
    tones: tones,
    description: existing ? existing.description : ''
  };

  // If primary changed, re-derive neutral
  if (key === 'primary') {
    var neutralHex = hslToHex(hsl.h, 10, 10);
    var neutralHSL = hexToHSL(neutralHex);
    var neutralTones = generateTonesForColor(neutralHSL.h, neutralHSL.s);
    var neutralDesc = currentPaletteColors.neutral ? currentPaletteColors.neutral.description : '';
    currentPaletteColors.neutral = {
      hex: neutralHex,
      h: neutralHSL.h,
      s: neutralHSL.s,
      l: neutralHSL.l,
      tones: neutralTones,
      description: neutralDesc
    };
    // Update neutral swatch in DOM
    var neutralBox = document.querySelector('.color-box[data-key="neutral"]');
    if (neutralBox) {
      neutralBox.style.backgroundColor = neutralHex;
      neutralBox.querySelector('.hex').innerText = neutralHex;
    }
  }

  // Update the swatch DOM for the changed key
  var swatch = document.querySelector('.color-box[data-key="' + key + '"]');
  if (swatch) {
    swatch.style.backgroundColor = newHex;
    swatch.querySelector('.hex').innerText = newHex;
  }

  // Re-render shades and demo views
  renderShadesView(currentPaletteColors);
  renderDemoView(currentPaletteColors);

  markDirty();
}


function createColorBox(color, index) {
  var colorLabels = [
    "Primary",
    "Secondary",
    "Accent",
    "Warning",
    "Danger",
    "Success",
    "Info",
    "Neutral"
  ];
  var colorBox = document.createElement('div');
  colorBox.className = 'color-box';
  colorBox.style.backgroundColor = color;
  colorBox.setAttribute('data-key', PALETTE_KEYS[index]);
  colorBox.innerHTML = '<span class="hex">' + color + '</span><span class="color-label">' + colorLabels[index] + '</span>';
  colorBox.querySelector('.hex').addEventListener('click', function(event) {
    event.stopPropagation();
    var span = event.target;
    var hex = span.innerText;
    navigator.clipboard.writeText(hex)
      .then(function() {
        span.innerText = 'Copied!';
        setTimeout(function() { span.innerText = hex; }, 3000);
      })
      .catch(function(err) { console.error('Error copying hex to clipboard:', err); });
  });
  colorBox.onclick = function(event) {
    event.stopPropagation();
    var rect = colorBox.getBoundingClientRect();
    var top = rect.top + window.scrollY + 48;
    var left = rect.left + window.scrollX;
    openColorPicker(colorBox, top, left);
  };
  return colorBox;
}

// Utility: convert hex to HSL
function hexToHSL(H) {
  var r = 0, g = 0, b = 0;
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
  var cmin = Math.min(r,g,b), cmax = Math.max(r,g,b);
  var delta = cmax - cmin;
  var h = 0, s = 0;
  var l = (cmax + cmin) / 2;
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
  return { h: h, s: s, l: +(l * 100).toFixed(1) };
}

// Utility: convert HSL to hex
function hslToHex(h, s, l) {
  s /= 100; l /= 100;
  var k = function(n) { return (n + h / 30) % 12; };
  var a = s * Math.min(l, 1 - l);
  var f = function(n) { return l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1))); };
  var toHex = function(x) {
    var hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return '#' + toHex(f(0)) + toHex(f(8)) + toHex(f(4));
}

// Utility: generate tonal variations for a given HSL
function generateTonesForColor(h, s, count, minL, maxL) {
  if (count == null) count = 10;
  if (minL == null) minL = 10;
  if (maxL == null) maxL = 95;
  var tones = [];
  for (var i = 0; i < count; i++) {
    var lightness = Math.round(minL + (maxL - minL) * (i / (count - 1)));
    var hex = hslToHex(h, s, lightness);
    tones.push({ h: h, s: s, l: lightness, hex: hex });
  }
  return tones;
}

// Normalize palette colors to HSL rules
function normalizePaletteColors(colors) {
  if (Array.isArray(colors)) return colors;
  var normalized = {};
  var primaryHSL = hexToHSL(colors.primary.hex);
  PALETTE_KEYS.forEach(function(key) {
    var orig = colors[key];
    if (!orig) return;
    var h, s, l, hex;
    if (key === 'neutral') {
      h = primaryHSL.h;
      s = 10;
      l = 10;
      hex = hslToHex(h, s, l);
    } else {
      hex = orig.hex;
      var hslObj = hexToHSL(orig.hex);
      h = hslObj.h;
      s = hslObj.s;
      l = hslObj.l;
    }
    var tones = generateTonesForColor(h, s);
    normalized[key] = { hex: hex, h: h, s: s, l: l, tones: tones, description: orig.description || '' };
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
    var header = document.createElement('div');
    header.className = 'shade-card-header';
    header.innerHTML = '<span class="shade-color-name">' + labels[key] + '</span><span class="shade-hex-value">' + color.hex + '</span>';
    card.appendChild(header);
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
function getTone(colors, key, index) {
  var c = colors[key];
  if (c && c.tones && c.tones[index]) return c.tones[index].hex;
  return c ? c.hex : '#888';
}

function textOn(hex) {
  var r = parseInt(hex.substr(1,2),16), g = parseInt(hex.substr(3,2),16), b = parseInt(hex.substr(5,2),16);
  return (r*0.299 + g*0.587 + b*0.114) > 150 ? '#1B1A18' : '#FFFFFF';
}

function renderDemoView(colors) {
  var container = document.getElementById('view-demo');
  if (!container) return;
  container.innerHTML = '';

  // Sub-tab navigation
  var layouts = [
    { id: 'components', label: 'Components' },
    { id: 'landing', label: 'Landing Page' },
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'mobile', label: 'Mobile App' },
    { id: 'blog', label: 'Blog' }
  ];

  var tabBar = document.createElement('div');
  tabBar.className = 'demo-sub-tabs';
  layouts.forEach(function(layout) {
    var tab = document.createElement('button');
    tab.className = 'demo-sub-tab';
    if (layout.id === activeDemoLayout) tab.classList.add('active');
    tab.textContent = layout.label;
    tab.setAttribute('data-layout', layout.id);
    tab.addEventListener('click', function() {
      activeDemoLayout = layout.id;
      renderDemoView(currentPaletteColors);
    });
    tabBar.appendChild(tab);
  });
  container.appendChild(tabBar);

  var content = document.createElement('div');
  content.className = 'demo-content';
  container.appendChild(content);

  switch (activeDemoLayout) {
    case 'components': renderDemoComponents(colors, content); break;
    case 'landing':    renderDemoLanding(colors, content); break;
    case 'dashboard':  renderDemoDashboard(colors, content); break;
    case 'mobile':     renderDemoMobile(colors, content); break;
    case 'blog':       renderDemoBlog(colors, content); break;
    default:           renderDemoComponents(colors, content); break;
  }
}

// --- Demo: Components (existing) ---
function renderDemoComponents(colors, container) {
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
    {label:'Primary',c:p}, {label:'Secondary',c:s},
    {label:'Accent',c:a}, {label:'Danger',c:d}
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
    var bg = getTone(colors, al.key, 8);
    var fg = getTone(colors, al.key, 1);
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
    var bg = getTone(colors, key, 8);
    var fg = getTone(colors, key, 1);
    html += '<span class="demo-badge" style="background:' + bg + ';color:' + fg + ';">' + badgeLabels[key] + '</span>';
  });
  html += '</div></div>';

  // Form
  html += '<div class="demo-section">';
  html += '<div class="demo-section-title">Form</div>';
  html += '<div class="demo-form" style="--demo-focus-color:' + p.hex + ';--demo-focus-ring:' + getTone(colors, 'primary', 8) + '40;">';
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

// --- Demo: Landing Page ---
function renderDemoLanding(colors, container) {
  var p = colors.primary, s = colors.secondary, a = colors.accent, n = colors.neutral;

  var html = '';

  // Navbar
  html += '<div class="demo-landing-navbar" style="background:' + p.hex + ';color:' + textOn(p.hex) + ';">';
  html += '<span class="demo-landing-brand">BrandName</span>';
  html += '<div class="demo-landing-nav-links"><span>Home</span><span>About</span><span>Services</span><span>Contact</span></div>';
  html += '</div>';

  // Hero
  html += '<div class="demo-landing-hero" style="background:linear-gradient(135deg,' + p.hex + ',' + s.hex + ');color:#fff;">';
  html += '<div class="demo-landing-hero-title">Transform Your Digital Experience</div>';
  html += '<div class="demo-landing-hero-sub">Create stunning interfaces with a palette designed to inspire. Your brand deserves colors that speak.</div>';
  html += '<span class="demo-btn" style="background:' + a.hex + ';color:' + textOn(a.hex) + ';">Get Started Free</span>';
  html += '</div>';

  // Features grid
  html += '<div class="demo-landing-features">';
  var features = [
    { icon: '\u26A1', title: 'Lightning Fast', desc: 'Optimized performance that keeps users engaged and coming back.', color: p.hex },
    { icon: '\uD83C\uDFA8', title: 'Beautiful Design', desc: 'Pixel-perfect interfaces crafted with attention to every detail.', color: s.hex },
    { icon: '\uD83D\uDD12', title: 'Secure & Reliable', desc: 'Enterprise-grade security to protect your data around the clock.', color: a.hex }
  ];
  features.forEach(function(f) {
    html += '<div class="demo-landing-feature-card">';
    html += '<div class="demo-landing-feature-icon" style="background:' + f.color + ';color:' + textOn(f.color) + ';">' + f.icon + '</div>';
    html += '<div class="demo-landing-feature-title">' + f.title + '</div>';
    html += '<div class="demo-landing-feature-desc">' + f.desc + '</div>';
    html += '</div>';
  });
  html += '</div>';

  // Testimonial
  html += '<div class="demo-landing-testimonial" style="background:' + getTone(colors, 'neutral', 8) + ';border-left:4px solid ' + a.hex + ';">';
  html += '<div class="demo-landing-quote" style="color:' + getTone(colors, 'neutral', 2) + ';">"This platform completely transformed how we approach design. The color system is incredibly intuitive and our team productivity skyrocketed."</div>';
  html += '<div class="demo-landing-quote-author" style="color:' + a.hex + ';">— Sarah Chen, Design Lead at TechCo</div>';
  html += '</div>';

  // CTA
  html += '<div class="demo-landing-cta" style="background:' + s.hex + ';color:' + textOn(s.hex) + ';">';
  html += '<div class="demo-landing-cta-title">Ready to get started?</div>';
  html += '<div class="demo-landing-cta-sub">Join thousands of designers who trust our platform.</div>';
  html += '<span class="demo-btn" style="background:' + a.hex + ';color:' + textOn(a.hex) + ';">Start Free Trial</span>';
  html += '</div>';

  // Footer
  html += '<div class="demo-landing-footer" style="background:' + getTone(colors, 'neutral', 0) + ';color:' + getTone(colors, 'neutral', 6) + ';">';
  html += '<div class="demo-landing-footer-cols">';
  html += '<div><strong style="color:' + getTone(colors, 'neutral', 2) + ';">Product</strong><div>Features</div><div>Pricing</div><div>Docs</div></div>';
  html += '<div><strong style="color:' + getTone(colors, 'neutral', 2) + ';">Company</strong><div>About</div><div>Blog</div><div>Careers</div></div>';
  html += '<div><strong style="color:' + getTone(colors, 'neutral', 2) + ';">Support</strong><div>Help Center</div><div>Contact</div><div>Status</div></div>';
  html += '</div>';
  html += '<div class="demo-landing-footer-bottom" style="border-top:1px solid ' + getTone(colors, 'neutral', 1) + ';color:' + getTone(colors, 'neutral', 5) + ';">&copy; 2026 BrandName. All rights reserved.</div>';
  html += '</div>';

  container.innerHTML = html;
}

// --- Demo: Dashboard ---
function renderDemoDashboard(colors, container) {
  var p = colors.primary, s = colors.secondary, a = colors.accent;
  var su = colors.success, w = colors.warning, d = colors.danger, n = colors.neutral;

  var html = '';

  html += '<div class="demo-dashboard-layout">';

  // Sidebar
  html += '<div class="demo-dashboard-sidebar" style="background:' + getTone(colors, 'neutral', 0) + ';">';
  html += '<div class="demo-dashboard-sidebar-brand" style="color:' + p.hex + ';">Dashboard</div>';
  var navItems = [
    { label: 'Overview', active: true },
    { label: 'Analytics' },
    { label: 'Users' },
    { label: 'Settings' }
  ];
  navItems.forEach(function(item) {
    if (item.active) {
      html += '<div class="demo-dashboard-nav-item active" style="background:' + p.hex + ';color:' + textOn(p.hex) + ';">' + item.label + '</div>';
    } else {
      html += '<div class="demo-dashboard-nav-item" style="color:' + getTone(colors, 'neutral', 3) + ';">' + item.label + '</div>';
    }
  });
  html += '</div>';

  // Main content
  html += '<div class="demo-dashboard-main">';

  // Top bar
  html += '<div class="demo-dashboard-topbar">';
  html += '<input class="demo-input" type="text" placeholder="Search..." style="max-width:240px;margin:0;">';
  html += '<div class="demo-dashboard-avatar" style="background:' + p.hex + ';color:' + textOn(p.hex) + ';">JD</div>';
  html += '</div>';

  // Stat cards
  html += '<div class="demo-dashboard-stats">';
  var dashStats = [
    { label: 'Total Users', value: '24,521', color: p.hex },
    { label: 'Revenue', value: '$48.2K', color: s.hex },
    { label: 'Growth', value: '+12.5%', color: su.hex },
    { label: 'Active Now', value: '1,429', color: a.hex }
  ];
  dashStats.forEach(function(st) {
    html += '<div class="demo-dashboard-stat-card" style="border-top:3px solid ' + st.color + ';">';
    html += '<div class="demo-dashboard-stat-label">' + st.label + '</div>';
    html += '<div class="demo-dashboard-stat-value" style="color:' + st.color + ';">' + st.value + '</div>';
    html += '</div>';
  });
  html += '</div>';

  // Data table
  html += '<div class="demo-dashboard-table-wrap">';
  html += '<table class="demo-dashboard-table">';
  html += '<thead><tr><th>Name</th><th>Email</th><th>Status</th><th>Role</th></tr></thead>';
  html += '<tbody>';
  var rows = [
    { name: 'Alice Johnson', email: 'alice@example.com', status: 'Active', statusColor: su.hex, statusBg: getTone(colors, 'success', 8), role: 'Admin' },
    { name: 'Bob Smith', email: 'bob@example.com', status: 'Pending', statusColor: w.hex, statusBg: getTone(colors, 'warning', 8), role: 'Editor' },
    { name: 'Carol White', email: 'carol@example.com', status: 'Inactive', statusColor: d.hex, statusBg: getTone(colors, 'danger', 8), role: 'Viewer' },
    { name: 'Dave Wilson', email: 'dave@example.com', status: 'Active', statusColor: su.hex, statusBg: getTone(colors, 'success', 8), role: 'Editor' }
  ];
  rows.forEach(function(row, i) {
    var bg = i % 2 === 1 ? getTone(colors, 'neutral', 9) : '#fff';
    html += '<tr style="background:' + bg + ';">';
    html += '<td>' + row.name + '</td>';
    html += '<td>' + row.email + '</td>';
    html += '<td><span class="demo-badge" style="background:' + row.statusBg + ';color:' + row.statusColor + ';">' + row.status + '</span></td>';
    html += '<td>' + row.role + '</td>';
    html += '</tr>';
  });
  html += '</tbody></table></div>';

  // Action buttons
  html += '<div class="demo-button-row" style="margin-top:16px;">';
  html += '<span class="demo-btn" style="background:' + p.hex + ';color:' + textOn(p.hex) + ';">Edit</span>';
  html += '<span class="demo-btn" style="background:' + d.hex + ';color:' + textOn(d.hex) + ';">Delete</span>';
  html += '</div>';

  html += '</div>'; // main
  html += '</div>'; // layout

  container.innerHTML = html;
}

// --- Demo: Mobile App ---
function renderDemoMobile(colors, container) {
  var p = colors.primary, s = colors.secondary, a = colors.accent, n = colors.neutral;

  var html = '';
  html += '<div class="demo-mobile-wrapper">';
  html += '<div class="demo-mobile-frame">';

  // Status bar
  html += '<div class="demo-mobile-statusbar" style="background:' + p.hex + ';color:' + textOn(p.hex) + ';">';
  html += '<span>9:41</span>';
  html += '<span>\u2022\u2022\u2022\u2022 \uD83D\uDD0B</span>';
  html += '</div>';

  // App header
  html += '<div class="demo-mobile-header" style="background:' + p.hex + ';color:' + textOn(p.hex) + ';">';
  html += '<span>\u2630</span><span class="demo-mobile-header-title">Discover</span><span>\uD83D\uDD14</span>';
  html += '</div>';

  // Content
  html += '<div class="demo-mobile-content" style="background:' + getTone(colors, 'neutral', 9) + ';">';

  // Cards
  var cards = [
    { title: 'Morning Routine', sub: 'Start your day right with these tips', tag: 'Wellness', tagBg: getTone(colors, 'success', 8), tagColor: colors.success.hex },
    { title: 'Design Systems', sub: 'Building scalable component libraries', tag: 'Tech', tagBg: getTone(colors, 'info', 8), tagColor: colors.info.hex },
    { title: 'Travel Guide', sub: 'Top destinations for this season', tag: 'Lifestyle', tagBg: getTone(colors, 'accent', 8), tagColor: a.hex }
  ];
  cards.forEach(function(card) {
    html += '<div class="demo-mobile-card">';
    html += '<div class="demo-mobile-card-thumb" style="background:linear-gradient(135deg,' + s.hex + ',' + p.hex + ');"></div>';
    html += '<div class="demo-mobile-card-body">';
    html += '<div class="demo-mobile-card-title">' + card.title + '</div>';
    html += '<div class="demo-mobile-card-sub">' + card.sub + '</div>';
    html += '<span class="demo-badge" style="background:' + card.tagBg + ';color:' + card.tagColor + ';font-size:1rem;">' + card.tag + '</span>';
    html += '</div></div>';
  });

  html += '</div>';

  // FAB
  html += '<div class="demo-mobile-fab" style="background:' + a.hex + ';color:' + textOn(a.hex) + ';">+</div>';

  // Bottom tab bar
  html += '<div class="demo-mobile-tabbar" style="background:#fff;border-top:1px solid ' + getTone(colors, 'neutral', 8) + ';">';
  var tabs = [
    { icon: '\uD83C\uDFE0', label: 'Home', active: true },
    { icon: '\uD83D\uDD0D', label: 'Search' },
    { icon: '\u2764', label: 'Saved' },
    { icon: '\uD83D\uDC64', label: 'Profile' }
  ];
  tabs.forEach(function(tab) {
    var color = tab.active ? p.hex : getTone(colors, 'neutral', 5);
    html += '<div class="demo-mobile-tab" style="color:' + color + ';">';
    html += '<div class="demo-mobile-tab-icon">' + tab.icon + '</div>';
    html += '<div class="demo-mobile-tab-label">' + tab.label + '</div>';
    html += '</div>';
  });
  html += '</div>';

  html += '</div>'; // frame
  html += '</div>'; // wrapper

  container.innerHTML = html;
}

// --- Demo: Blog ---
function renderDemoBlog(colors, container) {
  var p = colors.primary, s = colors.secondary, a = colors.accent, n = colors.neutral;

  var html = '';
  html += '<div class="demo-blog-layout">';

  // Article
  html += '<div class="demo-blog-article">';

  // Header
  html += '<span class="demo-badge" style="background:' + a.hex + ';color:' + textOn(a.hex) + ';">Design</span>';
  html += '<h2 class="demo-blog-title" style="color:' + getTone(colors, 'neutral', 0) + ';">The Art of Color in User Interfaces</h2>';
  html += '<div class="demo-blog-meta" style="color:' + getTone(colors, 'neutral', 5) + ';">March 1, 2026 &middot; 8 min read</div>';

  // Body
  html += '<p class="demo-blog-text">Color is one of the most powerful tools in a designer\'s toolkit. It influences mood, guides attention, and creates visual hierarchy. A well-chosen palette can elevate a product from functional to delightful.</p>';

  html += '<h3 class="demo-blog-h3" style="color:' + p.hex + ';">Understanding Color Harmony</h3>';
  html += '<p class="demo-blog-text">The foundation of any great palette starts with understanding how colors relate to each other. Complementary, analogous, and triadic schemes each create different emotional responses.</p>';

  // Blockquote
  html += '<blockquote class="demo-blog-blockquote" style="border-left-color:' + a.hex + ';background:' + getTone(colors, 'accent', 9) + ';">';
  html += '<p style="color:' + getTone(colors, 'neutral', 2) + ';">"Design is not just what it looks like and feels like. Design is how it works."</p>';
  html += '<cite style="color:' + a.hex + ';">— Steve Jobs</cite>';
  html += '</blockquote>';

  html += '<h3 class="demo-blog-h3" style="color:' + p.hex + ';">Building a System</h3>';
  html += '<p class="demo-blog-text">A color system goes beyond picking pretty colors. It defines semantic meaning — primary actions, warnings, success states — creating a consistent language throughout your interface.</p>';

  // Tags
  html += '<div class="demo-blog-tags">';
  var tagData = [
    { label: 'Design', bg: getTone(colors, 'primary', 8), color: p.hex },
    { label: 'Color Theory', bg: getTone(colors, 'secondary', 8), color: s.hex },
    { label: 'UI/UX', bg: getTone(colors, 'accent', 8), color: a.hex },
    { label: 'Tutorial', bg: getTone(colors, 'info', 8), color: colors.info.hex }
  ];
  tagData.forEach(function(t) {
    html += '<span class="demo-badge" style="background:' + t.bg + ';color:' + t.color + ';">' + t.label + '</span>';
  });
  html += '</div>';

  html += '</div>';

  // Sidebar
  html += '<div class="demo-blog-sidebar">';

  // Author card
  html += '<div class="demo-blog-author-card">';
  html += '<div class="demo-blog-author-avatar" style="background:' + p.hex + ';color:' + textOn(p.hex) + ';">AC</div>';
  html += '<div class="demo-blog-author-name" style="color:' + getTone(colors, 'neutral', 1) + ';">Alex Chen</div>';
  html += '<div class="demo-blog-author-role" style="color:' + getTone(colors, 'neutral', 5) + ';">Senior Designer</div>';
  html += '</div>';

  // Related posts
  html += '<div class="demo-blog-related">';
  html += '<div class="demo-blog-related-title" style="color:' + getTone(colors, 'neutral', 1) + ';">Related Posts</div>';
  var relatedPosts = [
    'Typography Best Practices',
    'Designing for Accessibility',
    'CSS Grid Layout Patterns'
  ];
  relatedPosts.forEach(function(title) {
    html += '<a class="demo-blog-related-link" style="color:' + p.hex + ';">' + title + '</a>';
  });
  html += '</div>';

  html += '</div>';

  html += '</div>';

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
  var colors = data.colors;
  var permalink = data.permalink;
  var keywords = data.keywords;

  // Normalize colors using HSL logic before rendering
  colors = normalizePaletteColors(colors);

  // Store permalink from URL path
  var pathParts = window.location.pathname.split('/');
  if (pathParts[2]) currentPermalink = pathParts[2];

  // Update page title with keywords
  var title = document.getElementById('palette-title');
  if (keywords) {
    title.innerText = '\u201C' + keywords + '\u201D';
  }
  // Prepare description list
  var descUl = document.getElementById('descriptions');
  descUl.innerHTML = '';
  // Update palette display
  var paletteContainer = document.getElementById('palette');
  paletteContainer.innerHTML = '';
  if (Array.isArray(colors)) {
    colors.forEach(function(hex, index) {
      var colorBox = createColorBox(hex, index);
      paletteContainer.appendChild(colorBox);
    });
  } else if (colors && typeof colors === 'object') {
    // Store for export functions
    currentPaletteColors = colors;
    var exportSection = document.getElementById('export-section');
    if (exportSection) exportSection.style.display = 'block';

    var DISPLAY_LABELS = {
      primary: "Primary",
      secondary: "Secondary",
      accent: "Accent",
      warning: "Warning",
      danger: "Danger",
      success: "Success",
      info: "Info",
      neutral: "Neutral"
    };
    PALETTE_KEYS.forEach(function(key, index) {
      var val = colors[key];
      if (!val) return;
      var hex = val.hex;
      var description = val.description;
      var colorBox = createColorBox(hex, index);
      paletteContainer.appendChild(colorBox);
      var li = document.createElement('li');
      li.innerHTML = '<strong>' + DISPLAY_LABELS[key] + ':</strong> ' + (description || '');
      descUl.appendChild(li);
    });
  }

  // Update permalink
  var permalinkContainer = document.getElementById('permalink-container');
  var base = window.location.origin;
  if (permalink) {
    permalinkContainer.innerHTML = '<a href="' + base + '/palette/' + permalink + '" class="button permalink" onclick="copyPermalinkToClipboard(event)">' + base + '/palette/' + permalink + '</a>';
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

  // Reset dirty state on fresh load
  clearDirty();
}

if(!(window.location.pathname.split('/')[2])){
  document.getElementById('generate').addEventListener('click', async function() {
    var feelings = document.getElementById('prompt').value.trim();
    if (!feelings) return;

    var loader = document.getElementById("loader");
    document.getElementById("response-container").innerHTML = "";
    document.getElementById("permalink-container").innerHTML = "";
    document.getElementById("placeholder-template").innerHTML = "";
    document.getElementById("palette").innerHTML = "";
    loader.style.display = "inline-block";

    var response = await fetch('/generatePalette', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ feelings: feelings }),
    });

    loader.style.display = "none";
    if (!response.ok) {
      var errText = await response.text();
      console.error('Generate palette failed:', errText);
      alert('Error generating palette: ' + errText);
      return;
    }
    var data = await response.json();
    if (!data.permalink) {
      console.error('Missing permalink in response', data);
      alert('Failed to generate palette. Please try again.');
      return;
    }
    window.location.href = '/palette/' + data.permalink;
  });
}

document.addEventListener('DOMContentLoaded', async function() {
  // Init view tabs (palette page)
  initViewTabs();

  //Picker
  var colorBoxes = document.querySelectorAll('.color-box');
  colorBoxes.forEach(function(colorBox) {
    colorBox.addEventListener('click', function(event) {
      event.stopPropagation();
      var rect = colorBox.getBoundingClientRect();
      var top = rect.top + window.scrollY;
      var left = rect.left + window.scrollX;
      openColorPicker(colorBox, top, left);
    });
  });

  document.body.addEventListener('click', function() {
    var existingPickr = document.querySelector('.pickr');
    if (existingPickr) existingPickr.remove();
  });

  //Show existing palette on /palette
  var paletteId = window.location.pathname.split('/')[2];
  if (paletteId && paletteId !== 'undefined') {
    await showPalette(paletteId);
  }

  // Save button handler
  var saveBtn = document.getElementById('save-changes-btn');
  if (saveBtn) {
    saveBtn.addEventListener('click', async function() {
      if (!currentPermalink || !currentPaletteColors) return;
      saveBtn.textContent = 'Saving...';
      saveBtn.disabled = true;
      try {
        var response = await fetch('/api/updatePalette', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ permalink: currentPermalink, colors: currentPaletteColors })
        });
        if (response.ok) {
          saveBtn.textContent = 'Saved!';
          isDirty = false;
          setTimeout(function() { saveBtn.style.display = 'none'; }, 1500);
        } else {
          var err = await response.json();
          saveBtn.textContent = 'Save Failed';
          console.error('Save error:', err);
          setTimeout(function() {
            saveBtn.textContent = 'Save Changes';
            saveBtn.disabled = false;
          }, 2000);
        }
      } catch (e) {
        console.error('Save error:', e);
        saveBtn.textContent = 'Save Failed';
        setTimeout(function() {
          saveBtn.textContent = 'Save Changes';
          saveBtn.disabled = false;
        }, 2000);
      }
    });
  }

  // Export section event listeners (palette page only)
  if (document.getElementById('export-section')) {
    document.querySelectorAll('.export-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var format = btn.getAttribute('data-format');
        var text = getExportText(format);
        var preview = document.getElementById('export-preview');
        var code = document.getElementById('export-preview-code');

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

});

// Warn on unsaved changes
window.addEventListener('beforeunload', function(e) {
  if (isDirty) {
    e.preventDefault();
    e.returnValue = '';
  }
});

//Show Palette
async function showPalette(paletteId) {
  loader.style.display = "inline-block";
  try {
    var response = await fetch('/palette/' + paletteId + '/data');
    loader.style.display = "none";
    if (!response.ok) {
      console.error('Failed to load palette data: ' + response.status);
      return;
    }
    var data = await response.json();
    updateUI(data);
  } catch (error) {
    console.error(error);
  }
}

//Copy permalink to clipboard
function copyPermalinkToClipboard(event) {
  event.preventDefault();
  var linkElement = event.target;
  var textToCopy = linkElement.text;
  navigator.clipboard.writeText(textToCopy)
    .then(function() {
      linkElement.textContent = "Link copied to clipboard";
      setTimeout(function() { linkElement.textContent = textToCopy; }, 3000);
    })
    .catch(function(err) { console.error("Error copying permalink to clipboard:", err); });
}
