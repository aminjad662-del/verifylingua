const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

process.env.NODE_OPTIONS = `${process.env.NODE_OPTIONS || ''} --max-old-space-size=4096`.trim();

const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
console.log('📦 Step 1: Generating Prisma Client...');
spawnSync(npxCmd, ['prisma', 'generate'], { stdio: 'inherit', shell: true });

console.log('⚡ Step 2: Running Next.js build with 4GB heap...');
const buildRes = spawnSync(npxCmd, ['next', 'build'], { 
  stdio: 'inherit',
  env: process.env,
  shell: true,
});

if (buildRes.status !== 0) {
  console.error('❌ Next.js build failed with exit code ' + buildRes.status);
  process.exit(buildRes.status || 1);
}

console.log('🚀 Step 3: Assembling Cloudflare Pages artifacts...');
const { assembleCloudflareAssets } = require('./build-cloudflare.js');
assembleCloudflareAssets();
console.log('🎉 VerifyLingua build complete and assembled!');
