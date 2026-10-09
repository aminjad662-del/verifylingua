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
      } else if (buffer.length > 4 && buffer.subarray(0, 4).toString("ascii") === "PK\x03\x04") {
        const { groupDocxParagraphRuns } = await import("../translation/spatial");
        const docxData = await groupDocxParagraphRuns(buffer);
        rawBlocks = docxData.paragraphs.map((p, idx) => ({
          id: p.id,
          text: p.fullText,
          x: 50,
          y: 50 + idx * 20,
          width: 500,
          height: 16,
          page: 0,
          fontSize: 11,
        }));
      } else {
        throw new Error("Unsupported document format for extraction. Supported formats: PDF, PNG, JPG, DOCX.");
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
          pageNumber: typeof b.page === "number" ? b.page + 1 : 1
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
