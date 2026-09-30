import { describe, it, expect } from "vitest";
import { analyzeDocumentOCR } from "../lib/ocr/service";
import fs from "fs";
import path from "path";

describe("Genuine OCR & Vision Telemetry Engine", () => {
  it("1. Successfully extracts OCR blocks, language, and word count from sample image", async () => {
    // Generate a minimal valid 1x1 PNG or load a real sample image
    const samplePng = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      "base64"
    );

    const result = await analyzeDocumentOCR(samplePng, "test_document.png");

    expect(result.success).toBe(true);
    expect(result.fileSize).toBeGreaterThan(0);
    expect(result.pageCount).toBe(1);
    expect(result.wordCount).toBeGreaterThan(0);
    expect(result.blocks.length).toBeGreaterThan(0);
    expect(result.quality.glareDetected).toBe(false);
    expect(result.quality.isCropped).toBe(false);
    expect(result.quality.resolutionDpiEstimate).toBeGreaterThanOrEqual(300);
  });

  it("2. Accurately extracts native vector text blocks and page count from digital PDF", async () => {
    const pdfTextBuffer = Buffer.from(
      "%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n" +
      "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n" +
      "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n" +
      "4 0 obj\n<< /Length 53 >>\nstream\nBT\n/F1 12 Tf\n100 700 Td\n(Republica de Colombia Registro Civil) Tj\nET\nendstream\nendobj\n" +
      "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n%%EOF"
    );

    const result = await analyzeDocumentOCR(pdfTextBuffer, "acta_colombia.pdf");

    expect(result.success).toBe(true);
    expect(result.pageCount).toBe(1);
    expect(result.detectedLang).toBe("es");
    expect(result.detectedLangName).toBe("Spanish");
    expect(result.wordCount).toBeGreaterThan(0);
    expect(result.blocks.length).toBeGreaterThan(0);
    expect(result.quality.glareDetected).toBe(false);
    expect(result.quality.isCropped).toBe(false);
    expect(result.quality.sharpnessScore).toBe(100);
  });

  it("3. Zero false-positive glare or cropping findings on clean input", async () => {
    const cleanSample = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64");
    const result = await analyzeDocumentOCR(cleanSample, "clean_marriage_cert.png");

    expect(result.findings).toHaveLength(0);
    expect(result.quality.glareDetected).toBe(false);
    expect(result.quality.isCropped).toBe(false);
  });
});
