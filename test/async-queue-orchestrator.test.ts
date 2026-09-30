import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { NextRequest } from "next/server";
import { POST as uploadHandler } from "../app/api/translate/upload/route";
import { GET as liveStatusHandler } from "../app/api/jobs/[id]/status/route";
import { GET as translateStatusHandler } from "../app/api/translate/status/[jobId]/route";
import { prisma } from "../lib/prisma";
import { grantWelcomeBonus, getUserCreditBalance } from "../lib/services/credit-service";
import fs from "fs";
import path from "path";

describe("PHASE 4: Asynchronous Background Queues, Resilience & Live Status Polling", () => {
  let testUserId: string;
  const samplePdfPath = path.join(process.cwd(), "fixtures", "sample_birth_cert.pdf");
  const baseFileBytes = fs.readFileSync(samplePdfPath);

  function getUniquePdfBuffer(): Buffer {
    return Buffer.concat([
      baseFileBytes,
      Buffer.from(`\n% Test Marker: ${Date.now()}-${Math.random()}\n`),
    ]);
  }

  beforeAll(async () => {
    const user = await prisma.user.create({
      data: {
        email: `async_queue_test_${Date.now()}@example.com`,
        creditsAvailable: 20,
        creditsReserved: 0,
        lifetimePagesUsed: 0,
      },
    });
    testUserId = user.id;
    await grantWelcomeBonus(testUserId);
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

  it("1. Upload Route Performance: Returns HTTP 202 Accepted in under 2 seconds with status: 'queued'", async () => {
    const fileBytes = getUniquePdfBuffer();
    const form = new FormData();
    form.append("file", new Blob([new Uint8Array(fileBytes)], { type: "application/pdf" }), "sample_birth_cert.pdf");
    form.append("sourceLang", "en");
    form.append("targetLang", "de");
    form.append("userId", testUserId);

    const startTime = Date.now();
    const req = new NextRequest("http://localhost:3000/api/translate/upload", {
      method: "POST",
      body: form,
    });

    const res = await uploadHandler(req);
    const durationMs = Date.now() - startTime;

    expect(res.status).toBe(202);
    expect(durationMs).toBeLessThan(2000); // Strict requirement: execution time < 2 seconds

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.jobId).toBeDefined();
    expect(body.status).toBe("queued");
    expect(body.downloadToken).toBeDefined();
  });

  it("2. Live Status Polling (/api/jobs/[id]/status): Tracks granular state, progress, and artifactUrl on completion", async () => {
    const fileBytes = getUniquePdfBuffer();
    const form = new FormData();
    form.append("file", new Blob([new Uint8Array(fileBytes)], { type: "application/pdf" }), "sample_birth_cert.pdf");
    form.append("sourceLang", "en");
    form.append("targetLang", "fr");
    form.append("userId", testUserId);

    const req = new NextRequest("http://localhost:3000/api/translate/upload", {
      method: "POST",
      body: form,
    });

    const res = await uploadHandler(req);
    expect(res.status).toBe(202);
    const { jobId, downloadToken } = await res.json();

    // Poll live status endpoint
    let attempts = 0;
    let finalStatus = "";
    let finalArtifactUrl = null;
    const observedPhases = new Set<string>();

    while (attempts < 50) {
      await new Promise((r) => setTimeout(r, 100));
      const sReq = new NextRequest(`http://localhost:3000/api/jobs/${jobId}/status?userId=${testUserId}`, {
        headers: { "x-user-id": testUserId },
      });
      const sRes = await liveStatusHandler(sReq, { params: Promise.resolve({ id: jobId }) });
      expect(sRes.status).toBe(200);

      const sBody = await sRes.json();
      observedPhases.add(sBody.status);
      expect(sBody.jobId).toBe(jobId);
      expect(sBody.progress).toBeGreaterThanOrEqual(0);
      expect(sBody.progress).toBeLessThanOrEqual(100);

      if (sBody.status === "completed" || sBody.status === "ready" || sBody.status === "failed") {
        finalStatus = sBody.status;
        finalArtifactUrl = sBody.artifactUrl;
        break;
      }
      attempts++;
    }

    expect(["completed", "ready"]).toContain(finalStatus);
    expect(finalArtifactUrl).toContain(`/api/jobs/${jobId}/download?token=${downloadToken}`);
  });

  it("3. Error Handling & Credit Refund: Failed job updates status to 'failed' and releases reserved credits", async () => {
    const initialBalance = await getUserCreditBalance(testUserId);
    const fileBytes = getUniquePdfBuffer();

    // Upload with simulated failure flag
    const form = new FormData();
    form.append("file", new Blob([new Uint8Array(fileBytes)], { type: "application/pdf" }), "sample_failing.pdf");
    form.append("sourceLang", "en");
    form.append("targetLang", "de");
    form.append("userId", testUserId);
    form.append("simulateError", "Simulated unrecoverable OCR neural model fault");

    const req = new NextRequest("http://localhost:3000/api/translate/upload", {
      method: "POST",
      body: form,
    });

    const res = await uploadHandler(req);
    expect(res.status).toBe(202);
    const { jobId } = await res.json();

    // Poll until failed status is verified
    let attempts = 0;
    let statusBody: any = null;
    while (attempts < 30) {
      await new Promise((r) => setTimeout(r, 50));
      const sReq = new NextRequest(`http://localhost:3000/api/jobs/${jobId}/status?userId=${testUserId}`, {
        headers: { "x-user-id": testUserId },
      });
      const sRes = await liveStatusHandler(sReq, { params: Promise.resolve({ id: jobId }) });
      statusBody = await sRes.json();
      if (statusBody.status === "failed") break;
      attempts++;
    }

    expect(statusBody.status).toBe("failed");
    expect(statusBody.error).toContain("Simulated unrecoverable OCR");

    // Reserved credits must be refunded in full back to available balance
    const balanceAfter = await getUserCreditBalance(testUserId);
    expect(balanceAfter.available).toBe(initialBalance.available);
    expect(balanceAfter.reserved).toBe(0);
  });
});
