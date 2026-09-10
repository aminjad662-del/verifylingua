import { PDFDocument } from "pdf-lib";
import { detectFormatFromBuffer, validateInputFile } from "./translation/pipeline";
import { DocumentFormat } from "./translation/types";

export interface PreflightServiceTierQuote {
  tier: "automated" | "professional" | "certified";
  title: string;
  priceUSD: number;
  baseAmount: number;
  perPageRate: number;
  certificationFee: number;
  estimatedDeliveryHours: number;
  estimatedDeliveryText: string;
  features: string[];
  limitations: string[];
  humanReviewIncluded: boolean;
  legalCertificationEligible: boolean;
}

export interface PreflightAnalysisResult {
  fileName: string;
  fileFormat: DocumentFormat;
  fileSizeBytes: number;
  fileSizeFormatted: string;
  pageCount: number;
  estimatedWordCount: number;
  detectedSourceLang: string;
  detectedSourceLangConfidence: number;
  isScannedDocument: boolean;
  ocrRequired: boolean;
  layoutComplexity: "LOW" | "MEDIUM" | "HIGH";
  riskScore: number; // 0 to 100
  riskFlags: string[];
  knownLimitations: string[];
  pricing: {
    automated: PreflightServiceTierQuote;
    professional: PreflightServiceTierQuote;
    certified: PreflightServiceTierQuote;
  };
}

/**
 * Detects language from sample text using statistical n-grams / common lexicon
 */
export function detectLanguageFromText(text: string): { lang: string; confidence: number } {
  const lower = text.toLowerCase();

  const langLexicon: Record<string, string[]> = {
    es: ["de", "la", "el", "en", "que", "nacimiento", "acta", "republica", "certificado", "nombre"],
    fr: ["de", "le", "la", "des", "naissance", "republique", "acte", "notaire", "diplome"],
    de: ["der", "die", "das", "und", "geburtsurkunde", "urkunde", "standesamt", "deutschland"],
    pt: ["de", "da", "do", "que", "nascimento", "certidao", "republica", "registro"],
    ar: ["?????????", "?????", "?????", "???", "?????", "?????", "?????"],
    ru: ["?????????????", "????????", "??????????", "??????", "??????", "????????????"],
    uk: ["?????????", "??????????", "???????", "??????", "???????"],
    zh: ["??", "??", "??", "??", "??", "??", "???"],
    ja: ["???", "??", "?", "??", "??", "???"],
  };

  let bestLang = "en";
  let maxMatches = 0;

  for (const [lang, keywords] of Object.entries(langLexicon)) {
    let matches = 0;
    for (const kw of keywords) {
      if (lower.includes(kw)) matches++;
    }
    if (matches > maxMatches) {
      maxMatches = matches;
      bestLang = lang;
    }
  }

  const confidence = maxMatches > 0 ? Math.min(98, 60 + maxMatches * 10) : 50;
  return { lang: bestLang, confidence };
}

/**
 * Executes a full preflight analysis of an uploaded document
 */
export async function analyzeDocumentPreflight(
  buffer: Buffer,
  fileName: string
): Promise<PreflightAnalysisResult> {
  const validation = validateInputFile(buffer, fileName);
  if (validation.error) {
    throw new Error(validation.error);
  }

  const format = validation.format;
  const fileSizeBytes = buffer.length;
  const fileSizeFormatted = (fileSizeBytes / (1024 * 1024)).toFixed(2) + " MB";

  let pageCount = 1;
  let isScannedDocument = false;
  let ocrRequired = false;
  let extractedSampleText = "";
  let layoutComplexity: "LOW" | "MEDIUM" | "HIGH" = "LOW";

  if (format === "pdf") {
    try {
      const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      pageCount = pdfDoc.getPageCount();

      // Check for native text streams
      const { extractPdfSpatialBlocks } = await import("./translation/spatial");
      const spatial = await extractPdfSpatialBlocks(buffer);

      if (spatial.blocks.length === 0) {
        isScannedDocument = true;
        ocrRequired = true;
        layoutComplexity = "HIGH";
      } else {
        extractedSampleText = spatial.blocks.slice(0, 30).map((b) => b.text).join(" ");
        if (spatial.hasMultiColumn) layoutComplexity = "MEDIUM";
      }
    } catch {
      // If parsing fails or is scanned image
      isScannedDocument = true;
      ocrRequired = true;
    }
  } else if (format === "png" || format === "jpg") {
    pageCount = 1;
    isScannedDocument = true;
    ocrRequired = true;
    layoutComplexity = "MEDIUM";
  } else if (format === "docx") {
    pageCount = Math.max(1, Math.ceil(fileSizeBytes / 45000));
    isScannedDocument = false;
    ocrRequired = false;
  }

  // Estimate word count (avg 250 words per standard page)
  const estimatedWordCount = Math.max(80, pageCount * 250);

  // Language detection
  const langDetect = detectLanguageFromText(extractedSampleText || fileName);
  const detectedSourceLang = langDetect.lang;
  const detectedSourceLangConfidence = langDetect.confidence;

  // Risk Score & Risk Flags
  const riskFlags: string[] = [];
  let riskScore = 10;

  if (isScannedDocument) {
    riskScore += 25;
    riskFlags.push("Scanned document requires neural optical character recognition (OCR).");
  }

  const lowerName = fileName.toLowerCase();
  if (lowerName.includes("court") || lowerName.includes("affidavit") || lowerName.includes("legal")) {
    riskScore += 30;
    riskFlags.push("Legal/Court document detected: requires certified ATA translation.");
  }
  if (lowerName.includes("birth") || lowerName.includes("marriage") || lowerName.includes("diploma")) {
    riskScore += 20;
    riskFlags.push("Vital civil registry record: USCIS 8 CFR 103.2 certification recommended.");
  }
  if (format === "png" || format === "jpg") {
    riskFlags.push("Photographed raster image: recommend checking lighting and resolution.");
  }

  const knownLimitations: string[] = [];
  if (isScannedDocument) {
    knownLimitations.push("Faint watermarks or low-contrast handwritten annotations may require human correction.");
  }
  knownLimitations.push("Exact 1:1 font mirroring depends on system font availability; standard metric-compatible equivalents are used for missing typefaces.");

  // Tier pricing
  const automatedPrice = Math.round(pageCount * 9.95 * 100) / 100;
  const professionalPrice = Math.round(pageCount * 19.95 * 100) / 100;
  const certifiedPrice = Math.round(pageCount * 24.95 * 100) / 100;

  return {
    fileName,
    fileFormat: format,
    fileSizeBytes,
    fileSizeFormatted,
    pageCount,
    estimatedWordCount,
    detectedSourceLang,
    detectedSourceLangConfidence,
    isScannedDocument,
    ocrRequired,
    layoutComplexity,
    riskScore: Math.min(100, riskScore),
    riskFlags,
    knownLimitations,
    pricing: {
      automated: {
        tier: "automated",
        title: "Automated Instant Translation",
        priceUSD: automatedPrice,
        baseAmount: automatedPrice,
        perPageRate: 9.95,
        certificationFee: 0,
        estimatedDeliveryHours: 0.1,
        estimatedDeliveryText: "Instant (under 2 minutes)",
        features: [
          "Neural machine translation with spatial geometry preservation",
          "Automated OCR extraction",
          "Instant digital download",
        ],
        limitations: [
          "NOT certified for USCIS, court, or legal proceedings",
          "No sworn human affidavit or ATA linguist review",
        ],
        humanReviewIncluded: false,
        legalCertificationEligible: false,
      },
      professional: {
        tier: "professional",
        title: "Professional Linguist Review",
        priceUSD: professionalPrice,
        baseAmount: professionalPrice,
        perPageRate: 19.95,
        certificationFee: 0,
        estimatedDeliveryHours: 24,
        estimatedDeliveryText: "24 hours",
        features: [
          "Neural translation + complete human linguist review",
          "Terminology and proper-noun standardization",
          "Full formatting and table layout audit",
          "Free revision support",
        ],
        limitations: [
          "Standard delivery turnaround (24h)",
        ],
        humanReviewIncluded: true,
        legalCertificationEligible: false,
      },
      certified: {
        tier: "certified",
        title: "USCIS 8 CFR 103.2 Certified Translation",
        priceUSD: certifiedPrice,
        baseAmount: certifiedPrice,
        perPageRate: 24.95,
        certificationFee: 0,
        estimatedDeliveryHours: 24,
        estimatedDeliveryText: "24 hours (12h rush available)",
        features: [
          "ATA-credentialed professional translator",
          "Sworn Affidavit of Accuracy under 8 CFR 103.2(b)(3)",
          "Cryptographic QR code verification seal",
          "Full 100% redo & refund protection if rejected for translation error",
          "Optional digital notarization and apostille add-on",
        ],
        limitations: [
          "Requires strict document legibility standards",
        ],
        humanReviewIncluded: true,
        legalCertificationEligible: true,
      },
    },
  };
}
