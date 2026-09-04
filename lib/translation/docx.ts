import JSZip from "jszip";
import { translateText } from "./translator";
import { TranslationOptions } from "./types";

export interface DocxExtractionResult {
  textNodeCount: number;
  wordCount: number;
  hasTables: boolean;
  hasHeaders: boolean;
}

export async function translateDocx(
  docxBuffer: Buffer,
  options: TranslationOptions
): Promise<{ buffer: Buffer; metadata: DocxExtractionResult }> {
  const zip = await JSZip.loadAsync(docxBuffer);

  let textNodeCount = 0;
  let wordCount = 0;
  let hasTables = false;
  let hasHeaders = false;

  // List of XML files in docx that contain translatable text
  const targetFiles: string[] = [];

  zip.forEach((relativePath) => {
    if (
      relativePath === "word/document.xml" ||
      relativePath.startsWith("word/header") ||
      relativePath.startsWith("word/footer") ||
      relativePath === "word/footnotes.xml" ||
      relativePath === "word/endnotes.xml"
    ) {
      targetFiles.push(relativePath);
      if (relativePath.startsWith("word/header")) hasHeaders = true;
    }
  });

  for (const filePath of targetFiles) {
    const file = zip.file(filePath);
    if (!file) continue;

    const xmlContent = await file.async("text");
    if (xmlContent.includes("<w:tbl")) {
      hasTables = true;
    }

    // Replace text inside <w:t> tags
    // Handles <w:t>...</w:t> and <w:t xml:space="preserve">...</w:t>
    const regex = /(<w:t(?:\s+[^>]*)?>)([\s\S]*?)(<\/w:t>)/g;
    const matches: { full: string; open: string; text: string; close: string }[] = [];
    let match;

    while ((match = regex.exec(xmlContent)) !== null) {
      matches.push({
        full: match[0],
        open: match[1],
        text: match[2],
        close: match[3],
      });
    }

    // Translate each text piece while keeping XML entities safe
    let updatedXml = xmlContent;
    for (const m of matches) {
      const rawText = decodeXmlEntities(m.text);
      if (rawText.trim().length > 0) {
        textNodeCount++;
        wordCount += rawText.trim().split(/\s+/).length;

        const translated = await translateText(rawText, options);
        const encoded = encodeXmlEntities(translated);
        const replacement = `${m.open}${encoded}${m.close}`;

        // Safe replace
        updatedXml = updatedXml.replace(m.full, replacement);
      }
    }

    zip.file(filePath, updatedXml);
  }

  const outputBuffer = await zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
  });

  return {
    buffer: outputBuffer,
    metadata: {
      textNodeCount,
      wordCount,
      hasTables,
      hasHeaders,
    },
  };
}

function decodeXmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function encodeXmlEntities(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
