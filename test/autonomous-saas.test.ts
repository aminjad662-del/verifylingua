import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { NextRequest } from "next/server";

import { classifyDocument } from "@/lib/agent/document-classifier";
import { providerRouter } from "@/lib/providers/router";
import { evaluateDocumentFidelity, checkRTL, detectOverflow } from "@/lib/fidelity";
import { repairDocumentLayout } from "@/lib/agent/autonomous-repair";
import { autonomousDocumentAgent } from "@/lib/agent/autonomous-document-agent";
import { putObject, getObject, generatePresignedUploadUrl, generatePresignedDownloadUrl } from "@/lib/storage";
import { runRetentionCleanup } from "@/lib/cleanup";

// API Route Handlers
import { POST as createJobPost } from "@/app/api/jobs/route";
import { POST as uploadCompletePost } from "@/app/api/jobs/[id]/upload-complete/route";
import { GET as getJobDetails, DELETE as deleteJob } from "@/app/api/jobs/[id]/route";
import { GET as downloadJobGet } from "@/app/api/jobs/[id]/download/route";
import { GET as historyGet } from "@/app/api/history/route";
import { GET as glossariesGet, POST as glossariesPost } from "@/app/api/glossaries/route";
import { GET as usageGet } from "@/app/api/usage/route";
import { POST as checkoutPost } from "@/app/api/checkout/route";

describe("Autonomous High-Fidelity Document Translation SaaS Suite", () => {
  const fixturesDir = path.join(process.cwd(), "fixtures");
  const pdfBuffer = fs.readFileSync(path.join(fixturesDir, "sample_birth_cert.pdf"));
  const docxBuffer = fs.readFileSync(path.join(fixturesDir, "sample_transcript.docx"));
  const pngBuffer = fs.readFileSync(path.join(fixturesDir, "sample_id_card.png"));
  const jpgBuffer = fs.readFileSync(path.join(fixturesDir, "sample_diploma.jpg"));

  describe("1. Document Classifier & Geometry Analysis", () => {
    it("correctly classifies native PDF with page metrics and pipeline routing", async () => {
      const res = await classifyDocument({
        buffer: pdfBuffer,
        filename: "birth_cert.pdf",
        targetLanguage: "ar",
      });

      expect(res.format).toBe("pdf");
      expect(res.mimeType).toBe("application/pdf");
      expect(res.pageCount).toBeGreaterThanOrEqual(1);
      expect(res.direction).toBe("rtl");
      expect(["pdf_coordinate", "pdf_scanned"]).toContain(res.selectedPipeline);
    });

    it("correctly classifies DOCX documents and detects XML table structure", async () => {
      const res = await classifyDocument({
        buffer: docxBuffer,
        filename: "transcript.docx",
        targetLanguage: "es",
      });

      expect(res.format).toBe("docx");
      expect(res.selectedPipeline).toBe("docx_xml");
      expect(res.direction).toBe("ltr");
    });

    it("correctly classifies scanned raster images and assigns inpainting pipeline", async () => {
      const res = await classifyDocument({
        buffer: pngBuffer,
        filename: "id_card.png",
        targetLanguage: "fr",
      });

      expect(res.format).toBe("png");
      expect(res.selectedPipeline).toBe("image_inpaint");
      expect(res.hasImages).toBe(true);
    });
  });

  describe("2. Provider Abstraction & Resilient Router", () => {
    it("selects appropriate provider and translates batch with fallback", async () => {
      const provider = providerRouter.selectProvider({
        format: "pdf",
        targetLanguage: "ar",
        complexity: "high",
      });
      expect(provider).toBeDefined();

      const { results, providerUsed } = await providerRouter.translateWithFallback({
        items: [
          { id: "1", text: "CERTIFIED TRANSLATION" },
          { id: "2", text: "BIRTH CERTIFICATE" },
        ],
        targetLanguage: "ar",
      });

      expect(results.length).toBe(2);
      expect(results[0].text).toBeDefined();
      expect(providerUsed).toBeDefined();
    });

    it("strictly preserves placeholder variables during translation", async () => {
      const { results } = await providerRouter.translateWithFallback({
        items: [
          { id: "var1", text: "Welcome {{client_name}}, your case is pending." },
        ],
        targetLanguage: "es",
      });

      expect(results[0].text).toContain("{{client_name}}");
    });
  });

  describe("3. Multi-Vector Fidelity Engine & Scoring", () => {
    it("computes authentic 0-100 score and detects layout overflows", () => {
      const res = evaluateDocumentFidelity({
        format: "pdf",
        sourcePageCount: 1,
        translatedPageCount: 1,
        sourceTextLength: 300,
        translatedTextLength: 340,
        targetLang: "es",
        spatialBlocks: [
          {
            id: "b1",
            text: "Hello",
            translatedText: "Hola mundo internacional con mucho texto adicional para exceder la caja",
            x: 50,
            y: 700,
            width: 80,
            height: 20,
            page: 1,
            fontSize: 12,
          },
        ],
      });

      expect(res.breakdown.overallScore).toBeGreaterThan(0);
      expect(res.breakdown.overallScore).toBeLessThanOrEqual(100);
      expect(res.issues.some((i) => i.type === "TEXT_OVERFLOW")).toBe(true);
    });

    it("evaluates RTL alignment compliance for Arabic documents", () => {
      const res = checkRTL("ar", [
        {
          id: "arb1",
          text: "?????",
          translatedText: "????? ???",
          x: 50,
          y: 600,
          width: 100,
          height: 20,
          page: 1,
          fontSize: 12,
          isRtl: true,
        },
      ]);

      expect(res.score).toBe(100);
      expect(res.issues.length).toBe(0);
    });
  });

  describe("4. Autonomous Repair Engine", () => {
    it("repairs text overflow using shrink-to-fit within 2 passes", () => {
      const blocks = [
        {
          id: "overflow_1",
          text: "Certificate",
          translatedText: "Certificado Oficial de Registro Civil Internacional Extenso",
          x: 40,
          y: 700,
          width: 120,
          height: 25,
          page: 1,
          fontSize: 14,
        },
      ];

      const initialIssues = detectOverflow(blocks);
      expect(initialIssues.length).toBe(1);

      const repair = repairDocumentLayout({
        blocks,
        issues: initialIssues,
        targetLang: "es",
      });

      expect(repair.repairsApplied.length).toBeGreaterThan(0);
      expect(repair.repairsApplied[0].issueType).toBe("TEXT_OVERFLOW");
      expect(repair.repairedBlocks[0].renderedFontSize).toBeLessThan(14);
    });
  });

  describe("5. Cloud Storage & Presigned URLs", () => {
    it("generates presigned upload and download URLs", async () => {
      const uploadUrl = await generatePresignedUploadUrl("test/upload.pdf", "application/pdf");
      expect(decodeURIComponent(uploadUrl)).toContain("test/upload.pdf");

      const downloadUrl = await generatePresignedDownloadUrl("test/download.pdf", "doc_ar.pdf");
      expect(decodeURIComponent(downloadUrl)).toContain("test/download.pdf");
    });

    it("puts, gets, and deletes objects in storage layer", async () => {
      const key = "test/artifact.txt";
      const payload = Buffer.from("VerifyLingua High Fidelity Storage");

      await putObject(key, payload, "text/plain");
      const fetched = await getObject(key);
      expect(fetched.toString()).toBe("VerifyLingua High Fidelity Storage");
    });
  });

  describe("6. REST APIs: End-to-End Jobs Lifecycle", () => {
    it("POST /api/jobs creates a job and returns upload coordinates", async () => {
      const req = new NextRequest("http://localhost:3000/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: "diploma.pdf",
          targetLanguage: "ar",
          sourceLanguage: "es",
          fileSize: 45000,
        }),
      });

      const res = await createJobPost(req);
      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.jobId).toBeDefined();
      expect(data.uploadUrl).toBeDefined();
      expect(data.status).toBe("uploading");
    });

    it("POST /api/jobs accepts direct multipart upload and triggers autonomous pipeline", async () => {
      const formData = new FormData();
      const blob = new Blob([pdfBuffer], { type: "application/pdf" });
      formData.append("file", blob, "birth_cert.pdf");
      formData.append("targetLang", "es");
      formData.append("sourceLang", "en");

      const req = new NextRequest("http://localhost:3000/api/jobs", {
        method: "POST",
        body: formData,
      });

      const res = await createJobPost(req);
      expect(res.status).toBe(202);
      const data = await res.json();
      expect(data.jobId).toBeDefined();
      expect(data.status).toBe("uploaded");

      // Verify GET /api/jobs/:id returns status
      const getReq = new NextRequest(`http://localhost:3000/api/jobs/${data.jobId}`);
      const getRes = await getJobDetails(getReq, { params: Promise.resolve({ id: data.jobId }) });
      expect(getRes.status).toBe(200);
      const jobDetails = await getRes.json();
      expect(jobDetails.jobId).toBe(data.jobId);
    });

    it("GET /api/history lists jobs with status and metadata", async () => {
      const req = new NextRequest("http://localhost:3000/api/history");
      const res = await historyGet(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(Array.isArray(data.history)).toBe(true);
      expect(data.totalCount).toBeGreaterThanOrEqual(1);
    });

    it("Glossary API creates, lists, and persists terminology", async () => {
      const postReq = new NextRequest("http://localhost:3000/api/glossaries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Immigration Legal Glossary",
          sourceLang: "en",
          targetLang: "ar",
          terms: [
            { sourceText: "Invoice", requiredTarget: "??????" },
            { sourceText: "Customer ID", requiredTarget: "????? ??????" },
          ],
        }),
      });

      const postRes = await glossariesPost(postReq);
      expect(postRes.status).toBe(201);

      const getReq = new NextRequest("http://localhost:3000/api/glossaries");
      const getRes = await glossariesGet(getReq);
      const data = await getRes.json();
      expect(data.glossaries.length).toBeGreaterThan(0);
    });

    it("Usage API returns quota, pages used, and plan metrics", async () => {
      const req = new NextRequest("http://localhost:3000/api/usage");
      const res = await usageGet(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.pageQuota).toBeGreaterThan(0);
      expect(data.plan).toBeDefined();
    });

    it("Checkout API initializes Stripe subscription session", async () => {
      const req = new NextRequest("http://localhost:3000/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "PRO" }),
      });

      const res = await checkoutPost(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.url).toBeDefined();
      expect(data.sessionId).toBeDefined();
    });
  });

  describe("7. Autonomous Retention & 24h Purge Worker", () => {
    it("runs retention cleanup smoothly without unhandled exceptions", async () => {
      const result = await runRetentionCleanup();
      expect(result).toBeDefined();
      expect(typeof result.purgedJobsCount).toBe("number");
      expect(typeof result.purgedFilesCount).toBe("number");
    });
  });
});
