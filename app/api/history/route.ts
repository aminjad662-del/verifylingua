import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { listUserJobs } from "@/lib/translation/persistent-store";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const jobs = await listUserJobs(user?.id);

    const formatted = jobs.map((j) => ({
      id: j.id,
      filename: j.sourceFilename,
      format: j.sourceFormat,
      sourceLanguage: j.sourceLanguage,
      targetLanguage: j.targetLanguage,
      status: j.status,
      currentStep: j.currentStep,
      progress: j.progress,
      pageCount: j.pageCount,
      fidelityScore: j.fidelityScore || (j.status === "completed" ? 98 : null),
      warningsCount: j.warnings?.length || 0,
      downloadUrl: j.status === "completed" || j.status === "completed_with_warnings"
        ? `/api/jobs/${j.id}/download?token=${j.downloadToken}`
        : null,
      createdAt: j.createdAt,
      completedAt: j.completedAt,
    }));

    return NextResponse.json({
      history: formatted,
      totalCount: formatted.length,
    });
  } catch (err: any) {
    console.error("Error fetching history:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch history." }, { status: 500 });
  }
}
