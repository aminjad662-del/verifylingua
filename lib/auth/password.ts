import crypto from "crypto";

/**
 * Hash a plain-text password using OWASP-recommended scrypt algorithm.
 * Formats output as: <salt-hex>:<key-hex>
 */
export async function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString("hex");
    crypto.scrypt(password, salt, 64, { N: 16384, r: 8, p: 1 }, (err, derivedKey) => {
      if (err) return reject(err);
      resolve(`${salt}:${derivedKey.toString("hex")}`);
    });
  });
}

/**
 * Verify a plain-text password against a stored scrypt hash using constant-time comparison.
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  return new Promise((resolve) => {
    const parts = storedHash.split(":");
    if (parts.length !== 2) return resolve(false);

    const [salt, expectedKeyHex] = parts;
    const expectedBuffer = Buffer.from(expectedKeyHex, "hex");

    crypto.scrypt(password, salt, expectedBuffer.length, { N: 16384, r: 8, p: 1 }, (err, derivedKey) => {
      if (err) return resolve(false);
      try {
        const isMatch = crypto.timingSafeEqual(derivedKey, expectedBuffer);
        resolve(isMatch);
      } catch {
        resolve(false);
      }
    });
  });
}

export interface PasswordStrengthResult {
  score: number; // 0 to 4
  label: "Weak" | "Fair" | "Good" | "Strong" | "Very Strong";
  patternWarning?: string;
  checks: {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecial: boolean;
  };
}

const COMMON_PATTERNS = [
  "password",
  "123456",
  "12345678",
  "qwerty",
  "admin123",
  "welcome",
  "verifylingua",
  "uscis123",
  "iloveyou",
  "letmein",
];

/**
 * Real-time password strength evaluator with OWASP dictionary and entropy checks.
 */
export function evaluatePasswordStrength(password: string): PasswordStrengthResult {
  const checks = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password),
  };

  const lower = password.toLowerCase();
  const isCommonTrivial = COMMON_PATTERNS.some((pat) => {
    if (lower === pat || lower.startsWith(`${pat}123`) || lower === `${pat}!` || lower === `${pat}1`) return true;
    if (password.length <= 12 && lower.includes(pat)) return true;
    return false;
  });
  const isRepeatedChar = /^(.)\1{4,}$/.test(password);

  let score = 0;
  if (checks.minLength) score += 1;
  if (checks.hasUppercase && checks.hasLowercase) score += 1;
  if (checks.hasNumber) score += 1;
  if (checks.hasSpecial) score += 1;

  if (isCommonTrivial || isRepeatedChar) {
    return {
      score: Math.min(score, 1),
      label: "Weak",
      patternWarning: isCommonTrivial
        ? "Password contains easily guessable pattern."
        : "Avoid repeated characters.",
      checks,
    };
  }

  // Extra entropy bonus for 12+ chars
  if (password.length >= 12 && score === 4) {
    return { score: 4, label: "Very Strong", checks };
  }

  const labels: Record<number, PasswordStrengthResult["label"]> = {
    0: "Weak",
    1: "Weak",
    2: "Fair",
    3: "Good",
    4: "Strong",
  };

  return {
    score,
    label: labels[score] || "Weak",
    checks,
  };
}
