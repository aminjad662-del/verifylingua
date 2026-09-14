import { describe, it, expect, beforeEach, afterEach, afterAll } from "vitest";
import { prisma } from "../lib/prisma";
import {
  submitPilotFeedback,
  getPilotMetricsSummary,
} from "../app/api/feedback/service";
import { POST as feedbackPostRoute, GET as feedbackGetRoute } from "../app/api/feedback/route";
import { NextRequest } from "next/server";

describe("Pilot Feedback & Telemetry Engine", () => {
  const createdUserIds: string[] = [];
  const createdJobIds: string[] = [];
  const createdFeedbackIds: string[] = [];

  const createTestUser = async () => {
    const user = await prisma.user.create({
      data: {
        email: `pilot_user_${Date.now()}_${Math.random().toString(36).slice(2, 7)}@example.com`,
        role: "CUSTOMER",
      },
    });
    createdUserIds.push(user.id);
    return user;
  };

  const createTestJob = async (userId?: string | null, overrides?: {
    pageCount?: number;
    sourceFormat?: string;
    sourceLanguage?: string;
    targetLanguage?: string;
    provider?: string;
    startedAt?: Date;
    completedAt?: Date;
  }) => {
    const job = await prisma.translationJob.create({
      data: {
        userId: userId ?? null,
        sourceKey: "test/source.pdf",
        sourceFilename: "test.pdf",
        sourceFormat: overrides?.sourceFormat ?? "pdf",
        sourceMimeType: "application/pdf",
        sourceLanguage: overrides?.sourceLanguage ?? "en",
        targetLanguage: overrides?.targetLanguage ?? "es",
        status: "completed",
        pageCount: overrides?.pageCount ?? 4,
        provider: overrides?.provider ?? "azure",
        startedAt: overrides?.startedAt ?? new Date(Date.now() - 5000),
        completedAt: overrides?.completedAt ?? new Date(Date.now()),
      },
    });
    createdJobIds.push(job.id);
    return job;
  };

  afterEach(async () => {
    // Delete feedbacks created in test
    if (createdFeedbackIds.length > 0) {
      await prisma.pilotFeedback.deleteMany({
        where: { id: { in: createdFeedbackIds } },
      });
      createdFeedbackIds.length = 0;
    }

    // Delete jobs created in test
    if (createdJobIds.length > 0) {
      await prisma.pilotFeedback.deleteMany({
        where: { jobId: { in: createdJobIds } },
      });
      await prisma.translationJob.deleteMany({
        where: { id: { in: createdJobIds } },
      });
      createdJobIds.length = 0;
    }

    // Delete users created in test
    if (createdUserIds.length > 0) {
      await prisma.user.deleteMany({
        where: { id: { in: createdUserIds } },
      });
      createdUserIds.length = 0;
    }
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("1. submitPilotFeedback Service Function", () => {
    it("persists feedback with valid 1-5 rating and enriches telemetry from TranslationJob", async () => {
      const user = await createTestUser();
      const startTime = new Date(Date.now() - 6500);
      const endTime = new Date(Date.now());
      const job = await createTestJob(user.id, {
        pageCount: 7,
        sourceFormat: "docx",
        sourceLanguage: "de",
        targetLanguage: "en",
        provider: "google",
        startedAt: startTime,
        completedAt: endTime,
      });

      const feedback = await submitPilotFeedback({
        userId: user.id,
        jobId: job.id,
        userRole: "FREELANCE_TRANSLATOR",
        rating: 5,
        issueTag: "NONE",
        valueVerdict: "GREAT_VALUE",
        comment: "Flawless layout and table borders preserved perfectly.",
      });

      createdFeedbackIds.push(feedback.id);

      expect(feedback.id).toBeDefined();
      expect(feedback.userId).toBe(user.id);
      expect(feedback.jobId).toBe(job.id);
      expect(feedback.rating).toBe(5);
      expect(feedback.issueTag).toBe("NONE");
      expect(feedback.valueVerdict).toBe("GREAT_VALUE");
      expect(feedback.comment).toBe("Flawless layout and table borders preserved perfectly.");
      expect(feedback.pageCount).toBe(7);
      expect(feedback.sourceFormat).toBe("docx");
      expect(feedback.sourceLang).toBe("de");
      expect(feedback.targetLang).toBe("en");
      expect(feedback.providerUsed).toBe("google");
      expect(feedback.processingTimeMs).toBe(endTime.getTime() - startTime.getTime());
    });

    it("handles null userId gracefully (guest or unauthenticated tester)", async () => {
      const job = await createTestJob(null);

      const feedback = await submitPilotFeedback({
        userId: null,
        jobId: job.id,
        rating: 4,
        issueTag: "FONT_SIZE",
        valueVerdict: "FAIR",
      });

      createdFeedbackIds.push(feedback.id);

      expect(feedback.userId).toBeNull();
      expect(feedback.jobId).toBe(job.id);
      expect(feedback.rating).toBe(4);
      expect(feedback.issueTag).toBe("FONT_SIZE");
    });

    it("rejects invalid ratings (< 1, > 5, non-integers, NaN)", async () => {
      const job = await createTestJob();

      await expect(
        submitPilotFeedback({
          jobId: job.id,
          rating: 0,
        })
      ).rejects.toThrow("Rating must be an integer between 1 and 5");

      await expect(
        submitPilotFeedback({
          jobId: job.id,
          rating: 6,
        })
      ).rejects.toThrow("Rating must be an integer between 1 and 5");

      await expect(
        submitPilotFeedback({
          jobId: job.id,
          rating: 3.5,
        })
      ).rejects.toThrow("Rating must be an integer between 1 and 5");

      await expect(
        submitPilotFeedback({
          jobId: job.id,
          rating: NaN,
        })
      ).rejects.toThrow("Rating must be an integer between 1 and 5");
    });

    it("rejects non-existent jobId", async () => {
      await expect(
        submitPilotFeedback({
          jobId: "non_existent_job_12345",
          rating: 5,
        })
      ).rejects.toThrow("Job not found: non_existent_job_12345");
    });

    it("defaults processingTimeMs to 0 when startedAt is unset and trims empty comments to null", async () => {
      const job = await prisma.translationJob.create({
        data: {
          sourceKey: "test/unstarted.pdf",
          sourceFilename: "unstarted.pdf",
          sourceFormat: "pdf",
          sourceMimeType: "application/pdf",
          sourceLanguage: "en",
          targetLanguage: "es",
          status: "completed",
          startedAt: null,
          completedAt: null,
        },
      });
      createdJobIds.push(job.id);

      const feedback = await submitPilotFeedback({
        jobId: job.id,
        rating: 4,
        comment: "   ",
      });
      createdFeedbackIds.push(feedback.id);

      expect(feedback.processingTimeMs).toBe(0);
      expect(feedback.comment).toBeNull();
    });
  });

  describe("2. getPilotMetricsSummary Aggregator", () => {
    it("aggregates feedback counts, average rating, issue breakdown, and value verdict breakdown", async () => {
      const job = await createTestJob();

      const f1 = await submitPilotFeedback({
        jobId: job.id,
        rating: 5,
        issueTag: "NONE",
        valueVerdict: "GREAT_VALUE",
        comment: "Amazing precision",
      });
      const f2 = await submitPilotFeedback({
        jobId: job.id,
        rating: 3,
        issueTag: "LAYOUT_SHIFT",
        valueVerdict: "FAIR",
        comment: "Minor header shift on page 2",
      });
      const f3 = await submitPilotFeedback({
        jobId: job.id,
        rating: 4,
        issueTag: "NONE",
        valueVerdict: "GREAT_VALUE",
      });

      createdFeedbackIds.push(f1.id, f2.id, f3.id);

      const summary = await getPilotMetricsSummary();

      expect(summary.totalFeedbackCount).toBeGreaterThanOrEqual(3);
      expect(summary.averageRating).toBeGreaterThanOrEqual(1);
      expect(summary.averageRating).toBeLessThanOrEqual(5);
      expect(summary.issueBreakdown["NONE"]).toBeGreaterThanOrEqual(2);
      expect(summary.issueBreakdown["LAYOUT_SHIFT"]).toBeGreaterThanOrEqual(1);
      expect(summary.valueBreakdown["GREAT_VALUE"]).toBeGreaterThanOrEqual(2);
      expect(summary.valueBreakdown["FAIR"]).toBeGreaterThanOrEqual(1);
      expect(summary.recentComments).toContain("Amazing precision");
      expect(summary.recentComments).toContain("Minor header shift on page 2");
    });
  });

  describe("3. API Endpoints (POST & GET /api/feedback)", () => {
    it("POST /api/feedback creates feedback and returns HTTP 201 with feedbackId", async () => {
      const user = await createTestUser();
      const job = await createTestJob(user.id);

      const req = new NextRequest("http://localhost:3000/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: job.id,
          userId: user.id,
          rating: 4,
          issueTag: "TABLE_MISALIGNED",
          valueVerdict: "FAIR",
          comment: "A table column was slightly compressed.",
          userRole: "TRANSLATION_AGENCY",
        }),
      });

      const res = await feedbackPostRoute(req);
      expect(res.status).toBe(201);

      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.feedbackId).toBeDefined();
      createdFeedbackIds.push(data.feedbackId);

      // Verify in DB
      const record = await prisma.pilotFeedback.findUnique({
        where: { id: data.feedbackId },
      });
      expect(record).not.toBeNull();
      expect(record?.rating).toBe(4);
      expect(record?.issueTag).toBe("TABLE_MISALIGNED");
      expect(record?.userRole).toBe("TRANSLATION_AGENCY");
    });

    it("POST /api/feedback returns HTTP 400 when rating is missing or invalid", async () => {
      const job = await createTestJob();

      const req = new NextRequest("http://localhost:3000/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: job.id,
          rating: 0,
        }),
      });

      const res = await feedbackPostRoute(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain("Rating must be an integer between 1 and 5");
    });

    it("POST /api/feedback returns HTTP 400 when jobId is missing", async () => {
      const req = new NextRequest("http://localhost:3000/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: 5,
        }),
      });

      const res = await feedbackPostRoute(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain("jobId is required");
    });

    it("POST /api/feedback returns HTTP 404 when jobId does not exist", async () => {
      const req = new NextRequest("http://localhost:3000/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: "non_existent_job_9999",
          rating: 4,
        }),
      });

      const res = await feedbackPostRoute(req);
      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.error).toContain("Job not found");
    });

    it("POST /api/feedback returns HTTP 400 when body is invalid JSON", async () => {
      const req = new NextRequest("http://localhost:3000/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "invalid-json-string{",
      });

      const res = await feedbackPostRoute(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain("Invalid JSON body");
    });

    it("GET /api/feedback returns HTTP 200 with telemetry summary", async () => {
      const req = new NextRequest("http://localhost:3000/api/feedback", {
        method: "GET",
      });

      const res = await feedbackGetRoute(req);
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.success).toBe(true);
      expect(typeof data.totalFeedbackCount).toBe("number");
      expect(typeof data.averageRating).toBe("number");
      expect(data.issueBreakdown).toBeDefined();
      expect(data.valueBreakdown).toBeDefined();
    });
  });
});
