import { SpatialTextBlock } from "../translation/types";

export interface FidelityScoreBreakdown {
  overallScore: number;
  layoutScore: number;
  typographyScore: number;
  textCoverageScore: number;
  tablesScore: number;
  imagesScore: number;
  rtlScore: number;
  grade: "PERFECT" | "EXCELLENT" | "ACCEPTABLE" | "WARNING" | "CRITICAL";
  warnings: string[];
}

export interface FidelityIssue {
  type:
    | "TEXT_OVERFLOW"
    | "TEXT_COLLISION"
    | "MISSING_TEXT"
    | "DUPLICATE_TEXT"
    | "FONT_FALLBACK"
    | "TABLE_OVERFLOW"
    | "RTL_ERROR"
    | "IMAGE_DAMAGE"
    | "LAYOUT_SHIFT"
    | "STRUCTURE_ERROR";
  page: number;
  segmentId?: string;
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  autoRepaired?: boolean;
}

export interface FidelityEvaluationInput {
  format: "pdf" | "docx" | "png" | "jpg";
  sourcePageCount: number;
  translatedPageCount: number;
  sourceTextLength: number;
  translatedTextLength: number;
  spatialBlocks?: SpatialTextBlock[];
  targetLang: string;
  sourceTableCount?: number;
  translatedTableCount?: number;
  sourceImageCount?: number;
  translatedImageCount?: number;
  sourceSegments?: { id: string; text: string }[];
  translatedSegments?: { id: string; text: string }[];
}

export function comparePages(
  sourceCount: number,
  translatedCount: number
): { match: boolean; diff: number; score: number } {
  const match = sourceCount === translatedCount;
  const diff = Math.abs(sourceCount - translatedCount);
  const score = match ? 100 : Math.max(40, 100 - diff * 25);
  return { match, diff, score };
}

export function compareTextCoverage(
  sourceLength: number,
  translatedLength: number,
  targetLang: string
): { ratio: number; score: number; warning?: string } {
  if (sourceLength === 0) return { ratio: 1.0, score: 100 };
  const ratio = translatedLength / sourceLength;

  // Language expansion/contraction baseline expectations:
  // Spanish/French typically expand by 15-25%
  // Arabic is often ~10% shorter or longer depending on script density
  let expectedMin = 0.65;
  let expectedMax = 1.45;
  if (["es", "fr", "it"].includes(targetLang.toLowerCase())) {
    expectedMin = 0.85;
    expectedMax = 1.55;
  }

  if (ratio < 0.4) {
    return {
      ratio,
      score: 55,
      warning: "Severe text contraction: translation may have omitted substantial content.",
    };
  }
  if (ratio > 2.2) {
    return {
      ratio,
      score: 65,
      warning: "Abnormal text expansion: layout shift risk detected.",
    };
  }

  const inBounds = ratio >= expectedMin && ratio <= expectedMax;
  const score = inBounds ? 100 : 88;
  return { ratio, score };
}

export function detectOverflow(
  blocks: SpatialTextBlock[]
): FidelityIssue[] {
  const issues: FidelityIssue[] = [];

  for (const block of blocks) {
    if (!block.translatedText) continue;

    // Estimate rendered width based on font size and text length
    const charPitch = (block.renderedFontSize || block.fontSize) * 0.52;
    const estWidth = block.translatedText.length * charPitch;

    if (block.width > 0 && estWidth > block.width * 1.08) {
      issues.push({
        type: "TEXT_OVERFLOW",
        page: block.page || 1,
        segmentId: block.id,
        severity: estWidth > block.width * 1.3 ? "high" : "medium",
        message: `Translated text (${block.translatedText.length} chars) exceeds region width (${Math.round(block.width)}pt) by ${Math.round(estWidth - block.width)}pt.`,
      });
    }
  }

  return issues;
}

export function detectCollision(
  blocks: SpatialTextBlock[]
): FidelityIssue[] {
  const issues: FidelityIssue[] = [];
  const pageBlocksMap = new Map<number, SpatialTextBlock[]>();

  for (const b of blocks) {
    const list = pageBlocksMap.get(b.page) || [];
    list.push(b);
    pageBlocksMap.set(b.page, list);
  }

  for (const [page, pBlocks] of pageBlocksMap.entries()) {
    for (let i = 0; i < pBlocks.length; i++) {
      for (let j = i + 1; j < pBlocks.length; j++) {
        const a = pBlocks[i];
        const b = pBlocks[j];

        // Axis-aligned bounding box collision test
        const overlapX = a.x < b.x + b.width && a.x + a.width > b.x;
        const overlapY = a.y < b.y + b.height && a.y + a.height > b.y;

        if (overlapX && overlapY) {
          const overlapArea =
            Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x)) *
            Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y));

          if (overlapArea > 20) {
            issues.push({
              type: "TEXT_COLLISION",
              page,
              segmentId: a.id,
              severity: "high",
              message: `Bounding box collision detected between blocks ${a.id} and ${b.id} on page ${page}.`,
            });
          }
        }
      }
    }
  }

  return issues;
}

export function detectMissingText(
  sourceSegments: { id: string; text: string }[],
  translatedSegments: { id: string; text: string }[]
): FidelityIssue[] {
  const issues: FidelityIssue[] = [];
  const transMap = new Map(translatedSegments.map((t) => [t.id, t.text]));

  for (const src of sourceSegments) {
    const tgt = transMap.get(src.id);
    if (!tgt || tgt.trim().length === 0) {
      issues.push({
        type: "MISSING_TEXT",
        page: 1,
        segmentId: src.id,
        severity: "critical",
        message: `Source segment ${src.id} has no translated text output.`,
      });
    }
  }

  return issues;
}

export function detectDuplicateText(
  translatedSegments: { id: string; text: string }[]
): FidelityIssue[] {
  const issues: FidelityIssue[] = [];
  const seen = new Set<string>();

  for (const seg of translatedSegments) {
    if (seg.text.length > 25) {
      if (seen.has(seg.text)) {
        issues.push({
          type: "DUPLICATE_TEXT",
          page: 1,
          segmentId: seg.id,
          severity: "medium",
          message: `Identical translated paragraph repeated in segment ${seg.id}.`,
        });
      }
      seen.add(seg.text);
    }
  }

  return issues;
}

export function compareTables(
  sourceCount = 0,
  translatedCount = 0
): { score: number; issues: FidelityIssue[] } {
  if (sourceCount === 0) return { score: 100, issues: [] };
  const match = sourceCount === translatedCount;
  const issues: FidelityIssue[] = match
    ? []
    : [
        {
          type: "TABLE_OVERFLOW",
          page: 1,
          severity: "high",
          message: `Table count mismatch: ${sourceCount} in source, ${translatedCount} in output.`,
        },
      ];
  return { score: match ? 100 : 75, issues };
}

export function compareImages(
  sourceCount = 0,
  translatedCount = 0
): { score: number; issues: FidelityIssue[] } {
  if (sourceCount === 0) return { score: 100, issues: [] };
  const match = sourceCount === translatedCount;
  const issues: FidelityIssue[] = match
    ? []
    : [
        {
          type: "IMAGE_DAMAGE",
          page: 1,
          severity: "medium",
          message: `Embedded image asset count changed from ${sourceCount} to ${translatedCount}.`,
        },
      ];
  return { score: match ? 100 : 85, issues };
}

export function checkRTL(
  targetLang: string,
  blocks: SpatialTextBlock[]
): { score: number; issues: FidelityIssue[] } {
  const isRtlLang = ["ar", "he", "fa", "ur"].includes(targetLang.toLowerCase());
  if (!isRtlLang) return { score: 100, issues: [] };

  const issues: FidelityIssue[] = [];
  let rtlCompliantCount = 0;

  for (const block of blocks) {
    // If target is Arabic/Hebrew, check if text has RTL characters and proper alignment flag
    const hasRtlChars = /[\u0600-\u06FF\u0590-\u05FF]/.test(block.translatedText || block.text);
    if (hasRtlChars) {
      if (block.isRtl) {
        rtlCompliantCount++;
      } else {
        issues.push({
          type: "RTL_ERROR",
          page: block.page || 1,
          segmentId: block.id,
          severity: "medium",
          message: `Arabic/RTL text rendered without RTL alignment metadata in block ${block.id}.`,
        });
      }
    }
  }

  const totalRtl = blocks.filter((b) =>
    /[\u0600-\u06FF\u0590-\u05FF]/.test(b.translatedText || b.text)
  ).length;

  const score = totalRtl === 0 ? 100 : Math.round((rtlCompliantCount / totalRtl) * 100);
  return { score, issues };
}

/**
 * Master evaluation function that computes true multi-vector Fidelity Score
 */
export function evaluateDocumentFidelity(
  input: FidelityEvaluationInput
): {
  breakdown: FidelityScoreBreakdown;
  issues: FidelityIssue[];
} {
  const allIssues: FidelityIssue[] = [];

  // 1. Page Count
  const pageRes = comparePages(input.sourcePageCount, input.translatedPageCount);
  if (!pageRes.match) {
    allIssues.push({
      type: "STRUCTURE_ERROR",
      page: 1,
      severity: "high",
      message: `Page count mismatch: ${input.sourcePageCount} source vs ${input.translatedPageCount} translated.`,
    });
  }

  // 2. Text Coverage
  const covRes = compareTextCoverage(
    input.sourceTextLength,
    input.translatedTextLength,
    input.targetLang
  );
  if (covRes.warning) {
    allIssues.push({
      type: "LAYOUT_SHIFT",
      page: 1,
      severity: "medium",
      message: covRes.warning,
    });
  }

  // 3. Overflow & Collisions (if spatial blocks available)
  let layoutScore = 100;
  if (input.spatialBlocks && input.spatialBlocks.length > 0) {
    const overflows = detectOverflow(input.spatialBlocks);
    const collisions = detectCollision(input.spatialBlocks);
    allIssues.push(...overflows, ...collisions);

    const overflowPenalty = overflows.length * 4;
    const collisionPenalty = collisions.length * 8;
    layoutScore = Math.max(50, 100 - overflowPenalty - collisionPenalty);
  }

  // 4. Missing / Duplicate Text
  if (input.sourceSegments && input.translatedSegments) {
    const missing = detectMissingText(input.sourceSegments, input.translatedSegments);
    const duplicates = detectDuplicateText(input.translatedSegments);
    allIssues.push(...missing, ...duplicates);
  }

  // 5. Tables & Images
  const tableRes = compareTables(input.sourceTableCount, input.translatedTableCount);
  const imageRes = compareImages(input.sourceImageCount, input.translatedImageCount);
  allIssues.push(...tableRes.issues, ...imageRes.issues);

  // 6. RTL Check
  const rtlRes = checkRTL(input.targetLang, input.spatialBlocks || []);
  allIssues.push(...rtlRes.issues);

  // Calculate Weighted Fidelity Score
  // Weights: Layout (30%), Coverage (25%), Pages (15%), RTL (10%), Tables (10%), Images (10%)
  const overall = Math.round(
    layoutScore * 0.3 +
      covRes.score * 0.25 +
      pageRes.score * 0.15 +
      rtlRes.score * 0.1 +
      tableRes.score * 0.1 +
      imageRes.score * 0.1
  );

  let grade: FidelityScoreBreakdown["grade"] = "PERFECT";
  if (overall < 70) grade = "CRITICAL";
  else if (overall < 85) grade = "WARNING";
  else if (overall < 94) grade = "ACCEPTABLE";
  else if (overall < 99) grade = "EXCELLENT";

  const warnings = allIssues.map((i) => i.message);

  return {
    breakdown: {
      overallScore: Math.max(0, Math.min(100, overall)),
      layoutScore,
      typographyScore: Math.min(100, Math.round((layoutScore + covRes.score) / 2)),
      textCoverageScore: covRes.score,
      tablesScore: tableRes.score,
      imagesScore: imageRes.score,
      rtlScore: rtlRes.score,
      grade,
      warnings,
    },
    issues: allIssues,
  };
}
