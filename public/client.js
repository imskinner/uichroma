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
    "Accent 1",
    "Accent 2",
    "Warning",
    "Danger",
    "Success",
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

function updateUI(data) {
  console.log(data);
  const { colors, aiResponse, permalink } = data;
  console.log(colors);
  
  // Atualizar a paleta de cores
  const paletteContainer = document.getElementById('palette');
  paletteContainer.innerHTML = '';
  
  colors.forEach((color,index) => {
    const colorBox = createColorBox(color, index);
    paletteContainer.appendChild(colorBox);
  });
  
  // Atualizar a resposta da IA
  const responseContainer = document.getElementById('response-container');
  responseContainer.innerHTML = aiResponse;
  
  const palletaiURL = window.location;
  console.log(palletaiURL);
  
  // Atualizar a resposta da IA
  if(!(window.location.pathname.split('/')[2])){
    const permalinkContainer = document.getElementById('permalink-container');
    permalinkContainer.innerHTML = '<a href="palette/'+permalink+'" class="button permalink" onclick="copyPermalinkToClipboard(event)">'+palletaiURL+'palette/'+permalink+'</a>'
  } else {
    const permalinkContainer = document.getElementById('permalink-container');
    permalinkContainer.innerHTML = '<a href="'+palletaiURL+'" class="button permalink" onclick="copyPermalinkToClipboard(event)">'+palletaiURL+'</a>'
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
    
    const data = await response.json();
    loader.style.display = "none"; // Hide loader
    //updateUI(data);
    window.location.href = `/palette/${data.permalink}`;
  })};
  
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
    if (paletteId) {
      await showPalette(paletteId);
    }
    
    //Generate color types checkboxes
    const predefinedFeelings = [
      "Vibrant",
      "Pastel",
      "Earthy/Natural",
      "Cool",
      "Warm",
      "Jewel Tones",
      "Muted",
      "Romantic",
      "Dark",
      "Hyper Color",
      "Light",
      "Retro",
      "Tropical",
      "Minimalist"
    ]
    
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
      console.log(response);
      const data = await response.json();
      loader.style.display = "none"; // Hide loader
      updateUI(data);
    } catch (error) {
      console.error(error);
    }
  }
  
  //Copy permalink to clipboard
  function copyPermalinkToClipboard(event) {
    event.preventDefault();
    const linkElement = event.target;
    
    // Copy permalink to clipboard
    const textToCopy = linkElement.text;
    navigator.clipboard.writeText(textToCopy).then(
      () => {
        // Change button text
        linkElement.textContent = "Link copied to clipboard";
        
        // Revert to original text after 3s
        setTimeout(() => {
          linkElement.textContent = textToCopy;
        }, 3000);
      },
      (err) => {
        console.error("Error copying permalink to clipboard:", err);
      }
      );
    }