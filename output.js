const fs = require('fs');
const { Parser } = require('json2csv');

function write(data, format) {
  if (!data.length) {
    console.log('No results to write.');
    return;
  }
  if (format === 'csv') {
    const parser = new Parser();
    fs.writeFileSync('output.csv', parser.parse(data));
    console.log('Saved output.csv');
  } else {
    fs.writeFileSync('output.json', JSON.stringify(data, null, 2));
    console.log('Saved output.json');
  }
}

module.exports = { write };
