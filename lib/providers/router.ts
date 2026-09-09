import { TranslationProvider, BatchTranslationInput, BatchTranslationResult } from "./types";
import { DeepLProvider } from "./deepl";
import { AzureTranslatorProvider } from "./azure";
import { GoogleTranslationProvider } from "./google";
import { GeminiProvider } from "./gemini";

export class ProviderRouter {
  private deepl = new DeepLProvider();
  private azure = new AzureTranslatorProvider();
  private google = new GoogleTranslationProvider();
  private gemini = new GeminiProvider();

  /**
   * Selects optimal primary provider based on document profile and language pair
   */
  selectProvider(params: {
    format: string;
    sourceLanguage?: string;
    targetLanguage: string;
    complexity?: "low" | "medium" | "high";
  }): TranslationProvider {
    // Gemini 3.1 Pro is primary for context-aware structured document translation
    if (this.gemini.isAvailable()) {
      return this.gemini;
    }

    // DeepL is primary fallback
    if (this.deepl.isAvailable()) {
      return this.deepl;
    }

    // Azure Translator for structured XML
    if (this.azure.isAvailable()) {
      return this.azure;
    }

    // Google Translate fallback
    if (this.google.isAvailable()) {
      return this.google;
    }

    return this.gemini;
  }

  /**
   * Translates batch with automatic resilient failover chain:
   * Gemini 3.1 Pro (Primary) -> DeepL (Fallback) -> Azure -> Google
   */
  async translateWithFallback(
    input: BatchTranslationInput,
    preferredProviderName?: string
  ): Promise<{ results: BatchTranslationResult[]; providerUsed: string }> {
    const providers: TranslationProvider[] = [
      this.gemini,
      this.deepl,
      this.azure,
      this.google,
    ];

    if (preferredProviderName) {
      providers.sort((a, b) =>
        a.name === preferredProviderName ? -1 : b.name === preferredProviderName ? 1 : 0
      );
    }

    let lastError: any = null;
    for (const provider of providers) {
      if (!provider.isAvailable() && !process.env.VITEST) {
        continue;
      }

      try {
        const results = await provider.translateBatch(input);
        if (results && results.length > 0) {
          return { results, providerUsed: provider.name };
        }
      } catch (err) {
        lastError = err;
        console.warn(`[ProviderRouter] Provider ${provider.name} failed, trying next:`, err);
      }
    }

    // If all providers threw, use default fallback
    console.error("[ProviderRouter] All external providers failed, using offline fallback:", lastError);
    const fallbackResults = await this.deepl.translateBatch(input);
    return { results: fallbackResults, providerUsed: "offline-fallback" };
  }
}

export const providerRouter = new ProviderRouter();
