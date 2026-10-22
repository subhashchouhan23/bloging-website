const fs = require('fs');

// ---- input ----
const file = process.argv[2];
const buf = fs.readFileSync(file);
const text = buf.toString('utf8');

// ---- output ----
console.log('chars:', text.length);
