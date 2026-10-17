const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

(async () => {
  console.log('🚀 Starting live Playwright verification on https://verifylingua.pages.dev/translate ...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();

  page.on('console', (msg) => {
    console.log(`[Browser Console ${msg.type()}]:`, msg.text());
  });

  page.on('pageerror', (err) => {
    console.error('[Browser Uncaught Error]:', err);
  });

  try {
    console.log('Navigating to https://verifylingua.pages.dev/translate ...');
    await page.goto('https://verifylingua.pages.dev/translate', { waitUntil: 'networkidle', timeout: 30000 });
    console.log('Page loaded successfully. Title:', await page.title());

    const fileInput = await page.$('input[type="file"]');
    if (!fileInput) {
      throw new Error('Could not find file input on page');
    }

    const testImagePath = 'C:/Users/aminj/.gemini/antigravity/brain/e2d13ccf-58f2-4a76-a43d-5023005e6f7e/original_worksheet.jpg';
    console.log('Staging file:', testImagePath);
    await fileInput.setInputFiles(testImagePath);

    await page.waitForTimeout(1000);

    // Select Arabic target language
    console.log('Selecting Arabic (ar) target language...');
    const selects = await page.$$('select');
    if (selects.length >= 2) {
      await selects[1].selectOption('ar');
    } else if (selects.length === 1) {
      await selects[0].selectOption('ar');
    }
    await page.waitForTimeout(500);

    // Click Begin Translation button
    console.log('Finding and clicking translation button...');
    const translateBtn = await page.waitForSelector('button:has-text("Begin Vector-Preserving Translation")', { timeout: 5000 });
    if (!translateBtn) {
      throw new Error('Translate button not found');
    }
    await translateBtn.click();
    console.log('Clicked translation button. Waiting for translation pipeline to complete...');

    // Wait up to 30 seconds for completion
    await page.waitForFunction(() => {
      const text = document.body.innerText;
      return text.includes('Translation Complete') || text.includes('100% Fidelity') || text.includes('VERIFYLINGUA CERTIFIED TRANSLATION');
    }, { timeout: 35000 });

    console.log('Translation completed successfully!');
    await page.waitForTimeout(2000);

    const artifactDir = 'C:/Users/aminj/.gemini/antigravity/brain/e2d13ccf-58f2-4a76-a43d-5023005e6f7e';

    // 1. Capture Document View
    console.log('Capturing Document view...');
    const docTabBtn = await page.$('button:has-text("Document")');
    if (docTabBtn) await docTabBtn.click();
    await page.waitForTimeout(800);
    const docShot = path.join(artifactDir, 'verified_live_document_view.png');
    await page.screenshot({ path: docShot, fullPage: false });
    console.log('Saved Document view to:', docShot);

    // 2. Capture Side-by-Side View
    console.log('Capturing Side-by-Side view...');
    const sbsTabBtn = await page.$('button:has-text("Side-by-Side")');
    if (sbsTabBtn) await sbsTabBtn.click();
    await page.waitForTimeout(800);
    const sbsShot = path.join(artifactDir, 'verified_live_side_by_side_view.png');
    await page.screenshot({ path: sbsShot, fullPage: false });
    console.log('Saved Side-by-Side view to:', sbsShot);

    // 3. Capture Visual Overlay View
    console.log('Capturing Visual Overlay view...');
    const overlayTabBtn = await page.$('button:has-text("Visual Overlay")');
    if (overlayTabBtn) await overlayTabBtn.click();
    await page.waitForTimeout(1000);
    const overlayShot = path.join(artifactDir, 'verified_live_overlay_view.png');
    await page.screenshot({ path: overlayShot, fullPage: false });
    console.log('Saved Visual Overlay view to:', overlayShot);

    console.log('🎉 Live verification screenshots captured successfully!');
  } catch (error) {
    console.error('❌ Error during live verification:', error);
    await page.screenshot({ path: 'C:/Users/aminj/.gemini/antigravity/brain/e2d13ccf-58f2-4a76-a43d-5023005e6f7e/live_verification_error.png' });
  } finally {
    await browser.close();
  }
})();
