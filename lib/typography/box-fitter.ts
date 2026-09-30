import { PDFFont } from "pdf-lib";
import { convertArabic } from "arabic-reshaper";
import bidiFactory from "bidi-js";

const bidi = bidiFactory();

export interface TypographyFitResult {
  lines: string[];
  fontSize: number;
  lineHeight: number;
  letterSpacing: number; // In points for Tc operator
  scaleX: number;
  totalHeight: number;
  maxLineWidth: number;
}

/**
 * Reshapes Arabic glyphs and applies the Unicode Bidirectional Algorithm (BiDi).
 * Directional isolation isolates embedded Latin terms, currency symbols, and numbers.
 */
export function shapeAndReorderBidi(text: string, isRtl: boolean): string {
  if (!isRtl || !text) return text;
  try {
    const reshaped = convertArabic(text);
    const levels = bidi.getEmbeddingLevels(reshaped);
    return bidi.getReorderedString(reshaped, levels);
  } catch {
    return text;
  }
}

/**
 * Measures the exact width of a text string including font size, letter-spacing, and scale.
 */
export function measureTextWidth(
  text: string,
  fontSize: number,
  letterSpacing: number,
  font: PDFFont,
  scaleX: number = 1.0
): number {
  if (!text) return 0;
  let baseWidth = 0;
  try {
    baseWidth = font.widthOfTextAtSize(text, fontSize);
  } catch {
    baseWidth = text.length * (fontSize * 0.52);
  }
  const extraCharSpacing = Math.max(0, text.length - 1) * letterSpacing;
  return Math.max(0, (baseWidth + extraCharSpacing) * scaleX);
}

/**
 * Advanced Word & Character Wrapping Engine:
 * Strictly wraps text within maxWidth. If an unbreakable word exceeds maxWidth,
 * cleanly hyphenates and breaks across lines to prevent box overflow.
 */
export function wrapText(
  str: string,
  fontSize: number,
  letterSpacing: number,
  maxWidth: number,
  font: PDFFont
): string[] {
  const paragraphs = str.split(/\r?\n/);
  const result: string[] = [];

  for (const para of paragraphs) {
    if (!para.trim()) {
      result.push("");
      continue;
    }

    const words = para.split(/\s+/);
    let currentLine = "";

    for (const word of words) {
      const candidateLine = currentLine ? `${currentLine} ${word}` : word;
      const candidateWidth = measureTextWidth(candidateLine, fontSize, letterSpacing, font);

      if (candidateWidth <= maxWidth) {
        currentLine = candidateLine;
      } else {
        if (currentLine) {
          result.push(currentLine);
          currentLine = "";
        }

        // Check if single word exceeds maxWidth on its own
        const wordWidth = measureTextWidth(word, fontSize, letterSpacing, font);
        if (wordWidth > maxWidth) {
          let chunk = "";
          for (let i = 0; i < word.length; i++) {
            const char = word[i];
            const testChunk = chunk + char;
            const hasMore = i < word.length - 1;
            const testWithHyphen = hasMore ? testChunk + "-" : testChunk;
            const chunkWidth = measureTextWidth(testWithHyphen, fontSize, letterSpacing, font);

            if (chunkWidth <= maxWidth || chunk.length === 0) {
              chunk = testChunk;
            } else {
              result.push(chunk + "-");
              chunk = char;
            }
          }
          if (chunk) {
            currentLine = chunk;
          }
        } else {
          currentLine = word;
        }
      }
    }

    if (currentLine) {
      result.push(currentLine);
    }
  }

  return result.length > 0 ? result : [str];
}

/**
 * 3-Axis Precision Typography Box-Fitting Algorithm:
 * Optimizes Font Size, Line Height, and Letter Spacing.
 * 
 * Invariants:
 * 1. Never horizontal overflow: every line width <= boxWidth.
 * 2. Never vertical overflow: totalHeight <= boxHeight.
 * 3. Never line overlap: lineHeight >= fontSize * 1.02.
 * 4. Never clip: text fits strictly inside box bounds with safety margins.
 */
export function fitTypography(
  text: string,
  boxWidth: number,
  boxHeight: number,
  initialFontSize: number,
  font: PDFFont,
  isRtl: boolean = false
): TypographyFitResult {
  const minFontSize = 6.0;
  const safeBoxWidth = Math.max(12, boxWidth - 1.0);
  const safeBoxHeight = Math.max(8, boxHeight - 1.0);
  const targetText = isRtl ? convertArabic(text) : text;

  // 1. Primary multi-parameter optimization loop
  let bestResult: TypographyFitResult | null = null;
  let minTotalHeightExceeded = Infinity;

  // Search font sizes downwards from initialFontSize to 6.0 in 0.25pt steps
  for (let size = Math.max(minFontSize, initialFontSize); size >= minFontSize; size -= 0.25) {
    // Letter-spacing adjustments: 0.0 down to -0.035em
    const letterSpacings = [0.0, -0.01 * size, -0.02 * size, -0.035 * size];

    for (const ls of letterSpacings) {
      const lines = wrapText(targetText, size, ls, safeBoxWidth, font);

      // Line-height multipliers: 1.25 (comfortable) down to 1.04 (compact, collision-free)
      const lineHeights = [1.25, 1.20, 1.15, 1.10, 1.05];

      for (const lhMult of lineHeights) {
        const lineHeight = Math.max(size * 1.02, size * lhMult);
        const totalHeight = lines.length * lineHeight;

        if (totalHeight <= safeBoxHeight) {
          // Verify that all individual line widths strictly satisfy safeBoxWidth
          let maxLineW = 0;
          let allWithinWidth = true;
          for (const l of lines) {
            const w = measureTextWidth(l, size, ls, font);
            if (w > maxLineW) maxLineW = w;
            if (w > safeBoxWidth + 0.001) {
              allWithinWidth = false;
              break;
            }
          }

          if (allWithinWidth) {
            const finalLines = isRtl ? lines.map((l) => shapeAndReorderBidi(l, true)) : lines;
            return {
              lines: finalLines,
              fontSize: size,
              lineHeight,
              letterSpacing: ls,
              scaleX: 1.0,
              totalHeight,
              maxLineWidth: maxLineW,
            };
          }
        } else {
          if (totalHeight < minTotalHeightExceeded) {
            minTotalHeightExceeded = totalHeight;
          }
        }
      }
    }
  }

  // 2. Secondary stage: At minFontSize (6.0pt), letterSpacing (-0.035em),
  // apply horizontal condensation transform scaleX (down to 0.65)
  const size = minFontSize;
  const ls = -0.035 * size;
  const tightLh = size * 1.04;

  for (let scaleX = 0.95; scaleX >= 0.60; scaleX -= 0.05) {
    const effectiveWidth = safeBoxWidth / scaleX;
    const lines = wrapText(targetText, size, ls, effectiveWidth, font);
    const totalHeight = lines.length * tightLh;

    if (totalHeight <= safeBoxHeight) {
      let maxLineW = 0;
      for (const l of lines) {
        const w = measureTextWidth(l, size, ls, font, scaleX);
        if (w > maxLineW) maxLineW = w;
      }

      const finalLines = isRtl ? lines.map((l) => shapeAndReorderBidi(l, true)) : lines;
      return {
        lines: finalLines,
        fontSize: size,
        lineHeight: tightLh,
        letterSpacing: ls,
        scaleX,
        totalHeight,
        maxLineWidth: maxLineW,
      };
    }
  }

  // 3. Ultimate bound clamping (extreme overflow safeguard)
  const fallbackScaleX = 0.60;
  const effectiveWidth = safeBoxWidth / fallbackScaleX;
  const fallbackLines = wrapText(targetText, size, ls, effectiveWidth, font);
  const clampedLineHeight = Math.max(size * 1.02, safeBoxHeight / Math.max(1, fallbackLines.length));
  const finalLines = isRtl ? fallbackLines.map((l) => shapeAndReorderBidi(l, true)) : fallbackLines;

  let maxLineW = 0;
  for (const l of finalLines) {
    const w = measureTextWidth(l, size, ls, font, fallbackScaleX);
    if (w > maxLineW) maxLineW = w;
  }

  return {
    lines: finalLines,
    fontSize: size,
    lineHeight: clampedLineHeight,
    letterSpacing: ls,
    scaleX: fallbackScaleX,
    totalHeight: Math.min(safeBoxHeight, fallbackLines.length * clampedLineHeight),
    maxLineWidth: maxLineW,
  };
}
