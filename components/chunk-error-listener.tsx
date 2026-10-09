"use client";

import { useEffect } from "react";

/**
 * Global client-side ChunkLoadError recovery listener.
 *
 * Catches webpack dynamic import chunk load failures caused by stale caches,
 * HMR reconnects, or server recompilations. Gracefully recovers by triggering
 * a fresh page reload instead of crashing into the Next.js dev overlay or
 * leaving the user stranded.
 */
export function ChunkErrorListener() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleChunkError = (message: string, errorObj?: any) => {
      const isChunkError =
        message.includes("ChunkLoadError") ||
        message.includes("Loading chunk") ||
        message.includes("Failed to fetch dynamically imported module") ||
        errorObj?.name === "ChunkLoadError" ||
        (typeof errorObj?.message === "string" && errorObj.message.includes("Loading chunk"));

      if (isChunkError) {
        console.warn("[VerifyLingua Chunk Recovery] Chunk load failure detected:", message);

        const now = Date.now();
        const lastReloadKey = "vl_last_chunk_recovery_reload";
        let lastReload = 0;

        try {
          lastReload = parseInt(sessionStorage.getItem(lastReloadKey) || "0", 10);
        } catch {
          // sessionStorage may fail in private browsing or restrictive iframe contexts
        }

        // Guard against infinite reload loops (allow at most once every 15 seconds)
        if (now - lastReload > 15000) {
          try {
            sessionStorage.setItem(lastReloadKey, String(now));
          } catch {
            // ignore storage quota/security errors
          }
          console.info("[VerifyLingua Chunk Recovery] Triggering automatic reload to fetch fresh bundles...");
          window.location.reload();
        }
      }
    };

    const onError = (event: ErrorEvent) => {
      const message = event.message || (event.error && event.error.message) || "";
      const target = event.target as HTMLElement | null;

      // Handle script tag load failures in capturing phase
      if (
        target &&
        target.tagName === "SCRIPT" &&
        (target as HTMLScriptElement).src?.includes("/_next/static/chunks/")
      ) {
        handleChunkError(`Script chunk load failure: ${(target as HTMLScriptElement).src}`, event.error);
        return;
      }

      if (message) {
        handleChunkError(message, event.error);
      }
    };

    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const message = typeof reason === "string" ? reason : reason?.message || "";
      if (
        message.includes("ChunkLoadError") ||
        message.includes("Loading chunk") ||
        message.includes("Failed to fetch dynamically imported module") ||
        reason?.name === "ChunkLoadError"
      ) {
        event.preventDefault(); // Prevent dev overlay from triggering
        handleChunkError(message, reason);
      }
    };

    // Use capturing phase (true) so resource errors on <script> tags are received
    window.addEventListener("error", onError, true);
    window.addEventListener("unhandledrejection", onUnhandledRejection);

    return () => {
      window.removeEventListener("error", onError, true);
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
    };
  }, []);

  return null;
}
