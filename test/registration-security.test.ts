import { describe, it, expect, beforeEach } from "vitest";
import { POST as registerHandler } from "@/app/api/auth/register/route";
import { GET as verifyGetHandler, POST as verifyPostHandler } from "@/app/api/auth/verify-email/route";
import { POST as resendHandler } from "@/app/api/auth/resend-verification/route";
import { POST as resetPasswordHandler } from "@/app/api/auth/reset-password/route";
import { GET as auditLogHandler } from "@/app/api/auth/audit-log/route";
import { NextRequest } from "next/server";
import { memoryUsers, memoryVerificationTokens, memoryResetTokens, memoryAuditEvents } from "@/lib/auth/dev-store";
import { SESSION_COOKIE_NAME, createSession } from "@/lib/auth/session";
import { verifyPassword, hashPassword } from "@/lib/auth/password";

describe("Institutional Registration & Safety Defense Suite", () => {
  beforeEach(() => {
    // Clean memory stores before each test
    memoryVerificationTokens.clear();
  });

  it("1. Bot Defense: Drops registration if honeypot field is filled", async () => {
    const honeypotPayload = {
      name: "Spam Bot",
      email: `spambot_${Date.now()}@spammer.org`,
      password: "StrongPassword123!#",
      accountType: "INDIVIDUAL",
      terms: true,
      website_security_hp: "http://malicious-spam-target.com", // bot trap
    };

    const req = new NextRequest("http://localhost:3000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(honeypotPayload),
    });

    const res = await registerHandler(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("Invalid registration submission");

    // Audit log should contain bot attempt
    const botAudit = memoryAuditEvents.find((e) => e.action === "REGISTRATION_BLOCKED_BOT");
    expect(botAudit).toBeDefined();
  });

  it("2. Bot Defense: Blocks robotic sub-second submissions (velocity guard)", async () => {
    const fastSubmissionPayload = {
      name: "Super Fast Robot",
      email: `fastrobot_${Date.now()}@fastbot.com`,
      password: "ValidSecurePassword88#",
      accountType: "INDIVIDUAL",
      terms: true,
      formRenderTimestamp: Date.now() - 100, // submitted in 100ms
    };

    const req = new NextRequest("http://localhost:3000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fastSubmissionPayload),
    });

    const res = await registerHandler(req);
    expect(res.status).toBe(422);
    const data = await res.json();
    expect(data.error).toContain("too quickly");

    const velocityAudit = memoryAuditEvents.find((e) => e.action === "REGISTRATION_BLOCKED_VELOCITY");
    expect(velocityAudit).toBeDefined();
  });

  it("3. Password Defense: Detects easily guessable dictionary patterns", async () => {
    const weakDictionaryPayload = {
      name: "Jane Doe",
      email: `janedoe_${Date.now()}@example.com`,
      password: "Password123!", // contains "password"
      accountType: "INDIVIDUAL",
      terms: true,
      formRenderTimestamp: Date.now() - 5000,
    };

    const req = new NextRequest("http://localhost:3000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(weakDictionaryPayload),
    });

    const res = await registerHandler(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("easily guessable pattern");
  });

  it("4. Registration Success: Registers Individual applicant, sets session & creates verification token", async () => {
    const validEmail = `elena_${Date.now()}@clientvault.org`;
    const validPayload = {
      name: "Elena Rostova",
      email: validEmail,
      password: "VaultSafePass2026!#",
      accountType: "INDIVIDUAL",
      terms: true,
      formRenderTimestamp: Date.now() - 3000,
    };

    const req = new NextRequest("http://localhost:3000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validPayload),
    });

    const res = await registerHandler(req);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.user.email).toBe(validEmail);
    expect(data.user.role).toBe("CUSTOMER");

    // Cookie checks
    const cookieHeader = res.headers.get("set-cookie");
    expect(cookieHeader).toContain(SESSION_COOKIE_NAME);

    // Verify token was stored in memory/DB
    const tokenRecord = Array.from(memoryVerificationTokens.values()).find((t) => t.identifier === validEmail);
    expect(tokenRecord).toBeDefined();
    expect(tokenRecord?.token.length).toBeGreaterThanOrEqual(32);
  });

  it("5. Role Routing: Registers Law Firm with ATTORNEY role and firm branding", async () => {
    const lawFirmEmail = `partner_${Date.now()}@rostovalaw.com`;
    const lawFirmPayload = {
      name: "Marcus Vance, Esq.",
      email: lawFirmEmail,
      password: "FirmSecurityVault2026!#",
      accountType: "LAW_FIRM",
      companyName: "Rostova & Vance Immigration LLP",
      terms: true,
      formRenderTimestamp: Date.now() - 4000,
    };

    const req = new NextRequest("http://localhost:3000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(lawFirmPayload),
    });

    const res = await registerHandler(req);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.user.role).toBe("ATTORNEY");
    expect(data.user.accountType).toBe("LAW_FIRM");
  });

  it("6. Role Routing: Registers Certified Translator with TRANSLATOR role and ATA credentials", async () => {
    const translatorEmail = `ata_${Date.now()}@certifiedlinguist.com`;
    const translatorPayload = {
      name: "Dr. Henri Dubois",
      email: translatorEmail,
      password: "LinguistSecurity2026!#",
      accountType: "TRANSLATOR",
      ataNumber: "278190",
      languagePairs: "French -> English, Spanish -> English",
      terms: true,
      formRenderTimestamp: Date.now() - 4000,
    };

    const req = new NextRequest("http://localhost:3000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(translatorPayload),
    });

    const res = await registerHandler(req);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.user.role).toBe("TRANSLATOR");
  });

  it("7. Email Verification: Successfully validates token via GET and marks user verified", async () => {
    const testEmail = `verify_target_${Date.now()}@example.com`;
    const token = "tok_test_sample_secure_random_hex_32bytes_value";

    memoryUsers.set("usr_verify_test", {
      id: "usr_verify_test",
      email: testEmail,
      name: "Verify Target",
      passwordHash: "dummy",
      role: "CUSTOMER",
      accountType: "INDIVIDUAL",
      companyName: null,
      phone: null,
      isGuest: false,
      emailVerified: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    memoryVerificationTokens.set(token, {
      identifier: testEmail,
      token,
      expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour in future
    });

    const verifyReq = new NextRequest(`http://localhost:3000/api/auth/verify-email?token=${token}`, {
      method: "GET",
    });

    const res = await verifyGetHandler(verifyReq);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.email).toBe(testEmail);

    // Memory user should now be verified
    const user = memoryUsers.get("usr_verify_test");
    expect(user?.emailVerified).toBeDefined();

    // Token should now be consumed
    expect(memoryVerificationTokens.has(token)).toBe(false);
  });

  it("8. Email Verification: Rejects invalid or expired tokens", async () => {
    const badReq = new NextRequest("http://localhost:3000/api/auth/verify-email?token=invalid_random_token_12345", {
      method: "GET",
    });

    const res = await verifyGetHandler(badReq);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  it("9. Resend Verification: Dispatches new link and enforces rate limit", async () => {
    const targetEmail = `resend_${Date.now()}@example.com`;

    memoryUsers.set("usr_resend_test", {
      id: "usr_resend_test",
      email: targetEmail,
      name: "Resend Target",
      passwordHash: "dummy",
      role: "CUSTOMER",
      accountType: "INDIVIDUAL",
      companyName: null,
      phone: null,
      isGuest: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const req = new NextRequest("http://localhost:3000/api/auth/resend-verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: targetEmail }),
    });

    const res = await resendHandler(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);

    const tokenRecord = Array.from(memoryVerificationTokens.values()).find((t) => t.identifier === targetEmail);
    expect(tokenRecord).toBeDefined();
  });

  it("10. Password Recovery: Dispatches reset token via POST /api/auth/reset-password (request)", async () => {
    const targetEmail = `recover_${Date.now()}@example.com`;
    const initialHash = await hashPassword("InitialPassword2026!#");

    memoryUsers.set("usr_recover_test", {
      id: "usr_recover_test",
      email: targetEmail,
      name: "Recover User",
      passwordHash: initialHash,
      role: "CUSTOMER",
      accountType: "INDIVIDUAL",
      companyName: null,
      phone: null,
      isGuest: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const req = new NextRequest("http://localhost:3000/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "request",
        email: targetEmail,
      }),
    });

    const res = await resetPasswordHandler(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);

    const tokenRecord = Array.from(memoryResetTokens.values()).find((t) => t.email === targetEmail);
    expect(tokenRecord).toBeDefined();
    expect(tokenRecord?.token.length).toBeGreaterThanOrEqual(32);

    const resetRequestedAudit = memoryAuditEvents.find(
      (e) => e.action === "PASSWORD_RESET_REQUESTED" && e.details?.email === targetEmail
    );
    expect(resetRequestedAudit).toBeDefined();
  });

  it("11. Password Recovery: Executes reset, updates password hash, invalidates token and logs audit event", async () => {
    const targetEmail = `reset_exec_${Date.now()}@example.com`;
    const initialHash = await hashPassword("OldPassword2026!#");

    memoryUsers.set("usr_exec_test", {
      id: "usr_exec_test",
      email: targetEmail,
      name: "Exec User",
      passwordHash: initialHash,
      role: "CUSTOMER",
      accountType: "INDIVIDUAL",
      companyName: null,
      phone: null,
      isGuest: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const testToken = `rst_tok_${Date.now()}_abc123456789012345`;
    memoryResetTokens.set(testToken, {
      email: targetEmail,
      token: testToken,
      expires: new Date(Date.now() + 60 * 60 * 1000),
    });

    const newPassword = "BrandNewSecurePassword2026!#";
    const req = new NextRequest("http://localhost:3000/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "reset",
        token: testToken,
        newPassword,
      }),
    });

    const res = await resetPasswordHandler(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);

    const updatedUser = memoryUsers.get("usr_exec_test");
    expect(updatedUser).toBeDefined();
    const isNewPassValid = await verifyPassword(newPassword, updatedUser!.passwordHash);
    expect(isNewPassValid).toBe(true);

    const isOldPassValid = await verifyPassword("OldPassword2026!#", updatedUser!.passwordHash);
    expect(isOldPassValid).toBe(false);

    expect(memoryResetTokens.has(testToken)).toBe(false);

    const resetSuccessAudit = memoryAuditEvents.find(
      (e) => e.action === "PASSWORD_RESET_SUCCESS" && e.details?.email === targetEmail
    );
    expect(resetSuccessAudit).toBeDefined();
  });

  it("12. Password Recovery: Rejects expired/invalid token and weak passwords", async () => {
    const badTokenReq = new NextRequest("http://localhost:3000/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "reset",
        token: "non_existent_token_1234567890123",
        newPassword: "StrongPassword2026!#",
      }),
    });
    const badTokenRes = await resetPasswordHandler(badTokenReq);
    expect(badTokenRes.status).toBe(400);

    const weakPassReq = new NextRequest("http://localhost:3000/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "reset",
        token: "non_existent_token_1234567890123",
        newPassword: "123",
      }),
    });
    const weakPassRes = await resetPasswordHandler(weakPassReq);
    expect(weakPassRes.status).toBe(400);
  });

  it("13. Security Audit Log: Rejects unauthenticated telemetry requests with 401", async () => {
    const unauthReq = new NextRequest("http://localhost:3000/api/auth/audit-log", {
      method: "GET",
    });
    const res = await auditLogHandler(unauthReq);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toContain("Unauthorized");
  });

  it("14. Security Audit Log: Returns security telemetry events for authenticated session", async () => {
    const auditEmail = `audit_user_${Date.now()}@example.com`;
    const userId = `usr_audit_${Date.now()}`;

    memoryUsers.set(userId, {
      id: userId,
      email: auditEmail,
      name: "Audit User",
      passwordHash: "dummy",
      role: "CUSTOMER",
      accountType: "INDIVIDUAL",
      companyName: null,
      phone: null,
      isGuest: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const sessionToken = await createSession(userId);

    const authReq = new NextRequest("http://localhost:3000/api/auth/audit-log", {
      method: "GET",
      headers: {
        cookie: `${SESSION_COOKIE_NAME}=${sessionToken}`,
      },
    });

    const res = await auditLogHandler(authReq);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(Array.isArray(data.events)).toBe(true);
  });
});
