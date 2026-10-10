import { z } from "zod";
import { getGeminiApiKey, getDeepLApiKey } from "../lib/services/env";

export const TranslationItemSchema = z.object({
  id: z.string().describe("The exact ID of the text block from the OCR output"),
  original_text: z.string(),
  translated_text: z.string(),
  is_numeric_or_name: z.boolean().describe("True if it's a date, number, or proper noun that shouldn't be translated"),
});

export const TranslationSchema = z.object({
  translations: z.array(TranslationItemSchema),
});

export type TranslationItem = z.infer<typeof TranslationItemSchema>;

/**
 * Translation Agent for Inngest pipeline (Agent 2).
 * Connects directly to live Google Gemini API and DeepL API with automatic retries
 * and exponential backoff for 429 rate limits.
 * Eliminates all mock templates, placeholders, and dummy data.
 */
export async function runAgent2(
  extractedBlocks: any,
  sourceLang: string = "es",
  targetLang: string = "en"
): Promise<TranslationItem[]> {
  if (!Array.isArray(extractedBlocks) || extractedBlocks.length === 0) {
    return [];
  }

  const items = extractedBlocks.map((b: any, idx: number) => {
    const rawText = b.text ?? b.original_text ?? b.originalText ?? "";
    const isNumOrName = /^[\d\s.,/:#№\-_–—()[\]{}+*]+$/.test(String(rawText).trim());
    return {
      id: String(b.id || `block-${idx + 1}`),
      original_text: String(rawText),
      is_numeric_or_name: isNumOrName,
    };
  });

  const geminiApiKey = getGeminiApiKey();
  const deeplApiKey = getDeepLApiKey();

  // 1. Primary engine: Gemini 3.5 Flash API
  if (geminiApiKey && geminiApiKey.length > 5) {
    const modelsToTry = ["gemini-3.5-flash", "gemini-3.5-flash-lite", "gemini-3.8-flash"];
    const systemPrompt = `SYSTEM DIRECTIVE: STRICT CERTIFIED LEGAL TRANSLATOR
You are a professional certified translator.
Translate the input text blocks from ${sourceLang.toUpperCase()} to ${targetLang.toUpperCase()}.
CRITICAL RULES:
1. Preserve every date, number, proper name, registration code, and ID exactly.
2. Return ONLY a valid JSON object matching the schema:
{"translations": [{"id": "...", "original_text": "...", "translated_text": "...", "is_numeric_or_name": false}]}
3. Never output markdown fences, commentary, or placeholders like "[...]".
4. Translate each item accurately without abbreviations or ellipses.`;

    const userPrompt = `Input text blocks:\n${JSON.stringify(items, null, 2)}`;
    let lastError: Error | null = null;

    for (const model of modelsToTry) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`;

      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: systemPrompt }] },
              contents: [{ role: "user", parts: [{ text: userPrompt }] }],
              generationConfig: {
                responseMimeType: "application/json",
                temperature: 0.1,
              },
            }),
            signal: AbortSignal.timeout(35000),
          });

          if (res.status === 429) {
            const delay = Math.pow(2, attempt) * 1000;
            await new Promise((resolve) => setTimeout(resolve, delay));
            continue;
          }

          if (!res.ok) {
            const errText = await res.text().catch(() => "");
            lastError = new Error(`Gemini API error (${res.status}): ${errText}`);
            break; // Try next model
          }

          const data = await res.json();
          const rawJson = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawJson) {
            let cleaned = rawJson.trim();
            if (cleaned.startsWith("```json")) {
              cleaned = cleaned.replace(/^```json\s*/i, "").replace(/\s*```$/, "");
            } else if (cleaned.startsWith("```")) {
              cleaned = cleaned.replace(/^```\s*/, "").replace(/\s*```$/, "");
            }

            let parsed: unknown;
            try {
              parsed = JSON.parse(cleaned);
            } catch (jsonErr: any) {
              const parseErr = new Error(`LLM output invalid JSON: ${jsonErr?.message}`);
              (parseErr as any).name = "SyntaxError";
              (parseErr as any).reasonCode = "llm_validation_failed";
              (parseErr as any).isValidationError = true;
              throw parseErr;
            }

            try {
              const validated = TranslationSchema.parse(parsed);
              return validated.translations;
            } catch (zodErr: any) {
              const valErr = new Error(`LLM output failed Zod schema validation: ${zodErr?.message}`);
              (valErr as any).name = "ZodError";
              (valErr as any).reasonCode = "llm_validation_failed";
              (valErr as any).isValidationError = true;
              throw valErr;
            }
          } else {
            const emptyErr = new Error("LLM output empty text or missing candidate content");
            (emptyErr as any).name = "ZodError";
            (emptyErr as any).reasonCode = "llm_validation_failed";
            (emptyErr as any).isValidationError = true;
            throw emptyErr;
          }
        } catch (fetchErr: any) {
          const errMsg = fetchErr?.message || String(fetchErr || "");
          const isTimeout =
            fetchErr?.name === "TimeoutError" ||
            fetchErr?.code === 23 || // DOMException.TIMEOUT_ERR
            /timeout|timed out/i.test(errMsg);

          if (isTimeout) {
            const timeoutErr = new Error("Gemini API call timed out after 35s");
            (timeoutErr as any).name = "TimeoutError";
            (timeoutErr as any).reasonCode = "llm_timeout";
            (timeoutErr as any).isTimeout = true;
            throw timeoutErr;
          }

          if (fetchErr?.isValidationError) {
            throw fetchErr;
          }

          lastError = fetchErr;
        }
      }
    }

    if (lastError) {
      throw lastError;
    }

    const exhaustedErr = new Error("Gemini translation failed across all candidate models");
    (exhaustedErr as any).reasonCode = "llm_validation_failed";
    (exhaustedErr as any).isValidationError = true;
    throw exhaustedErr;
  }

  // 2. Secondary fallback: DeepL Translation API if Gemini key is absent but DeepL key exists
  if (deeplApiKey && deeplApiKey.length > 5) {
    const isFree = deeplApiKey.endsWith(":fx");
    const endpoint = isFree
      ? "https://api-free.deepl.com/v2/translate"
      : "https://api.deepl.com/v2/translate";

    const targetMapped = targetLang.toUpperCase() === "EN" ? "EN-US" : targetLang.toUpperCase();
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `DeepL-Auth-Key ${deeplApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: items.map((i) => i.original_text),
        target_lang: targetMapped,
      }),
      signal: AbortSignal.timeout(35000),
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.translations) && data.translations.length === items.length) {
        return items.map((item, idx) => ({
          id: item.id,
          original_text: item.original_text,
          translated_text: data.translations[idx].text,
          is_numeric_or_name: item.is_numeric_or_name,
        }));
      }
    }
  }

  // 3. If neither key is provided, throw Missing Gemini API Key error strictly
  const missingErr = new Error("Missing Gemini API Key");
  (missingErr as any).reasonCode = "missing_gemini_api_key";
  throw missingErr;
}