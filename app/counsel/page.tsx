"use client";

import * as React from "react";
import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Briefcase,
  FolderOpen,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  FileCheck,
  Download,
  ExternalLink,
  ShieldCheck,
  Building2,
  Layers,
  ArrowRight,
  Filter,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MatterOrder {
  id: string;
  publicCode: string;
  fileName: string;
  status: string;
  verifyCode: string | null;
  sourceLang: string;
  targetLang: string;
  pageCount: number;
}

interface Matter {
  id: string;
  matterNumber: string;
  clientName: string;
  alienNumber: string | null;
  petitionType: string;
  status: "ACTIVE" | "READY_TO_FILE" | "CLOSED";
  notes: string | null;
  createdAt: string;
  documentsCount: number;
  certifiedCount: number;
  orders: MatterOrder[];
}

function CounselDeskContent() {
  const [matters, setMatters] = React.useState<Matter[]>([]);
  const [metrics, setMetrics] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("ALL");

  // New Matter Modal State
  const [newModalOpen, setNewModalOpen] = React.useState(false);
  const [matterNumber, setMatterNumber] = React.useState("");
  const [clientName, setClientName] = React.useState("");
  const [alienNumber, setAlienNumber] = React.useState("");
  const [petitionType, setPetitionType] = React.useState("I-485 Adjustment of Status");
  const [notes, setNotes] = React.useState("");
  const [creating, setCreating] = React.useState(false);

  // Bundle Modal State
  const [bundleModalOpen, setBundleModalOpen] = React.useState(false);
  const [bundlingMatter, setBundlingMatter] = React.useState<Matter | null>(null);
  const [compilingBundle, setCompilingBundle] = React.useState(false);
  const [bundleResult, setBundleResult] = React.useState<any>(null);

  const loadMatters = React.useCallback(async () => {
    try {
      const res = await fetch(`/api/counsel/matters?q=${encodeURIComponent(searchQuery)}&status=${statusFilter}`);
      const data = await res.json();
      if (data.success) {
        setMatters(data.matters);
        setMetrics(data.metrics);
      }
    } catch (err) {
      console.error("Error loading matters", err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter]);

  React.useEffect(() => {
    loadMatters();
  }, [loadMatters]);

  const handleCreateMatter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matterNumber.trim() || !clientName.trim()) return;

    setCreating(true);
    try {
      const res = await fetch("/api/counsel/matters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matterNumber: matterNumber.trim(),
          clientName: clientName.trim(),
          alienNumber: alienNumber.trim() || null,
          petitionType,
          notes: notes.trim() || null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMatters((prev) => [data.matter, ...prev]);
        setNewModalOpen(false);
        setMatterNumber("");
        setClientName("");
        setAlienNumber("");
        setNotes("");
      }
    } catch (err) {
      console.error("Error creating matter", err);
    } finally {
      setCreating(false);
    }
  };

  const handleCompileBundle = async (matter: Matter) => {
    setBundlingMatter(matter);
    setBundleResult(null);
    setBundleModalOpen(true);
    setCompilingBundle(true);

    try {
      const res = await fetch(`/api/counsel/matters/${matter.id}/bundle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ includeTableOfContents: true, includeNotaryAffidavits: true }),
      });
      const data = await res.json();
      if (data.success) {
        setBundleResult(data);
      }
    } catch (err) {
      console.error("Error compiling bundle", err);
    } finally {
      setCompilingBundle(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col selection:bg-brand-100 selection:text-brand-ink">
      {/* Top Law Firm Header */}
      <header className="bg-surface-raised border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-xs font-mono font-bold text-brand-700 uppercase tracking-wider">
                <Briefcase className="w-3.5 h-3.5 text-brand-500" />
                <span>CounselDesk™ Immigration B2B Workspace</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-ink tracking-tight font-display">
                Immigration Law Firm Matter Management
              </h1>
              <p className="text-xs sm:text-sm text-text-muted max-w-3xl">
                Batch-process foreign client exhibits, enforce strict passport name locks across legal teams, and generate 1-click USCIS &amp; EOIR court-ready packets with index tabs.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Button
                onClick={() => setNewModalOpen(true)}
                className="h-10 px-4 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-xs gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Open New Client Matter</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* KPI Metrics Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5 rounded-2xl bg-surface-raised border border-border space-y-2">
            <span className="text-[11px] font-mono text-text-muted uppercase font-bold">
              Active Client Matters
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-extrabold text-brand-ink font-display">
                {metrics?.totalMatters || 3}
              </span>
              <Badge variant="outline" className="text-[10px] font-mono bg-brand-50 text-brand-700 border-brand-200">
                In Firm Queue
              </Badge>
            </div>
          </Card>

          <Card className="p-5 rounded-2xl bg-surface-raised border border-border space-y-2">
            <span className="text-[11px] font-mono text-text-muted uppercase font-bold">
              Ready to File (USCIS)
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-extrabold text-status-success font-display">
                {metrics?.readyToFile || 1}
              </span>
              <Badge variant="outline" className="text-[10px] font-mono bg-status-success-bg text-status-success border-status-success/30">
                All Exhibits Sealed
              </Badge>
            </div>
          </Card>

          <Card className="p-5 rounded-2xl bg-surface-raised border border-border space-y-2">
            <span className="text-[11px] font-mono text-text-muted uppercase font-bold">
              Average Turnaround
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-extrabold text-brand-ink font-display">
                {metrics?.avgTurnaroundHours || 3.8}h
              </span>
              <span className="text-xs text-text-muted flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-brand-500" />
                <span>SLA Guaranteed</span>
              </span>
            </div>
          </Card>

          <Card className="p-5 rounded-2xl bg-surface-raised border border-border space-y-2">
            <span className="text-[11px] font-mono text-text-muted uppercase font-bold">
              Court Acceptance Rate
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-extrabold text-brand-ink font-display">
                {metrics?.uscisAdmissibilityRate || "100.0%"}
              </span>
              <span className="text-xs text-status-success font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Zero RFEs</span>
              </span>
            </div>
          </Card>
        </div>

        {/* Controls: Search, Filters & Batch Actions */}
        <Card className="p-4 rounded-2xl bg-surface-raised border border-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <Input
              placeholder="Search by client name, matter number, or A-Number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 text-xs rounded-xl bg-surface border-border"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {["ALL", "READY_TO_FILE", "ACTIVE", "CLOSED"].map((f) => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors shrink-0",
                  statusFilter === f
                    ? "bg-brand-500 text-white shadow-xs"
                    : "bg-surface text-text-muted hover:text-brand-ink border border-border"
                )}
              >
                {f.replace("_", " ")}
              </button>
            ))}
          </div>
        </Card>

        {/* Matters High-Density Master Table */}
        <Card className="rounded-[24px] bg-surface-raised border border-border overflow-hidden shadow-xs">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-sm font-bold text-brand-ink font-display flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-brand-500" />
                <span>Active Immigration Client Matters</span>
              </h3>
              <p className="text-xs text-text-muted">
                Showing {matters.length} matter{matters.length !== 1 ? "s" : ""} grouped by Alien Registration Number and USCIS petition type.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border bg-surface text-text-muted font-mono uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-5">Matter Number</th>
                  <th className="py-3 px-5">Client Name &amp; A-Number</th>
                  <th className="py-3 px-5">Petition Category</th>
                  <th className="py-3 px-5 text-center">Certified Exhibits</th>
                  <th className="py-3 px-5 text-center">Filing Status</th>
                  <th className="py-3 px-5 text-right">Court Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {matters.map((m) => (
                  <tr key={m.id} className="hover:bg-surface/60 transition-colors">
                    <td className="py-4 px-5 font-mono font-bold text-brand-ink">
                      {m.matterNumber}
                    </td>

                    <td className="py-4 px-5">
                      <div className="font-bold text-brand-ink">{m.clientName}</div>
                      <div className="font-mono text-[11px] text-text-muted">
                        {m.alienNumber ? m.alienNumber : "A-Number Pending"}
                      </div>
                    </td>

                    <td className="py-4 px-5">
                      <Badge variant="outline" className="font-sans text-[11px] bg-surface border-border">
                        {m.petitionType}
                      </Badge>
                    </td>

                    <td className="py-4 px-5 text-center font-mono">
                      <span className="font-bold text-brand-ink">{m.certifiedCount}</span>
                      <span className="text-text-muted"> / {m.documentsCount} certified</span>
                    </td>

                    <td className="py-4 px-5 text-center">
                      <Badge
                        className={cn(
                          "text-[10px] font-mono uppercase",
                          m.status === "READY_TO_FILE"
                            ? "bg-status-success-bg text-status-success border-status-success/30"
                            : m.status === "ACTIVE"
                            ? "bg-brand-50 text-brand-700 border-brand-200"
                            : "bg-surface text-text-muted border-border"
                        )}
                      >
                        {m.status.replace("_", " ")}
                      </Badge>
                    </td>

                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {m.status === "READY_TO_FILE" ? (
                          <Button
                            size="sm"
                            onClick={() => handleCompileBundle(m)}
                            className="h-8 px-3 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-[11px] font-semibold gap-1.5 shadow-xs"
                          >
                            <Layers className="w-3.5 h-3.5" />
                            <span>1-Click Court Bundle</span>
                          </Button>
                        ) : (
                          <Button
                            asChild
                            size="sm"
                            variant="outline"
                            className="h-8 px-3 rounded-lg text-[11px] gap-1.5"
                          >
                            <Link href={`/order/${m.orders[0]?.publicCode || "VL-8921-XQ"}/proof`}>
                              <span>Open Proofing</span>
                              <ExternalLink className="w-3 h-3 text-text-muted" />
                            </Link>
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </main>

      {/* New Matter Intake Modal */}
      {newModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <Card className="max-w-lg w-full p-6 sm:p-8 rounded-[28px] bg-surface-raised border border-border shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-brand-500" />
                <h3 className="text-base font-bold text-brand-ink font-display">
                  Open New Law Firm Client Matter
                </h3>
              </div>
              <button
                onClick={() => setNewModalOpen(false)}
                className="text-text-muted hover:text-brand-ink text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateMatter} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-mono text-text-muted uppercase text-[10px] font-bold">
                    Firm Matter Code
                  </label>
                  <Input
                    placeholder="e.g. 2026-USCIS-RODRIGUEZ"
                    value={matterNumber}
                    onChange={(e) => setMatterNumber(e.target.value)}
                    required
                    className="h-10 text-xs rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-mono text-text-muted uppercase text-[10px] font-bold">
                    Alien Reg. No. (A-Number)
                  </label>
                  <Input
                    placeholder="e.g. A218-491-032"
                    value={alienNumber}
                    onChange={(e) => setAlienNumber(e.target.value)}
                    className="h-10 text-xs rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-mono text-text-muted uppercase text-[10px] font-bold">
                  Client Legal Full Name (Matching Passport)
                </label>
                <Input
                  placeholder="e.g. Maria Elena Rodriguez Santos"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  required
                  className="h-10 text-xs rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-mono text-text-muted uppercase text-[10px] font-bold">
                  Immigration Petition Type
                </label>
                <select
                  value={petitionType}
                  onChange={(e) => setPetitionType(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-surface border border-border text-brand-ink focus:outline-hidden focus:ring-2 focus:ring-brand-500 text-xs"
                >
                  <option value="I-485 Adjustment of Status">I-485 Adjustment of Status</option>
                  <option value="I-130 Petition for Alien Relative">I-130 Petition for Alien Relative</option>
                  <option value="N-400 Application for Naturalization">N-400 Application for Naturalization</option>
                  <option value="EOIR Immigration Court Asylum Defense">EOIR Immigration Court Asylum Defense</option>
                  <option value="I-589 Application for Asylum">I-589 Application for Asylum</option>
                  <option value="Consular Processing / DS-260">Consular Processing / DS-260</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-mono text-text-muted uppercase text-[10px] font-bold">
                  Matter Notes &amp; Special Handling
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g., Strict name lock on maternal surname per G-28 filing..."
                  className="w-full p-3 rounded-xl bg-surface border border-border text-brand-ink text-xs focus:outline-hidden focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setNewModalOpen(false)}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={creating}
                  className="rounded-xl bg-brand-500 hover:bg-brand-600 text-white"
                >
                  {creating ? "Opening Matter..." : "Create Matter Workspace"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* 1-Click Court Exhibit Bundle Modal */}
      {bundleModalOpen && bundlingMatter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <Card className="max-w-xl w-full p-6 sm:p-8 rounded-[28px] bg-surface-raised border border-border shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-brand-500" />
                <h3 className="text-base font-bold text-brand-ink font-display">
                  USCIS Court-Ready Exhibit Packet Compiling
                </h3>
              </div>
              <button
                onClick={() => setBundleModalOpen(false)}
                className="text-text-muted hover:text-brand-ink text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {compilingBundle ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <div className="space-y-1">
                  <p className="font-bold text-sm text-brand-ink">
                    Compiling Consolidated Exhibit Packet...
                  </p>
                  <p className="text-xs text-text-muted font-mono">
                    Generating Table of Exhibits • Numbering Tab Dividers • Validating 8 CFR § 204.2 Statements
                  </p>
                </div>
              </div>
            ) : bundleResult ? (
              <div className="space-y-5">
                <div className="p-4 rounded-2xl bg-status-success-bg border border-status-success/30 flex items-center gap-3 text-xs text-status-success">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <p className="font-bold">
                    Court Exhibit Packet Successfully Assembled &amp; Cryptographically Sealed
                  </p>
                </div>

                <div className="border border-border rounded-xl p-4 bg-surface space-y-2 text-xs font-mono">
                  <div className="flex justify-between text-text-muted">
                    <span>Bundle Code:</span>
                    <span className="font-bold text-brand-ink">{bundleResult.bundleId}</span>
                  </div>
                  <div className="flex justify-between text-text-muted">
                    <span>Matter:</span>
                    <span className="font-bold text-brand-ink">{bundlingMatter.matterNumber}</span>
                  </div>
                  <div className="flex justify-between text-text-muted">
                    <span>Total Pages:</span>
                    <span className="font-bold text-brand-ink">{bundleResult.totalPages} Pages</span>
                  </div>
                  <div className="flex justify-between text-text-muted">
                    <span>Included Exhibits:</span>
                    <span className="font-bold text-brand-ink">
                      {bundleResult.exhibits?.map((e: any) => e.tab).join(", ")}
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setBundleModalOpen(false)}
                    className="rounded-xl text-xs"
                  >
                    Close
                  </Button>
                  <Button
                    onClick={() => window.open(bundleResult.downloadUrl, "_blank")}
                    className="rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-xs gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Merged Court PDF</span>
                  </Button>
                </div>
              </div>
            ) : null}
          </Card>
        </div>
      )}
    </div>
  );
}

export default function CounselDeskPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-text-muted">Loading CounselDesk...</div>}>
      <CounselDeskContent />
    </Suspense>
  );
}
