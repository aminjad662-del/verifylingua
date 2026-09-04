import { NextResponse } from "next/server";
import { listTranslationJobs } from "@/lib/translation/store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const jobs = listTranslationJobs();

    // Map jobs to remove raw memory buffers and format for dashboard presentation
    const sanitizedJobs = jobs
      .map((job) => ({
        id: job.id,
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
        error: job.error,
        qualityGate: job.qualityGate,
        downloadUrl:
          job.status === "ready" && job.downloadToken
            ? `/api/translate/download/${job.id}?token=${job.downloadToken}`
            : null,
      }))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({
      jobs: sanitizedJobs,
      total: sanitizedJobs.length,
    });
  } catch (error) {
    console.error("Error listing translation jobs:", error);
    return NextResponse.json(
      { error: "Failed to retrieve translation jobs." },
      { status: 500 }
    );
  }
}
