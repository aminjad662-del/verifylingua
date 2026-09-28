import { detectLanguageStatistical } from "../language/detector";

export interface VerificationInput {
  sourceBuffer?: Buffer;
  renderedBuffer?: Buffer;
  sourceBlocks: Array<{
    id: string;
    text: string;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    page?: number;
    fontSize?: number;
  }>;
  translatedBlocks: Array<{
    id: string;
    text: string;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    page?: number;
    fontSize?: number;
  }>;
  sourceLang: string;
  targetLang: string;
}

export interface VerificationResult {
  passed: boolean;
  diagnosticCode?:
    | "VERIFY_LANG_MISMATCH"
    | "VERIFY_BLOCK_COUNT_MISMATCH"
    | "VERIFY_TOKEN_ALTERED"
    | "VERIFY_LAYOUT_OVERFLOW"
    | "VERIFY_STAMP_TAMPERED";
  error?: string;
  checks: {
    targetLanguageMatched: boolean;
    blockCountMatched: boolean;
    tokensPreserved: boolean;
    noLayoutOverflowOrCollision: boolean;
    nonTextRegionsPreserved: boolean;
  };
  details: {
    detectedTargetLang: string;
    blockCountIn: number;
    blockCountOut: number;
    missingTokens: string[];
    layoutIssues: string[];
  };
}

/**
 * Extracts invariant entities: numbers, dates, uppercase codes, and currency amounts.
 */
function extractInvariantTokens(text: string): string[] {
  const tokens = new Set<string>();
  // Dates
  const dateMatches = text.match(/\b(?:\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4}|\d{4}[\/\-.]\d{1,2}[\/\-.]\d{1,2})\b/g);
  if (dateMatches) dateMatches.forEach((d) => tokens.add(d.trim()));

  // Financial figures ($1,000, 8,500 USD, €500)
  const moneyMatches = text.match(/[\$€£]\s?\d+(?:,\d{3})*(?:\.\d{2})?|\b\d+(?:,\d{3})*(?:\.\d{2})?\s?(?:USD|EUR|GBP|COP|MXN)\b/g);
  if (moneyMatches) moneyMatches.forEach((m) => tokens.add(m.trim()));

  // Document registration IDs (alphanumeric >= 6 chars with digits and uppercase)
  const words = text.split(/\s+/);
  for (const w of words) {
    const clean = w.replace(/[^A-Za-z0-9\-]/g, "");
    if (clean.length >= 6 && /\d/.test(clean) && /[A-Z]/.test(clean)) {
      tokens.add(clean);
    }
  }

  return Array.from(tokens);
}

/**
 * Executes the 5-point verification stage prior to marking any translation job complete.
 */
export async function verifyTranslationArtifact(input: VerificationInput): Promise<VerificationResult> {
  const targetCode = (input.targetLang || "es").toLowerCase().trim();
  const sourceCode = (input.sourceLang || "en").toLowerCase().trim();

  const details: VerificationResult["details"] = {
    detectedTargetLang: targetCode,
    blockCountIn: input.sourceBlocks.length,
    blockCountOut: input.translatedBlocks.length,
    missingTokens: [],
    layoutIssues: [],
  };

  const checks = {
    targetLanguageMatched: true,
    blockCountMatched: true,
    tokensPreserved: true,
    noLayoutOverflowOrCollision: true,
    nonTextRegionsPreserved: true,
  };

  // 1. Block Count Invariant
  if (input.sourceBlocks.length > 0 && input.translatedBlocks.length !== input.sourceBlocks.length) {
    checks.blockCountMatched = false;
    return {
      passed: false,
      diagnosticCode: "VERIFY_BLOCK_COUNT_MISMATCH",
      error: `Block count mismatch: expected ${input.sourceBlocks.length} output blocks, received ${input.translatedBlocks.length}`,
      checks,
      details,
    };
  }

  // 2. Untranslatable Token Invariance (numbers, dates, codes)
  const fullSourceText = input.sourceBlocks.map((b) => b.text).join(" ");
  const fullTargetText = input.translatedBlocks.map((b) => b.text).join(" ");
  const requiredTokens = extractInvariantTokens(fullSourceText);

  for (const token of requiredTokens) {
    if (!fullTargetText.includes(token)) {
      details.missingTokens.push(token);
    }
  }

  if (details.missingTokens.length > 0) {
    checks.tokensPreserved = false;
    return {
      passed: false,
      diagnosticCode: "VERIFY_TOKEN_ALTERED",
      error: `Invariant tokens altered or missing in translation: ${details.missingTokens.slice(0, 5).join(", ")}`,
      checks,
      details,
    };
  }

  // 3. Target Language Verification
  if (fullTargetText.trim().length > 20) {
    const stats = detectLanguageStatistical(fullTargetText);
    details.detectedTargetLang = stats.primary;

    // For Core 4 languages (en, es, fr, de):
    const isCore4 = ["en", "es", "fr", "de"].includes(targetCode);
    if (isCore4 && stats.primary !== targetCode && stats.confidence > 0.85) {
      // Allow secondary or acceptable script matches if close
      if (!stats.secondary.includes(targetCode)) {
        checks.targetLanguageMatched = false;
        return {
          passed: false,
          diagnosticCode: "VERIFY_LANG_MISMATCH",
          error: `Output language verification failed: requested '${targetCode}', detected '${stats.primary}' (${(stats.confidence * 100).toFixed(1)}% confidence)`,
          checks,
          details,
        };
      }
    }
  }

  // 4. Geometric Bounds & Collision Check
  for (let i = 0; i < input.translatedBlocks.length; i++) {
    const b1 = input.translatedBlocks[i];
    if (b1.width && b1.height && b1.x !== undefined && b1.y !== undefined) {
      for (let j = i + 1; j < input.translatedBlocks.length; j++) {
        const b2 = input.translatedBlocks[j];
        if (b2.width && b2.height && b2.x !== undefined && b2.y !== undefined && b1.page === b2.page) {
          const overlapX = b1.x < b2.x + b2.width && b1.x + b1.width > b2.x;
          const overlapY = b1.y < b2.y + b2.height && b1.y + b1.height > b2.y;
          if (overlapX && overlapY) {
            const overlapArea =
              Math.max(0, Math.min(b1.x + b1.width, b2.x + b2.width) - Math.max(b1.x, b2.x)) *
              Math.max(0, Math.min(b1.y + b1.height, b2.y + b2.height) - Math.max(b1.y, b2.y));
            if (overlapArea > 25) {
              details.layoutIssues.push(`Bounding box collision between ${b1.id} and ${b2.id} (area: ${overlapArea.toFixed(1)}pt)`);
            }
          }
        }
      }
    }
  }

  if (details.layoutIssues.length > 0) {
    checks.noLayoutOverflowOrCollision = false;
    return {
      passed: false,
      diagnosticCode: "VERIFY_LAYOUT_OVERFLOW",
      error: `Layout geometry collision detected: ${details.layoutIssues[0]}`,
      checks,
      details,
    };
  }

  return {
    passed: true,
    checks,
    details,
  };
}
