"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck, 
  Download, 
  Search, 
  CheckCircle2,
  Clock, 
  Lock, 
  FileText, 
  Plus,
  QrCode,
  Copy,
  Check,
  Award,
  FileCheck2,
  Eye,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DashboardNav } from "@/components/layout/DashboardNav";

interface MatterDocket {
  id: string;
  matter: string;
  category: string;
  lang: string;
  pages: number;
  status: "COMPLETED" | "PROCESSING" | "IN_REVIEW";
  date: string;
  hash: string;
  certNumber: string;
  slaTarget: string;
  downloadUrl?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [matters, setMatters] = useState<MatterDocket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"ALL" | "PROCESSING" | "COMPLETED">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      try {
        // 1. Verify authentication
        const authRes = await fetch("/api/auth/me");
        if (!authRes.ok) {
          router.push("/login?returnUrl=/dashboard");
          return;
        }
        const authData = await authRes.json();
        if (!authData || !authData.authenticated) {
          router.push("/login?returnUrl=/dashboard");
          return;
        }

        // 2. Fetch authentic user orders / dockets
        const ordersRes = await fetch("/api/dashboard/orders");
        if (ordersRes.ok) {
          const data = await ordersRes.json();
          if (isMounted && data && Array.isArray(data.orders)) {
            const mapped: MatterDocket[] = data.orders.map((o: any) => ({
              id: o.publicCode || o.id,
              matter: o.matterNumber || (o.uploadedFiles?.[0]?.name ? `Document: ${o.uploadedFiles[0].name}` : `Order #${o.publicCode}`),
              category: o.serviceType ? `${o.serviceType} Translation` : "Certified Document",
              lang: `${o.sourceLang || "Source"} → ${(o.targetLangs && o.targetLangs[0]) || "English"}`,
              pages: typeof o.pageCount === "number" ? o.pageCount : 1,
              status: o.status === "DELIVERED" || o.status === "COMPLETED"
                ? "COMPLETED"
                : o.status === "PROOFING" || o.status === "IN_REVIEW" || o.status === "CLIENT_REVIEW"
                ? "IN_REVIEW"
                : "PROCESSING",
              date: o.submittedAt ? new Date(o.submittedAt).toLocaleDateString() : "Recent",
              hash: o.uploadedFiles?.[0]?.sha256 ? `${o.uploadedFiles[0].sha256.slice(0, 10)}...${o.uploadedFiles[0].sha256.slice(-6)}` : "Pending Seal",
              certNumber: o.assignedTranslator || "ATA Certified",
              slaTarget: o.promisedAt ? `Delivery by ${new Date(o.promisedAt).toLocaleDateString()}` : "Standard Turnaround",
              downloadUrl: o.deliveredFiles?.[0]?.certifiedPdfUrl || (o.status === "DELIVERED" || o.status === "COMPLETED" ? `/api/order/${o.id}/proof` : undefined),
            }));
            setMatters(mapped);
          }
        }
      } catch (err) {
        console.warn("[Dashboard] Error loading orders:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadDashboard();
    return () => {
      isMounted = false;
    };
  }, [router]);

  const handleCopyHash = (id: string, hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const processingCount = matters.filter(
    (m) => m.status === "PROCESSING" || m.status === "IN_REVIEW"
  ).length;
  const completedCount = matters.filter((m) => m.status === "COMPLETED").length;
  const totalPages = matters.reduce((acc, m) => acc + (m.pages || 0), 0);

  const filteredMatters = matters.filter((m) => {
    if (activeTab === "COMPLETED" && m.status !== "COMPLETED") return false;
    if (activeTab === "PROCESSING" && m.status === "COMPLETED") return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        m.matter.toLowerCase().includes(q) ||
        m.id.toLowerCase().includes(q) ||
        m.lang.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-canvas text-text font-sans selection:bg-brand-500/20 flex flex-col">
      {/* 1. Global Authenticated Client Navigation */}
      <DashboardNav />

      {/* 2. Main High-Trust Workspace Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 md:p-8 flex flex-col gap-6">
        
        {/* Confidentiality & Encryption Security Banner */}
        <div className="p-3.5 rounded-xl bg-surface-raised border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-court-emerald/10 text-court-emerald flex items-center justify-center shrink-0">
              <Lock className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="font-bold text-brand-ink">Confidential Client Vault</span>
              <span className="text-text-muted ml-2">AES-256-GCM End-to-End Encryption · Zero-Knowledge Retention</span>
            </div>
          </div>
          <div className="flex items-center gap-3 font-mono text-[10px] text-text-subtle">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-court-emerald animate-pulse" />
              <span>Session: Active & Verified</span>
            </span>
            <span className="hidden sm:inline">|</span>
            <span className="hidden sm:inline text-amber-700 dark:text-amber-400 font-bold">
              ATA Corp. Member No. 278190
            </span>
          </div>
        </div>

        {/* Workspace Title & Primary Action */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-1">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-600" />
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-text-muted">
                Adjudication Vault & Dockets
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-brand-ink">
              Legal Matters & Certified Records
            </h1>
          </div>
          
          <div className="flex items-center gap-2.5">
            <Link 
              href="/verify" 
              className="h-10 px-4 rounded-xl border border-border bg-surface-raised hover:bg-surface text-text font-semibold text-xs flex items-center gap-2 shadow-2xs transition-all active:scale-[0.98]"
            >
              <QrCode className="w-4 h-4 text-brand-600" />
              <span>Verify Any Seal</span>
            </Link>
            <Link 
              href="/translate" 
              className="h-10 px-5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs flex items-center gap-2 shadow-xs transition-all active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>New Translation</span>
            </Link>
          </div>
        </div>

        {/* Dynamic Telemetry Cards (Derived strictly from live records) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-xl bg-surface-raised border border-border shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-mono font-bold text-text-muted uppercase tracking-wider">Total Matters</p>
              <h4 className="text-2xl font-bold text-brand-ink tabular-nums">
                {isLoading ? "—" : `${matters.length} ${matters.length === 1 ? "Docket" : "Dockets"}`}
              </h4>
              <p className="text-[10px] text-text-subtle">
                {isLoading ? "Calculating..." : `${totalPages} Certified ${totalPages === 1 ? "Page" : "Pages"} under seal`}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center border border-border text-brand-600">
              <FileCheck2 className="w-5 h-5" />
            </div>
          </div>

          <div className="p-5 rounded-xl bg-surface-raised border border-border shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-mono font-bold text-text-muted uppercase tracking-wider">Active Processing</p>
              <h4 className="text-2xl font-bold text-brand-600 tabular-nums">
                {isLoading ? "—" : `${processingCount} ${processingCount === 1 ? "Record" : "Records"}`}
              </h4>
              <p className="text-[10px] text-text-subtle">Guaranteed &lt; 24h SLA delivery</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/40 flex items-center justify-center border border-brand-200 dark:border-brand-800 text-brand-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="p-5 rounded-xl bg-surface-raised border border-border shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-mono font-bold text-text-muted uppercase tracking-wider">USCIS Acceptance</p>
              <h4 className="text-2xl font-bold text-court-emerald tabular-nums">Guaranteed Acceptance</h4>
              <p className="text-[10px] text-court-emerald">Backed by free RFE legal defense</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-court-emerald/10 flex items-center justify-center border border-court-emerald/25 text-court-emerald">
              <Award className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* High-Density Matter Docket Table Container */}
        <div className="bg-surface-raised rounded-2xl border border-border-strong/70 shadow-xs flex flex-col overflow-hidden">
          
          {/* Table Control Toolbar */}
          <div className="h-14 px-4 sm:px-5 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface/60 py-2 sm:py-0">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Filter dockets, applicants, IDs..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 pl-8 pr-3 rounded-lg border border-border bg-canvas text-xs text-text placeholder:text-text-subtle focus:outline-hidden focus:border-brand-500 w-48 sm:w-64"
                />
              </div>
            </div>
            
            {/* Status Filter Tabs */}
            <div className="flex items-center p-0.5 bg-canvas rounded-lg border border-border shrink-0 self-start sm:self-auto">
              <button
                onClick={() => setActiveTab("ALL")}
                className={cn(
                  "px-3 h-7 rounded-md text-[11px] font-semibold transition-all cursor-pointer",
                  activeTab === "ALL"
                    ? "bg-brand-600 text-white shadow-2xs"
                    : "text-text-muted hover:text-brand-ink"
                )}
              >
                All Matters ({matters.length})
              </button>
              <button
                onClick={() => setActiveTab("PROCESSING")}
                className={cn(
                  "px-3 h-7 rounded-md text-[11px] font-semibold transition-all cursor-pointer",
                  activeTab === "PROCESSING"
                    ? "bg-brand-600 text-white shadow-2xs"
                    : "text-text-muted hover:text-brand-ink"
                )}
              >
                Processing ({processingCount})
              </button>
              <button
                onClick={() => setActiveTab("COMPLETED")}
                className={cn(
                  "px-3 h-7 rounded-md text-[11px] font-semibold transition-all cursor-pointer",
                  activeTab === "COMPLETED"
                    ? "bg-brand-600 text-white shadow-2xs"
                    : "text-text-muted hover:text-brand-ink"
                )}
              >
                Completed ({completedCount})
              </button>
            </div>
          </div>

          {/* Dockets Data Table or Empty State */}
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="py-16 flex flex-col items-center justify-center gap-3 text-text-muted">
                <Loader2 className="w-6 h-6 animate-spin text-brand-600" />
                <span className="text-xs font-mono">Loading legal dockets from vault...</span>
              </div>
            ) : filteredMatters.length === 0 ? (
              <div className="py-16 px-4 flex flex-col items-center justify-center text-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-surface border border-border flex items-center justify-center text-text-muted">
                  <FileText className="w-6 h-6 text-brand-600/50" />
                </div>
                <div className="space-y-1 max-w-sm">
                  <h3 className="text-sm font-bold text-brand-ink">
                    {searchQuery ? "No matching dockets found" : "No translation dockets found"}
                  </h3>
                  <p className="text-xs text-text-muted leading-relaxed">
                    {searchQuery
                      ? "Try adjusting your search criteria or clear the filter."
                      : "Upload an official document in the workspace to begin certified translation."}
                  </p>
                </div>
                {!searchQuery && (
                  <Link
                    href="/translate"
                    className="mt-2 h-9 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs inline-flex items-center gap-2 shadow-xs transition-all active:scale-[0.98]"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Start New Translation</span>
                  </Link>
                )}
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-surface text-[10px] font-mono uppercase tracking-wider text-text-muted">
                    <th className="py-3 px-4 font-bold">Docket ID & Category</th>
                    <th className="py-3 px-4 font-bold">Matter Description</th>
                    <th className="py-3 px-4 font-bold">Pair & Pages</th>
                    <th className="py-3 px-4 font-bold">Certification Status</th>
                    <th className="py-3 px-4 font-bold">Cryptographic Digest</th>
                    <th className="py-3 px-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-xs">
                  {filteredMatters.map((matter) => (
                    <tr key={matter.id} className="hover:bg-surface/50 transition-colors">
                      
                      {/* Docket ID & Category */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-mono font-bold text-brand-ink text-xs">{matter.id}</div>
                        <div className="text-[10px] font-mono text-text-muted mt-0.5">{matter.category}</div>
                      </td>

                      {/* Matter Description */}
                      <td className="py-3.5 px-4 min-w-[200px]">
                        <div className="font-semibold text-brand-ink text-xs">{matter.matter}</div>
                        <div className="text-[11px] text-text-subtle mt-0.5 flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-text-subtle" />
                          <span>{matter.slaTarget}</span>
                        </div>
                      </td>

                      {/* Pair & Pages */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-mono font-semibold text-brand-600 bg-brand-50 dark:bg-brand-950/40 px-2 py-0.5 rounded border border-brand-200 dark:border-brand-800 text-[10px]">
                          {matter.lang}
                        </span>
                        <span className="text-[11px] text-text-muted ml-2">
                          {matter.pages} {matter.pages === 1 ? "page" : "pages"}
                        </span>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {matter.status === "COMPLETED" && (
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold text-court-emerald bg-court-emerald/10 px-2.5 py-1 rounded-full border border-court-emerald/25">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>SEALED & VALIDATED</span>
                          </span>
                        )}
                        {matter.status === "PROCESSING" && (
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold text-amber-700 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/25">
                            <Clock className="w-3 h-3 animate-spin" />
                            <span>TRANSLATING</span>
                          </span>
                        )}
                        {matter.status === "IN_REVIEW" && (
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold text-brand-600 bg-brand-50 dark:bg-brand-950/40 px-2.5 py-1 rounded-full border border-brand-200 dark:border-brand-800">
                            <ShieldCheck className="w-3 h-3" />
                            <span>PEER QC REVIEW</span>
                          </span>
                        )}
                      </td>

                      {/* Cryptographic Digest */}
                      <td className="py-3.5 px-4 font-mono text-[11px] whitespace-nowrap">
                        {matter.status === "COMPLETED" && matter.hash !== "Pending Seal" ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-text-muted">{matter.hash}</span>
                            <button
                              onClick={() => handleCopyHash(matter.id, matter.hash)}
                              className="p-1 rounded hover:bg-surface text-text-muted hover:text-brand-ink transition-colors cursor-pointer"
                              title="Copy SHA-256 Digest"
                            >
                              {copiedId === matter.id ? (
                                <Check className="w-3 h-3 text-court-emerald" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        ) : (
                          <span className="text-text-subtle text-[10px] italic">In Pipeline</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        {matter.status === "COMPLETED" ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              href={`/verify?docket=${matter.id}`}
                              className="h-8 px-2.5 rounded-lg border border-border bg-surface hover:bg-surface-raised text-text font-medium text-[11px] flex items-center gap-1 transition-colors"
                              title="Verify Public Seal"
                            >
                              <QrCode className="w-3 h-3 text-brand-600" />
                              <span>Verify</span>
                            </Link>
                            {matter.downloadUrl ? (
                              <a
                                href={matter.downloadUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="h-8 px-3 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-semibold text-[11px] flex items-center gap-1.5 transition-colors shadow-2xs"
                              >
                                <Download className="w-3 h-3" />
                                <span>Download PDF</span>
                              </a>
                            ) : (
                              <Link
                                href="/documents"
                                className="h-8 px-3 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-semibold text-[11px] flex items-center gap-1.5 transition-colors shadow-2xs"
                              >
                                <Download className="w-3 h-3" />
                                <span>Documents</span>
                              </Link>
                            )}
                          </div>
                        ) : (
                          <Link
                            href="/translate"
                            className="h-8 px-3 rounded-lg border border-border bg-surface hover:bg-surface-raised text-text font-medium text-[11px] inline-flex items-center gap-1 transition-colors"
                          >
                            <Eye className="w-3 h-3 text-brand-600" />
                            <span>Workspace</span>
                          </Link>
                        )}
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Table Footer */}
          <div className="p-3.5 px-5 bg-surface border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-text-muted">
            <span className="text-[11px]">
              Showing {filteredMatters.length} of {matters.length} legal dockets
            </span>
            <div className="flex items-center gap-2 font-mono text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-court-emerald" />
              <span>All dockets backed by full USCIS Acceptance Guarantee</span>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
