"use client";

import React from "react";
import { Check, ShieldCheck, Zap, Lock, FileText, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "motion/react";
import { springConfig } from "@/lib/motion";

const PLANS = [
  {
    name: "Small Pack",
    id: "pack_small",
    price: "$9.99",
    period: "one-time",
    pages: "25 Pages",
    unitPrice: "$0.40 / page",
    description: "Ideal for individual immigration filings, birth certificates, and academic diplomas.",
    popular: false,
    cta: "Start with 25 Pages",
    features: [
      "25 Certified translation pages",
      "USCIS 8 CFR § 103.2 certification affidavit",
      "ATA Corporate Member seal ID 278190",
      "Sub-pixel layout & table preservation",
      "Public QR code verification portal",
      "Permanent encrypted vault access"
    ]
  },
  {
    name: "Standard Pack",
    id: "pack_large",
    price: "$29.99",
    period: "one-time",
    pages: "100 Pages",
    unitPrice: "$0.30 / page",
    description: "Best for comprehensive petitions (I-130, I-485, green card packets, adoption dossiers).",
    popular: true,
    cta: "Get 100 Pages (Save 25%)",
    features: [
      "100 Certified translation pages",
      "Priority 90-second neural synthesis",
      "USCIS 8 CFR § 103.2 & court admissibility",
      "Notary jurat & ATA corporate stamp",
      "Zero-data-retention security mode",
      "Instant batch multi-page download",
      "Free 30-day revision guarantee"
    ]
  },
  {
    name: "Agency Monthly",
    id: "agency_monthly",
    price: "$119.00",
    period: "/month",
    pages: "500 Pages / mo",
    unitPrice: "$0.24 / page",
    description: "Engineered for immigration law firms, multinational HR, and translation agencies.",
    popular: false,
    cta: "Deploy Firm Workspace",
    features: [
      "500 Certified pages every month",
      "Multi-seat team workspace with RBAC",
      "Custom law firm letterhead & logo seals",
      "Direct API & webhook access",
      "Dedicated legal compliance manager",
      "Unused credits roll over automatically"
    ]
  }
];

export function PricingSection() {
  return (
    <section className="w-full bg-obsidian-950 py-24 sm:py-28 px-4 sm:px-6 border-t border-white/[0.08] text-white relative overflow-hidden">
      {/* Background Architectural Grid */}
      <div 
        className="absolute inset-0 opacity-[0.2] pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "32px 32px"
        }}
      />

      <div className="max-w-7xl mx-auto flex flex-col items-center relative z-10 text-left">
        
        {/* Section Header */}
        <div className="text-center mb-16 max-w-3xl space-y-3.5 mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 text-amber-300 text-xs font-mono font-semibold tracking-wider">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>TRANSPARENT US-LEGAL PRICING</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-[-0.03em] text-white leading-tight font-display">
            Certified legal translations from $0.24 / page.
          </h2>
          <p className="text-base sm:text-lg text-neutral-300 font-normal leading-relaxed">
            Zero subscription lock-in. Zero surprise rush fees. All packages include statutory ATA certification and 100% money-back USCIS acceptance guarantee.
          </p>
        </div>

        {/* Pricing Cards Grid (Double-Bezel Architecture) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-7 w-full items-stretch">
          {PLANS.map((plan) => (
            <motion.div
              key={plan.id}
              whileHover={{ y: -4 }}
              transition={springConfig}
              className={`rounded-2xl p-1.5 transition-all relative ${
                plan.popular
                  ? "bg-amber-500/15 border border-amber-500/40 shadow-xl ring-1 ring-amber-500/20 md:-translate-y-2"
                  : "bg-obsidian-900 border border-white/[0.08] shadow-2xs"
              }`}
            >
              <div className="rounded-xl p-6 sm:p-8 bg-obsidian-900/90 border border-white/[0.06] flex flex-col justify-between h-full relative">
                
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-obsidian-850 text-amber-300 border border-amber-500/40 px-3.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider shadow-sm">
                    Most Popular
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white font-display">{plan.name}</h3>
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-white/5 text-neutral-300 border border-white/10">
                      {plan.pages}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-1.5 mb-1.5">
                    <span className="text-4xl font-extrabold text-white tracking-tight">{plan.price}</span>
                    <span className="text-neutral-400 text-sm font-medium">{plan.period}</span>
                  </div>

                  <div className="text-xs font-mono font-bold text-amber-400 mb-6">
                    {plan.unitPrice}
                  </div>

                  <p className="text-sm text-neutral-300 mb-6 pb-6 border-b border-white/[0.08] leading-relaxed">
                    {plan.description}
                  </p>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-neutral-300">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="leading-snug">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link href={`/order/triage?plan=${plan.id}`}>
                  <button
                    className={`w-full py-3.5 rounded-full font-semibold text-xs sm:text-sm transition-all cursor-pointer shadow-xs active:scale-[0.98] flex items-center justify-center gap-2 group ${
                      plan.popular
                        ? "bg-white hover:bg-neutral-100 text-obsidian-950 font-bold"
                        : "bg-white/10 hover:bg-white/15 text-white border border-white/10"
                    }`}
                  >
                    <span>{plan.cta}</span>
                    <ArrowRight className="w-3.5 h-3.5 opacity-70 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Security & Money Back Reassurance */}
        <div className="mt-14 flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs font-mono text-neutral-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>100% USCIS Acceptance Money-Back Guarantee</span>
          </div>
          <span className="hidden sm:inline text-neutral-700">|</span>
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-neutral-400" />
            <span>Stripe 256-Bit Encrypted Checkout</span>
          </div>
          <span className="hidden sm:inline text-neutral-700">|</span>
          <div className="flex items-center gap-2">
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            <span>Official ATA Corporate Seal ID 278190</span>
          </div>
        </div>

      </div>
    </section>
  );
}
