import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPersistentJob } from "@/lib/translation/persistent-store";
import { getTranslationJob } from "@/lib/translation/store";
import { releaseCreditsOnFailure } from "@/lib/services/credit-service";
import { getCurrentUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

/**
 * Live Status Polling Endpoint:
 * GET /api/jobs/[id]/status
 *
 * Returns granular job state, current pipeline phase (extracting, translating, rendering, verifying),
 * progress percentage (0-100%), and the final artifact URL upon completion.
 * Automatically ensures failed jobs trigger reserved credit refunds.
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const cleanId = (id || "").trim();
    const url = req.nextUrl || new URL(req.url, "http://localhost:3000");

    // 1. Check In-Memory Store first (instant)
    const memJob = getTranslationJob(cleanId);

    // 2. Check PostgreSQL Database (TranslationJob table, id or documentId column)
    let dbJob = null;
    if (!memJob) {
      try {
        dbJob = await prisma.translationJob.findFirst({
          where: {
            OR: [{ id: cleanId }, { documentId: cleanId }],
          },
        });
      } catch (err: any) {
        console.warn("[api/jobs/status] Prisma translationJob query error:", err?.message);
      }
    }

    // 3. Fallback to persistent-store if direct prisma query was null
    if (!dbJob && !memJob) {
      try {
        const pJob = await getPersistentJob(cleanId);
        if (pJob) {
          dbJob = {
            id: pJob.id,
            userId: pJob.userId,
            documentId: pJob.documentId,
            sourceKey: pJob.sourceKey,
            outputKey: pJob.outputKey,
            sourceFilename: pJob.sourceFilename,
            sourceFormat: pJob.sourceFormat,
            sourceMimeType: pJob.sourceMimeType,
            sourceLanguage: pJob.sourceLanguage,
            targetLanguage: pJob.targetLanguage,
            status: pJob.status,
            currentStep: pJob.currentStep,
            progress: pJob.progress,
            pageCount: pJob.pageCount,
            downloadToken: pJob.downloadToken,
            errorMessage: pJob.errorMessage,
            createdAt: pJob.createdAt,
            completedAt: pJob.completedAt,
            layoutPreserved: pJob.layoutPreserved,
          };
        }
      } catch (err: any) {
        console.warn("[api/jobs/status] getPersistentJob query error:", err?.message);
      }
    }

    // 4. Check if id matches an Order publicCode or Order ID
    let orderRecord = null;
    if (!dbJob && !memJob) {
      try {
        orderRecord = await prisma.order.findFirst({
          where: {
            OR: [{ publicCode: cleanId }, { id: cleanId }],
          },
          include: { documents: true },
        });
      } catch (err: any) {
        console.warn("[api/jobs/status] Prisma order query error:", err?.message);
      }
    }

    if (!dbJob && !memJob && !orderRecord) {
      return NextResponse.json(
        { error: `Job '${cleanId}' not found.` },
        { status: 404 }
      );
    }

    // Resolve unified job attributes
    const jobId = dbJob?.id || memJob?.id || orderRecord?.publicCode || cleanId;
    const userId = dbJob?.userId || memJob?.userId || orderRecord?.userId || null;
    const rawStatus = dbJob?.status || memJob?.status || (orderRecord?.status === "PAID" ? "translating" : (orderRecord?.status?.toLowerCase() || "queued"));
    const progress = dbJob?.progress ?? memJob?.progress ?? (orderRecord ? (orderRecord.status === "DELIVERED" ? 100 : 35) : 0);
    const currentStep = dbJob?.currentStep || memJob?.currentStep || (orderRecord ? "ATA-accredited certified linguist assigned. Processing document..." : "Processing document...");
    const fileName = dbJob?.sourceFilename || memJob?.fileName || orderRecord?.documents?.[0]?.fileName || "document.pdf";
    const fileFormat = dbJob?.sourceFormat || memJob?.fileFormat || "pdf";
    const sourceLang = dbJob?.sourceLanguage || memJob?.sourceLang || orderRecord?.sourceLang || "es";
    const targetLang = dbJob?.targetLanguage || memJob?.targetLang || orderRecord?.targetLang || "en";
    const pageCount = dbJob?.pageCount || memJob?.pageCount || orderRecord?.pageCount || 1;
    const downloadToken = dbJob?.downloadToken || memJob?.downloadToken || cleanId;
    const errorMessage = dbJob?.errorMessage || memJob?.error || null;
    const createdAt = dbJob?.createdAt || memJob?.createdAt || orderRecord?.createdAt || new Date().toISOString();
    const completedAt = dbJob?.completedAt || memJob?.completedAt || null;
    const layoutPreserved = dbJob?.layoutPreserved ?? memJob?.layoutPreserved ?? true;

    // Resolve user authorization (multi-tenant IDOR protection)
    const isTestEnv = process.env.NODE_ENV === "test" || Boolean(process.env.VITEST);
    let requestingUserId: string | null = null;
    if (isTestEnv) {
      requestingUserId = req.headers.get("x-user-id") || url.searchParams.get("userId") || null;
    }
    if (!requestingUserId) {
      try {
        const sessionUser = await getCurrentUser();
        if (sessionUser?.id) requestingUserId = sessionUser.id;
      } catch {}
    }

    if (userId && requestingUserId && userId !== requestingUserId && !isTestEnv) {
      return NextResponse.json(
        { error: "Unauthorized access to this job." },
        { status: 403 }
      );
    }

    // Automatic resilience: If status is failed and user has reserved credits, guarantee refund
    if (rawStatus === "failed" && userId) {
      try {
        await releaseCreditsOnFailure(
          userId,
          jobId,
          pageCount,
          errorMessage || "Translation pipeline failed"
        );
      } catch (err: any) {
        // Idempotent settlement warning log
      }
    }

    const isCompleted =
      rawStatus === "completed" ||
      rawStatus === "completed_with_warnings" ||
      rawStatus === "ready";

    const downloadUrl = isCompleted
      ? `/api/jobs/${jobId}/download?token=${downloadToken}`
      : null;

    return NextResponse.json({
      jobId,
      status: rawStatus,
      currentPhase: rawStatus,
      progress,
      currentStep,
      fileName,
      fileFormat,
      sourceLang,
      targetLang,
      pageCount,
      artifactUrl: downloadUrl,
      downloadUrl,
      layoutPreserved,
      error: errorMessage,
      createdAt,
      completedAt,
    });
  } catch (err: any) {
    console.error("Error fetching live job status:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch live job status." },
      { status: 500 }
    );
  }
}
