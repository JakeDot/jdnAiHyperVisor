const https = require('https');
const fs = require('fs');

const files = [
  'android-conventions.yml',
  'false-positives.yml',
  'gemini-integration.yml',
  'wherigo-protocol.yml'
];

const baseUrl = 'https://raw.githubusercontent.com/JakeDot/jourwigo-android/6c4afba86c40393daae47b2613b6f45b1dc315d6/.github/agents/memory/';

let completed = 0;
const data = {};

files.forEach(file => {
  https.get(baseUrl + file, (resp) => {
    let content = '';
    resp.on('data', (chunk) => { content += chunk; });
    resp.on('end', () => {
      data[file] = content;
      completed++;
      if (completed === files.length) {
        fs.writeFileSync('src/data/memory.json', JSON.stringify(data, null, 2));
        console.log('Saved memory files');
      }
    });
  }).on("error", (err) => {
    console.log("Error: " + err.message);
  });
});
