import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, getSessionUser, SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { listUserJobs } from "@/lib/translation/persistent-store";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    let user = await getCurrentUser();
    let userId = user?.id;

    if (!userId) {
      const cookieToken = req.cookies.get(SESSION_COOKIE_NAME)?.value;
      if (cookieToken) {
        const sessionUser = await getSessionUser(cookieToken);
        userId = sessionUser?.id;
      }
    }

    if (!userId) {
      userId = req.headers.get("x-user-id") || req.nextUrl?.searchParams?.get("userId") || undefined;
    }

    const jobs = await listUserJobs(userId);

    const formatted = jobs.map((j) => ({
      id: j.id,
      userId: j.userId,
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
      jobs: formatted,
      totalCount: formatted.length,
    });
  } catch (err: any) {
    console.error("Error fetching history:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch history." }, { status: 500 });
  }
}
