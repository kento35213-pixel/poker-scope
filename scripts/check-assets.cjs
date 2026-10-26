const fs = require('node:fs');
for (const file of ['index.html','style.css','icon.svg','app.js','engine.js','study.js','worker.js']) {
  if (!fs.statSync('dist/' + file).isFile()) throw new Error('Missing asset: ' + file);
}
console.log('dist/ is ready. No compilation needed.');
