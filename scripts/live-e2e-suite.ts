import fs from "fs";
import path from "path";
import JSZip from "jszip";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { Jimp } from "jimp";

const SERVER_URL = "http://localhost:3005";
const CANARY = "VERIFYLINGUA_TEST_2026: The blue cat is sitting beside the red table.";

interface TestReport {
  test: string;
  verdict: "PASS" | "FAIL";
  evidence: any;
}

const reports: TestReport[] = [];

async function runSuite() {
  console.log("================================================================================");
  console.log("VERIFYLINGUA: FULL LIVE END-TO-END HTTP REST AUDIT (LOCAL SERVER)");
  console.log("================================================================================\n");

  const outDir = path.resolve(process.cwd(), "fixtures/live_audit");
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // --------------------------------------------------------------------------
  // TEST 1: REJECTION OF DELIBERATELY UNSUPPORTED / CORRUPTED FORMAT (HTTP 415)
  // --------------------------------------------------------------------------
  console.log("--- 1. UPLOAD REJECTION OF INVALID BINARY SIGNATURE (HTTP 415) ---");
  const fakeBinary = Buffer.from([0x00, 0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77]);
  const fakeBase64 = fakeBinary.toString("base64");

  const uploadInvalidRes = await fetch(`${SERVER_URL}/api/translate/upload`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fileName: "corrupted_renamed.docx",
      fileBase64: fakeBase64,
      sourceLang: "en",
      targetLang: "es",
    }),
  });

  const uploadInvalidData = await uploadInvalidRes.json();
  console.log(`Upload HTTP Status for invalid file: ${uploadInvalidRes.status}`);
  console.log(`Upload response:`, uploadInvalidData);

  const formatRejected = uploadInvalidRes.status === 415 && (uploadInvalidData.error || "").length > 0;
  reports.push({
    test: "1. Upload rejection of invalid file format (HTTP 415)",
    verdict: formatRejected ? "PASS" : "FAIL",
    evidence: { status: uploadInvalidRes.status, error: uploadInvalidData.error },
  });
  console.log(`✓ Format rejection verified: ${formatRejected}\n`);

  // --------------------------------------------------------------------------
  // TEST 2: REAL DOCX END-TO-END UPLOAD, STATUS POLLING, AND TOKEN-AUTHORIZED DOWNLOAD
  // --------------------------------------------------------------------------
  console.log("--- 2. REAL DOCX END-TO-END UPLOAD & TRANSLATION ---");
  const docxZip = new JSZip();
  const docxXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p><w:r><w:t>OFFICIAL TEST EMPLOYMENT CONTRACT</w:t></w:r></w:p>
    <w:p><w:r><w:t>${CANARY}</w:t></w:r></w:p>
    <w:tbl>
      <w:tr>
        <w:tc><w:p><w:r><w:t>Employee Position</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:t>Annual Compensation</w:t></w:r></w:p></w:tc>
      </w:tr>
      <w:tr>
        <w:tc><w:p><w:r><w:t>Senior Legal Counsel</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:t>$185,000 USD</w:t></w:r></w:p></w:tc>
      </w:tr>
    </w:tbl>
  </w:body>
</w:document>`;
  docxZip.file("word/document.xml", docxXml);
  docxZip.file(
    "[Content_Types].xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="xml" ContentType="application/xml"/></Types>`
  );
  const docxBuf = await docxZip.generateAsync({ type: "nodebuffer" });
  const docxBase64 = docxBuf.toString("base64");

  const uploadDocxRes = await fetch(`${SERVER_URL}/api/translate/upload`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fileName: "real_employment_contract.docx",
      fileBase64: docxBase64,
      sourceLang: "en",
      targetLang: "es",
      serviceTier: "certified",
      certifiedDelivery: true,
    }),
  });

  const uploadDocxData = await uploadDocxRes.json();
  console.log(`Upload HTTP Status: ${uploadDocxRes.status}`);
  console.log(`Upload Response:`, uploadDocxData);

  const jobId = uploadDocxData.jobId;
  const downloadToken = uploadDocxData.downloadToken;
  if (!jobId) {
    throw new Error("Upload failed: No jobId returned!");
  }

  // Poll status until ready or failed
  console.log(`Polling status for job ${jobId}...`);
  let statusData: any = null;
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 1500));
    const stRes = await fetch(`${SERVER_URL}/api/translate/status/${jobId}`);
    statusData = await stRes.json();
    console.log(`[Poll ${i + 1}] Status: ${statusData.status}, Progress: ${statusData.progress}%`);
    if (statusData.status === "ready" || statusData.status === "completed" || statusData.status === "failed") {
      break;
    }
  }

  if (statusData.status !== "ready" && statusData.status !== "completed") {
    throw new Error(`Job failed or timed out with status: ${statusData.status} (${statusData.errorMessage})`);
  }

  // Security test: Unauthorized download without token must return 403
  console.log("Checking security isolation: download without token...");
  const unauthRes = await fetch(`${SERVER_URL}/api/translate/download/${jobId}`);
  console.log(`Unauthorized download HTTP Status: ${unauthRes.status} (expected 403)`);
  const unauthBlocked = unauthRes.status === 403;

  // Authorized download with token
  console.log(`Downloading translated document with token for job ${jobId}...`);
  const effectiveToken = downloadToken || statusData.downloadToken;
  const downloadRes = await fetch(`${SERVER_URL}/api/translate/download/${jobId}?token=${effectiveToken}`);
  console.log(`Download HTTP Status: ${downloadRes.status}`);
  const downloadedBuf = Buffer.from(await downloadRes.arrayBuffer());
  const savedDocx = path.join(outDir, "downloaded_contract.docx");
  fs.writeFileSync(savedDocx, downloadedBuf);
  console.log(`✓ Saved downloaded file to ${savedDocx} (${downloadedBuf.length} bytes)`);

  // Unpack and verify canary translation
  const checkZip = await JSZip.loadAsync(downloadedBuf);
  const checkXml = await checkZip.file("word/document.xml")!.async("text");
  console.log("Raw Extracted XML snippet:");
  console.log(checkXml);

  const hasCanaryPrefix = checkXml.includes("VERIFYLINGUA_TEST_2026");
  const hasSpanishCat = checkXml.toLowerCase().includes("gato azul");
  const hasEnglishCat = checkXml.includes("The blue cat is sitting beside the red table.");

  console.log(`- Canary prefix present: ${hasCanaryPrefix}`);
  console.log(`- Spanish 'gato azul' present: ${hasSpanishCat}`);
  console.log(`- English source text removed: ${!hasEnglishCat}`);

  const docxSuccess = hasCanaryPrefix && hasSpanishCat && !hasEnglishCat && unauthBlocked;
  reports.push({
    test: "2. Real DOCX Upload, Polling, Token-Protected Download & Text Extraction",
    verdict: docxSuccess ? "PASS" : "FAIL",
    evidence: {
      jobId,
      status: statusData.status,
      downloadBytes: downloadedBuf.length,
      unauthBlocked,
      hasCanaryPrefix,
      hasSpanishCat,
    },
  });

  // --------------------------------------------------------------------------
  // TEST 3: REAL MULTI-PAGE PDF END-TO-END UPLOAD & TRANSLATION
  // --------------------------------------------------------------------------
  console.log("\n--- 3. REAL MULTI-PAGE PDF END-TO-END UPLOAD & TRANSLATION ---");
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Page 1
  const p1 = pdfDoc.addPage([612, 792]);
  p1.drawText("CERTIFIED ACADEMIC & LEGAL TRANSCRIPT", { x: 50, y: 720, size: 14, font });
  p1.drawText(CANARY, { x: 50, y: 680, size: 10, font });
  p1.drawText("Official Case Number: 2026-USCIS-990118", { x: 50, y: 640, size: 10, font });

  // Page 2
  const p2 = pdfDoc.addPage([612, 792]);
  p2.drawText("ACADEMIC EVALUATION & DEGREE CONFERRAL", { x: 50, y: 720, size: 14, font });
  p2.drawText("Course Title: International Commercial Arbitration", { x: 50, y: 680, size: 10, font });
  p2.drawText("Grade: Honors / GPA: 3.95", { x: 50, y: 640, size: 10, font });

  const pdfBuf = Buffer.from(await pdfDoc.save());
  const pdfBase64 = pdfBuf.toString("base64");

  const uploadPdfRes = await fetch(`${SERVER_URL}/api/translate/upload`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fileName: "certified_transcript.pdf",
      fileBase64: pdfBase64,
      sourceLang: "en",
      targetLang: "es",
      serviceTier: "certified",
    }),
  });

  const uploadPdfData = await uploadPdfRes.json();
  console.log(`PDF Upload HTTP Status: ${uploadPdfRes.status}, Job: ${uploadPdfData.jobId}`);

  const pdfJobId = uploadPdfData.jobId;
  const pdfToken = uploadPdfData.downloadToken;
  let pdfStatusData: any = null;
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 1500));
    const stRes = await fetch(`${SERVER_URL}/api/translate/status/${pdfJobId}`);
    pdfStatusData = await stRes.json();
    console.log(`[PDF Poll ${i + 1}] Status: ${pdfStatusData.status}, Progress: ${pdfStatusData.progress}%`);
    if (pdfStatusData.status === "ready" || pdfStatusData.status === "completed" || pdfStatusData.status === "failed") {
      break;
    }
  }

  const effectivePdfToken = pdfToken || pdfStatusData.downloadToken;
  const downloadPdfRes = await fetch(`${SERVER_URL}/api/translate/download/${pdfJobId}?token=${effectivePdfToken}`);
  console.log(`PDF Download HTTP Status: ${downloadPdfRes.status}`);
  const downloadedPdfBuf = Buffer.from(await downloadPdfRes.arrayBuffer());
  const savedPdf = path.join(outDir, "downloaded_transcript.pdf");
  fs.writeFileSync(savedPdf, downloadedPdfBuf);
  console.log(`✓ Saved downloaded PDF to ${savedPdf} (${downloadedPdfBuf.length} bytes)`);

  const readBackPdf = await PDFDocument.load(downloadedPdfBuf);
  const pageCountMatches = readBackPdf.getPageCount() === 2;
  console.log(`- Page count: ${readBackPdf.getPageCount()} (Source was 2, match = ${pageCountMatches})`);

  reports.push({
    test: "3. Real Multi-Page PDF Upload, Polling, Download & Page Parity",
    verdict: pageCountMatches ? "PASS" : "FAIL",
    evidence: {
      pdfJobId,
      pageCount: readBackPdf.getPageCount(),
      bytes: downloadedPdfBuf.length,
    },
  });

  // --------------------------------------------------------------------------
  // TEST 4: CLEAR REJECTION OF UNSUPPORTED RASTER/OCR IMAGES (PER USER REQ 4)
  // --------------------------------------------------------------------------
  console.log("\n--- 4. REAL PNG IMAGE UPLOAD CLEAR REJECTION (USER REQ 4) ---");
  const img = new Jimp({ width: 500, height: 200, color: 0xffffffff });
  const pngSourceBuf = await img.getBuffer("image/png");
  const pngBase64 = pngSourceBuf.toString("base64");

  const uploadPngRes = await fetch(`${SERVER_URL}/api/translate/upload`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fileName: "official_badge.png",
      fileBase64: pngBase64,
      sourceLang: "en",
      targetLang: "es",
    }),
  });

  const uploadPngData = await uploadPngRes.json();
  console.log(`PNG Upload HTTP Status: ${uploadPngRes.status}`);
  console.log(`PNG Upload Response:`, uploadPngData);

  const pngCorrectlyRejected =
    uploadPngRes.status === 415 &&
    uploadPngData.error &&
    uploadPngData.error.includes("Raster image and scanned OCR translation (PNG/JPG) is not supported");

  reports.push({
    test: "4. Real PNG/Scanned Image clear rejection (HTTP 415, no fake image returned)",
    verdict: pngCorrectlyRejected ? "PASS" : "FAIL",
    evidence: {
      status: uploadPngRes.status,
      error: uploadPngData.error,
    },
  });

  console.log("\n================================================================================");
  console.log("FINAL AUDIT SUMMARY REPORT");
  console.log("================================================================================");
  for (const r of reports) {
    console.log(`[${r.verdict}] ${r.test}`);
  }
}

runSuite().catch((err) => {
  console.error("FATAL SUITE ERROR:", err);
  process.exit(1);
});
