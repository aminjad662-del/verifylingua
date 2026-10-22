import { describe, it, expect } from "vitest";
import fs from "fs";
import vm from "vm";

describe("Layout Preservation & Character Encoding Engine", () => {
  it("preserves Spanish diacritics and accented characters in certified vector PDF without space corruption", () => {
    const workerContent = fs.readFileSync("dist/_worker.js", "utf8");
    const sandbox: any = {
      console,
      Uint8Array,
      atob: (b: string) => Buffer.from(b, "base64").toString("binary"),
      String,
      Math,
      Array,
      Object,
      JSON,
    };
    vm.createContext(sandbox);

    const buildPdfMatch = workerContent.match(/function buildAuthenticCertifiedPdf\(params\)[\s\S]*?\n  \}/);
    expect(buildPdfMatch).not.toBeNull();
    vm.runInContext(buildPdfMatch![0] + "\nthis.buildPdf = buildAuthenticCertifiedPdf;", sandbox);

    const pdfBytes = sandbox.buildPdf({
      title: "Test Translation Document",
      fileName: "Worksheet_1.jpg",
      sourceLang: "en",
      targetLang: "es",
      blocks: [
        { text: "Comprensión de lectura", isHeader: true },
        { text: "Un Día en la Playa", isHeader: true },
        { text: "Historia por: Judie Eberhardt" },
        { text: "Era principios de verano y el clima era realmente caluroso. La mamá de Tyler le había dicho que el sábado iría a la playa." },
        { text: "¿Qué empacó Tyler?" },
        { text: "¡Tengan cuidado!, gritó la madre de Tyler." },
      ],
    });

    const pdfStr = Buffer.from(pdfBytes).toString("binary");

    // Accented characters must use WinAnsi octal escape sequences
    expect(pdfStr).toContain("Comprensi\\363n");
    expect(pdfStr).toContain("D\\355a");
    expect(pdfStr).toContain("mam\\341");
    expect(pdfStr).toContain("s\\341bado");
    expect(pdfStr).toContain("\\277Qu\\351 empac\\363");
    expect(pdfStr).toContain("\\241Tengan cuidado!, grit\\363");

    // Must NOT contain corrupted spaces in place of accents
    expect(pdfStr).not.toContain("Comprensi n");
    expect(pdfStr).not.toContain("Un D a");
    expect(pdfStr).not.toContain("mam ");
    expect(pdfStr).not.toContain("s bado");
  });

  it("extracts real image dimensions and generates aligned SVG without aspect-ratio letterboxing shift", () => {
    const workerContent = fs.readFileSync("dist/_worker.js", "utf8");
    const sandbox: any = {
      console,
      Uint8Array,
      atob: (b: string) => Buffer.from(b, "base64").toString("binary"),
      btoa: (b: string) => Buffer.from(b, "binary").toString("base64"),
      String,
      Math,
      Array,
      Object,
      JSON,
    };
    vm.createContext(sandbox);

    const getDimsMatch = workerContent.match(/function getImageDimensions\(fileBase64, fileMime\)[\s\S]*?\n  \}/);
    const getFallbackMatch = workerContent.match(/function getEdgeFallbackBlocks\(targetLang\)[\s\S]*?\n  \}/);
    const sanitizeMatch = workerContent.match(/function sanitizeAndTranslateBlocks\(blocks, targetLang\)[\s\S]*?\n  \}/);
    const genSvgMatch = workerContent.match(/function generateTranslatedSvg\(job\)[\s\S]*?\n  \}/);
    expect(getDimsMatch).not.toBeNull();
    expect(genSvgMatch).not.toBeNull();

    vm.runInContext(
      getDimsMatch![0] + "\n" +
      (getFallbackMatch ? getFallbackMatch[0] + "\n" : "") +
      (sanitizeMatch ? sanitizeMatch[0] + "\n" : "") +
      genSvgMatch![0] + "\nthis.genSvg = generateTranslatedSvg;",
      sandbox
    );

    const sampleJpg = fs.readFileSync("public/images/docs/marriage-certificate.jpg");
    const b64 = sampleJpg.toString("base64");

    const svg: string = sandbox.genSvg({
      fileName: "marriage-certificate.jpg",
      fileBase64: b64,
      fileMime: "image/jpeg",
      targetLang: "es",
      blocks: [
        {
          box_2d: [100, 200, 160, 800],
          font_size_tier: "title",
          translated_text: "Un Día en la Playa",
        },
        {
          box_2d: [170, 200, 210, 600],
          font_size_tier: "heading",
          translated_text: "Historia por: Judie Eberhardt",
        },
        {
          box_2d: [230, 100, 350, 700],
          font_size_tier: "body",
          translated_text: "Era principios de verano y el clima era realmente caluroso. La mamá de Tyler le había dicho que en un día caluroso era divertido ir a la playa.",
        },
      ],
    });

    expect(svg).toContain('viewBox="0 0 1024 1062"');
    expect(svg).toContain('preserveAspectRatio="none"');
    expect(svg).toContain('fill="#ffffff"');
    expect(svg).toContain('height="100%"');
    expect(svg).toContain('y="1024"');
  });
});
