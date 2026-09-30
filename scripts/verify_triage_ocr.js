const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

async function testTriage() {
  const triageEvidenceDir = path.join(__dirname, '..', 'docs', 'evidence', 'triage');
  if (!fs.existsSync(triageEvidenceDir)) fs.mkdirSync(triageEvidenceDir, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  console.log('1. Navigating to /order/triage initial state...');
  await page.goto('http://localhost:3005/order/triage', { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(triageEvidenceDir, 'triage_initial_upload_zone.png') });

  // Read a real test image base64
  const sampleImagePath = 'C:/Users/aminj/.gemini/antigravity-cli/brain/3c3e34db-6035-4fcc-9a76-fa08c84d5241/.user_uploaded/uploaded_media_1790280403380.jpg';
  let sampleBase64 = '';
  if (fs.existsSync(sampleImagePath)) {
    sampleBase64 = fs.readFileSync(sampleImagePath).toString('base64');
  } else {
    // Fallback 1x1 png
    sampleBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  }

  console.log('2. Simulating document intake with real image base64...');
  await page.evaluate((b64) => {
    sessionStorage.setItem('pending_upload', JSON.stringify({
      fileName: 'Reading_Worksheet_A_Day_At_The_Beach.jpg',
      fileSize: 216836,
      fileBase64: b64,
      sourceLang: 'en',
      targetLang: 'es'
    }));
  }, sampleBase64);

  console.log('3. Reloading /order/triage to trigger OCR analysis pipeline...');
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Take screenshot of Triage Complete Studio
  const studioScreenshotPath = path.join(triageEvidenceDir, 'triage_ocr_studio_view.png');
  await page.screenshot({ path: studioScreenshotPath, fullPage: false });
  console.log('Saved studio view screenshot to:', studioScreenshotPath);

  // Measure telemetry data on the page
  const telemetry = await page.evaluate(() => {
    const textContent = document.body.innerText;
    return {
      hasFormatAccepted: textContent.includes('Format Accepted'),
      hasLightingOptimal: textContent.includes('Lighting & Contrast Optimal') || textContent.includes('Optimal Lighting'),
      hasMarginClearance: textContent.includes('Full Margin Clearance'),
      hasFakeGlare: textContent.includes('Flash Glare Detected: A bright spot is obscuring text in the middle of page 1'),
      hasFakeSealCropped: textContent.includes('The bottom edge of the apostille stamp on page 3 appears cut off'),
      pageCountText: textContent.includes('1 Page') || textContent.includes('1 / 1'),
      hasOcrLayer: textContent.includes('OCR Layer') || textContent.includes('OCR Telemetry'),
      wordsMentioned: textContent.includes('Words'),
    };
  });

  console.log('Telemetry verification:', telemetry);

  // Responsive check at 375px
  await page.setViewportSize({ width: 375, height: 812 });
  await page.waitForTimeout(500);
  const mobileOverflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth > window.innerWidth;
  });
  console.log('Mobile (375px) Horizontal Overflow:', mobileOverflow ? 'FAIL' : 'PASS');
  await page.screenshot({ path: path.join(triageEvidenceDir, 'triage_mobile_375.png') });

  await browser.close();

  console.log('\nAll Triage & OCR visual verifications complete!');
}

testTriage().catch(console.error);
