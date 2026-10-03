import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST as uploadRouteHandler } from "../app/api/upload/route";
import { POST as translateUploadHandler } from "../app/api/translate/upload/route";
import { GET as jobStatusHandler } from "../app/api/jobs/[id]/status/route";
import { prisma } from "../lib/prisma";
import fs from "fs";
import path from "path";

describe("Directive: Fix Ghost ID & 404 Upload Sync", () => {
  let testUserId: string;
  const samplePdfPath = path.join(process.cwd(), "fixtures", "sample_birth_cert.pdf");
  const samplePdfBytes = fs.readFileSync(samplePdfPath);

  function createUniquePdfBuffer(): Buffer {
    return Buffer.concat([
      samplePdfBytes,
      Buffer.from(`\n% UploadSyncMarker: ${Date.now()}-${Math.random()}\n`),
    ]);
  }

  beforeAll(async () => {
    const user = await prisma.user.create({
      data: {
        email: `upload_sync_${Date.now()}@example.com`,
        creditsAvailable: 50,
        creditsReserved: 0,
        lifetimePagesUsed: 0,
      },
    });
    testUserId = user.id;
  });

  afterAll(async () => {
    if (testUserId) {
      try {
        await prisma.creditTransaction.deleteMany({ where: { userId: testUserId } });
        await prisma.translationJob.deleteMany({ where: { userId: testUserId } });
        await prisma.user.delete({ where: { id: testUserId } });
      } catch {}
    }
  });

  describe("1. Upload API (app/api/upload/route.ts) Strict Database Persistence", () => {
    it("explicitly awaits INSERT into Supabase/PostgreSQL database and returns real confirmed ID", async () => {
      const fileBytes = createUniquePdfBuffer();
      const form = new FormData();
      form.append("file", new Blob([new Uint8Array(fileBytes)], { type: "application/pdf" }), "my_official_cert.pdf");
      form.append("sourceLang", "es");
      form.append("targetLang", "en");
      form.append("userId", testUserId);

      const req = new NextRequest("http://localhost:3000/api/upload", {
        method: "POST",
        body: form,
      });

      const res = await uploadRouteHandler(req);
      expect(res.status).toBe(201);

      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.jobId).toBeDefined();
      expect(data.fileUrl).toBeDefined();

      // Verify the record was genuinely persisted in the database BEFORE return
      const dbRow = await prisma.translationJob.findUnique({
        where: { id: data.jobId },
      });

      expect(dbRow).not.toBeNull();
      expect(dbRow!.id).toBe(data.jobId);
      expect(dbRow!.sourceFilename).toBe("my_official_cert.pdf");
      expect(dbRow!.sourceLanguage).toBe("es");
      expect(dbRow!.targetLanguage).toBe("en");
      expect(dbRow!.status).toBe("queued");

      // Cleanup
      await prisma.translationJob.delete({ where: { id: data.jobId } });
    });

    it("does NOT return { jobId } and returns HTTP 500 when Supabase database insert fails", async () => {
      const fileBytes = createUniquePdfBuffer();
      const form = new FormData();
      form.append("file", new Blob([new Uint8Array(fileBytes)], { type: "application/pdf" }), "failing_doc.pdf");
      form.append("sourceLang", "fr");
      form.append("targetLang", "en");
      form.append("userId", testUserId);

      // Mock prisma.translationJob.create to simulate database insert failure
      const originalCreate = prisma.translationJob.create;
      (prisma.translationJob as any).create = vi.fn().mockRejectedValue(new Error("Connection to Supabase timed out / constraint violation"));

      try {
        const req = new NextRequest("http://localhost:3000/api/upload", {
          method: "POST",
          body: form,
        });

        const res = await uploadRouteHandler(req);

        // Requirement 2 & 3: Must NOT return { jobId } on failure, MUST return 500
        expect(res.status).toBe(500);
        const data = await res.json();
        expect(data.success).toBe(false);
        expect(data.error).toBe("DATABASE_INSERT_FAILED");
        expect(data.jobId).toBeUndefined();
      } finally {
        (prisma.translationJob as any).create = originalCreate;
      }
    });

    it("rejects empty or corrupt uploads with 400 error", async () => {
      const form = new FormData();
      form.append("file", new Blob([new Uint8Array([])], { type: "application/pdf" }), "empty.pdf");

      const req = new NextRequest("http://localhost:3000/api/upload", {
        method: "POST",
        body: form,
      });

      const res = await uploadRouteHandler(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBeDefined();
    });
  });

  describe("2. Translation Upload API (app/api/translate/upload/route.ts) Error Enforcement", () => {
    it("does NOT return { jobId } and returns HTTP 500 when database insert fails", async () => {
      const fileBytes = createUniquePdfBuffer();
      const form = new FormData();
      form.append("file", new Blob([new Uint8Array(fileBytes)], { type: "application/pdf" }), "db_failure_test.pdf");
      form.append("sourceLang", "de");
      form.append("targetLang", "en");
      form.append("userId", testUserId);

      // Mock prisma.translationJob.create to simulate database insert failure
      const originalCreate = prisma.translationJob.create;
      (prisma.translationJob as any).create = vi.fn().mockRejectedValue(new Error("Postgres connection failure: Supabase unreachable"));

      try {
        const req = new NextRequest("http://localhost:3000/api/translate/upload", {
          method: "POST",
          body: form,
        });

        const res = await translateUploadHandler(req);

        // Requirement 2 & 3: Must NOT return { jobId } on failure, MUST return 500
        expect(res.status).toBe(500);
        const data = await res.json();
        expect(data.success).toBe(false);
        expect(data.error).toBe("DATABASE_INSERT_FAILED");
        expect(data.jobId).toBeUndefined();
      } finally {
        (prisma.translationJob as any).create = originalCreate;
      }
    });
  });

  describe("3. Database Alignment with TrackerClient (/api/jobs/[id]/status)", () => {
    it("TrackerClient status API resolves the exact record inserted by Upload API", async () => {
      // Step A: Upload file via upload API
      const fileBytes = createUniquePdfBuffer();
      const form = new FormData();
      form.append("file", new Blob([new Uint8Array(fileBytes)], { type: "application/pdf" }), "tracker_sync_doc.pdf");
      form.append("sourceLang", "es");
      form.append("targetLang", "en");
      form.append("userId", testUserId);

      const uploadReq = new NextRequest("http://localhost:3000/api/upload", {
        method: "POST",
        body: form,
      });

      const uploadRes = await uploadRouteHandler(uploadReq);
      expect(uploadRes.status).toBe(201);
      const uploadData = await uploadRes.json();
      const confirmedJobId = uploadData.jobId;

      // Step B: Simulate TrackerClient polling the status endpoint
      const trackerReq = new NextRequest(`http://localhost:3000/api/jobs/${confirmedJobId}/status`, {
        headers: { "x-user-id": testUserId },
      });

      const statusRes = await jobStatusHandler(trackerReq, {
        params: Promise.resolve({ id: confirmedJobId }),
      });

      expect(statusRes.status).toBe(200);
      const statusData = await statusRes.json();

      expect(statusData.jobId).toBe(confirmedJobId);
      expect(statusData.fileName).toBe("tracker_sync_doc.pdf");
      expect(statusData.sourceLang).toBe("es");
      expect(statusData.targetLang).toBe("en");
      expect(statusData.status).toBe("queued");

      // Cleanup
      await prisma.translationJob.delete({ where: { id: confirmedJobId } });
    });

    it("returns HTTP 404 for ghost or nonexistent IDs, preventing false positives", async () => {
      const ghostId = "ord_ghost_nonexistent_999";
      const trackerReq = new NextRequest(`http://localhost:3000/api/jobs/${ghostId}/status`);

      const statusRes = await jobStatusHandler(trackerReq, {
        params: Promise.resolve({ id: ghostId }),
      });

      expect(statusRes.status).toBe(404);
      const statusData = await statusRes.json();
      expect(statusData.error).toContain("not found");
    });
  });

  describe("4. Frontend Error Catching Audit", () => {
    it("ensures app/translate/page.tsx catches 500 errors and triggers user alert rather than dead redirect", () => {
      const pagePath = path.resolve(process.cwd(), "app/translate/page.tsx");
      const content = fs.readFileSync(pagePath, "utf-8");

      expect(content).toContain("uploadRes.status >= 500");
      expect(content).toContain("DATABASE_INSERT_FAILED");
      expect(content).toContain("alert(");
      // Ensure targetJobId validation prevents undefined/null redirects
      expect(content).toContain("targetJobId === \"undefined\"");
    });

    it("ensures app/app/new-translation/page.tsx catches 500 errors and triggers user alert", () => {
      const pagePath = path.resolve(process.cwd(), "app/app/new-translation/page.tsx");
      const content = fs.readFileSync(pagePath, "utf-8");

      expect(content).toContain("res.status >= 500");
      expect(content).toContain("DATABASE_INSERT_FAILED");
      expect(content).toContain("alert(");
    });

    it("ensures app/order/checkout/page.tsx catches 500 errors and triggers user alert", () => {
      const pagePath = path.resolve(process.cwd(), "app/order/checkout/page.tsx");
      const content = fs.readFileSync(pagePath, "utf-8");

      expect(content).toContain("res.status >= 500");
      expect(content).toContain("DATABASE_INSERT_FAILED");
      expect(content).toContain("alert(");
    });
  });
});
