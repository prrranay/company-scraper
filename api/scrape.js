// api/scrape.js
const fetcher = require('../fetcher');
const parser  = require('../parser');
const utils   = require('../utils');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).send({ error: 'Only POST allowed' });
  }

  const { seeds, level = 1 } = req.body || {};
  if (!Array.isArray(seeds) || seeds.length === 0) {
    return res.status(400).json({ error: 'seeds must be a non-empty array' });
  }
  const lvl = parseInt(level, 10) === 2 ? 2 : 1;
  const results = [];

  for (const url of seeds) {
    if (!utils.isValidURL(url)) {
      results.push({ website: url, error: 'Invalid URL' });
      continue;
    }
    try {
      const html = await fetcher.getHTML(url);
      const data = parser.extractBasic(html, url);
      if (lvl === 2) Object.assign(data, parser.extractLevel2(html));
      results.push(data);
    } catch (err) {
      results.push({ website: url, error: err.message });
    }
  }

  res.status(200).json(results);
};
