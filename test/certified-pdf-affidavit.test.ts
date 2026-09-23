import { describe, it, expect } from "vitest";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { translatePdf } from "../lib/translation/pdf";

describe("Certified PDF Translation & Affidavit Generation", () => {
  it("translates spatial text blocks and appends 8 CFR 103.2 certification affidavit page", async () => {
    // 1. Create a synthetic test PDF
    const srcDoc = await PDFDocument.create();
    const page = srcDoc.addPage([612, 792]);
    const font = await srcDoc.embedFont(StandardFonts.Helvetica);
    page.drawText(
      "ACTA DE NACIMIENTO: En la ciudad de Madrid ante el notario comparece Alejandro Martinez Rivera.",
      { x: 50, y: 700, size: 11, font }
    );
    const srcBytes = await srcDoc.save();

    // 2. Translate with certified tier
    const result = await translatePdf(Buffer.from(srcBytes), {
      sourceLang: "es",
      targetLang: "en",
      serviceTier: "certified",
      fileName: "Acta_Nacimiento_Test.pdf",
    });

    // 3. Assertions
    expect(result.buffer).toBeInstanceOf(Buffer);
    expect(result.buffer.length).toBeGreaterThan(1000);
    // 1 source page + 1 appended certification affidavit page = 2 pages
    expect(result.metadata.pageCount).toBe(2);
    expect(result.metadata.hasCertStamp).toBe(true);

    // 4. Load the generated PDF to inspect pages
    const outDoc = await PDFDocument.load(result.buffer);
    expect(outDoc.getPageCount()).toBe(2);

    // Page 2 is the certification affidavit
    const certPage = outDoc.getPage(1);
    const { width, height } = certPage.getSize();
    expect(width).toBe(612);
    expect(height).toBe(792);
  });
});
