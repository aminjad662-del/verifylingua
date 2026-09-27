import { AgentResult, RendererInput, RendererOutput } from "../../types/agents";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export class ReconstructionAgent {
  public async execute(input: RendererInput): Promise<AgentResult<RendererOutput>> {
    try {
      const { originalBuffer, translatedBlocks, targetLang } = input;
      const isPdf = originalBuffer.length > 4 && originalBuffer.subarray(0, 4).toString("ascii") === "%PDF";
      
      let pdfDoc: PDFDocument;
      if (isPdf) {
        pdfDoc = await PDFDocument.load(originalBuffer, { ignoreEncryption: true });
      } else {
        // Fallback for image inputs: create blank PDF with image as background
        pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([595.28, 841.89]); // A4
        try {
          const image = await pdfDoc.embedJpg(originalBuffer).catch(() => pdfDoc.embedPng(originalBuffer));
          page.drawImage(image, { x: 0, y: 0, width: page.getWidth(), height: page.getHeight() });
        } catch {
          // Ignore embedding error if not a valid image
        }
      }

      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const pages = pdfDoc.getPages();

      for (const block of translatedBlocks) {
        const pageIdx = Math.max(0, Math.min(block.pageNumber - 1, pages.length - 1));
        const page = pages[pageIdx];
        const pageHeight = page.getHeight();

        const [ymin, xmin, ymax, xmax] = block.box2d;
        const width = Math.max(10, xmax - xmin);
        const height = Math.max(10, ymax - ymin);
        // Convert from standard top-left origin to PDF-lib's bottom-left origin
        const pdfY = pageHeight - ymax; 
        const pdfX = xmin;

        // Mask original text with a white rectangle
        page.drawRectangle({
          x: pdfX,
          y: pdfY,
          width,
          height,
          color: rgb(1, 1, 1),
        });

        const text = block.translatedText || block.originalText;
        let fontSize = block.fontSizeTier === "title" ? 24 : block.fontSizeTier === "heading" ? 16 : block.fontSizeTier === "caption" ? 9 : 12;

        // Dynamic text scaling to prevent overflow
        let textWidth = font.widthOfTextAtSize(text, fontSize);
        while (textWidth > width && fontSize > 4) {
          fontSize -= 1;
          textWidth = font.widthOfTextAtSize(text, fontSize);
        }

        // Handle RTL alignment (right-aligned for Arabic/Hebrew)
        const isRtl = targetLang === "ar" || targetLang === "he";
        const finalX = isRtl ? pdfX + width - textWidth : pdfX;

        page.drawText(text, {
          x: finalX,
          y: pdfY + (height / 2) - (fontSize / 2),
          size: fontSize,
          font,
          color: rgb(0, 0, 0)
        });
      }

      const renderedBytes = await pdfDoc.save();

      return {
        success: true,
        data: {
          renderedBuffer: Buffer.from(renderedBytes),
          format: "pdf"
        }
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Reconstruction failed"
      };
    }
  }
}
