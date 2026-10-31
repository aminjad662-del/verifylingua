"use client";

import * as React from "react";
import { PenTool, ShieldCheck, CheckCircle2, X } from "lucide-react";

export interface DigitalSignModalProps {
  isOpen: boolean;
  onClose: () => void;
  publicCode: string;
  sourceLang?: string;
  targetLang?: string;
  signatureData: string;
  onSignatureChange: (val: string) => void;
  affidavitConfirmed: boolean;
  onAffidavitChange: (confirmed: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
  submissionSuccess: boolean;
  onReturnToQueue: () => void;
}

export function DigitalSignModal({
  isOpen,
  onClose,
  publicCode,
  sourceLang = "Spanish",
  targetLang = "English",
  signatureData,
  onSignatureChange,
  affidavitConfirmed,
  onAffidavitChange,
  onSubmit,
  submitting,
  submissionSuccess,
  onReturnToQueue,
}: DigitalSignModalProps) {
  // 0ms Esc key dismissal (Gate G21)
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="sign-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-ink/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="rounded-[var(--r-2xl)] bg-surface-raised border border-border p-2 shadow-2xl max-w-lg w-full"
      >
        <div className="rounded-[calc(var(--r-2xl)-0.5rem)] bg-surface border border-border/40 p-6 sm:p-8 space-y-6">
          {submissionSuccess ? (
            <div className="text-center space-y-5 py-4">
              <div className="w-16 h-16 rounded-full bg-court-emerald/10 border-2 border-court-emerald/40 text-court-emerald flex items-center justify-center mx-auto text-2xl font-bold">
                ✓
              </div>
              <div className="space-y-2">
                <h3 id="sign-modal-title" className="text-xl font-bold text-brand-ink font-display">
                  Translation Affirmed &amp; Signed!
                </h3>
                <p className="text-xs text-text-muted leading-relaxed">
                  Your digital wet-ink seal and sworn affidavit statement have been attached to order{" "}
                  <span className="font-mono font-bold text-brand-ink">{publicCode}</span>.
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={onReturnToQueue}
                  className="min-h-[44px] px-6 py-2.5 rounded-xl bg-brand-ink hover:bg-brand-900 text-white font-semibold text-xs transition-all cursor-pointer active:scale-[0.98] touch-manipulation"
                >
                  Return to Admin Queue
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <PenTool className="w-5 h-5 text-signal-accent" />
                  <h3 id="sign-modal-title" className="text-base font-bold text-brand-ink font-display">
                    Affix Sworn Digital Signature &amp; Jurat
                  </h3>
                </div>
                <button
                  onClick={onClose}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-surface-raised text-text-muted hover:text-brand-ink transition-colors cursor-pointer active:scale-[0.98] touch-manipulation"
                  aria-label="Close dialog"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={onSubmit} className="space-y-4 text-xs">
                {/* 8 CFR Statement Box */}
                <div className="p-3.5 rounded-xl bg-surface-raised border border-border text-brand-ink space-y-1.5 shadow-2xs">
                  <p className="font-bold text-[11px] flex items-center gap-1.5 text-signal-accent">
                    <ShieldCheck className="w-3.5 h-3.5 text-court-emerald" />
                    <span>8 CFR § 204.2(a)(1)(iii)(B) Sworn Statement</span>
                  </p>
                  <p className="text-[11px] text-text-muted font-serif italic leading-relaxed">
                    &quot;I certify that I am competent to translate from {sourceLang} into {targetLang}, and that the translation of {publicCode} is true, accurate, and complete to the best of my abilities.&quot;
                  </p>
                </div>

                {/* Signature input */}
                <div className="space-y-1.5">
                  <label className="font-mono text-text-subtle uppercase text-[10px] font-bold block">
                    Digital Wet-Ink Signature (Type Full Legal Name)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Elena Volkova, ATA Member 271892"
                    value={signatureData}
                    onChange={(e) => onSignatureChange(e.target.value)}
                    required
                    className="min-h-[44px] w-full px-3.5 py-2 text-xs rounded-xl bg-surface-raised border border-border text-brand-ink font-serif focus:outline-hidden focus:ring-2 focus:ring-brand-500 transition-all"
                  />
                  {signatureData.trim() && (
                    <div className="p-2.5 rounded-lg bg-surface-raised border border-border/80 text-center">
                      <span className="font-serif italic text-base text-brand-ink font-bold">
                        {signatureData}
                      </span>
                    </div>
                  )}
                </div>

                {/* Perjury Checkbox */}
                <label className="min-h-[44px] flex items-start gap-2.5 pt-1 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={affidavitConfirmed}
                    onChange={(e) => onAffidavitChange(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-border text-brand-ink focus:ring-brand-500"
                  />
                  <span className="text-[11px] leading-relaxed text-brand-ink">
                    I solemnly swear under penalty of perjury under the laws of the United States of America that this translation is complete, authentic, and accurately transcribed.
                  </span>
                </label>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
                  <button
                    type="button"
                    onClick={onClose}
                    className="min-h-[44px] px-4 py-2 rounded-xl bg-surface-raised border border-border text-text-muted hover:text-brand-ink text-xs font-semibold transition-all cursor-pointer active:scale-[0.98] touch-manipulation"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !affidavitConfirmed || !signatureData.trim()}
                    className="min-h-[44px] inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-brand-ink hover:bg-brand-900 disabled:opacity-50 text-white font-semibold text-xs shadow-xs transition-all cursor-pointer active:scale-[0.97] touch-manipulation"
                  >
                    <CheckCircle2 className="w-4 h-4 text-court-emerald" />
                    <span>{submitting ? "Signing..." : "Affix Seal & Submit"}</span>
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
