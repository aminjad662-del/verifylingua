"use client";

import React, { useEffect, useState } from "react";
import { AlertCircle, RefreshCw, Home, ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [isChunkError, setIsChunkError] = useState(false);
  const [autoReloadCountdown, setAutoReloadCountdown] = useState<number | null>(null);

  useEffect(() => {
    const errorMsg = error?.message || "";
    const isChunk =
      error?.name === "ChunkLoadError" ||
      errorMsg.includes("Loading chunk") ||
      errorMsg.includes("Failed to fetch dynamically imported module");

    setIsChunkError(isChunk);

    if (isChunk) {
      console.warn("[RootError] Detected ChunkLoadError:", error);
      // Initiate a quick 2-second reload countdown for seamless recovery
      setAutoReloadCountdown(2);
      const timer = setInterval(() => {
        setAutoReloadCountdown((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(timer);
            window.location.reload();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [error]);

  const handleManualReload = () => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-lg bg-white border border-slate-200 shadow-sm rounded-xl p-6 sm:p-8 space-y-6">
        {/* Header Icon & Title */}
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-700 shrink-0">
            {isChunkError ? (
              <RefreshCw className="w-5 h-5 animate-spin" style={{ animationDuration: "3s" }} />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-600" />
            )}
          </div>
          <div className="space-y-1 min-w-0">
            <h1 className="text-xl font-semibold tracking-tight text-slate-900">
              {isChunkError ? "Application Bundles Updated" : "An unexpected error occurred"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              {isChunkError
                ? "The active application session received a bundle update or recompilation. Refreshing to load the latest code."
                : "An issue occurred while processing your request. You can retry or return to the main dashboard."}
            </p>
          </div>
        </div>

        {/* Technical Error Preview (Condensed) */}
        <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-xs font-mono text-slate-600 break-all space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400">Diagnostic Details</div>
          <div>{error.message || "Unknown runtime exception"}</div>
          {error.digest && (
            <div className="text-[10px] text-slate-400">Digest: {error.digest}</div>
          )}
        </div>

        {/* Action Controls */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
          <button
            type="button"
            onClick={handleManualReload}
            className="w-full sm:flex-1 h-11 px-4 rounded-lg bg-slate-950 text-white text-xs sm:text-sm font-medium hover:bg-slate-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <RefreshCw className="w-4 h-4" />
            <span>
              {isChunkError && autoReloadCountdown !== null
                ? `Reloading in ${autoReloadCountdown}s...`
                : "Reload Application"}
            </span>
          </button>

          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto h-11 px-4 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs sm:text-sm font-medium hover:bg-slate-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            Try Again
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto h-11 px-4 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs sm:text-sm font-medium hover:bg-slate-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <Home className="w-4 h-4 text-slate-500" />
            <span>Home</span>
          </Link>
        </div>

        {/* Security / Confidentiality Note */}
        <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-400">
          <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
          <span>Uploaded documents and session data remain securely preserved.</span>
        </div>
      </div>
    </div>
  );
}
