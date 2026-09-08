"use client";

import * as React from "react";
import { Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Download,
  ArrowLeft,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Edit3,
  Lock,
  Send,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Segment {
  id: string;
  page: number;
  section: string;
  sourceText: string;
  translatedText: string;
  isLockedTerm?: boolean;
  lockedTermType?: string;
}

interface LockedGlossaryItem {
  term: string;
  kind: string;
  reason: string;
  verifiedInTranslation: boolean;
}

interface RevisionItem {
  id: string;
  segmentId: string;
  originalText: string;
  suggestedText: string;
  reason: string;
  status: string;
  createdAt: string;
}

function ProofingStudioContent() {
  const params = useParams();
  const router = useRouter();
  const rawId = (params.id as string) || "VL-DEMO1";
  const publicCode = rawId.toUpperCase();

  const [loading, setLoading] = React.useState(true);
  const [order, setOrder] = React.useState<any>(null);
  const [segments, setSegments] = React.useState<Segment[]>([]);
  const [lockedGlossary, setLockedGlossary] = React.useState<LockedGlossaryItem[]>([]);
  const [revisions, setRevisions] = React.useState<RevisionItem[]>([]);
  const [activeSegmentId, setActiveSegmentId] = React.useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = React.useState(100);

  // Revision Modal State
  const [revisionModalOpen, setRevisionModalOpen] = React.useState(false);
  const [editingSegment, setEditingSegment] = React.useState<Segment | null>(null);
  const [suggestedText, setSuggestedText] = React.useState("");
  const [revisionReason, setRevisionReason] = React.useState("Matches Foreign Passport / USCIS Entry");
  const [submittingRevision, setSubmittingRevision] = React.useState(false);

  // Approval Modal State
  const [approvalModalOpen, setApprovalModalOpen] = React.useState(false);
  const [signatureName, setSignatureName] = React.useState("");
  const [confirmedCheck, setConfirmedCheck] = React.useState(false);
  const [approving, setApproving] = React.useState(false);
  const [certifiedResult, setCertifiedResult] = React.useState<any>(null);

  React.useEffect(() => {
    async function loadProofData() {
      try {
        const res = await fetch(`/api/order/${publicCode}/proof`);
        const data = await res.json();
        if (data && data.success) {
          if (data.order) setOrder(data.order);
          if (Array.isArray(data.segments)) setSegments(data.segments);
          if (Array.isArray(data.lockedGlossary)) setLockedGlossary(data.lockedGlossary);
          if (Array.isArray(data.revisions)) setRevisions(data.revisions);
        }

        const revRes = await fetch(`/api/order/${publicCode}/revisions`);
        const revData = await revRes.json();
        if (revData && revData.success && Array.isArray(revData.revisions)) {
          setRevisions(revData.revisions);
        }
      } catch (err) {
        console.error("Failed to load proof data", err);
      } finally {
        setLoading(false);
      }
    }
    loadProofData();
  }, [publicCode]);

  const handleOpenRevision = (seg: Segment) => {
    setEditingSegment(seg);
    setSuggestedText(seg.translatedText);
    setRevisionModalOpen(true);
  };

  const handleSubmitRevision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSegment || !suggestedText.trim()) return;

    setSubmittingRevision(true);
    try {
      const res = await fetch(`/api/order/${publicCode}/revisions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          segmentId: editingSegment.id,
          originalText: editingSegment.sourceText,
          suggestedText: suggestedText.trim(),
          reason: revisionReason,
        }),
      });
      const data = await res.json();
      if (data && data.success && data.revision) {
        setRevisions((prev) => [...(Array.isArray(prev) ? prev : []), data.revision]);
        setSegments((prev) =>
          (Array.isArray(prev) ? prev : []).map((s) =>
            s.id === editingSegment.id
              ? { ...s, translatedText: suggestedText.trim() }
              : s
          )
        );
        setRevisionModalOpen(false);
      }
    } catch (err) {
      console.error("Error submitting revision", err);
    } finally {
      setSubmittingRevision(false);
    }
  };

  const handleApproveOrder = async () => {
    if (!confirmedCheck || !signatureName.trim()) return;

    setApproving(true);
    try {
      const res = await fetch(`/api/order/${publicCode}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signatureName: signatureName.trim(),
          confirmedAccuracy: confirmedCheck,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCertifiedResult(data);
      }
    } catch (err) {
      console.error("Approval error", err);
    } finally {
      setApproving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-mono text-text-muted">Loading Proofing Studio workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas flex flex-col selection:bg-brand-100 selection:text-brand-ink">
      {/* Sticky Top Control Toolbar */}
      <header className="sticky top-0 z-40 bg-surface-raised border-b border-border shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Left: Back & Order Info */}
          <div className="flex items-center gap-3">
            <Link
              href={`/order/${publicCode}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-surface border border-border text-brand-ink hover:bg-brand-50 hover:border-brand-300 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Order Tracker</span>
            </Link>

            <div className="hidden sm:block h-5 w-px bg-border" />

            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-sm text-brand-ink">{publicCode}</span>
              <Badge variant="outline" className="text-[10px] font-mono uppercase bg-brand-50 text-brand-700 border-brand-200">
                {order?.sourceLang} → {order?.targetLang}
              </Badge>
              <span className="hidden md:inline-block text-xs text-text-muted truncate max-w-[200px]">
                {order?.fileName}
              </span>
            </div>
          </div>

          {/* Center: Zoom Controls */}
          <div className="hidden md:flex items-center gap-1 bg-surface border border-border rounded-lg p-1 text-xs">
            <button
              onClick={() => setZoomLevel((z) => Math.max(75, z - 15))}
              className="p-1.5 rounded hover:bg-surface-raised text-text-muted hover:text-brand-ink"
              title="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="px-2 font-mono text-[11px] font-bold text-text-muted">{zoomLevel}%</span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(150, z + 15))}
              className="p-1.5 rounded hover:bg-surface-raised text-text-muted hover:text-brand-ink"
              title="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel(100)}
              className="p-1.5 rounded hover:bg-surface-raised text-text-muted hover:text-brand-ink"
              title="Reset zoom"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            {(revisions?.length ?? 0) > 0 && (
              <Badge variant="secondary" className="hidden sm:inline-flex items-center gap-1 text-xs font-mono bg-status-warning-bg text-status-warning border border-status-warning/30">
                <Edit3 className="w-3 h-3" />
                <span>{revisions.length} Revision{revisions.length > 1 ? "s" : ""}</span>
              </Badge>
            )}

            <Button
              onClick={() => setApprovalModalOpen(true)}
              className="h-9 px-4 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-xs gap-1.5 shadow-sm"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Approve & Certify</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Studio Split View */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Compliance Guarantee Banner */}
        <div className="p-4 rounded-2xl bg-surface-raised border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-status-success-bg border border-status-success/30 flex items-center justify-center text-status-success shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-brand-ink">
                Bilingual Sync Proofing Active (USCIS 8 CFR § 204.2 Standard)
              </p>
              <p className="text-text-muted">
                Hover over any sentence to correlate with the source scan. Click &quot;Suggest Edit&quot; to adjust name transliterations prior to final sealing.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant="outline" className="text-[10px] font-mono bg-surface text-brand-ink border-border">
              Linguist: {order?.translator?.name || "Elena V."} (ATA Member 271892)
            </Badge>
          </div>
        </div>

        {/* 2-Column Split Workbench */}
        <div
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start transition-all"
          style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: "top center" }}
        >
          {/* LEFT COLUMN: Source Document View */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2 text-xs font-mono text-text-muted">
              <span className="font-bold uppercase tracking-wider text-brand-ink flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-brand-500 inline-block" />
                Original Foreign Document
              </span>
              <span>Page 1 of {order?.pageCount || 1}</span>
            </div>

            <Card className="p-6 sm:p-8 rounded-[24px] bg-surface-sunken border-2 border-border/80 shadow-inner font-serif text-xs leading-relaxed space-y-4 relative overflow-hidden">
              {/* Watermark effect */}
              <div className="absolute right-4 bottom-4 pointer-events-none opacity-5 text-brand-ink font-display font-black text-6xl select-none">
                ORIGINAL SCAN
              </div>

              <div className="border-b border-border/60 pb-3 text-center space-y-1">
                <p className="text-[10px] font-mono tracking-widest text-text-muted uppercase">
                  Archival Government Record Reproduction
                </p>
                <h4 className="font-bold text-sm text-brand-ink tracking-tight font-display">
                  ACTA DE NACIMIENTO - ESTADOS UNIDOS MEXICANOS
                </h4>
              </div>

              <div className="space-y-3 pt-2">
                {(segments || []).map((seg, idx) => {
                  const isActive = activeSegmentId === seg.id;
                  return (
                    <div
                      key={seg.id}
                      onMouseEnter={() => setActiveSegmentId(seg.id)}
                      onMouseLeave={() => setActiveSegmentId(null)}
                      className={cn(
                        "p-3 rounded-xl transition-colors border",
                        isActive
                          ? "bg-brand-50/80 border-brand-300 ring-2 ring-brand-500/20"
                          : "bg-surface/90 border-border/50 hover:bg-surface-raised"
                      )}
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono text-text-muted mb-1">
                        <span className="font-bold">§ SEG-0{idx + 1}</span>
                        {seg.isLockedTerm && (
                          <span className="inline-flex items-center gap-1 text-brand-700 bg-brand-50 px-1.5 py-0.5 rounded border border-brand-200">
                            <Lock className="w-2.5 h-2.5" />
                            {seg.lockedTermType}
                          </span>
                        )}
                      </div>
                      <p className="text-brand-ink font-mono text-xs">{seg.sourceText}</p>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* RIGHT COLUMN: Official Translated Draft */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2 text-xs font-mono text-text-muted">
              <span className="font-bold uppercase tracking-wider text-brand-ink flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-status-success inline-block" />
                Certified Translation Draft
              </span>
              <span className="text-status-success font-semibold">Ready for Review</span>
            </div>

            <Card className="p-6 sm:p-8 rounded-[24px] bg-surface-raised border-2 border-brand-200 shadow-md text-xs leading-relaxed space-y-4 relative">
              {/* Official Certificate Top Ribbon */}
              <div className="p-3.5 rounded-xl bg-brand-50/80 border border-brand-200 text-brand-ink space-y-1">
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className="font-mono text-brand-600">CERTIFIED LEGAL TRANSLATION DRAFT</span>
                  <span className="text-[10px] font-mono text-text-muted">8 CFR § 204.2 COMPLIANT</span>
                </div>
                <p className="text-[11px] text-text-muted leading-tight">
                  This translation preserves 1:1 structural layout, official seals, notarial signatures, and marginalia.
                </p>
              </div>

              {/* Translation Segments with Edit Buttons */}
              <div className="space-y-3 pt-2">
                {(segments || []).map((seg, idx) => {
                  const isActive = activeSegmentId === seg.id;
                  return (
                    <div
                      key={seg.id}
                      onMouseEnter={() => setActiveSegmentId(seg.id)}
                      onMouseLeave={() => setActiveSegmentId(null)}
                      className={cn(
                        "p-3 rounded-xl transition-all border group relative",
                        isActive
                          ? "bg-brand-50/90 border-brand-400 ring-2 ring-brand-500/20 shadow-xs"
                          : "bg-surface border-border hover:border-brand-200"
                      )}
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono text-text-muted mb-1">
                        <span className="font-bold text-brand-500">§ TRANS-0{idx + 1}</span>
                        <div className="flex items-center gap-1.5">
                          {seg.isLockedTerm && (
                            <span className="inline-flex items-center gap-1 text-brand-700 bg-brand-50 px-1.5 py-0.5 rounded border border-brand-200 font-bold">
                              <Lock className="w-2.5 h-2.5" />
                              VERIFIED
                            </span>
                          )}
                          <button
                            onClick={() => handleOpenRevision(seg)}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-surface-raised border border-border text-brand-ink hover:bg-brand-50 hover:border-brand-300 transition-colors font-sans font-semibold text-[10px]"
                          >
                            <Edit3 className="w-3 h-3 text-brand-500" />
                            <span>Suggest Edit</span>
                          </button>
                        </div>
                      </div>

                      <p className="text-brand-ink font-mono text-xs font-medium">
                        {seg.translatedText}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Sworn Translator Competence Affidavit Footer Preview */}
              <div className="pt-4 border-t border-border/80 space-y-2 text-[11px] font-mono text-text-muted">
                <div className="flex items-center gap-2 text-brand-ink font-bold font-sans">
                  <ShieldCheck className="w-4 h-4 text-brand-500" />
                  <span>Translator Certification Statement</span>
                </div>
                <p className="italic leading-relaxed">
                  &quot;I, Elena V., certified translator (ATA Member 271892), certify that I am competent to translate from Spanish into English, and that the above translation is true, accurate, and complete to the best of my knowledge.&quot;
                </p>
              </div>
            </Card>
          </div>
        </div>

        {/* Locked Glossary Table */}
        <Card className="p-6 rounded-[24px] bg-surface-raised border border-border space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-brand-ink font-display flex items-center gap-2">
                <Lock className="w-4 h-4 text-brand-500" />
                <span>Locked Terminology &amp; Identity Consistency Safeguard</span>
              </h3>
              <p className="text-xs text-text-muted">
                All names and dates below were cross-referenced against your immigration petition guidelines to prevent USCIS RFE rejections.
              </p>
            </div>
            <Badge variant="outline" className="text-xs bg-status-success-bg text-status-success border-status-success/30">
              100% Locked
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {(lockedGlossary || []).map((item) => (
              <div
                key={item.term}
                className="p-3 rounded-xl bg-surface border border-border space-y-1 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase text-brand-500 font-bold">
                    {item.kind}
                  </span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-status-success" />
                </div>
                <p className="font-bold text-brand-ink truncate">{item.term}</p>
                <p className="text-[10px] text-text-muted">{item.reason}</p>
              </div>
            ))}
          </div>
        </Card>
      </main>

      {/* Revision Modal */}
      {revisionModalOpen && editingSegment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <Card className="max-w-lg w-full p-6 sm:p-8 rounded-[28px] bg-surface-raised border border-border shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-brand-500" />
                <h3 className="text-base font-bold text-brand-ink">Suggest Line-Item Revision</h3>
              </div>
              <button
                onClick={() => setRevisionModalOpen(false)}
                className="text-text-muted hover:text-brand-ink text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitRevision} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-mono text-text-muted uppercase text-[10px] font-bold">
                  Source Document Text
                </label>
                <div className="p-3 rounded-xl bg-surface-sunken border border-border font-mono text-text-muted">
                  {editingSegment.sourceText}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-mono text-text-muted uppercase text-[10px] font-bold">
                  Reason for Adjustment
                </label>
                <select
                  value={revisionReason}
                  onChange={(e) => setRevisionReason(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-surface border border-border text-brand-ink focus:outline-hidden focus:ring-2 focus:ring-brand-500 text-xs"
                >
                  <option value="Matches Foreign Passport / USCIS Entry">
                    Matches Foreign Passport / USCIS Entry
                  </option>
                  <option value="Typo in Full Name or Surname">Typo in Full Name or Surname</option>
                  <option value="Date / Month Transposition (US Format MM/DD/YYYY)">
                    Date / Month Transposition (US Format MM/DD/YYYY)
                  </option>
                  <option value="Official Seal / Stamp Marginalia Addition">
                    Official Seal / Stamp Marginalia Addition
                  </option>
                  <option value="Other Legal Clarification">Other Legal Clarification</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-mono text-text-muted uppercase text-[10px] font-bold">
                  Proposed Correct Translation
                </label>
                <textarea
                  rows={3}
                  value={suggestedText}
                  onChange={(e) => setSuggestedText(e.target.value)}
                  className="w-full p-3 rounded-xl bg-surface border border-border text-brand-ink font-mono text-xs focus:outline-hidden focus:ring-2 focus:ring-brand-500"
                  placeholder="Enter corrected translation..."
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setRevisionModalOpen(false)}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={submittingRevision}
                  className="rounded-xl bg-brand-500 hover:bg-brand-600 text-white gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submittingRevision ? "Saving..." : "Apply Revision Note"}</span>
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Approval & Final Certification Modal */}
      {approvalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <Card className="max-w-lg w-full p-6 sm:p-8 rounded-[28px] bg-surface-raised border border-border shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-150">
            {certifiedResult ? (
              <div className="text-center space-y-5 py-4">
                <div className="w-16 h-16 rounded-full bg-status-success-bg border-2 border-status-success/40 text-status-success flex items-center justify-center mx-auto text-2xl">
                  ✓
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-brand-ink font-display">
                    Official Certificate Issued!
                  </h3>
                  <p className="text-xs text-text-muted leading-relaxed">
                    Your certified translation packet has been cryptographically sealed and registered on the public ledger under code{" "}
                    <span className="font-mono font-bold text-brand-500">{certifiedResult.verifyCode}</span>.
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
                  <Button
                    onClick={() => window.open(certifiedResult.downloadUrl, "_blank")}
                    className="h-11 px-5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-xs gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Certified PDF Packet</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/verify/${certifiedResult.verifyCode}`)}
                    className="h-11 px-5 rounded-xl text-xs gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>View Public QR Ledger</span>
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-brand-500" />
                    <h3 className="text-base font-bold text-brand-ink">
                      Approve &amp; Mint Certified Packet
                    </h3>
                  </div>
                  <button
                    onClick={() => setApprovalModalOpen(false)}
                    className="text-text-muted hover:text-brand-ink text-sm font-bold"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4 text-xs text-text-muted">
                  <p>
                    By approving this translation, the final certified PDF will be generated with an official ATA member affidavit, notarization statement, and tamper-proof SHA-256 cryptographic verification seal.
                  </p>

                  <div className="p-3.5 rounded-xl bg-brand-50/80 border border-brand-200 text-brand-ink space-y-2">
                    <p className="font-bold text-[11px] flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-status-success" />
                      <span>Pre-Certification Checklist</span>
                    </p>
                    <ul className="space-y-1 text-[11px] text-text-muted pl-5 list-disc">
                      <li>Full names match applicant passport &amp; USCIS forms</li>
                      <li>Birth/Marriage dates adhere to standard month/day formatting</li>
                      <li>Government registry stamps and raised seal marginalia included</li>
                    </ul>
                  </div>

                  <div className="space-y-2 pt-2">
                    <label className="font-mono text-text-muted uppercase text-[10px] font-bold block">
                      Type Your Full Legal Name to Electronically Sign
                    </label>
                    <Input
                      placeholder="e.g., Alejandro Martínez Rivera"
                      value={signatureName}
                      onChange={(e) => setSignatureName(e.target.value)}
                      className="h-10 text-xs rounded-xl"
                    />
                  </div>

                  <label className="flex items-start gap-2.5 pt-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={confirmedCheck}
                      onChange={(e) => setConfirmedCheck(e.target.checked)}
                      className="mt-0.5 rounded border-border text-brand-500 focus:ring-brand-500"
                    />
                    <span className="text-[11px] leading-tight text-brand-ink">
                      I have reviewed this translation draft in the Proofing Studio and confirm that all details are accurate and complete for official immigration/court submission.
                    </span>
                  </label>
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setApprovalModalOpen(false)}
                    className="rounded-xl"
                  >
                    Back to Review
                  </Button>
                  <Button
                    onClick={handleApproveOrder}
                    disabled={approving || !confirmedCheck || !signatureName.trim()}
                    className="rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-xs gap-1.5"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>{approving ? "Sealing Certificate..." : "Approve & Mint"}</span>
                  </Button>
                </div>
              </>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ProofingStudioErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Proofing Studio encountered an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-canvas flex items-center justify-center p-6">
          <Card className="max-w-md w-full p-8 rounded-2xl bg-surface-raised border border-border text-center space-y-4 shadow-lg">
            <div className="w-12 h-12 rounded-full bg-status-warning-bg border border-status-warning/40 text-status-warning flex items-center justify-center mx-auto text-xl">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-base text-brand-ink">Proofing Studio Notice</h3>
              <p className="text-xs text-text-muted">
                An issue occurred while rendering the document preview. Click below to reload the workspace.
              </p>
            </div>
            <Button
              onClick={() => {
                this.setState({ hasError: false });
                window.location.reload();
              }}
              className="h-10 px-5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-xs"
            >
              Reload Workspace
            </Button>
          </Card>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function ProofingStudioPage() {
  return (
    <ProofingStudioErrorBoundary>
      <Suspense fallback={<div className="p-12 text-center text-text-muted">Loading Proofing Studio...</div>}>
        <ProofingStudioContent />
      </Suspense>
    </ProofingStudioErrorBoundary>
  );
}

