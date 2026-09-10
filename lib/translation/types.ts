export type DocumentFormat = "pdf" | "docx" | "png" | "jpg";

export type JobStatus =
  | "queued"
  | "extracting"
  | "translating"
  | "rebuilding"
  | "reconstructing"
  | "ready"
  | "failed";

export interface SpatialTextBlock {
  id: string;
  text: string;
  translatedText?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
  fontSize: number;
  fontFamily?: string;
  color?: { r: number; g: number; b: number } | string;
  columnIndex?: number;
  isRtl?: boolean;
  confidence?: number;
  originalWidth?: number;
  renderedFontSize?: number;
}

export interface StructuredTranslationBlock {
  id: string;
  text: string;
  context?: string;
  isRtl?: boolean;
}

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
  /** True when spatial layout was fully reconstructed; false when fallback text-only PDF was used */
  layoutPreserved: boolean;
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
  /** Mirrors qualityGate.layoutPreserved — false signals the fallback text-only PDF was served */
  layoutPreserved?: boolean;
  serviceTier?: "automated" | "professional" | "certified";
}

export interface TranslationOptions {
  sourceLang: string;
  targetLang: string;
  serviceTier?: "automated" | "professional" | "certified";
  glossary?: Record<string, string>;
  register?: "certified_legal" | "academic" | "general";
  preservePlaceholders?: boolean;
}

