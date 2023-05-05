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

function createLocalStyles(colorArray) {
    // Iterar sobre cada cor no array de cores
    colorArray.forEach((color, index) => {
      // Criar um novo estilo de cor local
      const localColorStyle = figma.createPaintStyle();
  
      // Configurar o nome e a cor do estilo
      if(index==0){localColorStyle.name = `Primary`;}
      if(index==1){localColorStyle.name = `Secondary`;}
      if(index>1){localColorStyle.name = `Accent ${index - 1}`;}
      
      localColorStyle.paints = [
        {
          type: 'SOLID',
          color: {
            r: parseInt(color.substring(1, 3), 16) / 255,
            g: parseInt(color.substring(3, 5), 16) / 255,
            b: parseInt(color.substring(5, 7), 16) / 255,
          },
        },
      ];
    });
  }
