"use client";

import * as React from "react";
import { motion } from "motion/react";
import {
  ShieldCheck,
  Clock,
  Lock,
  FileCheck2,
  Download,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  FileText,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface RealTranslationJob {
  id: string;
  fileName: string;
  fileFormat: "pdf" | "docx" | "png" | "jpg";
  fileSize: number;
  sourceLang: string;
  targetLang: string;
  status: "queued" | "extracting" | "translating" | "rebuilding" | "ready" | "failed";
  progress: number;
  currentStep: string;
  createdAt: string;
  downloadUrl?: string | null;
  qualityGate?: {
    isValidFormat: boolean;
    pageCountMatches: boolean;
    elementCountMatches: boolean;
    checksumMatches: boolean;
    byteSize: number;
    notes: string[];
  };
  error?: string;
}

interface TelemetryStreamProps {
  jobs: RealTranslationJob[];
  onRefresh: () => void;
  loading: boolean;
}

export function TelemetryStream({ jobs, onRefresh, loading }: TelemetryStreamProps) {
  const activeJobs = jobs.filter((j) => j.status !== "ready" && j.status !== "failed");
  const readyJobs = jobs.filter((j) => j.status === "ready");

  return (
    <section aria-labelledby="telemetry-heading" className="relative rounded-[32px] bg-neutral-950 text-white border border-white/10 p-8 sm:p-10 shadow-2xl overflow-hidden space-y-8">
      {/* Subtle Specular Ambient Top Glow */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 bg-emerald-500/10 blur-[100px] pointer-events-none" />

      {/* Header & Status Indicator */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2.5">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            <span id="telemetry-heading" className="font-mono text-[11px] font-bold uppercase tracking-widest text-emerald-400">
              Live Evidentiary Telemetry & Engine Stream
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-display">
            Autonomous layout preservation, <span className="italic font-normal font-serif text-neutral-300">zero government rejection.</span>
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
            Every translated document is anchored to strict USCIS 8 CFR § 103.2(b)(3) evidentiary standards with tamper-proof SHA-256 cryptographic verification seals.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="h-9 px-4 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-xs font-mono text-neutral-300 flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-emerald-400" : ""}`} />
            <span>Sync Pipeline</span>
          </button>
        </div>
      </div>

      {/* 4 Metric Bento Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 relative z-10">
        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">
              Acceptance Rate
            </span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-3xl font-black text-white font-display tracking-tight">100%</p>
          <p className="text-[11px] text-neutral-400 font-mono">0 USCIS RFEs on record</p>
        </div>

        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">
              Turnaround SLA
            </span>
            <Clock className="w-4 h-4 text-brand-300" />
          </div>
          <p className="text-3xl font-black text-white font-display tracking-tight">&lt; 24h</p>
          <p className="text-[11px] text-neutral-400 font-mono">Guaranteed delivery</p>
        </div>

        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">
              Vault Security
            </span>
            <Lock className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-3xl font-black text-white font-display tracking-tight">256-Bit</p>
          <p className="text-[11px] text-neutral-400 font-mono">SSE-KMS Encryption</p>
        </div>

        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">
              Legal Standard
            </span>
            <FileCheck2 className="w-4 h-4 text-brand-300" />
          </div>
          <p className="text-3xl font-black text-white font-display tracking-tight">8 CFR</p>
          <p className="text-[11px] text-neutral-400 font-mono">Sworn ATA Affidavits</p>
        </div>
      </div>

      {/* Real-time Jobs Stream (if any jobs exist) */}
      {jobs.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-white/10 relative z-10">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-neutral-400">
              Active Translation Pipeline ({jobs.length})
            </h3>
            <span className="text-[11px] font-mono text-neutral-400">
              {readyJobs.length} Completed • {activeJobs.length} In Pipeline
            </span>
          </div>

          <div className="space-y-3">
            {jobs.map((job) => {
              const isReady = job.status === "ready";
              const isFailed = job.status === "failed";

              return (
                <div
                  key={job.id}
                  className="p-5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/10 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="font-mono text-[10px] font-bold text-white bg-white/10 px-2 py-0.5 rounded border border-white/15 uppercase">
                        .{job.fileFormat}
                      </span>
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                          isReady
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : isFailed
                            ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                            : "bg-white/10 text-neutral-300"
                        }`}
                      >
                        {job.status.toUpperCase()}
                      </span>
                      <span className="text-xs text-neutral-400 font-mono">
                        {job.sourceLang} → {job.targetLang}
                      </span>
                      <span className="text-xs text-neutral-500 font-mono">
                        {(job.fileSize / 1024).toFixed(1)} KB
                      </span>
                    </div>

                    <p className="text-sm font-bold text-white flex items-center gap-2">
                      <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="truncate max-w-md">{job.fileName}</span>
                    </p>

                    {!isReady && !isFailed && (
                      <div className="space-y-1.5 max-w-md">
                        <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400">
                          <span>{job.currentStep}</span>
                          <span className="font-bold text-emerald-400">{job.progress}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <motion.div
                            className="h-full bg-emerald-400 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${job.progress}%` }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="shrink-0 flex items-center gap-3">
                    {isReady && job.downloadUrl ? (
                      <Button
                        asChild
                        size="sm"
                        className="h-8 rounded-xl bg-emerald-400 hover:bg-emerald-500 text-neutral-950 font-bold text-xs gap-1.5"
                      >
                        <a href={job.downloadUrl} download>
                          <Download className="w-3.5 h-3.5" />
                          Download .{job.fileFormat.toUpperCase()}
                        </a>
                      </Button>
                    ) : !isFailed ? (
                      <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                        <span>Rendering Layout...</span>
                      </div>
                    ) : (
                      <span className="text-xs font-mono text-rose-400">Pipeline Error</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
