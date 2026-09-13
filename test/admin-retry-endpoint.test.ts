import fs from "fs";
import path from "path";
import { describe, it, expect } from "vitest";
import { POST } from "@/app/api/admin/jobs/[id]/retry/route";
import { NextRequest } from "next/server";
import { createPersistentJob, getPersistentJob, updatePersistentJob } from "@/lib/translation/persistent-store";
import { ROLE_COOKIE_NAME } from "@/lib/auth/rbac";

describe("Admin Job Retry API Endpoint (/api/admin/jobs/[id]/retry)", () => {
  it("denies access when caller lacks administrative role", async () => {
    const req = new NextRequest("http://localhost:3000/api/admin/jobs/job-123/retry", {
      method: "POST",
    });

    const res = await POST(req, { params: Promise.resolve({ id: "job-123" }) });
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toContain("Administrative privileges required");
  });

  it("returns 404 when target job does not exist", async () => {
    const req = new NextRequest("http://localhost:3000/api/admin/jobs/non-existent-job/retry", {
      method: "POST",
      headers: {
        cookie: `${ROLE_COOKIE_NAME}=ADMIN`,
      },
    });

    const res = await POST(req, { params: Promise.resolve({ id: "non-existent-job" }) });
    expect(res.status).toBe(404);
  });

  it("resets failed job state and triggers retry pipeline when authorized", async () => {
    const fixtureBuffer = fs.readFileSync(path.resolve(process.cwd(), "fixtures/real_employment_contract.docx"));
    const job = await createPersistentJob({
      filename: "failed_contract.docx",
      format: "docx",
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      sourceLang: "es",
      targetLang: "en",
      fileBuffer: fixtureBuffer,
    });

    // Mark as failed
    await updatePersistentJob(job.id, {
      status: "failed",
      errorCode: "TRANSLATION_TIMEOUT",
      errorMessage: "Upstream socket timed out",
    });

    const req = new NextRequest(`http://localhost:3000/api/admin/jobs/${job.id}/retry`, {
      method: "POST",
      headers: {
        cookie: `${ROLE_COOKIE_NAME}=OPERATIONS_MANAGER`,
      },
    });

    const res = await POST(req, { params: Promise.resolve({ id: job.id }) });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.jobId).toBe(job.id);
    expect(body.status).toBe("created");

    const updated = await getPersistentJob(job.id);
    expect(updated?.status).toBe("created");
    expect(updated?.errorCode).toBeUndefined();
  });
});
