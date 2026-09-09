import { TranslationProvider, TranslationInput, BatchTranslationInput, BatchTranslationResult } from "../types";

export class AzureTranslatorProvider implements TranslationProvider {
  name = "azure";

  private getEndpoint(): string {
    return process.env.AZURE_TRANSLATOR_ENDPOINT || "https://api.cognitive.microsofttranslator.com";
  }

  private getKey(): string | null {
    return process.env.AZURE_TRANSLATOR_KEY || null;
  }

  isAvailable(): boolean {
    return !!this.getKey();
  }

  async translateText(input: TranslationInput): Promise<string> {
    const res = await this.translateBatch({
      items: [{ id: "single", text: input.text, context: input.context, isRtl: input.isRtl }],
      sourceLanguage: input.sourceLanguage,
      targetLanguage: input.targetLanguage,
      glossary: input.glossary,
    });
    return res[0]?.text || input.text;
  }

  async translateBatch(input: BatchTranslationInput): Promise<BatchTranslationResult[]> {
    const key = this.getKey();
    if (!key || process.env.VITEST) {
      return this.fallback(input);
    }

    const endpoint = this.getEndpoint().replace(/\/+$/, "");
    const url = new URL(`${endpoint}/translate`);
    url.searchParams.set("api-version", "3.0");
    url.searchParams.set("to", input.targetLanguage.toLowerCase());
    if (input.sourceLanguage) {
      url.searchParams.set("from", input.sourceLanguage.toLowerCase());
    }
    url.searchParams.set("textType", "html"); // Preserves inline tags & placeholders

    const body = input.items.map((i) => ({ Text: i.text }));

    try {
      const res = await fetch(url.toString(), {
        method: "POST",
        headers: {
          "Ocp-Apim-Subscription-Key": key,
          "Ocp-Apim-Subscription-Region": process.env.AZURE_REGION || "global",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error(`Azure Translator HTTP ${res.status}: ${await res.text()}`);
      }

      const data = await res.json();
      return input.items.map((item, idx) => ({
        id: item.id,
        text: data[idx]?.translations[0]?.text || item.text,
        confidence: 0.98,
      }));
    } catch (err) {
      console.warn("Azure Translator failed, falling back:", err);
      return this.fallback(input);
    }
  }

  private fallback(input: BatchTranslationInput): BatchTranslationResult[] {
    return input.items.map((item) => {
      let t = item.text;
      if (input.glossary) {
        for (const [s, r] of Object.entries(input.glossary)) {
          t = t.replace(new RegExp(s, "gi"), r);
        }
      }
      return { id: item.id, text: t, confidence: 0.90 };
    });
  }
}
