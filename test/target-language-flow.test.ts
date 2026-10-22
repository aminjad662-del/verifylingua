import { describe, it, expect } from "vitest";
import {
  getFallbackImageBlocks,
  sanitizeAndTranslateBlocks,
  buildImageTranslatedSvg,
  COMPLETE_WORKSHEET_BLOCKS,
  type TranslatedBlockData,
} from "../lib/translation/svg-builder";
import { translateText } from "../lib/translation/translator";

describe("Target Language Flow & Zero-Clobbering Verification", () => {
  const ALL_SUPPORTED_LANGS = [
    "en", "es", "fr", "de", "it", "pt", "nl", "pl", "ru", "ar", "ja", "zh"
  ];

  it("1. Provides complete worksheet blocks for all 12 supported languages", () => {
    for (const lang of ALL_SUPPORTED_LANGS) {
      const blocks = COMPLETE_WORKSHEET_BLOCKS[lang];
      expect(blocks, `Expected complete blocks for language: ${lang}`).toBeDefined();
      expect(blocks.length).toBeGreaterThanOrEqual(12);

      // Verify each block has non-empty translated_text
      for (const b of blocks) {
        expect(b.translated_text).toBeDefined();
        expect(b.translated_text!.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it("2. getFallbackImageBlocks strictly honors target language without defaulting to Spanish", () => {
    const itBlocks = getFallbackImageBlocks("it");
    expect(itBlocks[2].translated_text).toBe("Una Giornata in Spiaggia");
    expect(itBlocks[2].translated_text).not.toContain("Un Día en la Playa");

    const deBlocks = getFallbackImageBlocks("de");
    expect(deBlocks[2].translated_text).toBe("Ein Tag am Strand");
    expect(deBlocks[2].translated_text).not.toContain("Un Día en la Playa");

    const frBlocks = getFallbackImageBlocks("fr");
    expect(frBlocks[2].translated_text).toBe("Une Journée à la Plage");
    expect(frBlocks[2].translated_text).not.toContain("Un Día en la Playa");

    const ruBlocks = getFallbackImageBlocks("ru");
    expect(ruBlocks[2].translated_text).toBe("День на пляже");
    expect(ruBlocks[2].translated_text).not.toContain("Un Día en la Playa");

    const jaBlocks = getFallbackImageBlocks("ja");
    expect(jaBlocks[2].translated_text).toBe("ビーチでの一日");
    expect(jaBlocks[2].translated_text).not.toContain("Un Día en la Playa");

    const zhBlocks = getFallbackImageBlocks("zh");
    expect(zhBlocks[2].translated_text).toBe("海滩的一天");
    expect(zhBlocks[2].translated_text).not.toContain("Un Día en la Playa");

    const arBlocks = getFallbackImageBlocks("ar");
    expect(arBlocks[2].translated_text).toBe("يوم على الشاطئ");

    const ptBlocks = getFallbackImageBlocks("pt");
    expect(ptBlocks[2].translated_text).toBe("Um Dia na Praia");

    const nlBlocks = getFallbackImageBlocks("nl");
    expect(nlBlocks[2].translated_text).toBe("Een Dagje aan het Strand");

    const plBlocks = getFallbackImageBlocks("pl");
    expect(plBlocks[2].translated_text).toBe("Dzień na Plaży");
  });

  it("3. sanitizeAndTranslateBlocks NEVER clobbers authentic translations with fallbacks", () => {
    // Custom block translated into Italian by an AI model
    const aiBlocks: TranslatedBlockData[] = [
      {
        box_2d: [100, 100, 200, 800],
        original_text: "A Day at the Beach with Tyler and Gary",
        translated_text: "Una splendida giornata in spiaggia con Tyler e Gary",
      },
      {
        box_2d: [210, 100, 300, 800],
        original_text: "Story By: Judie Eberhardt",
        translated_text: "Racconto scritto da: Judie Eberhardt",
      },
    ];

    const sanitized = sanitizeAndTranslateBlocks(aiBlocks, "it");
    expect(sanitized.length).toBe(2);
    // Authentic AI translations must be preserved and NOT clobbered by golden fallback blocks
    expect(sanitized[0].translated_text).toBe("Una splendida giornata in spiaggia con Tyler e Gary");
    expect(sanitized[1].translated_text).toBe("Racconto scritto da: Judie Eberhardt");
  });

  it("4. buildImageTranslatedSvg renders target-language specific content and typography", () => {
    const dummyBuffer = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      "base64"
    );

    // Test Italian SVG
    const itBlocks = getFallbackImageBlocks("it");
    const itSvg = buildImageTranslatedSvg({
      imageBuffer: dummyBuffer,
      mimeType: "image/png",
      width: 772,
      height: 1000,
      blocks: itBlocks,
      targetLang: "it",
      fileName: "reading_worksheet_beach.jpg",
    });
    expect(itSvg).toContain("Una Giornata in Spiaggia");
    expect(itSvg).not.toContain("Un Día en la Playa");
    expect(itSvg).toContain("Abilità - Comprensione del Testo");

    // Test Russian SVG
    const ruBlocks = getFallbackImageBlocks("ru");
    const ruSvg = buildImageTranslatedSvg({
      imageBuffer: dummyBuffer,
      mimeType: "image/png",
      width: 772,
      height: 1000,
      blocks: ruBlocks,
      targetLang: "ru",
      fileName: "reading_worksheet_beach.jpg",
    });
    expect(ruSvg).toContain("День на пляже");
    expect(ruSvg).not.toContain("Un Día en la Playa");

    // Test Japanese SVG
    const jaBlocks = getFallbackImageBlocks("ja");
    const jaSvg = buildImageTranslatedSvg({
      imageBuffer: dummyBuffer,
      mimeType: "image/png",
      width: 772,
      height: 1000,
      blocks: jaBlocks,
      targetLang: "ja",
      fileName: "reading_worksheet_beach.jpg",
    });
    expect(jaSvg).toContain("ビーチでの一日");
    expect(jaSvg).not.toContain("Un Día en la Playa");

    // Test Arabic SVG (RTL directionality)
    const arBlocks = getFallbackImageBlocks("ar");
    const arSvg = buildImageTranslatedSvg({
      imageBuffer: dummyBuffer,
      mimeType: "image/png",
      width: 772,
      height: 1000,
      blocks: arBlocks,
      targetLang: "ar",
      fileName: "reading_worksheet_beach.jpg",
    });
    expect(arSvg).toContain("يوم على الشاطئ");
    expect(arSvg).toContain('dir="rtl"');
  });

  it("5. mockTranslateDeterministic translates legal & vital phrases accurately for all supported languages", async () => {
    const sourceText = "Civil Birth Registry of the Republic of Colombia - Birth Certificate - Full name";

    const itTrans = await translateText(sourceText, { sourceLang: "en", targetLang: "it" });
    expect(itTrans).toContain("Registro Civile di Nascita");
    expect(itTrans).toContain("Certificato di Nascita");
    expect(itTrans).toContain("Nome completo");

    const deTrans = await translateText(sourceText, { sourceLang: "en", targetLang: "de" });
    expect(deTrans).toContain("Geburtenregister");
    expect(deTrans).toContain("Geburtsurkunde");
    expect(deTrans).toContain("Vollständiger Name");

    const ptTrans = await translateText(sourceText, { sourceLang: "en", targetLang: "pt" });
    expect(ptTrans).toContain("Registro Civil de Nascimento");
    expect(ptTrans).toContain("Certidão de Nascimento");
    expect(ptTrans).toContain("Nome completo");

    const ruTrans = await translateText(sourceText, { sourceLang: "en", targetLang: "ru" });
    expect(ruTrans).toContain("Запись акта о рождении");
    expect(ruTrans).toContain("Свидетельство о рождении");
    expect(ruTrans).toContain("Полное имя");

    const arTrans = await translateText(sourceText, { sourceLang: "en", targetLang: "ar" });
    expect(arTrans).toContain("سجل المواليد المدني");
    expect(arTrans).toContain("شهادة ميلاد");
    expect(arTrans).toContain("الاسم الكامل");

    const zhTrans = await translateText(sourceText, { sourceLang: "en", targetLang: "zh" });
    expect(zhTrans).toContain("民事出生登记");
    expect(zhTrans).toContain("出生证明");
    expect(zhTrans).toContain("全名");
  });
});
