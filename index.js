#!/usr/bin/env node

const fs      = require('fs');
const { program }  = require('commander');
const fetcher = require('./fetcher');
const parser  = require('./parser');
const output  = require('./output');
const utils   = require('./utils');

program
  .option('-q, --query <string>', 'search query (not implemented)')
  .option('-s, --seeds <file>',   'text file with one URL per line')
  .option('-l, --level <number>', 'extraction level (1 or 2)', '1')
  .option('-f, --format <json|csv>','output format', 'json')
  .parse(process.argv);

// grab all flags here
const options = program.opts();

// if no --seeds but seeds.txt exists, use it
if (!options.seeds && fs.existsSync('seeds.txt')) {
  options.seeds = 'seeds.txt';
}

// now guard
if (!options.seeds && !options.query) {
  console.error('Error: you must supply --seeds <file> or --query "<text>"');
  process.exit(1);
}

// normalize level to integer
options.level = parseInt(options.level, 10);
if (![1,2].includes(options.level)) {
  console.warn(`Invalid level "${options.level}", defaulting to 1`);
  options.level = 1;
}

// quick confirmation
console.log('Extraction level:', options.level);
console.log('Seeds file:    ', options.seeds);
console.log('Output format: ', options.format);

(async () => {
  let seeds = [];

  if (options.seeds) {
    seeds = utils.loadSeeds(options.seeds);
  } else {
    console.error('Search-query mode not implemented.');
    process.exit(1);
  }

  const results = [];
  for (const url of seeds) {
    if (!utils.isValidURL(url)) {
      console.warn(`Skipping invalid URL: ${url}`);
      continue;
    }
    try {
      const html = await fetcher.getHTML(url);
      const data = parser.extractBasic(html, url);

      if (options.level >= 2) {
        console.log(` → Running Level 2 parser on ${url}`);
        Object.assign(data, parser.extractLevel2(html));
      }

      console.log('Result:', data);
      results.push(data);
    } catch (err) {
      console.warn(`Error processing ${url}: ${err.message}`);
    }
  }

  output.write(results, options.format);
})();
