import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { NextRequest } from "next/server";
import { POST as uploadHandler } from "../app/api/translate/upload/route";
import { GET as statusHandler } from "../app/api/translate/status/[jobId]/route";
import { GET as downloadHandler } from "../app/api/translate/download/[jobId]/route";
import { GET as previewHandler } from "../app/api/jobs/[id]/preview/route";
import { prisma } from "../lib/prisma";
import { grantWelcomeBonus } from "../lib/services/credit-service";
import fs from "fs";
import path from "path";

describe("Document Image Translation Multi-Step Flow", () => {
  let testUserId: string;
  const sampleImagePath = path.join(process.cwd(), "public", "samples", "worksheet-sample.jpg");

  beforeAll(async () => {
    const user = await prisma.user.create({
      data: {
        email: `image_trans_${Date.now()}@example.com`,
        creditsAvailable: 50,
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

  it("1. Public sample worksheet asset is available and readable", () => {
    expect(fs.existsSync(sampleImagePath)).toBe(true);
    const stat = fs.statSync(sampleImagePath);
    expect(stat.size).toBeGreaterThan(10000);
  });

  it("2. Uploads image document and initiates high-precision layout preservation pipeline", async () => {
    const imageBytes = fs.readFileSync(sampleImagePath);

    const formData = new FormData();
    const blob = new Blob([imageBytes], { type: "image/jpeg" });
    formData.append("file", blob, "beach_reading_worksheet.jpg");
    formData.append("sourceLang", "en");
    formData.append("targetLang", "es");
    formData.append("serviceTier", "automated");
    formData.append("userId", testUserId);

    const req = new NextRequest("http://localhost:3000/api/translate/upload", {
      method: "POST",
      body: formData,
    });

    const res = await uploadHandler(req);
    expect([200, 202]).toContain(res.status);

    const body = await res.json();
    expect(body.jobId).toBeTruthy();
    expect(body.fileName).toBe("beach_reading_worksheet.jpg");
    expect(body.fileFormat).toBe("jpg");
    expect(body.downloadToken).toBeTruthy();

    const jobId = body.jobId;
    const downloadToken = body.downloadToken;

    // 3. Status endpoint returns proper format and progress
    const statusReq = new NextRequest(`http://localhost:3000/api/translate/status/${jobId}`);
    const statusRes = await statusHandler(statusReq, {
      params: Promise.resolve({ jobId }),
    });

    expect(statusRes.status).toBe(200);
    const statusBody = await statusRes.json();
    expect(statusBody.jobId).toBe(jobId);
    expect(statusBody.fileFormat).toBe("jpg");
    expect(statusBody.targetLang).toBe("es");

    // Wait briefly for in-memory or mock processing to complete
    let pollAttempts = 0;
    let finalStatus = statusBody.status;
    while (finalStatus !== "ready" && finalStatus !== "completed" && finalStatus !== "failed" && pollAttempts < 25) {
      await new Promise((r) => setTimeout(r, 200));
      const pollRes = await statusHandler(statusReq, {
        params: Promise.resolve({ jobId }),
      });
      const pollBody = await pollRes.json();
      finalStatus = pollBody.status;
      pollAttempts++;
    }

    expect(["ready", "completed"]).toContain(finalStatus);

    // 4. Download endpoint with ?inline=true serves image inline
    const inlineDownloadReq = new NextRequest(
      `http://localhost:3000/api/translate/download/${jobId}?token=${downloadToken}&inline=true&userId=${testUserId}`
    );
    const inlineRes = await downloadHandler(inlineDownloadReq, {
      params: Promise.resolve({ jobId }),
    });

    expect(inlineRes.status).toBe(200);
    expect(inlineRes.headers.get("content-type")).toMatch(/image\/(jpeg|png)/);
    expect(inlineRes.headers.get("content-disposition")).toContain("inline");

    // 5. Download endpoint without inline parameter serves attachment with .jpg filename
    const directDownloadReq = new NextRequest(
      `http://localhost:3000/api/translate/download/${jobId}?token=${downloadToken}&userId=${testUserId}`
    );
    const directRes = await downloadHandler(directDownloadReq, {
      params: Promise.resolve({ jobId }),
    });

    expect(directRes.status).toBe(200);
    expect(directRes.headers.get("content-type")).toMatch(/image\/(jpeg|png)/);
    const disposition = directRes.headers.get("content-disposition");
    expect(disposition).toContain("attachment");
    expect(disposition).toMatch(/\.jpg|\.png/);
    expect(disposition).not.toContain(".pdf");

    // 6. Preview endpoint serves translated image
    const previewReq = new NextRequest(`http://localhost:3000/api/jobs/${jobId}/preview`);
    const previewRes = await previewHandler(previewReq, {
      params: Promise.resolve({ id: jobId }),
    });

    expect(previewRes.status).toBe(200);
    expect(previewRes.headers.get("content-type")).toMatch(/image\/(jpeg|png)/);
    expect(previewRes.headers.get("content-disposition")).toContain("inline");
  });
});
