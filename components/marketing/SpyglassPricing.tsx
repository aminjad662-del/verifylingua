"use client";

import * as React from "react";
import Link from "next/link";
import { CheckCircle2, ShieldCheck, Zap, Building2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PricingPlan {
  id: string;
  name: string;
  price: string;
  unit: string;
  tagline: string;
  badge?: string;
  isPopular?: boolean;
  ctaText: string;
  ctaHref: string;
  features: string[];
}

const PLANS: PricingPlan[] = [
  {
    id: "standard",
    name: "Standard Certified",
    price: "$24.95",
    unit: "per page (up to 250 words)",
    tagline: "Ideal for USCIS immigration petitions, visas, and university applications.",
    ctaText: "Order Standard",
    ctaHref: "/order/triage?service=standard",
    features: [
      "Sworn ATA Certification of Competency",
      "Compliant with USCIS 8 CFR § 204.2",
      "100% Guaranteed Acceptance or full refund",
      "24-48 hour standard digital dispatch",
      "Public QR verification ledger integration",
      "1:1 tabular layout and seal transcription",
      "Free revisions within 30 days",
    ],
  },
  {
    id: "rush",
    name: "Rush Certified + Notarized",
    price: "$39.95",
    unit: "per page + flat notary fee",
    tagline: "For urgent filing deadlines, consulate appointments, and court hearings.",
    badge: "Most Requested",
    isPopular: true,
    ctaText: "Order Rush Certified",
    ctaHref: "/order/triage?service=expedited&notarized=true",
    features: [
      "Expedited 12-24 hour rush turnaround",
      "Official state-licensed electronic notarization",
      "Priority translation queue with senior ATA linguist",
      "Wet-ink physical mail dispatch available",
      "Direct priority paralegal support",
      "Tamper-proof digital seal & holographic mark",
      "Emergency same-day weekend support",
    ],
  },
  {
    id: "firm",
    name: "Law Firm Volume",
    price: "$19.95",
    unit: "per page (volume tiered)",
    tagline: "Engineered for immigration law practices, corporate counsel, and universities.",
    ctaText: "Open Firm Account",
    ctaHref: "/register?role=lawfirm",
    features: [
      "Consolidated monthly invoicing (Net 30)",
      "Dedicated senior translation coordinator",
      "Multi-document batch drag-and-drop",
      "Custom law firm cover sheets & co-branding",
      "Secure client portal & team permissions",
      "Direct REST API & Clio / MyCase integrations",
      "Priority SLA agreement with 99.9% on-time",
    ],
  },
];

export function SpyglassPricing() {
  return (
    <section className="relative py-24 sm:py-32 bg-canvas border-b border-border/40">
      <div className="max-w-7xl mx-auto px-6 space-y-16">
        {/* Section Header matching "Simple pricing. Scale as you grow." */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-border bg-surface text-brand-ink text-xs font-mono font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-500" />
            <span>Zero Hidden Fees</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-brand-ink font-display">
            Simple pricing. Scale as you grow.
          </h2>

          <p className="text-base sm:text-lg text-text-muted leading-relaxed">
            Transparent per-page rates with sworn ATA certification, layout preservation, and QR verification included.
          </p>
        </div>

        {/* 3 Pricing Cards Grid matching Spyglass reference */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={cn(
                "relative rounded-3xl p-8 flex flex-col justify-between transition-all duration-300",
                plan.isPopular
                  ? "bg-surface-raised border-2 border-brand-500 shadow-xl scale-[1.02]"
                  : "bg-surface border border-border hover:border-brand-300 shadow-sm"
              )}
            >
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="px-3.5 py-1 rounded-full text-xs font-bold text-white bg-brand-500 shadow-sm">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-brand-ink font-display">
                    {plan.name}
                  </h3>
                  <p className="text-xs text-text-muted mt-1 min-h-[32px]">
                    {plan.tagline}
                  </p>
                </div>

                <div className="pb-6 border-b border-border/70">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl sm:text-5xl font-extrabold text-brand-ink font-display">
                      {plan.price}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-text-muted">
                    {plan.unit}
                  </span>
                </div>

                {/* Features List */}
                <ul className="space-y-3 text-xs sm:text-sm text-brand-ink">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <div className="pt-8 mt-8 border-t border-border/70">
                <Link
                  href={plan.ctaHref}
                  className={cn(
                    "w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl text-sm font-bold transition-all active:scale-95 shadow-sm",
                    plan.isPopular
                      ? "bg-brand-500 hover:bg-brand-600 text-white"
                      : "bg-brand-ink hover:bg-brand-900 text-white"
                  )}
                >
                  <span>{plan.ctaText}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
