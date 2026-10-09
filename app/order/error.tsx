"use client";

import React, { useEffect, useState } from "react";
import { AlertCircle, RefreshCw, ArrowLeft, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function OrderError({
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
      console.warn("[OrderError] Detected ChunkLoadError in order funnel:", error);
      // Auto-reload within 1.5 seconds so user seamlessly continues
      const timer = setTimeout(() => {
        window.location.reload();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleReload = () => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-700 shrink-0">
            {isChunkError ? (
              <RefreshCw className="w-6 h-6 animate-spin" style={{ animationDuration: "3s" }} />
            ) : (
              <AlertCircle className="w-6 h-6 text-amber-600" />
            )}
          </div>
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                Order Flow Protection
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              {isChunkError ? "Updating Order Studio Components..." : "Order Step Disruption"}
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              {isChunkError
                ? "Your browser is loading updated order funnel assets. Your uploaded files and document configuration remain intact in session storage."
                : "An unexpected error occurred during this step. Your document data is saved and you can retry without starting over."}
            </p>
          </div>
        </div>

        <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-mono text-slate-600 break-all space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400">Diagnostic Details</div>
          <div>{error.message || "Unknown error"}</div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleReload}
            className="w-full sm:flex-1 h-12 px-5 rounded-xl bg-slate-950 text-white text-sm font-semibold hover:bg-slate-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <RefreshCw className="w-4 h-4" />
            <span>{isChunkError ? "Reload Step Now" : "Refresh Page"}</span>
          </button>

          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto h-12 px-5 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            Retry Step
          </button>

          <Link
            href="/order/triage"
            className="w-full sm:w-auto h-12 px-5 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500" />
            <span>Restart Triage</span>
          </Link>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Session encrypted & cached. No data was lost.</span>
        </div>
      </div>
    </div>
  );
}
