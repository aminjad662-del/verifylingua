import { describe, it, expect, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET as statusHandler } from "@/app/api/jobs/[id]/status/route";
import { GET as downloadHandler } from "@/app/api/jobs/[id]/download/route";
import { createTranslationJob, updateTranslationJob } from "@/lib/translation/store";

describe("Real Job Status & Download Telemetry Verification", () => {
  it("strictly returns HTTP 404 for nonexistent or legacy demo IDs like VL-DEMO1", async () => {
    const req = new NextRequest("http://localhost:3000/api/jobs/VL-DEMO1/status");
    const res = await statusHandler(req, {
      params: Promise.resolve({ id: "VL-DEMO1" }),
    });

    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.error).toContain("not found");
  });

  it("strictly returns HTTP 404 for random nonexistent job IDs", async () => {
    const req = new NextRequest("http://localhost:3000/api/jobs/NONEXISTENT_RANDOM_UUID_999/status");
    const res = await statusHandler(req, {
      params: Promise.resolve({ id: "NONEXISTENT_RANDOM_UUID_999" }),
    });

    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.error).toContain("not found");
  });

  it("resolves a real queued job created in the pipeline with true metadata", async () => {
    const realJob = createTranslationJob({
      fileName: "My_Real_Medical_Record.pdf",
      fileFormat: "pdf",
      fileSize: 10240,
      sourceLang: "fr",
      targetLang: "en",
      originalBuffer: Buffer.from("%PDF-1.4 test real document"),
    });

    const req = new NextRequest(`http://localhost:3000/api/jobs/${realJob.id}/status`);
    const res = await statusHandler(req, {
      params: Promise.resolve({ id: realJob.id }),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.jobId).toBe(realJob.id);
    expect(data.fileName).toBe("My_Real_Medical_Record.pdf");
    expect(data.sourceLang).toBe("fr");
    expect(data.targetLang).toBe("en");
    expect(data.status).toBe("queued");
  });

  it("resolves a real completed job and allows binary download with valid PDF headers", async () => {
    const realJob = createTranslationJob({
      fileName: "Court_Summons_Certified.pdf",
      fileFormat: "pdf",
      fileSize: 5000,
      sourceLang: "es",
      targetLang: "en",
      originalBuffer: Buffer.from("%PDF-1.4 real source binary"),
    });

    realJob.status = "completed";
    realJob.progress = 100;
    realJob.translatedBuffer = Buffer.from("%PDF-1.4 real translated binary content");
    updateTranslationJob(realJob);

    // Verify status endpoint
    const statusReq = new NextRequest(`http://localhost:3000/api/jobs/${realJob.id}/status`);
    const statusRes = await statusHandler(statusReq, {
      params: Promise.resolve({ id: realJob.id }),
    });
    expect(statusRes.status).toBe(200);
    const statusData = await statusRes.json();
    expect(statusData.status).toBe("completed");
    expect(statusData.progress).toBe(100);
    expect(statusData.fileName).toBe("Court_Summons_Certified.pdf");

    // Verify download endpoint
    const dlReq = new NextRequest(`http://localhost:3000/api/jobs/${realJob.id}/download`);
    const dlRes = await downloadHandler(dlReq, {
      params: Promise.resolve({ id: realJob.id }),
    });
    expect(dlRes.status).toBe(200);
    expect(dlRes.headers.get("Content-Type")).toBe("application/pdf");
    expect(dlRes.headers.get("Content-Disposition")).toContain('filename="VerifyLingua-Translation.pdf"');
  });
});
