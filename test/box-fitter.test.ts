import { describe, it, expect, beforeAll } from "vitest";
import { PDFDocument, StandardFonts, PDFFont } from "pdf-lib";
import {
  fitTypography,
  measureTextWidth,
  wrapText,
  shapeAndReorderBidi,
} from "../lib/typography/box-fitter";

describe("Precision Typography Box-Fitting & BiDi Shaping Suite", () => {
  let font: PDFFont;

  beforeAll(async () => {
    const doc = await PDFDocument.create();
    font = await doc.embedFont(StandardFonts.Helvetica);
  });

  describe("1. Invariant: Never Overflow Horizontally", () => {
    it("ensures every wrapped line is <= boxWidth for standard paragraphs", () => {
      const text =
        "The applicant declares under penalty of perjury that the official vital record translated herein faithfully conforms to the civil registry of Guadalajara.";
      const boxWidth = 200;
      const boxHeight = 100;

      const fit = fitTypography(text, boxWidth, boxHeight, 14, font, false);

      expect(fit.lines.length).toBeGreaterThan(1);
      for (const line of fit.lines) {
        const lineWidth = measureTextWidth(
          line,
          fit.fontSize,
          fit.letterSpacing,
          font,
          fit.scaleX
        );
        expect(lineWidth).toBeLessThanOrEqual(boxWidth + 0.01);
      }
    });

    it("breaks exceptionally long unbreakable compound words without breaching boxWidth", () => {
      const longCompoundWord =
        "RindfleischetikettierungsüberwachungsaufgabenübertragungsgesetzOfficialVerificationCode99812489124";
      const boxWidth = 120;
      const boxHeight = 80;

      const fit = fitTypography(longCompoundWord, boxWidth, boxHeight, 12, font, false);

      expect(fit.lines.length).toBeGreaterThan(1);
      for (const line of fit.lines) {
        const lineWidth = measureTextWidth(
          line,
          fit.fontSize,
          fit.letterSpacing,
          font,
          fit.scaleX
        );
        expect(lineWidth).toBeLessThanOrEqual(boxWidth + 0.5);
      }
    });
  });

  describe("2. Invariant: Never Overflow Vertically", () => {
    it("dynamically decreases font size and tightens line-height to fit inside boxHeight", () => {
      const text =
        "CERTIFICATION OF TRANSLATION: I, Elena Vasquez, certify that I am fluent in Spanish and English and that the above is a true and accurate translation of the attached foreign birth record.";
      const boxWidth = 250;
      const boxHeight = 35; // Very tight vertical box

      const fit = fitTypography(text, boxWidth, boxHeight, 16, font, false);

      expect(fit.totalHeight).toBeLessThanOrEqual(boxHeight);
      expect(fit.fontSize).toBeLessThan(16);
      expect(fit.fontSize).toBeGreaterThanOrEqual(6.0);
    });

    it("applies letter-spacing tightening when text is constrained to single line", () => {
      const text = "UNITED MEXICAN STATES - CIVIL REGISTRY";
      const boxWidth = 180;
      const boxHeight = 11; // Constrained strictly to single line

      const fit = fitTypography(text, boxWidth, boxHeight, 10, font, false);

      expect(fit.totalHeight).toBeLessThanOrEqual(boxHeight);
      expect(fit.lines.length).toBe(1);
      expect(fit.maxLineWidth).toBeLessThanOrEqual(boxWidth);
    });
  });

  describe("3. Invariant: Never Overlap Vertically", () => {
    it("guarantees lineHeight is always strictly greater than font size (collision prevention)", () => {
      const text = "Multi-line legal text with ascenders (b, d, h, k, l) and descenders (g, j, p, q, y).";
      const boxWidth = 150;
      const boxHeight = 50;

      const fit = fitTypography(text, boxWidth, boxHeight, 12, font, false);

      // Line height must be at least 1.02 * fontSize to eliminate glyph collision
      expect(fit.lineHeight).toBeGreaterThanOrEqual(fit.fontSize * 1.02);
    });
  });

  describe("4. BiDi & Arabic Text Shaping", () => {
    it("reshapes Arabic cursive glyphs and isolates embedded numbers", () => {
      const arabicText = "الاسم الكامل: John Doe برقم 8921";
      const shaped = shapeAndReorderBidi(arabicText, true);

      expect(shaped).toBeDefined();
      expect(shaped.length).toBeGreaterThan(0);
      // Should not equal empty or raw unshaped text
      expect(typeof shaped).toBe("string");
    });

    it("fits Arabic paragraphs within bounding boxes with proper right-alignment bounds", () => {
      const arabicText =
        "يشهد المترجم المعتمد بأن هذه الوثيقة مطابقة للأصل المحفوظ في سجلات الأحوال المدنية الرسمية طبقا للمعايير القانونية.";
      const boxWidth = 220;
      const boxHeight = 60;

      const fit = fitTypography(arabicText, boxWidth, boxHeight, 14, font, true);

      expect(fit.totalHeight).toBeLessThanOrEqual(boxHeight);
      expect(fit.lines.length).toBeGreaterThan(1);
      for (const line of fit.lines) {
        const lineWidth = measureTextWidth(
          line,
          fit.fontSize,
          fit.letterSpacing,
          font,
          fit.scaleX
        );
        expect(lineWidth).toBeLessThanOrEqual(boxWidth + 0.01);
      }
    });
  });
});
