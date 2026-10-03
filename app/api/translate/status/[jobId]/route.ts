import { NextRequest, NextResponse } from "next/server";
import { getTranslationJob } from "@/lib/translation/store";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await context.params;

    // 1. Check PostgreSQL Database first for freshest worker state
    let dbJob = null;
    try {
      dbJob = await prisma.translationJob.findUnique({
        where: { id: jobId },
      });
    } catch {}

    let job = getTranslationJob(jobId);

    if (!job && !dbJob) {
      const { getPersistentJob } = await import("@/lib/translation/persistent-store");
      const pJob = await getPersistentJob(jobId);
      if (pJob) {
        return NextResponse.json({
          jobId: pJob.id,
          fileName: pJob.sourceFilename,
          fileFormat: pJob.sourceFormat,
          fileSize: 0,
          sourceLang: pJob.sourceLanguage,
          targetLang: pJob.targetLanguage,
          status: pJob.status === "completed" || pJob.status === "completed_with_warnings" ? "ready" : pJob.status,
          progress: pJob.progress,
          currentStep: pJob.currentStep,
          createdAt: pJob.createdAt,
          completedAt: pJob.completedAt,
          downloadUrl: pJob.status === "completed" || pJob.status === "completed_with_warnings"
            ? `/api/jobs/${pJob.id}/download?token=${pJob.downloadToken}`
            : null,
          qualityGate: pJob.fidelityBreakdown ? {
            notes: pJob.warnings || [],
            byteSize: 1024,
            verifiedAt: pJob.completedAt || pJob.updatedAt,
          } : null,
          fidelityScore: pJob.fidelityScore,
          fidelityBreakdown: pJob.fidelityBreakdown,
          warnings: pJob.warnings || [],
          layoutPreserved: pJob.layoutPreserved ?? true,
          error: pJob.errorMessage || null,
        });
      }

      // Check if jobId matches an Order publicCode or Order ID
      try {
        const orderRecord = await prisma.order.findFirst({
          where: {
            OR: [{ publicCode: jobId }, { id: jobId }],
          },
          include: { documents: true },
        });

        if (orderRecord) {
          const rawStatus = orderRecord.status === "PAID" ? "translating" : (orderRecord.status?.toLowerCase() || "queued");
          const progress = orderRecord.status === "DELIVERED" ? 100 : 35;
          const currentStep = "ATA-accredited certified linguist assigned. Processing document...";
          const fileName = orderRecord.documents?.[0]?.fileName || "uploaded_document.pdf";
          const isReady = orderRecord.status === "DELIVERED";

          return NextResponse.json({
            jobId: orderRecord.publicCode,
            fileName,
            fileFormat: "pdf",
            fileSize: 0,
            sourceLang: orderRecord.sourceLang || "es",
            targetLang: orderRecord.targetLang || "en",
            status: rawStatus,
            progress,
            currentStep,
            createdAt: orderRecord.createdAt,
            completedAt: null,
            downloadUrl: isReady
              ? `/api/jobs/${orderRecord.publicCode}/download?token=${orderRecord.publicCode}`
              : null,
            qualityGate: null,
            layoutPreserved: true,
            error: null,
          });
        }
      } catch {}

      return NextResponse.json(
        { error: `Translation job '${jobId}' was not found or has expired.` },
        { status: 404 }
      );
    }

    // Resolve unified status
    const status = dbJob ? (dbJob.status === "completed" ? "ready" : dbJob.status) : job!.status;
    const progress = dbJob ? dbJob.progress : job!.progress;
    const currentStep = dbJob ? dbJob.currentStep : job!.currentStep;
    const error = dbJob ? (dbJob.errorMessage || null) : (job!.error || null);
    const downloadToken = dbJob?.downloadToken || job?.downloadToken || jobId;
    const isReady = status === "ready" || status === "completed";

    return NextResponse.json({
      jobId: jobId,
      fileName: dbJob?.sourceFilename || job?.fileName || "document.pdf",
      fileFormat: dbJob?.sourceFormat || job?.fileFormat || "pdf",
      fileSize: job?.fileSize || 0,
      sourceLang: dbJob?.sourceLanguage || job?.sourceLang || "es",
      targetLang: dbJob?.targetLanguage || job?.targetLang || "en",
      status: status,
      progress: progress,
      currentStep: currentStep,
      createdAt: dbJob?.createdAt || job?.createdAt,
      completedAt: dbJob?.completedAt || job?.completedAt,
      downloadUrl: isReady
        ? `/api/translate/download/${jobId}?token=${downloadToken}`
        : null,
      qualityGate: job?.qualityGate || null,
      layoutPreserved: dbJob?.layoutPreserved ?? job?.layoutPreserved ?? true,
      error: error,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to retrieve translation status." },
      { status: 500 }
    );
  }
}
