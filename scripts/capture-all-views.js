const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

const ARTIFACT_DIR = "C:/Users/aminj/.gemini/antigravity/brain/29ef1047-f9cd-4dc9-a20f-3bc15a1a57c9";
const BASE_URL = "http://127.0.0.1:8788";

async function main() {
  if (!fs.existsSync(ARTIFACT_DIR)) {
    fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
  }

  console.log("Launching Chrome...");
  const browser = await chromium.launch({
    channel: "chrome",
    headless: true,
    args: ["--disable-gpu", "--no-sandbox", "--disable-dev-shm-usage"]
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });

  await context.addCookies([
    {
      name: "vl_session",
      value: "demo-session-token-2026",
      domain: "127.0.0.1",
      path: "/",
    },
    {
      name: "__session",
      value: "demo-session-token-2026",
      domain: "127.0.0.1",
      path: "/",
    }
  ]);

  const page = await context.newPage();

  try {
    // 1. Homepage
    console.log("1. Capturing Homepage...");
    await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, "view_01_homepage.png") });
    console.log("✔ Captured view_01_homepage.png");

    // 2. Pricing
    console.log("2. Capturing Pricing Page (/pricing)...");
    await page.goto(`${BASE_URL}/pricing`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, "view_02_pricing.png") });
    console.log("✔ Captured view_02_pricing.png");

    // 3. How It Works
    console.log("3. Capturing How It Works (/how-it-works)...");
    await page.goto(`${BASE_URL}/how-it-works`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, "view_03_how_it_works.png") });
    console.log("✔ Captured view_03_how_it_works.png");

    // 4. Order Triage
    console.log("4. Capturing Order Triage (/order/triage)...");
    await page.goto(`${BASE_URL}/order/triage`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, "view_04_order_triage.png") });
    console.log("✔ Captured view_04_order_triage.png");

    // 5. Order Configure
    console.log("5. Capturing Order Configure (/order/configure)...");
    await page.goto(`${BASE_URL}/order/configure`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, "view_05_order_configure.png") });
    console.log("✔ Captured view_05_order_configure.png");

    // 6. Order Checkout
    console.log("6. Capturing Order Checkout (/order/checkout)...");
    await page.goto(`${BASE_URL}/order/checkout`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, "view_06_order_checkout.png") });
    console.log("✔ Captured view_06_order_checkout.png");

    // 7. Customer Proofing Studio
    console.log("7. Capturing Customer Proofing Studio (/order/VL-DEMO1/proof)...");
    await page.goto(`${BASE_URL}/order/VL-DEMO1/proof`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, "view_07_customer_proofing.png") });
    console.log("✔ Captured view_07_customer_proofing.png");

    // 8. Public Certificate Verification
    console.log("8. Capturing Public Certificate Verification (/verify/VL-CERT-8921)...");
    await page.goto(`${BASE_URL}/verify/VL-CERT-8921`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, "view_08_certificate_verify.png") });
    console.log("✔ Captured view_08_certificate_verify.png");

    // 9. Client Dashboard
    console.log("9. Capturing Client Dashboard (/dashboard)...");
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, "view_09_client_dashboard.png") });
    console.log("✔ Captured view_09_client_dashboard.png");

    // 10. CounselDesk Law Firm Portal
    console.log("10. Capturing CounselDesk (/counsel)...");
    await page.goto(`${BASE_URL}/counsel`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, "view_10_counseldesk.png") });
    console.log("✔ Captured view_10_counseldesk.png");

    // 11. Linguist CAT Workbench
    console.log("11. Capturing Linguist Workbench (/translator/workbench/VL-DEMO1)...");
    await page.goto(`${BASE_URL}/translator/workbench/VL-DEMO1`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, "view_11_linguist_workbench.png") });
    console.log("✔ Captured view_11_linguist_workbench.png");

    console.log("\n=======================================================");
    console.log("🎉 ALL 11 HIGH-FIDELITY VIEWS CAPTURED SUCCESSFULLY!");
    console.log("=======================================================");
  } finally {
    await browser.close();
  }
}

main().catch(err => {
  console.error("Capture failed:", err);
  process.exit(1);
});