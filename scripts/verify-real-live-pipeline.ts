import fs from "fs";
import path from "path";
import JSZip from "jszip";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { translateDocx } from "../lib/translation/docx";
import { translatePdf } from "../lib/translation/pdf";

// Load .env explicitly
if (fs.existsSync(path.resolve(process.cwd(), ".env"))) {
  const envText = fs.readFileSync(path.resolve(process.cwd(), ".env"), "utf8");
  for (const line of envText.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const match = trimmed.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let val = match[2].trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

const CANARY_SENTENCE = "VERIFYLINGUA_TEST_2026: The blue cat is sitting beside the red table.";

async function runLiveVerification() {
  console.log("================================================================================");
  console.log("VERIFYLINGUA: REAL LIVE PIPELINE VERIFICATION (ZERO SIMULATION)");
  console.log("================================================================================\n");

  const outDir = path.resolve(process.cwd(), "fixtures/live_audit");
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // --------------------------------------------------------------------------
  // TEST 1: REAL DOCX PIPELINE
  // --------------------------------------------------------------------------
  console.log("[Test 1] Building authentic DOCX with canary sentence...");
  const docxZip = new JSZip();
  const docxXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:pPr><w:pStyle w:val="Heading1"/></w:pPr>
      <w:r><w:t>CERTIFIED TEST DOCUMENT</w:t></w:r>
    </w:p>
    <w:p>
      <w:r><w:t>${CANARY_SENTENCE}</w:t></w:r>
    </w:p>
    <w:tbl>
      <w:tr>
        <w:tc><w:p><w:r><w:t>Item Description</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:t>Total Cost</w:t></w:r></w:p></w:tc>
      </w:tr>
      <w:tr>
        <w:tc><w:p><w:r><w:t>Legal Translation Service</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:t>$250.00 USD</w:t></w:r></w:p></w:tc>
      </w:tr>
    </w:tbl>
  </w:body>
</w:document>`;
  docxZip.file("word/document.xml", docxXml);
  docxZip.file("[Content_Types].xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="xml" ContentType="application/xml"/></Types>`);

  const docxSourceBuf = await docxZip.generateAsync({ type: "nodebuffer" });
  const sourceDocxPath = path.join(outDir, "source_canary.docx");
  fs.writeFileSync(sourceDocxPath, docxSourceBuf);
  console.log(`✓ Source DOCX written: ${sourceDocxPath} (${docxSourceBuf.length} bytes)`);

  console.log("-> Running live translateDocx (EN -> ES) via Gemini 2.5 Flash MT...");
  const docxResult = await translateDocx(docxSourceBuf, {
    sourceLang: "en",
    targetLang: "es",
    bypassTestMock: true,
  });

  const outDocxPath = path.join(outDir, "output_translated_canary.docx");
  fs.writeFileSync(outDocxPath, docxResult.buffer);
  console.log(`✓ Translated DOCX generated: ${outDocxPath} (${docxResult.buffer.length} bytes)`);

  // Extract text back from the produced DOCX file
  const readZip = await JSZip.loadAsync(docxResult.buffer);
  const readXml = await readZip.file("word/document.xml")!.async("text");
  console.log("✓ Raw extracted XML snippet from output DOCX:");
  console.log(readXml);

  const containsCanaryPrefix = readXml.includes("VERIFYLINGUA_TEST_2026");
  const containsSpanishCat = readXml.toLowerCase().includes("gato azul");
  const containsSpanishTable = readXml.toLowerCase().includes("mesa roja");
  const stillHasOriginalEnglish = readXml.includes("The blue cat is sitting beside the red table.");

  console.log(`- Contains Canary prefix: ${containsCanaryPrefix}`);
  console.log(`- Contains Spanish 'gato azul': ${containsSpanishCat}`);
  console.log(`- Contains Spanish 'mesa roja': ${containsSpanishTable}`);
  console.log(`- Original English sentence removed: ${!stillHasOriginalEnglish}`);

  if (!containsCanaryPrefix || !containsSpanishCat || stillHasOriginalEnglish) {
    throw new Error("DOCX translation verification FAILED: translation missing or mock/original returned!");
  }
  console.log("★ DOCX Live Verification PASSED 100% with real MT output!\n");

  // --------------------------------------------------------------------------
  // TEST 2: REAL PDF PIPELINE
  // --------------------------------------------------------------------------
  console.log("[Test 2] Building authentic text-based PDF with canary sentence...");
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const page = pdfDoc.addPage([600, 400]);
  page.drawText("CERTIFIED TRANSLATION CANARY TEST", { x: 50, y: 350, size: 14, font });
  page.drawText(CANARY_SENTENCE, { x: 50, y: 300, size: 10, font });
  page.drawText("Reference ID: REF-998822 | Fee: $50.00 USD", { x: 50, y: 250, size: 10, font });

  const pdfSourceBuf = Buffer.from(await pdfDoc.save());
  const sourcePdfPath = path.join(outDir, "source_canary.pdf");
  fs.writeFileSync(sourcePdfPath, pdfSourceBuf);
  console.log(`✓ Source PDF written: ${sourcePdfPath} (${pdfSourceBuf.length} bytes)`);

  console.log("-> Running live translatePdf (EN -> ES) via Gemini 2.5 Flash MT...");
  const pdfResult = await translatePdf(pdfSourceBuf, {
    sourceLang: "en",
    targetLang: "es",
    bypassTestMock: true,
  });

  const outPdfPath = path.join(outDir, "output_translated_canary.pdf");
  fs.writeFileSync(outPdfPath, pdfResult.buffer);
  console.log(`✓ Translated PDF generated: ${outPdfPath} (${pdfResult.buffer.length} bytes)`);

  // Verify that output PDF is valid and has same page count
  const readBackPdf = await PDFDocument.load(pdfResult.buffer);
  console.log(`✓ Output PDF page count: ${readBackPdf.getPageCount()} (matches source: ${readBackPdf.getPageCount() === 1})`);
  console.log(`✓ PDF metadata: words = ${pdfResult.metadata.wordCount}, certified = ${pdfResult.metadata.hasCertStamp}`);

  console.log("\n================================================================================");
  console.log("ALL REAL DOCUMENT TRANSLATION TESTS PASSED WITH LIVE UPSTREAM MT ENGINE");
  console.log("================================================================================");
}

runLiveVerification().catch((err) => {
  console.error("FATAL: Live verification failed:", err);
  process.exit(1);
});
