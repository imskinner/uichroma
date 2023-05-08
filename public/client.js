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

document.addEventListener('DOMContentLoaded', () => {
  const colorBoxes = document.querySelectorAll('.color-box');

  colorBoxes.forEach((colorBox) => {
    colorBox.addEventListener('click', () => openColorPicker(colorBox));
  });
});

function openColorPicker(colorBoxElement) {
  const pickr = Pickr.create({
    el: colorBoxElement,
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
        save: false,
      },
    },
  });

  pickr.on('hide', (color, instance) => {
    const hexColor = color.toHEXA().toString();
    updateColor(hexColor, colorBoxElement);
    instance.close();
  });
}

function updateColor(hexColor, colorBoxElement) {
  colorBoxElement.style.backgroundColor = hexColor;
  colorBoxElement.querySelector('span').innerText = hexColor;
}


function createColorBox(color) {
  const colorBox = document.createElement('div');
  colorBox.className = 'color-box';
  colorBox.style.backgroundColor = color;
  colorBox.innerHTML = `<span>${color}</span>`;
  colorBox.onclick = () => openColorPicker(colorBox);

  return colorBox;
}

function updateUI(data) {
  console.log(data);
  const { colors, aiResponse, permalink } = data;
  console.log(colors);
  
  // Atualizar a paleta de cores
  const paletteContainer = document.getElementById('palette');
  paletteContainer.innerHTML = '';

  colors.forEach(color => {
    const colorBox = createColorBox(color);
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
    const paletteId = window.location.pathname.split('/')[2];
    if (paletteId) {
      await showPalette(paletteId);
      console.log(paletteId);
    }
    const predefinedFeelings = [
      "Pastel",
      "Vibrant",
      "Muted",
      "Earthy",
      "Jewel",
      "Neon",
      "Monochromatic",
      "Warm",
      "Cool",
      "Analogous",
      "Complementary",
      "Triadic"
      ]
  
    const feelingsCheckboxesContainer = document.getElementById("feelingsCheckboxes");
    predefinedFeelings.forEach(feeling => {
      const checkboxField = createCheckboxField(feeling);
      feelingsCheckboxesContainer.appendChild(checkboxField);
    });
  });
  
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
  
  function copyPermalinkToClipboard(event) {
    event.preventDefault();
    const linkElement = event.target;
  
    // Copie o texto do permalink para a área de transferência
    const textToCopy = linkElement.text;
    navigator.clipboard.writeText(textToCopy).then(
      () => {
        // Altere o texto do botão
        linkElement.textContent = "Link copied to clipboard";
  
        // Reverta para o texto original após alguns segundos
        setTimeout(() => {
          linkElement.textContent = textToCopy;
        }, 3000);
      },
      (err) => {
        console.error("Error copying permalink to clipboard:", err);
      }
    );
  }