import { describe, it, expect } from "vitest";
import { generateDocumentQualityReport } from "../lib/services/quality-report";

describe("Document Quality & Fidelity Report Engine Suite", () => {
  it("evaluates a perfect layout-preserved translation with 100% score and PASSED status", () => {
    const report = generateDocumentQualityReport({
      jobId: "job_test_perfect_100",
      sourceFormat: "pdf",
      pageCountOriginal: 3,
      pageCountTranslated: 3,
      extractedSegmentCount: 45,
      translatedSegmentCount: 45,
      ocrConfidence: 99,
      tableDeformationPoints: 0,
      overflowDetected: false,
    });

    expect(report.overallStatus).toBe("PASSED");
    expect(report.fidelityScore).toBe(100);
    expect(report.metrics.textExtractionCompleteness).toBe(100);
    expect(report.metrics.missingOrUntranslatedSegments).toBe(0);
    expect(report.metrics.pageCountChanged).toBe(false);
    expect(report.humanReviewRequired).toBe(false);
    expect(report.notes).toHaveLength(0);
  });

  it("detects low OCR confidence and automatically triggers human review requirement", () => {
    const report = generateDocumentQualityReport({
      jobId: "job_test_ocr_degraded",
      sourceFormat: "jpg",
      pageCountOriginal: 1,
      pageCountTranslated: 1,
      extractedSegmentCount: 20,
      translatedSegmentCount: 20,
      ocrConfidence: 35, // low OCR
    });

    expect(report.humanReviewRequired).toBe(true);
    expect(report.humanReviewReason).toContain("low OCR confidence");
    expect(report.overallStatus).toBe("PASSED_WITH_WARNINGS");
    expect(report.fidelityScore).toBeLessThan(90);
  });

  it("detects missing translation segments and flags failure if severe", () => {
    const report = generateDocumentQualityReport({
      jobId: "job_test_missing_segments",
      sourceFormat: "docx",
      pageCountOriginal: 2,
      pageCountTranslated: 2,
      extractedSegmentCount: 30,
      translatedSegmentCount: 22, // 8 missing segments
    });

    expect(report.metrics.missingOrUntranslatedSegments).toBe(8);
    expect(report.humanReviewRequired).toBe(true);
    expect(report.overallStatus).toBe("FAILED");
  });

  it("identifies table deformation and text overflow", () => {
    const report = generateDocumentQualityReport({
      jobId: "job_test_table_overflow",
      sourceFormat: "pdf",
      pageCountOriginal: 2,
      pageCountTranslated: 2,
      extractedSegmentCount: 40,
      translatedSegmentCount: 40,
      tableDeformationPoints: 12,
      overflowDetected: true,
    });

    expect(report.metrics.tableDeformationDetected).toBe(true);
    expect(report.metrics.overflowDetected).toBe(true);
    expect(report.overallStatus).toBe("PASSED_WITH_WARNINGS");
  });
});
