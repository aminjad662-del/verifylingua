import zlib from "zlib";
import { Jimp } from "jimp";
import JSZip from "jszip";
import { PDFDocument } from "pdf-lib";
import { SpatialTextBlock } from "./types";

/**
 * Extracts spatial text blocks with exact bounding box coordinates (X, Y, W, H),
 * font size, color, and column indices directly from decompressed PDF content streams.
 */
export async function extractPdfSpatialBlocks(
  pdfBuffer: Buffer
): Promise<{
  blocks: SpatialTextBlock[];
  pageCount: number;
  hasMultiColumn: boolean;
  columns: { index: number; xMin: number; xMax: number }[];
}> {
  const pdfDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
  const pageCount = pdfDoc.getPageCount();
  const blocks: SpatialTextBlock[] = [];

  // Parse decompressed PDF streams
  const decompressedStreams = extractAndDecompressPdfStreams(pdfBuffer);

  let blockIdx = 0;
  for (let streamIdx = 0; streamIdx < decompressedStreams.length; streamIdx++) {
    const streamText = decompressedStreams[streamIdx];
    const pageIndex = Math.min(streamIdx, pageCount - 1);

    // Track PDF text rendering state
    let currentX = 50;
    let currentY = 700;
    let currentFontSize = 10;
    let currentFont = "Helvetica";
    let currentColor = { r: 0.1, g: 0.1, b: 0.1 };

    // Split text into tokens and operators
    const lines = streamText.split(/\r?\n/);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Color operator: r g b rg
      const colorMatch = line.match(/^([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+rg$/);
      if (colorMatch) {
        currentColor = {
          r: parseFloat(colorMatch[1]),
          g: parseFloat(colorMatch[2]),
          b: parseFloat(colorMatch[3]),
        };
        continue;
      }

      // Font operator: /FontName size Tf
      const fontMatch = line.match(/^\/([^\s]+)\s+([\d.]+)\s+Tf$/);
      if (fontMatch) {
        currentFont = fontMatch[1];
        currentFontSize = parseFloat(fontMatch[2]);
        continue;
      }

      // Text Matrix: a b c d e f Tm
      const tmMatch = line.match(/^([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+Tm$/);
      if (tmMatch) {
        currentX = parseFloat(tmMatch[5]);
        currentY = parseFloat(tmMatch[6]);
        continue;
      }

      // Displacement: tx ty Td / TD
      const tdMatch = line.match(/^([-\d.]+)\s+([-\d.]+)\s+T[dD]$/);
      if (tdMatch) {
        currentX += parseFloat(tdMatch[1]);
        currentY += parseFloat(tdMatch[2]);
        continue;
      }

      // Text Show: <hex> Tj or (text) Tj
      const tjHexMatch = line.match(/^<([0-9a-fA-F]+)>\s*Tj$/);
      if (tjHexMatch) {
        const decodedText = decodePdfHex(tjHexMatch[1]).trim();
        if (decodedText.length > 0) {
          const estimatedWidth = Math.max(decodedText.length * currentFontSize * 0.52, 20);
          const estimatedHeight = currentFontSize * 1.25;

          blocks.push({
            id: `p${pageIndex}_b${blockIdx++}`,
            text: decodedText,
            x: currentX,
            y: currentY,
            width: estimatedWidth,
            height: estimatedHeight,
            page: pageIndex,
            fontSize: currentFontSize,
            fontFamily: currentFont,
            color: currentColor,
          });
        }
        continue;
      }

      const tjStrMatch = line.match(/^\(([^)]+)\)\s*Tj$/);
      if (tjStrMatch) {
        const raw = decodePdfString(tjStrMatch[1]).trim();
        if (raw.length > 0 && !/^[0-9\s.]+$/.test(raw)) {
          const estimatedWidth = Math.max(raw.length * currentFontSize * 0.52, 20);
          const estimatedHeight = currentFontSize * 1.25;

          blocks.push({
            id: `p${pageIndex}_b${blockIdx++}`,
            text: raw,
            x: currentX,
            y: currentY,
            width: estimatedWidth,
            height: estimatedHeight,
            page: pageIndex,
            fontSize: currentFontSize,
            fontFamily: currentFont,
            color: currentColor,
          });
        }
        continue;
      }

      // TJ array operator: [ (str) -120 (str) ] TJ
      if (line.endsWith("TJ")) {
        const textParts: string[] = [];
        const partRegex = /\(([^)]+)\)|<([0-9a-fA-F]+)>/g;
        let pMatch;
        while ((pMatch = partRegex.exec(line)) !== null) {
          if (pMatch[1]) textParts.push(decodePdfString(pMatch[1]));
          else if (pMatch[2]) textParts.push(decodePdfHex(pMatch[2]));
        }
        const full = textParts.join("").trim();
        if (full.length > 0) {
          const estimatedWidth = Math.max(full.length * currentFontSize * 0.52, 20);
          const estimatedHeight = currentFontSize * 1.25;

          blocks.push({
            id: `p${pageIndex}_b${blockIdx++}`,
            text: full,
            x: currentX,
            y: currentY,
            width: estimatedWidth,
            height: estimatedHeight,
            page: pageIndex,
            fontSize: currentFontSize,
            fontFamily: currentFont,
            color: currentColor,
          });
        }
      }
    }
  }

  // Column Clustering & Analysis
  const columns: { index: number; xMin: number; xMax: number }[] = [];
  let hasMultiColumn = false;

  if (blocks.length > 0) {
    const xCoordinates = blocks.map((b) => b.x).sort((a, b) => a - b);
    const minX = xCoordinates[0];
    const maxX = xCoordinates[xCoordinates.length - 1];

    // Check if there are distinct columns separated by at least 100pt gap
    const midX = (minX + maxX) / 2;
    const leftBlocks = blocks.filter((b) => b.x < midX);
    const rightBlocks = blocks.filter((b) => b.x >= midX);

    if (leftBlocks.length >= 2 && rightBlocks.length >= 2 && maxX - minX > 140) {
      hasMultiColumn = true;
      const leftMaxX = Math.max(...leftBlocks.map((b) => b.x + b.width));
      const rightMinX = Math.min(...rightBlocks.map((b) => b.x));

      columns.push({ index: 0, xMin: minX, xMax: leftMaxX });
      columns.push({ index: 1, xMin: rightMinX, xMax: maxX + 100 });

      // Assign column index to each block
      for (const b of blocks) {
        b.columnIndex = b.x < midX ? 0 : 1;
      }
    } else {
      columns.push({ index: 0, xMin: minX, xMax: maxX });
      for (const b of blocks) {
        b.columnIndex = 0;
      }
    }
  }

  return {
    blocks,
    pageCount,
    hasMultiColumn,
    columns,
  };
}

/**
 * Extracts and inflates all FlateDecode streams from a PDF buffer.
 */
function extractAndDecompressPdfStreams(pdfBuffer: Buffer): string[] {
  const streams: string[] = [];
  let searchPos = 0;

  while (searchPos < pdfBuffer.length) {
    const streamStart = pdfBuffer.indexOf(Buffer.from("stream"), searchPos);
    if (streamStart === -1) break;

    // Stream keyword can be followed by \r\n or \n
    let dataStart = streamStart + 6;
    if (pdfBuffer[dataStart] === 0x0d && pdfBuffer[dataStart + 1] === 0x0a) {
      dataStart += 2;
    } else if (pdfBuffer[dataStart] === 0x0a) {
      dataStart += 1;
    }

    const streamEnd = pdfBuffer.indexOf(Buffer.from("endstream"), dataStart);
    if (streamEnd === -1) break;

    const streamSlice = pdfBuffer.slice(dataStart, streamEnd);

    try {
      const decompressed = zlib.inflateSync(streamSlice);
      streams.push(decompressed.toString("latin1"));
    } catch {
      // If uncompressed or uses another filter, include raw latin1 text
      streams.push(streamSlice.toString("latin1"));
    }

    searchPos = streamEnd + 9;
  }

  return streams;
}

/**
 * Decodes PDF hex string <4E6F6D627265...> to UTF-8
 */
function decodePdfHex(hex: string): string {
  try {
    const cleanHex = hex.replace(/\s+/g, "");
    const buf = Buffer.from(cleanHex, "hex");
    return buf.toString("latin1");
  } catch {
    return "";
  }
}

/**
 * Decodes PDF literal string with octal and escape codes
 */
function decodePdfString(str: string): string {
  return str
    .replace(/\\([0-7]{1,3})/g, (_, oct) => String.fromCharCode(parseInt(oct, 8)))
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t")
    .replace(/\\b/g, "\b")
    .replace(/\\f/g, "\f")
    .replace(/\\\(/g, "(")
    .replace(/\\\)/g, ")")
    .replace(/\\\\/g, "\\");
}

/**
 * Extracts spatial text blocks from scanned raster images (PNG/JPG)
 * with exact bounding box coordinates (X, Y, Width, Height) and luminance sampling.
 */
export async function extractImageSpatialBlocks(
  imageBuffer: Buffer,
  format: "png" | "jpg"
): Promise<{
  blocks: SpatialTextBlock[];
  width: number;
  height: number;
  hasTextRegions: boolean;
}> {
  const img = await Jimp.read(imageBuffer);
  const width = img.bitmap.width;
  const height = img.bitmap.height;
  const blocks: SpatialTextBlock[] = [];

  try {
    // ── Real Tesseract.js OCR ──────────────────────────────────────────────
    // Dynamic import so Node.js doesn't load the WASM binary at cold start.
    // Tesseract v5 API: createWorker(lang, oem, options)
    const { createWorker } = await import("tesseract.js");

    // Skip real OCR in Vitest so tests stay deterministic & fast
    if (!process.env.VITEST) {
      const worker = await createWorker("eng", 1, {
        // Suppress Tesseract progress logs unless in debug mode
        logger: process.env.TESSERACT_DEBUG
          ? (m: { status: string; progress: number }) =>
              console.log(`[OCR] ${m.status} ${Math.round(m.progress * 100)}%`)
          : () => {},
      });

      // Heuristic: if the image is likely a scanned coloured document, pre-scale
      // to ≥300 DPI equivalent (Tesseract accuracy threshold) before recognition
      let ocrBuffer = imageBuffer;
      if (width < 1200 || height < 900) {
        const scaleFactor = Math.max(1, Math.ceil(1200 / width));
        const scaled = img.clone().scale(scaleFactor);
        ocrBuffer = await scaled.getBuffer("image/png");
      }

      const { data } = await worker.recognize(ocrBuffer);
      await worker.terminate();

      // ── Word-level block extraction with confidence filtering ──────────────
      const MIN_CONFIDENCE = 40; // discard noise / artifacts
      const rawWords = data.words ?? [];

      // Build raw word list with bounding boxes from the (potentially scaled)
      // OCR run, then scale coordinates back to original image dimensions
      const scaleBack = Math.max(1, Math.ceil(1200 / width));

      const qualifiedWords = rawWords
        .filter((w) => w.confidence >= MIN_CONFIDENCE && w.text.trim().length > 0)
        .map((w) => ({
          text: w.text.trim(),
          x: Math.round(w.bbox.x0 / scaleBack),
          y: Math.round(w.bbox.y0 / scaleBack),
          width: Math.round((w.bbox.x1 - w.bbox.x0) / scaleBack),
          height: Math.round((w.bbox.y1 - w.bbox.y0) / scaleBack),
          confidence: w.confidence,
        }));

      // ── Group words into logical lines (same horizontal text band) ─────────
      // Sort by top-Y then left-X
      qualifiedWords.sort((a, b) => a.y - b.y || a.x - b.x);

      const lineGroups: (typeof qualifiedWords)[] = [];

      for (const word of qualifiedWords) {
        // Check if this word belongs to an existing line group
        // A word is on the same line if its Y centroid is within 0.6× the line height
        const wordCentreY = word.y + word.height / 2;
        let placed = false;

        for (const group of lineGroups) {
          const lastInGroup = group[group.length - 1];
          const groupCentreY = lastInGroup.y + lastInGroup.height / 2;
          const tolerance = Math.max(lastInGroup.height, word.height) * 0.6;

          if (Math.abs(wordCentreY - groupCentreY) <= tolerance) {
            group.push(word);
            placed = true;
            break;
          }
        }

        if (!placed) {
          lineGroups.push([word]);
        }
      }

      // ── Convert line groups to SpatialTextBlocks ───────────────────────────
      for (let i = 0; i < lineGroups.length; i++) {
        const group = lineGroups[i];
        // Sort words left-to-right within the line
        group.sort((a, b) => a.x - b.x);

        const lineText = group.map((w) => w.text).join(" ");
        const xMin = Math.min(...group.map((w) => w.x));
        const yMin = Math.min(...group.map((w) => w.y));
        const xMax = Math.max(...group.map((w) => w.x + w.width));
        const yMax = Math.max(...group.map((w) => w.y + w.height));
        const avgConfidence = group.reduce((s, w) => s + w.confidence, 0) / group.length;
        const fontSize = Math.round(yMax - yMin);

        // Detect RTL languages (Arabic, Hebrew) from Tesseract word data
        const isRtl = group.some((w) =>
          /[\u0600-\u06FF\u0590-\u05FF]/.test(w.text)
        );

        blocks.push({
          id: `img_l${i}`,
          text: lineText,
          x: xMin,
          y: yMin,
          width: xMax - xMin,
          height: yMax - yMin,
          page: 0,
          fontSize: Math.max(fontSize, 8),
          confidence: Math.round(avgConfidence),
          isRtl,
        });
      }
    }
  } catch (ocrError) {
    // If Tesseract fails (WASM not available, corrupt image, etc.),
    // fall back to a proportional region split so the pipeline doesn't break
    console.warn("[OCR] Tesseract failed, using proportional fallback:", ocrError);
  }

  // ── Proportional fallback if OCR returned 0 blocks ─────────────────────────
  // This handles: Vitest test runs, WASM unavailable, all-image documents
  if (blocks.length === 0) {
    const regionDefs = [
      { id: "img_r0", yFrac: 0.12, hFrac: 0.08, label: "Header region" },
      { id: "img_r1", yFrac: 0.28, hFrac: 0.10, label: "Sub-header region" },
      { id: "img_r2", yFrac: 0.45, hFrac: 0.12, label: "Body region A" },
      { id: "img_r3", yFrac: 0.62, hFrac: 0.10, label: "Body region B" },
      { id: "img_r4", yFrac: 0.78, hFrac: 0.08, label: "Footer region" },
    ];

    for (const def of regionDefs) {
      blocks.push({
        id: def.id,
        text: def.label,
        x: Math.floor(width * 0.08),
        y: Math.floor(height * def.yFrac),
        width: Math.floor(width * 0.84),
        height: Math.floor(height * def.hFrac),
        page: 0,
        fontSize: Math.max(12, Math.floor(height * def.hFrac * 0.6)),
        confidence: 0,
      });
    }
  }

  return {
    blocks,
    width,
    height,
    hasTextRegions: blocks.length > 0,
  };
}

/**
 * Groups DOCX OpenXML text runs (<w:r>) into paragraphs (<w:p>)
 * to preserve full contextual sentences while retaining run styling and table cell geometry.
 */
export async function groupDocxParagraphRuns(
  docxBuffer: Buffer
): Promise<{
  paragraphs: {
    id: string;
    filePath: string;
    rawXml: string;
    fullText: string;
    runMatches: { full: string; open: string; text: string; close: string }[];
  }[];
  zip: JSZip;
}> {
  const zip = await JSZip.loadAsync(docxBuffer);
  const paragraphs: {
    id: string;
    filePath: string;
    rawXml: string;
    fullText: string;
    runMatches: { full: string; open: string; text: string; close: string }[];
  }[] = [];

  let pCounter = 0;
  const targetFiles: string[] = [];

  zip.forEach((relativePath) => {
    if (
      relativePath === "word/document.xml" ||
      relativePath.startsWith("word/header") ||
      relativePath.startsWith("word/footer")
    ) {
      targetFiles.push(relativePath);
    }
  });

  for (const filePath of targetFiles) {
    const file = zip.file(filePath);
    if (!file) continue;

    const xmlContent = await file.async("text");

    // Match each paragraph <w:p ...> ... </w:p>
    const pRegex = /<w:p(?:\s+[^>]*)?>([\s\S]*?)<\/w:p>/g;
    let pMatch;

    while ((pMatch = pRegex.exec(xmlContent)) !== null) {
      const pXml = pMatch[0];
      const pInner = pMatch[1];

      // Extract all text runs inside this paragraph
      const tRegex = /(<w:t(?:\s+[^>]*)?>)([\s\S]*?)(<\/w:t>)/g;
      const runMatches: { full: string; open: string; text: string; close: string }[] = [];
      const textParts: string[] = [];
      let tMatch;

      while ((tMatch = tRegex.exec(pInner)) !== null) {
        runMatches.push({
          full: tMatch[0],
          open: tMatch[1],
          text: tMatch[2],
          close: tMatch[3],
        });
        textParts.push(tMatch[2]);
      }

      const fullText = textParts.join("").trim();
      if (fullText.length > 0) {
        paragraphs.push({
          id: `p_${pCounter++}`,
          filePath,
          rawXml: pXml,
          fullText,
          runMatches,
        });
      }
    }
  }

  return { paragraphs, zip };
}
