const axios = require('axios');

async function getHTML(url) {
  try {
    const resp = await axios.get(url, { timeout: 10000 });
    return resp.data;
  } catch (err) {
    const msg = err.response
      ? `HTTP ${err.response.status}`
      : err.code || err.message;
    throw new Error(`Fetch failed (${msg})`);
  }
}

module.exports = { getHTML };
