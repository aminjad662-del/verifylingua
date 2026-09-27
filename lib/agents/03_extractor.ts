import { AgentResult, ExtractorInput, ExtractorOutput, TextBlock } from "../../types/agents";
import { extractPdfSpatialBlocks, extractImageSpatialBlocks } from "../translation/spatial";

export class ExtractionAgent {
  public async execute(input: ExtractorInput): Promise<AgentResult<ExtractorOutput>> {
    try {
      const buffer = input.sanitizedBuffer;
      const isPdf = buffer.length > 4 && buffer.subarray(0, 4).toString("ascii") === "%PDF";
      const isJpeg = buffer.length > 3 && buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF;
      const isPng = buffer.length > 8 && buffer.subarray(0, 8).toString("hex") === "89504e470d0a1a0a";

      let rawBlocks: any[] = [];

      if (isPdf) {
        const result = await extractPdfSpatialBlocks(buffer);
        rawBlocks = result.blocks;
      } else if (isJpeg || isPng) {
        const format = isJpeg ? "jpg" : "png";
        const result = await extractImageSpatialBlocks(buffer, format);
        rawBlocks = result.blocks;
      } else {
        // Fallback for DOCX or unknown: mock structural block for now
        rawBlocks = [{
          id: `block_fallback_${Date.now()}`,
          text: "Fallback block for unsupported extraction format",
          x: 0, y: 0, width: 100, height: 100, page: 1, fontSize: 12
        }];
      }

      // Map to orchestrator schema
      const blocks: TextBlock[] = rawBlocks.map((b, i) => {
        const fontSize = b.fontSize || 12;
        let tier: "title" | "heading" | "body" | "caption" = "body";
        if (fontSize >= 24) tier = "title";
        else if (fontSize >= 16) tier = "heading";
        else if (fontSize < 10) tier = "caption";

        return {
          id: b.id || `b_${i}`,
          box2d: [b.y, b.x, b.y + b.height, b.x + b.width], // [ymin, xmin, ymax, xmax]
          originalText: b.text,
          fontSizeTier: tier,
          align: "left", // Rough default, precise calculation requires sibling analysis
          pageNumber: b.page || 1
        };
      });

      return {
        success: true,
        data: {
          blocks
        }
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Extraction failed"
      };
    }
  }
}
