import { prisma } from "@/lib/prisma";
import { PilotFeedback } from "@prisma/client";

export interface SubmitPilotFeedbackInput {
  userId?: string | null;
  jobId: string;
  userRole?: string | null;
  rating: number;
  issueTag?: string | null;
  valueVerdict?: string | null;
  comment?: string | null;
  pageCount?: number;
  sourceFormat?: string;
  sourceLang?: string;
  targetLang?: string;
  processingTimeMs?: number;
  retryAttempts?: number;
  providerUsed?: string;
}

export interface PilotMetricsSummary {
  totalFeedbackCount: number;
  averageRating: number;
  issueBreakdown: Record<string, number>;
  valueBreakdown: Record<string, number>;
  recentComments: string[];
}

/**
 * Validates and records pilot tester feedback for a completed translation job.
 * Automatically enriches feedback with job metadata if not supplied.
 */
export async function submitPilotFeedback(
  input: SubmitPilotFeedbackInput
): Promise<PilotFeedback> {
  const { rating, jobId } = input;

  if (
    typeof rating !== "number" ||
    !Number.isInteger(rating) ||
    rating < 1 ||
    rating > 5
  ) {
    throw new Error("Rating must be an integer between 1 and 5");
  }

  if (!jobId) {
    throw new Error("jobId is required");
  }

  // Fetch job to ensure it exists and enrich telemetry
  const job = await prisma.translationJob.findUnique({
    where: { id: jobId },
  });

  if (!job) {
    throw new Error(`Job not found: ${jobId}`);
  }

  const pageCount = input.pageCount ?? job.pageCount ?? 1;
  const sourceFormat = input.sourceFormat ?? job.sourceFormat ?? "unknown";
  const sourceLang = input.sourceLang ?? job.sourceLanguage ?? "en";
  const targetLang = input.targetLang ?? job.targetLanguage ?? "es";
  const providerUsed = input.providerUsed ?? job.provider ?? "azure";

  let processingTimeMs = input.processingTimeMs;
  if (processingTimeMs === undefined || processingTimeMs === null) {
    if (job.completedAt && job.startedAt) {
      processingTimeMs = Math.max(
        0,
        job.completedAt.getTime() - job.startedAt.getTime()
      );
    } else {
      processingTimeMs = 0;
    }
  }

  const retryAttempts = input.retryAttempts ?? 0;
  const resolvedUserId = input.userId !== undefined ? input.userId : job.userId;

  const feedback = await prisma.pilotFeedback.create({
    data: {
      userId: resolvedUserId ?? null,
      jobId,
      userRole: input.userRole ?? null,
      rating,
      issueTag: input.issueTag ?? null,
      valueVerdict: input.valueVerdict ?? null,
      comment:
        input.comment && input.comment.trim().length > 0
          ? input.comment.trim()
          : null,
      pageCount,
      sourceFormat,
      sourceLang,
      targetLang,
      processingTimeMs: Math.max(0, processingTimeMs),
      retryAttempts,
      providerUsed,
    },
  });

  return feedback;
}

/**
 * Computes aggregated telemetry metrics across all PilotFeedback submissions.
 */
export async function getPilotMetricsSummary(): Promise<PilotMetricsSummary> {
  const feedbacks = await prisma.pilotFeedback.findMany({
    orderBy: { createdAt: "desc" },
  });

  const totalFeedbackCount = feedbacks.length;
  const averageRating =
    totalFeedbackCount > 0
      ? Number(
          (
            feedbacks.reduce((sum, f) => sum + f.rating, 0) / totalFeedbackCount
          ).toFixed(2)
        )
      : 0;

  const issueBreakdown: Record<string, number> = {};
  const valueBreakdown: Record<string, number> = {};
  const recentComments: string[] = [];

  for (const f of feedbacks) {
    if (f.issueTag) {
      issueBreakdown[f.issueTag] = (issueBreakdown[f.issueTag] || 0) + 1;
    }
    if (f.valueVerdict) {
      valueBreakdown[f.valueVerdict] =
        (valueBreakdown[f.valueVerdict] || 0) + 1;
    }
    if (f.comment && f.comment.trim().length > 0) {
      if (recentComments.length < 10) {
        recentComments.push(f.comment.trim());
      }
    }
  }

  return {
    totalFeedbackCount,
    averageRating,
    issueBreakdown,
    valueBreakdown,
    recentComments,
  };
}
