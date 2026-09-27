export interface AgentResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: Record<string, unknown>;
}

export interface GatekeeperInput {
  fileBuffer: Buffer;
  fileName: string;
  mimeType: string;
}

export interface GatekeeperOutput {
  sanitizedBuffer: Buffer;
  metadata: {
    pageCount: number;
    byteSize: number;
    isEncrypted: boolean;
    format: string;
  };
}

export interface ClassifierInput {
  sanitizedBuffer: Buffer;
}

export interface ClassifierOutput {
  classification: "digital" | "scanned";
  complexityScore: number;
  recommendedEngine: "deepl" | "gemini";
}

export interface ExtractorInput {
  sanitizedBuffer: Buffer;
  routingStrategy: "deepl" | "gemini";
}

export interface TextBlock {
  id: string;
  box2d: [number, number, number, number];
  originalText: string;
  fontSizeTier: "title" | "heading" | "body" | "caption";
  align: "left" | "center" | "right";
  pageNumber: number;
}

export interface ExtractorOutput {
  blocks: TextBlock[];
}

export interface GlossaryInput {
  blocks: TextBlock[];
  sourceLang: string;
  targetLang: string;
}

export interface GlossaryOutput {
  protectedTokens: Record<string, string>;
  definitions: Record<string, string>;
}

export interface TranslatorInput {
  blocks: TextBlock[];
  protectedTokens: Record<string, string>;
  sourceLang: string;
  targetLang: string;
  engine: "deepl" | "gemini";
}

export interface TranslatedBlock extends TextBlock {
  translatedText: string;
}

export interface TranslatorOutput {
  translatedBlocks: TranslatedBlock[];
}

export interface RendererInput {
  originalBuffer: Buffer;
  translatedBlocks: TranslatedBlock[];
  targetLang: string;
}

export interface RendererOutput {
  renderedBuffer: Buffer;
  format: string;
}

export interface InspectorInput {
  originalBuffer: Buffer;
  renderedBuffer: Buffer;
  translatedBlocks: TranslatedBlock[];
}

export interface InspectorOutput {
  passed: boolean;
  warnings: string[];
  fidelityScore: number;
}
