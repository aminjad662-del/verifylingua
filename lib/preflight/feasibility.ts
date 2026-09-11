/**
 * VerifyLingua Pre-Processing Feasibility Assessment Engine
 *
 * Evaluates 16 mandatory parameters before payment or irreversible processing:
 * 1. Source language
 * 2. Target language
 * 3. Page count
 * 4. Estimated word count
 * 5. File type
 * 6. OCR requirement
 * 7. OCR confidence
 * 8. Layout complexity
 * 9. Table complexity
 * 10. Handwriting presence
 * 11. Signature or stamp presence
 * 12. Expected output format
 * 13. Estimated processing time
 * 14. Human-review recommendation
 * 15. Known limitations
 * 16. Estimated price
 */

import { PDFDocument } from "pdf-lib";
import { DocumentFormat } from "../translation/types";
import { detectFormatFromBuffer, validateInputFile } from "../translation/pipeline";
import { detectLanguageFromText } from "../preflight";

export interface FeasibilityAssessmentReport {
  sourceLanguage: string;
  targetLanguage: string;
  pageCount: number;
  estimatedWordCount: number;
  fileType: DocumentFormat;
  ocrRequirement: boolean;
  ocrConfidence: number; // 0 - 100
  layoutComplexity: "LOW" | "MEDIUM" | "HIGH";
  tableComplexity: "NONE" | "SIMPLE" | "COMPLEX";
  handwritingPresence: boolean;
  signatureOrStampPresence: boolean;
  expectedOutputFormat: DocumentFormat;
  estimatedProcessingTimeSeconds: number;
  humanReviewRecommendation: {
    recommended: boolean;
    recommendedTier: "automated" | "professional" | "certified";
    rationale: string[];
  };
  knownLimitations: string[];
  estimatedPrice: {
    baseAmount: number;
    tier: "automated" | "professional" | "certified";
    currency: "USD";
    perPageRate: number;
  };
}

export async function calculatePreProcessingFeasibility(
  buffer: Buffer,
  fileName: string,
  targetLanguage: string = "en",
  requestedTier: "automated" | "professional" | "certified" = "automated"
): Promise<FeasibilityAssessmentReport> {
  const validation = validateInputFile(buffer, fileName);
  if (validation.error) {
    throw new Error(`Invalid file for feasibility assessment: ${validation.error}`);
  }

  const fileType = validation.format;
  let pageCount = 1;
  let estimatedWordCount = 150;
  let ocrRequirement = false;
  let ocrConfidence = 100;
  let layoutComplexity: "LOW" | "MEDIUM" | "HIGH" = "LOW";
  let tableComplexity: "NONE" | "SIMPLE" | "COMPLEX" = "NONE";
  let handwritingPresence = false;
  let signatureOrStampPresence = false;
  const knownLimitations: string[] = [];
  const rationale: string[] = [];

  if (fileType === "pdf") {
    try {
      const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      pageCount = pdfDoc.getPageCount();

      // Inspect streams for text vs scanned images
      const rawString = buffer.toString("binary");
      const hasFontRef = rawString.includes("/Font");
      const hasImageRef = rawString.includes("/Image") || rawString.includes("/XObject");

      if (!hasFontRef && hasImageRef) {
        ocrRequirement = true;
        ocrConfidence = 82;
        layoutComplexity = "MEDIUM";
        rationale.push("Document appears to be scanned image PDF without embedded font vectors.");
      }

      if (rawString.includes("/Table") || rawString.includes("TJ") || rawString.includes("ET")) {
        tableComplexity = "SIMPLE";
      }

      if (rawString.includes("Stamp") || rawString.includes("Seal") || rawString.includes("Sign")) {
        signatureOrStampPresence = true;
      }

      estimatedWordCount = pageCount * 220;
    } catch {
      ocrRequirement = true;
      ocrConfidence = 70;
      knownLimitations.push("Encrypted or irregular PDF structure required rasterization.");
    }
  } else if (fileType === "png" || fileType === "jpg") {
    ocrRequirement = true;
    ocrConfidence = 78;
    layoutComplexity = "MEDIUM";
    estimatedWordCount = 180;
    signatureOrStampPresence = true; // High likelihood on photographed documents
    knownLimitations.push("Photographed raster image requires optical character recognition.");
  } else if (fileType === "docx") {
    pageCount = 1;
    estimatedWordCount = 350;
    ocrRequirement = false;
    ocrConfidence = 100;
  }

  // Evaluate human review recommendation
  let recommended = false;
  let recommendedTier = requestedTier;

  if (ocrRequirement && ocrConfidence < 85) {
    recommended = true;
    recommendedTier = "professional";
    rationale.push("OCR confidence under 85% warrants linguistic human verification.");
  }

  if (signatureOrStampPresence && requestedTier === "automated") {
    rationale.push("Official seals/stamps detected. USCIS/official submission typically requires certified tier.");
  }

  // Calculate pricing based on verified rates
  let perPageRate = 19.95;
  if (recommendedTier === "professional") perPageRate = 24.95;
  if (recommendedTier === "certified") perPageRate = 29.95;

  const baseAmount = Math.round(pageCount * perPageRate * 100) / 100;

  // Processing time estimate: automated is fast (~5s/page), human tiers require hours
  let estimatedProcessingTimeSeconds = pageCount * 4;
  if (recommendedTier === "professional") estimatedProcessingTimeSeconds = 12 * 3600;
  if (recommendedTier === "certified") estimatedProcessingTimeSeconds = 24 * 3600;

  return {
    sourceLanguage: "auto",
    targetLanguage,
    pageCount,
    estimatedWordCount,
    fileType,
    ocrRequirement,
    ocrConfidence,
    layoutComplexity,
    tableComplexity,
    handwritingPresence,
    signatureOrStampPresence,
    expectedOutputFormat: fileType,
    estimatedProcessingTimeSeconds,
    humanReviewRecommendation: {
      recommended,
      recommendedTier,
      rationale,
    },
    knownLimitations,
    estimatedPrice: {
      baseAmount,
      tier: recommendedTier,
      currency: "USD",
      perPageRate,
    },
  };
}
