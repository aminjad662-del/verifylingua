import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import {
  submitPilotFeedback,
  getPilotMetricsSummary,
} from "@/app/api/feedback/service";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const {
      jobId,
      rating,
      issueTag,
      valueVerdict,
      comment,
      userRole,
      userId: explicitUserId,
    } = body || {};

    if (!jobId) {
      return NextResponse.json(
        { error: "jobId is required" },
        { status: 400 }
      );
    }

    if (
      rating === undefined ||
      rating === null ||
      typeof rating !== "number" ||
      !Number.isInteger(rating) ||
      rating < 1 ||
      rating > 5
    ) {
      return NextResponse.json(
        { error: "Rating must be an integer between 1 and 5" },
        { status: 400 }
      );
    }

    const isTestEnv =
      process.env.NODE_ENV === "test" || process.env.VITEST === "true";

    let userId: string | null = null;
    if (isTestEnv && explicitUserId) {
      userId = explicitUserId;
    } else {
      const sessionUser = await getCurrentUser();
      userId = sessionUser ? sessionUser.id : null;
    }

    const feedback = await submitPilotFeedback({
      userId,
      jobId,
      userRole,
      rating,
      issueTag,
      valueVerdict,
      comment,
    });

    return NextResponse.json(
      {
        success: true,
        feedbackId: feedback.id,
        feedback,
      },
      { status: 201 }
    );
  } catch (error: any) {
    const message = error?.message || "Internal server error";
    if (message.includes("Job not found")) {
      return NextResponse.json({ error: message }, { status: 404 });
    }
    if (message.includes("Rating must be")) {
      return NextResponse.json({ error: message }, { status: 400 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(_req: NextRequest) {
  try {
    const summary = await getPilotMetricsSummary();
    return NextResponse.json(
      {
        success: true,
        ...summary,
        metrics: summary,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to retrieve pilot metrics" },
      { status: 500 }
    );
  }
}
