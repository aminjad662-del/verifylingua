import { describe, it, expect, vi } from "vitest";
import {
  TranslationAgent,
  sanitizeBlocksForLLM,
  buildSystemPrompt,
  parseAndValidateLLMResponse,
  TranslationOutputSchema,
} from "../lib/agents/05_translator";
import {
  QAAgent,
  assertParityAndIntegrity,
  extractDigits,
  LAZINESS_REGEX,
} from "../lib/agents/07_inspector";
import { TextBlock, TranslatedBlock } from "../types/agents";

describe("Strict Translation & QA Layer (Phase 1 & 2)", () => {
  const sampleBlocks: TextBlock[] = [
    {
      id: "block-1",
      box2d: [100, 150, 130, 450],
      originalText: "Official Employment Agreement No. 2026-894",
      fontSizeTier: "title",
      align: "center",
      pageNumber: 1,
    },
    {
      id: "block-2",
      box2d: [140, 150, 160, 450],
      originalText: "Monthly Compensation: $8,500.00 USD payable on the 1st of each month",
      fontSizeTier: "body",
      align: "left",
      pageNumber: 1,
    },
    {
      id: "block-3",
      box2d: [170, 150, 190, 450],
      originalText: "General Terms and Conditions for Notary Jurisdiction",
      fontSizeTier: "body",
      align: "left",
      pageNumber: 1,
    },
  ];

  describe("05_translator.ts Core Logic & Invariants", () => {
    it("1. Data Sanitization: strips ALL geometry and spatial data, exposing ONLY [{ id, text }]", () => {
      const sanitized = sanitizeBlocksForLLM(sampleBlocks);

      expect(sanitized).toHaveLength(3);
      for (const item of sanitized) {
        expect(Object.keys(item).sort()).toEqual(["id", "text"]);
        // Explicitly assert NO spatial or geometric properties leaked
        expect((item as any).box2d).toBeUndefined();
        expect((item as any).fontSizeTier).toBeUndefined();
        expect((item as any).align).toBeUndefined();
        expect((item as any).pageNumber).toBeUndefined();
      }

      expect(sanitized[0]).toEqual({
        id: "block-1",
        text: "Official Employment Agreement No. 2026-894",
      });
      expect(sanitized[1]).toEqual({
        id: "block-2",
        text: "Monthly Compensation: $8,500.00 USD payable on the 1st of each month",
      });
    });

    it("2. Strict JSON / Zod: defines schema and successfully parses compliant LLM output", () => {
      const validPayload = [
        { id: "block-1", translatedText: "Contrato oficial de trabajo n.º 2026-894" },
        { id: "block-2", translatedText: "Compensación mensual: $8,500.00 USD pagadera el día 1 de cada mes" },
        { id: "block-3", translatedText: "Términos y condiciones generales para jurisdicción notarial" },
      ];

      const validated = parseAndValidateLLMResponse(validPayload);
      expect(validated).toEqual(validPayload);

      // Also validates json string wrapped in markdown code fence
      const jsonString = `\`\`\`json\n${JSON.stringify(validPayload)}\n\`\`\``;
      const parsedFromString = parseAndValidateLLMResponse(jsonString);
      expect(parsedFromString).toEqual(validPayload);
    });

    it("2b. Strict JSON / Zod: rejects non-compliant LLM output with ZodError", () => {
      // Missing translatedText key
      const invalidKeys = [{ id: "block-1", text: "Some text" }];
      expect(() => parseAndValidateLLMResponse(invalidKeys)).toThrow();

      // Missing id key
      const missingId = [{ translatedText: "Some text" }];
      expect(() => parseAndValidateLLMResponse(missingId)).toThrow();

      // Not an array
      const notAnArray = { error: "I cannot translate this" };
      expect(() => parseAndValidateLLMResponse(notAnArray)).toThrow();
    });

    it("3. System Prompt: forces absolute translation and explicitly bans [...], summaries, and 'Same as above'", () => {
      const prompt = buildSystemPrompt("en", "es");

      // Mandates absolute translation
      expect(prompt).toContain("ABSOLUTE TRANSLATION");

      // Explicitly bans laziness patterns
      expect(prompt).toContain("[...]");
      expect(prompt).toContain("summaries");
      expect(prompt).toContain("Same as above");
      expect(prompt).toContain("continued");

      // Appends warning prompt when provided
      const promptWithWarning = buildSystemPrompt("en", "es", undefined, "PREVIOUS ATTEMPT MISSED DIGIT 2026");
      expect(promptWithWarning).toContain("⚠️ CRITICAL WARNING FROM PREVIOUS VALIDATION PASS");
      expect(promptWithWarning).toContain("PREVIOUS ATTEMPT MISSED DIGIT 2026");
    });

    it("4. TranslationAgent executes translation with sanitization and schema conformance", async () => {
      const agent = new TranslationAgent();
      const res = await agent.execute({
        blocks: sampleBlocks,
        protectedTokens: {},
        sourceLang: "en",
        targetLang: "es",
        engine: "gemini",
      });

      expect(res.success).toBe(true);
      expect(res.data?.translatedBlocks).toHaveLength(3);

      const translated = res.data!.translatedBlocks;
      // Retains spatial metadata on the output blocks
      expect(translated[0].box2d).toEqual(sampleBlocks[0].box2d);
      expect(translated[0].translatedText).toBeDefined();
      expect(translated[0].translatedText.length).toBeGreaterThan(5);
    });
  });

  describe("07_inspector.ts Assertion Engine", () => {
    it("1. Array Parity Check: throws Error if sourceBlocks.length !== translatedBlocks.length", () => {
      const incompleteTranslations: TranslatedBlock[] = [
        { ...sampleBlocks[0], translatedText: "Contrato oficial de trabajo n.º 2026-894" },
        { ...sampleBlocks[1], translatedText: "Compensación mensual: $8,500.00 USD pagadera el día 1 de cada mes" },
        // block-3 omitted
      ];

      expect(() => {
        assertParityAndIntegrity(sampleBlocks, incompleteTranslations);
      }).toThrow(/Array parity mismatch/i);
    });

    it("2. Hallucination/Laziness Regex: scans translatedText and throws Error on [...], same as above, continued", () => {
      // Case A: Ellipsis placeholder [...]
      const ellipsisBlocks: TranslatedBlock[] = [
        { ...sampleBlocks[0], translatedText: "Official Agreement [...]" },
        { ...sampleBlocks[1], translatedText: "Compensación mensual: $8,500.00 USD pagadera el 1 de cada mes" },
        { ...sampleBlocks[2], translatedText: "Términos generales" },
      ];
      expect(() => {
        assertParityAndIntegrity(sampleBlocks, ellipsisBlocks);
      }).toThrow(/AI laziness\/hallucination detected.*\[\.\.\.\]/i);

      // Case B: "Same as above"
      const sameAsAboveBlocks: TranslatedBlock[] = [
        { ...sampleBlocks[0], translatedText: "Contrato de trabajo 2026-894" },
        { ...sampleBlocks[1], translatedText: "same as above" },
        { ...sampleBlocks[2], translatedText: "Términos generales" },
      ];
      expect(() => {
        assertParityAndIntegrity(sampleBlocks, sameAsAboveBlocks);
      }).toThrow(/AI laziness\/hallucination detected.*same as above/i);

      // Case C: "Continued"
      const continuedBlocks: TranslatedBlock[] = [
        { ...sampleBlocks[0], translatedText: "Contrato de trabajo 2026-894" },
        { ...sampleBlocks[1], translatedText: "Compensación mensual: $8,500.00 USD pagadera el 1 de cada mes" },
        { ...sampleBlocks[2], translatedText: "Clause 3 continued" },
      ];
      expect(() => {
        assertParityAndIntegrity(sampleBlocks, continuedBlocks);
      }).toThrow(/AI laziness\/hallucination detected.*continued/i);
    });

    it("3. Numeric Integrity: extracts all digits and throws Error on numeric mismatch", () => {
      // Source has 2026-894 -> digits "0226894" (sorted: "0224689")
      // Translation accidentally changes 894 to 895
      const corruptedNumberBlocks: TranslatedBlock[] = [
        { ...sampleBlocks[0], translatedText: "Contrato oficial de trabajo n.º 2026-895" },
        { ...sampleBlocks[1], translatedText: "Compensación mensual: $8,500.00 USD pagadera el día 1 de cada mes" },
        { ...sampleBlocks[2], translatedText: "Términos generales" },
      ];

      expect(() => {
        assertParityAndIntegrity(sampleBlocks, corruptedNumberBlocks);
      }).toThrow(/Numeric integrity violation in block "block-1"/i);
    });

    it("3b. Numeric Integrity: accurately passes when numbers are reordered across language formats or Arabic-Indic numerals", () => {
      // Valid Spanish translation with exact digits
      const validSpanish: TranslatedBlock[] = [
        { ...sampleBlocks[0], translatedText: "Acuerdo oficial n.º 894-2026 de empleo" },
        { ...sampleBlocks[1], translatedText: "Compensación: 8 500,00 $ USD al día 1 de cada mes" },
        { ...sampleBlocks[2], translatedText: "Condiciones generales notariales" },
      ];

      expect(() => {
        assertParityAndIntegrity(sampleBlocks, validSpanish);
      }).not.toThrow();

      // Valid Arabic translation using Eastern Arabic-Indic numerals (٢٠٢٦-٨٩٤)
      const validArabicIndic: TranslatedBlock[] = [
        { ...sampleBlocks[0], translatedText: "اتفاقية عمل رسمية رقم ٢٠٢٦-٨٩٤" },
        { ...sampleBlocks[1], translatedText: "التعويض الشهري: ٨٥٠٠.٠٠ دولار مستحقة في اليوم ١ من كل شهر" },
        { ...sampleBlocks[2], translatedText: "الشروط العامة للاختصاص القضائي" },
      ];

      expect(() => {
        assertParityAndIntegrity(sampleBlocks, validArabicIndic);
      }).not.toThrow();
    });

    it("4. QAAgent execute method runs both strict assertions and geometric checks", async () => {
      const qa = new QAAgent();
      const validSpanish: TranslatedBlock[] = [
        { ...sampleBlocks[0], translatedText: "Acuerdo oficial n.º 2026-894 de empleo" },
        { ...sampleBlocks[1], translatedText: "Compensación: $8,500.00 USD al día 1 de cada mes" },
        { ...sampleBlocks[2], translatedText: "Condiciones generales notariales" },
      ];

      const res = await qa.execute({
        originalBuffer: Buffer.from("dummy"),
        renderedBuffer: Buffer.from("dummy"),
        translatedBlocks: validSpanish,
        sourceBlocks: sampleBlocks,
      });

      expect(res.success).toBe(true);
      expect(res.data?.passed).toBe(true);
      expect(res.data?.fidelityScore).toBeGreaterThanOrEqual(90);
    });
  });

  describe("Auto-Retry Mechanism (Translator + Inspector Simulation)", () => {
    it("retries up to maxRetries = 3 when Inspector throws, passing on subsequent attempt with warning", async () => {
      const agent = new TranslationAgent();
      const inspector = new QAAgent();

      let attemptsCount = 0;
      let capturedWarning = "";

      // Mock an LLM caller that fails on attempt 1 with laziness, fails on attempt 2 with wrong digits, and succeeds on attempt 3
      agent.setCustomLLMCaller(async (sanitized, systemPrompt) => {
        attemptsCount++;
        if (attemptsCount === 1) {
          // Attempt 1: Produces lazy [...]
          return [
            { id: "block-1", translatedText: "Agreement [...]" },
            { id: "block-2", translatedText: "Compensación $8,500.00" },
            { id: "block-3", translatedText: "Condiciones" },
          ];
        } else if (attemptsCount === 2) {
          // Attempt 2: Produces wrong number
          return [
            { id: "block-1", translatedText: "Acuerdo 2026-999" }, // 999 instead of 894
            { id: "block-2", translatedText: "Compensación $8,500.00 el día 1" },
            { id: "block-3", translatedText: "Condiciones" },
          ];
        } else {
          // Attempt 3: Fixed!
          capturedWarning = systemPrompt;
          return [
            { id: "block-1", translatedText: "Acuerdo 2026-894" },
            { id: "block-2", translatedText: "Compensación $8,500.00 el día 1" },
            { id: "block-3", translatedText: "Condiciones" },
          ];
        }
      });

      const maxRetries = 3;
      let translatedBlocks: TranslatedBlock[] = [];
      let warningPrompt: string | undefined = undefined;

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          const res = await agent.execute({
            blocks: sampleBlocks,
            protectedTokens: {},
            sourceLang: "en",
            targetLang: "es",
            engine: "gemini",
            warningPrompt,
          });

          if (!res.success || !res.data) {
            throw new Error(`Translator failed: ${res.error}`);
          }

          translatedBlocks = res.data.translatedBlocks;
          inspector.assertParityAndIntegrity(sampleBlocks, translatedBlocks);
          break; // Succeeded!
        } catch (err: any) {
          if (attempt === maxRetries) {
            throw err;
          }
          warningPrompt = `CRITICAL REJECTION FROM QA INSPECTOR (Attempt ${attempt}/${maxRetries}): ${err.message}`;
        }
      }

      expect(attemptsCount).toBe(3);
      expect(translatedBlocks).toHaveLength(3);
      expect(capturedWarning).toContain("CRITICAL REJECTION FROM QA INSPECTOR");
      expect(capturedWarning).toContain("Numeric integrity violation in block \"block-1\"");
    });

    it("throws fatal Error if all 3 attempts fail QA inspection", async () => {
      const agent = new TranslationAgent();
      const inspector = new QAAgent();

      let attemptsCount = 0;
      // Permanently lazy LLM
      agent.setCustomLLMCaller(async () => {
        attemptsCount++;
        return [
          { id: "block-1", translatedText: "Same as above" },
          { id: "block-2", translatedText: "Same as above" },
          { id: "block-3", translatedText: "Same as above" },
        ];
      });

      const maxRetries = 3;
      let finalError: Error | null = null;

      try {
        let warningPrompt: string | undefined = undefined;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
          try {
            const res = await agent.execute({
              blocks: sampleBlocks,
              protectedTokens: {},
              sourceLang: "en",
              targetLang: "es",
              engine: "gemini",
              warningPrompt,
            });
            if (!res.success || !res.data) throw new Error(res.error);
            inspector.assertParityAndIntegrity(sampleBlocks, res.data.translatedBlocks);
            break;
          } catch (err: any) {
            if (attempt === maxRetries) {
              throw new Error(`Translation QA rejected after ${maxRetries} attempts: ${err.message}`);
            }
            warningPrompt = `Warning: ${err.message}`;
          }
        }
      } catch (e: any) {
        finalError = e;
      }

      expect(attemptsCount).toBe(3);
      expect(finalError).not.toBeNull();
      expect(finalError?.message).toContain("Translation QA rejected after 3 attempts");
      expect(finalError?.message).toContain("AI laziness/hallucination detected");
    });
  });
});
