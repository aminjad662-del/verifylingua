import { describe, it, expect } from "vitest";
import { PDFDocument } from "pdf-lib";
import { Jimp } from "jimp";
import fs from "fs";
import path from "path";
import { ReconstructionAgent, convertImageToPdfWithTranslation } from "../lib/agents/06_renderer";
import { NextRequest } from "next/server";
import { GET as downloadJobHandler } from "../app/api/jobs/[id]/download/route";
import { updateTranslationJob } from "../lib/translation/store";

describe("Precision Image-to-PDF Conversion & Download Binary Integrity", () => {
  // Helper to generate a minimal valid 200x150 PNG image buffer using Jimp
  async function createTestImageBuffer(format: "png" | "jpeg" = "png"): Promise<Buffer> {
    const img = new Jimp({ width: 200, height: 150, color: 0xffffffff });
    // Draw simple colored pixel pattern
    for (let x = 10; x < 50; x++) {
      for (let y = 10; y < 50; y++) {
        img.setPixelColor(0x0000ffff, x, y); // Blue square
      }
    }
    const mime = format === "png" ? "image/png" : "image/jpeg";
    return await img.getBuffer(mime as any);
  }

  describe("1. 06_renderer.ts: Image-to-PDF Conversion", () => {
    it("converts a PNG image input into a completely new, valid PDF matching image dimensions", async () => {
      const pngBuffer = await createTestImageBuffer("png");
      const agent = new ReconstructionAgent();

      const result = await agent.execute({
        originalBuffer: pngBuffer,
        translatedBlocks: [
          {
            id: "blk-1",
            pageNumber: 1,
            box2d: [10, 10, 50, 100],
            originalText: "Hello World",
            translatedText: "Hola Mundo",
            fontSizeTier: "heading",
            align: "left",
          },
        ],
        targetLang: "es",
      });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.format).toBe("pdf");

      const pdfBytes = result.data!.renderedBuffer;
      expect(pdfBytes.length).toBeGreaterThan(100);

      // Verify %PDF magic header
      expect(pdfBytes.subarray(0, 4).toString("ascii")).toBe("%PDF");

      // Verify PDF can be loaded cleanly by pdf-lib without corruption
      const loadedPdf = await PDFDocument.load(pdfBytes);
      expect(loadedPdf.getPageCount()).toBe(1);

      const page = loadedPdf.getPage(0);
      expect(page.getWidth()).toBe(200);
      expect(page.getHeight()).toBe(150);
    });

    it("converts a JPEG image input into a valid PDF matching dimensions via convertImageToPdfWithTranslation", async () => {
      const jpgBuffer = await createTestImageBuffer("jpeg");

      const pdfBytes = await convertImageToPdfWithTranslation(
        jpgBuffer,
        [
          {
            id: "blk-jpg",
            pageNumber: 1,
            box2d: [20, 20, 40, 120],
            originalText: "Certified Document",
            translatedText: "Documento Certificado",
            fontSizeTier: "body",
            align: "left",
          },
        ],
        "es"
      );

      expect(pdfBytes.length).toBeGreaterThan(100);
      const header = Buffer.from(pdfBytes.subarray(0, 4)).toString("ascii");
      expect(header).toBe("%PDF");

      const loadedPdf = await PDFDocument.load(pdfBytes);
      expect(loadedPdf.getPageCount()).toBe(1);
      const page = loadedPdf.getPage(0);
      expect(page.getWidth()).toBe(200);
      expect(page.getHeight()).toBe(150);
    });
  });

  describe("2. Download API: Binary Integrity & Header Verification", () => {
    it("returns raw binary PDF with exact required headers from /api/jobs/[id]/download", async () => {
      // Create a test job in memory with an image buffer (which must be dynamically converted to valid PDF)
      const rawImage = await createTestImageBuffer("png");
      const jobId = `test_job_${Date.now()}`;

      updateTranslationJob({
        id: jobId,
        fileName: "passport_scan.png",
        fileFormat: "png",
        fileSize: rawImage.length,
        sourceLang: "es",
        targetLang: "en",
        status: "ready",
        progress: 100,
        currentStep: "Certified translation complete.",
        originalBuffer: rawImage,
        translatedBuffer: rawImage,
        createdAt: new Date().toISOString(),
        downloadToken: `tok_${jobId}`,
        tokenExpiresAt: new Date(Date.now() + 86400000).toISOString(),
        pageCount: 1,
      });

      const req = new NextRequest(`http://localhost:3000/api/jobs/${jobId}/download?token=tok_${jobId}`, {
        headers: { "x-user-id": "test-user" },
      });

      const response = await downloadJobHandler(req, {
        params: Promise.resolve({ id: jobId }),
      });

      expect(response.status).toBe(200);

      // Verify exact required headers
      expect(response.headers.get("Content-Type")).toBe("application/pdf");
      expect(response.headers.get("Content-Disposition")).toBe('inline; filename="VerifyLingua-Translation.pdf"');

      // Verify response binary is a valid PDF
      const arrayBuf = await response.arrayBuffer();
      const resBytes = Buffer.from(arrayBuf);
      expect(resBytes.subarray(0, 4).toString("ascii")).toBe("%PDF");

      const loadedPdf = await PDFDocument.load(resBytes);
      expect(loadedPdf.getPageCount()).toBe(1);
    });

    it("returns a valid PDF for a real completed job without corrupted xref offsets", async () => {
      const { createTranslationJob, updateTranslationJob } = await import("@/lib/translation/store");
      const pdfDoc = await PDFDocument.create();
      pdfDoc.addPage([600, 800]);
      const pdfBytes = Buffer.from(await pdfDoc.save());

      const realJob = createTranslationJob({
        id: "VL-PDF-DL-TEST1",
        fileName: "Downloaded_Doc.pdf",
        fileFormat: "pdf",
        fileSize: pdfBytes.length,
        sourceLang: "es",
        targetLang: "en",
        originalBuffer: pdfBytes,
      });
      realJob.status = "completed";
      realJob.translatedBuffer = pdfBytes;
      updateTranslationJob(realJob);

      const req = new NextRequest(`http://localhost:3000/api/jobs/${realJob.id}/download`);
      const response = await downloadJobHandler(req, {
        params: Promise.resolve({ id: realJob.id }),
      });

      expect(response.status).toBe(200);
      expect(response.headers.get("Content-Type")).toBe("application/pdf");
      expect(response.headers.get("Content-Disposition")).toBe('inline; filename="VerifyLingua-Translation.pdf"');

      const arrayBuf = await response.arrayBuffer();
      const resBytes = Buffer.from(arrayBuf);
      expect(resBytes.subarray(0, 4).toString("ascii")).toBe("%PDF");

      const loadedPdf = await PDFDocument.load(resBytes);
      expect(loadedPdf.getPageCount()).toBe(1);
    });
  });

  describe("3. Frontend Tracker: Zero Mock Progression Audit", () => {
    it("ensures TrackerClient.tsx contains no simulated progression arrays or fake countdown loops", () => {
      const trackerPath = path.resolve(process.cwd(), "app/tracker/[id]/TrackerClient.tsx");
      const content = fs.readFileSync(trackerPath, "utf-8");

      // Verify no simulated array iterations or fake intervals
      expect(content).not.toContain("autoCompleteCountdown");
      expect(content).not.toContain("setTranslationProgress(52)");
      expect(content).not.toContain("setTranslationProgress(78)");
      expect(content).not.toContain("setTranslationProgress(91)");

      // Verify it polls the genuine status API
      expect(content).toContain("/api/jobs/${encodeURIComponent(resolvedId)}/status");
    });

    it("ensures OrderTrackingClient.tsx contains no simulated countdown timers", () => {
      const orderTrackerPath = path.resolve(process.cwd(), "app/order/[id]/OrderTrackingClient.tsx");
      const content = fs.readFileSync(orderTrackerPath, "utf-8");

      expect(content).not.toContain("autoCompleteCountdown");
      expect(content).not.toContain("Draft ready in");
      expect(content).not.toContain("setTranslationProgress(52)");
      expect(content).toContain("/api/jobs/${encodeURIComponent(publicCode)}/status");
    });
  });
});
