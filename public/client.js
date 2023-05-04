  function updateUI(data) {
    console.log(data);
    const { colors, aiResponse } = data;
    console.log(colors);
    // Atualizar a paleta de cores
    const paletteContainer = document.getElementById('palette');
    paletteContainer.innerHTML = '';

    colors.forEach(color => {
    const colorBox = document.createElement('div');
    colorBox.className = 'color-box';
    colorBox.style.backgroundColor = color;
    colorBox.innerHTML = `<span>${color}</span>`;
    paletteContainer.appendChild(colorBox);
  });

  // Atualizar a resposta da IA
    const responseContainer = document.getElementById('response-container');
    responseContainer.innerHTML = aiResponse;
  }
  
  document.getElementById('generate').addEventListener('click', async () => {

    const loader = document.getElementById("loader");
    document.getElementById("response-container").innerHTML = "";
    loader.style.display = "inline-block"; // Show loader

    const feelingsInput = document.getElementById('feelings').value;
    const checkboxes = document.querySelectorAll('#feelingsCheckboxes input:checked');
    let checkedFeelings = '';
  
    checkboxes.forEach((checkbox) => {
      checkedFeelings += ` ${checkbox.value}`;
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
  });

  document.addEventListener('DOMContentLoaded', () => {
    const predefinedFeelings = [
        "Energetic",  "Mysterious",  "Confident",  "Peaceful",  "Romantic",  "Bold",  "Cheerful",  "Serene",  "Intense",  "Elegant",  "Joyful",  "Powerful",  "Refreshing",  "Harmonious",  "Vibrant",  "Sophisticated"
      ];
      
      const feelingsCheckboxesContainer = document.getElementById("feelingsCheckboxes");
      predefinedFeelings.forEach(feeling => {
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.id = `feeling-${feeling}`;
        checkbox.value = feeling;
      
        const label = document.createElement("label");
        label.htmlFor = `feeling-${feeling}`;
        label.textContent = feeling;
    
        const checkboxField = document.createElement("div");
        checkboxField.class = "checkboxField";
    
        checkboxField.appendChild(checkbox);
        checkboxField.appendChild(label);
        feelingsCheckboxesContainer.appendChild(checkboxField);
      });
  });
  
  