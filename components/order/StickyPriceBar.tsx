"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PricingBreakdown } from "@/lib/pricing";
import { ShieldCheck, Clock, ArrowRight, FileCheck, Info } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface StickyPriceBarProps {
  pricing: PricingBreakdown;
  onNext?: () => void;
  nextLabel?: string;
  disabled?: boolean;
  blockReason?: string;
}

export function StickyPriceBar({
  pricing,
  onNext,
  nextLabel = "Continue",
  disabled = false,
  blockReason,
}: StickyPriceBarProps) {
  return (
    <>
      {/* Desktop Sticky Rail (Right Column) */}
      <div className="hidden lg:block w-80 shrink-0 sticky top-24">
        <div className="rounded-[28px] border-2 border-border bg-surface-raised p-6 shadow-xl space-y-6">
          <div className="space-y-1">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-brand-500">
              Live Order Estimate
            </span>
            <h3 className="text-xl font-black text-brand-ink tracking-tight">
              Order Summary
            </h3>
          </div>

          <div className="space-y-3 text-sm border-y border-border py-4">
            <div className="flex items-center justify-between">
              <span className="text-text-muted">
                {pricing.serviceType === "CERTIFIED" ? "Certified Base" : "Standard Base"} ({pricing.pageCount} {pricing.pageCount === 1 ? "page" : "pages"})
              </span>
              <span className="font-mono font-bold text-brand-ink">
                {formatCurrency(pricing.basePrice)}
              </span>
            </div>

            {pricing.isExpedited && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-muted">Expedited 12h (+60%)</span>
                <span className="font-mono font-bold text-brand-ink">
                  +{formatCurrency(pricing.expeditedFee)}
                </span>
              </div>
            )}

            {pricing.needsNotarization && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-muted">Notarization Certificate</span>
                <span className="font-mono font-bold text-brand-ink">
                  +{formatCurrency(pricing.notarizationFee)}
                </span>
              </div>
            )}

            {pricing.needsHardCopy && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-muted">Hard Copy & Postage</span>
                <span className="font-mono font-bold text-brand-ink">
                  +{formatCurrency(pricing.hardCopyFee)}
                </span>
              </div>
            )}

            {pricing.needsApostille && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-muted">Apostille Authentication</span>
                <span className="font-mono font-bold text-brand-ink">
                  +{formatCurrency(pricing.apostilleFee)}
                </span>
              </div>
            )}
          </div>

          {/* Guaranteed Promised Delivery Time (§2.4) */}
          <div className="p-3.5 rounded-2xl bg-lavender-50 border border-border/80 space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-brand-500 uppercase tracking-wide">
              <Clock className="w-3.5 h-3.5" />
              <span>Promised Delivery Date</span>
            </div>
            <p className="text-sm font-black text-brand-ink font-mono">
              {pricing.promisedAtFormatted}
            </p>
            <p className="text-[10px] text-text-muted">
              Factor in 2x/day notary batching & local timezone.
            </p>
          </div>

          {/* Running Total */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-brand-ink">Total Investment</span>
              <span className="text-2xl font-black text-brand-ink font-mono">
                {formatCurrency(pricing.total)}
              </span>
            </div>

            {blockReason && (
              <p className="text-xs text-status-danger font-semibold bg-status-danger/10 p-2.5 rounded-xl border border-status-danger/20">
                ⚠️ {blockReason}
              </p>
            )}

            {onNext && (
              <Button
                size="lg"
                onClick={onNext}
                disabled={disabled}
                className="w-full h-12 rounded-xl text-sm font-bold gap-2 shadow-md"
              >
                {nextLabel}
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}

            <div className="text-center">
              <span className="text-[11px] text-status-success font-semibold flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                100% USCIS Acceptance Guarantee
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom Bar (z-40) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface-raised/95 backdrop-blur-md border-t border-border p-4 shadow-2xl">
        <div className="flex items-center justify-between gap-4 max-w-lg mx-auto">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-text-muted">Total:</span>
              <span className="text-xl font-black text-brand-ink font-mono">
                {formatCurrency(pricing.total)}
              </span>
            </div>
            <p className="text-[11px] font-mono text-brand-500 font-semibold truncate max-w-[170px]">
              Ready {pricing.promisedAtFormatted}
            </p>
          </div>

          {onNext && (
            <Button
              size="default"
              onClick={onNext}
              disabled={disabled}
              className="h-11 px-5 rounded-xl text-sm font-bold gap-1.5 shadow-md shrink-0"
            >
              {nextLabel}
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
