const backstop = require('backstopjs');
const fs = require('fs');
const csv = require('csv-parser');

const startTime = Date.now(); 

const urls = [];
console.log('Starting to read CSV file...'); 
fs.createReadStream('cleaned_urls.csv')
.pipe(csv())
.on('data', (data) => {
  let url;
  try {
    url = data['URL']
  } catch (err) {
    console.error('Error parsing URL on row:', data);
    return;
  }
  urls.push(url);
}) 
.on('error', (err) => {
  console.log('CSV parse error:', err);
})
.on('end', () => {
  console.log('CSV read done, total URLs:', urls.length);

  const scenarios = [];
urls.forEach(url => {
  scenarios.push({
    "label": url,
    "url": url, 
    "referenceUrl": url,
  });
});

console.log('Generated scenarios:', scenarios);

const backstopConfig = {
  "debug": true,
  "engine": "puppeteer",
  "engineOptions": {
      "args": ["--no-sandbox"],
      "ignoreHTTPSErrors": true,
      "headless": "new"
  },
  "report" : ["browser"],
  "engineScripts": [
      "chromy/clickAndHoverHelper.js",
      "chromy/delay.js" 
    ], 
  "viewports": [
      {
          "name": "xs",  
          "width": 575,
          "height": 768
      },
      {
          "name": "sm",  
          "width": 576,
          "height": 768
      },
      {
          "name": "md",
          "width": 768,
          "height": 1024 
      },
      {
          "name": "lg",
          "width": 992,
          "height": 768
      },
      {
          "name": "xl",
          "width": 1200,
          "height": 900
      }
      ],
  "paths": {
      "bitmaps_reference": "backstop_data/bitmaps_reference",
      "bitmaps_test": "backstop_data/bitmaps_test",
      "engine_scripts": "backstop_data/engine_scripts",
      "html_report": "backstop_data/html_report",
      "ci_report": "backstop_data/ci_report" 
  },
  "scenarios": scenarios
  }; 

  async function runBackstop() {
    console.log('Starting reference run...');
    await backstop('reference', {config: backstopConfig});
    
    console.log('Starting test run...');  
    await backstop('test', {config: backstopConfig});

    console.log('Generating report...');
    await backstop('openReport', {config: backstopConfig});
  }

  runBackstop().then(() => {
    const totalTime = Date.now() - startTime;
    console.log(`Total execution time: ${totalTime} ms`);
  });
});