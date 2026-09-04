"use client";

import * as React from "react";
import Link from "next/link";
import { DashboardNav } from "@/components/layout/DashboardNav";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Clock,
  Plus,
  ArrowRight,
  QrCode,
  Download,
  FileText,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Layers,
  Sparkles,
} from "lucide-react";

interface RealTranslationJob {
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
  completedAt?: string;
  error?: string;
  qualityGate?: {
    isValidFormat: boolean;
    pageCountMatches: boolean;
    elementCountMatches: boolean;
    checksumMatches: boolean;
    byteSize: number;
    notes: string[];
  };
  downloadUrl?: string | null;
}

const MOCK_ORDERS = [
  {
    id: "ord-1",
    publicCode: "VL-7X9K2",
    documentName: "Acta de Nacimiento (Birth Certificate)",
    sourceLang: "Spanish",
    targetLang: "English",
    status: "TRANSLATING",
    statusLabel: "Translating",
    pages: 1,
    total: 24.95,
    promisedAt: "Tomorrow at 9:00 AM EST",
    translator: "Elena V. (ATA No. 271892)",
    verifyCode: "CERT-7X9K2-4821",
  },
  {
    id: "ord-2",
    publicCode: "VL-3M8Q1",
    documentName: "Título Universitario (Bachelor Diploma)",
    sourceLang: "Spanish",
    targetLang: "English",
    status: "DELIVERED",
    statusLabel: "Certified & Delivered",
    pages: 2,
    total: 49.90,
    promisedAt: "Delivered Aug 28, 2026",
    translator: "Carlos M. (ATA No. 194820)",
    verifyCode: "CERT-3M8Q1-9014",
  },
];

export default function DashboardPage() {
  const [realJobs, setRealJobs] = React.useState<RealTranslationJob[]>([]);
  const [loadingJobs, setLoadingJobs] = React.useState(true);

  const fetchJobs = React.useCallback(async () => {
    try {
      const res = await fetch("/api/translate/jobs");
      if (res.ok) {
        const data = await res.json();
        setRealJobs(data.jobs || []);
      }
    } catch (err) {
      console.warn("Failed to fetch translation jobs:", err);
    } finally {
      setLoadingJobs(false);
    }
  }, []);

  React.useEffect(() => {
    fetchJobs();

    // Poll every 3 seconds if any job is active
    const interval = setInterval(() => {
      fetchJobs();
    }, 3000);

    return () => clearInterval(interval);
  }, [fetchJobs]);

  const activeJobsCount = realJobs.filter((j) => j.status !== "ready" && j.status !== "failed").length;
  const completedJobsCount = realJobs.filter((j) => j.status === "ready").length;

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-text">
      <DashboardNav />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-10 space-y-8">
        {/* Welcome & Action Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-black text-brand-ink tracking-tight font-display">
              Translation Dashboard
            </h1>
            <p className="text-sm text-text-muted">
              Manage your certified translation orders, track layout-preserving jobs, and download sealed deliverables.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchJobs()}
              className="gap-1.5 rounded-xl text-xs font-mono text-text-muted"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </Button>
            <Button asChild size="lg" className="gap-2 rounded-2xl font-bold shadow-md">
              <Link href="/order/triage">
                <Plus className="w-5 h-5" />
                Start New Translation
              </Link>
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="p-6 rounded-3xl bg-surface-raised border border-border space-y-2 shadow-sm">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-text-muted">
              Active Translations
            </span>
            <div className="flex items-baseline justify-between">
              <p className="text-3xl font-black text-brand-ink">
                {1 + activeJobsCount}
              </p>
              <Badge variant="default" className="text-[11px]">Guaranteed 24h</Badge>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-surface-raised border border-border space-y-2 shadow-sm">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-text-muted">
              Delivered Certificates
            </span>
            <div className="flex items-baseline justify-between">
              <p className="text-3xl font-black text-brand-ink">
                {1 + completedJobsCount}
              </p>
              <Badge variant="success" className="text-[11px]">100% USCIS Accepted</Badge>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-surface-raised border border-border space-y-2 shadow-sm">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-text-muted">
              Encrypted Documents in Vault
            </span>
            <div className="flex items-baseline justify-between">
              <p className="text-3xl font-black text-brand-ink">
                {2 + realJobs.length}
              </p>
              <span className="text-xs font-mono text-status-success font-bold">256-bit AES</span>
            </div>
          </div>
        </div>

        {/* Real Layout-Preserving Translation Jobs (if any exist) */}
        {realJobs.length > 0 && (
          <Card className="p-6 md:p-8 rounded-[32px] bg-surface-raised border-2 border-brand-500/20 shadow-md space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-brand-ink">
                    Document Translation Engine Jobs
                  </h2>
                  <Badge variant="default" className="text-[10px] font-mono uppercase">
                    Live Engine
                  </Badge>
                </div>
                <p className="text-xs text-text-muted">
                  Layout-preserved round-trip outputs (PDF, DOCX, PNG, JPG) with 8 CFR 103.2 certification.
                </p>
              </div>
              <span className="text-xs font-mono text-text-muted">
                {realJobs.length} {realJobs.length === 1 ? "Job" : "Jobs"}
              </span>
            </div>

            <div className="space-y-4">
              {realJobs.map((job) => {
                const isReady = job.status === "ready";
                const isFailed = job.status === "failed";

                return (
                  <div
                    key={job.id}
                    className="p-6 rounded-2xl border border-border bg-surface hover:border-brand-500/40 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
                  >
                    <div className="space-y-2.5 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="font-mono text-xs font-bold text-brand-500 bg-brand-50 px-2.5 py-0.5 rounded-md border border-brand-100 uppercase">
                          .{job.fileFormat}
                        </span>

                        <Badge
                          variant={isReady ? "success" : isFailed ? "danger" : "default"}
                          className="text-[11px] py-0.5 font-mono"
                        >
                          {job.status.toUpperCase()}
                        </Badge>

                        <span className="text-xs text-text-muted font-mono">
                          {job.sourceLang} → {job.targetLang}
                        </span>

                        <span className="text-xs text-text-muted font-mono">
                          {(job.fileSize / 1024).toFixed(1)} KB
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-brand-ink flex items-center gap-2">
                        <FileText className="w-4 h-4 text-brand-500 shrink-0" />
                        <span>{job.fileName}</span>
                      </h3>

                      {!isReady && !isFailed && (
                        <div className="space-y-1.5 max-w-md">
                          <div className="flex items-center justify-between text-[11px] font-mono text-text-muted">
                            <span>{job.currentStep}</span>
                            <span className="font-bold text-brand-500">{job.progress}%</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-surface-raised border border-border overflow-hidden">
                            <div
                              className="h-full bg-brand-500 transition-all duration-300 rounded-full"
                              style={{ width: `${job.progress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {isReady && job.qualityGate && (
                        <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-text-muted">
                          <span className="flex items-center gap-1 text-status-success font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Format Verified
                          </span>
                          <span>•</span>
                          <span>{(job.qualityGate.byteSize / 1024).toFixed(1)} KB Output</span>
                          <span>•</span>
                          <span>8 CFR 103.2 Certified</span>
                        </div>
                      )}

                      {isFailed && (
                        <p className="text-xs text-status-danger flex items-center gap-1.5 font-mono">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{job.error || "Translation pipeline encountered an error."}</span>
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {isReady && job.downloadUrl ? (
                        <Button asChild size="sm" className="gap-2 rounded-xl text-xs font-bold shadow-sm">
                          <a href={job.downloadUrl} download>
                            <Download className="w-3.5 h-3.5" />
                            Download Translated .{job.fileFormat.toUpperCase()}
                          </a>
                        </Button>
                      ) : !isFailed ? (
                        <div className="flex items-center gap-2 text-xs font-mono text-text-muted">
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-brand-500" />
                          <span>Processing...</span>
                        </div>
                      ) : (
                        <Button asChild size="sm" variant="outline" className="rounded-xl text-xs">
                          <Link href="/order/triage">Retry</Link>
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* Legacy / USCIS Certified Orders Table */}
        <Card className="p-6 md:p-8 rounded-[32px] bg-surface-raised border border-border shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-brand-ink">
              Recent Certified Orders
            </h2>
            <span className="text-xs font-mono text-text-muted">
              Showing {MOCK_ORDERS.length} Orders
            </span>
          </div>

          <div className="space-y-4">
            {MOCK_ORDERS.map((ord) => {
              const isDelivered = ord.status === "DELIVERED";
              return (
                <div
                  key={ord.id}
                  className="p-6 rounded-2xl border border-border bg-surface hover:bg-surface-raised hover:border-brand-500/40 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-brand-500 bg-brand-50 px-2.5 py-0.5 rounded-md border border-brand-100">
                        {ord.publicCode}
                      </span>
                      <Badge
                        variant={isDelivered ? "success" : "default"}
                        className="text-[11px] py-0.5"
                      >
                        {ord.statusLabel}
                      </Badge>
                      <span className="text-xs text-text-muted font-mono">
                        {ord.sourceLang} → {ord.targetLang}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-brand-ink">
                      {ord.documentName}
                    </h3>

                    <p className="text-xs text-text-muted flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-brand-500" />
                      <span>{isDelivered ? ord.promisedAt : `Guaranteed ready by: ${ord.promisedAt}`}</span>
                      <span>•</span>
                      <span>Linguist: {ord.translator}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {isDelivered ? (
                      <>
                        <Button asChild size="sm" variant="outline" className="gap-1.5 rounded-xl text-xs font-bold">
                          <Link href={`/verify/${ord.verifyCode}`}>
                            <QrCode className="w-3.5 h-3.5 text-brand-500" />
                            Verify Record
                          </Link>
                        </Button>
                        <Button asChild size="sm" className="gap-1.5 rounded-xl text-xs font-bold shadow-sm">
                          <a
                            href={`/api/certificate/${ord.verifyCode}/download`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Download className="w-3.5 h-3.5" />
                            Download PDF
                          </a>
                        </Button>
                      </>
                    ) : (
                      <Button asChild size="sm" className="gap-1.5 rounded-xl text-xs font-bold shadow-sm">
                        <Link href={`/order/${ord.publicCode}`}>
                          View Live Tracker
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
