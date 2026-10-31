"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Clock, Save, PenTool, Command, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface WorkbenchHeaderProps {
  publicCode: string;
  sourceLang?: string;
  targetLang?: string;
  documentName?: string;
  deadlineFormatted?: string;
  saving: boolean;
  lastSaved: string | null;
  onSaveDraft: () => void;
  onOpenSignModal: () => void;
  onOpenShortcuts: () => void;
  isRtl?: boolean;
}

export function WorkbenchHeader({
  publicCode,
  sourceLang = "Spanish",
  targetLang = "English",
  documentName = "Document.pdf",
  deadlineFormatted = "Today at 6:00 PM EST",
  saving,
  lastSaved,
  onSaveDraft,
  onOpenSignModal,
  onOpenShortcuts,
  isRtl = false,
}: WorkbenchHeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-surface-raised/95 backdrop-blur-md border-b border-border shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Breadcrumb link & Docket metadata */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/admin/queue"
            className="min-h-[44px] inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-surface border border-border text-brand-ink hover:bg-surface-raised hover:border-border-strong transition-all cursor-pointer active:scale-[0.98] touch-manipulation"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-brand-ink" />
            <span className="hidden sm:inline">Admin Queue</span>
          </Link>

          <div className="hidden sm:block h-5 w-px bg-border shrink-0" />

          <div className="flex items-center gap-2 min-w-0">
            <span className="font-mono font-bold text-sm text-brand-ink tracking-tight shrink-0">
              {publicCode}
            </span>
            <Badge
              variant="outline"
              className="text-[10px] font-mono bg-surface border-border text-brand-ink font-semibold"
            >
              {sourceLang} → {targetLang}
            </Badge>
            {isRtl && (
              <Badge
                variant="outline"
                className="hidden md:inline-flex text-[10px] font-mono bg-court-emerald/10 text-court-emerald border-court-emerald/30 font-bold"
              >
                BiDi RTL
              </Badge>
            )}
            <span className="hidden lg:inline-block text-xs text-text-muted truncate max-w-[180px]">
              {documentName}
            </span>
          </div>
        </div>

        {/* Center: SLA countdown & Save heartbeat */}
        <div className="hidden md:flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface border border-border text-text-subtle">
            <Clock className="w-3.5 h-3.5 text-signal-accent shrink-0" />
            <span className="text-[11px] font-semibold">{deadlineFormatted}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onSaveDraft}
              disabled={saving}
              className="min-h-[44px] inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-semibold bg-surface border border-border text-brand-ink hover:bg-surface-raised hover:border-border-strong disabled:opacity-50 transition-all cursor-pointer active:scale-[0.98] touch-manipulation"
              title="Save draft (⌘S)"
            >
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  saving ? "bg-amber-statutory animate-ping" : "bg-court-emerald animate-pulse"
                }`}
              />
              <Save className="w-3.5 h-3.5 text-brand-ink" />
              <span>{saving ? "Saving..." : lastSaved ? `Saved (${lastSaved})` : "Save Draft"}</span>
            </button>
          </div>
        </div>

        {/* Right: Shortcuts trigger & Primary Sign CTA */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenShortcuts}
            className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center p-2 rounded-xl bg-surface border border-border text-text-muted hover:text-brand-ink hover:border-border-strong transition-all cursor-pointer active:scale-[0.98] touch-manipulation"
            title="Keyboard Shortcuts (⌘K or ?)"
            aria-label="Keyboard shortcuts"
          >
            <Command className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenSignModal}
            className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-ink hover:bg-brand-900 text-white font-semibold text-xs shadow-xs transition-all cursor-pointer active:scale-[0.97] touch-manipulation"
          >
            <PenTool className="w-3.5 h-3.5 text-signal-accent" />
            <span>Sign &amp; Certify</span>
          </button>
        </div>
      </div>
    </header>
  );
}
