import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getPersistentJob, updatePersistentJob } from "@/lib/translation/persistent-store";

export const dynamic = "force-dynamic";

export async function POST(
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
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }

    if (job.status === "completed" || job.status === "completed_with_warnings") {
      return NextResponse.json({ error: "Cannot cancel already completed job." }, { status: 400 });
    }

    await updatePersistentJob(id, {
      status: "cancelled",
      currentStep: "Job was cancelled by user.",
    });

    return NextResponse.json({ success: true, message: `Job ${id} cancelled.` });
  } catch (err: any) {
    console.error("Error cancelling job:", err);
    return NextResponse.json({ error: err.message || "Failed to cancel job." }, { status: 500 });
  }
}
