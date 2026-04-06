const fs = require('fs');

const files = [
  'claude-oracle.yml',
  'claude-orchestrate.yml',
  'claude-release.yml',
  'claude-secrets-guard.yml',
  'claude-self-heal.yml',
  'claude-triage.yml',
  'copilot-setup-steps.yml',
  'gradle-publish.yml'
];

const data = {};
files.forEach(f => {
  if (fs.existsSync(f)) {
    data[f] = fs.readFileSync(f, 'utf8');
  }
});

fs.writeFileSync('src/data/workflows.json', JSON.stringify(data, null, 2));
