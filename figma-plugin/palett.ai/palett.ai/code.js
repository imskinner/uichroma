// main.js

const htmlContent = `
<!DOCTYPE html>
<html>
  <head>
    <style>
    @import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap");
    @import url("https://fonts.googleapis.com/css2?family=Epilogue:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Inter:wght@300;400;500;600;700;800;900&display=swap");

    body {
        font-family: "Inter", sans-serif;
        margin: 0px auto;
    }

    .wrap{
        padding: 24px;
        display: flex;
        flex-flow: column nowrap;
    }

    p {
        font-family: "Inter", sans-serif;
        font-weight: 400;
        margin-bottom: 12px;
        font-size: 14px;
        line-height: 18px;
    }

    h1, h2, h3, h4, h5, h6 {
    font-family: "Epilogue", sans-serif;
    font-weight: 700;
    }

    h3{
        font-size: 24px;
        margin: 0;
    }

    label {
    font-family: "Inter", sans-serif;
    font-weight: 500;
    font-size: 14px;
    line-height: 18px;
    letter-spacing: 0.02em;
    margin-bottom: 4px;
    color: #0060CC;
    }

.loader {
  border: 2px solid #CECCCA;
  border-top: 2px solid #0077FE;
  border-radius: 50%;
  display: none;
  width: 32px;
  height: 32px;
  animation: fadeIn 200ms ease-in;
  animation: spin 1s linear infinite;
  transition: display 200ms;
}

.logo{
    margin-bottom: 32px;
}

.inputText {
  display: flex;
  flex-flow: column;
  align-items: stretch;
  margin-bottom: 24px;
}
.inputText input[type=text] {
  padding: 16px;
  background: #FFFFFF;
  border: 1px solid #CECCCA;
  border-radius: 8px;
  font-family: "Inter", sans-serif;
  font-weight: 400;
  font-size: 16px;
  line-height: 24px;
}

button{
  padding: 20px 32px;
  border: 0px;
  background: #0077FE;
  border-radius: 8px;
  font-family: "Inter", sans-serif;
  font-weight: 500;
  font-size: 18px;
  line-height: 24px;
  color: #FFFFFF;
  cursor: pointer;
  text-decoration: none;
}
button:hover {
  background-color: #0060CC;
}

h1 {
  font-family: "Epilogue", sans-serif;
  font-weight: 700;
  font-size: 4rem;
  line-height: 48px;
  margin-bottom: 16px;
  margin-top: 0px;
  color: #1B1A18;
}


@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
@keyframes fadeIn {
  0% {
    opacity: 0%;
  }
  100% {
    opacity: 100%;
  }
}/*# sourceMappingURL=style.css.map */
    </style>
  </head>
  <body>
    
    <div class="wrap">
        <div class="logo">
            <img src="https://palett-ai.vercel.app/img/logo-palettai.png" alt="Pallet.ai" height="40">
        </div>
        <h3>Import your colors</h3>
    <p>Enter your palette id to import colors as Local Styles</p>
    <form id="palette-form">
        <div class="inputText">
            <label for="permalink">Palette ID</label>
            <input type="text" id="permalink" name="permalink" maxlength="32" placeholder="c1d0c6e83f027327d8468063f4ac58a6" required />
        </div> 
      
      <button type="submit">Create Local Styles</button>
    </form>
    </div>
    
    <script>
      // Funções para lidar com a entrada da paleta e enviar para o main.js
      document.getElementById('palette-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const permalink = document.getElementById('permalink').value;
        parent.postMessage(
          {
            pluginMessage: {
              type: 'fetch-palette',
              permalink,
            },
          },
          '*'
        );
      });
    </script>
  </body>
</html>






`;

figma.showUI(htmlContent, { width: 400, height: 400 });

figma.ui.onmessage = async (msg) => {
  if (msg.type === 'fetch-palette') {
    const { permalink } = msg;
    const palette = await fetchPalette(permalink);

    if (palette) {
      const styles = createLocalStyles(palette);

      styles.forEach((style) => {
        const paintStyle = figma.createPaintStyle();
        paintStyle.name = style.name;
        paintStyle.paints = [style.paint];
      });

      figma.notify('Local styles created successfully!');
    } else {
      figma.notify('Failed to fetch palette.');
    }

    figma.closePlugin();
  }
};

async function fetchPalette(permalink) {
  const response = await fetch('https://palett-ai.vercel.app/api/getPalette', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ permalink }),
  });

  if (response.ok) {
    const data = await response.json();
    console.log(data.palette.colors);
    return data.palette.colors;
  } else {
    return null;
  }
}

function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
  
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
  
    if (max === min) {
      h = s = 0; // achromatic
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
  
    return [h * 360, s * 100, l * 100];
  }

  function hslToRgb(h, s, l) {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
  
    h /= 360;
    s /= 100;
    l /= 100;
  
    let r, g, b;
  
    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }
  
    return [r * 255, g * 255, b * 255];
  }

  /*function createLocalStyles(colorArray) {
    // Função para gerar tons
    function generateTints(color, count) {
      const tints = [];
      const [h, s, l] = color;
      const step = (95 - 10) / (count - 1);
    
      for (let i = 0; i < count; i++) {
        let newL = 10 + step * i;
        if (Math.abs(newL - l) < step / 2) {
          newL = l;
        }
        tints.push([h, s, newL]);
      }
    
      return tints;
    }
    
  
    // Iterar sobre cada cor no array de cores
    colorArray.forEach((color, index) => {
      const r = parseInt(color.substring(1, 3), 16);
      const g = parseInt(color.substring(3, 5), 16);
      const b = parseInt(color.substring(5, 7), 16);
      const hsl = rgbToHsl(r, g, b);
      console.log(hsl[2]);
  
      // Gerar 10 tons (incluindo a cor original) para cada cor da paleta
      const tints = generateTints(hsl, 10);
      
  
      tints.forEach((hslTint, tintIndex) => {
        // Converter os valores HSL de volta para RGB
        const [newR, newG, newB] = hslToRgb(...hslTint);
  
        // Criar um novo estilo de cor local
        const localColorStyle = figma.createPaintStyle();

        const colorSuffix = [9,8,7,6,5,4,3,2,1,0];

        if (index === 0){
          localColorStyle.name = `Primary/${colorSuffix[tintIndex]}`;
        } else if (index === 1) {
          localColorStyle.name = `Secondary/${colorSuffix[tintIndex]}`
        } else if (index === 5){
          if (tintIndex === 0){
            localColorStyle.name = `Neutral/Black`
          } else {
            localColorStyle.name = `Neutral/${colorSuffix[tintIndex]}`
          }
        } else {
          localColorStyle.name = `Accent ${index - 1}/${colorSuffix[tintIndex]}`
        }

        if (tintIndex == 4 && index !=5){
          localColorStyle.name = `${localColorStyle.name} (default)`;
        }
  
        localColorStyle.paints = [
          {
            type: 'SOLID',
            color: {
              r: newR / 255,
              g: newG / 255,
              b: newB / 255,
            },
          },
        ];

      });
    });

    const generateWhites = () =>{
      const offWhiteColor = figma.createPaintStyle();
      offWhiteColor.name = `Neutral/Off-White`;
      offWhiteColor.paints = [
        {
          type: 'SOLID',
          color: {
            r: 250 / 255,
            g: 250 / 255,
            b: 250 / 255,
          },
        },
      ];
      const whiteColor = figma.createPaintStyle();
      whiteColor.name = `Neutral/White`;
      whiteColor.paints = [
        {
          type: 'SOLID',
          color: {
            r: 255 / 255,
            g: 255 / 255,
            b: 255 / 255,
          },
        },
      ];
      }

      return generateWhites();

  }*/

  function createLocalStyles(colorArray) {
    // Função para gerar tons
    function generateTints(color, count) {
      const tints = [];
      const [h, s, l] = color;
      const step = (95 - 10) / (count - 1);
  
      for (let i = 0; i < count; i++) {
        let newL = 10 + step * i;
        if (Math.abs(newL - l) < step / 2) {
          newL = l;
        }
        tints.push([h, s, newL]);
      }
  
      return tints;
    }
  
    // Iterar sobre cada cor no array de cores
    colorArray.forEach((color, index) => {
      const r = parseInt(color.substring(1, 3), 16);
      const g = parseInt(color.substring(3, 5), 16);
      const b = parseInt(color.substring(5, 7), 16);
      const hsl = rgbToHsl(r, g, b);
  
      // Gerar 10 tons (incluindo a cor original) para cada cor da paleta
      const tints = generateTints(hsl, 10);
  
      tints.forEach((hslTint, tintIndex) => {
        // Converter os valores HSL de volta para RGB
        const [newR, newG, newB] = hslToRgb(...hslTint);
  
        // Criar um novo estilo de cor local
        const localColorStyle = figma.createPaintStyle();
  
        const colorSuffix = [9, 8, 7, 6, 5, 4, 3, 2, 1, 0];
  
        if (index === 0) {
          localColorStyle.name = `Primary/${colorSuffix[tintIndex]}`;
        } else if (index === 1) {
          localColorStyle.name = `Secondary/${colorSuffix[tintIndex]}`;
        } else if (index === 5) {
          if (tintIndex === 0) {
            localColorStyle.name = `Neutral/Black`;
          } else {
            localColorStyle.name = `Neutral/${colorSuffix[tintIndex]}`;
          }
        } else {
          localColorStyle.name = `Accent ${index - 1}/${colorSuffix[tintIndex]}`;
        }
  
        // Adicionar "(default)" ao nome do localStyle da cor original
        if (hslTint[2] === hsl[2]) {
          localColorStyle.name = `${localColorStyle.name} (default)`;
        }
  
        localColorStyle.paints = [
          {
            type: 'SOLID',
            color: {
              r: newR / 255,
              g: newG / 255,
              b: newB / 255,
            },
          },
        ];
      });
    });
    const generateWhites = () =>{
      const offWhiteColor = figma.createPaintStyle();
      offWhiteColor.name = `Neutral/Off-White`;
      offWhiteColor.paints = [
        {
          type: 'SOLID',
          color: {
            r: 250 / 255,
            g: 250 / 255,
            b: 250 / 255,
          },
        },
      ];
      const whiteColor = figma.createPaintStyle();
      whiteColor.name = `Neutral/White`;
      whiteColor.paints = [
        {
          type: 'SOLID',
          color: {
            r: 255 / 255,
            g: 255 / 255,
            b: 255 / 255,
          },
        },
      ];
      }

      return generateWhites();

  }
