const https = require('https');
const fs = require('fs');

const files = [
  'claude-oracle.yml',
  'claude-orchestrate.yml',
  'claude-release.yml',
  'claude-secrets-guard.yml',
  'claude-self-heal.yml',
  'claude-triage.yml',
  'copilot-setup-steps.yml'
];

const baseUrl = 'https://raw.githubusercontent.com/JakeDot/jourwigo-android/6c4afba86c40393daae47b2613b6f45b1dc315d6/.github/workflows/';

files.forEach(file => {
  https.get(baseUrl + file, (resp) => {
    let data = '';
    resp.on('data', (chunk) => { data += chunk; });
    resp.on('end', () => {
      fs.writeFileSync(file, data);
      console.log('Saved ' + file);
    });
  }).on("error", (err) => {
    console.log("Error: " + err.message);
  });
});
