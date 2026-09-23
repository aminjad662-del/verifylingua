const { spawn } = require('child_process');

process.env.NODE_OPTIONS = `${process.env.NODE_OPTIONS || ''} --max-old-space-size=1024`.trim();

const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const port = process.env.PORT || '3005';

console.log(`Starting Next.js dev server on port ${port} with constrained heap...`);

const child = spawn(npxCmd, ['next', 'dev', '-p', port], {
  stdio: 'inherit',
  env: process.env,
  shell: true,
});

child.on('error', (err) => {
  console.error('Dev server process error:', err);
});

child.on('exit', (code) => {
  if (code !== 0 && code !== null) {
    console.error(`Dev server exited with code ${code}`);
  }
});
