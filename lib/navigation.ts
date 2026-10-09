/**
 * Safe navigation utility for Next.js App Router client-side transitions.
 *
 * Next.js router.push performs client-side RSC fetching in the background.
 * If the connection drops, dev server recompiles, or memory pressure interrupts
 * the RSC fetch, router.push throws or rejects with `TypeError: Failed to fetch`.
 *
 * safeNavigate wraps router.push in comprehensive error handling and falls back
 * to standard browser navigation (window.location.assign) if client routing fails
 * or hangs, guaranteeing the user is never stranded on a step.
 */

export interface SafeNavigateOptions {
  /**
   * Timeout in milliseconds before falling back to window.location.assign
   * if the client-side router transition does not complete. Defaults to 2000ms.
   */
  fallbackTimeoutMs?: number;
  /**
   * Whether to replace history instead of push.
   */
  replace?: boolean;
}

export function safePrefetch(
  router: { prefetch?: (url: string) => void } | null | undefined,
  url: string
): void {
  try {
    if (router && typeof router.prefetch === "function") {
      router.prefetch(url);
    }
  } catch {
    // Ignore prefetch errors silently
  }
}

export function safeNavigate(
  router: { push: (url: string) => any; replace?: (url: string) => any } | null | undefined,
  targetUrl: string,
  options?: SafeNavigateOptions
): void {
  if (typeof window === "undefined") return;

  const fallbackTimeoutMs = options?.fallbackTimeoutMs ?? 2000;
  let didFallback = false;

  const triggerFallback = (reason?: string) => {
    if (didFallback) return;
    didFallback = true;
    if (reason) {
      console.warn(`[safeNavigate] Falling back to window.location: ${reason}`);
    }
    try {
      if (options?.replace) {
        window.location.replace(targetUrl);
      } else {
        window.location.assign(targetUrl);
      }
    } catch {
      // In case assign/replace is blocked or mocked in non-standard environments
      window.location.href = targetUrl;
    }
  };

  if (!router || typeof router.push !== "function") {
    triggerFallback("Router not available");
    return;
  }

  // Timer in case router.push silently hangs during dev server compilation
  const timer = setTimeout(() => {
    try {
      const currentLoc = window.location.pathname + window.location.search;
      if (currentLoc !== targetUrl) {
        triggerFallback("Transition timed out");
      }
    } catch {
      triggerFallback("Transition check failed");
    }
  }, fallbackTimeoutMs);

  try {
    const navFn = options?.replace && typeof router.replace === "function" ? router.replace : router.push;
    const res = navFn.call(router, targetUrl);

    // If router.push returns a promise / thenable
    if (res && typeof (res as Promise<any>).then === "function") {
      (res as Promise<any>)
        .then(() => {
          clearTimeout(timer);
        })
        .catch((err) => {
          clearTimeout(timer);
          triggerFallback(`Promise rejected with ${err?.message || err}`);
        });
    }
  } catch (err: any) {
    clearTimeout(timer);
    triggerFallback(`Synchronous error: ${err?.message || err}`);
  }
}
