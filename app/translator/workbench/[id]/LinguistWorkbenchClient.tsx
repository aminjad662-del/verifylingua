"use client";

import * as React from "react";
import { Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { WorkbenchHeader } from "@/components/workbench/WorkbenchHeader";
import { DocumentInspectionCanvas, CanvasSegment } from "@/components/workbench/DocumentInspectionCanvas";
import { SegmentEditorStream, WorkbenchSegmentData } from "@/components/workbench/SegmentEditorStream";
import { JuratStampPalette } from "@/components/workbench/JuratStampPalette";
import { ComplianceInspectorRail } from "@/components/workbench/ComplianceInspectorRail";
import { DigitalSignModal } from "@/components/workbench/DigitalSignModal";
import { KeyboardShortcutsDialog } from "@/components/workbench/KeyboardShortcutsDialog";

interface LockedTerm {
  term: string;
  kind: string;
  matched: boolean;
}

function LinguistStudioContent() {
  const params = useParams();
  const router = useRouter();
  const rawId = (params.id as string) || "";
  const publicCode = rawId.toUpperCase();

  const [loading, setLoading] = React.useState(true);
  const [job, setJob] = React.useState<any>(null);
  const [segments, setSegments] = React.useState<WorkbenchSegmentData[]>([]);
  const [lockedTerms, setLockedTerms] = React.useState<LockedTerm[]>([]);
  const [activeSegmentIndex, setActiveSegmentIndex] = React.useState(0);
  const [saving, setSaving] = React.useState(false);
  const [lastSaved, setLastSaved] = React.useState<string | null>(null);

  // Modal States
  const [signModalOpen, setSignModalOpen] = React.useState(false);
  const [shortcutsOpen, setShortcutsOpen] = React.useState(false);
  const [signatureData, setSignatureData] = React.useState("");
  const [affidavitConfirmed, setAffidavitConfirmed] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [submissionSuccess, setSubmissionSuccess] = React.useState(false);

  // BiDi detection
  const isRtlLang = (lang?: string) => {
    if (!lang) return false;
    const l = lang.toLowerCase().trim();
    return l === "ar" || l === "arabic" || l === "he" || l === "hebrew" || l === "fa" || l === "ur";
  };

  const isTargetRtl = isRtlLang(job?.targetLang);
  const isSourceRtl = isRtlLang(job?.sourceLang);

  React.useEffect(() => {
    if (!publicCode) {
      setLoading(false);
      return;
    }
    async function fetchWorkbench() {
      try {
        const res = await fetch(`/api/translator/workbench/${publicCode}`);
        const data = await res.json();
        if (data && data.success) {
          if (data.job) setJob(data.job);
          if (Array.isArray(data.segments)) setSegments(data.segments);
          setLockedTerms(data.job?.lockedTerms || data.lockedTerms || []);
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

  const handleVerifySegment = (index: number) => {
    setSegments((prev) =>
      prev.map((s, idx) => (idx === index ? { ...s, status: "VERIFIED" } : s))
    );
    if (index < segments.length - 1) {
      setActiveSegmentIndex(index + 1);
    }
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

  // Global Keyboard Shortcuts
  React.useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // ⌘S -> Save Draft
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        handleSaveDraft();
        return;
      }

      // ⌘K or ? -> Shortcuts Palette
      if (((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") || (e.key === "?" && !e.target?.toString().includes("TextArea"))) {
        e.preventDefault();
        setShortcutsOpen((prev) => !prev);
        return;
      }

      // Stamp Shortcuts: ⌘1 - ⌘5
      if ((e.metaKey || e.ctrlKey) && ["1", "2", "3", "4", "5"].includes(e.key)) {
        e.preventDefault();
        const stampMap: Record<string, string> = {
          "1": "[Official Embossed Seal: State Civil Registry]",
          "2": "[Notary Wet-Ink Stamp: Legible / Commission No. GG-918231]",
          "3": "[Sworn Jurat: 8 CFR § 204.2 ATA Cert No. 271892]",
          "4": "[Hague Apostille Certificate: Authenticated]",
          "5": `[Barcode / QR Identifier: ${publicCode}]`,
        };
        const tag = stampMap[e.key];
        if (tag) handleInsertTag(tag);
        return;
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [segments, activeSegmentIndex, publicCode]);

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

      try {
        await fetch("/api/translations/approve", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: publicCode,
            reviewerId: "rev_authorized",
          }),
        });
      } catch {}
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
          <div className="w-12 h-12 border-4 border-brand-ink border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-mono text-text-muted">Loading Linguist Studio™ workbench...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas flex flex-col selection:bg-brand-100 selection:text-brand-ink">
      {/* 1. High-Density Command Header */}
      <WorkbenchHeader
        publicCode={publicCode}
        sourceLang={job?.sourceLang}
        targetLang={job?.targetLang}
        documentName={job?.documentName}
        deadlineFormatted={job?.deadlineFormatted}
        saving={saving}
        lastSaved={lastSaved}
        onSaveDraft={handleSaveDraft}
        onOpenSignModal={() => setSignModalOpen(true)}
        onOpenShortcuts={() => setShortcutsOpen(true)}
        isRtl={isTargetRtl || isSourceRtl}
      />

      {/* 2. Main Studio Workspace Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Direct Manipulation Document Canvas (5 Cols) */}
          <div className="lg:col-span-5 h-[700px] sticky top-22">
            <DocumentInspectionCanvas
              specimenImagePath={job?.specimenImagePath || "/images/docs/birth-certificate.jpg"}
              segments={segments as CanvasSegment[]}
              activeSegmentIndex={activeSegmentIndex}
              onSelectSegment={setActiveSegmentIndex}
              documentName={job?.documentName || "Document.pdf"}
            />
          </div>

          {/* Center Column: Stamp Palette & Segment Editor Stream (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            <JuratStampPalette
              onInsertTag={handleInsertTag}
              publicCode={publicCode}
            />

            <SegmentEditorStream
              segments={segments}
              activeSegmentIndex={activeSegmentIndex}
              onSelectSegment={setActiveSegmentIndex}
              onUpdateSegmentText={handleUpdateSegmentText}
              onVerifySegment={handleVerifySegment}
              isTargetRtl={isTargetRtl}
              isSourceRtl={isSourceRtl}
            />
          </div>

          {/* Right Column: Sovereign Compliance Inspector Rail (3 Cols) */}
          <div className="lg:col-span-3 sticky top-22">
            <ComplianceInspectorRail
              lockedTerms={lockedTerms}
              assignedTranslator={job?.assignedTranslator}
              publicCode={publicCode}
            />
          </div>
        </div>
      </main>

      {/* 3. Digital Wet-Ink Signing Modal */}
      <DigitalSignModal
        isOpen={signModalOpen}
        onClose={() => setSignModalOpen(false)}
        publicCode={publicCode}
        sourceLang={job?.sourceLang}
        targetLang={job?.targetLang}
        signatureData={signatureData}
        onSignatureChange={setSignatureData}
        affidavitConfirmed={affidavitConfirmed}
        onAffidavitChange={setAffidavitConfirmed}
        onSubmit={handleSubmitFinalTranslation}
        submitting={submitting}
        submissionSuccess={submissionSuccess}
        onReturnToQueue={() => router.push("/admin/queue")}
      />

      {/* 4. Keyboard Shortcuts Cheatsheet Palette */}
      <KeyboardShortcutsDialog
        isOpen={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
      />
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
