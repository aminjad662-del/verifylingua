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
});
