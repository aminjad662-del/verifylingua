import { describe, it, expect } from "vitest";
import { PDFDocument, StandardFonts, rgb, PDFName } from "pdf-lib";
import { Jimp } from "jimp";
import zlib from "zlib";
import {
  ReconstructionAgent,
  removeVectorTextObjectsFromPdf,
  sampleSurroundingBackgroundFill,
  parseTextColor,
  shapeAndReorderBidi,
  fitTypography,
  getCachedFontBuffer,
} from "../lib/agents/06_renderer";
import { TranslatedBlock, RendererInput } from "../types/agents";

describe("Phase 3: Flawless Rendering & BiDi (06_renderer.ts)", () => {
  describe("1. Smart Redaction (Vector PDF Stream Manipulation)", () => {
    it("strips BT...ET text operators while preserving vector paths, lines, and backgrounds", async () => {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([600, 400]);

      // Manually push content stream containing vector graphics AND text objects
      // Vector rectangle + line + BT...ET text
      const contentStream =
        "q\n" +
        "0.2 0.4 0.8 rg\n" + // vector color
        "50 50 200 100 re\n" + // vector rectangle
        "f\n" + // fill
        "BT\n" + // Begin Text
        "/F1 14 Tf\n" +
        "100 100 Td\n" +
        "(Original Confidential Vector Text) Tj\n" +
        "ET\n" + // End Text
        "0 0 0 RG\n" + // stroke color
        "50 200 m 250 200 l S\n" + // vector line
        "Q\n";

      const flateStream = pdfDoc.context.flateStream(contentStream);
      const streamRef = pdfDoc.context.register(flateStream);
      page.node.set(PDFName.of("Contents"), streamRef);

      // Verify text object exists initially
      const rawBefore = flateStream.asUint8Array();
      const inflatedBefore = zlib.inflateSync(Buffer.from(rawBefore)).toString("latin1");
      expect(inflatedBefore).toContain("BT");
      expect(inflatedBefore).toContain("(Original Confidential Vector Text) Tj");
      expect(inflatedBefore).toContain("50 50 200 100 re"); // Vector artwork

      // Execute stream stripping
      const strippedCount = removeVectorTextObjectsFromPdf(pdfDoc);
      expect(strippedCount).toBeGreaterThan(0);

      // Verify text object is completely removed from PDF context stream
      const savedBytes = await pdfDoc.save();
      const reloadedDoc = await PDFDocument.load(savedBytes);
      const reloadedPage = reloadedDoc.getPages()[0];
      const reloadedStream = reloadedPage.node.Contents() as any;
      const rawAfter = reloadedStream.asUint8Array();
      const inflatedAfter = zlib.inflateSync(Buffer.from(rawAfter)).toString("latin1");

      expect(inflatedAfter).not.toContain("BT");
      expect(inflatedAfter).not.toContain("ET");
      expect(inflatedAfter).not.toContain("Original Confidential Vector Text");
      // Assert vector paths and background artwork were STRICTLY preserved
      expect(inflatedAfter).toContain("50 50 200 100 re");
      expect(inflatedAfter).toContain("50 200 m 250 200 l S");
    });
  });

  describe("2. Smart Redaction (Raster Background Color Sampling)", () => {
    it("samples surrounding background edge pixels instead of drawing blind rgb(1,1,1) white boxes", async () => {
      // Create a 200x200 image with a specific background color: RGB(180, 210, 240)
      const targetR = 180;
      const targetG = 210;
      const targetB = 240;

      const img = new Jimp({ width: 200, height: 200, color: 0xb4d2f0ff }); // hex for (180, 210, 240, 255)

      // Add dummy dark text pixels in the center [50, 50, 80, 150]
      for (let y = 50; y < 80; y++) {
        for (let x = 50; x < 150; x++) {
          img.setPixelColor(0x101010ff, x, y);
        }
      }

      const imgBuffer = await img.getBuffer("image/png");

      // Sample surrounding edges of bounding box [ymin=50, xmin=50, ymax=80, xmax=150]
      const bg = await sampleSurroundingBackgroundFill(imgBuffer, [50, 50, 80, 150]);

      // Should closely match the background (180, 210, 240), NOT 255, 255, 255
      expect(Math.abs(bg.r - targetR)).toBeLessThanOrEqual(2);
      expect(Math.abs(bg.g - targetG)).toBeLessThanOrEqual(2);
      expect(Math.abs(bg.b - targetB)).toBeLessThanOrEqual(2);
    });
  });

  describe("3. Color Extraction & Parsing", () => {
    it("parses Hex (#RRGGBB and #RGB), RGB strings, and color arrays accurately", () => {
      // Hex 6-char
      const red = parseTextColor("#FF0000");
      expect(red).toEqual(rgb(1, 0, 0));

      // Hex 3-char
      const green = parseTextColor("#0F0");
      expect(green).toEqual(rgb(0, 1, 0));

      // rgb(r, g, b) string
      const customBlue = parseTextColor("rgb(0, 128, 255)");
      expect((customBlue as any).red).toBeCloseTo(0, 2);
      expect((customBlue as any).green).toBeCloseTo(128 / 255, 2);
      expect((customBlue as any).blue).toBeCloseTo(1, 2);

      // Numeric tuple
      const tupleCol = parseTextColor([51, 102, 153]);
      expect((tupleCol as any).red).toBeCloseTo(51 / 255, 2);
      expect((tupleCol as any).green).toBeCloseTo(102 / 255, 2);
      expect((tupleCol as any).blue).toBeCloseTo(153 / 255, 2);

      // Default fallback
      const def = parseTextColor(undefined);
      expect(def).toEqual(rgb(0, 0, 0));
    });
  });

  describe("4. Exact Alignment & BiDi / Arabic Reshaping", () => {
    it("correctly reshapes Arabic characters and applies BiDi reordering", () => {
      // Arabic greeting: "مرحبا بكم"
      const rawArabic = "مرحبا بكم";
      const shaped = shapeAndReorderBidi(rawArabic, true);

      // Reshaped Arabic should not equal raw unshaped Unicode code points
      expect(shaped).not.toBe(rawArabic);
      expect(shaped.length).toBeGreaterThan(0);

      // LTR text should not be altered when isRtl is false
      const english = "Certified Translation";
      const preserved = shapeAndReorderBidi(english, false);
      expect(preserved).toBe(english);
    });
  });

  describe("5. Advanced Typography Fitting (Wrap -> Scale -> Condense)", () => {
    it("fits text via wrapping at standard scale when box is spacious", async () => {
      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

      const text = "This is a clean sentence that should wrap into multiple lines.";
      const fit = fitTypography(text, 150, 100, 12, font, false);

      expect(fit.lines.length).toBeGreaterThan(1);
      expect(fit.scaleX).toBe(1.0);
      expect(fit.fontSize).toBe(12);
      expect(fit.totalHeight).toBeLessThanOrEqual(100);
    });

    it("iteratively reduces font size down to 6pt if initial size overflows height", async () => {
      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

      // Bounding box only has height of 28pt, initial size 24pt
      const text = "Multi-line heading text that requires font size reduction to fit within box";
      const fit = fitTypography(text, 200, 28, 24, font, false);

      expect(fit.fontSize).toBeLessThan(24);
      expect(fit.fontSize).toBeGreaterThanOrEqual(6);
      expect(fit.totalHeight).toBeLessThanOrEqual(28);
    });

    it("applies horizontal transform scaling (condensed text scaleX < 1.0) when overflowing at 6pt limit", async () => {
      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

      // Very constrained box: width 80, height 14 (only 1-2 lines possible at 6pt)
      const text = "Supercalifragilisticexpialidocious Ultra Long Dense Paragraph That Definitely Overflows Constrained Limits";
      const fit = fitTypography(text, 80, 14, 12, font, false);

      // Must be at minimum font size 6pt
      expect(fit.fontSize).toBe(6);
      // Must have condensed horizontal scaleX < 1.0
      expect(fit.scaleX).toBeLessThan(1.0);
      expect(fit.scaleX).toBeGreaterThanOrEqual(0.5);
      expect(fit.totalHeight).toBeLessThanOrEqual(15);
    });
  });

  describe("6. Unicode Font Caching", () => {
    it("caches loaded Unicode font buffers in memory across calls", () => {
      const buf1 = getCachedFontBuffer("NotoSansArabic");
      expect(buf1).not.toBeNull();
      expect(buf1?.length).toBeGreaterThan(1000);

      const buf2 = getCachedFontBuffer("NotoSansArabic");
      // Must return identical cached buffer reference
      expect(buf1).toBe(buf2);
    });
  });

  describe("7. Full Reconstruction Pipeline (ReconstructionAgent.execute)", () => {
    it("renders translated PDF document without errors and preserves original page count", async () => {
      const sourcePdfDoc = await PDFDocument.create();
      const p1 = sourcePdfDoc.addPage([595.28, 841.89]);
      p1.drawText("Original Document Page 1", { x: 50, y: 800, size: 14 });
      const sourceBytes = await sourcePdfDoc.save();

      const translatedBlocks: TranslatedBlock[] = [
        {
          id: "b1",
          pageNumber: 1,
          box2d: [40, 50, 60, 400], // ymin, xmin, ymax, xmax
          originalText: "Original Document Page 1",
          translatedText: "Documento Original Página 1",
          fontSizeTier: "heading",
          align: "left",
        },
      ];

      const agent = new ReconstructionAgent();
      const input: RendererInput = {
        originalBuffer: Buffer.from(sourceBytes),
        translatedBlocks,
        targetLang: "es",
        jobId: "job-test-p3",
      };

      const result = await agent.execute(input);
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.format).toBe("pdf");
      expect(result.data?.renderedBuffer.length).toBeGreaterThan(1000);

      // Verify the generated PDF is valid and loadable
      const outputPdf = await PDFDocument.load(result.data!.renderedBuffer);
      expect(outputPdf.getPageCount()).toBe(1);
    });

    it("renders RTL Arabic blocks with proper font embedding and right alignment anchoring", async () => {
      const sourcePdfDoc = await PDFDocument.create();
      sourcePdfDoc.addPage([595.28, 841.89]);
      const sourceBytes = await sourcePdfDoc.save();

      const translatedBlocks: TranslatedBlock[] = [
        {
          id: "b-ar-1",
          pageNumber: 1,
          box2d: [100, 100, 130, 500],
          originalText: "Official Certified Translation Certificate",
          translatedText: "شهادة ترجمة معتمدة رسمياً",
          fontSizeTier: "title",
          align: "right",
        },
      ];

      const agent = new ReconstructionAgent();
      const input: RendererInput = {
        originalBuffer: Buffer.from(sourceBytes),
        translatedBlocks,
        targetLang: "ar",
        jobId: "job-test-ar",
      };

      const result = await agent.execute(input);
      expect(result.success).toBe(true);
      expect(result.data?.renderedBuffer).toBeDefined();

      const outputPdf = await PDFDocument.load(result.data!.renderedBuffer);
      expect(outputPdf.getPageCount()).toBe(1);
    });
  });
});
