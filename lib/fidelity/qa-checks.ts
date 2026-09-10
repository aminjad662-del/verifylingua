export interface NumberCheckResult {
  match: boolean;
  score: number;
  sourceNumbers: string[];
  targetNumbers: string[];
  mismatches: string[];
}

export interface DateCheckResult {
  match: boolean;
  score: number;
  sourceDates: string[];
  targetDates: string[];
  mismatches: string[];
}

export interface CurrencyCheckResult {
  match: boolean;
  score: number;
  sourceCurrencies: string[];
  targetCurrencies: string[];
  mismatches: string[];
}

export interface TerminologyCheckResult {
  match: boolean;
  score: number;
  totalTerms: number;
  violatedTerms: { term: string; expected: string; foundInSource: boolean }[];
}

export interface UntranslatedCheckResult {
  hasUntranslatedText: boolean;
  score: number;
  untranslatedSegments: { id: string; text: string }[];
}

export interface ComprehensiveQAResult {
  overallScore: number;
  passed: boolean;
  numbers: NumberCheckResult;
  dates: DateCheckResult;
  currencies: CurrencyCheckResult;
  terminology: TerminologyCheckResult;
  untranslated: UntranslatedCheckResult;
  humanReviewDecision: {
    requiresHumanReview: boolean;
    reasons: string[];
    riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  };
}

/**
 * Normalizes numbers by removing commas/dots used as thousands separators
 */
function extractNormalizedNumbers(text: string): string[] {
  const matches = text.match(/\b\d+(?:[.,]\d+)*\b/g) || [];
  return matches.map((n) => {
    const cleaned = n.replace(/[,\s]/g, "");
    return cleaned;
  });
}

/**
 * Validates that numbers present in the source text are preserved in the target translation.
 */
export function checkNumberConsistency(
  sourceText: string,
  targetText: string
): NumberCheckResult {
  const sourceNums = extractNormalizedNumbers(sourceText);
  const targetNums = extractNormalizedNumbers(targetText);

  const mismatches: string[] = [];
  const targetSet = new Set(targetNums);

  for (const num of sourceNums) {
    if (num.length >= 2 && !targetSet.has(num)) {
      mismatches.push(`Number '${num}' from source document is missing in translation.`);
    }
  }

  const match = mismatches.length === 0;
  const score = match ? 100 : Math.max(20, 100 - mismatches.length * 20);

  return {
    match,
    score,
    sourceNumbers: sourceNums,
    targetNumbers: targetNums,
    mismatches,
  };
}

/**
 * Extracts and checks date expressions (years, ISO dates, formatted dates).
 */
export function checkDateConsistency(
  sourceText: string,
  targetText: string
): DateCheckResult {
  const dateRegex = /\b(?:19|20)\d{2}(?:[-/.]\d{1,2}[-/.]\d{1,2})?\b|\b\d{1,2}[-/.]\d{1,2}[-/.]\b(?:19|20)\d{2}\b/g;
  const sourceDates = sourceText.match(dateRegex) || [];
  const targetDates = targetText.match(dateRegex) || [];

  const mismatches: string[] = [];
  const sourceYears = (sourceText.match(/\b(19\d{2}|20\d{2})\b/g) || []);
  const targetYears = new Set(targetText.match(/\b(19\d{2}|20\d{2})\b/g) || []);

  for (const year of sourceYears) {
    if (!targetYears.has(year)) {
      mismatches.push(`Critical Date/Year '${year}' found in source is missing from translation.`);
    }
  }

  const match = mismatches.length === 0;
  const score = match ? 100 : Math.max(30, 100 - mismatches.length * 25);

  return {
    match,
    score,
    sourceDates,
    targetDates,
    mismatches,
  };
}

/**
 * Validates currency symbols and denominations ($500, EUR 200, etc.)
 */
export function checkCurrencyConsistency(
  sourceText: string,
  targetText: string
): CurrencyCheckResult {
  const currRegex = /([$€£¥?]|USD|EUR|GBP|CAD|AUD|MXN|BRL|JPY|CNY)\s*(\d+(?:[.,]\d+)?)/gi;
  const sourceMatches: string[] = [];
  let m;
  while ((m = currRegex.exec(sourceText)) !== null) {
    sourceMatches.push(m[0].replace(/\s+/g, "").toUpperCase());
  }

  const targetMatches: string[] = [];
  const targetRegex = /([$€£¥?]|USD|EUR|GBP|CAD|AUD|MXN|BRL|JPY|CNY)\s*(\d+(?:[.,]\d+)?)/gi;
  while ((m = targetRegex.exec(targetText)) !== null) {
    targetMatches.push(m[0].replace(/\s+/g, "").toUpperCase());
  }

  const mismatches: string[] = [];
  for (const item of sourceMatches) {
    const numPart = item.replace(/[^\d.]/g, "");
    if (numPart && !targetText.includes(numPart)) {
      mismatches.push(`Financial figure '${item}' was omitted or modified in translated output.`);
    }
  }

  const match = mismatches.length === 0;
  const score = match ? 100 : Math.max(40, 100 - mismatches.length * 30);

  return {
    match,
    score,
    sourceCurrencies: sourceMatches,
    targetCurrencies: targetMatches,
    mismatches,
  };
}

/**
 * Validates terminology against provided glossary / protected terms
 */
export function checkTerminologyEnforcement(
  sourceText: string,
  targetText: string,
  glossary?: Record<string, string>
): TerminologyCheckResult {
  if (!glossary || Object.keys(glossary).length === 0) {
    return {
      match: true,
      score: 100,
      totalTerms: 0,
      violatedTerms: [],
    };
  }

  const violated: { term: string; expected: string; foundInSource: boolean }[] = [];
  let totalChecked = 0;

  for (const [sourceTerm, expectedTargetTerm] of Object.entries(glossary)) {
    const srcRegex = new RegExp(`\\b${sourceTerm}\\b`, "i");
    if (srcRegex.test(sourceText)) {
      totalChecked++;
      const tgtRegex = new RegExp(`\\b${expectedTargetTerm}\\b`, "i");
      if (!tgtRegex.test(targetText)) {
        violated.push({
          term: sourceTerm,
          expected: expectedTargetTerm,
          foundInSource: true,
        });
      }
    }
  }

  const match = violated.length === 0;
  const score = totalChecked === 0 ? 100 : Math.round(((totalChecked - violated.length) / totalChecked) * 100);

  return {
    match,
    score,
    totalTerms: totalChecked,
    violatedTerms: violated,
  };
}

/**
 * Detects segments where foreign text was not translated (echoed verbatim).
 */
export function checkUntranslatedText(
  sourceText: string,
  targetText: string,
  sourceLang: string,
  targetLang: string
): UntranslatedCheckResult {
  if (sourceLang.toLowerCase() === targetLang.toLowerCase()) {
    return { hasUntranslatedText: false, score: 100, untranslatedSegments: [] };
  }

  const sourceSentences = sourceText.split(/[.!?\n]+/).map((s) => s.trim()).filter((s) => s.length > 20);
  const untranslated: { id: string; text: string }[] = [];

  for (let i = 0; i < sourceSentences.length; i++) {
    const sentence = sourceSentences[i];
    if (/^[0-9\s.,/#\-_–—()[\]+]+$/.test(sentence)) continue;

    if (targetText.includes(sentence)) {
      untranslated.push({
        id: `seg_${i}`,
        text: sentence,
      });
    }
  }

  const hasUntranslatedText = untranslated.length > 0;
  const score = hasUntranslatedText ? Math.max(30, 100 - untranslated.length * 25) : 100;

  return {
    hasUntranslatedText,
    score,
    untranslatedSegments: untranslated,
  };
}

/**
 * Master QA Gate combining all semantic and entity verification vectors.
 */
export function runComprehensiveQA(params: {
  sourceText: string;
  targetText: string;
  sourceLang: string;
  targetLang: string;
  serviceTier?: "automated" | "professional" | "certified";
  glossary?: Record<string, string>;
  ocrConfidence?: number;
  hasHandwriting?: boolean;
  isLegalOrImmigrationDoc?: boolean;
}): ComprehensiveQAResult {
  const numbers = checkNumberConsistency(params.sourceText, params.targetText);
  const dates = checkDateConsistency(params.sourceText, params.targetText);
  const currencies = checkCurrencyConsistency(params.sourceText, params.targetText);
  const terminology = checkTerminologyEnforcement(params.sourceText, params.targetText, params.glossary);
  const untranslated = checkUntranslatedText(
    params.sourceText,
    params.targetText,
    params.sourceLang,
    params.targetLang
  );

  const overallScore = Math.round(
    numbers.score * 0.25 +
      dates.score * 0.25 +
      currencies.score * 0.15 +
      terminology.score * 0.20 +
      untranslated.score * 0.15
  );

  const reasons: string[] = [];
  let riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" = "LOW";

  if (!numbers.match) {
    reasons.push(`Number mismatch: ${numbers.mismatches.join("; ")}`);
    riskLevel = "HIGH";
  }
  if (!dates.match) {
    reasons.push(`Date mismatch: ${dates.mismatches.join("; ")}`);
    riskLevel = "CRITICAL";
  }
  if (!currencies.match) {
    reasons.push(`Currency mismatch: ${currencies.mismatches.join("; ")}`);
    riskLevel = "HIGH";
  }
  if (!terminology.match) {
    reasons.push(`Protected terminology violation: ${terminology.violatedTerms.map((t) => t.term).join(", ")}`);
    if (riskLevel !== "CRITICAL") riskLevel = "MEDIUM";
  }
  if (untranslated.hasUntranslatedText) {
    reasons.push(`Untranslated source sentences detected (${untranslated.untranslatedSegments.length} segment(s)).`);
    if (riskLevel !== "CRITICAL") riskLevel = "HIGH";
  }

  if (params.ocrConfidence !== undefined && params.ocrConfidence < 70) {
    reasons.push(`Low OCR confidence (${params.ocrConfidence}% < 70% threshold).`);
    riskLevel = "HIGH";
  }

  if (params.hasHandwriting) {
    reasons.push("Handwritten notations detected requiring specialist linguist review.");
    riskLevel = "HIGH";
  }

  if (params.serviceTier === "certified" || params.serviceTier === "professional") {
    reasons.push(`Tier is ${params.serviceTier.toUpperCase()}: requires formal human sign-off.`);
    if (riskLevel === "LOW") riskLevel = "MEDIUM";
  }

  const requiresHumanReview =
    reasons.length > 0 ||
    overallScore < 85 ||
    params.serviceTier === "certified" ||
    params.serviceTier === "professional";

  return {
    overallScore,
    passed: overallScore >= 80 && numbers.match && dates.match,
    numbers,
    dates,
    currencies,
    terminology,
    untranslated,
    humanReviewDecision: {
      requiresHumanReview,
      reasons,
      riskLevel,
    },
  };
}
