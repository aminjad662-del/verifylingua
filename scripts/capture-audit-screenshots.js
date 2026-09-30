const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3001';
const OUT_DIR = path.join(__dirname, '..', 'screenshots', 'audit');

const VIEWPORTS = [
  { name: 'mobile_375', width: 375, height: 812 },
  { name: 'tablet_768', width: 768, height: 1024 },
  { name: 'desktop_1440', width: 1440, height: 900 }
];

const ROUTES = [
  { path: '/', slug: 'home' },
  { path: '/order/triage', slug: 'order_triage' },
  { path: '/order/VL-DEMO1', slug: 'order_detail' },
  { path: '/order/VL-DEMO1/proof', slug: 'order_proof' },
  { path: '/translate', slug: 'translate_studio' },
  { path: '/tracker/VL-DEMO1', slug: 'tracker' },
  { path: '/dashboard', slug: 'dashboard' },
  { path: '/counsel', slug: 'counsel' },
  { path: '/pricing', slug: 'pricing' },
  { path: '/verify', slug: 'verify' },
  { path: '/admin', slug: 'admin' }
];

async function run() {
  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }

  console.log(`Starting audit screenshot capture against ${BASE_URL}...`);
  const browser = await chromium.launch({ headless: true });
  const auditReport = [];

  for (const vp of VIEWPORTS) {
    console.log(`\n--- Viewport: ${vp.name} (${vp.width}x${vp.height}) ---`);
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1
    });

    for (const route of ROUTES) {
      const page = await context.newPage();
      const consoleErrors = [];
      const pageErrors = [];

      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });
      page.on('pageerror', err => {
        pageErrors.push(err.message);
      });

      const url = `${BASE_URL}${route.path}`;
      const startTime = Date.now();
      let status = 0;
      let hasHorizontalOverflow = false;

      try {
        const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
        status = response ? response.status() : 0;
        await page.waitForTimeout(1000); // Allow motion/hydrations to settle

        hasHorizontalOverflow = await page.evaluate(() => {
          return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });

        const screenshotPath = path.join(OUT_DIR, `${route.slug}_${vp.name}.png`);
        await page.screenshot({ path: screenshotPath, fullPage: false });
        console.log(`✓ [${status}] ${route.path} -> ${route.slug}_${vp.name}.png (overflow: ${hasHorizontalOverflow})`);
      } catch (err) {
        console.error(`✗ Error loading ${route.path} on ${vp.name}:`, err.message);
        status = 500;
        pageErrors.push(err.message);
      }

      auditReport.push({
        route: route.path,
        slug: route.slug,
        viewport: vp.name,
        width: vp.width,
        height: vp.height,
        status,
        durationMs: Date.now() - startTime,
        hasHorizontalOverflow,
        consoleErrors,
        pageErrors
      });

      await page.close();
    }
    await context.close();
  }

  await browser.close();

  const reportPath = path.join(OUT_DIR, 'audit_report.json');
  fs.writeFileSync(reportPath, JSON.stringify(auditReport, null, 2), 'utf8');
  console.log(`\nAudit complete! Report saved to ${reportPath}`);
}

run().catch(err => {
  console.error('Fatal audit failure:', err);
  process.exit(1);
});
