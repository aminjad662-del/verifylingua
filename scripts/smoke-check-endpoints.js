const urls = [
  'https://verifylingua.pages.dev/order/VL-8921-XQ/tracker',
  'https://verifylingua.pages.dev/order/VL-8921-XQ/proof',
  'https://verifylingua.pages.dev/translator/workbench/VL-7X9K2',
  'https://verifylingua.pages.dev/verify/VL-CERT-8921',
  'https://verifylingua.pages.dev/api/order/VL-8921-XQ/proof',
  'https://verifylingua.pages.dev/api/verify/VL-CERT-8921',
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
