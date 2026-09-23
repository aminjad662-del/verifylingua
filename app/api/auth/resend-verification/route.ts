import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit } from "@/lib/auth/rate-limit";
import { createVerificationToken } from "@/lib/auth/verification";
import { recordAuthAuditEvent } from "@/lib/auth/audit";
import { prisma } from "@/lib/prisma";
import { memoryUsers } from "@/lib/auth/dev-store";

const resendSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address").toLowerCase(),
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
  const userAgent = req.headers.get("user-agent") || "unknown";

  try {
    const body = await req.json().catch(() => ({}));
    const validation = resendSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "A valid email address is required to resend verification." },
        { status: 400 }
      );
    }

    const { email } = validation.data;

    // Rate limiting: 3 resends per email per 10 minutes
    const rateLimit = checkRateLimit(`resend-verification:${email}`, 3, 10 * 60 * 1000);
    if (!rateLimit.success) {
      const waitMinutes = Math.ceil(rateLimit.resetInMs / 60000);
      return NextResponse.json(
        { error: `Too many verification requests. Please check your inbox or try again in ${waitMinutes} minutes.` },
        { status: 429 }
      );
    }

    // Check if user exists
    let userExists = false;
    if (!process.env.VITEST) {
      try {
        const dbUser = await prisma.user.findUnique({ where: { email } });
        userExists = !!dbUser;
      } catch {
        userExists = Array.from(memoryUsers.values()).some((u) => u.email === email);
      }
    } else {
      userExists = Array.from(memoryUsers.values()).some((u) => u.email === email);
    }

    if (!userExists) {
      // Don't leak user existence; return generic success message
      return NextResponse.json({
        success: true,
        message: "If an account exists with this email address, a new verification link has been sent.",
      });
    }

    // Generate new token & send email
    const token = await createVerificationToken(email);

    await recordAuthAuditEvent({
      action: "EMAIL_VERIFICATION_RESENT",
      ipAddress: ip,
      userAgent,
      details: { email },
    });

    return NextResponse.json({
      success: true,
      message: "A fresh verification link has been dispatched to your email address.",
      token: process.env.NODE_ENV !== "production" ? token : undefined,
    });
  } catch (err: unknown) {
    console.error("Resend verification error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred while resending verification email." },
      { status: 500 }
    );
  }
}
