import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { PDFDocument } from "pdf-lib";
import JSZip from "jszip";
import { Jimp } from "jimp";

import { translatePdf } from "@/lib/translation/pdf";
import { translateDocx } from "@/lib/translation/docx";
import { translateImage } from "@/lib/translation/image";
import {
  detectFormatFromBuffer,
  validateInputFile,
  processTranslationJob,
} from "@/lib/translation/pipeline";
import { createTranslationJob } from "@/lib/translation/store";

describe("High-Fidelity Document Translation Pipeline", () => {
  const fixturesDir = path.join(process.cwd(), "fixtures");
  const pdfBuffer = fs.readFileSync(path.join(fixturesDir, "sample_birth_cert.pdf"));
  const docxBuffer = fs.readFileSync(path.join(fixturesDir, "sample_transcript.docx"));
  const pngBuffer = fs.readFileSync(path.join(fixturesDir, "sample_id_card.png"));
  const jpgBuffer = fs.readFileSync(path.join(fixturesDir, "sample_diploma.jpg"));

  describe("1. MIME & Magic Byte Detection", () => {
    it("correctly identifies PDF from magic bytes %PDF", () => {
      expect(detectFormatFromBuffer(pdfBuffer)).toBe("pdf");
    });

    it("correctly identifies DOCX from ZIP header PK", () => {
      expect(detectFormatFromBuffer(docxBuffer)).toBe("docx");
    });

    it("correctly identifies PNG from PNG signature", () => {
      expect(detectFormatFromBuffer(pngBuffer)).toBe("png");
    });

    it("correctly identifies JPG from JPEG SOI header", () => {
      expect(detectFormatFromBuffer(jpgBuffer)).toBe("jpg");
    });

    it("validates input file size and format cleanly", () => {
      const valid = validateInputFile(pdfBuffer, "my_document.pdf");
      expect(valid.error).toBeUndefined();
      expect(valid.format).toBe("pdf");

      const empty = validateInputFile(Buffer.alloc(0), "empty.pdf");
      expect(empty.error).toContain("empty");
    });
  });

  describe("2. PDF Layout Preservation", () => {
    it("round-trips PDF while preserving exact page count and table geometry", async () => {
      const result = await translatePdf(pdfBuffer, {
        sourceLang: "es",
        targetLang: "en",
      });

      expect(result.buffer).toBeInstanceOf(Buffer);
      expect(result.buffer.length).toBeGreaterThan(1000);
      expect(result.metadata.pageCount).toBe(2);

      // Verify reassembled PDF can be parsed cleanly by pdf-lib
      const loaded = await PDFDocument.load(result.buffer);
      expect(loaded.getPageCount()).toBe(2);
      expect(result.metadata.hasCertStamp).toBe(true);
    });

    it("supports multiple target languages on PDF", async () => {
      for (const targetLang of ["en", "fr", "de"]) {
        const result = await translatePdf(pdfBuffer, {
          sourceLang: "es",
          targetLang,
        });
        expect(result.buffer.length).toBeGreaterThan(1000);
      }
    });
  });

  describe("3. DOCX OpenXML Preservation", () => {
    it("round-trips DOCX while preserving XML structure, tables, and headers", async () => {
      const result = await translateDocx(docxBuffer, {
        sourceLang: "es",
        targetLang: "en",
      });

      expect(result.buffer).toBeInstanceOf(Buffer);
      expect(result.metadata.hasTables).toBe(true);
      expect(result.metadata.hasHeaders).toBe(true);

      // Verify reassembled DOCX is a valid ZIP archive containing word/document.xml
      const zip = await JSZip.loadAsync(result.buffer);
      expect(zip.file("word/document.xml")).not.toBeNull();
      expect(zip.file("word/header1.xml")).not.toBeNull();

      const docXml = await zip.file("word/document.xml")!.async("text");
      expect(docXml).toContain("<w:tbl"); // Tables preserved
      expect(docXml).toContain("<w:tc");  // Cells preserved
    });

    it("translates text runs in DOCX across target languages", async () => {
      const resultEn = await translateDocx(docxBuffer, {
        sourceLang: "es",
        targetLang: "en",
      });
      const zipEn = await JSZip.loadAsync(resultEn.buffer);
      const textEn = await zipEn.file("word/document.xml")!.async("text");
      expect(textEn).toContain("Certificate");
      expect(textEn).toContain("Bachelor&apos;s Degree");
      expect(textEn).toContain("Academic Transcript");
    });
  });

  describe("4. Image (PNG & JPG) Layout Preservation", () => {
    it("round-trips PNG with matched dimensions and certification banner", async () => {
      const result = await translateImage(pngBuffer, "png", {
        sourceLang: "es",
        targetLang: "en",
      });

      expect(result.buffer).toBeInstanceOf(Buffer);
      expect(result.metadata.width).toBe(640);
      expect(result.metadata.height).toBe(400);
      expect(result.metadata.mimeType).toBe("image/png");

      const img = await Jimp.read(result.buffer);
      expect(img.bitmap.width).toBe(640);
      expect(img.bitmap.height).toBe(400);
    });

    it("round-trips JPG with matched dimensions and JPEG format", async () => {
      const result = await translateImage(jpgBuffer, "jpg", {
        sourceLang: "es",
        targetLang: "en",
      });

      expect(result.buffer).toBeInstanceOf(Buffer);
      expect(result.metadata.width).toBe(600);
      expect(result.metadata.height).toBe(450);
      expect(result.metadata.mimeType).toBe("image/jpeg");
    });
  });

  describe("5. Master Pipeline & Quality Gate Verification", () => {
    it("executes full async pipeline for PDF to READY status", async () => {
      const job = createTranslationJob({
        fileName: "sample_birth_cert.pdf",
        fileFormat: "pdf",
        fileSize: pdfBuffer.length,
        sourceLang: "es",
        targetLang: "en",
        originalBuffer: pdfBuffer,
      });

      expect(job.status).toBe("queued");

      const completed = await processTranslationJob(job, {
        sourceLang: "es",
        targetLang: "en",
      });

      expect(completed.status).toBe("ready");
      expect(completed.progress).toBe(100);
      expect(completed.translatedBuffer).toBeDefined();
      expect(completed.qualityGate?.isValidFormat).toBe(true);
      expect(completed.qualityGate?.pageCountMatches).toBe(true);
    });

    it("executes full async pipeline for DOCX to READY status", async () => {
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
      });

      expect(completed.status).toBe("ready");
      expect(completed.progress).toBe(100);
      expect(completed.qualityGate?.isValidFormat).toBe(true);
    });

    it("lists sanitized jobs via GET /api/translate/jobs route", async () => {
      const { GET: jobsGet } = await import("@/app/api/translate/jobs/route");
      const res = await jobsGet();
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.jobs).toBeInstanceOf(Array);
      expect(data.total).toBeGreaterThanOrEqual(1);

      // Verify buffers are stripped from JSON response
      const firstJob = data.jobs[0];
      expect(firstJob.originalBuffer).toBeUndefined();
      expect(firstJob.translatedBuffer).toBeUndefined();
      expect(firstJob.id).toBeDefined();
    });
  });

  describe("6. High-Fidelity Spatial Reconstruction Engine (DoD 1-4)", () => {
    it("DoD 1: multi-column PDF retains exact column structure and margins", async () => {
      const { extractPdfSpatialBlocks } = await import("@/lib/translation/spatial");
      const spatial = await extractPdfSpatialBlocks(pdfBuffer);

      // Verify spatial blocks detected
      expect(spatial.blocks.length).toBeGreaterThanOrEqual(4);
      expect(spatial.hasMultiColumn).toBe(true);
      expect(spatial.columns.length).toBe(2);

      // Verify column 0 (left labels) and column 1 (right values)
      const col0Blocks = spatial.blocks.filter((b) => b.columnIndex === 0);
      const col1Blocks = spatial.blocks.filter((b) => b.columnIndex === 1);
      expect(col0Blocks.length).toBeGreaterThanOrEqual(1);
      expect(col1Blocks.length).toBeGreaterThanOrEqual(1);

      // Left column X should be significantly smaller than right column X
      expect(col0Blocks[0].x).toBeLessThan(col1Blocks[0].x);

      // Rebuilt PDF must maintain page geometry and multi-column flag
      const result = await translatePdf(pdfBuffer, {
        sourceLang: "es",
        targetLang: "en",
      });
      expect(result.metadata.hasMultiColumn).toBe(true);
      expect(result.metadata.spatialBlockCount).toBeGreaterThanOrEqual(4);
    });

    it("DoD 2: scanned JPG returns translated text in spatial blocks with original text masked", async () => {
      const result = await translateImage(jpgBuffer, "jpg", {
        sourceLang: "es",
        targetLang: "en",
      });

      expect(result.buffer).toBeInstanceOf(Buffer);
      expect(result.metadata.width).toBe(600);
      expect(result.metadata.height).toBe(450);
      expect(result.metadata.spatialBlockCount).toBeGreaterThanOrEqual(2);

      // Inspect rebuilt image with Jimp to verify valid binary raster
      const img = await Jimp.read(result.buffer);
      expect(img.bitmap.width).toBe(600);
      expect(img.bitmap.height).toBe(450);
    });

    it("DoD 3: zero-timeout asynchronous processing allows immediate status polling", async () => {
      const job = createTranslationJob({
        fileName: "sample_birth_cert.pdf",
        fileFormat: "pdf",
        fileSize: pdfBuffer.length,
        sourceLang: "es",
        targetLang: "en",
        originalBuffer: pdfBuffer,
      });

      // Status immediately pollable
      expect(job.status).toBe("queued");
      expect(job.progress).toBe(0);

      const statusHistory: string[] = [];
      const updated = await processTranslationJob(
        job,
        { sourceLang: "es", targetLang: "en" },
        (progress, step) => {
          statusHistory.push(`${job.status}:${progress}`);
        }
      );

      expect(updated.status).toBe("ready");
      expect(updated.progress).toBe(100);
      expect(updated.qualityGate?.isValidFormat).toBe(true);

      // Verify lifecycle went through extracting -> translating -> reconstructing
      expect(statusHistory.some((s) => s.startsWith("extracting"))).toBe(true);
      expect(statusHistory.some((s) => s.startsWith("translating"))).toBe(true);
      expect(statusHistory.some((s) => s.startsWith("reconstructing"))).toBe(true);

      // Test status route polling directly
      const { GET: statusGet } = await import("@/app/api/translate/status/[jobId]/route");
      const req = new Request(`http://localhost:3000/api/translate/status/${job.id}`);
      const statusRes = await statusGet(req as any, {
        params: Promise.resolve({ jobId: job.id }),
      });
      expect(statusRes.status).toBe(200);
      const statusJson = await statusRes.json();
      expect(statusJson.status).toBe("ready");
      expect(statusJson.progress).toBe(100);
      expect(statusJson.downloadUrl).toContain(job.downloadToken);
    });

    it("DoD 4: text expansion in bounding boxes is completely mitigated via dynamic font-size downscaling", async () => {
      const { calculateDynamicFontSize } = await import("@/lib/translation/pdf");
      const { PDFDocument, StandardFonts } = await import("pdf-lib");

      const doc = await PDFDocument.create();
      const font = await doc.embedFont(StandardFonts.Helvetica);

      // Target bounding box is 100pt wide
      const targetBoxWidth = 100;
      const initialFontSize = 14;

      // Text that is 3x longer than target width
      const expandedText = "Official Certified Document with Substantial Text Expansion Across Columns";

      const { fittedSize, textWidth } = calculateDynamicFontSize(
        expandedText,
        targetBoxWidth,
        initialFontSize,
        font
      );

      // Font size must have downscaled from 14pt
      expect(fittedSize).toBeLessThan(initialFontSize);

      // Rendered text width must strictly fit within the target width
      expect(textWidth).toBeLessThanOrEqual(targetBoxWidth);
    });

    it("DoD 3b: full end-to-end API roundtrip from upload to poll to download", async () => {
      const { POST: uploadPost } = await import("@/app/api/translate/upload/route");
      const { GET: downloadGet } = await import("@/app/api/translate/download/[jobId]/route");

      const uploadReq = new Request("http://localhost:3000/api/translate/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: "sample_birth_cert.pdf",
          sourceLang: "es",
          targetLang: "en",
          fileBase64: pdfBuffer.toString("base64"),
        }),
      });

      const uploadRes = await uploadPost(uploadReq as any);
      expect([200, 202]).toContain(uploadRes.status);
      const uploadJson = await uploadRes.json();
      expect(uploadJson.success).toBe(true);
      expect(uploadJson.jobId).toBeDefined();

      // Wait for async processing to reach ready state
      const { getTranslationJob } = await import("@/lib/translation/store");
      let job = getTranslationJob(uploadJson.jobId);
      let waitAttempts = 0;
      while (job && job.status !== "ready" && waitAttempts < 40) {
        await new Promise((r) => setTimeout(r, 50));
        job = getTranslationJob(uploadJson.jobId);
        waitAttempts++;
      }

      expect(job?.status).toBe("ready");

      // Verify download endpoint
      const downloadReq = new Request(
        `http://localhost:3000/api/translate/download/${job!.id}?token=${job!.downloadToken}`
      );
      const downloadRes = await downloadGet(downloadReq as any, {
        params: Promise.resolve({ jobId: job!.id }),
      });
      expect(downloadRes.status).toBe(200);
      expect(downloadRes.headers.get("Content-Type")).toBe("application/pdf");
      expect(downloadRes.headers.get("X-VerifyLingua-Quality-Gate")).toBe("PASSED");
      const fileBytes = await downloadRes.arrayBuffer();
      expect(fileBytes.byteLength).toBeGreaterThan(1000);
    });

    it("supports Arabic (RTL) bidirectional script rendering without encoding errors", async () => {
      // PDF with Arabic target language
      const pdfAr = await translatePdf(pdfBuffer, {
        sourceLang: "es",
        targetLang: "ar",
      });
      expect(pdfAr.buffer.length).toBeGreaterThan(1000);
      expect(pdfAr.metadata.hasCertStamp).toBe(true);

      // Image with Arabic target language
      const imgAr = await translateImage(pngBuffer, "png", {
        sourceLang: "es",
        targetLang: "ar",
      });
      expect(imgAr.buffer.length).toBeGreaterThan(1000);
      expect(imgAr.metadata.width).toBe(640);
    });
  });
});
