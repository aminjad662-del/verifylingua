import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { GET as statusHandler } from "@/app/api/jobs/[id]/status/route";
import { GET as downloadHandler } from "@/app/api/jobs/[id]/download/route";

describe("Demo Job Status & Download Telemetry Verification", () => {
  it("resolves VL-DEMO1 status with complete certified translation metadata (HTTP 200)", async () => {
    const req = new NextRequest("http://localhost:3000/api/jobs/VL-DEMO1/status");
    const res = await statusHandler(req, {
      params: Promise.resolve({ id: "VL-DEMO1" }),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.jobId).toBe("VL-DEMO1");
    expect(data.status).toBe("completed");
    expect(data.progress).toBe(100);
    expect(data.fileName).toBe("Acta_De_Nacimiento_Jalisco.pdf");
    expect(data.sourceLang).toBe("es");
    expect(data.targetLang).toBe("en");
    expect(data.pageCount).toBe(1);
    expect(data.downloadUrl).toContain("/api/jobs/VL-DEMO1/download");
    expect(data.qualityGate.isValidFormat).toBe(true);
  });

  it("resolves counsel demo matter VL-8921-XQ status (HTTP 200)", async () => {
    const req = new NextRequest("http://localhost:3000/api/jobs/VL-8921-XQ/status");
    const res = await statusHandler(req, {
      params: Promise.resolve({ id: "VL-8921-XQ" }),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.jobId).toBe("VL-8921-XQ");
    expect(data.status).toBe("completed");
    expect(data.progress).toBe(100);
    expect(data.fileName).toBe("Acta_De_Nacimiento_Oficial.pdf");
  });

  it("resolves doctoral transcripts demo VL-9104-MN status with German source language (HTTP 200)", async () => {
    const req = new NextRequest("http://localhost:3000/api/jobs/VL-9104-MN/status");
    const res = await statusHandler(req, {
      params: Promise.resolve({ id: "VL-9104-MN" }),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.jobId).toBe("VL-9104-MN");
    expect(data.status).toBe("completed");
    expect(data.sourceLang).toBe("de");
    expect(data.pageCount).toBe(4);
  });

  it("resolves demo download binary with valid PDF headers (HTTP 200)", async () => {
    const req = new NextRequest("http://localhost:3000/api/jobs/VL-DEMO1/download");
    const res = await downloadHandler(req, {
      params: Promise.resolve({ id: "VL-DEMO1" }),
    });

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("application/pdf");
    expect(res.headers.get("Content-Disposition")).toContain('filename="VerifyLingua-Translation.pdf"');
  });

  it("returns HTTP 404 for invalid nonexistent job IDs", async () => {
    const req = new NextRequest("http://localhost:3000/api/jobs/NONEXISTENT_RANDOM_UUID_999/status");
    const res = await statusHandler(req, {
      params: Promise.resolve({ id: "NONEXISTENT_RANDOM_UUID_999" }),
    });

    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.error).toContain("not found");
  });
});
