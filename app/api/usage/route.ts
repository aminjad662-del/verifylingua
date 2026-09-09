import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { listUserJobs } from "@/lib/translation/persistent-store";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const jobs = await listUserJobs(user?.id);

    const totalJobs = jobs.length;
    const completedJobs = jobs.filter((j) => j.status === "completed" || j.status === "completed_with_warnings").length;
    const totalPages = jobs.reduce((sum, j) => sum + (j.pageCount || 1), 0);
    const totalWords = jobs.reduce((sum, j) => sum + (j.wordCount || 0), 0);
    const totalCharacters = jobs.reduce((sum, j) => sum + (j.characterCount || 0), 0);

    const plan = user?.role === "ATTORNEY" ? "BUSINESS" : "PRO";
    const quota = plan === "BUSINESS" ? 500 : 50;

    return NextResponse.json({
      plan,
      pageQuota: quota,
      pagesUsed: totalPages,
      remainingPages: Math.max(0, quota - totalPages),
      totalJobs,
      completedJobs,
      totalWords,
      totalCharacters,
      resetDate: new Date(Date.now() + 30 * 86400000).toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch usage metrics" }, { status: 500 });
  }
}
