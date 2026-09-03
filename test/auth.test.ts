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
});
