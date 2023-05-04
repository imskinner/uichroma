require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/css', express.static(path.join(__dirname, 'public', 'css')));
app.use('/img', express.static(path.join(__dirname, 'public', 'img')));
app.use(bodyParser.json());

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
  });

  app.post('/generatePalette', async (req, res) => {
    try {
      const feelings = req.body.feelings;
      const { colors, aiResponse } = await generateColorPalette(feelings);
  
      const db = await mysql.createConnection(dbConfig);
      const query = 'INSERT INTO palettes (keywords, colors, ai_response, created_at) VALUES (?, ?, ?, ?)';
      const dateAndTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
  
      await db.execute(query, [feelings, JSON.stringify(colors), aiResponse, dateAndTime]);
  
      res.json({ colors, aiResponse });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred while generating the palette.' });
    }
  });


app.get('/palette/:paletteId', async (req, res) => {
  try {
    const paletteId = req.params.paletteId;
    const db = await mysql.createConnection(dbConfig);
    const query = 'SELECT * FROM palettes WHERE id = ?';

    const [rows] = await db.execute(query, [paletteId]);

    if (rows.length > 0) {
      const palette = rows[0];
      const colors = palette.colors.split(',');
      const aiResponse = palette.ai_response;
      res.json({ colors, aiResponse });
    } else {
      res.status(404).json({ error: 'Palette not found.' });
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    res.status(500).json({ error: 'An error occurred while fetching the palette.' });
  }
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
              content: "You are a helpful assistant that generates color palettes based on keywords and traits for app UIs."
            },
            {
              role: "user",
              content: `Generate a color palette of 5 colors based on the keywords and/or traits: ${feelings}. 
              The colors are to be used in App UI, so they should have a primary color, a secondary color, and accent colors.
              Provide the colors in hexadecimal format.
              Make sure colors match and are elegant.
              Avoid White, Black or Shades of Grey as accent colors.
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
