// server.js
const express    = require('express');
const bodyParser = require('body-parser');
const fetcher    = require('./fetcher');
const parser     = require('./parser');
const utils      = require('./utils');

const app = express();
app.use(bodyParser.json());
app.use(express.static('public')); // serve our HTML/JS

app.post('/scrape', async (req, res) => {
  const { seeds, level = 1 } = req.body;
  if (!Array.isArray(seeds) || !seeds.length) {
    return res.status(400).json({ error: 'seeds must be a non-empty array' });
  }
  const lvl = parseInt(level, 10) === 2 ? 2 : 1;
  const results = [];

  for (const url of seeds) {
    if (!utils.isValidURL(url)) continue;
    try {
      const html = await fetcher.getHTML(url);
      const data = parser.extractBasic(html, url);
      if (lvl === 2) {
        Object.assign(data, parser.extractLevel2(html));
      }
      results.push(data);
    } catch (err) {
      // skip errors
      results.push({ website: url, error: err.message });
    }
  }

  res.json(results);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
