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

function createColorBox(color) {
  const colorBox = document.createElement('div');
  colorBox.className = 'color-box';
  colorBox.style.backgroundColor = color;
  colorBox.innerHTML = `<span>${color}</span>`;
  
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

if(!(window.location.pathname.split('/')[2])){
document.getElementById('generate').addEventListener('click', async () => {
  const loader = document.getElementById("loader");
  document.getElementById("response-container").innerHTML = "";
  document.getElementById("placeholder-template").innerHTML = "";
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
  updateUI(data);
})};

document.addEventListener('DOMContentLoaded', async () => {
  const paletteId = window.location.pathname.split('/')[2];
  if (paletteId) {
    await showPalette(paletteId);
    console.log(paletteId);
  }
  const predefinedFeelings = [
    "Energetic", "Mysterious", "Confident", "Peaceful", "Romantic", "Bold", "Cheerful", "Serene", "Intense", "Elegant", "Joyful", "Powerful", "Refreshing", "Harmonious", "Vibrant", "Sophisticated"
  ];

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
