"use client";

import * as React from "react";
import { Lock, CheckCircle2, AlertTriangle, ShieldCheck, CornerDownLeft, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export interface WorkbenchSegmentData {
  id: string;
  section: string;
  sourceText: string;
  targetText: string;
  locked: boolean;
  status: "TRANSLATED" | "VERIFIED" | "NEEDS_REVIEW";
  confidence?: number;
  coordinateNotice?: string;
}

export interface SegmentEditorStreamProps {
  segments: WorkbenchSegmentData[];
  activeSegmentIndex: number;
  onSelectSegment: (index: number) => void;
  onUpdateSegmentText: (index: number, text: string) => void;
  onVerifySegment: (index: number) => void;
  isTargetRtl?: boolean;
  isSourceRtl?: boolean;
}

export function SegmentEditorStream({
  segments,
  activeSegmentIndex,
  onSelectSegment,
  onUpdateSegmentText,
  onVerifySegment,
  isTargetRtl = false,
  isSourceRtl = false,
}: SegmentEditorStreamProps) {
  const activeTextareaRef = React.useRef<HTMLTextAreaElement>(null);

  // Auto-focus active segment textarea on index change
  React.useEffect(() => {
    if (activeTextareaRef.current) {
      activeTextareaRef.current.focus();
    }
  }, [activeSegmentIndex]);

  const getConfidenceBadge = (confidence?: number) => {
    const score = confidence !== undefined ? confidence : 0.99;
    const pct = (score * 100).toFixed(1);

    if (score >= 0.98) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-court-emerald/10 text-court-emerald border border-court-emerald/30">
          <ShieldCheck className="w-3 h-3" />
          <span>{pct}% OCR FIDELITY</span>
        </span>
      );
    }
    if (score >= 0.9) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-statutory/10 text-amber-statutory-dark border border-amber-statutory/30">
          <AlertTriangle className="w-3 h-3 text-amber-statutory" />
          <span>{pct}% REVIEW ADVISED</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-red-500/10 text-red-700 border border-red-500/30">
        <AlertTriangle className="w-3 h-3 text-red-600" />
        <span>{pct}% MANUAL CHECK</span>
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {segments.map((seg, idx) => {
        const isFocused = activeSegmentIndex === idx;

        const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
          // ⌘+Enter to affirm and move to next
          if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
            e.preventDefault();
            onVerifySegment(idx);
          }
        };

        return (
          <div
            key={seg.id}
            onClick={() => onSelectSegment(idx)}
            className={cn(
              "rounded-[var(--r-xl)] p-1.5 md:p-2 transition-all cursor-pointer shadow-2xs",
              isFocused
                ? "bg-surface-raised border-2 border-brand-500 ring-2 ring-brand-500/20 shadow-sm"
                : "bg-surface-raised/60 border border-border/80 hover:border-border-strong hover:bg-surface-raised"
            )}
          >
            <div className="rounded-[calc(var(--r-xl)-0.375rem)] md:rounded-[calc(var(--r-xl)-0.5rem)] bg-surface border border-border/40 p-4 sm:p-5 space-y-3.5">
              {/* Card Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "font-bold text-xs px-2 py-0.5 rounded",
                      isFocused
                        ? "bg-brand-ink text-white"
                        : "bg-surface-raised border border-border text-brand-ink"
                    )}
                  >
                    Segment 0{idx + 1}
                  </span>
                  <span className="text-text-subtle font-semibold">• {seg.section}</span>
                </div>

                <div className="flex items-center gap-2">
                  {getConfidenceBadge(seg.confidence)}

                  {seg.locked && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono text-signal-accent bg-signal-accent/10 px-2 py-0.5 rounded border border-signal-accent/30 font-bold">
                      <Lock className="w-2.5 h-2.5" />
                      <span>USCIS LOCKED</span>
                    </span>
                  )}

                  {seg.status === "VERIFIED" && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono text-court-emerald bg-court-emerald/10 px-2 py-0.5 rounded border border-court-emerald/30 font-bold">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>VERIFIED</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Source Document Text Run */}
              <div
                dir={isSourceRtl ? "rtl" : "ltr"}
                className={cn(
                  "p-3 rounded-xl bg-surface-sunken border border-border/70 text-xs text-text-muted leading-relaxed select-text",
                  isSourceRtl ? "font-arabic text-sm text-right" : "font-mono"
                )}
              >
                {seg.sourceText}
              </div>

              {/* Target Translation Editable Textarea */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-mono text-text-subtle">
                  <label className="uppercase font-bold tracking-wider">
                    Target Certified Text {isTargetRtl && "(RTL)"}
                  </label>
                  <span className="text-text-subtle font-medium">
                    {seg.targetText.trim().split(/\s+/).filter(Boolean).length} words
                  </span>
                </div>

                <textarea
                  ref={isFocused ? activeTextareaRef : null}
                  dir={isTargetRtl ? "rtl" : "ltr"}
                  rows={2}
                  value={seg.targetText}
                  onChange={(e) => onUpdateSegmentText(idx, e.target.value)}
                  onKeyDown={handleKeyDown}
                  className={cn(
                    "w-full p-3 rounded-xl bg-surface-raised border border-border text-brand-ink text-xs focus:outline-hidden focus:ring-2 focus:ring-brand-500 transition-all leading-relaxed resize-y",
                    isTargetRtl ? "font-arabic text-sm text-right" : "font-sans font-medium"
                  )}
                  placeholder="Enter certified translation..."
                />
              </div>

              {/* Actions Footer inside Active Card */}
              {isFocused && (
                <div className="pt-2 border-t border-border/60 flex items-center justify-between gap-2 text-xs">
                  <span className="hidden sm:inline font-mono text-[11px] text-text-subtle">
                    Press <kbd className="px-1.5 py-0.5 rounded bg-surface-raised border border-border text-[10px]">⌘↵</kbd> to verify &amp; advance
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onVerifySegment(idx);
                    }}
                    className="min-h-[44px] inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-ink hover:bg-brand-900 text-white font-semibold text-xs transition-all cursor-pointer active:scale-[0.98] touch-manipulation ml-auto"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-court-emerald" />
                    <span>Verify &amp; Next</span>
                    <CornerDownLeft className="w-3 h-3 text-text-subtle" />
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
