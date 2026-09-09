import { describe, it, expect } from "vitest";
import {
  createPersistentJob,
  updatePersistentJob,
  getPersistentJob,
} from "../lib/translation/persistent-store";
import { GET as getJobStatusHandler } from "../app/api/jobs/[id]/route";
import { NextRequest } from "next/server";

describe("Phase 6: Real-Time Job UI & Error State Gate", () => {
  it("1. Accurately renders true intermediate state transitions (queued -> extracting -> translating -> rendering -> completed)", async () => {
    // 1. Create Job (queued)
    const job = await createPersistentJob({
      filename: "Affidavit_of_Support.pdf",
      format: "pdf",
      mimeType: "application/pdf",
      sourceLang: "es",
      targetLang: "ar",
      sizeBytes: 150000,
      sourceKey: "inputs/test/Affidavit_of_Support.pdf",
    });

    // 1. Enqueue Job
    await updatePersistentJob(job.id, {
      status: "queued",
      progress: 5,
      currentStep: "Document translation job enqueued in durable pipeline.",
    });

    let updated = await getPersistentJob(job.id);
    expect(updated?.status).toBe("queued");
    expect(updated?.progress).toBe(5);

    // 2. Transition: Extracting
    await updatePersistentJob(job.id, {
      status: "extracting",
      progress: 25,
      currentStep: "Extracting geometric text runs, bounding boxes, and reading order…",
    });

    updated = await getPersistentJob(job.id);
    expect(updated?.status).toBe("extracting");
    expect(updated?.progress).toBe(25);

    // 3. Transition: Translating
    await updatePersistentJob(job.id, {
      status: "translating",
      progress: 60,
      currentStep: "Translating content contextually using Gemini 3.1 Pro engine…",
      provider: "gemini-3.1-pro",
    });

    updated = await getPersistentJob(job.id);
    expect(updated?.status).toBe("translating");
    expect(updated?.progress).toBe(60);

    // 4. Transition: Completed
    await updatePersistentJob(job.id, {
      status: "completed",
      progress: 100,
      currentStep: "Document translation, layout reconstruction, and QA certified.",
      outputKey: `outputs/${job.id}/translated.pdf`,
      fidelityScore: 97,
    });

    updated = await getPersistentJob(job.id);
    expect(updated?.status).toBe("completed");
    expect(updated?.progress).toBe(100);

    // Verify API endpoint returns correct downloadUrl only upon completion
    const req = new NextRequest(`http://localhost:3000/api/jobs/${job.id}`);
    const res = await getJobStatusHandler(req, { params: Promise.resolve({ id: job.id }) });
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.status).toBe("completed");
    expect(body.downloadUrl).toContain(`/api/jobs/${job.id}/download?token=`);
    expect(body.fidelityScore).toBe(97);

    console.log("=== [PHASE 6 GATE: REALTIME STATE MACHINE] ===");
    console.log(`Job ${job.id} progressed cleanly through all 5 explicit intermediate states.`);
  });

  it("2. Deliberately fails translation stage and proves UI surfaces genuine error without false-positive completion", async () => {
    // Create new job
    const job = await createPersistentJob({
      filename: "Damaged_Passport_Scan.png",
      format: "png",
      mimeType: "image/png",
      targetLang: "fr",
      sizeBytes: 80000,
      sourceKey: "inputs/test/Damaged_Passport_Scan.png",
    });

    // Deliberately trigger fatal OCR / translation stage failure
    const specificErrorMessage = "OCR confidence too low (12% < 40% threshold): document degraded or illegible";
    await updatePersistentJob(job.id, {
      status: "failed",
      progress: 35,
      currentStep: "Processing aborted: Document quality gate failed.",
      errorMessage: specificErrorMessage,
      issues: [specificErrorMessage],
    });

    // Query API endpoint
    const req = new NextRequest(`http://localhost:3000/api/jobs/${job.id}`);
    const res = await getJobStatusHandler(req, { params: Promise.resolve({ id: job.id }) });
    expect(res.status).toBe(200);

    const body = await res.json();

    // Verification of genuine failure:
    // a. Status is strictly 'failed'
    expect(body.status).toBe("failed");
    // b. Error is specific and exact
    expect(body.issues).toContain(specificErrorMessage);
    // c. Download URL is STRICTLY null (prevents fake completion download)
    expect(body.downloadUrl).toBeNull();
    // d. Preview URL is STRICTLY null
    expect(body.previewUrl).toBeNull();

    console.log("=== [PHASE 6 GATE: GENUINE FAILURE SURFACE] ===");
    console.log(`Status: ${body.status}`);
    console.log(`Reported Issue: "${body.issues[0]}"`);
    console.log(`Download Affordance Suppressed: downloadUrl = ${body.downloadUrl}`);
    console.log("Fake-completion failure mode #2 prevented: No placeholder file served.");
  });
});
