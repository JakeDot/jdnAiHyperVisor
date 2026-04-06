const fs = require('fs');

const memoryData = JSON.parse(fs.readFileSync('src/data/memory.json', 'utf8'));

fs.mkdirSync('.github/agents/memory', { recursive: true });

Object.entries(memoryData).forEach(([filename, content]) => {
  fs.writeFileSync(`.github/agents/memory/${filename}`, content);
});
console.log('Memory files created');
