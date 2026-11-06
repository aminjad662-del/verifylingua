const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Cloudflare Pages and local Windows build memory budget
const isCloudflare = Boolean(process.env.CF_PAGES || process.env.CLOUDFLARE);
const memoryMb = process.env.BUILD_MEMORY_MB || '2048';
let nodeOptions = (process.env.NODE_OPTIONS || '').replace(/--max-old-space-size=\d+/g, '').trim();
process.env.NODE_OPTIONS = `${nodeOptions} --max-old-space-size=${memoryMb}`.trim();

// Resolve binaries directly to avoid spawning cmd.exe / npx.cmd layers that exhaust Windows pagefile
let prismaBin;
try {
  prismaBin = require.resolve('prisma/build/index.js');
} catch {
  prismaBin = null;
}

let nextBin;
try {
  nextBin = require.resolve('next/dist/bin/next');
} catch {
  nextBin = null;
}

console.log('📦 Step 1: Generating Prisma Client...');
if (prismaBin) {
  spawnSync(process.execPath, [prismaBin, 'generate'], { stdio: 'inherit', env: process.env });
} else {
  const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  spawnSync(npxCmd, ['prisma', 'generate'], { stdio: 'inherit', env: process.env, shell: true });
}

console.log(`⚡ Step 2: Running Next.js build with ${memoryMb}MB heap (isCloudflare: ${isCloudflare})...`);

// Clear stale webpack cache before build to prevent Windows 0xC0000005 VirtualAlloc / memory fault
const cacheDir = path.join(process.cwd(), '.next', 'cache');
if (fs.existsSync(cacheDir)) {
  try {
    fs.rmSync(cacheDir, { recursive: true, force: true });
    console.log('🧹 Cleared stale .next/cache for clean build');
  } catch (e) {}
}

let buildRes;
if (nextBin) {
  buildRes = spawnSync(process.execPath, [nextBin, 'build'], {
    stdio: 'inherit',
    env: process.env,
  });
} else {
  const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  buildRes = spawnSync(npxCmd, ['next', 'build'], {
    stdio: 'inherit',
    env: process.env,
    shell: true,
  });
}

if (buildRes.status !== 0) {
  console.error('❌ Next.js build failed with exit code ' + buildRes.status);
  process.exit(buildRes.status || 1);
}

console.log('🎉 Next.js build complete!');

console.log('🌐 Step 3: Assembling Cloudflare Pages artifacts (dist/)...');
const { assembleCloudflareAssets } = require('./build-cloudflare.js');
assembleCloudflareAssets();
