import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { safeNavigate, safePrefetch } from "../lib/navigation";

describe("safeNavigate utility", () => {
  const originalWindow = (global as any).window;

  beforeEach(() => {
    vi.useFakeTimers();
    // Setup window mock in Node environment
    (global as any).window = {
      location: {
        href: "http://localhost:3000/order/triage",
        pathname: "/order/triage",
        search: "",
        assign: vi.fn(),
        replace: vi.fn(),
      },
    };
  });

  afterEach(() => {
    vi.useRealTimers();
    (global as any).window = originalWindow;
  });

  it("calls router.push for normal successful transitions", () => {
    const mockRouter = {
      push: vi.fn(),
      prefetch: vi.fn(),
    };

    safeNavigate(mockRouter, "/order/precheck?pages=2&words=500");

    expect(mockRouter.push).toHaveBeenCalledWith("/order/precheck?pages=2&words=500");
    expect(window.location.assign).not.toHaveBeenCalled();
  });

  it("falls back to window.location.assign if router.push throws synchronously (e.g. Failed to fetch)", () => {
    const mockRouter = {
      push: vi.fn().mockImplementation(() => {
        throw new TypeError("Failed to fetch");
      }),
    };

    expect(() => {
      safeNavigate(mockRouter, "/order/precheck?pages=2&words=500");
    }).not.toThrow();

    expect(window.location.assign).toHaveBeenCalledWith("/order/precheck?pages=2&words=500");
  });

  it("falls back to window.location.assign if router.push rejects asynchronously", async () => {
    const mockRouter = {
      push: vi.fn().mockReturnValue(Promise.reject(new Error("Failed to fetch"))),
    };

    safeNavigate(mockRouter, "/order/precheck?pages=2&words=500");

    // Allow promise microtasks to run
    await Promise.resolve();
    await Promise.resolve();

    expect(window.location.assign).toHaveBeenCalledWith("/order/precheck?pages=2&words=500");
  });

  it("falls back to window.location.assign if transition times out", () => {
    const mockRouter = {
      push: vi.fn(), // hangs indefinitely, does not change pathname
    };

    safeNavigate(mockRouter, "/order/precheck?pages=2&words=500", {
      fallbackTimeoutMs: 1000,
    });

    expect(window.location.assign).not.toHaveBeenCalled();

    // Fast-forward 1000ms
    vi.advanceTimersByTime(1000);

    expect(window.location.assign).toHaveBeenCalledWith("/order/precheck?pages=2&words=500");
  });

  it("uses window.location.replace when options.replace is true", () => {
    const mockRouter = {
      push: vi.fn(),
      replace: vi.fn().mockImplementation(() => {
        throw new Error("Network error");
      }),
    };

    safeNavigate(mockRouter, "/order/precheck?pages=2&words=500", { replace: true });

    expect(window.location.replace).toHaveBeenCalledWith("/order/precheck?pages=2&words=500");
  });

  it("safePrefetch calls router.prefetch and handles exceptions silently", () => {
    const mockRouter = {
      prefetch: vi.fn().mockImplementation(() => {
        throw new Error("Prefetch failed");
      }),
    };

    expect(() => {
      safePrefetch(mockRouter, "/order/precheck");
    }).not.toThrow();

    expect(mockRouter.prefetch).toHaveBeenCalledWith("/order/precheck");
  });
});
