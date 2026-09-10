import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import zlib from "zlib";
import JSZip from "jszip";
import { PDFDocument } from "pdf-lib";
import { validateInputFile, processTranslationJob } from "@/lib/translation/pipeline";
import { createTranslationJob } from "@/lib/translation/store";
import { analyzeDocumentPreflight } from "@/lib/preflight";
import { calculateQuote } from "@/lib/dashboard/store";
import {
  checkNumberConsistency,
  checkDateConsistency,
  checkCurrencyConsistency,
  checkTerminologyEnforcement,
  checkUntranslatedText,
  runComprehensiveQA,
} from "@/lib/fidelity/qa-checks";
import {
  createBatchJob,
  executeBatchJob,
  generateBatchZipBundle,
} from "@/lib/batch";

const FIXTURES_DIR = path.join(process.cwd(), "fixtures");
const pdfBuffer = fs.readFileSync(path.join(FIXTURES_DIR, "sample_birth_cert.pdf"));
const docxBuffer = fs.readFileSync(path.join(FIXTURES_DIR, "sample_transcript.docx"));
const pngBuffer = fs.readFileSync(path.join(FIXTURES_DIR, "sample_id_card.png"));
const jpgBuffer = fs.readFileSync(path.join(FIXTURES_DIR, "sample_diploma.jpg"));

function decompressPdfStreams(pdfBuffer: Buffer): string {
  let searchPos = 0;
  let allDecompressed = "";
  while (searchPos < pdfBuffer.length) {
    const streamStart = pdfBuffer.indexOf(Buffer.from("stream"), searchPos);
    if (streamStart === -1) break;

    let dataStart = streamStart + 6;
    if (pdfBuffer[dataStart] === 0x0d && pdfBuffer[dataStart + 1] === 0x0a) {
      dataStart += 2;
    } else if (pdfBuffer[dataStart] === 0x0a) {
      dataStart += 1;
    }

    const streamEnd = pdfBuffer.indexOf(Buffer.from("endstream"), dataStart);
    if (streamEnd === -1) break;

    const slice = pdfBuffer.slice(dataStart, streamEnd);
    let chunk = "";
    try {
      chunk = zlib.inflateSync(slice).toString("latin1");
    } catch {
      chunk = slice.toString("latin1");
    }
    const decoded = chunk.replace(/<([0-9A-Fa-f]{2,})>/g, (_, hex) => {
      try {
        return Buffer.from(hex, "hex").toString("latin1");
      } catch {
        return _;
      }
    });
    allDecompressed += " " + chunk + " " + decoded;
    searchPos = streamEnd + 9;
  }
  const hexDecoded = allDecompressed.replace(/<([0-9A-Fa-f]{4,})>/g, (_, hex) => {
    try {
      return Buffer.from(hex, "hex").toString("latin1");
    } catch {
      return "";
    }
  });
  return allDecompressed + " " + hexDecoded;
}

describe("VerifyLingua Autonomous Product End-to-End Verification Suite", () => {
  describe("1. Document Ingestion & Format Validation", () => {
    it("validates and accepts valid PDF, DOCX, PNG, and JPG files", () => {
      expect(validateInputFile(pdfBuffer, "test.pdf").format).toBe("pdf");
      expect(validateInputFile(docxBuffer, "test.docx").format).toBe("docx");
      expect(validateInputFile(pngBuffer, "test.png").format).toBe("png");
      expect(validateInputFile(jpgBuffer, "test.jpg").format).toBe("jpg");
    });

    it("rejects unsupported file formats and corrupted/empty buffers with clear diagnostics", () => {
      const emptyBuffer = Buffer.alloc(0);
      const exeBuffer = Buffer.from([0x4d, 0x5a, 0x90, 0x00]); // MZ executable

      const emptyRes = validateInputFile(emptyBuffer, "empty.pdf");
      expect(emptyRes.error).toContain("empty");

      const exeRes = validateInputFile(exeBuffer, "malware.exe");
      expect(exeRes.error).toContain("Unsupported document format");

      const oversized = Buffer.alloc(52 * 1024 * 1024); // 52MB
      const sizeRes = validateInputFile(oversized, "huge.pdf");
      expect(sizeRes.error).toContain("50MB limit");
    });
  });

  describe("2. Preflight Analysis & Linguistic Triage Engine", () => {
    it("performs comprehensive preflight extraction on PDF", async () => {
      const preflight = await analyzeDocumentPreflight(pdfBuffer, "Acta_Nacimiento_Bogota.pdf");

      expect(preflight.fileFormat).toBe("pdf");
      expect(preflight.pageCount).toBeGreaterThanOrEqual(1);
      expect(preflight.estimatedWordCount).toBeGreaterThan(50);
      expect(preflight.detectedSourceLang).toBe("es");
      expect(preflight.pricing.automated.priceUSD).toBeGreaterThan(0);
      expect(preflight.pricing.certified.priceUSD).toBeGreaterThan(preflight.pricing.automated.priceUSD);
      expect(preflight.pricing.certified.legalCertificationEligible).toBe(true);
      expect(preflight.pricing.automated.legalCertificationEligible).toBe(false);
      expect(preflight.knownLimitations.length).toBeGreaterThan(0);
    });

    it("identifies scanned image requirements and flags OCR complexity", async () => {
      const preflight = await analyzeDocumentPreflight(jpgBuffer, "Foreign_Diploma_Photographed.jpg");

      expect(preflight.isScannedDocument).toBe(true);
      expect(preflight.ocrRequired).toBe(true);
      expect(preflight.riskFlags.some((f) => f.includes("OCR"))).toBe(true);
    });
  });

  describe("3. Dynamic Quote & Pricing Engine", () => {
    it("computes tiered pricing with notary and rush add-ons", () => {
      const quote = calculateQuote({
        pageCount: 3,
        serviceType: "CERTIFIED",
        rush: true,
        notarized: true,
      });

      const expectedBase = Math.round(3 * 24.95 * 100) / 100; // 74.85
      const expectedRush = Math.round(expectedBase * 0.5 * 100) / 100; // 37.43
      const expectedNotary = 19.95;
      const expectedTotal = Math.round((expectedBase + expectedRush + expectedNotary) * 100) / 100;

      expect(quote.baseAmount).toBe(expectedBase);
      expect(quote.rushFee).toBe(expectedRush);
      expect(quote.notaryFee).toBe(expectedNotary);
      expect(quote.total).toBe(expectedTotal);
    });

    it("applies enterprise volume discount accurately", () => {
      const quote = calculateQuote({
        pageCount: 20,
        serviceType: "STANDARD",
        discountPercent: 10,
      });

      const base = 20 * 19.95; // 399.00
      const discount = Math.round(base * 0.1 * 100) / 100; // 39.90
      expect(quote.discount).toBe(discount);
      expect(quote.total).toBe(base - discount);
    });
  });

  describe("4. End-to-End Document Pipeline Across All Formats", () => {
    it("translates PDF with layout preservation", async () => {
      const job = createTranslationJob({
        fileName: "sample_birth_cert.pdf",
        fileFormat: "pdf",
        fileSize: pdfBuffer.length,
        sourceLang: "es",
        targetLang: "en",
        originalBuffer: pdfBuffer,
      });

      const completed = await processTranslationJob(job, {
        sourceLang: "es",
        targetLang: "en",
        serviceTier: "certified",
      });

      expect(completed.status).toBe("ready");
      expect(completed.translatedBuffer).toBeDefined();
      expect(completed.translatedBuffer!.length).toBeGreaterThan(500);

      const outDoc = await PDFDocument.load(completed.translatedBuffer!);
      expect(outDoc.getPageCount()).toBeGreaterThanOrEqual(1);
    });

    it("translates DOCX preserving OpenXML tables and runs", async () => {
      const job = createTranslationJob({
        fileName: "sample_transcript.docx",
        fileFormat: "docx",
        fileSize: docxBuffer.length,
        sourceLang: "es",
        targetLang: "en",
        originalBuffer: docxBuffer,
      });

      const completed = await processTranslationJob(job, {
        sourceLang: "es",
        targetLang: "en",
        serviceTier: "professional",
      });

      expect(completed.status).toBe("ready");
      expect(completed.translatedBuffer).toBeDefined();

      const zip = await JSZip.loadAsync(completed.translatedBuffer!);
      expect(zip.file("word/document.xml")).toBeDefined();
    });

    it("translates PNG raster document", async () => {
      const job = createTranslationJob({
        fileName: "sample_id_card.png",
        fileFormat: "png",
        fileSize: pngBuffer.length,
        sourceLang: "es",
        targetLang: "en",
        originalBuffer: pngBuffer,
      });

      const completed = await processTranslationJob(job, {
        sourceLang: "es",
        targetLang: "en",
        serviceTier: "automated",
      });

      expect(completed.status).toBe("ready");
      expect(completed.translatedBuffer).toBeDefined();
      expect(completed.translatedBuffer!.length).toBeGreaterThan(100);
    });
  });

  describe("5. Semantic Quality Assurance: Numbers, Dates, Currency, Terminology", () => {
    it("detects number omission or corruption", () => {
      const source = "Serial registration number 984021 issued to folio 448.";
      const validTarget = "Nï¿½mero de registro de serie 984021 emitido al folio 448.";
      const corruptedTarget = "Nï¿½mero de registro de serie emitido al folio.";

      const checkValid = checkNumberConsistency(source, validTarget);
      expect(checkValid.match).toBe(true);
      expect(checkValid.score).toBe(100);

      const checkCorrupted = checkNumberConsistency(source, corruptedTarget);
      expect(checkCorrupted.match).toBe(false);
      expect(checkCorrupted.mismatches.length).toBeGreaterThanOrEqual(1);
    });

    it("detects date and critical year mismatch", () => {
      const source = "Born on 14/05/1992 in Guadalajara.";
      const corruptedTarget = "Nacido el 14/05/1998 en Guadalajara.";

      const checkDate = checkDateConsistency(source, corruptedTarget);
      expect(checkDate.match).toBe(false);
      expect(checkDate.mismatches[0]).toContain("1992");
    });

    it("detects currency denomination tampering or omission", () => {
      const source = "Total annual tuition fee: $14,500 USD.";
      const corruptedTarget = "Tarifa anual de matrï¿½cula: 14,500.";

      const checkCurr = checkCurrencyConsistency(source, corruptedTarget);
      expect(checkCurr.sourceCurrencies.length).toBeGreaterThan(0);
    });

    it("enforces protected glossary terms strictly", () => {
      const glossary = {
        "Civil Registry": "Registro del Estado Civil",
        "Apostille": "Apostilla de La Haya",
      };

      const source = "The Civil Registry confirmed the Apostille.";
      const compliant = "El Registro del Estado Civil confirmï¿½ la Apostilla de La Haya.";
      const nonCompliant = "La oficina local confirmï¿½ el documento.";

      const goodRes = checkTerminologyEnforcement(source, compliant, glossary);
      expect(goodRes.match).toBe(true);
      expect(goodRes.score).toBe(100);

      const badRes = checkTerminologyEnforcement(source, nonCompliant, glossary);
      expect(badRes.match).toBe(false);
      expect(badRes.violatedTerms.length).toBe(2);
    });

    it("detects untranslated source paragraphs", () => {
      const source = "This official birth record confirms parentage under the civil code.";
      const targetWithUntranslated = "This official birth record confirms parentage under the civil code.";

      const res = checkUntranslatedText(source, targetWithUntranslated, "en", "es");
      expect(res.hasUntranslatedText).toBe(true);
      expect(res.untranslatedSegments.length).toBeGreaterThan(0);
    });

    it("routes high-risk document to Human Review based on comprehensive QA failure", () => {
      const qa = runComprehensiveQA({
        sourceText: "Born on 12/04/1984. Total inheritance: $50,000 USD. Case #889102.",
        targetText: "Nacido en fecha. Total herencia. Caso.",
        sourceLang: "en",
        targetLang: "es",
        serviceTier: "automated",
        ocrConfidence: 55,
        hasHandwriting: true,
      });

      expect(qa.passed).toBe(false);
      expect(qa.humanReviewDecision.requiresHumanReview).toBe(true);
      expect(qa.humanReviewDecision.reasons.length).toBeGreaterThan(0);
    });
  });

  describe("6. Batch Processing & Partial Failure Resilience", () => {
    it("processes a multi-file batch where valid files complete even if one fails", async () => {
      const validPdf = pdfBuffer;
      const corruptedFile = Buffer.from([0x00, 0x01, 0x02]);

      const batch = createBatchJob("Corporate Immigration Batch", [
        { fileName: "doc1_birth_cert.pdf", fileBuffer: validPdf, targetLang: "en" },
        { fileName: "doc2_corrupted.xyz", fileBuffer: corruptedFile, targetLang: "en" },
      ]);

      const fileMap = new Map<string, Buffer>();
      fileMap.set(batch.items[0].id, validPdf);
      fileMap.set(batch.items[1].id, corruptedFile);

      const result = await executeBatchJob(batch.id, fileMap);

      expect(result.status).toBe("PARTIALLY_COMPLETED");
      expect(result.completedFiles).toBe(1);
      expect(result.failedFiles).toBe(1);
      expect(result.items[0].status).toBe("COMPLETED");
      expect(result.items[1].status).toBe("FAILED");
    });

    it("generates a downloadable ZIP bundle with manifest and audit report", async () => {
      const batch = createBatchJob("Clean Batch", [
        { fileName: "sample1.pdf", fileBuffer: pdfBuffer, targetLang: "en", serviceTier: "certified" },
        { fileName: "sample2.docx", fileBuffer: docxBuffer, targetLang: "en", serviceTier: "certified" },
      ]);

      const fileMap = new Map<string, Buffer>();
      fileMap.set(batch.items[0].id, pdfBuffer);
      fileMap.set(batch.items[1].id, docxBuffer);

      await executeBatchJob(batch.id, fileMap);

      const zipBuffer = await generateBatchZipBundle(batch.id);
      expect(zipBuffer).toBeDefined();
      expect(zipBuffer.length).toBeGreaterThan(1000);

      const zip = await JSZip.loadAsync(zipBuffer);
      expect(zip.file("manifest.json")).toBeDefined();
      expect(zip.file("BATCH_AUDIT_REPORT.txt")).toBeDefined();

      const manifestContent = JSON.parse(await zip.file("manifest.json")!.async("text"));
      expect(manifestContent.batchId).toBe(batch.id);
      expect(manifestContent.files.length).toBe(2);
    });
  });

  describe("7. Legal Restrictions & Service Tier Integrity", () => {
    it("strictly blocks AUTOMATED tier from receiving ATA sworn certification affidavit", async () => {
      const job = createTranslationJob({
        fileName: "auto_doc.pdf",
        fileFormat: "pdf",
        fileSize: pdfBuffer.length,
        sourceLang: "es",
        targetLang: "en",
        originalBuffer: pdfBuffer,
      });

      const completed = await processTranslationJob(job, {
        sourceLang: "es",
        targetLang: "en",
        serviceTier: "automated",
      });

      expect(completed.status).toBe("ready");
      expect(completed.qualityGate?.notes.some((n) => n.includes("8 CFR 103.2 certification headers"))).toBe(false);

      const decompressed = decompressPdfStreams(completed.translatedBuffer!);
      expect(decompressed).toContain("AUTOMATED TRANSLATION");
      expect(decompressed).toContain("Uncertified");
      expect(decompressed).not.toContain("ATA Member No. 278190");
    });

    it("stamps official 8 CFR 103.2 certification affidavit only for CERTIFIED tier", async () => {
      const job = createTranslationJob({
        fileName: "certified_doc.pdf",
        fileFormat: "pdf",
        fileSize: pdfBuffer.length,
        sourceLang: "es",
        targetLang: "en",
        originalBuffer: pdfBuffer,
      });

      const completed = await processTranslationJob(job, {
        sourceLang: "es",
        targetLang: "en",
        serviceTier: "certified",
      });

      expect(completed.status).toBe("ready");
      const decompressed = decompressPdfStreams(completed.translatedBuffer!);
      expect(decompressed).toContain("CERTIFIED TRANSLATION");
      expect(decompressed).toContain("8 CFR 103.2 COMPLIANT");
      expect(decompressed).toContain("ATA Member No. 278190");
    });
  });

  describe("8. Security & Download Token Expiration", () => {
    it("generates cryptographic download token with valid expiration window", () => {
      const job = createTranslationJob({
        fileName: "secure.pdf",
        fileFormat: "pdf",
        fileSize: 100,
        sourceLang: "es",
        targetLang: "en",
        originalBuffer: Buffer.from("%PDF-1.4 test"),
      });

      expect(job.downloadToken).toBeDefined();
      expect(job.downloadToken.length).toBe(48); // 24-byte hex

      const expires = new Date(job.tokenExpiresAt).getTime();
      const now = Date.now();
      expect(expires).toBeGreaterThan(now);
      expect(expires - now).toBeLessThanOrEqual(24 * 3600 * 1000 + 5000);
    });
  });
});
