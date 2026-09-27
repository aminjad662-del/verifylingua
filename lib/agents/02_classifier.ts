import { AgentResult, ClassifierInput, ClassifierOutput } from "../../types/agents";

export class ClassifierAgent {
  public async execute(input: ClassifierInput): Promise<AgentResult<ClassifierOutput>> {
    try {
      const buffer = input.sanitizedBuffer;
      const size = buffer.length;

      // Detect Magic Bytes
      const isPdf = size > 4 && buffer.subarray(0, 4).toString("ascii") === "%PDF";
      const isJpeg = size > 3 && buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF;
      const isPng = size > 8 && buffer.subarray(0, 8).toString("hex") === "89504e470d0a1a0a";
      const isDocx = size > 4 && buffer.subarray(0, 4).toString("ascii") === "PK\x03\x04";

      let classification: "digital" | "scanned" = "digital";
      let recommendedEngine: "deepl" | "gemini" = "deepl";
      let complexityScore = 1.0;

      if (isJpeg || isPng) {
        // Raw images inherently require vision extraction
        classification = "scanned";
        complexityScore = 8.0;
        recommendedEngine = "gemini";
      } else if (isPdf) {
        // Heuristic analysis of PDF internals
        // Search the first 1MB of the document to see if it contains Text/Font descriptors vs purely Image streams
        const sample = buffer.subarray(0, Math.min(size, 1024 * 1024)).toString("ascii");
        
        const hasFonts = sample.includes("/Font");
        const hasImages = sample.includes("/Image") || sample.includes("/XObject");

        if (hasImages && !hasFonts) {
          // A PDF with images but no fonts is a scanned document wrapper
          classification = "scanned";
          complexityScore = 9.5;
          recommendedEngine = "gemini";
        } else if (hasImages && hasFonts) {
          // Mixed media (e.g. passport scan inside a PDF with some text, or complex brochure)
          classification = "digital";
          complexityScore = 6.5;
          recommendedEngine = "gemini";
        } else {
          // Pure text PDF
          classification = "digital";
          complexityScore = 3.0;
          recommendedEngine = "deepl";
        }
      } else if (isDocx) {
        // Native digital word processing format
        classification = "digital";
        complexityScore = 2.0;
        recommendedEngine = "deepl";
      }

      return {
        success: true,
        data: {
          classification,
          complexityScore,
          recommendedEngine
        }
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Classification failed"
      };
    }
  }
}
