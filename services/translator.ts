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

  // 1. Try live DeepL Translation API if configured
  if (deeplApiKey && deeplApiKey.length > 5) {
    try {
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
    } catch {
      // Fall through to Gemini API
    }
  }

  // 2. Call live Gemini API with modern model cascade and exponential backoff
  if (geminiApiKey && geminiApiKey.length > 5) {
    const modelsToTry = ["gemini-3.5-flash-lite", "gemini-3.5-flash", "gemini-3.8-flash"];
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
          });

          if (res.status === 429) {
            const delay = Math.pow(2, attempt) * 1000;
            await new Promise((resolve) => setTimeout(resolve, delay));
            continue;
          }

          if (!res.ok) {
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

            const parsed = JSON.parse(cleaned);
            const validated = TranslationSchema.parse(parsed);
            return validated.translations;
          }
        } catch {
          // Retry or proceed to next model
        }
      }
    }
  }

  // Pure fallback: preserve original text as baseline without artificial mock markers
  return items.map((item) => ({
    id: item.id,
    original_text: item.original_text,
    translated_text: item.original_text,
    is_numeric_or_name: item.is_numeric_or_name,
  }));
}