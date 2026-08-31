const fs = require('fs');
const path = require('path');

fs.mkdirSync('docs', { recursive: true });

fs.writeFileSync('docs/REFERENCE_UI.md', '# Visual Analysis & Design Reference Specification\n', 'utf8');
console.log('docs written');
