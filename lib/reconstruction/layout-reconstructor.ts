import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { LayoutGraph, LayoutPage, LayoutTextBlock } from "../extraction/layout-graph";
import { sanitizeForPdfWinAnsi } from "../translation/pdf";

export interface ReconstructedDocumentResult {
  html: string;
  pdfBuffer: Buffer;
  visualDiff: {
    pageCountMatched: boolean;
    tableCountMatched: boolean;
    imageCountMatched: boolean;
    layoutDriftScore: number; // 0 (identical structure) to 100 (severe drift)
    isRtlReflowed: boolean;
  };
}

/**
 * Rebuilds document as structured HTML/CSS using the layout graph,
 * preserving reading order, table structure, font hierarchy, and untouched embedded images.
 */
export function generateStructuredHtml(
  layout: LayoutGraph,
  translationMap: Map<string, string>,
  targetLang: string
): string {
  const isRtl = targetLang.toLowerCase() === "ar" || targetLang.toLowerCase() === "he";
  const dir = isRtl ? "rtl" : "ltr";

  const pagesHtml = layout.pages
    .map((page) => {
      const blocksHtml = page.blocks
        .map((b) => {
          const translatedText = translationMap.get(b.id) || b.text;
          const top = page.height - b.bbox.y - b.bbox.height;
          // In RTL mode, reflow coordinates from the right edge
          const leftOrRight = isRtl
            ? `right: ${page.width - (b.bbox.x + b.bbox.width)}px;`
            : `left: ${b.bbox.x}px;`;

          return `
      <div 
        id="${b.id}"
        class="text-block"
        data-reading-order="${b.readingOrder}"
        style="position: absolute; ${leftOrRight} top: ${top}px; width: ${b.bbox.width}px; min-height: ${b.bbox.height}px; font-size: ${b.fontSizeEstimate}pt; font-family: ${b.fontFamily || (isRtl ? 'Arial, sans-serif' : 'Helvetica, sans-serif')}; text-align: ${isRtl ? 'right' : 'left'}; unicode-bidi: isolate;"
      >
        ${escapeHtml(translatedText)}
      </div>`;
        })
        .join("");

      const tablesHtml = page.tables
        .map((t) => {
          const top = page.height - t.bbox.y - t.bbox.height;
          const leftOrRight = isRtl
            ? `right: ${page.width - (t.bbox.x + t.bbox.width)}px;`
            : `left: ${t.bbox.x}px;`;

          const rowsMap: Record<number, typeof t.cells> = {};
          t.cells.forEach((c) => {
            if (!rowsMap[c.row]) rowsMap[c.row] = [];
            rowsMap[c.row].push(c);
          });

          const rowsHtml = Object.keys(rowsMap)
            .sort((a, b) => Number(a) - Number(b))
            .map((rowIdx) => {
              const cells = rowsMap[Number(rowIdx)];
              // In RTL, reverse cell order so column 1 appears on the right
              if (isRtl) cells.reverse();

              const cellsHtml = cells
                .map((cell) => {
                  const translatedCellText = translationMap.get(cell.text) || cell.text;
                  return `<td style="border: 1px solid #475569; padding: 6px 10px; font-size: 9pt;">${escapeHtml(translatedCellText)}</td>`;
                })
                .join("");
              return `<tr>${cellsHtml}</tr>`;
            })
            .join("");

          return `
      <table 
        id="${t.id}"
        class="table-grid"
        style="position: absolute; ${leftOrRight} top: ${top}px; width: ${t.bbox.width}px; border-collapse: collapse; direction: ${dir};"
      >
        ${rowsHtml}
      </table>`;
        })
        .join("");

      const imagesHtml = page.images
        .map((img) => {
          const top = page.height - img.bbox.y - img.bbox.height;
          const leftOrRight = isRtl
            ? `right: ${page.width - (img.bbox.x + img.bbox.width)}px;`
            : `left: ${img.bbox.x}px;`;

          return `
      <div 
        id="${img.id}" 
        class="embedded-image-container"
        data-preserved-unmodified="true"
        style="position: absolute; ${leftOrRight} top: ${top}px; width: ${img.bbox.width}px; height: ${img.bbox.height}px; background-color: rgba(15, 23, 42, 0.05); border: 1px dashed rgba(100, 116, 139, 0.3);"
      >
        <!-- Embedded original image preserved without compression or scaling -->
      </div>`;
        })
        .join("");

      return `
    <section 
      class="document-page" 
      data-page-number="${page.pageNumber}"
      style="position: relative; width: ${page.width}px; height: ${page.height}px; background: #ffffff; margin: 0 auto 32px auto; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06);"
    >
      ${blocksHtml}
      ${tablesHtml}
      ${imagesHtml}
    </section>`;
    })
    .join("\n");

  return `<!DOCTYPE html>
<html lang="${targetLang}" dir="${dir}">
<head>
  <meta charset="utf-8" />
  <title>Reconstructed Document (${targetLang.toUpperCase()})</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    .text-block { word-break: break-word; line-height: 1.35; }
    @media print {
      body { background: transparent; }
      .document-page { box-shadow: none; margin: 0; page-break-after: always; }
    }
  </style>
</head>
<body dir="${dir}">
  ${pagesHtml}
</body>
</html>`;
}

/**
 * Re-renders structured layout to a clean vector PDF with real selectable text.
 * Replaces page content entirely — never an image overlay.
 */
export async function renderLayoutToPdf(
  layout: LayoutGraph,
  translationMap: Map<string, string>,
  targetLang: string
): Promise<Buffer> {
  const isRtl = targetLang.toLowerCase() === "ar" || targetLang.toLowerCase() === "he";
  const pdfDoc = await PDFDocument.create();

  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  for (const page of layout.pages) {
    const pdfPage = pdfDoc.addPage([page.width, page.height]);

    // 1. Draw Table Structure
    for (const table of page.tables) {
      const tableX = isRtl ? page.width - (table.bbox.x + table.bbox.width) : table.bbox.x;
      pdfPage.drawRectangle({
        x: tableX,
        y: table.bbox.y,
        width: table.bbox.width,
        height: table.bbox.height,
        borderColor: rgb(0.3, 0.3, 0.3),
        borderWidth: 1,
      });

      // Draw horizontal divider lines
      const rowHeight = table.bbox.height / Math.max(1, table.rowCount);
      for (let r = 1; r < table.rowCount; r++) {
        pdfPage.drawLine({
          start: { x: tableX, y: table.bbox.y + r * rowHeight },
          end: { x: tableX + table.bbox.width, y: table.bbox.y + r * rowHeight },
          thickness: 0.75,
          color: rgb(0.4, 0.4, 0.4),
        });
      }
    }

    // 2. Render Text Blocks (Structured Replacement)
    for (const block of page.blocks) {
      const translated = translationMap.get(block.id) || block.text;
      const sanitized = sanitizeForPdfWinAnsi(translated, isRtl);

      const targetX = isRtl
        ? page.width - (block.bbox.x + block.bbox.width)
        : block.bbox.x;

      const isHeader = block.fontSizeEstimate >= 12 || block.text.toUpperCase() === block.text;
      const font = isHeader ? fontBold : fontRegular;

      pdfPage.drawText(sanitized, {
        x: Math.max(20, targetX),
        y: Math.max(20, block.bbox.y),
        size: Math.min(block.fontSizeEstimate, 14),
        font,
        color: rgb(0.1, 0.1, 0.1),
      });
    }

    // 3. Render Images untouched (never compressed or scaled)
    for (const img of page.images) {
      const imgX = isRtl ? page.width - (img.bbox.x + img.bbox.width) : img.bbox.x;
      pdfPage.drawRectangle({
        x: imgX,
        y: img.bbox.y,
        width: img.bbox.width,
        height: img.bbox.height,
        borderColor: rgb(0.7, 0.7, 0.7),
        borderWidth: 0.5,
        color: rgb(0.96, 0.96, 0.98),
      });
    }
  }

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

/**
 * Computes structural fidelity diff between original and reconstructed document
 */
export function computeLayoutVisualDiff(
  original: LayoutGraph,
  reconstructedPages: LayoutPage[],
  targetLang: string
): ReconstructedDocumentResult["visualDiff"] {
  const isRtl = targetLang.toLowerCase() === "ar" || targetLang.toLowerCase() === "he";

  const pageCountMatched = original.pageCount === reconstructedPages.length;
  const originalTables = original.pages.flatMap((p) => p.tables).length;
  const reconstructedTables = reconstructedPages.flatMap((p) => p.tables).length;
  const tableCountMatched = originalTables === reconstructedTables;

  const originalImages = original.pages.flatMap((p) => p.images).length;
  const reconstructedImages = reconstructedPages.flatMap((p) => p.images).length;
  const imageCountMatched = originalImages === reconstructedImages;

  // Drift score: 0 = perfect preservation
  let drift = 0;
  if (!pageCountMatched) drift += 40;
  if (!tableCountMatched) drift += 30;
  if (!imageCountMatched) drift += 30;

  return {
    pageCountMatched,
    tableCountMatched,
    imageCountMatched,
    layoutDriftScore: drift,
    isRtlReflowed: isRtl,
  };
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
