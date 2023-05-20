require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');
const crypto = require('crypto');

const app = express();

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/css', express.static(path.join(__dirname, 'public', 'css')));
app.use('/img', express.static(path.join(__dirname, 'public', 'img')));
app.use(bodyParser.json());

const dbConfig = {
  connectionString: process.env.POSTGRES_URL,
};

const pool = new Pool(dbConfig);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Get a palette from database
async function getPaletteFromDatabase(permalink) {
  try {
    const query = 'SELECT * FROM palettes WHERE permalink = $1';
    const { rows } = await pool.query(query, [permalink]);
    
    if (rows.length > 0) {
      const palette = rows[0];
      const colors = JSON.parse(palette.colors);
      const aiResponse = palette.ai_response;
      
      return { colors, aiResponse };
    } else {
      return null;
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    return null;
  }
}

//API Endpoint to return the palette to the Figma Plugin
app.post('/api/getPalette', async (req, res) => {
  const { permalink } = req.body;
  try {
    const palette = await getPaletteFromDatabase(permalink);
    res.json({ palette });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch palette.' });
  }
});

//Endpoint to Generate the palette from the prompts
app.post('/generatePalette', async (req, res) => {
  try {
    const feelings = req.body.feelings;
    const { colors, aiResponse } = await generateColorPalette(feelings);
    
    const query = 'INSERT INTO palettes (keywords, colors, ai_response, created_at) VALUES ($1, $2, $3, $4) RETURNING id';
    const dateAndTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    // Insert on database and obtain the ID
    const { rows } = await pool.query(query, [feelings, JSON.stringify(colors), aiResponse, dateAndTime]);
    const generatedId = rows[0].id;
    
    // Generate MD5 hash based on ID
    const md5 = crypto.createHash('md5');
    const permalink = md5.update(generatedId.toString()).digest('hex');
    
    // Update palette entry on database to insert permalink
    const updateQuery = 'UPDATE palettes SET permalink = $1 WHERE id = $2';
    await pool.query(updateQuery, [permalink, generatedId]);
    
    res.json({ permalink, colors, aiResponse });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while generating the palette.' });
  }
});

//Endpoint to fetch a palette data
app.get('/palette/:permalink/data', async (req, res) => {
  try {
    const permalink = req.params.permalink;
    const query = 'SELECT * FROM palettes WHERE permalink = $1';
    
    const { rows } = await pool.query(query, [permalink]);
    
    if (rows.length > 0) {
      const palette = rows[0];
      const colors = JSON.parse(palette.colors);
      const aiResponse = palette.ai_response;
      
      res.json({ colors, aiResponse });
    } else {
      res.status(404).json({ error: 'Palette not found.' });
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    res.status(500).json({ error: 'An error occurred while fetching the palette data.' });
  }
});

//Render the palette.html as the template for an existing palette
app.get('/palette/:permalink', async (req, res) => {
  res.sendFile(path.join(__dirname,'public', 'palette.html'));
});

async function generateColorPalette(feelings) {
  const apiKey = process.env.API_KEY;
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
          content: `Generate an 8 color palette suitable for user interface design based on the keywords "${feelings}". The palette must contain:
          - A primary color that should be eye-catching and able to stand out. 
          - A secondary color that can complement the primary color. 
          - Two accent colors that are elegant and attractive, but not overpowering or clashing with the primary and secondary colors, can't be gray, white or black.
          - A warning color that should be able to clearly communicate caution or the need for attention.
          - A danger color that is capable of signaling errors or serious issues. It should be vivid and easily noticeable.
          - A success color that indicates positive outcomes or states. It should evoke a sense of positivity and accomplishment.
          - A neutral blackish color, which can be used for text. It should be easy to read against a white or light background.
        
          Each color should have a different hue. Please provide the colors in the Hex color code format. Format your response as HTML, similar to the example below:
          <h3>Here's a color palette that might work well for your design:</h3>
          <ul>
          <li>Primary color: #XXXXXX (This color is a warm grape hue that evokes feelings of luxury and relaxation, perfect for a wellness app.).</li>
          <li>Secondary color: #XXXXXX (quick explanation).</li>
          <li>Accent color 1: #XXXXXX (quick explanation).</li>
          <li>Accent color 2: #XXXXXX (quick explanation).</li>
          <li>Warning color: #XXXXXX (quick explanation).</li>
          <li>Danger color: #XXXXXX (quick explanation).</li>
          <li>Success color: #XXXXXX (quick explanation).</li>
          <li>Neutral color: #XXXXXX (quick explanation).</li>
          </ul>
          <p class="explanation">
          This color palette should give your design a nice, forest-inspired feel, while also conveying a sense of trust and reliability for an investments app.
          </p>
          `,
        },
        /*{
          role: "user",
          content:`
          Create a 6-color palette for a user interface design based on the following keywords: ${feelings}. Consider the following guidelines:
          - Use HSL (Hue, Saturation, Lightness) for color generation.
          - Choose primary and secondary colors with hues associated with the feelings keyword and set their lightness to around 50 in HSL.
          - Select complementary accent colors suitable for UI elements, warnings, alerts, and states.
          - Include a neutral dark color or black as the sixth color for text in the UI. Hue and Saturation can differ from 0 to tone it a bit.
          - Ensure all colors have distinct hues and harmonize well together to create an elegant palette.
          - Ensure all colors are different in hue or saturation.
          - Colors must be elegant.
          
          Provide the hexadecimal values and explanations for each color. Format your response as HTML, similar to the example below:
          
          <h3>Here's a color palette that might work well for your design:</h3>
          <ul>
          <li>Primary color: #XXXXXX (This color is a warm grape hue that evokes feelings of luxury and relaxation, perfect for a wellness app.).</li>
          <li>Secondary color: #XXXXXX (quick explanation).</li>
          <li>Accent color 1: #XXXXXX (quick explanation).</li>
          <li>Accent color 2: #XXXXXX (quick explanation).</li>
          <li>Accent color 3: #XXXXXX (quick explanation).</li>
          <li>Neutral color: #XXXXXX (quick explanation).</li>
          </ul>
          <p class="explanation">
          This color palette should give your design a nice, forest-inspired feel, while also conveying a sense of trust and reliability for an investments app.
          </p>
          `
        }*/
      ],
      max_tokens: 600,
      n: 1,
      stop: null,
      temperature: 0.65,
    })
  });
  
  if (response.ok) {
    const data = await response.json();
    
    if (data.choices && data.choices.length > 0) {
      const hexColorRegex = /#(?:[0-9a-fA-F]{3}){1,2}\b/g;
      const colors = data.choices[0].message.content.match(hexColorRegex);
      
      const aiResponse = data.choices[0].message.content;
      
      if (colors && colors.length > 0) {
        return { colors, aiResponse };
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

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

