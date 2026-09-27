"use client";

import React from "react";
import { Check, ShieldCheck, Zap } from "lucide-react";
import Link from "next/link";
import { motion } from "motion/react";

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
      "ATA Corporate Member seal #278190",
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
    <section className="w-full bg-slate-50 py-24 px-6 border-t border-slate-200">
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        
        {/* Section Header */}
        <div className="text-center mb-16 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-200 bg-blue-50 text-blue-800 text-xs font-mono font-bold tracking-wider">
            <Zap className="w-3.5 h-3.5 text-blue-600" />
            <span>TRANSPARENT US-LEGAL PRICING</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
            Certified legal translations from $0.24 / page.
          </h2>
          <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
            Zero subscription lock-in. Zero surprise rush fees. All packages include statutory ATA certification and 100% money-back USCIS acceptance guarantee.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full items-stretch">
          {PLANS.map((plan) => (
            <motion.div
              key={plan.id}
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 350, damping: 26 }}
              className={`rounded-2xl p-8 border flex flex-col justify-between relative transition-shadow ${
                plan.popular
                  ? "bg-white border-blue-500 shadow-xl ring-2 ring-blue-500/20 md:-translate-y-3"
                  : "bg-white border-slate-200 shadow-sm"
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
                  Most Popular
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-slate-100 text-slate-700">
                    {plan.pages}
                  </span>
                </div>

                <div className="flex items-baseline gap-1.5 mb-2">
                  <span className="text-4xl font-extrabold text-slate-900">{plan.price}</span>
                  <span className="text-slate-500 text-sm font-medium">{plan.period}</span>
                </div>

                <div className="text-xs font-mono font-semibold text-blue-600 mb-6">
                  {plan.unitPrice}
                </div>

                <p className="text-sm text-slate-600 mb-8 pb-6 border-b border-slate-100 leading-relaxed">
                  {plan.description}
                </p>

                <ul className="space-y-3.5 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
                      <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <span className="leading-snug">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link href={`/order/triage?plan=${plan.id}`}>
                <button
                  className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all cursor-pointer shadow-sm ${
                    plan.popular
                      ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20"
                      : "bg-slate-900 hover:bg-slate-800 text-white"
                  }`}
                >
                  {plan.cta}
                </button>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Security & Money Back Reassurance */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-xs font-mono text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>100% USCIS Acceptance Money-Back Guarantee</span>
          </div>
          <span className="hidden sm:inline text-slate-300">|</span>
          <div className="flex items-center gap-2">
            <span>🔒 Stripe 256-Bit Encrypted Checkout</span>
          </div>
          <span className="hidden sm:inline text-slate-300">|</span>
          <div className="flex items-center gap-2">
            <span>📄 Official ATA Corporate Seal #278190</span>
          </div>
        </div>

      </div>
    </section>
  );
}
