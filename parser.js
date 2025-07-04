const cheerio = require('cheerio');

function extractBasic(html, url) {
  const $ = cheerio.load(html);
  const name =
    $('meta[property="og:site_name"]').attr('content') ||
    $('h1').first().text().trim() ||
    new URL(url).hostname;

  const bodyText = $('body').text();

  // Emails (unchanged)
  const emails = [...bodyText.matchAll(
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z]{2,}\b/gi
  )].map(m => m[0]);

  // Phones (improved)
  const rawPhones = [...bodyText.matchAll(
    /(\+?\d[\d\-\s\(\)]{7,}\d)/g
  )].map(m => m[1]);

  const phones = rawPhones
    .filter(p => {
      // filter out date‐like strings
      if (/\b\d{2}-\d{2}-\d{4}\b/.test(p) ||
          /\b\d{4}-\d{2}-\d{2}\b/.test(p)) {
        return false;
      }
      // ensure a realistic digit count
      const digitCount = (p.match(/\d/g) || []).length;
      return digitCount >= 9 && digitCount <= 15;
    })
    .map(p => p.trim());

  return {
    name,
    website: url,
    emails: Array.from(new Set(emails)),
    phones: Array.from(new Set(phones)),
  };
}

function extractLevel2(html) {
  const $ = cheerio.load(html);
  const data = {};

  // --- Social profiles ---
  data.linkedin = $('a[href*="linkedin.com/company"], a[href*="linkedin.com/in"]')
    .first().attr('href') || null;
  data.twitter = $('a[href*="twitter.com/"]')
    .first().attr('href') || null;

  // --- Physical address ---
  let addr = $('address').text().trim();
  if (!addr) {
    const match = html.match(
      /<p[^>]*>([\s\S]{0,200}?(?:Street|St\.|Road|Rd\.|Avenue|Ave\.|Boulevard|Blvd\.)[\s\S]{0,200}?)<\/p>/i
    );
    if (match) addr = cheerio.load(match[1]).text().trim();
  }
  data.address = addr || null;

  // --- Overview / Tagline ---
  data.overview =
    $('meta[name="description"]').attr('content') ||
    $('meta[property="og:description"]').attr('content') ||
    $('p').first().text().trim() ||
    null;

  // --- Year founded ---
  const bodyText = $('body').text();
  const fy = (bodyText.match(/\b[Ff]ounded\s+(?:in\s+)?(19|20)\d{2}\b/) || [])[0];
  data.founded = fy ? fy.replace(/[^\d]/g, '') : null;

  // --- Operational status ---
  const statusText = bodyText.slice(0, 1000).toLowerCase();
  if (/defunct|closed|ceased/i.test(statusText)) {
    data.status = 'Defunct/Closed';
  } else if (/active|operational|in operation|serving/i.test(statusText)) {
    data.status = 'Active';
  } else {
    data.status = null;
  }

  // --- Products / Services ---
  const products = [];
  $('h2, h3').each((i, el) => {
    const hdr = $(el).text().toLowerCase();
    if (/\b(products|services)\b/.test(hdr)) {
      const nxt = $(el).next();
      if (nxt.is('ul')) {
        nxt.find('li').each((i, li) => products.push($(li).text().trim()));
      } else if (nxt.is('p')) {
        products.push(nxt.text().trim());
      }
    }
  });
  data.products = products.length ? products : null;

  // --- Industry / Market sector ---
  data.industry =
    $('meta[name="industry"]').attr('content') ||
    (bodyText.match(/\b(Healthcare|Finance|Technology|Retail|Manufacturing|Education)\b/) || [null])[0];

  return data;
}

module.exports = { extractBasic, extractLevel2 };
