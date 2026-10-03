import { z } from "zod";
import { GoogleGenAI } from "@google/genai";

export const TranslationSchema = z.object({
  translations: z.array(
    z.object({
      id: z.string().describe("The exact ID of the text block from the OCR output"),
      original_text: z.string(),
      translated_text: z.string(),
      is_numeric_or_name: z.boolean().describe("True if it's a date, number, or proper noun that shouldn't be translated"),
    })
  ),
});

export async function runAgent2(extractedBlocks: any) {
  const apiKey = process.env.GEMINI_API_KEY || "";
  if (!apiKey) {
    return Array.isArray(extractedBlocks)
      ? extractedBlocks.map((b: any) => ({
          id: b.id || "b-1",
          original_text: b.text || b.original_text || "",
          translated_text: b.text || b.original_text || "",
          is_numeric_or_name: false,
        }))
      : [];
  }

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `SYSTEM DIRECTIVE: STRICT LEGAL TRANSLATOR
You are a deterministic translation engine. You do NOT chat, explain, or output markdown blocks. Output valid JSON adhering to:
{"translations": [{"id": "...", "original_text": "...", "translated_text": "...", "is_numeric_or_name": false}]}

TASK: Translate the provided array of text blocks from source to target language.
INPUT:
${JSON.stringify(extractedBlocks)}`,
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      temperature: 0.1,
    },
  });

  try {
    const parsed = JSON.parse(response.text || "{}");
    return parsed.translations || [];
  } catch {
    return [];
  }
}