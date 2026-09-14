import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { MVP_SUPPORTED_LANGUAGES, MVP_LANGUAGE_CODES } from "../lib/constants";
import { validateMvpLanguagePair, detectNonLatinScriptRatio } from "../lib/preflight";
import { POST as preflightHandler } from "../app/api/translate/preflight/route";

describe("Core 4 LTR Matrix Constants", () => {
  it("exports MVP_SUPPORTED_LANGUAGES with exact 4 Core languages", () => {
    expect(MVP_SUPPORTED_LANGUAGES).toHaveLength(4);
    const codes = MVP_SUPPORTED_LANGUAGES.map((l) => l.code);
    expect(codes).toEqual(["en", "es", "fr", "de"]);
    for (const lang of MVP_SUPPORTED_LANGUAGES) {
      expect(lang.dir).toBe("ltr");
    }
  });

  it("exports MVP_LANGUAGE_CODES as ['en', 'es', 'fr', 'de']", () => {
    expect(MVP_LANGUAGE_CODES).toEqual(["en", "es", "fr", "de"]);
  });
});

describe("Core 4 LTR Language Pair Validation (validateMvpLanguagePair)", () => {
  it("approves all 6 bi-directional pairs between EN, ES, FR, and DE (12 valid combinations)", () => {
    const validPairs = [
      ["en", "es"], ["es", "en"],
      ["en", "fr"], ["fr", "en"],
      ["en", "de"], ["de", "en"],
      ["es", "fr"], ["fr", "es"],
      ["es", "de"], ["de", "es"],
      ["fr", "de"], ["de", "fr"],
    ];

    expect(validPairs).toHaveLength(12);

    for (const [source, target] of validPairs) {
      const result = validateMvpLanguagePair(source, target);
      expect(result.valid).toBe(true);
      expect(result.reason).toBeUndefined();
    }
  });

  it("approves valid pairs regardless of case (e.g. EN -> es, Es -> DE)", () => {
    expect(validateMvpLanguagePair("EN", "es").valid).toBe(true);
    expect(validateMvpLanguagePair("Es", "DE").valid).toBe(true);
    expect(validateMvpLanguagePair("fr", "EN").valid).toBe(true);
  });

  it("rejects identical source and target language", () => {
    const identicalPairs = [
      ["en", "en"],
      ["es", "es"],
      ["fr", "fr"],
      ["de", "de"],
      ["EN", "en"],
      ["DE", "de"],
    ];

    for (const [source, target] of identicalPairs) {
      const result = validateMvpLanguagePair(source, target);
      expect(result.valid).toBe(false);
      expect(result.reason).toBe(
        "IDENTICAL_LANGUAGES: Source and target languages cannot be the same."
      );
    }
  });

  it("rejects unsupported languages (e.g. ar, zh, ru, he, ja, pt, it)", () => {
    const unsupportedTests = [
      { source: "ar", target: "en" },
      { source: "en", target: "zh" },
      { source: "ru", target: "de" },
      { source: "fr", target: "he" },
      { source: "ja", target: "es" },
      { source: "pt", target: "en" },
      { source: "it", target: "fr" },
      { source: "ar", target: "ar" },
    ];

    for (const { source, target } of unsupportedTests) {
      const result = validateMvpLanguagePair(source, target);
      expect(result.valid).toBe(false);
      expect(result.reason).toBe(
        "UNSUPPORTED_LANGUAGE: Only English, Spanish, French, and German are supported in MVP."
      );
    }
  });
});

describe("Deep Script Detection Ratio (detectNonLatinScriptRatio)", () => {
  it("returns 0 for pure Latin text including Spanish, French, German diacritics", () => {
    const english = "This is a standard employment contract in English with numbers 12345 and symbols !@#$%.";
    expect(detectNonLatinScriptRatio(english)).toBe(0);

    const spanish = "Certificado oficial de nacimiento expedido en la República de España con año 1990.";
    expect(detectNonLatinScriptRatio(spanish)).toBe(0);

    const french = "Extrait d'acte de naissance délivré par l'officier de l'état civil en France.";
    expect(detectNonLatinScriptRatio(french)).toBe(0);

    const german = "Amtliche Beglaubigung der Geburtsurkunde vom Standesamt Berlin Mitte.";
    expect(detectNonLatinScriptRatio(german)).toBe(0);
  });

  it("returns > 0.8 for Arabic text", () => {
    const arabic = "هذا عقد عمل رسمي تم توقيعه في القاهرة بين الطرفين";
    expect(detectNonLatinScriptRatio(arabic)).toBeGreaterThan(0.8);
  });

  it("returns > 0.8 for Hebrew text", () => {
    const hebrew = "תעודת לידה רשמית שהונפקה בירושלים על ידי משרד הפנים";
    expect(detectNonLatinScriptRatio(hebrew)).toBeGreaterThan(0.8);
  });

  it("returns > 0.8 for Cyrillic text", () => {
    const cyrillic = "Официальное свидетельство о рождении выдано в городе Москва";
    expect(detectNonLatinScriptRatio(cyrillic)).toBeGreaterThan(0.8);
  });

  it("returns > 0.8 for CJK text", () => {
    const chinese = "这是一份在北京签发的中英文出生医学证明文件。";
    expect(detectNonLatinScriptRatio(chinese)).toBeGreaterThan(0.8);
  });

  it("returns 0 for text with no letters (digits, whitespace, punctuation only)", () => {
    expect(detectNonLatinScriptRatio("")).toBe(0);
    expect(detectNonLatinScriptRatio("   \n\t  ")).toBe(0);
    expect(detectNonLatinScriptRatio("1234567890 !@#$%^&*()_+=-{}[]:;\"'<>,.?/")).toBe(0);
  });

  it("correctly calculates mixed Latin and non-Latin ratio", () => {
    // 5 Latin letters (Hello), 5 Arabic letters (مرحبا)
    const mixed = "Hello مرحبا";
    const ratio = detectNonLatinScriptRatio(mixed);
    expect(ratio).toBeCloseTo(0.5, 1);
  });
});

describe("Preflight API Guardrails (POST /api/translate/preflight)", () => {
  it("returns 422 with waitlistAffordance: true on unsupported language pair", async () => {
    const req = new NextRequest("http://localhost:3000/api/translate/preflight", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sourceLang: "ar",
        targetLang: "en",
      }),
    });

    const res = await preflightHandler(req);
    expect(res.status).toBe(422);

    const body = await res.json();
    expect(body.supported).toBe(false);
    expect(body.code).toBe("UNSUPPORTED_LANGUAGE");
    expect(body.message).toBe(
      "VerifyLingua MVP currently guarantees 100% layout preservation for English, Spanish, French, and German. Right-to-Left (RTL) and Asian scripts are launching in v1.1."
    );
    expect(body.waitlistAffordance).toBe(true);
  });

  it("returns 422 with waitlistAffordance: true on deep non-Latin script detection (ratio > 0.10)", async () => {
    const req = new NextRequest("http://localhost:3000/api/translate/preflight", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sourceLang: "en",
        targetLang: "es",
        sampleText: "هذا عقد عمل رسمي تم توقيعه في القاهرة",
      }),
    });

    const res = await preflightHandler(req);
    expect(res.status).toBe(422);

    const body = await res.json();
    expect(body.supported).toBe(false);
    expect(body.code).toBe("UNSUPPORTED_SCRIPT_DETECTED");
    expect(body.message).toBe(
      "Document contains non-Latin or RTL script (Arabic, Hebrew, Cyrillic, or Asian characters). VerifyLingua MVP currently supports Latin-script LTR documents (English, Spanish, French, German). RTL and Asian scripts are launching in v1.1."
    );
    expect(body.waitlistAffordance).toBe(true);
  });

  it("returns 400 with DOC_TOO_LARGE when pageCount > 100", async () => {
    const req = new NextRequest("http://localhost:3000/api/translate/preflight", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sourceLang: "en",
        targetLang: "es",
        pageCount: 105,
      }),
    });

    const res = await preflightHandler(req);
    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body.code).toBe("DOC_TOO_LARGE");
    expect(body.message).toBe(
      "Single document pilot limit is 100 pages. Please split your document or contact support."
    );
  });

  it("returns 200 and analysis for a valid 1-page PDF within MVP language matrix", async () => {
    const { PDFDocument } = await import("pdf-lib");
    const pdfDoc = await PDFDocument.create();
    pdfDoc.addPage([200, 200]);
    const pdfBytes = await pdfDoc.save();
    const base64 = Buffer.from(pdfBytes).toString("base64");

    const req = new NextRequest("http://localhost:3000/api/translate/preflight", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileName: "birth-certificate.pdf",
        fileBase64: base64,
        sourceLang: "es",
        targetLang: "en",
      }),
    });

    const res = await preflightHandler(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.analysis).toBeDefined();
    expect(body.analysis.pageCount).toBe(1);
    expect(body.analysis.mvpLanguageCheck?.supported).toBe(true);
  });

  it("returns 400 DOC_TOO_LARGE for a PDF whose parsed page count exceeds 100", async () => {
    const { PDFDocument } = await import("pdf-lib");
    const pdfDoc = await PDFDocument.create();
    for (let i = 0; i < 105; i++) {
      pdfDoc.addPage([100, 100]);
    }
    const pdfBytes = await pdfDoc.save();
    const base64 = Buffer.from(pdfBytes).toString("base64");

    const req = new NextRequest("http://localhost:3000/api/translate/preflight", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileName: "large-document.pdf",
        fileBase64: base64,
      }),
    });

    const res = await preflightHandler(req);
    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body.code).toBe("DOC_TOO_LARGE");
    expect(body.message).toContain("100 pages");
  });

  it("returns 422 when uploaded file is paired with an unsupported target language", async () => {
    const { PDFDocument } = await import("pdf-lib");
    const pdfDoc = await PDFDocument.create();
    pdfDoc.addPage([200, 200]);
    const pdfBytes = await pdfDoc.save();
    const base64 = Buffer.from(pdfBytes).toString("base64");

    const req = new NextRequest("http://localhost:3000/api/translate/preflight", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileName: "document.pdf",
        fileBase64: base64,
        sourceLang: "en",
        targetLang: "ar",
      }),
    });

    const res = await preflightHandler(req);
    expect(res.status).toBe(422);

    const body = await res.json();
    expect(body.supported).toBe(false);
    expect(body.code).toBe("UNSUPPORTED_LANGUAGE");
    expect(body.waitlistAffordance).toBe(true);
  });
});
