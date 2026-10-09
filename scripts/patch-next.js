const fs = require('fs');
const path = require('path');

/**
 * Patch Next.js 15.2.0 react-dev-overlay use-websocket.js
 *
 * Problem:
 * In Next.js 15.2.0, `useTurbopack` unconditionally dynamically imports
 * `@vercel/turbopack-ecmascript-runtime/browser/dev/hmr-client/hmr-client.ts`
 * without checking if Turbopack is active (`// TODO(WEB-1589)`).
 * When running under Webpack, this creates a dynamic chunk with a 100+ character path
 * which can fail to load on Windows or when HMR updates/reconnects, throwing an
 * unhandled ChunkLoadError in the dev overlay.
 *
 * Fix:
 * 1. Check `!process.env.TURBOPACK` before attempting the dynamic import.
 * 2. Add a `.catch()` handler to ensure the dynamic import never results in an unhandled rejection.
 */

function patchFile(filePath) {
  if (!fs.existsSync(filePath)) return false;

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // 1. Guard useTurbopack with process.env.TURBOPACK
  if (!content.includes('!process.env.TURBOPACK')) {
    // Pattern A: with comment
    const patternA = /\/\/\s*TODO\(WEB-1589\)[^\r\n]*\r?\n\s*if\s*\(\s*initCurrent\.init\s*\)\s*\{/;
    if (patternA.test(content)) {
      content = content.replace(
        patternA,
        '// Guarded against Webpack dev mode chunk load error\n        if (!process.env.TURBOPACK || initCurrent.init) {'
      );
      modified = true;
    } else {
      // Pattern B: standard check
      const patternB = /if\s*\(\s*initCurrent\.init\s*\)\s*\{\s*\r?\n\s*return;\s*\r?\n\s*\}\s*\r?\n\s*initCurrent\.init\s*=\s*true;\s*\r?\n\s*import\(/;
      if (patternB.test(content)) {
        content = content.replace(
          patternB,
          'if (!process.env.TURBOPACK || initCurrent.init) {\n            return;\n        }\n        initCurrent.init = true;\n        import('
        );
        modified = true;
      }
    }
  }

  // 2. Add catch block to dynamic import if missing
  if (!content.includes('.catch(')) {
    const catchPattern = /(sendMessage,\s*\r?\n\s*onUpdateError\s*\r?\n\s*\}\);\s*\r?\n\s*\}\);)/;
    if (catchPattern.test(content)) {
      content = content.replace(
        catchPattern,
        'sendMessage,\n                onUpdateError\n            });\n        }).catch((err) => {\n            // Safe fallback: Webpack dev server uses its own HMR WebSocket\n        });'
      );
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Successfully patched ${filePath}`);
    return true;
  }

  console.log(`ℹ️ File already patched or pattern not found: ${filePath}`);
  return false;
}

function findAndPatchAll() {
  const rootDir = path.resolve(__dirname, '..');
  const candidatesSet = new Set([
    path.join(rootDir, 'node_modules', 'next', 'dist', 'client', 'components', 'react-dev-overlay', 'utils', 'use-websocket.js'),
    path.join(rootDir, 'node_modules', 'next', 'dist', 'esm', 'client', 'components', 'react-dev-overlay', 'utils', 'use-websocket.js'),
  ]);

  // Also search .pnpm directory
  const pnpmDir = path.join(rootDir, 'node_modules', '.pnpm');
  if (fs.existsSync(pnpmDir)) {
    try {
      const entries = fs.readdirSync(pnpmDir);
      for (const entry of entries) {
        if (entry.startsWith('next@')) {
          candidatesSet.add(path.join(pnpmDir, entry, 'node_modules', 'next', 'dist', 'client', 'components', 'react-dev-overlay', 'utils', 'use-websocket.js'));
          candidatesSet.add(path.join(pnpmDir, entry, 'node_modules', 'next', 'dist', 'esm', 'client', 'components', 'react-dev-overlay', 'utils', 'use-websocket.js'));
        }
      }
    } catch (e) {
      console.warn('Could not scan .pnpm directory:', e.message);
    }
  }

  let count = 0;
  for (const filePath of candidatesSet) {
    if (patchFile(filePath)) count++;
  }
  console.log(`🎉 Next.js Turbopack-Webpack chunk fix applied to ${count} file(s).`);
}

findAndPatchAll();
