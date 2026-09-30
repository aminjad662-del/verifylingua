const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3005;
const DIST_DIR = path.join(__dirname, '..', 'dist');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.rsc': 'text/x-component'
};

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  let pathname = decodeURIComponent(url.pathname);

  // Health check
  if (pathname === '/api/health' || pathname === '/cdn-cgi/healthz') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ status: 'ok', server: 'dist-preview' }));
  }

  // Mock API fallback for testing
  if (pathname.startsWith('/api/jobs/') && pathname.endsWith('/status')) {
    const parts = pathname.split('/');
    const jobId = parts[3] || 'VL-DEMO1';
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      jobId,
      status: 'extracting',
      currentPhase: 'extracting',
      progress: 25,
      currentStep: 'Extracting document layout and high-resolution OCR text blocks...',
      pageCount: 1,
      fileName: 'Certified_Legal_Document.pdf',
      downloadUrl: `/api/jobs/${jobId}/download`
    }));
  }

  // Resolve file in dist
  let filePath = path.join(DIST_DIR, pathname);

  // If path is root or directory
  if (pathname === '/' || pathname === '') {
    filePath = path.join(DIST_DIR, 'index.html');
  } else if (!path.extname(pathname)) {
    // Clean URL resolution
    const candidates = [
      path.join(DIST_DIR, pathname, 'index.html'),
      path.join(DIST_DIR, `${pathname}.html`),
      path.join(DIST_DIR, pathname)
    ];

    if (pathname.startsWith('/tracker/')) {
      candidates.push(path.join(DIST_DIR, 'tracker', 'VL-DEMO1', 'index.html'));
    }
    if (pathname.startsWith('/order/')) {
      candidates.push(path.join(DIST_DIR, 'order', 'VL-DEMO1', 'index.html'));
    }

    let found = false;
    for (const cand of candidates) {
      if (fs.existsSync(cand) && fs.statSync(cand).isFile()) {
        filePath = cand;
        found = true;
        break;
      }
    }
    if (!found) {
      filePath = path.join(DIST_DIR, '404.html');
    }
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // 404 fallback
      const notFoundPath = path.join(DIST_DIR, '404.html');
      if (fs.existsSync(notFoundPath)) {
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        return fs.createReadStream(notFoundPath).pipe(res);
      }
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      return res.end('404 Not Found');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache',
      'Access-Control-Allow-Origin': '*'
    });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`VerifyLingua Dist Preview Server running on http://localhost:${PORT}`);
});
