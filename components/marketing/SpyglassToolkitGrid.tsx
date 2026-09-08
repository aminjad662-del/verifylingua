"use client";

import * as React from "react";
import {
  ShieldCheck,
  Stamp,
  QrCode,
  Clock,
  Check,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ToolkitCard {
  id: string;
  icon: React.ElementType;
  title: string;
  description: string;
  tags: string[];
}

const TOOLKIT_CARDS: ToolkitCard[] = [
  {
    id: "tool-1",
    icon: ShieldCheck,
    title: "USCIS 8 CFR Compliance Matrix",
    description:
      "Automated and expert legal checks verifying that every translation fulfills federal immigration criteria prior to dispatch, including sworn competency declarations and exact layout preservation.",
    tags: ["8 CFR § 204.2 Mandate", "Passport Name-Locking", "100% Acceptance Guarantee"],
  },
  {
    id: "tool-2",
    icon: Clock,
    title: "12-Hour Rush & Digital Notarization",
    description:
      "Official state-licensed electronic notarization with wet-ink fidelity and urgent dispatch for tight court deadlines, asylum hearings, and scheduled consular visa interviews.",
    tags: ["Under 12h SLA", "State of Delaware Notary", "FedEx Priority Mail Available"],
  },
  {
    id: "tool-3",
    icon: Stamp,
    title: "ATA-Certified Sworn Translators",
    description:
      "Sworn competence declarations on corporate letterhead with dual-human peer review across 85+ language pairs. Every seal, stamp, and margin notation is faithfully transcribed.",
    tags: ["ATA Member Credentialed", "Dual-Human Review", "Standardized [Seal:] Brackets"],
  },
  {
    id: "tool-4",
    icon: QrCode,
    title: "Cryptographic Chain-of-Custody & QR",
    description:
      "Tamper-proof digital custody allows embassies, consular officers, and university evaluators to authenticate dossiers instantly via a secure public verification portal.",
    tags: ["SHA-256 Immutable Hash", "Live 24/7 Adjudicator Node", "< 50ms Edge Global Speed"],
  },
];

export function SpyglassToolkitGrid() {
  return (
    <section className="relative py-24 sm:py-32 bg-canvas border-b border-border/40">
      <div className="max-w-7xl mx-auto px-6 space-y-16">
        {/* Section Header matching 'One tool. every motion.' */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-brand-ink font-display leading-[1.08]">
            One platform. <br className="hidden sm:inline" />
            <span className="font-serif italic font-normal text-brand-900">
              every legal motion.
            </span>
          </h2>

          <p className="text-sm sm:text-base text-text-muted leading-relaxed">
            Built for immigration law practices, corporate counsel, and individual filers who cannot afford a mistake.
          </p>
        </div>

        {/* 2x2 Grid with Clean Cards & Black Circular Badges matching Spyglass reference */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          {TOOLKIT_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                className="p-8 sm:p-10 rounded-2xl bg-surface border border-border/80 shadow-sm space-y-6 flex flex-col justify-between hover:border-brand-500/50 hover:shadow-md transition-all duration-300 group"
              >
                <div className="space-y-4">
                  {/* Black Circular Badge with White Icon matching Spyglass reference */}
                  <div className="w-10 h-10 rounded-full bg-brand-ink text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-200">
                    <Icon className="w-5 h-5 text-white" />
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-brand-ink font-display group-hover:text-brand-500 transition-colors">
                    {card.title}
                  </h3>

                  <p className="text-sm sm:text-base text-text-muted leading-relaxed">
                    {card.description}
                  </p>
                </div>

                {/* Capability Tags */}
                <div className="pt-4 border-t border-border/60 flex flex-wrap gap-2">
                  {card.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-surface-raised border border-border text-brand-ink"
                    >
                      <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>{tag}</span>
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
