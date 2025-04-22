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
  
  //const paletteContainer = document.getElementById('palette');
  //paletteContainer.appendChild(pickrDiv);
  
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
  const ORDERED_KEYS = ["primary","secondary","accent","warning","danger","success","info","neutral"];
  const normalized = {};
  const primaryHSL = hexToHSL(colors.primary.hex);
  ORDERED_KEYS.forEach(key => {
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
    // Render structured palettes in a fixed order
    const ORDERED_KEYS = ["primary","secondary","accent","warning","danger","success","info","neutral"];
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
    ORDERED_KEYS.forEach((key, index) => {
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
    permalinkContainer.innerHTML = `<a href="${base}/palette/${permalink}" class="button permalink">${base}/palette/${permalink}</a>`;
  } else {
    permalinkContainer.innerHTML = '';
  }
}

// Função para obter a paleta atual
function getPalette() {
  const paletteContainer = document.getElementById('palette');
  const colorBoxes = paletteContainer.querySelectorAll('.color-box');
  const colors = [];
  
  colorBoxes.forEach(colorBox => {
    const color = colorBox.style.backgroundColor;
    colors.push(color);
  });
  
  return colors;
}

function getAuthorizationUrl(palette) {
  const clientId = 'HHaOzQKGyCGCz4mBZnGYVx'; // Substitua pelo seu client_id
  const redirectUri = encodeURIComponent(' http://localhost:3000/'); // Substitua pela sua URL de redirecionamento
  
  const authorizationUrl = `https://www.figma.com/oauth?client_id=${clientId}&redirect_uri=${redirectUri}&scope=file_read&response_type=code&state=${encodeURIComponent(JSON.stringify({ palette }))}`;
  
  return authorizationUrl;
}

async function exportToFigma() {
  const response = await fetch('/exportToFigma', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      palette: currentPalette
    })
  });
  
  if (response.ok) {
    const data = await response.json();
    const fileUrl = data.fileUrl;
    window.open(fileUrl, '_blank');
  } else {
    console.error('Error exporting to Figma');
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