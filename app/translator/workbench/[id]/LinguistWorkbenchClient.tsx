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
  Lock,
  Stamp,
  PenTool,
  Save,
  Send,
  ArrowLeft,
  FileCheck,
  Clock,
  Sparkles,
  Layers,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkbenchSegment {
  id: string;
  section: string;
  sourceText: string;
  targetText: string;
  locked: boolean;
  status: "TRANSLATED" | "VERIFIED" | "NEEDS_REVIEW";
}

interface LockedTerm {
  term: string;
  kind: string;
  matched: boolean;
}

function LinguistStudioContent() {
  const params = useParams();
  const router = useRouter();
  const rawId = (params.id as string) || "VL-DEMO1";
  const publicCode = rawId.toUpperCase();

  const [loading, setLoading] = React.useState(true);
  const [job, setJob] = React.useState<any>(null);
  const [segments, setSegments] = React.useState<WorkbenchSegment[]>([]);
  const [lockedTerms, setLockedTerms] = React.useState<LockedTerm[]>([]);
  const [activeSegmentIndex, setActiveSegmentIndex] = React.useState(0);
  const [saving, setSaving] = React.useState(false);
  const [lastSaved, setLastSaved] = React.useState<string | null>(null);

  // Signing Modal State
  const [signModalOpen, setSignModalOpen] = React.useState(false);
  const [signatureData, setSignatureData] = React.useState("");
  const [affidavitConfirmed, setAffidavitConfirmed] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [submissionSuccess, setSubmissionSuccess] = React.useState(false);

  React.useEffect(() => {
    async function fetchWorkbench() {
      try {
        const res = await fetch(`/api/translator/workbench/${publicCode}`);
        const data = await res.json();
        if (data.success) {
          setJob(data.job);
          setSegments(data.segments);
          setLockedTerms(data.job.lockedTerms || []);
        }
      } catch (err) {
        console.error("Error loading workbench", err);
      } finally {
        setLoading(false);
      }
    }
    fetchWorkbench();
  }, [publicCode]);

  const handleUpdateSegmentText = (index: number, newText: string) => {
    setSegments((prev) =>
      prev.map((s, idx) => (idx === index ? { ...s, targetText: newText } : s))
    );
  };

  const handleInsertTag = (tag: string) => {
    const current = segments[activeSegmentIndex]?.targetText || "";
    handleUpdateSegmentText(activeSegmentIndex, current ? `${current} ${tag}` : tag);
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/translator/workbench/${publicCode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ segments }),
      });
      const data = await res.json();
      if (data.success) {
        setLastSaved("Just now");
      }
    } catch (err) {
      console.error("Failed to auto-save", err);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitFinalTranslation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!affidavitConfirmed || !signatureData.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/translator/workbench/${publicCode}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signatureData: signatureData.trim(),
          translatorAffidavitConfirmed: affidavitConfirmed,
          segments,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSubmissionSuccess(true);
      }
    } catch (err) {
      console.error("Submission failed", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-mono text-text-muted">Loading Linguist Studio™ workbench...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas flex flex-col selection:bg-brand-100 selection:text-brand-ink">
      {/* Top Toolbar */}
      <header className="sticky top-0 z-40 bg-surface-raised border-b border-border shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Left info */}
          <div className="flex items-center gap-3">
            <Link
              href="/admin/queue"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-surface border border-border text-brand-ink hover:bg-brand-50 hover:border-brand-300 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Admin Queue</span>
            </Link>

            <div className="hidden sm:block h-5 w-px bg-border" />

            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-sm text-brand-ink">{publicCode}</span>
              <Badge variant="outline" className="text-[10px] font-mono bg-brand-50 text-brand-700 border-brand-200">
                {job?.sourceLang} → {job?.targetLang}
              </Badge>
              <span className="hidden md:inline-block text-xs text-text-muted truncate max-w-[200px]">
                {job?.documentName}
              </span>
            </div>
          </div>

          {/* Center: Save state */}
          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-text-muted">
            <Button
              size="sm"
              variant="outline"
              onClick={handleSaveDraft}
              disabled={saving}
              className="h-8 px-2.5 rounded-lg text-xs gap-1.5"
            >
              <Save className="w-3.5 h-3.5 text-brand-500" />
              <span>{saving ? "Saving..." : lastSaved ? `Saved (${lastSaved})` : "Save Draft"}</span>
            </Button>
          </div>

          {/* Right: Sign & Submit Button */}
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setSignModalOpen(true)}
              className="h-9 px-4 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-xs gap-1.5 shadow-sm"
            >
              <PenTool className="w-4 h-4" />
              <span>Sign &amp; Certify</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Studio Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Compliance Guarantee Bar */}
        <div className="p-4 rounded-2xl bg-surface-raised border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-500 shrink-0">
              <Stamp className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-brand-ink">
                Linguist Studio™ Certified CAT Environment • 8 CFR § 204.2 Standard
              </p>
              <p className="text-text-muted">
                Maintain verbatim 1:1 segment alignment. Prescribe all notarial marks in brackets.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 font-mono text-[11px] text-text-muted shrink-0">
            <Clock className="w-3.5 h-3.5 text-brand-500" />
            <span>SLA Deadline: {job?.deadlineFormatted}</span>
          </div>
        </div>

        {/* 2-Column CAT Split Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT/CENTER: Segments Translation Stream (8 Cols) */}
          <div className="lg:col-span-8 space-y-4">
            {/* Quick Annotation Pallet */}
            <div className="p-3 rounded-xl bg-surface border border-border flex flex-wrap items-center gap-2 text-xs">
              <span className="text-[10px] font-mono text-text-muted uppercase font-bold mr-1">
                Insert Mark:
              </span>
              <button
                onClick={() => handleInsertTag("[Official Embossed Seal: State Civil Registry]")}
                className="px-2.5 py-1 rounded-lg bg-surface-raised border border-border hover:border-brand-300 text-brand-ink text-[11px] font-mono transition-colors"
              >
                + [Official Seal]
              </button>
              <button
                onClick={() => handleInsertTag("[Notary Wet-Ink Stamp: Legible]")}
                className="px-2.5 py-1 rounded-lg bg-surface-raised border border-border hover:border-brand-300 text-brand-ink text-[11px] font-mono transition-colors"
              >
                + [Notary Stamp]
              </button>
              <button
                onClick={() => handleInsertTag("[Signature: Legible / Armando Castro Garza]")}
                className="px-2.5 py-1 rounded-lg bg-surface-raised border border-border hover:border-brand-300 text-brand-ink text-[11px] font-mono transition-colors"
              >
                + [Officer Signature]
              </button>
              <button
                onClick={() => handleInsertTag("[Barcode: 394810294821]")}
                className="px-2.5 py-1 rounded-lg bg-surface-raised border border-border hover:border-brand-300 text-brand-ink text-[11px] font-mono transition-colors"
              >
                + [Barcode]
              </button>
            </div>

            {/* Segment Rows */}
            <div className="space-y-4">
              {segments.map((seg, idx) => {
                const isFocused = activeSegmentIndex === idx;
                return (
                  <Card
                    key={seg.id}
                    onClick={() => setActiveSegmentIndex(idx)}
                    className={cn(
                      "p-4 sm:p-5 rounded-2xl border transition-all space-y-3 cursor-pointer",
                      isFocused
                        ? "bg-surface-raised border-brand-400 ring-2 ring-brand-500/20 shadow-sm"
                        : "bg-surface-raised/70 border-border hover:border-brand-200"
                    )}
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono text-text-muted">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-brand-500">Segment 0{idx + 1}</span>
                        <span className="text-text-muted">• {seg.section}</span>
                      </div>
                      {seg.locked && (
                        <span className="inline-flex items-center gap-1 text-brand-700 bg-brand-50 px-1.5 py-0.5 rounded border border-brand-200 font-bold">
                          <Lock className="w-2.5 h-2.5" />
                          IDENTITY LOCKED
                        </span>
                      )}
                    </div>

                    {/* Source Segment Display */}
                    <div className="p-3 rounded-xl bg-surface-sunken border border-border/70 font-mono text-xs text-text-muted">
                      {seg.sourceText}
                    </div>

                    {/* Target Translation Input */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-text-muted uppercase font-bold">
                        Target Certified Translation (English)
                      </label>
                      <textarea
                        rows={2}
                        value={seg.targetText}
                        onChange={(e) => handleUpdateSegmentText(idx, e.target.value)}
                        className="w-full p-3 rounded-xl bg-surface border border-border text-brand-ink font-mono text-xs focus:outline-hidden focus:ring-2 focus:ring-brand-500 transition-all leading-relaxed"
                      />
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* RIGHT SIDEBAR: Glossary & Notary Credentials (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Identity Glossary Lock Inspector */}
            <Card className="p-5 rounded-2xl bg-surface-raised border border-border space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-brand-500" />
                  <h3 className="text-xs font-bold text-brand-ink font-display">
                    USCIS Identity Locks
                  </h3>
                </div>
                <Badge variant="outline" className="text-[10px] bg-status-success-bg text-status-success border-status-success/30">
                  Strict Active
                </Badge>
              </div>

              <div className="space-y-2.5 text-xs">
                {lockedTerms.map((t) => (
                  <div key={t.term} className="p-2.5 rounded-xl bg-surface border border-border space-y-0.5">
                    <div className="flex items-center justify-between text-[10px] font-mono text-text-muted">
                      <span className="font-bold text-brand-500">{t.kind}</span>
                      <CheckCircle2 className="w-3 h-3 text-status-success" />
                    </div>
                    <p className="font-mono font-bold text-brand-ink truncate">{t.term}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Assigned Linguist Credentials */}
            <Card className="p-5 rounded-2xl bg-surface-raised border border-border space-y-3 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-500 font-mono font-bold text-sm">
                  EV
                </div>
                <div>
                  <h4 className="font-bold text-brand-ink">{job?.assignedTranslator?.name}</h4>
                  <p className="text-[11px] text-text-muted">{job?.assignedTranslator?.credentials}</p>
                </div>
              </div>

              <div className="border-t border-border pt-3 space-y-1 text-[11px] font-mono text-text-muted">
                <p>Notary Commission: {job?.assignedTranslator?.notaryCommission}</p>
                <p>Affidavit Mandate: 8 CFR § 204.2(a)(1)(iii)(B)</p>
              </div>
            </Card>
          </div>
        </div>
      </main>

      {/* Digital Wet-Ink Signing Modal */}
      {signModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <Card className="max-w-lg w-full p-6 sm:p-8 rounded-[28px] bg-surface-raised border border-border shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-150">
            {submissionSuccess ? (
              <div className="text-center space-y-5 py-4">
                <div className="w-16 h-16 rounded-full bg-status-success-bg border-2 border-status-success/40 text-status-success flex items-center justify-center mx-auto text-2xl">
                  ✓
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-brand-ink font-display">
                    Translation Affirmed &amp; Signed!
                  </h3>
                  <p className="text-xs text-text-muted leading-relaxed">
                    Your digital wet-ink seal and sworn affidavit statement have been attached to order{" "}
                    <span className="font-mono font-bold text-brand-500">{publicCode}</span>.
                  </p>
                </div>

                <div className="pt-2">
                  <Button
                    onClick={() => router.push("/admin/queue")}
                    className="h-10 px-5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-xs"
                  >
                    Return to Admin Queue
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div className="flex items-center gap-2">
                    <PenTool className="w-5 h-5 text-brand-500" />
                    <h3 className="text-base font-bold text-brand-ink font-display">
                      Affix Sworn Digital Signature &amp; Seal
                    </h3>
                  </div>
                  <button
                    onClick={() => setSignModalOpen(false)}
                    className="text-text-muted hover:text-brand-ink text-sm font-bold"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSubmitFinalTranslation} className="space-y-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-brand-50/80 border border-brand-200 text-brand-ink space-y-1.5">
                    <p className="font-bold text-[11px] flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-brand-500" />
                      <span>8 CFR § 204.2 Sworn Translator Statement</span>
                    </p>
                    <p className="text-[11px] text-text-muted italic leading-relaxed">
                      &quot;I certify that I am competent to translate from Spanish into English, and that the translation of {publicCode} is true and accurate to the best of my abilities.&quot;
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-mono text-text-muted uppercase text-[10px] font-bold block">
                      Digital Wet-Ink Signature (Type Full Legal Name)
                    </label>
                    <Input
                      placeholder="e.g. Elena Volkova, ATA Member 271892"
                      value={signatureData}
                      onChange={(e) => setSignatureData(e.target.value)}
                      required
                      className="h-10 text-xs rounded-xl font-serif text-brand-ink"
                    />
                  </div>

                  <label className="flex items-start gap-2.5 pt-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={affidavitConfirmed}
                      onChange={(e) => setAffidavitConfirmed(e.target.checked)}
                      className="mt-0.5 rounded border-border text-brand-500 focus:ring-brand-500"
                    />
                    <span className="text-[11px] leading-tight text-brand-ink">
                      I solemnly swear under penalty of perjury under the laws of the United States of America that this translation is complete, authentic, and accurately transcribed.
                    </span>
                  </label>

                  <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setSignModalOpen(false)}
                      className="rounded-xl"
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={submitting || !affidavitConfirmed || !signatureData.trim()}
                      className="rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-xs gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{submitting ? "Signing..." : "Affix Seal & Submit"}</span>
                    </Button>
                  </div>
                </form>
              </>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}

export default function LinguistStudioPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-text-muted">Loading Linguist Studio™...</div>}>
      <LinguistStudioContent />
    </Suspense>
  );
}
