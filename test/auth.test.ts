import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword, evaluatePasswordStrength } from "@/lib/auth/password";
import { checkRateLimit } from "@/lib/auth/rate-limit";

describe("Authentication Security & Cryptography Suite", () => {
  describe("Password Hashing & Verification (scrypt)", () => {
    it("hashes passwords into formatted salt:key string", async () => {
      const password = "SuperSecretPassword123!";
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).toContain(":");

      const [salt, key] = hash.split(":");
      expect(salt.length).toBe(32); // 16 bytes hex
      expect(key.length).toBe(128); // 64 bytes hex
    });

    it("verifies correct password with constant-time comparison", async () => {
      const password = "LegalVaultPass99#";
      const hash = await hashPassword(password);

      const isValid = await verifyPassword(password, hash);
      expect(isValid).toBe(true);
    });

    it("rejects incorrect password cleanly without throwing", async () => {
      const password = "CorrectPassword123!";
      const hash = await hashPassword(password);

      const isInvalid = await verifyPassword("WrongPassword123!", hash);
      expect(isInvalid).toBe(false);
    });

    it("handles malformed hash strings gracefully", async () => {
      const isInvalid = await verifyPassword("AnyPassword", "malformed-hash-without-colons");
      expect(isInvalid).toBe(false);
    });
  });

  describe("Password Strength Evaluator", () => {
    it("flags short/weak passwords accurately", () => {
      const weak = evaluatePasswordStrength("short");
      expect(weak.score).toBeLessThanOrEqual(1);
      expect(weak.label).toBe("Weak");
      expect(weak.checks.minLength).toBe(false);
    });

    it("grades complex passwords as strong/very strong", () => {
      const strong = evaluatePasswordStrength("Ver1fy!Lingua#2026");
      expect(strong.score).toBeGreaterThanOrEqual(3);
      expect(strong.checks.minLength).toBe(true);
      expect(strong.checks.hasUppercase).toBe(true);
      expect(strong.checks.hasLowercase).toBe(true);
      expect(strong.checks.hasNumber).toBe(true);
      expect(strong.checks.hasSpecial).toBe(true);
    });
  });

  describe("Rate Limiting Protection", () => {
    it("allows requests under the rate limit threshold", () => {
      const testIp = "192.168.1.100";
      const result = checkRateLimit(`test:${testIp}`, 5, 10000);
      expect(result.success).toBe(true);
      expect(result.remaining).toBe(4);
    });

    it("blocks requests that exceed the rate limit threshold", () => {
      const testIp = "192.168.1.101";
      // Consume all attempts
      for (let i = 0; i < 3; i++) {
        checkRateLimit(`flood:${testIp}`, 3, 10000);
      }
      // 4th attempt should be blocked
      const blocked = checkRateLimit(`flood:${testIp}`, 3, 10000);
      expect(blocked.success).toBe(false);
      expect(blocked.remaining).toBe(0);
      expect(blocked.resetInMs).toBeGreaterThan(0);
    });
  });

  describe("Password Reset API Pipeline", () => {
    it("handles password reset request and execution cleanly", async () => {
      const { POST: resetPost } = await import("@/app/api/auth/reset-password/route");
      const { memoryUsers } = await import("@/lib/auth/dev-store");
      const { NextRequest } = await import("next/server");

      // Setup a mock test user in memory
      const testEmail = "reset-test@verifylingua.com";
      const initialHash = await hashPassword("OldPassword123!");
      memoryUsers.set("usr_test_reset", {
        id: "usr_test_reset",
        email: testEmail,
        name: "Test User",
        passwordHash: initialHash,
        role: "CUSTOMER",
        accountType: "INDIVIDUAL",
        companyName: null,
        phone: null,
        isGuest: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // 1. Request reset token
      const reqRequest = new NextRequest("http://localhost:3000/api/auth/reset-password", {
        method: "POST",
        headers: { "content-type": "application/json", "x-forwarded-for": "10.0.0.1" },
        body: JSON.stringify({ action: "request", email: testEmail }),
      });
      const resRequest = await resetPost(reqRequest);
      expect(resRequest.status).toBe(200);
      const dataRequest = await resRequest.json();
      expect(dataRequest.ok).toBe(true);
      expect(dataRequest.debugResetToken).toBeDefined();

      const resetToken = dataRequest.debugResetToken;

      // 2. Attempt reset with weak password (should fail)
      const reqWeak = new NextRequest("http://localhost:3000/api/auth/reset-password", {
        method: "POST",
        headers: { "content-type": "application/json", "x-forwarded-for": "10.0.0.2" },
        body: JSON.stringify({ action: "reset", token: resetToken, newPassword: "weak" }),
      });
      const resWeak = await resetPost(reqWeak);
      expect(resWeak.status).toBe(400);

      // 3. Attempt reset with valid token and strong password
      const newPassword = "NewSecurePassword999!";
      const reqSuccess = new NextRequest("http://localhost:3000/api/auth/reset-password", {
        method: "POST",
        headers: { "content-type": "application/json", "x-forwarded-for": "10.0.0.3" },
        body: JSON.stringify({ action: "reset", token: resetToken, newPassword }),
      });
      const resSuccess = await resetPost(reqSuccess);
      expect(resSuccess.status).toBe(200);
      const dataSuccess = await resSuccess.json();
      expect(dataSuccess.ok).toBe(true);

      // 4. Verify user's updated password hash in memory
      const updatedUser = memoryUsers.get("usr_test_reset");
      expect(updatedUser).toBeDefined();
      const isNewValid = await verifyPassword(newPassword, updatedUser!.passwordHash);
      expect(isNewValid).toBe(true);
      const isOldValid = await verifyPassword("OldPassword123!", updatedUser!.passwordHash);
      expect(isOldValid).toBe(false);
    });
  });
});

