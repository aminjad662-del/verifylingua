const urls = [
  'https://verifylingua.pages.dev/tracker/VL-DEMO1',
  'https://verifylingua.pages.dev/order/VL-DEMO1/tracker',
  'https://verifylingua.pages.dev/order/VL-DEMO1/proof',
  'https://verifylingua.pages.dev/translator/workbench/VL-DEMO1',
  'https://verifylingua.pages.dev/api/jobs/VL-DEMO1/status',
  'https://verifylingua.pages.dev/api/jobs/VL-DEMO1/download',
  'https://verifylingua.pages.dev/api/order/VL-DEMO1/proof',
  'https://verifylingua.pages.dev/api/counsel/matters'
];

async function check() {
  let allPass = true;
  for (const u of urls) {
    try {
      const res = await fetch(u);
      console.log(`[STATUS ${res.status}] ${u} | Content-Type: ${res.headers.get('content-type')}`);
      if (res.status >= 400) {
        allPass = false;
      }
    } catch (err) {
      console.error(`[ERROR] ${u}:`, err.message);
      allPass = false;
    }
  }
  if (!allPass) {
    process.exit(1);
  }
  console.log('\nALL ENDPOINTS VERIFIED: 100% HEALTHY');
}

check();
