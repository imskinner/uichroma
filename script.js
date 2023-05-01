document.getElementById("generate").addEventListener("click", async () => {
    const loader = document.getElementById("loader");
    loader.style.display = "inline-block"; // Show loader

    const selectedFeelings = predefinedFeelings.filter(feeling => {
        return document.getElementById(`feeling-${feeling}`).checked;
    });


    const feelingsInput = document.getElementById("feelings");
    const customFeelings = feelingsInput.value.trim();
    const paletteContainer = document.getElementById("palette");
    paletteContainer.innerHTML = ""; // Clear previous colors
  
    const feelings = selectedFeelings.concat(customFeelings ? customFeelings.split(',') : []);
    if (!feelings) {
      alert("Por favor, insira os sentimentos.");
      return;
    }
  
    const colors = await generateColorPalette(feelings);
    loader.style.display = "none"; // Hide loader
    
    if (colors.length > 0) {
      colors.forEach(color => {
        const colorBox = document.createElement("div");
        colorBox.className = "color-box";
        colorBox.style.backgroundColor = color;
        colorBox.textContent = color;
        paletteContainer.appendChild(colorBox);
      });
    } else {
      alert("Não foi possível gerar a paleta de cores. Por favor, tente novamente.");
    }
  });

  const predefinedFeelings = [
    "Innovative", "Authentic", "Dynamic", "Passionate", "Bold",
    "Creative", "Empowering", "Reliable", "Trustworthy", "Accessible",
    "Ambitious", "Sophisticated", "Charismatic", "Vibrant", "Visionary",
    "Energetic", "Playful", "Engaging", "Genuine", "Inclusive"
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
  
    feelingsCheckboxesContainer.appendChild(checkbox);
    feelingsCheckboxesContainer.appendChild(label);
    feelingsCheckboxesContainer.appendChild(document.createElement("br"));
  });
  
  async function generateColorPalette(feelings) {
    const apiKey = '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';
    const prompt = `
    Generate 5 colors based on keywords: "${feelings}". 
    Colors are to be used in Mobile App UI, so they should have a primary color, a secondary color and accent colors, following best aesthetic practices.
    Provide the colors in hexadecimal format.
    Colors must be elegant.
    Can't be monotone.
    Primary color should always have a lightness (HSL) of 50.
    Show result as a list ordered by color tones.`;
  
    try {
      const response = await fetch('https://api.openai.com/v1/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          prompt: prompt,
          model: "text-davinci-003",
          max_tokens: 500,
          n: 1,
          stop: null,
          temperature: 0.4,
        })
      });
  
      if (response.ok) {
        const data = await response.json();
  
        if (data.choices && data.choices.length > 0) {
          const hexColorRegex = /#(?:[0-9a-fA-F]{3}){1,2}\b/g;
          const colors = data.choices[0].text.match(hexColorRegex);
  
          if (colors && colors.length > 0) {
            return colors;
          } else {
            console.error('Error: Unable to extract colors from the API response');
            return [];
          }
        } else {
          console.error('Error: API response does not contain the expected "choices" property');
          return [];
        }
      } else {
        const errorData = await response.json();
        console.error(`Error: API returned status ${response.status} - ${errorData.error.message}`);
        return [];
      }
    } catch (error) {
        console.error(`Error: ${error.message}`);
        return [];
      }
    }
    
  