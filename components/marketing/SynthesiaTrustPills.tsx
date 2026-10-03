"use client";

import React from "react";
import { Lock, ShieldCheck, FileCheck, Award, Sparkles } from "lucide-react";

const PILL_ITEMS = [
  {
    icon: Lock,
    title: "Zero-Model Training",
    subtitle: "Your civil documents & passports are never retained for training",
  },
  {
    icon: ShieldCheck,
    title: "256-Bit TLS Vault",
    subtitle: "End-to-end cryptographic transit with ephemeral storage",
  },
  {
    icon: FileCheck,
    title: "8 CFR § 103.2 Compliant",
    subtitle: "Sworn competence affidavit guaranteed for federal filings",
  },
  {
    icon: Award,
    title: "ATA Member No. 278190",
    subtitle: "American Translators Association corporate sealed credentials",
  },
];

export function SynthesiaTrustPills() {
  return (
    <section className="py-16 sm:py-20 bg-canvas border-t border-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-text font-display">
            Built on the foundations of legal precision and security
          </h3>
          <p className="text-sm sm:text-base text-text-muted">
            Institutional guarantees enforced across every certified document.
          </p>
        </div>

        {/* 4 Horizontal Pills (Matches Screenshot Pill Ribbon) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PILL_ITEMS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-surface border border-border/80 shadow-xs hover:border-brand-300 hover:shadow-sm transition-all flex items-start gap-3.5 group cursor-default"
              >
                <div className="w-10 h-10 rounded-lg bg-brand-50 border border-brand-200/80 flex items-center justify-center text-brand-600 shrink-0 group-hover:scale-105 transition-transform">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-xs sm:text-sm font-bold text-text block">
                    {item.title}
                  </span>
                  <span className="text-[11px] text-text-muted leading-relaxed block">
                    {item.subtitle}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
