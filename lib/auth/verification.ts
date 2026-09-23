import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { memoryUsers, memoryVerificationTokens } from "@/lib/auth/dev-store";
import { recordAuthAuditEvent } from "@/lib/auth/audit";

const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

export interface VerificationResult {
  success: boolean;
  email?: string;
  error?: string;
}

/**
 * Creates and stores a cryptographic email verification token
 */
export async function createVerificationToken(email: string): Promise<string> {
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + TOKEN_EXPIRY_MS);
  const normalizedEmail = email.trim().toLowerCase();

  // 1. Store in memory map
  memoryVerificationTokens.set(token, {
    identifier: normalizedEmail,
    token,
    expires,
  });

  // 2. Persist to Prisma VerificationToken table
  if (!process.env.VITEST) {
    try {
      // Clean up prior tokens for this email
      await prisma.verificationToken.deleteMany({
        where: { identifier: normalizedEmail },
      });

      await prisma.verificationToken.create({
        data: {
          identifier: normalizedEmail,
          token,
          expires,
        },
      });
    } catch (error) {
      console.warn("Notice: Prisma verification token write skipped (memory store active):", error);
    }
  }

  // 3. Dispatch or log transactional email
  await dispatchVerificationEmail(normalizedEmail, token);

  return token;
}

/**
 * Validates a verification token, activates user email verification status,
 * and clears the consumed token.
 */
export async function verifyEmailToken(token: string): Promise<VerificationResult> {
  if (!token || typeof token !== "string" || token.length < 16) {
    return { success: false, error: "Invalid verification token format." };
  }

  let matchedEmail: string | null = null;

  // 1. Try Prisma DB
  if (!process.env.VITEST) {
    try {
      const record = await prisma.verificationToken.findUnique({
        where: { token },
      });

      if (record) {
        if (record.expires < new Date()) {
          await prisma.verificationToken.delete({ where: { token } }).catch(() => {});
          return { success: false, error: "Verification token has expired. Please request a new one." };
        }
        matchedEmail = record.identifier;
        // Delete token once consumed
        await prisma.verificationToken.delete({ where: { token } }).catch(() => {});
      }
    } catch {
      // Fall through to memory store
    }
  }

  // 2. Fallback to memory store
  if (!matchedEmail) {
    const memToken = memoryVerificationTokens.get(token);
    if (memToken) {
      if (memToken.expires < new Date()) {
        memoryVerificationTokens.delete(token);
        return { success: false, error: "Verification token has expired. Please request a new one." };
      }
      matchedEmail = memToken.identifier;
      memoryVerificationTokens.delete(token);
    }
  }

  if (!matchedEmail) {
    return { success: false, error: "Verification token not found or already redeemed." };
  }

  // 3. Mark user as emailVerified
  const verifiedAt = new Date();
  let userUpdated = false;

  if (!process.env.VITEST) {
    try {
      await prisma.user.update({
        where: { email: matchedEmail },
        data: { emailVerified: verifiedAt },
      });
      userUpdated = true;
    } catch {
      // Memory fallback
    }
  }

  // Also update memory user if present
  for (const [, memUser] of memoryUsers.entries()) {
    if (memUser.email === matchedEmail) {
      memUser.emailVerified = verifiedAt;
      userUpdated = true;
      break;
    }
  }

  await recordAuthAuditEvent({
    action: "EMAIL_VERIFICATION_SUCCESS",
    details: { email: matchedEmail, verifiedAt: verifiedAt.toISOString() },
  });

  return { success: true, email: matchedEmail };
}

/**
 * Dispatches verification email via Resend or simulated institutional logger
 */
async function dispatchVerificationEmail(email: string, token: string): Promise<void> {
  const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "https://verifylingua.com";
  const verificationLink = `${baseUrl}/verify-email?token=${encodeURIComponent(token)}`;

  // If RESEND_API_KEY is available, we can trigger via Resend
  if (process.env.RESEND_API_KEY) {
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: "VerifyLingua Trust & Safety <security@verifylingua.com>",
        to: email,
        subject: "Verify your VerifyLingua Legal & USCIS Translation Vault",
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 580px; margin: 0 auto; padding: 32px; background: #ffffff; border: 1px solid #e2e8f0; rounded: 16px;">
            <div style="margin-bottom: 24px;">
              <h2 style="color: #0b1528; margin: 0 0 8px 0; font-size: 22px; font-weight: 800;">Verify your translation vault</h2>
              <p style="color: #64748b; font-size: 14px; margin: 0;">VerifyLingua Certified Translations & USCIS Compliance</p>
            </div>
            <p style="color: #334155; font-size: 15px; line-height: 1.6;">
              Please confirm your email address to ensure certified affidavits, ATA notarizations, and USCIS filing copies are securely bound to your verified identity.
            </p>
            <div style="margin: 32px 0;">
              <a href="${verificationLink}" style="background-color: #0b1528; color: #ffffff; font-weight: 700; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-size: 14px;">
                Verify Email Address
              </a>
            </div>
            <p style="color: #94a3b8; font-size: 12px; line-height: 1.5;">
              Or paste this link into your browser:<br/>
              <a href="${verificationLink}" style="color: #2563eb; word-break: break-all;">${verificationLink}</a>
            </p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
            <p style="color: #94a3b8; font-size: 11px; margin: 0;">
              This link expires in 24 hours. If you did not create an account on VerifyLingua, please disregard this email.
            </p>
          </div>
        `,
      });
    } catch (err) {
      console.warn("Notice: Resend email dispatch caught error:", err);
    }
  } else {
    // In dev / test / mock mode, log verification link safely
    console.log(`[AUTH][VERIFICATION_EMAIL] Generated link for ${email}: ${verificationLink}`);
  }

  await recordAuthAuditEvent({
    action: "EMAIL_VERIFICATION_SENT",
    details: { email },
  });
}
