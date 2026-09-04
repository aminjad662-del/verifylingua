export type DocumentFormat = "pdf" | "docx" | "png" | "jpg";

export type JobStatus =
  | "queued"
  | "extracting"
  | "translating"
  | "rebuilding"
  | "ready"
  | "failed";

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  page?: number;
}

export interface TextRunStyle {
  fontFamily?: string;
  fontSize?: number;
  isBold?: boolean;
  isItalic?: boolean;
  isUnderline?: boolean;
  color?: string;
  alignment?: "left" | "center" | "right" | "justify";
}

export interface ExtractedSegment {
  id: string;
  originalText: string;
  translatedText?: string;
  boundingBox?: BoundingBox;
  style?: TextRunStyle;
  path?: string; // XML path or node identifier
}

export interface TranslationQualityGate {
  isValidFormat: boolean;
  pageCountMatches: boolean;
  elementCountMatches: boolean;
  checksumMatches: boolean;
  byteSize: number;
  verifiedAt: string;
  notes: string[];
}

export interface TranslationJob {
  id: string;
  fileName: string;
  fileFormat: DocumentFormat;
  fileSize: number;
  sourceLang: string;
  targetLang: string;
  status: JobStatus;
  progress: number;
  currentStep: string;
  createdAt: string;
  completedAt?: string;
  originalBuffer: Buffer;
  translatedBuffer?: Buffer;
  downloadToken: string;
  tokenExpiresAt: string;
  qualityGate?: TranslationQualityGate;
  error?: string;
}

export interface TranslationOptions {
  sourceLang: string;
  targetLang: string;
  glossary?: Record<string, string>;
  register?: "certified_legal" | "academic" | "general";
  preservePlaceholders?: boolean;
}
