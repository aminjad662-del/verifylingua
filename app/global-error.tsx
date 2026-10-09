"use client";

import React, { useEffect, useState } from "react";
import { AlertCircle, RefreshCw, Home } from "lucide-react";

import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [isChunkError, setIsChunkError] = useState(false);

  useEffect(() => {
    const errorMsg = error?.message || "";
    const isChunk =
      error?.name === "ChunkLoadError" ||
      errorMsg.includes("Loading chunk") ||
      errorMsg.includes("Failed to fetch dynamically imported module");

    setIsChunkError(isChunk);

    if (isChunk) {
      console.warn("[GlobalError] Detected ChunkLoadError, reloading window:", error);
      const timer = setTimeout(() => {
        window.location.reload();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleManualReload = () => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  return (
    <html lang="en">
      <body className="min-h-screen bg-canvas flex items-center justify-center p-4 sm:p-6 font-sans text-slate-900 antialiased">
        <div className="w-full max-w-lg bg-white border border-slate-200 shadow-sm rounded-xl p-6 sm:p-8 space-y-6">
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
                {isChunkError ? "Application Bundles Updated" : "Critical Application Error"}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                {isChunkError
                  ? "A new version of the application has been built or recompiled. Refreshing to synchronize client chunks."
                  : "An unexpected error occurred at the root level. Please refresh the page to reload the application."}
              </p>
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-xs font-mono text-slate-600 break-all space-y-1">
            <div className="text-[10px] uppercase font-bold text-slate-400">Diagnostic Details</div>
            <div>{error.message || "Unknown root layout error"}</div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              onClick={handleManualReload}
              className="w-full sm:flex-1 h-11 px-4 rounded-lg bg-slate-950 text-white text-xs sm:text-sm font-medium hover:bg-slate-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reload Application</span>
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
        </div>
      </body>
    </html>
  );
}
