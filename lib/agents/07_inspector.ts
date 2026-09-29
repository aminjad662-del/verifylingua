import { AgentResult, InspectorInput, InspectorOutput, TextBlock, TranslatedBlock } from "../../types/agents";

/**
 * Forbidden hallucination and AI laziness pattern regex:
 * Detects ellipses, "same as above", and "continued" truncation tokens.
 */
export const LAZINESS_REGEX = /\[\.\.\.\]|same as above|continued/i;

/**
 * Extracts and normalizes all digits from a string.
 * Normalizes Eastern Arabic-Indic numerals (٠-٩) to standard ASCII digits (0-9)
 * and returns the sorted digit sequence for strict multi-set equality comparison.
 */
export function extractDigits(text: string): string {
  if (!text) return "";

  const easternArabicNumerals: Record<string, string> = {
    "٠": "0",
    "١": "1",
    "٢": "2",
    "٣": "3",
    "٤": "4",
    "٥": "5",
    "٦": "6",
    "٧": "7",
    "٨": "8",
    "٩": "9",
  };

  const normalized = text.replace(/[٠-٩]/g, (char) => easternArabicNumerals[char] || char);
  const matches = normalized.match(/\d/g);
  if (!matches) return "";

  return matches.sort().join("");
}

/**
 * THE ASSERTION ENGINE
 * Enforces strict, zero-tolerance assertions on translated document blocks:
 * 1. Array Parity Check: If sourceBlocks.length !== translatedBlocks.length, throws Error.
 * 2. Hallucination/Laziness Regex: Scans translatedText for /[...] | same as above | continued/i, throws Error if matched.
 * 3. Numeric Integrity (Crucial): Extracts all digits from source.text and ensures translatedText contains exact same digits.
 */
export function assertParityAndIntegrity(
  sourceBlocks: Array<{ id: string; originalText?: string; text?: string }>,
  translatedBlocks: Array<{ id: string; translatedText: string }>
): void {
  // 1. Array Parity Check
  if (sourceBlocks.length !== translatedBlocks.length) {
    throw new Error(
      `Array parity mismatch: sourceBlocks.length (${sourceBlocks.length}) !== translatedBlocks.length (${translatedBlocks.length})`
    );
  }

  // 2. Hallucination/Laziness Regex Check
  for (const block of translatedBlocks) {
    const text = block.translatedText || "";
    if (LAZINESS_REGEX.test(text)) {
      const match = text.match(LAZINESS_REGEX);
      throw new Error(
        `AI laziness/hallucination detected in block "${block.id}": matched forbidden pattern "${match ? match[0] : ""}" in translatedText: "${text}"`
      );
    }
  }

  // 3. Numeric Integrity Check (Crucial)
  const sourceMap = new Map<string, string>();
  for (const sb of sourceBlocks) {
    const srcText = sb.text ?? sb.originalText ?? "";
    sourceMap.set(sb.id, srcText);
  }

  for (let i = 0; i < translatedBlocks.length; i++) {
    const tb = translatedBlocks[i];
    const directSource = sourceBlocks[i];
    const srcText =
      directSource && directSource.id === tb.id
        ? (directSource.text ?? directSource.originalText ?? "")
        : (sourceMap.get(tb.id) ?? "");

    const sourceDigits = extractDigits(srcText);
    const translatedDigits = extractDigits(tb.translatedText || "");

    if (sourceDigits !== translatedDigits) {
      throw new Error(
        `Numeric integrity violation in block "${tb.id}": source digits "${sourceDigits}" (from "${srcText}") do not match translated digits "${translatedDigits}" (from "${tb.translatedText}")`
      );
    }
  }
}

export class QAAgent {
  /**
   * Directly exposes the Assertion Engine for programmatic pre-render validation.
   */
  public assertParityAndIntegrity(
    sourceBlocks: Array<{ id: string; originalText?: string; text?: string }>,
    translatedBlocks: Array<{ id: string; translatedText: string }>
  ): void {
    assertParityAndIntegrity(sourceBlocks, translatedBlocks);
  }

  public async execute(input: InspectorInput): Promise<AgentResult<InspectorOutput>> {
    try {
      // 1. If sourceBlocks are provided, execute the strict assertion engine first
      if (input.sourceBlocks && input.sourceBlocks.length > 0) {
        this.assertParityAndIntegrity(input.sourceBlocks, input.translatedBlocks);
      }

      const warnings: string[] = [];
      let passed = true;
      let scorePenalty = 0;

      if (input.translatedBlocks.length === 0) {
        warnings.push("No translated blocks detected (Empty document)");
        passed = false;
        scorePenalty += 50;
      }

      for (const block of input.translatedBlocks) {
        if (!block.translatedText || block.translatedText.trim() === "") {
          warnings.push(`Missing translation for block ${block.id}`);
          scorePenalty += 2;
          continue;
        }

        // Check laziness regex
        if (LAZINESS_REGEX.test(block.translatedText)) {
          warnings.push(`Forbidden laziness pattern detected in block ${block.id}`);
          passed = false;
          scorePenalty += 30;
        }

        const [ymin, xmin, ymax, xmax] = block.box2d;
        const boxWidth = xmax - xmin;
        const boxHeight = ymax - ymin;

        // Rough geometric heuristic: Text length vs box volume
        const charCount = block.translatedText.length;
        const origCharCount = block.originalText.length;

        // Expansion ratio constraint (Text expanding heavily risks breaking layout bounds)
        const expansionRatio = charCount / Math.max(origCharCount, 1);
        if (expansionRatio > 2.5 && charCount > 20) {
          warnings.push(
            `Text expansion warning on block ${block.id} (${origCharCount} -> ${charCount} chars). Risks visual drift.`
          );
          scorePenalty += 0.5;
        }

        // Bounding box bounds check (Ensure valid physical dimensions)
        if (boxWidth <= 0 || boxHeight <= 0 || isNaN(boxWidth)) {
          warnings.push(`Corrupted bounding box geometry on block ${block.id}`);
          passed = false;
          scorePenalty += 10;
        }

        // Rough text overflow bounds check based on average char width at estimated font size
        const fontSize = block.fontSizeTier === "title" ? 24 : block.fontSizeTier === "heading" ? 16 : 12;
        const avgCharWidth = fontSize * 0.5;
        const estimatedTextWidth = charCount * avgCharWidth;

        if (estimatedTextWidth > boxWidth * 1.5) {
          warnings.push(
            `Potential text overflow on block ${block.id}. Estimated width ${Math.round(estimatedTextWidth)}px exceeds box bounds.`
          );
          scorePenalty += 1.5;
        }
      }

      // Hard failure if drift score penalty exceeds threshold
      if (scorePenalty > 15) {
        passed = false;
        warnings.push("Severe visual drift detected. Auto-repair or manual intervention required.");
      }

      const fidelityScore = Math.max(0, 100 - scorePenalty);

      return {
        success: true,
        data: {
          passed,
          warnings,
          fidelityScore,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "QA Inspection failed",
      };
    }
  }
}
