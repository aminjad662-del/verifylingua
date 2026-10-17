const fs = require('fs');
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const pngBuf = fs.readFileSync('public/images/docs/worksheet-beach-illustration.png');
  await page.setContent(`<!DOCTYPE html><html><body style="margin:0;padding:0;background:#ffffff;"><img src="data:image/png;base64,${pngBuf.toString('base64')}" style="display:block;"></body></html>`);
  const img = await page.$('img');
  const jpgBuf = await img.screenshot({ type: 'jpeg', quality: 85 });
  console.log('Original PNG size:', pngBuf.length);
  console.log('JPEG 85% size:', jpgBuf.length);
  fs.writeFileSync('public/images/docs/worksheet-beach-illustration.jpg', jpgBuf);
  const b64 = jpgBuf.toString('base64');
  console.log('JPEG b64 length:', b64.length);
  fs.writeFileSync('scratch/illus_jpg_b64.txt', b64);
  await browser.close();
})();
