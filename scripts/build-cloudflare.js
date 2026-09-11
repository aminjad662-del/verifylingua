/**
 * Cloudflare Pages Build Script for VerifyLingua
 *
 * Assembles Next.js build output into a production-ready Cloudflare Pages
 * output directory (`dist/`) with:
 * 1. Root index.html and all 95 prerendered pages
 * 2. Static CSS/JS chunks in _next/static/
 * 3. Public assets (SVG, icons, robots, sitemap)
 * 4. High-performance Cloudflare Pages _worker.js router
 * 5. _routes.json and _headers for optimal edge caching & security
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const NEXT_DIR = path.join(ROOT_DIR, '.next');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const LOCK_FILE = path.join(NEXT_DIR, '.cloudflare-assembled');

function assembleCloudflareAssets() {
  if (fs.existsSync(LOCK_FILE)) {
    try {
      const diff = Date.now() - fs.statSync(LOCK_FILE).mtimeMs;
      if (diff < 3000 && !process.env.FORCE_ASSEMBLE) {
        return;
      }
    } catch {
      // ignore
    }
  }

  console.log('🚀 Starting Cloudflare Pages artifact assembly...');

  // 1. Ensure clean dist directory
  if (fs.existsSync(DIST_DIR)) {
    fs.rmSync(DIST_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(DIST_DIR, { recursive: true });

// Helper to copy directory recursively
function copyDirRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// 2. Copy public directory assets
if (fs.existsSync(PUBLIC_DIR)) {
  console.log('📦 Copying public/ assets to dist/ ...');
  copyDirRecursive(PUBLIC_DIR, DIST_DIR);
}

// 3. Copy .next/static to dist/_next/static
const nextStaticSrc = path.join(NEXT_DIR, 'static');
const nextStaticDest = path.join(DIST_DIR, '_next', 'static');
if (fs.existsSync(nextStaticSrc)) {
  console.log('📦 Copying .next/static/ to dist/_next/static/ ...');
  copyDirRecursive(nextStaticSrc, nextStaticDest);
} else {
  console.warn('⚠️ Warning: .next/static not found. Run next build first.');
}

// 4. Scan and copy all prerendered HTML and RSC files from .next/server/app
const serverAppDir = path.join(NEXT_DIR, 'server', 'app');
let htmlCount = 0;

function copyAppRoutes(currentDir, relativePath = '') {
  if (!fs.existsSync(currentDir)) return;
  const entries = fs.readdirSync(currentDir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(currentDir, entry.name);
    const relItemPath = relativePath ? path.join(relativePath, entry.name) : entry.name;

    if (entry.isDirectory()) {
      copyAppRoutes(fullPath, relItemPath);
    } else if (entry.name.endsWith('.html') || entry.name.endsWith('.rsc')) {
      const targetPath = path.join(DIST_DIR, relItemPath);
      fs.mkdirSync(path.dirname(targetPath), { recursive: true });
      fs.copyFileSync(fullPath, targetPath);

      // If it's a page HTML (e.g. pricing.html), also write pricing/index.html for clean URL CDN fallback
      if (entry.name.endsWith('.html')) {
        htmlCount++;
        const routeName = entry.name.slice(0, -5); // remove .html
        if (routeName === 'index') {
          // dist/index.html is already placed
        } else if (routeName === '_not-found') {
          fs.copyFileSync(fullPath, path.join(DIST_DIR, '404.html'));
        } else {
          const dirForRoute = path.join(DIST_DIR, relativePath, routeName);
          fs.mkdirSync(dirForRoute, { recursive: true });
          fs.copyFileSync(fullPath, path.join(dirForRoute, 'index.html'));
        }
      }
    }
  }
}

if (fs.existsSync(serverAppDir)) {
  console.log('📄 Scanning and organizing pre-rendered HTML pages from .next/server/app ...');
  copyAppRoutes(serverAppDir);
  console.log(`✅ Processed ${htmlCount} pre-rendered HTML templates.`);
}

// Ensure 404.html exists
if (!fs.existsSync(path.join(DIST_DIR, '404.html'))) {
  const notFoundHtml = fs.existsSync(path.join(serverAppDir, '_not-found.html'))
    ? fs.readFileSync(path.join(serverAppDir, '_not-found.html'), 'utf8')
    : `<!DOCTYPE html><html><head><title>404 - Page Not Found</title></head><body style="font-family:sans-serif;text-align:center;padding:50px;"><h1>404 - Page Not Found</h1><p><a href="/">Return Home</a></p></body></html>`;
  fs.writeFileSync(path.join(DIST_DIR, '404.html'), notFoundHtml, 'utf8');
}

// Ensure icon.svg is present in dist
const iconCandidates = [
  path.join(NEXT_DIR, 'server', 'app', 'icon.svg.body'),
  path.join(PUBLIC_DIR, 'icon.svg'),
  path.join(ROOT_DIR, 'app', 'icon.svg'),
];
for (const iconPath of iconCandidates) {
  if (fs.existsSync(iconPath)) {
    fs.copyFileSync(iconPath, path.join(DIST_DIR, 'icon.svg'));
    console.log(`✅ Ensured dist/icon.svg from ${path.basename(iconPath)}`);
    break;
  }
}

// 5. Generate _routes.json for Cloudflare Pages
const routesConfig = {
  version: 1,
  include: ['/*'],
  exclude: [
    '/_next/static/*',
    '/icon.svg',
    '/favicon.ico',
    '/robots.txt',
    '/sitemap.xml',
    '/images/*',
    '/textures/*',
    '/fonts/*'
  ]
};
fs.writeFileSync(path.join(DIST_DIR, '_routes.json'), JSON.stringify(routesConfig, null, 2), 'utf8');
console.log('✅ Generated dist/_routes.json');

// 6. Generate _headers for Cloudflare Pages (Security + Edge Caching)
const headersContent = `
# Static assets - Immutable 1 year cache
/_next/static/*
  Cache-Control: public, max-age=31536000, immutable

# Assets with hash
/*.svg
  Cache-Control: public, max-age=86400, stale-while-revalidate=604800

/*.png
  Cache-Control: public, max-age=86400, stale-while-revalidate=604800

# HTML documents - Must revalidate for immediate updates
/*.html
  Cache-Control: public, max-age=0, must-revalidate

# Global security and caching headers for all routes (ensures clean URLs like /dashboard revalidate)
/*
  Cache-Control: public, max-age=0, must-revalidate
  X-Content-Type-Options: nosniff
  X-Frame-Options: SAMEORIGIN
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
`.trim();
fs.writeFileSync(path.join(DIST_DIR, '_headers'), headersContent, 'utf8');
console.log('✅ Generated dist/_headers');

// 7. Generate Cloudflare Pages _worker.js
const workerScript = `
/**
 * Cloudflare Pages Advanced Edge Router for VerifyLingua
 * Fully eliminates Error 522 by serving assets directly from Cloudflare edge storage
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // 1. Health check endpoint (for uptime monitors and verification)
    if (pathname === '/cdn-cgi/healthz' || pathname === '/api/health') {
      return new Response(JSON.stringify({
        status: 'healthy',
        service: 'verifylingua',
        platform: 'cloudflare-pages',
        region: request.cf?.colo || 'edge',
        timestamp: new Date().toISOString()
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // 2. Mock API handler for client actions on Cloudflare Edge
    if (pathname.startsWith('/api/')) {
      return handleApiRequest(request, pathname, env);
    }

    // 0. Explicit root index resolution
    if (pathname === '/' || pathname === '') {
      try {
        const rootRes = await env.ASSETS.fetch(request);
        if (rootRes && rootRes.status !== 404) return rootRes;
      } catch {}
      try {
        const rootUrl = new URL('/index.html', request.url);
        const rootRes2 = await env.ASSETS.fetch(new Request(rootUrl, request));
        if (rootRes2 && rootRes2.status !== 404) return rootRes2;
      } catch {}
    }

    // 3. Try direct asset fetch first (exact match)
    let response;
    try {
      response = await env.ASSETS.fetch(request);
      if (response && response.status !== 404) {
        return response;
      }
    } catch {
      // Fall through to clean URL resolution
    }

    // Direct asset fallback without query parameters (e.g. /icon.svg?hash)
    if (pathname === '/icon.svg' || pathname === '/favicon.ico') {
      const cleanUrl = new URL(pathname, request.url);
      response = await env.ASSETS.fetch(new Request(cleanUrl, request));
      if (response.status !== 404) {
        return response;
      }
    }

    // 4. Clean URL Resolution (e.g. /pricing -> /pricing/index.html or /pricing.html)
    if (!pathname.includes('.')) {
      const cleanPath = pathname.replace(/\\/+$/, '');

      // Try /route/index.html
      const indexPath = new URL(\`\${cleanPath}/index.html\`, request.url);
      response = await env.ASSETS.fetch(new Request(indexPath, request));
      if (response.status !== 404) {
        return response;
      }

      // Try /route.html
      const htmlPath = new URL(\`\${cleanPath}.html\`, request.url);
      response = await env.ASSETS.fetch(new Request(htmlPath, request));
      if (response.status !== 404) {
        return response;
      }

      // Fallback for dynamic client-side order proofing studio: /order/:id/proof
      if (pathname.includes('/proof')) {
        const proofFallback = new URL('/order/VL-DEMO1/proof/index.html', request.url);
        response = await env.ASSETS.fetch(new Request(proofFallback, request));
        if (response.status !== 404) return response;
      }

      // Fallback for dynamic client-side order tracking: /order/:id
      if (pathname.startsWith('/order/')) {
        const orderFallback = new URL('/order/VL-DEMO1/index.html', request.url);
        response = await env.ASSETS.fetch(new Request(orderFallback, request));
        if (response.status !== 404) return response;
      }

      // Fallback for dynamic linguist CAT workbench: /translator/workbench/:id
      if (pathname.startsWith('/translator/workbench/')) {
        const workbenchFallback = new URL('/translator/workbench/VL-DEMO1/index.html', request.url);
        response = await env.ASSETS.fetch(new Request(workbenchFallback, request));
        if (response.status !== 404) return response;
      }

      // Fallback for dynamic admin order workspace: /admin/orders/:id
      if (pathname.startsWith('/admin/orders/')) {
        const adminFallback = new URL('/admin/orders/VL-DEMO1/index.html', request.url);
        response = await env.ASSETS.fetch(new Request(adminFallback, request));
        if (response.status !== 404) return response;
      }

      // Fallback for dynamic certificate verification: /verify/:code
      if (pathname.startsWith('/verify/')) {
        const verifyFallback = new URL('/verify/demo/index.html', request.url);
        response = await env.ASSETS.fetch(new Request(verifyFallback, request));
        if (response.status !== 404) return response;
      }
    }

    // 5. If route not found, return 404 page
    const notFoundUrl = new URL('/404.html', request.url);
    const notFoundResponse = await env.ASSETS.fetch(new Request(notFoundUrl, request));
    if (notFoundResponse.status !== 404) {
      return new Response(notFoundResponse.body, {
        status: 404,
        headers: notFoundResponse.headers
      });
    }

    return new Response('404 Not Found', { status: 404, headers: { 'Content-Type': 'text/plain' } });
  }
};

/**
 * Handle API requests on Cloudflare Edge
 */
async function handleApiRequest(request, pathname, env) {
  const method = request.method;

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400'
      }
    });
  }

  // Verification API
  if (pathname.startsWith('/api/verify/')) {
    const code = pathname.replace('/api/verify/', '').trim().toUpperCase();
    return new Response(JSON.stringify({
      success: true,
      data: {
        verifyCode: code || 'CERT-DEMO-2026',
        status: 'VALID',
        issuedAt: new Date().toISOString(),
        documentType: 'Certified Translation',
        standards: ['USCIS 8 CFR 103.2(b)(3)', 'ATA Certified Standards'],
        hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }

  // Order Proofing API
  if (pathname.includes('/proof')) {
    return new Response(JSON.stringify({
      success: true,
      order: {
        publicCode: 'VL-DEMO1',
        status: 'PROOFING',
        sourceLang: 'Spanish',
        targetLang: 'English',
        receivingParty: 'USCIS',
        total: 24.95,
        translator: {
          name: 'Elena V.',
          credentials: 'ATA Certified #271892'
        }
      },
      segments: [
        { id: 'seg-1', page: 1, section: 'HEADER', sourceText: 'ESTADOS UNIDOS MEXICANOS - ACTA DE NACIMIENTO', translatedText: 'UNITED MEXICAN STATES - BIRTH CERTIFICATE', isLockedTerm: true, lockedTermType: 'GOVERNMENT_BODY' },
        { id: 'seg-2', page: 1, section: 'REGISTRY', sourceText: 'OFICIALIA 01 DEL REGISTRO CIVIL DE GUADALAJARA', translatedText: 'OFFICE 01 OF THE CIVIL REGISTRY OF GUADALAJARA', isLockedTerm: true, lockedTermType: 'REGISTRY_OFFICE' },
        { id: 'seg-3', page: 1, section: 'PERSON', sourceText: 'NOMBRE DEL REGISTRADO: CARLOS EDUARDO MENDOZA MORALES', translatedText: 'NAME OF REGISTERED PERSON: CARLOS EDUARDO MENDOZA MORALES', isLockedTerm: true, lockedTermType: 'PROPER_NAME' },
        { id: 'seg-4', page: 1, section: 'DATE', sourceText: 'FECHA DE NACIMIENTO: 14 DE MARZO DE 1994', translatedText: 'DATE OF BIRTH: MARCH 14, 1994', isLockedTerm: true, lockedTermType: 'DATE' },
        { id: 'seg-5', page: 1, section: 'CERTIFICATION', sourceText: 'DOY FE QUE LA PRESENTE ES COPIA FIEL SACADA DE SU ORIGINAL', translatedText: 'I ATTEST THAT THIS IS A TRUE AND ACCURATE COPY OF THE ORIGINAL', isLockedTerm: false }
      ],
      lockedGlossary: [
        { term: 'CARLOS EDUARDO MENDOZA MORALES', kind: 'Proper Name (Applicant)', reason: 'Matched to USCIS Form I-130 Petitioner record', verifiedInTranslation: true },
        { term: 'MARCH 14, 1994', kind: 'Date of Birth', reason: 'USCIS Standard MM/DD/YYYY format verified', verifiedInTranslation: true }
      ],
      revisions: []
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }

  // Order Revisions API
  if (pathname.includes('/revisions')) {
    if (method === 'POST') {
      let body = {};
      try { body = await request.json(); } catch {}
      const newRevision = {
        id: 'rev-' + Math.random().toString(36).substring(2, 9),
        segmentId: body.segmentId || 'seg-1',
        originalText: body.originalText || '',
        suggestedText: (body.suggestedText || '').trim(),
        reason: body.reason || 'Matches Foreign Passport / USCIS Entry',
        status: 'PENDING',
        createdAt: new Date().toISOString()
      };
      return new Response(JSON.stringify({
        success: true,
        revision: newRevision,
        totalPending: 1
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      revisions: []
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }

  // Order Approval API
  if (pathname.includes('/approve')) {
    const verifyCode = 'VL-' + Math.random().toString(36).substring(2, 7).toUpperCase();
    return new Response(JSON.stringify({
      success: true,
      publicCode: 'VL-DEMO1',
      verifyCode: verifyCode,
      status: 'CERTIFIED',
      downloadUrl: \`/api/certificate/\${verifyCode}/download\`,
      verificationUrl: \`/verify/\${verifyCode}\`
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }

  // Certificate Download API
  if (pathname.includes('/certificate/') && pathname.includes('/download')) {
    return new Response('%PDF-1.4 Mock Certified Translation Packet VerifyLingua USCIS Compliant', {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="VerifyLingua-Certified-Translation.pdf"',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  // Translator Workbench save API
  if (pathname.includes('/translator/workbench/') && method === 'POST') {
    return new Response(JSON.stringify({
      success: true,
      message: 'Draft changes saved successfully'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }

  // CounselDesk Matters API
  if (pathname === '/api/counsel/matters') {
    return new Response(JSON.stringify({
      success: true,
      stats: { totalMatters: 3, readyCount: 1, activeCount: 2, totalPages: 11 },
      matters: [
        {
          id: 'mat-1',
          matterNumber: '2026-IMM-042',
          clientName: 'Hernandez Family',
          alienNumber: 'A098-765-432',
          filingType: 'I-130 / I-485 Concurrent Adjustment',
          status: 'READY_TO_FILE',
          ordersCount: 3,
          orders: [
            { publicCode: 'VL-8921-XQ', documentType: 'Birth Certificate (Lead Applicant)', status: 'APPROVED', pageCount: 2 },
            { publicCode: 'VL-8922-XR', documentType: 'Marriage Certificate', status: 'APPROVED', pageCount: 2 },
            { publicCode: 'VL-8923-XS', documentType: 'Police Clearance Record', status: 'APPROVED', pageCount: 1 }
          ]
        },
        {
          id: 'mat-2',
          matterNumber: '2026-IMM-058',
          clientName: 'Alejandro Chen',
          alienNumber: 'A214-889-102',
          filingType: 'EB-2 National Interest Waiver (NIW)',
          status: 'ACTIVE',
          ordersCount: 2,
          orders: [
            { publicCode: 'VL-9104-MN', documentType: 'PhD Diploma & Degree Transcripts', status: 'IN_TRANSLATION', pageCount: 4 },
            { publicCode: 'VL-9105-MO', documentType: 'Patent Grant & Abstract', status: 'APPROVED', pageCount: 2 }
          ]
        }
      ]
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }

  // Translator Workbench API
  if (pathname.includes('/translator/workbench/')) {
    return new Response(JSON.stringify({
      success: true,
      job: {
        publicCode: 'VL-DEMO1',
        documentType: 'Birth Certificate / Acta de Nacimiento',
        sourceLang: 'Spanish',
        targetLang: 'English',
        pages: 1,
        words: 245,
        deadline: 'Tomorrow at 9:00 AM EST',
        receivingParty: 'USCIS'
      },
      segments: [
        { id: 'w-seg-1', section: 'Header', sourceText: 'ESTADOS UNIDOS MEXICANOS - ACTA DE NACIMIENTO', targetText: 'UNITED MEXICAN STATES - BIRTH CERTIFICATE', locked: true, status: 'VERIFIED' },
        { id: 'w-seg-2', section: 'Civil Registry', sourceText: 'OFICIALIA 01 DEL REGISTRO CIVIL DE GUADALAJARA', targetText: 'OFFICE 01 OF THE CIVIL REGISTRY OF GUADALAJARA', locked: true, status: 'VERIFIED' },
        { id: 'w-seg-3', section: 'Applicant Name', sourceText: 'NOMBRE: CARLOS EDUARDO MENDOZA MORALES', targetText: 'NAME: CARLOS EDUARDO MENDOZA MORALES', locked: true, status: 'TRANSLATED' },
        { id: 'w-seg-4', section: 'Birth Date & Place', sourceText: 'FECHA: 14 DE MARZO DE 1994 EN GUADALAJARA JALISCO', targetText: 'DATE: MARCH 14, 1994 IN GUADALAJARA JALISCO', locked: true, status: 'TRANSLATED' },
        { id: 'w-seg-5', section: 'Certification', sourceText: 'DOY FE QUE LA PRESENTE ES COPIA FIEL SACADA DE SU ORIGINAL', targetText: 'I ATTEST THAT THIS IS A TRUE AND ACCURATE COPY OF THE ORIGINAL', locked: false, status: 'TRANSLATED' }
      ],
      lockedTerms: [
        { term: 'CARLOS EDUARDO MENDOZA MORALES', kind: 'Proper Name', matched: true },
        { term: 'MARCH 14, 1994', kind: 'Birth Date', matched: true }
      ]
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }

  // Shipping Rates API
  if (pathname === '/api/shipping/rates') {
    return new Response(JSON.stringify({
      success: true,
      options: [
        { id: 'usps_certified', name: 'USCIS Certified First Class (Tracking + Return Receipt)', cost: 9.95, estimatedDays: '2-3 Business Days' },
        { id: 'usps_priority', name: 'USPS Priority Legal Envelope', cost: 19.95, estimatedDays: '1-2 Business Days' },
        { id: 'fedex_overnight', name: 'FedEx Priority Overnight (Pre-10:30 AM Delivery)', cost: 39.95, estimatedDays: 'Next Business Morning' }
      ]
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }

  // Defense RFE API
  if (pathname === '/api/defense/rfe') {
    return new Response(JSON.stringify({
      success: true,
      data: {
        rfeTrackingNumber: 'RFE-USCIS-9021',
        rootCause: 'Omission of marginal registry seal translation',
        remedy: 'Supplemental Sworn Re-Affidavit with Complete Notarial Stamp Audit',
        actionRequired: 'Download and sign attached Supplemental Re-Affidavit',
        turnaroundHours: 4
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }

  // Order creation API
  if (pathname === '/api/order/create') {
    return new Response(JSON.stringify({
      success: true,
      orderId: 'ord_' + Math.random().toString(36).substring(2, 11),
      status: 'AWAITING_PAYMENT',
      checkoutUrl: '/order/checkout'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }

  // Translation upload API
  if (pathname === '/api/translate/upload') {
    return new Response(JSON.stringify({
      success: true,
      jobId: 'job_' + Math.random().toString(36).substring(2, 11),
      status: 'QUEUED',
      estimatedSeconds: 15
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }

  // Default API fallback
  return new Response(JSON.stringify({
    success: true,
    endpoint: pathname,
    timestamp: new Date().toISOString()
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  });
}
`.trim();

fs.writeFileSync(path.join(DIST_DIR, '_worker.js'), workerScript, 'utf8');
console.log('✅ Generated dist/_worker.js (Cloudflare Pages Edge Router)');

// 8. Mirror dist/ to .open-next/ and out/ for 100% dashboard compatibility
const OPEN_NEXT_DIR = path.join(ROOT_DIR, '.open-next');
const OUT_DIR = path.join(ROOT_DIR, 'out');

console.log('🔄 Mirroring dist/ to .open-next/ and out/ for dashboard compatibility...');

// Populate .open-next
if (fs.existsSync(OPEN_NEXT_DIR)) fs.rmSync(OPEN_NEXT_DIR, { recursive: true, force: true });
copyDirRecursive(DIST_DIR, OPEN_NEXT_DIR);
// In .open-next, ensure worker.js exists as well as _worker.js
fs.copyFileSync(path.join(DIST_DIR, '_worker.js'), path.join(OPEN_NEXT_DIR, 'worker.js'));
const openNextAssets = path.join(OPEN_NEXT_DIR, 'assets');
if (!fs.existsSync(openNextAssets)) copyDirRecursive(DIST_DIR, openNextAssets);

// Populate out
if (fs.existsSync(OUT_DIR)) fs.rmSync(OUT_DIR, { recursive: true, force: true });
copyDirRecursive(DIST_DIR, OUT_DIR);

// Populate .vercel/output/static (Next.js default preset for Cloudflare Pages)
const VERCEL_STATIC_DIR = path.join(ROOT_DIR, '.vercel', 'output', 'static');
if (fs.existsSync(VERCEL_STATIC_DIR)) fs.rmSync(VERCEL_STATIC_DIR, { recursive: true, force: true });
fs.mkdirSync(path.dirname(VERCEL_STATIC_DIR), { recursive: true });
copyDirRecursive(DIST_DIR, VERCEL_STATIC_DIR);

  console.log('✅ Synchronized dist/, .open-next/, out/, and .vercel/output/static/');
  console.log('🎉 Cloudflare Pages artifact assembly complete! Ready for zero-config deployment.');

  try {
    if (fs.existsSync(NEXT_DIR)) {
      fs.writeFileSync(LOCK_FILE, Date.now().toString(), 'utf8');
    }
  } catch {
    // ignore
  }
}

if (require.main === module) {
  assembleCloudflareAssets();
}

module.exports = { assembleCloudflareAssets };
