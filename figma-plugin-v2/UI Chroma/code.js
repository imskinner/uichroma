// Código revisado com inclusão da cor Neutral baseada na cor Primary no Plugin do Figma

figma.showUI(__html__, { width: 400, height: 600 });

// Function to load fonts safely
async function loadFont(fontName) {
  const [family, style] = fontName.split('-');
  try {
    await figma.loadFontAsync({ family, style });
  } catch (error) {
    console.error(`Failed to load font: ${family}, ${style}`, error);
    figma.notify(`Erro ao carregar a fonte: ${family}, ${style}`);
    throw error; // Stop execution if the font cannot be loaded
  }
}

// Function to create a text node with loaded font
async function createTextNode(characters, fontName, fontSize, fills) {
  const [family, style] = fontName.split('-');
  await figma.loadFontAsync({ family, style }); // Ensure the font is loaded
  const text = figma.createText();
  text.fontName = { family, style };
  text.characters = characters;
  text.fontSize = fontSize;
  text.fills = fills;
  return text;
}

figma.ui.onmessage = async (msg) => {
  if (msg.type === 'get-fonts') {
    const fonts = await figma.listAvailableFontsAsync();
    figma.ui.postMessage({ type: 'fonts', fonts });
  }

  if (msg.type === 'create-styles-components') {
    try {
      const newPage = figma.createPage();
      newPage.name = msg.projectName;
      await figma.setCurrentPageAsync(newPage);

      const shades = [95, 90, 80, 70, 60, 50, 40, 30, 20, 10];
      const neutralShades = [100, 95, 90, 80, 70, 60, 50, 40, 30, 20, 10, 5];
      const colorRules = {
        Primary: [0, 360],
        Secondary: [0, 360],
        Warning: [24, 54],
        Danger: [[0, 7], [350, 359]],
        Success: [70, 147],
        Info: [180, 235]
      };

      function hslToRgb(h, s, l) {
        let c = (1 - Math.abs(2 * l - 1)) * s;
        let x = c * (1 - Math.abs((h / 60) % 2 - 1));
        let m = l - c / 2;
        let r, g, b;
        if (h < 60) [r, g, b] = [c, x, 0];
        else if (h < 120) [r, g, b] = [x, c, 0];
        else if (h < 180) [r, g, b] = [0, c, x];
        else if (h < 240) [r, g, b] = [0, x, c];
        else if (h < 300) [r, g, b] = [x, 0, c];
        else [r, g, b] = [c, 0, x];
        return { r: r + m, g: g + m, b: b + m };
      }

      let primaryHue;

      // Create color styles
      for (const category in colorRules) {
        let hue;
        const rule = colorRules[category];
        if (Array.isArray(rule[0])) {
          const range = rule[Math.floor(Math.random() * rule.length)];
          hue = Math.random() * (range[1] - range[0]) + range[0];
        } else {
          hue = Math.random() * (rule[1] - rule[0]) + rule[0];
        }
        if (category === 'Primary') primaryHue = hue;

        for (const lightness of shades) {
          const style = figma.createPaintStyle();
          style.name = `Cor/${category}/${lightness}`;
          style.paints = [{ type: 'SOLID', color: hslToRgb(hue, 0.7, lightness / 100) }];
        }
      }

      // Create Neutral color styles
      for (const lightness of neutralShades) {
        const neutralStyle = figma.createPaintStyle();
        neutralStyle.name = `Cor/Neutral/${lightness}`;
        neutralStyle.paints = [{ type: 'SOLID', color: hslToRgb(primaryHue, 0.05, lightness / 100) }];
      }

      // Function to create a Button component with variations
      async function createButtonComponentWithVariants() {
        const buttonBase = figma.createComponent();
        buttonBase.layoutMode = "HORIZONTAL";
        buttonBase.primaryAxisSizingMode = "AUTO";
        buttonBase.counterAxisSizingMode = "AUTO";
        buttonBase.paddingLeft = 20;
        buttonBase.paddingRight = 20;
        buttonBase.paddingTop = 12;
        buttonBase.paddingBottom = 12;
        buttonBase.cornerRadius = 8;
        buttonBase.name = "Button";

        // Add text to the button
        const text = await createTextNode(
          "Button",
          msg.bodyFont,
          16,
          [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }] // Use white color for text
        );
        text.textAlignHorizontal = "CENTER";
        text.textAlignVertical = "CENTER";
        buttonBase.appendChild(text);

        // Retrieve local paint styles asynchronously
        const localPaintStyles = await figma.getLocalPaintStylesAsync();

        // Map styles to categories
        const styleMap = {};
        for (const style of localPaintStyles) {
          const [category, lightness] = style.name.split('/').slice(1);
          if (!styleMap[category]) styleMap[category] = {};
          styleMap[category][lightness] = style;
        }

        // Create variants for each style and state
        const styles = [
          { name: "Primary", style: styleMap["Primary"]["50"] },
          { name: "Secondary", style: styleMap["Secondary"]["50"] },
          { name: "Danger", style: styleMap["Danger"]["50"] }
        ];
        const states = [
          { name: "Default", modifier: (style) => styleMap[style.name]["50"] },
          { name: "Hover", modifier: (style) => styleMap[style.name]["30"] },
          { name: "Active", modifier: (style) => styleMap[style.name]["20"] },
          { name: "Disabled", modifier: (style) => styleMap[style.name]["70"] }
        ];

        const variants = [];
        for (const style of styles) {
          for (const state of states) {
            const variant = buttonBase.clone();
            variant.name = `${style.name}/${state.name}`;
            await variant.setFillStyleIdAsync(state.modifier(style).id); // Assign modified style
            variants.push(variant);
          }
        }

        // Remove the original buttonBase component after creating variants
        buttonBase.remove();

        // Combine all variants into a single variants group
        const buttonVariants = figma.combineAsVariants(variants, figma.currentPage);
        buttonVariants.name = "Button";

        // Organize buttons in a grid
        let x = 0, y = 0;
        const gridSpacing = 150;
        buttonVariants.children.forEach((variant, index) => {
          variant.x = x;
          variant.y = y;
          x += gridSpacing;
          if ((index + 1) % 4 === 0) { // Move to the next row after 4 buttons
            x = 0;
            y += gridSpacing;
          }
        });

        // Resize the group to fit all variants in the grid
        const gridWidth = 4 * gridSpacing; // 4 buttons per row
        const gridHeight = Math.ceil(buttonVariants.children.length / 4) * gridSpacing;
        buttonVariants.resize(gridWidth, gridHeight);

        return buttonVariants;
      }

      // Ensure only the grouped variants are added to the page
      const buttonWithVariants = await createButtonComponentWithVariants();
      newPage.appendChild(buttonWithVariants);

      figma.notify('Estilos e componentes criados com sucesso!');
    } catch (error) {
      console.error(error);
      figma.notify('Erro ao criar estilos e componentes. Verifique o console.');
    }
  }
};
