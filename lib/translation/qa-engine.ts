
export interface QAAnalysisIssue {
  category:
    | "number_mismatch"
    | "date_mismatch"
    | "name_transliteration"
    | "omission"
    | "untranslated_content"
    | "legal_term_accuracy"
    | "text_frame_missing"
    | "character_clipping"
    | "font_glyph_corruption";
  severity: "critical" | "warning";
  sourceSnippet: string;
  targetSnippet?: string;
  description: string;
  blockId?: string;
}

export interface BlockParityInspection {
  sourceBlockCount: number;
  targetBlockCount: number;
  elementCountMatches: boolean;
  missingBlockIds: string[];
  missingBlockSnippets: string[];
  clippedBlockIds: string[];
  ellipsisTruncatedSnippets: string[];
  untranslatedBlockIds: string[];
  glyphCorruptionBlockIds: string[];
  characterCountSource: number;
  characterCountTarget: number;
  expansionRatio: number;
  hasEllipsisTruncation: boolean;
  passed: boolean;
  issues: QAAnalysisIssue[];
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
    // Element parity and character integrity metrics
    sourceBlockCount: number;
    targetBlockCount: number;
    blocksMatched: boolean;
    missingBlocks: string[];
    characterCountSource: number;
    characterCountTarget: number;
    expansionRatio: number;
    hasEllipsisTruncation: boolean;
    clippedBlocks: string[];
    glyphIntegrityVerified: boolean;
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

function getBlockOriginalText(b: any): string {
  if (!b) return "";
  return String(b.original_text || b.text || "").trim();
}

function getBlockTranslatedText(b: any): string {
  if (!b) return "";
  return String(b.translated_text || b.translatedText || b.text || "").trim();
}

/**
 * Evaluates structural element parity, character clipping, ellipsis truncation,
 * untranslated content, and glyph integrity between source and target text blocks.
 */
export function verifyElementAndCharacterParity(params: {
  sourceBlocks: Array<{
    id?: string;
    text?: string;
    original_text?: string;
    box_2d?: number[];
    x?: number;
    y?: number;
    width?: number;
    height?: number;
  }>;
  targetBlocks: Array<{
    id?: string;
    text?: string;
    translated_text?: string;
    translatedText?: string;
    box_2d?: number[];
    x?: number;
    y?: number;
    width?: number;
    height?: number;
  }>;
  sourceLang?: string;
  targetLang?: string;
}): BlockParityInspection {
  const { sourceBlocks = [], targetBlocks = [], sourceLang = "en", targetLang = "es" } = params;

  const issues: QAAnalysisIssue[] = [];
  const missingBlockIds: string[] = [];
  const missingBlockSnippets: string[] = [];
  const clippedBlockIds: string[] = [];
  const ellipsisTruncatedSnippets: string[] = [];
  const untranslatedBlockIds: string[] = [];
  const glyphCorruptionBlockIds: string[] = [];

  let characterCountSource = 0;
  let characterCountTarget = 0;

  // Build target block map by ID and by index
  const targetMapById = new Map<string, any>();
  targetBlocks.forEach((tb, idx) => {
    const idKey = tb.id || `block_${idx}`;
    targetMapById.set(idKey, tb);
  });

  const sourceCount = sourceBlocks.length;
  const targetCount = targetBlocks.length;

  for (let idx = 0; idx < sourceCount; idx++) {
    const sb = sourceBlocks[idx];
    const sId = sb.id || `block_${idx}`;
    const sText = getBlockOriginalText(sb);
    characterCountSource += sText.length;

    // Find matching target block: either by ID or by positional index
    let matchedTarget = targetMapById.get(sId);
    if (!matchedTarget && idx < targetBlocks.length) {
      matchedTarget = targetBlocks[idx];
    }

    if (!matchedTarget) {
      missingBlockIds.push(sId);
      missingBlockSnippets.push(sText.slice(0, 60));
      issues.push({
        category: "text_frame_missing",
        severity: "critical",
        blockId: sId,
        sourceSnippet: sText.slice(0, 80),
        description: `Text frame '${sId}' with text "${sText.slice(0, 40)}..." was omitted from the translated document.`,
      });
      continue;
    }

    const tText = getBlockTranslatedText(matchedTarget);
    characterCountTarget += tText.length;

    // 1. Check for empty translation in a non-empty source block
    if (sText.length > 0 && tText.length === 0) {
      missingBlockIds.push(sId);
      issues.push({
        category: "omission",
        severity: "critical",
        blockId: sId,
        sourceSnippet: sText.slice(0, 80),
        description: `Text frame '${sId}' has empty translated content despite having source text.`,
      });
      continue;
    }

    // 2. Check for ellipsis truncation ('…' or '...')
    const hasEllipsis = /[…]$|\.{3}$/.test(tText.trim());
    const sourceHadEllipsis = /[…]$|\.{3}$/.test(sText.trim());
    if (hasEllipsis && !sourceHadEllipsis) {
      clippedBlockIds.push(sId);
      ellipsisTruncatedSnippets.push(tText.slice(-30));
      issues.push({
        category: "character_clipping",
        severity: "critical",
        blockId: sId,
        sourceSnippet: sText.slice(-40),
        targetSnippet: tText.slice(-40),
        description: `Translated block '${sId}' ends with truncation ellipsis ('…') or was clipped before completion.`,
      });
    }

    // 3. Check for untranslated source content (when source and target languages differ)
    const isDifferentLang = sourceLang.toLowerCase().slice(0, 2) !== targetLang.toLowerCase().slice(0, 2);
    const hasAlphabeticContent = /[a-zA-Z]{3,}/.test(sText);
    const isPlaceholderOnly = /^[_.\-\s]+$/.test(sText) || /^\d+$/.test(sText);

    if (isDifferentLang && hasAlphabeticContent && !isPlaceholderOnly) {
      const cleanSrc = sText.trim().toLowerCase();
      const cleanTgt = tText.trim().toLowerCase();
      if (cleanSrc === cleanTgt) {
        untranslatedBlockIds.push(sId);
        issues.push({
          category: "untranslated_content",
          severity: "critical",
          blockId: sId,
          sourceSnippet: sText.slice(0, 60),
          targetSnippet: tText.slice(0, 60),
          description: `Text block '${sId}' was left untranslated in the source language (${sourceLang}).`,
        });
      }
    }

    // 4. Check for font glyph corruption and unescaped character artifacts
    const hasCorruptionGlyphs = /[\uFFFD]|\?{3,}|&#\d+;|&[a-z]+;/.test(tText);
    if (hasCorruptionGlyphs) {
      glyphCorruptionBlockIds.push(sId);
      issues.push({
        category: "font_glyph_corruption",
        severity: "critical",
        blockId: sId,
        sourceSnippet: sText.slice(0, 60),
        targetSnippet: tText.slice(0, 60),
        description: `Translated block '${sId}' contains corrupted glyphs (replacement codepoints or unescaped entities).`,
      });
    }

    // 5. Special check for Arabic script integrity
    const isTargetArabic = targetLang.toLowerCase().startsWith("ar");
    if (isTargetArabic && hasAlphabeticContent && !isPlaceholderOnly) {
      const hasArabicCharacters = /[\u0600-\u06FF]/.test(tText);
      if (!hasArabicCharacters) {
        glyphCorruptionBlockIds.push(sId);
        issues.push({
          category: "font_glyph_corruption",
          severity: "critical",
          blockId: sId,
          sourceSnippet: sText.slice(0, 60),
          targetSnippet: tText.slice(0, 60),
          description: `Arabic translated block '${sId}' contains zero Arabic unicode characters.`,
        });
      }
    }
  }

  // Target block count deficit check
  if (targetCount < sourceCount) {
    const deficit = sourceCount - targetCount;
    if (!issues.some((i) => i.category === "text_frame_missing")) {
      issues.push({
        category: "text_frame_missing",
        severity: "critical",
        sourceSnippet: `${sourceCount} source blocks vs ${targetCount} target blocks`,
        description: `Target document is missing ${deficit} text frame(s) compared to source layout.`,
      });
    }
  }

  const elementCountMatches = sourceCount === targetCount && missingBlockIds.length === 0;
  const expansionRatio = characterCountSource > 0 ? characterCountTarget / characterCountSource : 1.0;
  const hasEllipsisTruncation = clippedBlockIds.length > 0;
  const criticalCount = issues.filter((i) => i.severity === "critical").length;
  const passed = criticalCount === 0;

  return {
    sourceBlockCount: sourceCount,
    targetBlockCount: targetCount,
    elementCountMatches,
    missingBlockIds,
    missingBlockSnippets,
    clippedBlockIds,
    ellipsisTruncatedSnippets,
    untranslatedBlockIds,
    glyphCorruptionBlockIds,
    characterCountSource,
    characterCountTarget,
    expansionRatio,
    hasEllipsisTruncation,
    passed,
    issues,
  };
}

/**
 * Executes an automated QA pass verifying numbers, dates, proper names,
 * omission ratios, and structural element/character parity.
 */
export async function runAutomatedQAPass(params: {
  sourceText: string;
  targetText: string;
  sourceLang: string;
  targetLang: string;
  sourceBlocks?: any[];
  targetBlocks?: any[];
}): Promise<QAPassReport> {
  const { sourceText, targetText, sourceLang, targetLang, sourceBlocks, targetBlocks } = params;

  const sourceNumbers = extractNumbers(sourceText);
  const targetNumbers = extractNumbers(targetText);

  // Check which source numbers are missing from target
  const missingNumbers = sourceNumbers.filter((n) => {
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
    const parts = name.split(/\s+/).filter((p) => p.length > 2);
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

  // Block-level parity and zero-clipping inspection
  let sourceBlockCount = 0;
  let targetBlockCount = 0;
  let blocksMatched = true;
  let missingBlocks: string[] = [];
  let characterCountSource = sourceLength;
  let characterCountTarget = targetLength;
  let expansionRatio = lengthRatio;
  let hasEllipsisTruncation = false;
  let clippedBlocks: string[] = [];
  let glyphIntegrityVerified = true;

  if (Array.isArray(sourceBlocks) && sourceBlocks.length > 0) {
    const parityResult = verifyElementAndCharacterParity({
      sourceBlocks,
      targetBlocks: Array.isArray(targetBlocks) ? targetBlocks : [],
      sourceLang,
      targetLang,
    });

    sourceBlockCount = parityResult.sourceBlockCount;
    targetBlockCount = parityResult.targetBlockCount;
    blocksMatched = parityResult.elementCountMatches;
    missingBlocks = parityResult.missingBlockIds;
    characterCountSource = parityResult.characterCountSource;
    characterCountTarget = parityResult.characterCountTarget;
    expansionRatio = parityResult.expansionRatio;
    hasEllipsisTruncation = parityResult.hasEllipsisTruncation;
    clippedBlocks = parityResult.clippedBlockIds;
    glyphIntegrityVerified = parityResult.glyphCorruptionBlockIds.length === 0;

    // Merge issues from parity inspection
    issues.push(...parityResult.issues);
  }

  // Calculate overall fidelity score
  let fidelityScore = 100;
  fidelityScore -= missingNumbers.length * 15;
  fidelityScore -= missingDates.length * 20;
  fidelityScore -= missingNames.length * 15;
  if (omissionDetected) fidelityScore -= 30;

  // Additional deductions for structural parity defects
  if (missingBlocks.length > 0) {
    fidelityScore -= missingBlocks.length * 20;
  }
  if (hasEllipsisTruncation) {
    fidelityScore -= clippedBlocks.length * 15;
  }
  if (!glyphIntegrityVerified) {
    fidelityScore -= 25;
  }

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
      sourceBlockCount,
      targetBlockCount,
      blocksMatched,
      missingBlocks,
      characterCountSource,
      characterCountTarget,
      expansionRatio,
      hasEllipsisTruncation,
      clippedBlocks,
      glyphIntegrityVerified,
    },
    issues,
    verifiedAt: new Date().toISOString(),
  };
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
