const http = require('http');

const routes = [
  '/',
  '/pricing',
  '/how-it-works',
  '/order/triage',
  '/order/configure',
  '/order/checkout',
  '/order/VL-DEMO1',
  '/order/VL-DEMO1/proof',
  '/verify/VL-CERT-8921',
  '/dashboard'
];

async function checkRoute(route) {
  return new Promise((resolve) => {
    const req = http.get('http://127.0.0.1:8788' + route, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        const isHtml = (res.headers['content-type'] || '').includes('text/html');
        const hasDoctype = data.includes('<!DOCTYPE html>') || data.includes('<html');
        const titleMatch = data.match(/<title>([^<]+)<\/title>/);
        const title = titleMatch ? titleMatch[1] : 'No title tag';
        const length = data.length;
        resolve({
          route,
          statusCode: res.statusCode,
          statusMessage: res.statusMessage,
          contentType: res.headers['content-type'],
          length,
          title,
          isHtml,
          hasDoctype,
          ok: res.statusCode === 200 && isHtml && length > 500
        });
      });
    });
    req.on('error', (err) => {
      resolve({ route, error: err.message, ok: false });
    });
  });
}

(async () => {
  console.log('Testing routes against http://127.0.0.1:8788 ...\n');
  let allPass = true;
  for (const route of routes) {
    const r = await checkRoute(route);
    if (r.ok) {
      console.log(`✅ ${r.route.padEnd(25)} -> Status: ${r.statusCode} OK | Size: ${r.length} bytes | Title: "${r.title}"`);
    } else {
      allPass = false;
      console.log(`❌ ${r.route.padEnd(25)} -> FAILED:`, JSON.stringify(r));
    }
  }
  console.log('\nFinal Verdict:', allPass ? 'ALL ROUTES PASSED (200 OK & FULL HTML)!' : 'SOME ROUTES FAILED!');
  process.exit(allPass ? 0 : 1);
})();
