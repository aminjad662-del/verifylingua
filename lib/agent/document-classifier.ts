import { PDFDocument } from "pdf-lib";
import { Jimp } from "jimp";

export interface DocumentClassification {
  format: "pdf" | "docx" | "png" | "jpg";
  mimeType: string;
  pdfType?: "native" | "scanned" | "hybrid";
  pageCount: number;
  wordCount: number;
  characterCount: number;
  sourceLanguage: string;
  targetLanguage: string;
  direction: "rtl" | "ltr";
  complexity: "low" | "medium" | "high";
  hasTables: boolean;
  hasImages: boolean;
  hasForms: boolean;
  hasMultiColumn: boolean;
  selectedPipeline: "docx_xml" | "pdf_coordinate" | "pdf_scanned" | "image_inpaint";
  selectedProvider: "azure" | "google" | "deepl" | "gemini";
}

export async function classifyDocument(params: {
  buffer: Buffer;
  filename: string;
  targetLanguage: string;
  suggestedSourceLang?: string;
}): Promise<DocumentClassification> {
  const { buffer, filename, targetLanguage } = params;

  // 1. Sniff Magic Bytes
  let format: "pdf" | "docx" | "png" | "jpg" = "pdf";
  let mimeType = "application/pdf";

  if (buffer.length >= 4 && buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) {
    format = "pdf";
    mimeType = "application/pdf";
  } else if (buffer.length >= 4 && buffer[0] === 0x50 && buffer[1] === 0x4b && buffer[2] === 0x03 && buffer[3] === 0x04) {
    format = "docx";
    mimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  } else if (buffer.length >= 8 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
    format = "png";
    mimeType = "image/png";
  } else if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    format = "jpg";
    mimeType = "image/jpeg";
  } else {
    // Fallback to extension
    const ext = filename.split(".").pop()?.toLowerCase() || "";
    if (ext === "docx") {
      format = "docx";
      mimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    } else if (ext === "png") {
      format = "png";
      mimeType = "image/png";
    } else if (ext === "jpg" || ext === "jpeg") {
      format = "jpg";
      mimeType = "image/jpeg";
    }
  }

  // 2. Metrics & Complexity Analysis
  let pageCount = 1;
  let wordCount = 0;
  let characterCount = 0;
  let pdfType: "native" | "scanned" | "hybrid" | undefined;
  let hasTables = false;
  let hasImages = false;
  let hasForms = false;
  let hasMultiColumn = false;
  let detectedSourceLang = params.suggestedSourceLang || "es";

  if (format === "pdf") {
    try {
      const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      pageCount = pdfDoc.getPageCount();

      // Check for content streams and form fields
      const form = pdfDoc.getForm?.();
      if (form && form.getFields().length > 0) {
        hasForms = true;
      }

      // Check if text exists in raw streams (native vs scanned)
      const rawString = buffer.toString("latin1");
      const hasTextOperators = /\b(Tj|TJ|BT|ET)\b/.test(rawString);
      const hasImageXObjects = /\/Subtype\s*\/Image/.test(rawString);

      if (hasImageXObjects) hasImages = true;
      if (hasTextOperators && hasImageXObjects) pdfType = "hybrid";
      else if (hasTextOperators) pdfType = "native";
      else pdfType = "scanned";

      // Detect tables and columns
      if (rawString.includes("/Table") || (rawString.match(/re\s+f/g) || []).length > 10) {
        hasTables = true;
      }
      if (pageCount > 1 || hasTables || hasForms) {
        hasMultiColumn = true;
      }
    } catch {
      pdfType = "scanned";
    }
  } else if (format === "docx") {
    const rawZip = buffer.toString("utf8", 0, Math.min(buffer.length, 50000));
    hasTables = rawZip.includes("<w:tbl");
    hasImages = rawZip.includes("<w:drawing") || rawZip.includes("<a:blip");
    // Estimate word count from buffer size
    wordCount = Math.round(buffer.length / 30);
    characterCount = wordCount * 6;
  } else {
    // Images
    try {
      const img = await Jimp.read(buffer);
      hasImages = true;
      characterCount = 200;
      wordCount = 35;
    } catch {
      // ignore
    }
  }

  // 3. Direction and Complexity
  const isRtl = ["ar", "he", "fa", "ur"].includes(targetLanguage.toLowerCase());
  const direction: "rtl" | "ltr" = isRtl ? "rtl" : "ltr";

  let complexity: "low" | "medium" | "high" = "low";
  if (pageCount > 5 || hasTables || hasForms || pdfType === "scanned") {
    complexity = "high";
  } else if (pageCount > 2 || hasImages || hasMultiColumn) {
    complexity = "medium";
  }

  // 4. Pipeline Selection
  let selectedPipeline: DocumentClassification["selectedPipeline"] = "pdf_coordinate";
  if (format === "docx") {
    selectedPipeline = "docx_xml";
  } else if (format === "png" || format === "jpg") {
    selectedPipeline = "image_inpaint";
  } else if (pdfType === "scanned") {
    selectedPipeline = "pdf_scanned";
  } else {
    selectedPipeline = "pdf_coordinate";
  }

  // 5. Provider Selection
  let selectedProvider: DocumentClassification["selectedProvider"] = "deepl";
  if (complexity === "high" && format === "pdf") {
    selectedProvider = "azure";
  } else {
    selectedProvider = "deepl";
  }

  return {
    format,
    mimeType,
    pdfType,
    pageCount,
    wordCount,
    characterCount,
    sourceLanguage: detectedSourceLang,
    targetLanguage,
    direction,
    complexity,
    hasTables,
    hasImages,
    hasForms,
    hasMultiColumn,
    selectedPipeline,
    selectedProvider,
  };
}
