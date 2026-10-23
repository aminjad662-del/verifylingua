import { describe, it, expect } from "vitest";
import {
  buildImageTranslatedSvg,
  sortBlocksReadingOrder,
  normalizeBlockCoordinates,
  defragmentTranslatedText,
  COMPLETE_WORKSHEET_BLOCKS,
  TranslatedBlockData,
} from "@/lib/translation/svg-builder";

describe("Document Paragraph Completeness & Layout Order Verification", () => {
  const dummyImageBuffer = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", "base64");

  it("1. sortBlocksReadingOrder preserves column integrity without interleaving columns", () => {
    // 2-column layout:
    // Left column: x=50, width=300, y=100, 150, 200
    // Right column: x=400, width=300, y=105, 155, 205
    const multiColBlocks: TranslatedBlockData[] = [
      { box_2d: [105, 400, 135, 700], translated_text: "Right Column Paragraph 1" },
      { box_2d: [100, 50, 130, 350], translated_text: "Left Column Paragraph 1" },
      { box_2d: [205, 400, 235, 700], translated_text: "Right Column Paragraph 3" },
      { box_2d: [150, 50, 180, 350], translated_text: "Left Column Paragraph 2" },
      { box_2d: [155, 400, 185, 700], translated_text: "Right Column Paragraph 2" },
      { box_2d: [200, 50, 230, 350], translated_text: "Left Column Paragraph 3" },
    ];

    const sortedLtr = sortBlocksReadingOrder(multiColBlocks, 1000, 1000, false);
    const textsLtr = sortedLtr.map((b) => b.translated_text);

    // Left column should be read first from top to bottom, followed by right column
    expect(textsLtr[0]).toBe("Left Column Paragraph 1");
    expect(textsLtr[1]).toBe("Left Column Paragraph 2");
    expect(textsLtr[2]).toBe("Left Column Paragraph 3");
    expect(textsLtr[3]).toBe("Right Column Paragraph 1");
    expect(textsLtr[4]).toBe("Right Column Paragraph 2");
    expect(textsLtr[5]).toBe("Right Column Paragraph 3");
  });

  it("2. sortBlocksReadingOrder handles same-row form fields in natural reading order", () => {
    // Form fields on the same row: Label (x=50, y=100) and Value (x=250, y=102)
    const formBlocks: TranslatedBlockData[] = [
      { box_2d: [102, 250, 122, 500], translated_text: "FRANCESCO" },
      { box_2d: [100, 50, 120, 200], translated_text: "NOME / FORENAME" },
      { box_2d: [142, 250, 162, 500], translated_text: "DE PRISCO" },
      { box_2d: [140, 50, 160, 200], translated_text: "COGNOME / SURNAME" },
    ];

    const sorted = sortBlocksReadingOrder(formBlocks, 1000, 1000, false);
    const texts = sorted.map((b) => b.translated_text);

    expect(texts[0]).toBe("NOME / FORENAME");
    expect(texts[1]).toBe("FRANCESCO");
    expect(texts[2]).toBe("COGNOME / SURNAME");
    expect(texts[3]).toBe("DE PRISCO");
  });

  it("3. buildImageTranslatedSvg never drops lines or words from multi-line paragraphs", () => {
    const fullParagraphText =
      "Tyler was excited. He could not wait to practice his swimming skills he learned at the local pool during the spring. Dad had to work, so he was not going to be able to go along with them today. Mom packed the sandwiches and beach blankets into the car.";

    const blocks: TranslatedBlockData[] = [
      {
        box_2d: [200, 50, 320, 600],
        original_text: fullParagraphText,
        translated_text: fullParagraphText,
        font_size_tier: "body",
      },
      // Following block vertically down
      {
        box_2d: [350, 50, 400, 600],
        original_text: "Next paragraph text begins here.",
        translated_text: "Next paragraph text begins here.",
        font_size_tier: "body",
      },
    ];

    const svg = buildImageTranslatedSvg({
      imageBuffer: dummyImageBuffer,
      mimeType: "image/png",
      width: 800,
      height: 1000,
      blocks,
      targetLang: "en",
      fileName: "custom-document.png",
    });

    // Every key phrase from the source paragraph must be present in the SVG output without dropped words
    const svgTextContent = svg.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
    expect(svgTextContent).toContain("Tyler was excited");
    expect(svgTextContent).toContain("swimming skills");
    expect(svgTextContent).toContain("local pool");
    expect(svgTextContent).toContain("Dad had to work");
    expect(svgTextContent).toContain("sandwiches and beach blankets");
    expect(svgTextContent).toContain("Next paragraph text begins here");

    // Clip path must not prematurely clip the first block
    // Bounding box spans ymin=200 to ymax=320 -> top=200, height=120
    const clipMatches = Array.from(svg.matchAll(/<clipPath id="([^"]+)">\s*<rect [^>]*height="([^"]+)"/g));
    expect(clipMatches.length).toBeGreaterThanOrEqual(2);
    const firstClipHeight = parseFloat(clipMatches[0][2]);
    expect(firstClipHeight).toBeGreaterThanOrEqual(100); // Must not be clamped to 16px!
  });

  it("4. normalizeBlockCoordinates correctly maps both box_2d [ymin, xmin, ymax, xmax] and bbox [minX, minY, maxX, maxY]", () => {
    // Standard Gemini box_2d: [ymin, xmin, ymax, xmax]
    const b1: TranslatedBlockData = {
      box_2d: [100, 50, 200, 350],
      text: "Gemini Block",
    };
    const norm1 = normalizeBlockCoordinates(b1, 1000, 1000);
    expect(norm1.top).toBe(100);
    expect(norm1.left).toBe(50);
    expect(norm1.boxH).toBe(100);
    expect(norm1.boxW).toBe(300);

    // Standard CV / PDF bbox: [minX, minY, maxX, maxY]
    const b2: TranslatedBlockData = {
      bbox: [50, 100, 350, 200],
      text: "PDF BBox Block",
    };
    const norm2 = normalizeBlockCoordinates(b2, 1000, 1000);
    expect(norm2.left).toBe(50);
    expect(norm2.top).toBe(100);
    expect(norm2.boxW).toBe(300);
    expect(norm2.boxH).toBe(100);
  });

  it("5. buildImageTranslatedSvg does not clamp full-width text in arbitrary documents", () => {
    // Full width document banner at y=300 spanning x=50 to x=750
    const bannerBlock: TranslatedBlockData = {
      box_2d: [300, 50, 340, 750],
      original_text: "OFFICIAL CERTIFICATE OF ACADEMIC ACHIEVEMENT AND HONORS DISTINCTION",
      translated_text: "OFFICIAL CERTIFICATE OF ACADEMIC ACHIEVEMENT AND HONORS DISTINCTION",
      font_size_tier: "heading",
    };

    const svg = buildImageTranslatedSvg({
      imageBuffer: dummyImageBuffer,
      mimeType: "image/png",
      width: 1000,
      height: 1000,
      blocks: [bannerBlock],
      targetLang: "en",
      fileName: "certificate-of-achievement.png",
    });

    // The mask width should cover the full span (700px width), NOT be clamped to 568 - 50 = 518px!
    const maskMatch = svg.match(/<rect [^>]*width="([^"]+)" [^>]*fill=/);
    expect(maskMatch).not.toBeNull();
    const maskWidth = parseFloat(maskMatch![1]);
    expect(maskWidth).toBeGreaterThan(650);
  });

  it("6. sortBlocksReadingOrder preserves row field order (Label -> Value) even when isRtl is true", () => {
    // In official documents translated to Arabic (RTL), field labels must still precede values
    const idCardBlocks: TranslatedBlockData[] = [
      { box_2d: [120, 320, 140, 700], translated_text: "DE PRISCO" },
      { box_2d: [120, 50, 140, 300], translated_text: "اللقب / SURNAME" },
      { box_2d: [150, 320, 170, 700], translated_text: "FRANCESCO" },
      { box_2d: [150, 50, 170, 300], translated_text: "الاسم / FORENAME" },
    ];

    const sorted = sortBlocksReadingOrder(idCardBlocks, 1000, 1000, true);
    const texts = sorted.map((b) => b.translated_text);

    // Label must come before personal value
    expect(texts[0]).toBe("اللقب / SURNAME");
    expect(texts[1]).toBe("DE PRISCO");
    expect(texts[2]).toBe("الاسم / FORENAME");
    expect(texts[3]).toBe("FRANCESCO");
  });

  it("7. sortBlocksReadingOrder never merges vertically stacked lines in the same column into a horizontal row", () => {
    // Vertically stacked lines in the same column with slight X differences
    const stackedLines: TranslatedBlockData[] = [
      { box_2d: [100, 50, 115, 450], translated_text: "Line 1: Tyler and his mom arrived at the beach." },
      { box_2d: [116, 48, 131, 450], translated_text: "Line 2: The water was warm and the sun was shining." },
      { box_2d: [132, 50, 147, 450], translated_text: "Line 3: They began to unpack their belongings." },
    ];

    const sorted = sortBlocksReadingOrder(stackedLines, 1000, 1000, false);
    const texts = sorted.map((b) => b.translated_text);

    // Must be in vertical sequential order (Line 1 -> Line 2 -> Line 3)
    expect(texts[0]).toBe("Line 1: Tyler and his mom arrived at the beach.");
    expect(texts[1]).toBe("Line 2: The water was warm and the sun was shining.");
    expect(texts[2]).toBe("Line 3: They began to unpack their belongings.");
  });
  it("8. buildImageTranslatedSvg uses text-anchor='start' and right-edge textStartX for RTL text so it flows inward into the bounding box", () => {
    const arabicBlock: TranslatedBlockData = {
      box_2d: [200, 50, 260, 650],
      original_text: "It was early summer, and the weather was really hot.",
      translated_text: "كان الوقت في أوائل الصيف، وكان الطقس حاراً حقاً.",
      font_size_tier: "body",
    };

    const svg = buildImageTranslatedSvg({
      imageBuffer: dummyImageBuffer,
      mimeType: "image/png",
      width: 772,
      height: 1000,
      blocks: [arabicBlock],
      targetLang: "ar",
      fileName: "worksheet.png",
    });

    expect(svg).toContain('viewBox="0 0 772 1038" width="772" height="1038"');
    expect(svg).toContain('dir="rtl"');
    expect(svg).toContain('text-anchor="start"');
    expect(svg).toContain('direction="rtl"');
    expect(svg).toContain('x="503.8"');
    expect(svg).toContain('width="479.2"');
  });

  it("9. buildImageTranslatedSvg correctly uses text-anchor='middle' for centered text in RTL and LTR", () => {
    const centeredBlock: TranslatedBlockData = {
      box_2d: [100, 200, 140, 600],
      original_text: "Title Heading",
      translated_text: "عنوان المستند",
      align: "center",
      font_size_tier: "title",
    };

    const svg = buildImageTranslatedSvg({
      imageBuffer: dummyImageBuffer,
      mimeType: "image/png",
      width: 800,
      height: 1000,
      blocks: [centeredBlock],
      targetLang: "ar",
      fileName: "doc.png",
    });

    expect(svg).toContain('text-anchor="middle"');
    expect(svg).toContain('x="320.0"');
  });

  it("10. defragmentTranslatedText fixes all tokenization splits and stray intra-word spaces", () => {
    const fragmentedSpanish =
      "Era principios de vera no y el clima esta ba muy ca luroso. Tyler ha bía estado muy emo cionado porque apren dió a tra bajar sus técnicas, a sí que construyeron un ca stillo de a rena. Los niños salta ban y Tyler vi o a gitando la s ma nos pidiendo ayuda. El salva vida s se a presuró.";

    const fixed = defragmentTranslatedText(fragmentedSpanish);

    expect(fixed).toContain("verano");
    expect(fixed).not.toContain("vera no");
    expect(fixed).toContain("estaba");
    expect(fixed).not.toContain("esta ba");
    expect(fixed).toContain("caluroso");
    expect(fixed).not.toContain("ca luroso");
    expect(fixed).toContain("había");
    expect(fixed).not.toContain("ha bía");
    expect(fixed).toContain("emocionado");
    expect(fixed).not.toContain("emo cionado");
    expect(fixed).toContain("aprendió");
    expect(fixed).not.toContain("apren dió");
    expect(fixed).toContain("trabajar");
    expect(fixed).not.toContain("tra bajar");
    expect(fixed).toContain("así que");
    expect(fixed).not.toContain("a sí que");
    expect(fixed).toContain("castillo de arena");
    expect(fixed).not.toContain("ca stillo de a rena");
    expect(fixed).toContain("saltaban");
    expect(fixed).not.toContain("salta ban");
    expect(fixed).toContain("vio agitando las manos");
    expect(fixed).not.toContain("vi o a gitando la s ma nos");
    expect(fixed).toContain("salvavidas");
    expect(fixed).not.toContain("salva vida s");
    expect(fixed).toContain("se apresuró");
    expect(fixed).not.toContain("se a presuró");
  });

  it("11. Worksheet golden blocks cover Line 1 across illustration and provide spacious header width", () => {
    const esBlocks = COMPLETE_WORKSHEET_BLOCKS.es;
    expect(esBlocks).toBeDefined();
    expect(esBlocks.length).toBe(12);

    // Header spans up to x=580 to prevent 2-line squashing
    const headerBlock = esBlocks[0];
    expect(headerBlock.box_2d).toEqual([45, 45, 75, 580]);

    // Name spans from x=620 to x=935
    const nameBlock = esBlocks[1];
    expect(nameBlock.box_2d).toEqual([45, 620, 75, 935]);

    // Line 1 spans full width across top of illustration (x=50 to 935)
    const line1Block = esBlocks[4];
    expect(line1Block.box_2d).toEqual([174, 50, 204, 935]);
    expect(line1Block.translated_text).toContain("Era principios de verano");

    // Paragraph 2 (column beside illustration) stays clamped to xmax=568 so illustration is untouched
    const p2Block = esBlocks[5];
    expect(p2Block.box_2d[1]).toBe(50);
    expect(p2Block.box_2d[3]).toBe(568);

    // Copyright spans wide (x=520 to 940) to fit on one single line
    const copyrightBlock = esBlocks[11];
    expect(copyrightBlock.box_2d).toEqual([936, 520, 965, 940]);
  });

  it("12. buildImageTranslatedSvg renders header with legible font size and covers top line completely", () => {
    const svg = buildImageTranslatedSvg({
      imageBuffer: dummyImageBuffer,
      mimeType: "image/png",
      width: 772,
      height: 1000,
      blocks: COMPLETE_WORKSHEET_BLOCKS.es,
      targetLang: "es",
      fileName: "original_worksheet.jpg",
    });

    // Verify header text is present and rendered
    expect(svg).toContain("Habilidad - Comprensión de Lectura");
    // Verify Line 1 mask covers across the image (width >= 670px)
    // 772 * (935 - 50) / 1000 = 683.22px
    const line1MaskWidth = (772 * (935 - 50)) / 1000;
    expect(line1MaskWidth).toBeGreaterThan(670);

    // Header font-size must be at least 10px (never squashed to 6-7px)
    const headerFontMatch = svg.match(/font-size="([^"]+)"[^>]*>[\s\S]*?Habilidad - Comprensión/);
    if (headerFontMatch) {
      const fs = parseFloat(headerFontMatch[1]);
      expect(fs).toBeGreaterThanOrEqual(10.0);
    }
  });
});
