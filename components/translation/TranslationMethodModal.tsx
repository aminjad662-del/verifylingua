"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Lock,
  Clock,
  FileCheck2,
  Scale,
  Zap,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { safeNavigate } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export interface TranslationMethodModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  options?: {
    preselectedMethod?: "automated" | "certified";
    targetQuery?: Record<string, string | number | boolean>;
  };
}

export function TranslationMethodModal({
  open,
  onOpenChange,
  options,
}: TranslationMethodModalProps) {
  const router = useRouter();

  const handleSelectAutomated = React.useCallback(() => {
    onOpenChange(false);
    let target = "/app/new-translation";
    if (options?.targetQuery && Object.keys(options.targetQuery).length > 0) {
      const searchParams = new URLSearchParams();
      Object.entries(options.targetQuery).forEach(([k, v]) => {
        searchParams.set(k, String(v));
      });
      target = `${target}?${searchParams.toString()}`;
    }
    safeNavigate(router, target);
  }, [onOpenChange, options, router]);

  const handleSelectCertified = React.useCallback(() => {
    onOpenChange(false);
    let target = "/translate";
    const searchParams = new URLSearchParams();
    searchParams.set("tier", "certified");
    if (options?.targetQuery && Object.keys(options.targetQuery).length > 0) {
      Object.entries(options.targetQuery).forEach(([k, v]) => {
        searchParams.set(k, String(v));
      });
    }
    target = `${target}?${searchParams.toString()}`;
    safeNavigate(router, target);
  }, [onOpenChange, options, router]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-[95vw] max-w-2xl sm:max-w-3xl p-6 sm:p-8 bg-surface-raised border border-border shadow-2xl rounded-2xl sm:rounded-3xl overflow-hidden"
        aria-describedby="translation-method-description"
      >
        <DialogHeader className="space-y-2 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-surface text-text-muted text-[11px] font-mono uppercase tracking-wider w-fit">
            <span className="w-2 h-2 rounded-full bg-brand-500" />
            <span>Workflow Selector</span>
          </div>
          <DialogTitle className="text-2xl sm:text-3xl font-black tracking-tight text-brand-ink font-display">
            Select Translation Method
          </DialogTitle>
          <DialogDescription
            id="translation-method-description"
            className="text-xs sm:text-sm text-text-muted leading-relaxed"
          >
            Choose between instant neural layout reconstruction or sworn certified translation for statutory government filings.
          </DialogDescription>
        </DialogHeader>

        {/* Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 pt-2">
          
          {/* 1. Automated Layout Mode */}
          <div
            role="button"
            tabIndex={0}
            onClick={handleSelectAutomated}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleSelectAutomated();
              }
            }}
            className="group flex flex-col justify-between p-5 sm:p-6 rounded-2xl border border-border hover:border-brand-500/60 bg-surface hover:bg-surface-raised transition-all duration-150 cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-600 flex items-center justify-center border border-brand-500/20">
                  <Sparkles className="w-5 h-5 text-brand-600" />
                </div>
                <span className="px-2.5 py-1 rounded-md bg-brand-500/10 text-brand-600 border border-brand-500/20 font-mono text-[10px] font-bold uppercase tracking-wider">
                  Instant AI • 1:1 Layout
                </span>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-bold text-brand-ink group-hover:text-brand-600 transition-colors">
                  Automated Layout Mode
                </h3>
                <p className="text-xs text-text-muted mt-1 leading-relaxed">
                  Autonomous spatial extraction and coordinate typesetting. Preserves original tables, typography, and structure.
                </p>
              </div>

              {/* Feature Checklist */}
              <div className="space-y-2 pt-1 border-t border-border/60">
                <div className="flex items-start gap-2 text-xs text-text-muted">
                  <CheckCircle2 className="w-3.5 h-3.5 text-status-success shrink-0 mt-0.5" />
                  <span>1:1 format and spatial coordinate preservation</span>
                </div>
                <div className="flex items-start gap-2 text-xs text-text-muted">
                  <CheckCircle2 className="w-3.5 h-3.5 text-status-success shrink-0 mt-0.5" />
                  <span>Instant turnaround in under 30 seconds</span>
                </div>
                <div className="flex items-start gap-2 text-xs text-text-muted">
                  <CheckCircle2 className="w-3.5 h-3.5 text-status-success shrink-0 mt-0.5" />
                  <span>DeepL & neural multi-agent document pipeline</span>
                </div>
                <div className="flex items-start gap-2 text-xs text-text-muted">
                  <CheckCircle2 className="w-3.5 h-3.5 text-status-success shrink-0 mt-0.5" />
                  <span>Ideal for corporate drafts and internal evaluation</span>
                </div>
              </div>
            </div>

            <div className="pt-5 mt-4 border-t border-border/80 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-[11px] text-text-muted">Pricing Tier</span>
                <span className="font-mono text-xs font-bold text-brand-600">Included in Quota</span>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectAutomated();
                }}
                className="w-full h-11 px-4 rounded-xl border border-border bg-surface-raised group-hover:bg-brand-500/10 group-hover:border-brand-500/40 text-brand-ink group-hover:text-brand-600 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
              >
                <span>Start Automated Translation</span>
                <ArrowRight className="w-4 h-4 text-brand-600 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

          {/* 2. Certified Legal Mode */}
          <div
            role="button"
            tabIndex={0}
            onClick={handleSelectCertified}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleSelectCertified();
              }
            }}
            className="group flex flex-col justify-between p-5 sm:p-6 rounded-2xl border-2 border-brand-500 bg-surface hover:bg-surface-raised shadow-xs transition-all duration-150 cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 relative"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-court-emerald/15 text-court-emerald flex items-center justify-center border border-court-emerald/25">
                  <ShieldCheck className="w-5 h-5 text-court-emerald" />
                </div>
                <span className="px-2.5 py-1 rounded-md bg-court-emerald/15 text-court-emerald border border-court-emerald/25 font-mono text-[10px] font-bold uppercase tracking-wider">
                  USCIS 8 CFR § 103.2
                </span>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-bold text-brand-ink group-hover:text-brand-500 transition-colors">
                  Certified Legal Mode
                </h3>
                <p className="text-xs text-text-muted mt-1 leading-relaxed">
                  Sworn competence affidavit, accredited ATA linguist verification, and cryptographic QR seal for immigration courts.
                </p>
              </div>

              {/* Feature Checklist */}
              <div className="space-y-2 pt-1 border-t border-border/60">
                <div className="flex items-start gap-2 text-xs text-text-muted">
                  <CheckCircle2 className="w-3.5 h-3.5 text-status-success shrink-0 mt-0.5" />
                  <span>Sworn translator competence affidavit for USCIS & Courts</span>
                </div>
                <div className="flex items-start gap-2 text-xs text-text-muted">
                  <CheckCircle2 className="w-3.5 h-3.5 text-status-success shrink-0 mt-0.5" />
                  <span>Deterministic turnaround with delivery under 24 hours</span>
                </div>
                <div className="flex items-start gap-2 text-xs text-text-muted">
                  <CheckCircle2 className="w-3.5 h-3.5 text-status-success shrink-0 mt-0.5" />
                  <span>Tamper-evident SHA-256 cryptographic QR verification</span>
                </div>
                <div className="flex items-start gap-2 text-xs text-text-muted">
                  <CheckCircle2 className="w-3.5 h-3.5 text-status-success shrink-0 mt-0.5" />
                  <span>USCIS Acceptance Warranty with supplemental defense packet</span>
                </div>
              </div>
            </div>

            <div className="pt-5 mt-4 border-t border-border/80 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-[11px] text-text-muted">Statutory Rate</span>
                <span className="font-mono text-xs font-bold text-signal-accent">$24.95 / page</span>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectCertified();
                }}
                className="w-full h-11 px-4 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs active:scale-[0.98] transition-all"
              >
                <span>Start Certified Legal Order</span>
                <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

        </div>

        {/* Security & Statutory Notice */}
        <div className="mt-3 pt-3 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-text-muted font-sans">
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-text-subtle shrink-0" />
            <span>FIPS 140-2 Encrypted Private Vault • Ephemeral Zero-Retention Storage</span>
          </div>
          <span className="font-mono text-[10px] text-text-subtle">ATA Member No. 278190</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
