// main.js

const htmlContent = `
<!DOCTYPE html>
<html>
  <head>
    <style>
      /* Estilos da interface do usuário do plugin */
    </style>
  </head>
  <body>
    <form id="palette-form">
      <label for="permalink">Permalink:</label>
      <input type="text" id="permalink" name="permalink" required />
      <button type="submit">Create Local Styles</button>
    </form>
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

figma.showUI(htmlContent, { width: 400, height: 300 });

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
    return data.palette;
  } else {
    return null;
  }
}

function createLocalStyles(palette) {
  return palette.map((color) => {
    return {
      name: color.name,
      paint: {
        type: 'SOLID',
        color: {
          r: color.r / 255,
          g: color.g / 255,
          b: color.b / 255,
        },
        opacity: color.a,
      },
    };
  });
}
