import { AgentResult, TranslatorInput, TranslatorOutput, TranslatedBlock } from "../../types/agents";
import { GeminiProvider } from "../providers/gemini";
import { DeepLProvider } from "../providers/deepl";

export class TranslationAgent {
  public async execute(input: TranslatorInput): Promise<AgentResult<TranslatorOutput>> {
    try {
      const { blocks, engine, protectedTokens, sourceLang, targetLang } = input;

      const provider = engine === "gemini" ? new GeminiProvider() : new DeepLProvider();

      const batchInput = {
        items: blocks.map(b => ({
          id: b.id,
          text: b.originalText,
          context: `FontSize: ${b.fontSizeTier}, Alignment: ${b.align}`
        })),
        sourceLanguage: sourceLang,
        targetLanguage: targetLang,
        glossary: protectedTokens,
        preservePlaceholders: true
      };

      const results = await provider.translateBatch(batchInput);
      const resultMap = new Map(results.map(r => [r.id, r.text]));

      const translatedBlocks: TranslatedBlock[] = blocks.map(b => ({
        ...b,
        translatedText: resultMap.get(b.id) || b.originalText
      }));

      return {
        success: true,
        data: {
          translatedBlocks
        }
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Translation execution failed"
      };
    }
  }
}
