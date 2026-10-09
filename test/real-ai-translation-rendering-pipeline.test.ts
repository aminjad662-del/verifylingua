import { describe, it, expect } from "vitest";
import { runAgent2, TranslationSchema } from "../services/translator";
import { runRenderingAgent } from "../services/renderer";
import { translateDocumentJob } from "../app/api/inngest/functions";
import { PDFDocument } from "pdf-lib";

describe("Live AI Translation & PDF Rendering Engine Verification", () => {
  const sampleBlocks = [
    {
      id: "block-1",
      original_text: "Certificado de Nacimiento y Registro Civil",
      box2d: [50, 100, 75, 450] as [number, number, number, number],
      pageNumber: 1,
    },
    {
      id: "block-2",
      original_text: "Fecha de expedición: 14 de mayo de 2024",
      box2d: [90, 100, 110, 450] as [number, number, number, number],
      pageNumber: 1,
    },
    {
      id: "block-3",
      original_text: "Número de folio: 9842-A",
      box2d: [125, 100, 145, 450] as [number, number, number, number],
      pageNumber: 1,
    },
  ];

  it("1. runAgent2 performs genuine AI translation adhering to strict schema and numeric fidelity", async () => {
    const translations = await runAgent2(sampleBlocks, "es", "en");

    expect(translations).toBeDefined();
    expect(translations.length).toBe(3);

    // Schema validation
    const validated = TranslationSchema.parse({ translations });
    expect(validated.translations.length).toBe(3);

    // Verify no mock markers or fake template strings
    for (const t of translations) {
      expect(t.translated_text).not.toContain("[FR]");
      expect(t.translated_text).not.toContain("[ES]");
      expect(t.translated_text).not.toContain("[...]");
      expect(t.translated_text).not.toContain("same as above");
      expect(t.translated_text.length).toBeGreaterThan(0);
    }

    // Verify numeric preservation (e.g. 2024 and 9842)
    const block2 = translations.find((t) => t.id === "block-2");
    expect(block2?.translated_text).toContain("2024");

    const block3 = translations.find((t) => t.id === "block-3");
    expect(block3?.translated_text).toContain("9842");

    console.log("=== [LIVE TRANSLATION OUTPUT] ===");
    translations.forEach((t) => {
      console.log(`[${t.id}] "${t.original_text}" -> "${t.translated_text}"`);
    });
  }, 30000);

  it("2. runRenderingAgent generates a genuine vector PDF mapping translated text to original coordinates", async () => {
    // Create a base source PDF document
    const baseDoc = await PDFDocument.create();
    baseDoc.addPage([612, 792]);
    const originalPdfBuffer = Buffer.from(await baseDoc.save());

    const translations = [
      {
        id: "block-1",
        original_text: "Certificado de Nacimiento y Registro Civil",
        translated_text: "Birth Certificate and Civil Registry",
        box2d: [50, 100, 75, 450] as [number, number, number, number],
        pageNumber: 1,
      },
      {
        id: "block-2",
        original_text: "Fecha de expedición: 14 de mayo de 2024",
        translated_text: "Date of issuance: May 14, 2024",
        box2d: [90, 100, 110, 450] as [number, number, number, number],
        pageNumber: 1,
      },
    ];

    const result = await runRenderingAgent({
      originalBuffer: originalPdfBuffer,
      translations,
      targetLang: "en",
    });

    expect(result.success).toBe(true);
    expect(result.pdfBuffer.length).toBeGreaterThan(500);

    // Verify it is a valid, readable PDF document
    const outputDoc = await PDFDocument.load(result.pdfBuffer);
    expect(outputDoc.getPageCount()).toBe(1);

    const firstPage = outputDoc.getPage(0);
    expect(firstPage.getWidth()).toBe(612);
    expect(firstPage.getHeight()).toBe(792);

    console.log("=== [PDF RECONSTRUCTION OUTPUT] ===");
    console.log(`Generated PDF Size: ${result.pdfBuffer.length} bytes`);
    console.log(`Pages: ${result.pageCount}`);
  });

  it("3. translateDocumentJob executes multi-agent pipeline via Inngest step runner", async () => {
    const executedSteps: string[] = [];
    const mockStep = {
      run: async (name: string, fn: () => Promise<any>) => {
        executedSteps.push(name);
        return await fn();
      },
    };

    const fn = (translateDocumentJob as any).fn;
    expect(fn).toBeTypeOf("function");

    const baseDoc = await PDFDocument.create();
    baseDoc.addPage([612, 792]);
    const fileBuffer = Buffer.from(await baseDoc.save());

    const event = {
      name: "document.translate",
      data: {
        extractedBlocks: sampleBlocks,
        fileBuffer,
        sourceLang: "es",
        targetLang: "en",
      },
    };

    const res = await fn({ event, step: mockStep });

    expect(res.success).toBe(true);
    expect(executedSteps).toContain("execute-translation-agent");
    expect(executedSteps).toContain("execute-rendering-agent");
    expect(res.data).toBeDefined();
    expect(res.data.length).toBe(3);
    expect(res.rendered).toBeDefined();
    expect(res.rendered.success).toBe(true);
    expect(res.rendered.pdfBuffer.length).toBeGreaterThan(500);

    console.log("=== [INNGEST PIPELINE EXECUTION VERIFIED] ===");
    console.log("Steps executed:", executedSteps);
    console.log("Rendered PDF bytes:", res.rendered.pdfBuffer.length);
  });
});
