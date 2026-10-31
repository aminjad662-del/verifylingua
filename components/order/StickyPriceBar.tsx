"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { PricingBreakdown } from "@/lib/pricing";
import { ShieldCheck, Clock, ArrowRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface StickyPriceBarProps {
  pricing: PricingBreakdown;
  onNext?: () => void;
  nextLabel?: string;
  disabled?: boolean;
  blockReason?: string;
  /** Force yielding from parent context (e.g., when a drawer/modal is open) */
  forceYield?: boolean;
}

export function StickyPriceBar({
  pricing,
  onNext,
  nextLabel = "Continue to Checkout",
  disabled = false,
  blockReason,
  forceYield = false,
}: StickyPriceBarProps) {
  const [isColliding, setIsColliding] = React.useState(false);

  // Rule 10: Auto-hide / yield when scrolling over primary purchase buttons, checkout drawers, and FAQ accordions
  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const targets = document.querySelectorAll(
      'footer, [data-collision-yield="true"], [data-primary-action="true"], [role="dialog"], [data-faq-accordion="true"]'
    );

    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // If any yield target enters the bottom 120px zone, yield immediately
        const colliding = entries.some((entry) => entry.isIntersecting);
        setIsColliding(colliding);
      },
      {
        root: null,
        rootMargin: "0px 0px -60px 0px",
        threshold: 0.05,
      }
    );

    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, []);

  const shouldYield = isColliding || forceYield;

  return (
    <>
      {/* ─── Desktop Sticky Rail (Right Column) ────────────────────── */}
      <aside
        aria-label="Order Estimate Rail"
        className="hidden lg:block w-80 shrink-0 sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto"
      >
        <div className="card-doppelrand-raised rounded-[var(--r-xl)] bg-surface-raised p-6 shadow-md space-y-6">
          {/* Header */}
          <div className="space-y-1.5 pb-2 border-b border-border/60">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cta inline-block animate-pulse" />
              <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-cta">
                Live Order Docket
              </span>
            </div>
            <h3 className="text-xl font-bold text-ink tracking-tight font-heading">
              Order Summary
            </h3>
          </div>

          {/* Itemized Line Items */}
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-ink-muted">
                {pricing.serviceType === "CERTIFIED" ? "USCIS Certified Base" : "Standard Translation"}
                <span className="text-xs text-ink-muted/80 block">
                  ({pricing.pageCount} {pricing.pageCount === 1 ? "page" : "pages"})
                </span>
              </span>
              <span className="font-mono font-semibold tabular-nums text-ink">
                {formatCurrency(pricing.basePrice)}
              </span>
            </div>

            {pricing.isExpedited && (
              <div className="flex items-center justify-between text-xs pt-1 border-t border-border/40">
                <span className="text-ink-muted">Expedited 12h Priority (+60%)</span>
                <span className="font-mono font-semibold tabular-nums text-ink">
                  +{formatCurrency(pricing.expeditedFee)}
                </span>
              </div>
            )}

            {pricing.needsNotarization && (
              <div className="flex items-center justify-between text-xs pt-1 border-t border-border/40">
                <span className="text-ink-muted">Notarial Attestation Seal</span>
                <span className="font-mono font-semibold tabular-nums text-ink">
                  +{formatCurrency(pricing.notarizationFee)}
                </span>
              </div>
            )}

            {pricing.needsHardCopy && (
              <div className="flex items-center justify-between text-xs pt-1 border-t border-border/40">
                <span className="text-ink-muted">USPS Priority Hard Copy</span>
                <span className="font-mono font-semibold tabular-nums text-ink">
                  +{formatCurrency(pricing.hardCopyFee)}
                </span>
              </div>
            )}

            {pricing.needsApostille && (
              <div className="flex items-center justify-between text-xs pt-1 border-t border-border/40">
                <span className="text-ink-muted">Apostille Legal Authentication</span>
                <span className="font-mono font-semibold tabular-nums text-ink">
                  +{formatCurrency(pricing.apostilleFee)}
                </span>
              </div>
            )}
          </div>

          {/* Guaranteed Promised Delivery Time (Honest Logistics) */}
          <div className="p-4 rounded-xl bg-surface-warm border border-border-subtle space-y-1.5">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-cta uppercase tracking-wide">
              <Clock className="w-3.5 h-3.5 text-cta shrink-0" />
              <span>Promised Delivery Date</span>
            </div>
            <p suppressHydrationWarning className="text-sm font-bold text-ink font-mono tabular-nums">
              {pricing.promisedAtFormatted}
            </p>
            <p className="text-[11px] text-ink-muted leading-tight">
              Calculated via deterministic 2x daily notary batching window.
            </p>
          </div>

          {/* Running Total & Action */}
          <div className="space-y-4 pt-2 border-t border-border/60">
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-semibold text-ink-muted">Total Due</span>
              <span className="text-2xl font-bold text-ink font-mono tabular-nums tracking-tight">
                {formatCurrency(pricing.total)}
              </span>
            </div>

            {blockReason && (
              <div className="text-xs text-status-danger font-medium bg-status-danger-bg p-3 rounded-xl border border-status-danger/20 flex items-center gap-2">
                <span>⚠️</span>
                <span>{blockReason}</span>
              </div>
            )}

            {onNext && (
              <Button
                variant="cta"
                size="default"
                onClick={onNext}
                disabled={disabled}
                trailingIcon={<ArrowRight className="w-4 h-4" />}
                className="w-full h-12 rounded-full text-sm font-bold min-h-[44px]"
              >
                {nextLabel}
              </Button>
            )}

            <div className="text-center pt-1">
              <span className="text-[11px] text-court-emerald font-semibold flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-court-emerald shrink-0" />
                <span>USCIS Acceptance Warranty Under 8 CFR § 103.2</span>
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* ─── Mobile Sticky Bottom Bar (Rule 10 Yielding Sensor) ───────── */}
      <div
        role="region"
        aria-label="Mobile Order Summary Bar"
        className={`lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface-raised/95 backdrop-blur-xl border-t border-border px-4 py-3 shadow-lg transition-[transform,opacity] duration-220 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          shouldYield ? "translate-y-[115%] opacity-0 pointer-events-none" : "translate-y-0 opacity-100 pointer-events-auto"
        }`}
      >
        <div className="flex items-center justify-between gap-4 max-w-lg mx-auto">
          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-ink-muted">Total:</span>
              <span className="text-lg font-bold text-ink font-mono tabular-nums">
                {formatCurrency(pricing.total)}
              </span>
            </div>
            <p suppressHydrationWarning className="text-[11px] font-sans text-cta font-medium truncate max-w-[180px]">
              Ready {pricing.promisedAtFormatted}
            </p>
          </div>

          {onNext && (
            <Button
              variant="cta"
              size="sm"
              onClick={onNext}
              disabled={disabled}
              trailingIcon={<ArrowRight className="w-3.5 h-3.5" />}
              className="h-11 px-5 rounded-full text-xs font-bold shrink-0 min-h-[44px] min-w-[44px]"
            >
              {nextLabel}
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
