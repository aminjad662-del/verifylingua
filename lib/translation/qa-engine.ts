import { GoogleGenAI } from "@google/genai";

export interface QAAnalysisIssue {
  category:
    | "number_mismatch"
    | "date_mismatch"
    | "name_transliteration"
    | "omission"
    | "untranslated_content"
    | "legal_term_accuracy";
  severity: "critical" | "warning";
  sourceSnippet: string;
  targetSnippet?: string;
  description: string;
}

export interface QAPassReport {
  passed: boolean;
  fidelityScore: number;
  metrics: {
    sourceNumberCount: number;
    targetNumberCount: number;
    numbersMatched: boolean;
    missingNumbers: string[];
    sourceDateCount: number;
    targetDateCount: number;
    datesMatched: boolean;
    missingDates: string[];
    namesPreserved: boolean;
    omissionDetected: boolean;
    lengthRatio: number;
  };
  issues: QAAnalysisIssue[];
  verifiedAt: string;
}

/**
 * Extracts all numeric sequences, years, record IDs, and currency amounts.
 */
export function extractNumbers(text: string): string[] {
  if (!text) return [];
  // Match integers, decimals, date years, ID numbers
  const matches = text.match(/\b\d+(?:[.,/]\d+)*\b/g) || [];
  return Array.from(new Set(matches.map((m) => m.trim())));
}

/**
 * Extracts date patterns across Spanish, French, German, and English formats.
 */
export function extractDates(text: string): string[] {
  if (!text) return [];
  const dateRegexes = [
    // DD/MM/YYYY or MM/DD/YYYY or YYYY-MM-DD
    /\b\d{1,4}[-/.]\d{1,2}[-/.]\d{1,4}\b/g,
    // "14 de Mayo de 1998", "14 Mai 1998", "14. Mai 1998", "May 14, 1998"
    /\b\d{1,2}\s+(?:de\s+)?(?:enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre|janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre|januar|februar|märz|mai|juni|juli|august|september|oktober|november|dezember|january|february|march|april|may|june|july|august|september|october|november|december)\s+(?:de\s+)?\d{2,4}\b/gi,
  ];

  const results: string[] = [];
  for (const reg of dateRegexes) {
    const found = text.match(reg) || [];
    results.push(...found);
  }
  return Array.from(new Set(results.map((d) => d.trim())));
}

/**
 * Extracts proper names and capitalized entities.
 */
export function extractProperNames(text: string): string[] {
  if (!text) return [];
  // Match sequences of capitalized words: e.g. "CAMILA SOFÍA VALENCIA MENDOZA" or "Alejandro Martinez"
  const matches =
    text.match(/\b[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)+\b/g) ||
    text.match(/\b[A-ZÁÉÍÓÚÑ]{2,}(?:\s+[A-ZÁÉÍÓÚÑ]{2,})+\b/g) ||
    [];
  return Array.from(new Set(matches.map((m) => m.trim())));
}

/**
 * Executes an automated QA pass verifying numbers, dates, proper names, and omission ratios.
 */
export async function runAutomatedQAPass(params: {
  sourceText: string;
  targetText: string;
  sourceLang: string;
  targetLang: string;
}): Promise<QAPassReport> {
  const { sourceText, targetText, sourceLang, targetLang } = params;

  const sourceNumbers = extractNumbers(sourceText);
  const targetNumbers = extractNumbers(targetText);

  // Check which source numbers are missing from target
  const missingNumbers = sourceNumbers.filter((n) => {
    // Check direct inclusion or standard normalized representation (e.g. "1998" or "14")
    const cleanNum = n.replace(/[,.]/g, "");
    const targetClean = targetText.replace(/[,.]/g, "");
    return !targetText.includes(n) && !targetClean.includes(cleanNum);
  });

  const numbersMatched = missingNumbers.length === 0;

  const sourceDates = extractDates(sourceText);
  const targetDates = extractDates(targetText);

  // Check years/dates preservation
  const missingDates: string[] = [];
  for (const srcDate of sourceDates) {
    const yearsInDate = srcDate.match(/\b\d{4}\b/g) || [];
    const daysInDate = srcDate.match(/\b\d{1,2}\b/g) || [];
    const hasYear = yearsInDate.every((y) => targetText.includes(y));
    const hasDay = daysInDate.every((d) => targetText.includes(d));
    if (!hasYear || !hasDay) {
      missingDates.push(srcDate);
    }
  }

  const datesMatched = missingDates.length === 0;

  // Name preservation
  const sourceNames = extractProperNames(sourceText);
  let namesPreserved = true;
  const missingNames: string[] = [];
  for (const name of sourceNames) {
    // Split name parts (first name, surnames)
    const parts = name.split(/\s+/).filter((p) => p.length > 2);
    // Every part of proper name should exist in target text (case-insensitive)
    const allPartsPresent = parts.every((p) =>
      new RegExp(`\\b${escapeRegExp(p)}\\b`, "i").test(targetText)
    );
    if (!allPartsPresent) {
      namesPreserved = false;
      missingNames.push(name);
    }
  }

  // Length ratio / omission detection
  const sourceLength = sourceText.trim().length;
  const targetLength = targetText.trim().length;
  const lengthRatio = sourceLength > 0 ? targetLength / sourceLength : 1.0;

  // If target is less than 50% of source length, flag critical omission
  const omissionDetected = lengthRatio < 0.50 || (sourceLength > 100 && targetLength < 40);

  const issues: QAAnalysisIssue[] = [];

  for (const num of missingNumbers) {
    issues.push({
      category: "number_mismatch",
      severity: "critical",
      sourceSnippet: num,
      description: `Source number '${num}' is missing from the target translation.`,
    });
  }

  for (const d of missingDates) {
    issues.push({
      category: "date_mismatch",
      severity: "critical",
      sourceSnippet: d,
      description: `Source date '${d}' was not accurately reflected in the translated document.`,
    });
  }

  for (const nm of missingNames) {
    issues.push({
      category: "name_transliteration",
      severity: "critical",
      sourceSnippet: nm,
      description: `Proper name '${nm}' was not consistently preserved or transliterated.`,
    });
  }

  if (omissionDetected) {
    issues.push({
      category: "omission",
      severity: "critical",
      sourceSnippet: sourceText.slice(0, 100) + "...",
      targetSnippet: targetText.slice(0, 100) + "...",
      description: `Potential omission detected: target length ratio (${lengthRatio.toFixed(2)}) is abnormally low compared to source.`,
    });
  }

  // Calculate overall fidelity score
  let fidelityScore = 100;
  fidelityScore -= missingNumbers.length * 15;
  fidelityScore -= missingDates.length * 20;
  fidelityScore -= missingNames.length * 15;
  if (omissionDetected) fidelityScore -= 30;
  fidelityScore = Math.max(0, Math.min(100, fidelityScore));

  const passed = issues.filter((i) => i.severity === "critical").length === 0;

  return {
    passed,
    fidelityScore,
    metrics: {
      sourceNumberCount: sourceNumbers.length,
      targetNumberCount: targetNumbers.length,
      numbersMatched,
      missingNumbers,
      sourceDateCount: sourceDates.length,
      targetDateCount: targetDates.length,
      datesMatched,
      missingDates,
      namesPreserved,
      omissionDetected,
      lengthRatio,
    },
    issues,
    verifiedAt: new Date().toISOString(),
  };
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
