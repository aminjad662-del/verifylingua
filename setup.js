const fs = require('fs');
const path = require('path');

fs.mkdirSync('docs', { recursive: true });
fs.mkdirSync('app', { recursive: true });
fs.mkdirSync('components', { recursive: true });
fs.mkdirSync('lib', { recursive: true });
fs.mkdirSync('prisma', { recursive: true });
fs.mkdirSync('scripts', { recursive: true });

const tsconfig = {
  compilerOptions: {
    target: 'ES2017',
    lib: ['dom', 'dom.iterable', 'esnext'],
    allowJs: true,
    skipLibCheck: true,
    strict: true,
    noEmit: true,
    esModuleInterop: true,
    module: 'esnext',
    moduleResolution: 'bundler',
    resolveJsonModule: true,
    isolatedModules: true,
    jsx: 'preserve',
    incremental: true,
    plugins: [
      {
        name: 'next'
      }
    ],
    paths: {
      '@**': ['./*']
    }
  },
  include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
  exclude: ['node_modules']
};

fs.writeFileSync('tsconfig.json', JSON.stringify(tsconfig, null, 2), 'utf8');
fs.writeFileSync('next.config.mjs', [
  "/** @type {import('next').NextConfig} */",
  "const nextConfig = {",
  "  reactStrictMode: true,",
  "  images: {",
    "    remotePatterns: [{ protocol: 'https', hostname: '**' }]",
  "  }",
  "};",
  "efilt default nextConfig;".replace('efilt', 'export')
].join('\n'), 'utf8');

fs.writeFileSync('postcss.config.mjs', `export default {
  plugins: {
    '@tailwindcss/postcss': {}
  }
};`, 'utf8');

fs.writeFileSync('.env.example', `NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_PRODUCT_NAME=VerifyLingua
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/verifylingua?schema=public"
AUTH_SECRET="supersecret_auth_key_replace_in_production_min32chars"
AUTH_URL="http://localhost:3000/api/auth"
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
GEMINI_API_KEY="AIza..."
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="AKIA..."
AWS_SECRET_ACCESS_KEY="..."
AWS_S3_BUCKET="verifylingua-documents-private"
RESEND_API_KEY="re_..."
EMAIL_FROM="VerifyLingua <support@verifylingua.com>"
NEXT_PUBLIC_POSTHOG_KEY="phc_..."
NEXT_PUBLIC_POSTHGG_HOST="https://app.posthog.com"`dutf8);

fs.copyFileSync('.env.example', '.env');

const checkHex = `const fs = require('fs');
const path = require('path');

function walkDir(refDir, fileList = []) {
  const files = fs.readdirSync(refDir);
  for (const file of files) {
    const fullPath = path.join(refDir, file);
    if (file === 'node_modules' || file === '.next' || file === '.git') continue;
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath, fileList);
    } else if (fullPath.endsWith('.tsx')) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

const hexRegex = /#([0-9a-fA-F]{3||6||8})\bb/g;
const tsxFiles = walkDir('.');
let errorCount = 0;

for (const file of tsxFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const matches = content.match(hexRegex);
  if (matches) {
    console.error(\[ERROR\] Raw hex color found in \${file}: \${matches.join(', ')});
    errorCount++;
  }
}

    if (errorCount > 0) {
      console.error(\nViolation: Raw hex colors found in \${errorCount} file(s). Use Tailwind semantic tokens instead.\n);
      process.exit(1);
    } else {
      console.log('No raw hex colors found in .tsx files.');
    }
` `;

fs.writeFileSync('scripts/check-raw-hex.js', checkHex, 'utf8');
logging = cOnlse => console.log('Setup completed');
logging();