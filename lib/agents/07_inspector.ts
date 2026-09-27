import { AgentResult, InspectorInput, InspectorOutput } from "../../types/agents";

export class QAAgent {
  public async execute(input: InspectorInput): Promise<AgentResult<InspectorOutput>> {
    try {
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

        const [ymin, xmin, ymax, xmax] = block.box2d;
        const boxWidth = xmax - xmin;
        const boxHeight = ymax - ymin;
        
        // Rough geometric heuristic: Text length vs box volume
        const charCount = block.translatedText.length;
        const origCharCount = block.originalText.length;
        
        // Expansion ratio constraint (Text expanding heavily risks breaking layout bounds)
        const expansionRatio = charCount / Math.max(origCharCount, 1);
        if (expansionRatio > 2.5 && charCount > 20) {
          warnings.push(`Text expansion warning on block ${block.id} (${origCharCount} -> ${charCount} chars). Risks visual drift.`);
          scorePenalty += 0.5;
        }

        // Bounding box bounds check (Ensure valid physical dimensions)
        if (boxWidth <= 0 || boxHeight <= 0 || isNaN(boxWidth)) {
          warnings.push(`Corrupted bounding box geometry on block ${block.id}`);
          passed = false;
          scorePenalty += 10;
        }

        // Very rough text overflow bounds check based on average char width at estimated font size
        const fontSize = block.fontSizeTier === "title" ? 24 : block.fontSizeTier === "heading" ? 16 : 12;
        const avgCharWidth = fontSize * 0.5;
        const estimatedTextWidth = charCount * avgCharWidth;
        
        if (estimatedTextWidth > boxWidth * 1.5) { // 1.5 multiplier accounts for wrapping
          warnings.push(`Potential text overflow on block ${block.id}. Estimated width ${Math.round(estimatedTextWidth)}px exceeds box bounds.`);
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
          fidelityScore
        }
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "QA Inspection failed"
      };
    }
  }
}
