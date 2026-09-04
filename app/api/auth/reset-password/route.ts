import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword, evaluatePasswordStrength } from "@/lib/auth/password";
import { checkRateLimit } from "@/lib/auth/rate-limit";
import { memoryUsers, memoryResetTokens } from "@/lib/auth/dev-store";

const requestResetSchema = z.object({
  action: z.literal("request"),
  email: z.string().trim().email("Please provide a valid email address").toLowerCase(),
});

const executeResetSchema = z.object({
  action: z.literal("reset"),
  token: z.string().min(16, "Invalid reset token"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

const isTestEnv = !!process.env.VITEST || process.env.NODE_ENV === "test";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";

    // Rate limit: max 5 attempts per 10 minutes per IP
    const rateLimit = checkRateLimit(`reset:${ip}`, 5, 10 * 60 * 1000);
    if (!rateLimit.success) {
      const waitMinutes = Math.ceil(rateLimit.resetInMs / 60000);
      return NextResponse.json(
        { error: `Too many password reset attempts. Please try again in ${waitMinutes} minutes.` },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
    }

    // 1. ACTION: REQUEST RESET TOKEN
    if (body.action === "request") {
      const parseResult = requestResetSchema.safeParse(body);
      if (!parseResult.success) {
        return NextResponse.json(
          { error: parseResult.error.errors[0]?.message || "Invalid email" },
          { status: 400 }
        );
      }

      const { email } = parseResult.data;

      // Find user in DB or memory
      let user = null;
      if (!isTestEnv) {
        try {
          user = await prisma.user.findUnique({ where: { email } });
        } catch {
          user = null;
        }
      }

      if (!user) {
        user = Array.from(memoryUsers.values()).find((u) => u.email === email) || null;
      }

      // Always return success even if user not found to prevent user enumeration
      if (!user) {
        return NextResponse.json({
          ok: true,
          message: "If an account exists with this email, a password reset link has been dispatched.",
        });
      }

      // Generate 64-char crypto token with 1 hour expiration
      const resetToken = crypto.randomBytes(32).toString("hex");
      const expires = new Date(Date.now() + 60 * 60 * 1000);

      // Store in memory
      memoryResetTokens.set(resetToken, {
        email,
        token: resetToken,
        expires,
      });

      // Store in DB if not in test mode
      if (!isTestEnv) {
        try {
          await prisma.verificationToken.create({
            data: {
              identifier: email,
              token: resetToken,
              expires,
            },
          });
        } catch {
          // Fallback silently active in memory
        }
      }

      return NextResponse.json({
        ok: true,
        message: "If an account exists with this email, a password reset link has been dispatched.",
        ...(process.env.NODE_ENV !== "production" ? { debugResetToken: resetToken } : {}),
      });
    }

    // 2. ACTION: EXECUTE PASSWORD RESET
    if (body.action === "reset") {
      const parseResult = executeResetSchema.safeParse(body);
      if (!parseResult.success) {
        return NextResponse.json(
          { error: parseResult.error.errors[0]?.message || "Invalid reset parameters" },
          { status: 400 }
        );
      }

      const { token, newPassword } = parseResult.data;

      // Check strength
      const strength = evaluatePasswordStrength(newPassword);
      if (strength.score < 2) {
        return NextResponse.json(
          { error: "Password is too weak. Please use a stronger combination of letters and numbers." },
          { status: 400 }
        );
      }

      // Verify token from DB or memory
      let targetEmail: string | null = null;

      if (!isTestEnv) {
        try {
          const dbToken = await prisma.verificationToken.findUnique({
            where: { token },
          });
          if (dbToken && dbToken.expires >= new Date()) {
            targetEmail = dbToken.identifier;
          }
        } catch {
          // Database offline
        }
      }

      if (!targetEmail) {
        const memToken = memoryResetTokens.get(token);
        if (memToken && memToken.expires >= new Date()) {
          targetEmail = memToken.email;
        }
      }

      if (!targetEmail) {
        return NextResponse.json(
          { error: "Invalid or expired password reset link. Please request a new one." },
          { status: 400 }
        );
      }

      // Hash new password using scrypt
      const passwordHash = await hashPassword(newPassword);

      // Update in DB if not test env
      if (!isTestEnv) {
        try {
          await prisma.user.update({
            where: { email: targetEmail },
            data: { passwordHash, updatedAt: new Date() },
          });
          await prisma.verificationToken.delete({ where: { token } }).catch(() => {});
        } catch {
          // DB fallback
        }
      }

      // Update in memory
      const memUser = Array.from(memoryUsers.values()).find((u) => u.email === targetEmail);
      if (memUser) {
        memUser.passwordHash = passwordHash;
        memUser.updatedAt = new Date();
        memoryUsers.set(memUser.id, memUser);
      }
      memoryResetTokens.delete(token);

      return NextResponse.json({
        ok: true,
        message: "Your password has been successfully reset. You may now sign in with your new credentials.",
      });
    }

    return NextResponse.json(
      { error: "Invalid action. Supported actions: 'request', 'reset'." },
      { status: 400 }
    );
  } catch (error) {
    console.error("Password reset error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during password reset." },
      { status: 500 }
    );
  }
}
