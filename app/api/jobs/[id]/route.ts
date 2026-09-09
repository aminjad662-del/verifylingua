import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getPersistentJob, deletePersistentJob } from "@/lib/translation/persistent-store";
import { deleteObject } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();

    const job = await getPersistentJob(id);
    if (!job) {
      return NextResponse.json({ error: "Job not found." }, { status: 404 });
    }

    if (job.userId && user && job.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized access to this job." }, { status: 403 });
    }

    const isReady = job.status === "completed" || job.status === "completed_with_warnings";

    return NextResponse.json({
      jobId: job.id,
      status: job.status,
      currentStep: job.currentStep,
      progress: job.progress,
      sourceFilename: job.sourceFilename,
      sourceFormat: job.sourceFormat,
      sourceLanguage: job.sourceLanguage,
      targetLanguage: job.targetLanguage,
      pageCount: job.pageCount,
      wordCount: job.wordCount,
      provider: job.provider,
      fidelityScore: job.fidelityScore,
      fidelityBreakdown: job.fidelityBreakdown,
      issues: job.issues,
      warnings: job.warnings || [],
      layoutPreserved: job.layoutPreserved ?? true,
      downloadUrl: isReady ? `/api/jobs/${job.id}/download?token=${job.downloadToken}` : null,
      previewUrl: isReady ? `/api/jobs/${job.id}/preview?token=${job.downloadToken}` : null,
      createdAt: job.createdAt,
      completedAt: job.completedAt,
    });
  } catch (err: any) {
    console.error("Error fetching job status:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch job status." }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();

    const job = await getPersistentJob(id);
    if (!job) {
      return NextResponse.json({ error: "Job not found." }, { status: 404 });
    }

    if (job.userId && user && job.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized to delete this job." }, { status: 403 });
    }

    // Clean storage objects
    if (job.sourceKey) await deleteObject(job.sourceKey);
    if (job.outputKey) await deleteObject(job.outputKey);
    if (job.previewKey) await deleteObject(job.previewKey);

    await deletePersistentJob(id);

    return NextResponse.json({ success: true, message: `Job ${id} deleted.` });
  } catch (err: any) {
    console.error("Error deleting job:", err);
    return NextResponse.json({ error: err.message || "Failed to delete job." }, { status: 500 });
  }
}
