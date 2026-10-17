const fs = require('fs');
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 772, height: 1000 } });
  const imgBuf = fs.readFileSync('C:/Users/aminj/.gemini/antigravity/brain/e2d13ccf-58f2-4a76-a43d-5023005e6f7e/original_worksheet.jpg');
  await page.setContent(`<!DOCTYPE html><html><body style="margin:0;padding:0;"><img src="data:image/jpeg;base64,${imgBuf.toString('base64')}" style="display:block;width:772px;height:1000px;"></body></html>`);

  // Let's test a clean clip of the illustration:
  // x: 445 (just left of the sailboat), y: 200, width: 285, height: 275
  const crop = await page.screenshot({ clip: { x: 445, y: 200, width: 285, height: 275 } });
  fs.writeFileSync('C:/Users/aminj/.gemini/antigravity/brain/e2d13ccf-58f2-4a76-a43d-5023005e6f7e/scratch/clean_illustration.png', crop);
  console.log('Saved clean illustration');
  await browser.close();
})();
