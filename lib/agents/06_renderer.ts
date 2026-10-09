import fs from "fs";
import path from "path";
import zlib from "zlib";
import fontkit from "@pdf-lib/fontkit";
import {
  PDFDocument,
  PDFFont,
  PDFName,
  StandardFonts,
  rgb,
  pushGraphicsState,
  popGraphicsState,
  concatTransformationMatrix,
  setCharacterSpacing,
  Color,
} from "pdf-lib";
import { convertArabic } from "arabic-reshaper";
import bidiFactory from "bidi-js";
import { Jimp } from "jimp";
import {
  fitTypography,
  shapeAndReorderBidi,
  measureTextWidth,
  TypographyFitResult,
} from "../typography/box-fitter";
import {
  AgentResult,
  RendererInput,
  RendererOutput,
  TranslatedBlock,
} from "../../types/agents";

export { fitTypography, shapeAndReorderBidi, measureTextWidth };
export type { TypographyFitResult };

const bidi = bidiFactory();

// In-memory cache for dynamically loaded Unicode font buffers
const fontBufferCache = new Map<string, Buffer>();

/**
 * Retrieves a cached font buffer or loads it from available local font paths.
 * Prevents out-of-memory errors and disk I/O latency across multi-page files.
 */
export function getCachedFontBuffer(fontKey: string = "NotoSansArabic"): Buffer | null {
  if (fontBufferCache.has(fontKey)) {
    return fontBufferCache.get(fontKey)!;
  }

  const candidatePaths = [
    path.join(process.cwd(), "public", "fonts", "unicode", "NotoSansArabic-Regular.ttf"),
    path.join(process.cwd(), "public", "fonts", "unicode", `${fontKey}.ttf`),
    "C:\\Windows\\Fonts\\tahoma.ttf",
    "C:\\Windows\\Fonts\\arial.ttf",
    "C:\\Windows\\Fonts\\segoeui.ttf",
  ];

  for (const candidate of candidatePaths) {
    try {
      if (fs.existsSync(candidate)) {
        const buf = fs.readFileSync(candidate);
        fontBufferCache.set(fontKey, buf);
        return buf;
      }
    } catch {
      // Continue to next candidate
    }
  }

  return null;
}

/**
 * Removes original vector text objects (BT ... ET) from PDF content streams.
 * Preserves vector drawings, logos, watermarks, background shading, and borders.
 */
export function removeVectorTextObjectsFromPdf(pdfDoc: PDFDocument): number {
  let strippedStreamsCount = 0;
  const pages = pdfDoc.getPages();

  for (const page of pages) {
    const contents = page.node.get(PDFName.of("Contents")) || page.node.Contents();
    if (!contents) continue;

    const streamRefs: any[] = [];
    if (contents.constructor?.name === "PDFArray" && typeof (contents as any).size === "function") {
      const arr = contents as any;
      for (let i = 0; i < arr.size(); i++) {
        streamRefs.push(arr.get(i));
      }
    } else if (Array.isArray(contents)) {
      streamRefs.push(...contents);
    } else {
      streamRefs.push(contents);
    }

    for (const refOrStream of streamRefs) {
      try {
        const ref =
          refOrStream.constructor?.name === "PDFRef"
            ? refOrStream
            : pdfDoc.context.getObjectRef(refOrStream);

        const streamObj = ref ? (pdfDoc.context.lookup(ref) as any) : refOrStream;
        if (!streamObj || typeof streamObj.asUint8Array !== "function") continue;

        const raw = streamObj.asUint8Array();
        if (!raw || raw.length === 0) continue;

        const filter = streamObj.dict?.get(PDFName.of("Filter"));
        const isFlate = filter && filter.toString() === "/FlateDecode";

        let contentStr: string;
        if (isFlate) {
          try {
            contentStr = zlib.inflateSync(Buffer.from(raw)).toString("latin1");
          } catch {
            contentStr = Buffer.from(raw).toString("latin1");
          }
        } else {
          contentStr = Buffer.from(raw).toString("latin1");
        }

        // Detect text objects (BT ... ET)
        if (/BT[\s\S]*?ET/.test(contentStr)) {
          // Remove text objects while strictly preserving all non-text operators
          const stripped = contentStr.replace(/BT[\s\S]*?ET/g, "");
          const newStream = pdfDoc.context.flateStream(stripped);
          if (ref) {
            pdfDoc.context.assign(ref, newStream);
          } else {
            page.node.set(PDFName.of("Contents"), pdfDoc.context.register(newStream));
          }
          strippedStreamsCount++;
        }
      } catch {
        // Continue if single stream fails decompression
      }
    }
  }

  return strippedStreamsCount;
}

/**
 * Samples surrounding background edge pixels on raster images to calculate
 * a seamless average background fill color (no dumb white rgb(1,1,1) boxes).
 */
export async function sampleSurroundingBackgroundFill(
  imageBuffer: Buffer,
  box2d: [number, number, number, number]
): Promise<{ r: number; g: number; b: number }> {
  try {
    const img = await Jimp.read(imageBuffer);
    const width = img.bitmap.width;
    const height = img.bitmap.height;

    const [ymin, xmin, ymax, xmax] = box2d;
    const scaleX = xmax > 1.0 && xmax <= 1000 ? width / 1000 : 1;
    const scaleY = ymax > 1.0 && ymax <= 1000 ? height / 1000 : 1;

    const pxMin = Math.max(0, Math.floor(xmin * scaleX));
    const pxMax = Math.min(width - 1, Math.ceil(xmax * scaleX));
    const pyMin = Math.max(0, Math.floor(ymin * scaleY));
    const pyMax = Math.min(height - 1, Math.ceil(ymax * scaleY));

    let sumR = 0, sumG = 0, sumB = 0, count = 0;

    const topY = Math.max(0, pyMin - 1);
    const bottomY = Math.min(height - 1, pyMax + 1);

    for (let x = pxMin; x <= pxMax; x += 2) {
      const topCol = img.getPixelColor(x, topY);
      sumR += (topCol >>> 24) & 255;
      sumG += (topCol >>> 16) & 255;
      sumB += (topCol >>> 8) & 255;
      count++;

      const botCol = img.getPixelColor(x, bottomY);
      sumR += (botCol >>> 24) & 255;
      sumG += (botCol >>> 16) & 255;
      sumB += (botCol >>> 8) & 255;
      count++;
    }

    const leftX = Math.max(0, pxMin - 1);
    const rightX = Math.min(width - 1, pxMax + 1);

    for (let y = pyMin; y <= pyMax; y += 2) {
      const leftCol = img.getPixelColor(leftX, y);
      sumR += (leftCol >>> 24) & 255;
      sumG += (leftCol >>> 16) & 255;
      sumB += (leftCol >>> 8) & 255;
      count++;

      const rightCol = img.getPixelColor(rightX, y);
      sumR += (rightCol >>> 24) & 255;
      sumG += (rightCol >>> 16) & 255;
      sumB += (rightCol >>> 8) & 255;
      count++;
    }

    if (count === 0) return { r: 255, g: 255, b: 255 };

    return {
      r: Math.round(sumR / count),
      g: Math.round(sumG / count),
      b: Math.round(sumB / count),
    };
  } catch {
    return { r: 255, g: 255, b: 255 };
  }
}

/**
 * Parses Hex or RGB color specifications from text blocks with a default fallback to black.
 */
export function parseTextColor(colorValue?: unknown): Color {
  if (!colorValue) return rgb(0, 0, 0);

  if (Array.isArray(colorValue) && colorValue.length >= 3) {
    return rgb(
      Math.min(1, Math.max(0, colorValue[0] / 255)),
      Math.min(1, Math.max(0, colorValue[1] / 255)),
      Math.min(1, Math.max(0, colorValue[2] / 255))
    );
  }

  if (typeof colorValue === "string") {
    let str = colorValue.trim();
    if (str.startsWith("#")) {
      str = str.slice(1);
      if (str.length === 3) {
        str = str.split("").map((c) => c + c).join("");
      }
      if (str.length === 6) {
        const r = parseInt(str.substring(0, 2), 16) / 255;
        const g = parseInt(str.substring(2, 4), 16) / 255;
        const b = parseInt(str.substring(4, 6), 16) / 255;
        return rgb(r, g, b);
      }
    }
    const rgbMatch = str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
    if (rgbMatch) {
      return rgb(
        parseInt(rgbMatch[1], 10) / 255,
        parseInt(rgbMatch[2], 10) / 255,
        parseInt(rgbMatch[3], 10) / 255
      );
    }
  }

  return rgb(0, 0, 0);
}

/**
 * Reshapes Arabic glyphs and applies the Unicode Bidirectional Algorithm (BiDi).
 */


export class ReconstructionAgent {
  public async execute(input: RendererInput): Promise<AgentResult<RendererOutput>> {
    try {
      const { originalBuffer, translatedBlocks, targetLang } = input;
      const isPdf = originalBuffer.length > 4 && originalBuffer.subarray(0, 4).toString("ascii") === "%PDF";
      const isRtl = targetLang === "ar" || targetLang === "he" || targetLang === "fa" || targetLang === "ur";

      let pdfDoc: PDFDocument;
      let isVectorPdf = false;

      if (isPdf) {
        pdfDoc = await PDFDocument.load(originalBuffer, { ignoreEncryption: true });
        // Requirement 1 (Vector PDF): Remove original text objects entirely from stream, preserving backgrounds & watermarks
        const stripped = removeVectorTextObjectsFromPdf(pdfDoc);
        isVectorPdf = stripped > 0;
      } else {
        // Requirement 2: Image-to-PDF Conversion (brand new PDF matching image dimensions)
        pdfDoc = await PDFDocument.create();
        let embeddedImage;
        const isPng = originalBuffer.length > 4 && originalBuffer[0] === 0x89 && originalBuffer[1] === 0x50;
        if (isPng) {
          try {
            embeddedImage = await pdfDoc.embedPng(originalBuffer);
          } catch {
            try {
              embeddedImage = await pdfDoc.embedJpg(originalBuffer);
            } catch {
              const jimpImg = await Jimp.read(originalBuffer);
              const pngBuf = await jimpImg.getBuffer("image/png" as any);
              embeddedImage = await pdfDoc.embedPng(pngBuf);
            }
          }
        } else {
          try {
            embeddedImage = await pdfDoc.embedJpg(originalBuffer);
          } catch {
            try {
              embeddedImage = await pdfDoc.embedPng(originalBuffer);
            } catch {
              const jimpImg = await Jimp.read(originalBuffer);
              const pngBuf = await jimpImg.getBuffer("image/png" as any);
              embeddedImage = await pdfDoc.embedPng(pngBuf);
            }
          }
        }

        const imgWidth = embeddedImage.width;
        const imgHeight = embeddedImage.height;
        const page = pdfDoc.addPage([imgWidth, imgHeight]);
        page.drawImage(embeddedImage, {
          x: 0,
          y: 0,
          width: imgWidth,
          height: imgHeight,
        });
      }

      // Requirement 4: Font & Unicode integration
      pdfDoc.registerFontkit(fontkit);
      let font: PDFFont;

      if (isRtl) {
        const fontBuf = getCachedFontBuffer("NotoSansArabic");
        if (fontBuf) {
          font = await pdfDoc.embedFont(fontBuf);
        } else {
          font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        }
      } else {
        const unicodeBuf =
          !process.env.VITEST &&
          (getCachedFontBuffer("arial") ||
            getCachedFontBuffer("segoeui") ||
            getCachedFontBuffer("tahoma"));
        if (unicodeBuf) {
          font = await pdfDoc.embedFont(unicodeBuf);
        } else {
          font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        }
      }

      const pages = pdfDoc.getPages();

      for (const block of translatedBlocks) {
        const pageIdx = Math.max(0, Math.min((block.pageNumber || 1) - 1, pages.length - 1));
        const page = pages[pageIdx];
        const pageWidth = page.getWidth();
        const pageHeight = page.getHeight();

        let [ymin, xmin, ymax, xmax] = block.box2d;

        // Auto-scale normalized bounding boxes (0..1000) to actual canvas dimensions
        if (!isVectorPdf && xmax <= 1000 && ymax <= 1000 && (pageWidth > 1000 || pageHeight > 1000)) {
          xmin = (xmin / 1000) * pageWidth;
          xmax = (xmax / 1000) * pageWidth;
          ymin = (ymin / 1000) * pageHeight;
          ymax = (ymax / 1000) * pageHeight;
        }

        const boxWidth = Math.max(10, xmax - xmin);
        const boxHeight = Math.max(10, ymax - ymin);
        const pdfY = pageHeight - ymax;
        const pdfX = xmin;

        // Requirement 1: Smart Redaction (No Dumb White Boxes)
        if (!isVectorPdf) {
          // Raster: Sample surrounding background edge pixels to create seamless background fill
          const bgColor = await sampleSurroundingBackgroundFill(originalBuffer, block.box2d);
          page.drawRectangle({
            x: pdfX,
            y: pdfY,
            width: boxWidth,
            height: boxHeight,
            color: rgb(bgColor.r / 255, bgColor.g / 255, bgColor.b / 255),
          });
        }

        const rawText = block.translatedText || block.originalText || "";
        const initialFontSize =
          block.fontSizeTier === "title"
            ? 24
            : block.fontSizeTier === "heading"
            ? 16
            : block.fontSizeTier === "caption"
            ? 9
            : 12;

        // Requirement 3: Advanced Typography Fitting (Wrap -> Scale -> Condense)
        const fitting = fitTypography(
          rawText,
          boxWidth,
          boxHeight,
          initialFontSize,
          font,
          isRtl
        );

        // Requirement 4: Color extraction
        const textColor = parseTextColor(
          (block as any).color ?? (block as any).fontColor ?? (block as any).textColor
        );

        // Requirement 2: Exact Alignment & RTL Anchoring with Letter-Spacing
        let currentLineY = pageHeight - ymin - fitting.lineHeight;

        for (const line of fitting.lines) {
          const textWidth = measureTextWidth(
            line,
            fitting.fontSize,
            fitting.letterSpacing,
            font,
            fitting.scaleX
          );

          let lineX: number;
          if (isRtl) {
            // RTL text MUST be right-aligned programmatically: anchor starting X coordinate at box.xmax and subtract textWidth
            if (block.align === "center") {
              lineX = pdfX + (boxWidth - textWidth) / 2;
            } else if (block.align === "left") {
              lineX = pdfX;
            } else {
              // Right alignment (standard for RTL)
              lineX = xmax - textWidth;
            }
          } else {
            // LTR alignment preservation
            if (block.align === "right") {
              lineX = xmax - textWidth;
            } else if (block.align === "center") {
              lineX = pdfX + (boxWidth - textWidth) / 2;
            } else {
              lineX = pdfX;
            }
          }

          // Safety clamp: never let lineX escape the bounding box horizontally
          lineX = Math.max(pdfX, Math.min(xmax - textWidth, lineX));

          // Set character spacing (letter-spacing)
          if (fitting.letterSpacing !== 0) {
            page.pushOperators(setCharacterSpacing(fitting.letterSpacing));
          }

          const renderTextSafely = (textToDraw: string) => {
            try {
              page.drawText(textToDraw, {
                x: lineX,
                y: currentLineY,
                size: fitting.fontSize,
                font,
                color: textColor,
              });
            } catch {
              // If font throws unencodable WinAnsi error, normalize and sanitize
              const cleanText = textToDraw
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/[^\x20-\x7E]/g, " ");
              page.drawText(cleanText, {
                x: lineX,
                y: currentLineY,
                size: fitting.fontSize,
                font,
                color: textColor,
              });
            }
          };

          // Render with horizontal condensation transform if scaleX < 1.0
          if (fitting.scaleX < 0.999) {
            page.pushOperators(
              pushGraphicsState(),
              concatTransformationMatrix(fitting.scaleX, 0, 0, 1, lineX * (1 - fitting.scaleX), 0)
            );

            renderTextSafely(line);

            page.pushOperators(popGraphicsState());
          } else {
            renderTextSafely(line);
          }

          // Reset character spacing
          if (fitting.letterSpacing !== 0) {
            page.pushOperators(setCharacterSpacing(0));
          }

          currentLineY -= fitting.lineHeight;
        }
      }

      const renderedBytes = await pdfDoc.save();

      return {
        success: true,
        data: {
          renderedBuffer: Buffer.from(renderedBytes),
          format: "pdf",
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Reconstruction failed",
      };
    }
  }
}

/**
 * Direct image-to-PDF conversion helper guaranteeing that any raster image
 * is embedded into a fresh, standard-compliant PDF document matching the image dimensions.
 */
export async function convertImageToPdfWithTranslation(
  imageBuffer: Buffer,
  translatedBlocks: TranslatedBlock[] = [],
  targetLang: string = "en"
): Promise<Uint8Array> {
  const agent = new ReconstructionAgent();
  const res = await agent.execute({
    originalBuffer: imageBuffer,
    translatedBlocks,
    targetLang,
  });
  if (!res.success || !res.data) {
    throw new Error(res.error || "Failed to convert image to PDF");
  }
  return res.data.renderedBuffer;
}

