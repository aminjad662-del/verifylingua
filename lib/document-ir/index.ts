/**
 * VerifyLingua Document Intermediate Representation (IR) Engine
 *
 * Enterprise-grade structural intermediate representation that prevents raw text
 * translation from decoupling from document geometry, reading order, typography,
 * and visual hierarchy.
 */

export type IRElementType =
  | "text"
  | "table"
  | "row"
  | "column"
  | "header"
  | "footer"
  | "image"
  | "shape"
  | "list"
  | "section_break"
  | "stamp"
  | "signature";

export type IRLanguageDirection = "ltr" | "rtl";

export type IRReviewStatus =
  | "unreviewed"
  | "in_review"
  | "approved"
  | "rejected"
  | "flagged";

export interface IRCoordinates {
  x: number;
  y: number;
  width: number;
  height: number;
  bbox: [number, number, number, number]; // [minX, minY, maxX, maxY]
}

export interface IRFontInfo {
  fontFamily?: string;
  fontSize: number;
  fontStyle?: "normal" | "italic" | "oblique";
  fontWeight?: "normal" | "bold" | "semibold" | number;
}

export interface IRStyleInfo {
  color?: string;
  backgroundColor?: string;
  alignment?: "left" | "center" | "right" | "justify";
  lineSpacing?: number;
}

export interface IRTableData {
  tableId: string;
  rowCount: number;
  colCount: number;
  rowIndex?: number;
  colIndex?: number;
  rowSpan?: number;
  colSpan?: number;
  hasBorders?: boolean;
}

export interface IRElement {
  elementId: string;
  pageId: string;
  documentId: string;
  elementType: IRElementType;
  sourceText: string;
  targetText?: string;
  coordinates: IRCoordinates;
  readingOrder: number;
  fontInfo: IRFontInfo;
  styleInfo: IRStyleInfo;
  tableData?: IRTableData;
  languageDirection: IRLanguageDirection;
  ocrConfidence: number; // 0 - 100
  translationConfidence: number; // 0 - 100
  reviewStatus: IRReviewStatus;
  sourceToOutputMapping?: {
    sourceElementId: string;
    targetElementId: string;
    transformType: "1:1" | "split" | "merge" | "preserved";
  };
}

export interface IRPage {
  pageId: string;
  pageNumber: number;
  documentId: string;
  dimensions: {
    width: number;
    height: number;
    dpi?: number;
  };
  languageDirection: IRLanguageDirection;
  elements: IRElement[];
  header?: IRElement;
  footer?: IRElement;
}

export interface DocumentIR {
  documentId: string;
  format: "pdf" | "docx" | "png" | "jpg";
  sourceLanguage: string;
  targetLanguage?: string;
  createdAt: string;
  updatedAt: string;
  pageCount: number;
  pages: IRPage[];
  metadata: {
    title?: string;
    producer?: string;
    hasOcrContent: boolean;
    averageOcrConfidence: number;
    hasTables: boolean;
    hasSignaturesOrStamps: boolean;
    totalWordCount: number;
  };
}

/**
 * Validates that an IR document adheres strictly to structural schema requirements
 */
export function validateDocumentIR(ir: DocumentIR): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!ir.documentId || ir.documentId.trim() === "") {
    errors.push("Missing documentId.");
  }
  if (!ir.pages || ir.pages.length === 0) {
    errors.push("Document IR must contain at least one page.");
  }
  if (ir.pageCount !== ir.pages.length) {
    errors.push(
      `pageCount metadata (${ir.pageCount}) does not match pages array length (${ir.pages.length}).`
    );
  }

  const seenElementIds = new Set<string>();

  for (const page of ir.pages) {
    if (page.dimensions.width <= 0 || page.dimensions.height <= 0) {
      errors.push(`Page ${page.pageNumber} has invalid dimensions (${page.dimensions.width}x${page.dimensions.height}).`);
    }

    for (const el of page.elements) {
      if (seenElementIds.has(el.elementId)) {
        errors.push(`Duplicate elementId detected: ${el.elementId}`);
      }
      seenElementIds.add(el.elementId);

      if (el.documentId !== ir.documentId) {
        errors.push(`Element ${el.elementId} documentId mismatch.`);
      }
      if (el.pageId !== page.pageId) {
        errors.push(`Element ${el.elementId} pageId mismatch.`);
      }
      if (el.ocrConfidence < 0 || el.ocrConfidence > 100) {
        errors.push(`Element ${el.elementId} ocrConfidence must be between 0 and 100.`);
      }
      if (el.coordinates.width < 0 || el.coordinates.height < 0) {
        errors.push(`Element ${el.elementId} has negative dimensions.`);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Creates a clean Document IR instance from raw extraction parameters
 */
export function createDocumentIR(params: {
  documentId: string;
  format: "pdf" | "docx" | "png" | "jpg";
  sourceLanguage: string;
  targetLanguage?: string;
  pageDimensions: { width: number; height: number }[];
}): DocumentIR {
  const now = new Date().toISOString();
  const pages: IRPage[] = params.pageDimensions.map((dims, idx) => ({
    pageId: `page_${params.documentId}_${idx + 1}`,
    pageNumber: idx + 1,
    documentId: params.documentId,
    dimensions: { width: dims.width, height: dims.height },
    languageDirection: "ltr",
    elements: [],
  }));

  return {
    documentId: params.documentId,
    format: params.format,
    sourceLanguage: params.sourceLanguage,
    targetLanguage: params.targetLanguage,
    createdAt: now,
    updatedAt: now,
    pageCount: pages.length,
    pages,
    metadata: {
      hasOcrContent: false,
      averageOcrConfidence: 100,
      hasTables: false,
      hasSignaturesOrStamps: false,
      totalWordCount: 0,
    },
  };
}

/**
 * Updates translation for a specific element in the IR
 */
export function updateIRElementTranslation(
  ir: DocumentIR,
  elementId: string,
  targetText: string,
  confidence: number = 95
): boolean {
  for (const page of ir.pages) {
    for (const el of page.elements) {
      if (el.elementId === elementId) {
        el.targetText = targetText;
        el.translationConfidence = Math.max(0, Math.min(100, confidence));
        el.reviewStatus = confidence >= 85 ? "approved" : "flagged";
        el.sourceToOutputMapping = {
          sourceElementId: elementId,
          targetElementId: `out_${elementId}`,
          transformType: "1:1",
        };
        ir.updatedAt = new Date().toISOString();
        return true;
      }
    }
  }
  return false;
}

/**
 * Queries all elements matching specific type in the IR
 */
export function queryIRElementsByType(
  ir: DocumentIR,
  elementType: IRElementType
): IRElement[] {
  const results: IRElement[] = [];
  for (const page of ir.pages) {
    for (const el of page.elements) {
      if (el.elementType === elementType) {
        results.push(el);
      }
    }
  }
  return results;
}
