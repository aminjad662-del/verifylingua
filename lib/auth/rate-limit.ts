interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Clean up stale IP records every 15 minutes to prevent memory leaks
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of rateLimitStore.entries()) {
      record.timestamps = record.timestamps.filter((ts) => now - ts < 3600000);
      if (record.timestamps.length === 0) {
        rateLimitStore.delete(ip);
      }
    }
  }, 15 * 60 * 1000).unref?.();
}

/**
 * Enforces in-memory sliding window rate limiting.
 * @param key Unique key (e.g. IP address or email)
 * @param maxAttempts Max allowed attempts within the window
 * @param windowMs Time window in milliseconds (default 10 minutes)
 * @returns { success: boolean, remaining: number, resetInMs: number }
 */
export function checkRateLimit(
  key: string,
  maxAttempts: number = 10,
  windowMs: number = 10 * 60 * 1000
): { success: boolean; remaining: number; resetInMs: number } {
  const now = Date.now();
  const record = rateLimitStore.get(key) ?? { timestamps: [] };

  // Filter timestamps within current window
  record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);

  if (record.timestamps.length >= maxAttempts) {
    const oldest = record.timestamps[0];
    const resetInMs = Math.max(0, windowMs - (now - oldest));
    return { success: false, remaining: 0, resetInMs };
  }

  record.timestamps.push(now);
  rateLimitStore.set(key, record);

  return {
    success: true,
    remaining: maxAttempts - record.timestamps.length,
    resetInMs: windowMs,
  };
}
