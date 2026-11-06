const fs = require('fs');
const path = require('path');

const TARGET_DIRS = ['app', 'components', 'lib', 'scripts'];
const IGNORE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.svg', '.webp', '.ico', '.woff', '.woff2'];

function walk(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.next' && entry.name !== '.open-next' && entry.name !== 'dist' && entry.name !== '.git') {
        walk(fullPath, fileList);
      }
    } else {
      const ext = path.extname(entry.name).toLowerCase();
      if (!IGNORE_EXTENSIONS.includes(ext) && (ext === '.ts' || ext === '.tsx' || ext === '.js')) {
        fileList.push(fullPath);
      }
    }
  }
  return fileList;
}

const patterns = [
  { name: 'Hardcoded 25 Credits', regex: /25\s*credits?/i },
  { name: 'Hardcoded 23/2 QA Counter', regex: /23\s*\/\s*2/i },
  { name: 'Simulated setTimeout delays (> 400ms)', regex: /setTimeout\s*\(\s*(?:async\s*)?\(\s*\)\s*=>[\s\S]*?,\s*(?:[5-9]\d{2}|\d{4,})\s*\)/ },
  { name: 'Mock user or dummy email', regex: /dummy|mockuser|demo@|example@verifylingua/i },
  { name: 'Sample document specimens in workspace', regex: /SPECIMEN_SAMPLES|mexican_marriage_apostille/i },
  { name: 'Hardcoded QA fidelity / accuracy score', regex: /(?:fidelityScore|accuracyScore|overallScore)\s*[:=]\s*(?:9[89]|100)/i }
];

console.log('🔍 Starting comprehensive code scan for mock state, hardcoded metrics, and simulated delays...\n');

const findings = {};
patterns.forEach(p => findings[p.name] = []);

for (const dir of TARGET_DIRS) {
  const files = walk(dir);
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    patterns.forEach(p => {
      if (p.regex.test(content)) {
        findings[p.name].push(file);
      }
    });
  }
}

for (const [patternName, fileList] of Object.entries(findings)) {
  console.log(`📌 ${patternName} (${fileList.length} files):`);
  fileList.slice(0, 10).forEach(f => console.log(`   - ${f}`));
  if (fileList.length > 10) console.log(`   ... and ${fileList.length - 10} more`);
  console.log('');
}
