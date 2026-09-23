import { NextRequest, NextResponse } from "next/server";
import { verifyEmailToken } from "@/lib/auth/verification";
import { recordAuthAuditEvent } from "@/lib/auth/audit";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
  const userAgent = req.headers.get("user-agent") || "unknown";

  if (!token) {
    return NextResponse.json(
      { error: "Verification token is required." },
      { status: 400 }
    );
  }

  const result = await verifyEmailToken(token);

  if (!result.success) {
    await recordAuthAuditEvent({
      action: "EMAIL_VERIFICATION_FAILED",
      ipAddress: ip,
      userAgent,
      details: { tokenProvided: token.slice(0, 8) + "...", error: result.error },
    });

    return NextResponse.json(
      { error: result.error || "Verification failed." },
      { status: 400 }
    );
  }

  return NextResponse.json({
    success: true,
    message: "Email address verified successfully. Your translation vault is now fully certified.",
    email: result.email,
  });
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
  const userAgent = req.headers.get("user-agent") || "unknown";

  try {
    const body = await req.json().catch(() => ({}));
    const token = body.token;

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { error: "Verification token is required." },
        { status: 400 }
      );
    }

    const result = await verifyEmailToken(token);

    if (!result.success) {
      await recordAuthAuditEvent({
        action: "EMAIL_VERIFICATION_FAILED",
        ipAddress: ip,
        userAgent,
        details: { tokenProvided: token.slice(0, 8) + "...", error: result.error },
      });

      return NextResponse.json(
        { error: result.error || "Verification failed." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Email address verified successfully. Your translation vault is now fully certified.",
      email: result.email,
    });
  } catch (err: unknown) {
    console.error("Email verification error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred during email verification." },
      { status: 500 }
    );
  }
}
