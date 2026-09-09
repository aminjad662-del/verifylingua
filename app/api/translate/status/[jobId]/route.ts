import { NextRequest, NextResponse } from "next/server";
import { getTranslationJob } from "@/lib/translation/store";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await context.params;
    const job = getTranslationJob(jobId);

    if (!job) {
      return NextResponse.json(
        { error: `Translation job '${jobId}' was not found or has expired.` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      jobId: job.id,
      fileName: job.fileName,
      fileFormat: job.fileFormat,
      fileSize: job.fileSize,
      sourceLang: job.sourceLang,
      targetLang: job.targetLang,
      status: job.status,
      progress: job.progress,
      currentStep: job.currentStep,
      createdAt: job.createdAt,
      completedAt: job.completedAt,
      downloadUrl:
        job.status === "ready"
          ? `/api/translate/download/${job.id}?token=${job.downloadToken}`
          : null,
      qualityGate: job.qualityGate || null,
      layoutPreserved: job.layoutPreserved ?? null,
      error: job.error || null,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to retrieve translation status." },
      { status: 500 }
    );
  }
}
