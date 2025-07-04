const fs = require('fs');
const { URL } = require('url');

function isValidURL(u) {
  try {
    new URL(u);
    return true;
  } catch {
    return false;
  }
}

function loadSeeds(filePath) {
  return fs.readFileSync(filePath, 'utf-8')
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(Boolean);
}

module.exports = { isValidURL, loadSeeds };
