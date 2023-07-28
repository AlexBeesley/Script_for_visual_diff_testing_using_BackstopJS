const backstop = require('backstopjs');
const fs = require('fs');
const csv = require('csv-parser');

const startTime = Date.now();
const urls = [];
console.log('Starting to read CSV file...');

fs.createReadStream('cleaned_urls.csv')
  .pipe(csv())
  .on('data', (data) => {
    const url = data['URL'];
    if (url) {
      urls.push(url);
    } else {
      console.warn('Missing URL on row:', data);
    }
  })
  .on('error', (err) => {
    console.error('CSV parse error:', err);
  })
  .on('end', async () => {
    console.log('CSV read done, total URLs:', urls.length);

const scenarios = urls.map(url => {
      return {
        "label": url,
        "url": url,
        "referenceUrl": url,
      };
    });

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
          // {
          //     "name": "xs",  
          //     "width": 575,
          //     "height": 768
          // },
          // {
          //     "name": "sm",  
          //     "width": 576,
          //     "height": 768
          // },
          // {
          //     "name": "md",
          //     "width": 768,
          //     "height": 1024 
          // },
          // {
          //     "name": "lg",
          //     "width": 992,
          //     "height": 768
          // },
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

    const runBackstopCommand = async (command) => {
      try {
        console.log(`Starting ${command} run...`);
        await backstop(command, {config: backstopConfig});
      } catch (err) {
        console.error(`Error during ${command} run:`, err);
      }
    };

    await runBackstopCommand('reference');
    await runBackstopCommand('test');

    try {
      console.log('Generating report...');
      await runBackstopCommand('report');
    } catch (err) {
      console.error('Error generating report:', err);
    }

    const totalTime = Date.now() - startTime;
    console.log(`Total execution time: ${totalTime} ms`);
  });