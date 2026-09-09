export interface TranslationInput {
  text: string;
  sourceLanguage?: string;
  targetLanguage: string;
  glossary?: Record<string, string>;
  context?: string;
  isRtl?: boolean;
  preservePlaceholders?: boolean;
}

export interface BatchTranslationInput {
  items: { id: string; text: string; context?: string; isRtl?: boolean }[];
  sourceLanguage?: string;
  targetLanguage: string;
  glossary?: Record<string, string>;
  preservePlaceholders?: boolean;
}

export interface BatchTranslationResult {
  id: string;
  text: string;
  confidence?: number;
}

export interface ProviderStatus {
  status: "queued" | "running" | "succeeded" | "failed";
  progress?: number;
  error?: string;
}

export interface TranslationProvider {
  name: string;
  isAvailable(): boolean;
  translateText(input: TranslationInput): Promise<string>;
  translateBatch(input: BatchTranslationInput): Promise<BatchTranslationResult[]>;
  translateDocument?(input: {
    buffer: Buffer;
    filename: string;
    sourceLang?: string;
    targetLang: string;
  }): Promise<Buffer>;
}
