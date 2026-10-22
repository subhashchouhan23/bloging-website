const fs = require('fs');
const path = require('path');

// ---- read input ----
const file = process.argv[2];
if (!file) {
  console.error('ERR', 'usage: node example.js <file>');
  process.exit(1);
}

const buf = fs.readFileSync(file);
const text = buf.toString('utf8');

// ---- count lines ----
function countLines(value) {
  const parts = value.split('\n');
  if (parts[parts.length - 1] === '') parts.pop();
  return parts.length;
}

console.log(path.basename(file), countLines(text));
