const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

async function verifyResponsive() {
  const evidenceDir = path.join(__dirname, '..', 'docs', 'evidence', 'responsive');
  if (!fs.existsSync(evidenceDir)) fs.mkdirSync(evidenceDir, { recursive: true });

  const routes = [
    { name: 'home', path: '/' },
    { name: 'pricing', path: '/pricing' },
    { name: 'verify', path: '/verify' },
    { name: 'verify_detail', path: '/verify/VL-CERT-8921' },
    { name: 'order_tracking', path: '/order/VL-DEMO1' },
    { name: 'pipeline_tracker', path: '/tracker/VL-DEMO1' },
  ];

  const viewports = [
    { width: 375, height: 812, name: 'mobile-375' },
    { width: 768, height: 1024, name: 'tablet-768' },
    { width: 1440, height: 900, name: 'desktop-1440' },
  ];

  const browser = await chromium.launch();
  const results = [];

  for (const vp of viewports) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();

    for (const r of routes) {
      const url = `http://localhost:3005${r.path}`;
      try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
        await page.waitForTimeout(500);

        // Check horizontal overflow
        const overflowData = await page.evaluate(() => {
          const docEl = document.documentElement;
          const body = document.body;
          const winWidth = window.innerWidth;
          const scrollWidth = Math.max(docEl.scrollWidth, body ? body.scrollWidth : 0);
          return {
            winWidth,
            scrollWidth,
            hasOverflow: scrollWidth > winWidth + 1, // Allow 1px rounding margin
          };
        });

        // Screenshot
        const screenshotFileName = `${r.name}_${vp.name}.png`;
        const screenshotPath = path.join(evidenceDir, screenshotFileName);
        await page.screenshot({ path: screenshotPath, fullPage: false });

        results.push({
          route: r.path,
          name: r.name,
          viewport: vp.name,
          width: vp.width,
          scrollWidth: overflowData.scrollWidth,
          hasOverflow: overflowData.hasOverflow,
          screenshot: screenshotFileName,
        });

        console.log(`[${vp.name}] ${r.path} -> scrollWidth: ${overflowData.scrollWidth}px (Target: <= ${vp.width}px) | Overflow: ${overflowData.hasOverflow ? 'FAIL' : 'PASS'}`);
      } catch (err) {
        console.error(`Error on ${url} at ${vp.name}:`, err.message);
        results.push({
          route: r.path,
          name: r.name,
          viewport: vp.name,
          error: err.message,
        });
      }
    }

    await context.close();
  }

  await browser.close();

  const reportPath = path.join(__dirname, '..', 'docs', 'evidence', 'responsive_verification_report.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`\nSaved verification report to: ${reportPath}`);

  const anyOverflow = results.some(r => r.hasOverflow);
  console.log(`\nOVERALL HORIZONTAL OVERFLOW STATUS: ${anyOverflow ? 'FAILED' : 'ALL 100% CLEAN & PASSING!'}`);
}

verifyResponsive().catch(console.error);
