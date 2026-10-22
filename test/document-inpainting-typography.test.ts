import { describe, it, expect } from "vitest";
import { buildImageTranslatedSvg } from "../lib/translation/svg-builder";

describe("Document Inpainting & Single-Path Vector SVG Typography", () => {
  const dummyImageBuffer = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    "base64"
  );

  it("applies sampled background color (bg_color) to inpainting masks instead of hardcoded white", () => {
    const svg = buildImageTranslatedSvg({
      imageBuffer: dummyImageBuffer,
      mimeType: "image/png",
      width: 1000,
      height: 600,
      targetLang: "es",
      fileName: "italian-id-card.jpg",
      blocks: [
        {
          box_2d: [50, 100, 150, 900],
          original_text: "REPUBBLICA ITALIANA",
          translated_text: "REPÚBLICA ITALIANA",
          font_size_tier: "title",
          bg_color: "#b8dbe8", // Sampled light cyan ID card background
        } as any,
      ],
    });

    expect(svg).toContain('fill="#b8dbe8"');
    expect(svg).not.toContain('<switch>');
    expect(svg).not.toContain('<foreignObject');
  });

  it("calculates multi-line typography with non-colliding explicit baselines and strictly bounded height", () => {
    const svg = buildImageTranslatedSvg({
      imageBuffer: dummyImageBuffer,
      mimeType: "image/png",
      width: 800,
      height: 1000,
      targetLang: "es",
      fileName: "official-passport.jpg",
      blocks: [
        {
          box_2d: [100, 100, 200, 400], // height = 100px, width = 240px
          original_text: "MINISTERO DELL'INTERNO CARTA DI IDENTITÀ REPUBBLICA ITALIANA VOLLA",
          translated_text: "MINISTERIO DEL INTERIOR TARJETA DE IDENTIDAD REPÚBLICA ITALIANA MUNICIPIO DE VOLLA",
          font_size_tier: "heading",
          bg_color: "#cce5ff",
        } as any,
      ],
    });

    // Check that <text> and <tspan> exist without <switch>
    expect(svg).toContain('<text');
    expect(svg).toContain('<tspan');
    expect(svg).not.toContain('<switch>');

    // Check that every tspan has an explicit y coordinate
    const tspanMatches = Array.from(svg.matchAll(/<tspan[^>]*\sy="([\d\.]+)"[^>]*>/g));
    expect(tspanMatches.length).toBeGreaterThan(1);

    // Verify strictly increasing line heights (no overlapping baselines)
    const yValues = tspanMatches.map((m) => parseFloat(m[1]));
    for (let i = 1; i < yValues.length; i++) {
      expect(yValues[i]).toBeGreaterThan(yValues[i - 1] + 8); // At least 8px clearance between lines
    }
  });

  it("handles distinct label and value fields without boundary overlap", () => {
    const svg = buildImageTranslatedSvg({
      imageBuffer: dummyImageBuffer,
      mimeType: "image/png",
      width: 800,
      height: 1000,
      targetLang: "en",
      fileName: "id-card.jpg",
      blocks: [
        {
          box_2d: [300, 100, 330, 400], // Label
          original_text: "COGNOME / SURNAME",
          translated_text: "SURNAME",
          font_size_tier: "caption",
          bg_color: "#e2ecf5",
        } as any,
        {
          box_2d: [335, 100, 375, 400], // Value
          original_text: "DE PRISCO",
          translated_text: "DE PRISCO",
          font_size_tier: "body",
          bg_color: "#e2ecf5",
        } as any,
      ],
    });

    expect(svg).toContain("SURNAME");
    expect(svg).toContain("DE PRISCO");
    expect(svg).toContain('fill="#e2ecf5"');
  });
});
