const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Cloudflare Pages build containers enforce a 3GB memory limit; local dev has larger budget
const isCloudflare = Boolean(process.env.CF_PAGES || process.env.CLOUDFLARE);
const memoryMb = isCloudflare ? '2048' : '4096';
let nodeOptions = (process.env.NODE_OPTIONS || '').replace(/--max-old-space-size=\d+/g, '').trim();
process.env.NODE_OPTIONS = `${nodeOptions} --max-old-space-size=${memoryMb}`.trim();

const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
console.log('📦 Step 1: Generating Prisma Client...');
spawnSync(npxCmd, ['prisma', 'generate'], { stdio: 'inherit', shell: true });

console.log(`⚡ Step 2: Running Next.js build with ${memoryMb}MB heap (isCloudflare: ${isCloudflare})...`);
const buildRes = spawnSync(npxCmd, ['next', 'build'], { 
  stdio: 'inherit',
  env: process.env,
  shell: true,
});

if (buildRes.status !== 0) {
  console.error('❌ Next.js build failed with exit code ' + buildRes.status);
  process.exit(buildRes.status || 1);
}

console.log('🎉 Next.js build complete!');

console.log('🌐 Step 3: Assembling Cloudflare Pages artifacts (dist/)...');
const { assembleCloudflareAssets } = require('./build-cloudflare.js');
assembleCloudflareAssets();
