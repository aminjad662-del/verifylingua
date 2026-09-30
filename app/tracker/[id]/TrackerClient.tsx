"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Lock,
  Download,
  ExternalLink,
  Clock,
  ArrowRight,
  Sparkles,
  Layers,
  Cpu,
  LayoutTemplate,
  Copy,
  Check,
  RefreshCw,
  FileCheck,
  AlertOctagon,
  ArrowLeft,
  ChevronRight,
  Eye,
  FileDown,
  Shield,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface JobStatusData {
  jobId: string;
  status: "queued" | "extracting" | "translating" | "rendering" | "verifying" | "completed" | "ready" | "failed" | string;
  currentPhase: string;
  progress: number;
  currentStep: string;
  fileName: string;
  fileFormat: string;
  sourceLang: string;
  targetLang: string;
  pageCount: number;
  artifactUrl?: string | null;
  downloadUrl?: string | null;
  layoutPreserved?: boolean;
  error?: string | null;
  createdAt?: string;
  completedAt?: string | null;
}

interface PhaseDefinition {
  key: "extracting" | "translating" | "rendering" | "verifying";
  title: string;
  category: string;
  description: string;
  icon: React.ElementType;
}

const PHASES: PhaseDefinition[] = [
  {
    key: "extracting",
    title: "Document Extraction",
    category: "OCR & Spatial Layout",
    description: "Analyzing source vector paths, OCR character isolation, and sub-pixel bounding box mapping.",
    icon: Layers,
  },
  {
    key: "translating",
    title: "Certified Translation",
    category: "Neural & ATA Engine",
    description: "Legal translation execution with strict numeric parity, locked glossary terms, and zero hallucinations.",
    icon: Cpu,
  },
  {
    key: "rendering",
    title: "Vector Typesetting",
    category: "BiDi & Font Fitting",
    description: "Dynamic typographic reflow, bidirectional RTL/LTR text shaping, and original background preservation.",
    icon: LayoutTemplate,
  },
  {
    key: "verifying",
    title: "Legal QA & Seal",
    category: "8 CFR § 103.2 Standards",
    description: "Automated parity assertions, ATA certification affidavit compilation, and cryptographic SHA-256 seal.",
    icon: ShieldCheck,
  },
];

interface TrackerClientProps {
  initialId?: string;
}

export default function TrackerClient({ initialId }: TrackerClientProps) {
  const params = useParams();
  const router = useRouter();

  // Resolve tracking id from params, props, or window location
  const paramId = (params?.id as string) || initialId;
  const [resolvedId, setResolvedId] = React.useState<string>(paramId || "VL-DEMO1");

  React.useEffect(() => {
    if (paramId) {
      setResolvedId(paramId);
    } else if (typeof window !== "undefined") {
      const parts = window.location.pathname.split("/").filter(Boolean);
      const last = parts[parts.length - 1];
      if (last && last !== "tracker") {
        setResolvedId(last);
      }
    }
  }, [paramId]);

  const [jobData, setJobData] = React.useState<JobStatusData | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [pollError, setPollError] = React.useState<string | null>(null);
  const [hasCopiedId, setHasCopiedId] = React.useState<boolean>(false);
  const [auditLogs, setAuditLogs] = React.useState<{ time: string; text: string; tag: string }[]>([]);

  // Telemetry stream helper
  const addLog = React.useCallback((text: string, tag = "INFO") => {
    const time = new Date().toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    setAuditLogs((prev) => {
      if (prev.some((l) => l.text === text)) return prev;
      return [...prev.slice(-7), { time, text, tag }];
    });
  }, []);

  // Polling with resilience and exponential backoff on 429
  React.useEffect(() => {
    if (!resolvedId) return;

    let isMounted = true;
    let timer: NodeJS.Timeout | null = null;
    let consecutive429 = 0;

    const fetchStatus = async () => {
      try {
        const response = await fetch(`/api/jobs/${encodeURIComponent(resolvedId)}/status`, {
          headers: { Accept: "application/json" },
          cache: "no-store",
        });

        if (!isMounted) return;

        // Rate limit backoff
        if (response.status === 429) {
          consecutive429++;
          const delay = Math.min(15000, 2000 * Math.pow(1.5, consecutive429));
          addLog(`Rate limit throttled (429). Backing off for ${(delay / 1000).toFixed(1)}s`, "WARN");
          timer = setTimeout(fetchStatus, delay);
          return;
        }
        consecutive429 = 0;

        if (!response.ok) {
          // If 404 or server error, handle gracefully
          if (response.status === 404) {
            setPollError(`Job "${resolvedId}" was not found. If you just submitted, initializing job stream...`);
          } else {
            setPollError(`Status check failed (${response.status}). Retrying...`);
          }
          timer = setTimeout(fetchStatus, 3000);
          return;
        }

        const data: JobStatusData = await response.json();
        if (!isMounted) return;

        setJobData(data);
        setIsLoading(false);
        setPollError(null);

        // Append log events based on status
        if (data.currentStep) {
          addLog(data.currentStep, data.status === "failed" ? "ERROR" : "PROGRESS");
        }

        // Terminal states: stop polling
        const isDone =
          data.status === "completed" ||
          data.status === "ready" ||
          data.status === "failed" ||
          data.progress >= 100;

        if (!isDone) {
          timer = setTimeout(fetchStatus, 2000);
        } else if (data.status === "completed" || data.status === "ready") {
          addLog("Cryptographic USCIS 8 CFR § 103.2 certification seal successfully attached.", "SEAL");
        }
      } catch (err: any) {
        if (!isMounted) return;
        setPollError("Connection interrupted. Re-establishing telemetry link...");
        timer = setTimeout(fetchStatus, 3000);
      }
    };

    // Initial immediate fetch
    fetchStatus();

    return () => {
      isMounted = false;
      if (timer) clearTimeout(timer);
    };
  }, [resolvedId, addLog]);

  // Determine active phase index (0 to 3)
  const getActivePhaseIndex = (status?: string, progress = 0): number => {
    if (!status || status === "queued") return 0;
    if (status === "extracting" || progress < 30) return 0;
    if (status === "translating" || progress < 70) return 1;
    if (status === "rendering" || progress < 90) return 2;
    if (status === "verifying" || progress < 100) return 3;
    return 4; // all completed
  };

  const currentPhaseIndex = getActivePhaseIndex(jobData?.status, jobData?.progress);
  const isCompleted = jobData?.status === "completed" || jobData?.status === "ready" || (jobData?.progress ?? 0) >= 100;
  const isFailed = jobData?.status === "failed";

  const handleCopyId = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(resolvedId);
      setHasCopiedId(true);
      setTimeout(() => setHasCopiedId(false), 2000);
    }
  };

  const downloadHref = jobData?.downloadUrl || jobData?.artifactUrl || `/api/jobs/${resolvedId}/download`;

  return (
    <div className="min-h-screen bg-[#090D14] text-slate-100 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Top High-Density Legal Header */}
      <header className="border-b border-slate-800/80 bg-[#0B101B]/90 backdrop-blur-md sticky top-0 z-30 px-4 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 group text-slate-100 hover:text-white transition-colors"
            >
              <div className="w-8 h-8 rounded bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:border-emerald-400/60 transition-colors">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="font-serif text-lg tracking-tight font-medium text-white">
                Verify<span className="text-emerald-400">Lingua</span>
              </span>
            </Link>
            <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-500 pl-3 border-l border-slate-800">
              <span>WORKBENCH</span>
              <ChevronRight className="w-3 h-3 text-slate-600" />
              <span className="text-slate-400">PIPELINE TRACKER</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Connection Pulse */}
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300">
              <span
                className={cn(
                  "w-2 h-2 rounded-full",
                  isFailed
                    ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]"
                    : isCompleted
                    ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"
                    : "bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                )}
              />
              <span className="hidden sm:inline uppercase tracking-wider">
                {isFailed ? "PIPELINE FAILED" : isCompleted ? "CERTIFIED & SEALED" : "LIVE TELEMETRY STREAM"}
              </span>
            </div>

            <Link href="/translate">
              <Button variant="outline" size="sm" className="h-8 border-slate-700 bg-slate-800/40 text-xs text-slate-200 hover:bg-slate-800 hover:text-white">
                New Translation
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Workspace Stage */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8 overflow-hidden">
        {/* Breadcrumb & Job Badge */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-medium tracking-wider uppercase bg-slate-800 border border-slate-700/80 text-slate-300">
              LEGAL CERTIFICATION MATTERS
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-xs text-slate-400 font-mono">USCIS 8 CFR § 103.2 COMPLIANT</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-slate-900/90 border border-slate-800 text-xs font-mono text-slate-300">
              <span className="text-slate-500">JOB ID:</span>
              <span className="text-emerald-400 font-semibold">{resolvedId}</span>
              <button
                onClick={handleCopyId}
                title="Copy Job ID"
                className="ml-1 text-slate-400 hover:text-white transition-colors p-0.5"
              >
                {hasCopiedId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-white tracking-tight font-normal">
            Certified Translation Stream
          </h1>
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed">
            Real-time asynchronous execution monitoring. Your document is undergoing structural vector isolation, ATA-grade legal translation, and cryptographic certification.
          </p>
        </div>

        {/* Loading Skeleton */}
        {isLoading && !jobData && (
          <div className="space-y-6 animate-pulse">
            <div className="p-6 rounded-lg border border-slate-800 bg-slate-900/40 space-y-4">
              <div className="h-4 bg-slate-800 rounded w-1/3" />
              <div className="h-3 bg-slate-800/60 rounded w-full" />
              <div className="h-3 bg-slate-800/60 rounded w-4/5" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-32 rounded-lg border border-slate-800/80 bg-slate-900/30 p-4 space-y-3">
                  <div className="h-4 bg-slate-800 rounded w-1/2" />
                  <div className="h-3 bg-slate-800/50 rounded w-3/4" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Poll Warning Alert if any */}
        {pollError && (
          <div className="p-3.5 rounded border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
              <span>{pollError}</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-mono text-amber-400/80">
              <RefreshCw className="w-3 h-3 animate-spin" />
              <span>SYNCING</span>
            </div>
          </div>
        )}

        {/* Active Progress Interface */}
        {jobData && (
          <div className="space-y-8">
            {/* Primary Status Card with Smooth Progress Bar */}
            <Card className="border border-slate-800 bg-[#0C121E]/90 backdrop-blur-md rounded-lg overflow-hidden shadow-xl">
              <CardContent className="p-6 sm:p-8 space-y-6">
                {/* Meta Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-slate-800/70 border border-slate-700/60 flex items-center justify-center text-slate-300">
                      <FileText className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">SOURCE ASSET</div>
                      <div className="text-sm font-medium text-white truncate max-w-xs sm:max-w-md">
                        {jobData.fileName || "Certified_Document.pdf"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono">
                    <div className="px-3 py-1.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                      <span className="text-slate-500 mr-1.5">PAIR:</span>
                      <span className="text-emerald-400 font-semibold uppercase">
                        {jobData.sourceLang || "ES"} → {jobData.targetLang || "EN"}
                      </span>
                    </div>
                    <div className="px-3 py-1.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                      <span className="text-slate-500 mr-1.5">PAGES:</span>
                      <span className="text-white font-semibold">{jobData.pageCount || 1}</span>
                    </div>
                  </div>
                </div>

                {/* Progress Bar & Numeric Indicator */}
                <div className="space-y-3">
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-xs font-mono uppercase text-slate-400 tracking-wider">PIPELINE EXECUTION</div>
                      <div className="text-base sm:text-lg font-medium text-slate-200 mt-0.5">
                        {isCompleted
                          ? "Translation & Certification Complete"
                          : isFailed
                          ? "Pipeline Execution Halted"
                          : jobData.currentStep || "Processing document layers..."}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-3xl sm:text-4xl font-mono font-bold text-white tracking-tight">
                        {Math.min(100, Math.max(0, jobData.progress || 0))}%
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar with Framer Motion Spring */}
                  <div className="relative h-2.5 w-full bg-slate-950 border border-slate-800 rounded-full overflow-hidden p-[1px]">
                    <motion.div
                      className={cn(
                        "h-full rounded-full transition-colors relative",
                        isFailed
                          ? "bg-rose-500"
                          : isCompleted
                          ? "bg-emerald-400"
                          : "bg-emerald-500"
                      )}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, Math.max(5, jobData.progress || 0))}%` }}
                      transition={{ type: "spring", stiffness: 60, damping: 15 }}
                    >
                      {/* Active Shimmer Glow */}
                      {!isCompleted && !isFailed && (
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                          animate={{ x: ["-100%", "200%"] }}
                          transition={{ repeat: Infinity, duration: 1.6, ease: "linear" }}
                        />
                      )}
                    </motion.div>
                  </div>
                </div>

                {/* Current Step Status Line */}
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono pt-1">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      isCompleted ? "bg-emerald-400" : isFailed ? "bg-rose-500" : "bg-emerald-400 animate-ping"
                    )} />
                    <span>STATUS: {jobData.status.toUpperCase()}</span>
                  </div>
                  <div>
                    ESTIMATED FINISH: {isCompleted ? "DONE" : "< 15 SECONDS"}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 4 Phases Flow Interface with Glowing Active States */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-mono uppercase tracking-wider text-slate-400">
                  PIPELINE VERIFICATION STAGES
                </h2>
                <span className="text-xs font-mono text-slate-500">4 STAGES ENFORCED</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {PHASES.map((phase, idx) => {
                  const PhaseIcon = phase.icon;
                  const isPhaseDone = isCompleted || currentPhaseIndex > idx;
                  const isPhaseActive = !isCompleted && !isFailed && currentPhaseIndex === idx;
                  const isPhasePending = !isCompleted && !isFailed && currentPhaseIndex < idx;

                  return (
                    <motion.div
                      key={phase.key}
                      layout
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.08 }}
                      className={cn(
                        "relative rounded-lg p-5 border transition-all duration-200 flex flex-col justify-between",
                        isPhaseDone
                          ? "bg-[#0B151F] border-emerald-500/40 text-slate-200 shadow-[0_0_15px_rgba(16,185,129,0.06)]"
                          : isPhaseActive
                          ? "bg-[#0D1826] border-emerald-400 text-white shadow-[0_0_20px_rgba(16,185,129,0.2)] ring-1 ring-emerald-400/50"
                          : "bg-[#0A0E17] border-slate-800/80 text-slate-500"
                      )}
                    >
                      {/* Active Breathing Indicator */}
                      {isPhaseActive && (
                        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[10px] font-mono text-emerald-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span>ACTIVE</span>
                        </div>
                      )}

                      {/* Header */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div
                            className={cn(
                              "w-8 h-8 rounded flex items-center justify-center border",
                              isPhaseDone
                                ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
                                : isPhaseActive
                                ? "bg-emerald-500/20 border-emerald-400 text-emerald-300"
                                : "bg-slate-900 border-slate-800 text-slate-600"
                            )}
                          >
                            {isPhaseDone ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <PhaseIcon className="w-4 h-4" />
                            )}
                          </div>
                          <span className="text-[11px] font-mono text-slate-500">
                            0{idx + 1}/04
                          </span>
                        </div>

                        <div>
                          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                            {phase.category}
                          </div>
                          <div className="text-base font-medium text-white mt-0.5">
                            {phase.title}
                          </div>
                        </div>

                        <p className="text-xs text-slate-400 leading-relaxed">
                          {phase.description}
                        </p>
                      </div>

                      {/* Footer Badge */}
                      <div className="pt-4 mt-4 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-mono">
                        <span className={cn(
                          isPhaseDone ? "text-emerald-400" : isPhaseActive ? "text-emerald-300 font-semibold" : "text-slate-600"
                        )}>
                          {isPhaseDone ? "PASSED (100%)" : isPhaseActive ? "IN PROGRESS" : "QUEUED"}
                        </span>
                        {isPhaseDone && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Success State Seamless Transition */}
            <AnimatePresence>
              {isCompleted && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ type: "spring", stiffness: 70, damping: 14 }}
                  className="rounded-lg border border-emerald-500/40 bg-gradient-to-b from-[#0C1D21] to-[#0A161B] p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden"
                >
                  {/* Subtle Top Border Highlight */}
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500 via-emerald-300 to-emerald-500" />

                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded text-xs font-mono font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          OFFICIALLY CERTIFIED
                        </span>
                        <span className="text-xs font-mono text-emerald-400/80">ATA ACCREDITED #271892</span>
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-serif text-white font-medium">
                        Your Certified Packet is Ready
                      </h3>
                      <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
                        Translation, legal typesetting, and the sworn 8 CFR § 103.2 certification affidavit have been fully compiled into a tamper-proof PDF package.
                      </p>
                    </div>

                    {/* Primary Download CTA */}
                    <div className="w-full md:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                      <a
                        href={downloadHref}
                        download
                        className="w-full sm:w-auto"
                      >
                        <Button
                          size="lg"
                          className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold px-8 h-13 shadow-[0_0_25px_rgba(16,185,129,0.35)] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                        >
                          <FileDown className="w-5 h-5" />
                          <span>Download Certified PDF</span>
                        </Button>
                      </a>

                      <Link href={`/verify/${resolvedId}`} className="w-full sm:w-auto">
                        <Button
                          variant="outline"
                          size="lg"
                          className="w-full sm:w-auto border-slate-700 bg-slate-800/60 text-slate-200 hover:bg-slate-800 hover:text-white h-13"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          <span>Verify Seal</span>
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* Legal Guarantee Bento Footer */}
                  <div className="pt-6 border-t border-emerald-500/20 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div className="flex items-center gap-2.5 text-slate-300">
                      <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>100% Acceptance Guarantee for USCIS, Courts & State Dept</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-slate-300">
                      <FileCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Tamper-proof digital seal & verifiable QR code embedded</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-slate-300">
                      <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Permanent vault retention with unlimited re-downloads</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error State with Guaranteed Credit Refund Reassurance */}
            <AnimatePresence>
              {isFailed && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ type: "spring", stiffness: 70, damping: 14 }}
                  className="rounded-lg border border-rose-500/40 bg-gradient-to-b from-[#1F1115] to-[#160B0E] p-6 sm:p-8 space-y-6 shadow-2xl relative"
                >
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded text-xs font-mono font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                          PIPELINE ANOMALY
                        </span>
                        <span className="text-xs font-mono text-rose-400/80">AUTOMATIC REMEDIATION</span>
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-serif text-white font-medium">
                        Document Processing Could Not Complete
                      </h3>
                      <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
                        {jobData.error || "The layout engine encountered an unparseable coordinate format or corrupted vector stream."}
                      </p>

                      {/* Reassurance Banner */}
                      <div className="p-4 rounded border border-emerald-500/30 bg-emerald-950/30 text-emerald-300 text-xs flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                        <div>
                          <strong className="font-semibold block text-emerald-200">Zero Risk Guarantee</strong>
                          All reserved page credits for this job have been automatically and fully restored to your account balance.
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch gap-3 w-full md:w-auto">
                      <Link href="/translate" className="w-full sm:w-auto">
                        <Button
                          size="lg"
                          className="w-full sm:w-auto bg-white hover:bg-slate-200 text-slate-950 font-semibold h-12"
                        >
                          Upload New Document
                        </Button>
                      </Link>
                      <Link href="/app/support" className="w-full sm:w-auto">
                        <Button
                          variant="outline"
                          size="lg"
                          className="w-full sm:w-auto border-slate-700 bg-slate-800/60 text-slate-200 hover:bg-slate-800 h-12"
                        >
                          Contact Counsel Desk
                        </Button>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Telemetry Stream Console (Awwwards Legal-Tech Detail) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span className="hidden sm:inline uppercase tracking-wider">LIVE AUDIT TELEMETRY STREAM</span>
                <span className="text-slate-500">REAL-TIME ATTESTATION LOGS</span>
              </div>

              <div className="rounded-lg border border-slate-800/90 bg-[#070B12] p-4 font-mono text-xs text-slate-300 space-y-2 overflow-x-auto shadow-inner">
                {auditLogs.length === 0 ? (
                  <div className="text-slate-600 italic">Listening for job socket telemetry events...</div>
                ) : (
                  auditLogs.map((log, index) => (
                    <div key={index} className="flex items-start gap-3 leading-relaxed">
                      <span className="text-slate-600 select-none">[{log.time}]</span>
                      <span
                        className={cn(
                          "px-1.5 py-0.2 rounded text-[10px] uppercase font-semibold shrink-0",
                          log.tag === "ERROR"
                            ? "bg-rose-500/20 text-rose-300"
                            : log.tag === "SEAL"
                            ? "bg-emerald-500/20 text-emerald-300"
                            : log.tag === "WARN"
                            ? "bg-amber-500/20 text-amber-300"
                            : "bg-slate-800 text-slate-400"
                        )}
                      >
                        {log.tag}
                      </span>
                      <span className={cn(
                        log.tag === "ERROR" ? "text-rose-300" : log.tag === "SEAL" ? "text-emerald-300 font-medium" : "text-slate-300"
                      )}>
                        {log.text}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* High-Contrast Footer */}
      <footer className="border-t border-slate-800/80 bg-[#0B101B] py-6 px-4 text-center text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            VerifyLingua Legal-Tech Platform • USCIS 8 CFR § 103.2 Sworn Certification
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Vault</Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-white transition-colors">Legal Terms</Link>
            <span>•</span>
            <Link href="/help" className="hover:text-white transition-colors">Compliance FAQ</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
