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

    // Extract text runs inside <w:t> tags
    const regex = /(<w:t(?:\s+[^>]*)?>)([\s\S]*?)(<\/w:t>)/g;
    const matches: { id: string; full: string; open: string; text: string; close: string }[] = [];
    let match;
    let nodeIdx = 0;

    while ((match = regex.exec(xmlContent)) !== null) {
      const rawText = decodeXmlEntities(match[2]);
      if (rawText.trim().length > 0) {
        matches.push({
          id: `docx_${filePath.replace(/[^a-zA-Z0-9]/g, "_")}_${nodeIdx++}`,
          full: match[0],
          open: match[1],
          text: rawText,
          close: match[3],
        });
      }
    }

    if (matches.length > 0) {
      // Translate all runs contextually in structured blocks
      const { translateStructuredBlocks } = await import("./translator");
      const translationMap = await translateStructuredBlocks(
        matches.map((m) => ({
          id: m.id,
          text: m.text,
          context: `OpenXML document run in ${filePath}`,
        })),
        options
      );

      let updatedXml = xmlContent;
      for (const m of matches) {
        textNodeCount++;
        wordCount += m.text.trim().split(/\s+/).length;

        const translated = translationMap.get(m.id) || m.text;
        const encoded = encodeXmlEntities(translated);
        const replacement = `${m.open}${encoded}${m.close}`;

        updatedXml = updatedXml.replace(m.full, replacement);
      }

      zip.file(filePath, updatedXml);
    }
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
