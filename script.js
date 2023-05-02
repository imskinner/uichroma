document.getElementById("generate").addEventListener("click", async () => {
    const loader = document.getElementById("loader");
    loader.style.display = "inline-block"; // Show loader

    const selectedFeelings = predefinedFeelings.filter(feeling => {
        return document.getElementById(`feeling-${feeling}`).checked;
    });


    const feelingsInput = document.getElementById("feelings");
    const customFeelings = feelingsInput.value.trim();
    const paletteContainer = document.getElementById("palette");
    paletteContainer.innerHTML = "";
    document.getElementById("response-container").innerHTML = "" // Clear previous colors
  
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
        colorBox.innerHTML = `<span>${color}</span>`;
        paletteContainer.appendChild(colorBox);
      });
    } else {
      alert("Não foi possível gerar a paleta de cores. Por favor, tente novamente.");
    }
  });

  

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
  
  async function generateColorPalette(feelings) {
    const apiKey = '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';
    /**const prompt = `
    Generate 5 colors based on keywords: "${feelings}". 
    Colors are to be used in Mobile App UI, so they should have a primary color, a secondary color and accent colors, following best aesthetic practices.
    Provide the colors in hexadecimal format.
    Colors must be elegant.
    Can't be monotone.
    Primary color should always have a lightness (HSL) of 50.
    Show result as a list ordered by color tones."`;**/
  
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are a helpful assistant that generates color palettes based on feelings for mobile app UIs."
            },
            {
              role: "user",
              content: `Generate a color palette of 5 colors based on the keywords and/or traits: ${feelings}. 
              The colors are to be used in App UI, so they should have a primary color, a secondary color, and accent colors.
              Provide the colors in hexadecimal format.
              Make sure colors match and are elegant.
              Primary color should always have a lightness (HSL) of 50.
              Provide the response as you would but as HTML like the following example:"
              <h3>Here's a color palette that might work well for your app UI:</h3>
              <ul>
                <li>Primary color: #3B7D57 (a deep green color that evokes a sense of peace and calmness, reminiscent of a lush forest).</li>
                <li>Secondary color: #D3D0CB (a light gray color that complements the primary color and adds a touch of elegance).</li>
                <li>Accent color 1: #F2C57C (a warm, sandy color that suggests stability and reliability, perfect for an investments app).</li>
                <li>Accent color 2: #6E8E59 (a muted green color that adds depth and contrast to the palette, and works well with the primary color).</li>
                <li>Accent color 3: #E8E1D7 (a light beige color that softens the palette and provides a neutral background for the other colors).</li>
                </ul>
                <p class="explanation">
                  This color palette should give your app UI a peaceful, forest-inspired feel, while also conveying a sense of trust and reliability for an investments app.
                </p>`
            }
          ],
          max_tokens: 600,
          n: 1,
          stop: null,
          temperature: 0.8,
        })
      });
  
      if (response.ok) {
        const data = await response.json();
        const responseContainer = document.getElementById("response-container");
  
        if (data.choices && data.choices.length > 0) {
          const hexColorRegex = /#(?:[0-9a-fA-F]{3}){1,2}\b/g;
          const colors = data.choices[0].message.content.match(hexColorRegex);

          responseContainer.innerHTML = "";
          responseContainer.innerHTML = data.choices[0].message.content;
        
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
    
  