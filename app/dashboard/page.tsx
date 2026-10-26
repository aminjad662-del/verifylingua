"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck, 
  ArrowRight, 
  Download, 
  Search, 
  CheckCircle2,
  Clock, 
  AlertTriangle, 
  Filter, 
  ChevronDown, 
  Lock, 
  Shield, 
  FileText, 
  Plus,
  QrCode,
  Copy,
  Check,
  ExternalLink,
  Award,
  Layers,
  FileCheck2,
  RefreshCw,
  Eye
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DashboardNav } from "@/components/layout/DashboardNav";
import { motion, AnimatePresence } from "motion/react";

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
}

const MATTERS: MatterDocket[] = [
  { 
    id: "VL-8492-USCIS", 
    matter: "Matter of Rodriguez Navarro (Birth Record)", 
    category: "Civil Vital Record",
    lang: "ES → EN", 
    pages: 2, 
    status: "COMPLETED", 
    date: "Today, 14:22", 
    hash: "7d4a98f1c8...e89b21", 
    certNumber: "ATA-278190-CERT",
    slaTarget: "Delivered in 4.2h"
  },
  { 
    id: "VL-8491-USCIS", 
    matter: "USCIS Form I-130 Marriage Evidence Packet", 
    category: "Immigration Evidence",
    lang: "FR → EN", 
    pages: 6, 
    status: "PROCESSING", 
    date: "Today, 11:05", 
    hash: "Pending Generation", 
    certNumber: "Assigned: Senior ATA",
    slaTarget: "Target: 4h 12m remaining"
  },
  { 
    id: "VL-8488-COURT", 
    matter: "EOIR Asylum Affidavit & Police Clearance", 
    category: "Federal Court Record",
    lang: "AR → EN", 
    pages: 14, 
    status: "IN_REVIEW", 
    date: "Yesterday", 
    hash: "Pending QC", 
    certNumber: "Linguist Review",
    slaTarget: "QC Review Stage"
  },
  { 
    id: "VL-8472-UNIV", 
    matter: "Academic Transcript & Degree Marksheets (MX)", 
    category: "Academic Credential (WES)",
    lang: "ES → EN", 
    pages: 4, 
    status: "COMPLETED", 
    date: "Sep 22, 2026", 
    hash: "e2c1a894b1...99f412", 
    certNumber: "ATA-278190-CERT",
    slaTarget: "Delivered in 6.1h"
  },
  { 
    id: "VL-8470-CONSUL", 
    matter: "Consular Visa Dossier & Financial Affidavits", 
    category: "Consular Interview",
    lang: "ES → EN", 
    pages: 8, 
    status: "COMPLETED", 
    date: "Sep 21, 2026", 
    hash: "f7d3b18204...4c2810", 
    certNumber: "ATA-278190-CERT",
    slaTarget: "Delivered in 8.0h"
  },
];

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<"ALL" | "PROCESSING" | "COMPLETED">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyHash = (id: string, hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredMatters = MATTERS.filter((m) => {
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
              href="/order/triage" 
              className="h-10 px-5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs flex items-center gap-2 shadow-xs transition-all active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>New Certified Order</span>
            </Link>
          </div>
        </div>

        {/* High-Craft Telemetry Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-xl bg-surface-raised border border-border shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-mono font-bold text-text-muted uppercase tracking-wider">Total Matters</p>
              <h4 className="text-2xl font-bold text-brand-ink tabular-nums">5 Dockets</h4>
              <p className="text-[10px] text-text-subtle">34 Certified Pages under seal</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center border border-border text-brand-600">
              <FileCheck2 className="w-5 h-5" />
            </div>
          </div>

          <div className="p-5 rounded-xl bg-surface-raised border border-border shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-mono font-bold text-text-muted uppercase tracking-wider">Active Processing</p>
              <h4 className="text-2xl font-bold text-brand-600 tabular-nums">2 Records</h4>
              <p className="text-[10px] text-text-subtle">Guaranteed &lt; 24h SLA delivery</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/40 flex items-center justify-center border border-brand-200 dark:border-brand-800 text-brand-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="p-5 rounded-xl bg-surface-raised border border-border shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-mono font-bold text-text-muted uppercase tracking-wider">USCIS Acceptance</p>
              <h4 className="text-2xl font-bold text-court-emerald tabular-nums">100% Guaranteed</h4>
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
                  className="h-8 pl-8 pr-3 w-56 sm:w-64 rounded-lg bg-canvas border border-border text-xs font-medium focus:outline-none focus:ring-1 focus:ring-brand-500 transition-shadow placeholder:text-text-subtle"
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
                All Matters ({MATTERS.length})
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
                Processing (2)
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
                Completed (3)
              </button>
            </div>
          </div>

          {/* Dockets Data Table */}
          <div className="overflow-x-auto">
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
                      {matter.status === "COMPLETED" ? (
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
                          <Link
                            href="/documents"
                            className="h-8 px-3 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-semibold text-[11px] flex items-center gap-1.5 transition-colors shadow-2xs"
                          >
                            <Download className="w-3 h-3" />
                            <span>Download PDF</span>
                          </Link>
                        </div>
                      ) : (
                        <Link
                          href={`/tracker`}
                          className="h-8 px-3 rounded-lg border border-border bg-surface hover:bg-surface-raised text-text font-medium text-[11px] inline-flex items-center gap-1 transition-colors"
                        >
                          <Eye className="w-3 h-3 text-brand-600" />
                          <span>Track Live</span>
                        </Link>
                      )}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="p-3.5 px-5 bg-surface border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-text-muted">
            <span className="text-[11px]">
              Showing {filteredMatters.length} of {MATTERS.length} legal dockets
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