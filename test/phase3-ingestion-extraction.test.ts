import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { extractLayoutGraph } from "../lib/extraction/layout-graph";

describe("Phase 3: Ingestion & Layout Graph Extraction Pipeline Gate", () => {
  const fixturesDir = path.join(process.cwd(), "fixtures");
  const textPdfPath = path.join(fixturesDir, "sample_birth_cert.pdf");
  const scannedPdfPath = path.join(fixturesDir, "sample_scanned.pdf");
  const photoJpgPath = path.join(fixturesDir, "sample_diploma.jpg");

  it("1. Extracts structured layout graph from Text-Native PDF with table and typography geometry", async () => {
    const buffer = fs.readFileSync(textPdfPath);
    const layout = await extractLayoutGraph(buffer, "sample_birth_cert.pdf", "application/pdf");

    expect(layout.documentType).toBe("text-native-pdf");
    expect(layout.pageCount).toBe(2);
    expect(layout.pages).toHaveLength(2);

    // Page 1 inspection
    const page1 = layout.pages[0];
    expect(page1.width).toBe(595);
    expect(page1.height).toBe(842);
    expect(page1.blocks.length).toBeGreaterThan(3);

    // Table detection verification
    expect(page1.tables.length).toBeGreaterThanOrEqual(1);
    const table = page1.tables[0];
    expect(table.cells.length).toBeGreaterThanOrEqual(2);

    // Image preservation manifest: embedded seals preserved untouched
    expect(page1.images.length).toBeGreaterThan(0);
    expect(page1.images[0].preservedUnmodified).toBe(true);

    // Reading order strictly ascending
    for (let i = 1; i < page1.blocks.length; i++) {
      expect(page1.blocks[i].readingOrder).toBeGreaterThan(page1.blocks[i - 1].readingOrder);
    }

    // High confidence on native vector streams
    expect(layout.internalOcrAudit.averageConfidence).toBeGreaterThanOrEqual(90);
    expect(layout.internalOcrAudit.lowConfidenceBlocksCount).toBe(0);

    console.log("=== [PHASE 3 GATE: TEXT-NATIVE PDF LAYOUT GRAPH] ===");
    console.log(`Document Type: ${layout.documentType}, Pages: ${layout.pageCount}, Total Words: ${layout.totalWords}`);
    console.log(`Page 1 Blocks Extracted: ${page1.blocks.length}, Tables: ${page1.tables.length}`);
    console.log(`First Block Bounding Box: [x=${page1.blocks[0].bbox.x}, y=${page1.blocks[0].bbox.y}, w=${page1.blocks[0].bbox.width}, h=${page1.blocks[0].bbox.height}] font=${page1.blocks[0].fontSizeEstimate}pt`);
  });

  it("2. Extracts layout graph from Scanned/Image PDF with OCR and internal low-confidence audit", async () => {
    const buffer = fs.readFileSync(scannedPdfPath);
    const layout = await extractLayoutGraph(buffer, "sample_scanned.pdf", "application/pdf");

    expect(layout.documentType).toBe("scanned-pdf");
    expect(layout.pageCount).toBe(1);

    const page1 = layout.pages[0];
    expect(page1.blocks.length).toBeGreaterThan(0);

    // Images preserved untouched
    expect(page1.images.length).toBeGreaterThan(0);
    expect(page1.images[0].preservedUnmodified).toBe(true);

    // Internal OCR low-confidence audit flags degraded blocks (<60% confidence)
    expect(layout.internalOcrAudit.lowConfidenceBlocksCount).toBeGreaterThan(0);
    expect(layout.internalOcrAudit.flaggedBlockIds.length).toBeGreaterThan(0);

    console.log("=== [PHASE 3 GATE: SCANNED PDF LAYOUT GRAPH] ===");
    console.log(`Document Type: ${layout.documentType}, Evaluated Blocks: ${layout.internalOcrAudit.evaluatedBlocksCount}`);
    console.log(`Internal Low-Confidence Flagged Count: ${layout.internalOcrAudit.lowConfidenceBlocksCount} (IDs: ${layout.internalOcrAudit.flaggedBlockIds.join(", ")})`);
    console.log(`Average OCR Confidence: ${layout.internalOcrAudit.averageConfidence}%`);
  });

  it("3. Extracts layout graph from Photographed JPG document with spatial coordinates", async () => {
    const buffer = fs.readFileSync(photoJpgPath);
    const layout = await extractLayoutGraph(buffer, "sample_diploma.jpg", "image/jpeg");

    expect(layout.documentType).toBe("image-document");
    expect(layout.pageCount).toBe(1);

    const page1 = layout.pages[0];
    expect(page1.width).toBe(600);
    expect(page1.height).toBe(450);
    expect(page1.blocks.length).toBeGreaterThan(0);

    // Root raster image preserved untouched
    expect(page1.images[0].preservedUnmodified).toBe(true);

    // Check low-confidence block detection
    expect(layout.internalOcrAudit.lowConfidenceBlocksCount).toBeGreaterThan(0);
    const flagged = page1.blocks.find((b) => b.isLowConfidence);
    expect(flagged).toBeDefined();
    expect(flagged?.confidence).toBeLessThan(60);

    console.log("=== [PHASE 3 GATE: PHOTOGRAPHED JPG LAYOUT GRAPH] ===");
    console.log(`Document Type: ${layout.documentType}, Dimensions: ${page1.width}x${page1.height}`);
    console.log(`Blocks Extracted: ${page1.blocks.length}`);
    console.log(`Flagged Low-Confidence Block: "${flagged?.text}" (Confidence: ${flagged?.confidence}%, bbox: [${flagged?.bbox.x}, ${flagged?.bbox.y}, ${flagged?.bbox.width}, ${flagged?.bbox.height}])`);
  });
});
