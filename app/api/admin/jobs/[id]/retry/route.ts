import { NextRequest, NextResponse } from "next/server";
import { isAdminRole, ROLE_COOKIE_NAME } from "@/lib/auth/rbac";
import { getPersistentJob, updatePersistentJob } from "@/lib/translation/persistent-store";
import { executeAutonomousDocumentPipeline } from "@/lib/inngest/functions";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. Enforce admin role authentication
    const roleCookie = req.cookies.get(ROLE_COOKIE_NAME)?.value || req.headers.get("x-user-role");
    if (!roleCookie || !isAdminRole(roleCookie)) {
      return NextResponse.json(
        { error: "Administrative privileges required to retry jobs." },
        { status: 403 }
      );
    }

    // 2. Fetch target job
    const job = await getPersistentJob(id);
    if (!job) {
      return NextResponse.json({ error: `Job ${id} not found.` }, { status: 404 });
    }

    // 3. Reset job state to retry
    await updatePersistentJob(id, {
      status: "created",
      currentStep: "Job queued for autonomous pipeline retry…",
      progress: 5,
      errorCode: undefined,
      errorMessage: undefined,
      startedAt: new Date().toISOString(),
      completedAt: undefined,
    });

    // 4. Re-trigger execution pipeline
    await executeAutonomousDocumentPipeline(id);

    return NextResponse.json({
      success: true,
      message: `Job ${id} reset and retry pipeline dispatched successfully.`,
      jobId: id,
      status: "created",
    });
  } catch (err: any) {
    console.error("Failed to retry job:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error retrying job." },
      { status: 500 }
    );
  }
}
