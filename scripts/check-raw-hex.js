const fs = require('fs');
const path = require('path');

const DIRECTORIES_TO_SCAN = ['app', 'components'];
const HEX_REGEX = /#([0-9a-fA-F]{3,8})\b/g;

// Zero exceptions allowed: all .tsx files in app/ and components/ must strictly adhere to design system tokens
const ALLOWED_FILES = [];

let hasErrors = false;

function scanDir(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir, { withFileTypes: true });

  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    if (file.isDirectory()) {
      scanDir(fullPath);
    } else if (file.name.endsWith('.tsx')) {
      const normalizedPath = path.normalize(fullPath);
      if (ALLOWED_FILES.some(allowed => normalizedPath.endsWith(allowed))) {
        continue;
      }

      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');

      lines.forEach((line, index) => {
        // Skip comments
        if (line.trim().startsWith('//') || line.trim().startsWith('/*') || line.trim().startsWith('*')) {
          return;
        }

        const matches = line.match(HEX_REGEX);
        if (matches) {
          console.error(`❌ Raw hex color violation in ${fullPath}:${index + 1}`);
          console.error(`   Found: ${matches.join(', ')}`);
          console.error(`   Line: ${line.trim()}`);
          console.error(`   👉 Use semantic Tailwind tokens (e.g., bg-brand-500, text-brand-ink, border-border) instead of raw hex values.\n`);
          hasErrors = true;
        }
      });
    }
  }
}

console.log('🔍 Checking for raw hex codes in .tsx files...');
DIRECTORIES_TO_SCAN.forEach(dir => scanDir(dir));

if (hasErrors) {
  console.error('💥 Raw hex check failed! Please replace raw hex colors with design system tokens.');
  process.exit(1);
} else {
  console.log('✅ No raw hex colors found in .tsx files! Design system tokens are strictly maintained.');
  process.exit(0);
}
