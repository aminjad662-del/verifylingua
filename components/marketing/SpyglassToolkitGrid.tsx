"use client";

import * as React from "react";
import {
  ShieldCheck,
  Stamp,
  QrCode,
  Clock,
  CheckCircle2,
  Lock,
  FileCheck,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ToolkitCard {
  id: string;
  icon: React.ElementType;
  title: string;
  description: string;
  rows: { label: string; value: string; status?: "success" | "neutral" }[];
}

const TOOLKIT_CARDS: ToolkitCard[] = [
  {
    id: "tool-1",
    icon: ShieldCheck,
    title: "USCIS 8 CFR Compliance Matrix",
    description:
      "Automated and expert legal checks verifying that every translation fulfills federal immigration criteria prior to dispatch.",
    rows: [
      { label: "Sworn Translator Statement", value: "8 CFR § 204.2 Mandate", status: "success" },
      { label: "Passport Name-Locking", value: "Strict Matching", status: "success" },
      { label: "Raised Seal Marginalia", value: "100% Complete Transcription", status: "success" },
      { label: "Acceptance Guarantee", value: "100% Money-Back", status: "success" },
    ],
  },
  {
    id: "tool-2",
    icon: Stamp,
    title: "300+ DPI Seal & Hologram Engine",
    description:
      "Advanced optical extraction ensures faint notary seals, consular stamps, and embossed watermarks are fully transcribed.",
    rows: [
      { label: "Multi-Angle OCR Scanning", value: "Active", status: "success" },
      { label: "Faint Embossed Seals", value: "Transcribed in [Seal:]", status: "success" },
      { label: "Notarial Ribbons & Apostilles", value: "Annotated", status: "neutral" },
      { label: "Biometric Barcode Integrity", value: "Preserved 1:1", status: "success" },
    ],
  },
  {
    id: "tool-3",
    icon: QrCode,
    title: "Real-Time Consular Ledger & QR",
    description:
      "Tamper-proof digital custody allows embassies, consular officers, and university evaluators to authenticate the digital original instantly.",
    rows: [
      { label: "SHA-256 Digest", value: "Immutable Ledger", status: "success" },
      { label: "Public Officer Portal", value: "Live 24/7/365", status: "success" },
      { label: "Adjudicator Audit Log", value: "Timestamped", status: "neutral" },
      { label: "Global Edge CDN", value: "< 50ms Worldwide", status: "success" },
    ],
  },
  {
    id: "tool-4",
    icon: Clock,
    title: "Rush Express 24-Hour Dispatch",
    description:
      "Rigorous SLA monitoring ensures urgent court hearings, visa interviews, and filing deadlines are met with zero compromise.",
    rows: [
      { label: "Standard Turnaround", value: "24-48 Hours", status: "neutral" },
      { label: "Rush Expedited Service", value: "Under 12 Hours", status: "success" },
      { label: "Deliverable Formats", value: "Digital PDF + Wet-Ink Mail", status: "neutral" },
      { label: "Senior Review Pipeline", value: "Dual ATA Peer Review", status: "success" },
    ],
  },
];

export function SpyglassToolkitGrid() {
  return (
    <section className="relative py-24 sm:py-32 bg-surface border-b border-border/40">
      <div className="max-w-7xl mx-auto px-6 space-y-16">
        {/* Section Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-border bg-surface-raised text-brand-ink text-xs font-mono font-bold uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5 text-brand-500" />
            <span>Infrastructure & Compliance</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-brand-ink font-display">
            Plus the rest of the toolkit
          </h2>

          <p className="text-base sm:text-lg text-text-muted leading-relaxed">
            Enterprise-grade infrastructure designed specifically for cross-border legal compliance and court admissibility.
          </p>
        </div>

        {/* 2x2 Grid with Micro-Tables matching Spyglass reference */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {TOOLKIT_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                className="p-7 sm:p-8 rounded-2xl bg-surface-raised border border-border shadow-sm space-y-6 flex flex-col justify-between hover:border-brand-300 transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 text-brand-500">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold text-brand-ink font-display">
                      {card.title}
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                    {card.description}
                  </p>
                </div>

                {/* Micro-Table */}
                <div className="border border-border/80 rounded-xl overflow-hidden text-xs font-mono bg-surface">
                  {card.rows.map((row, idx) => (
                    <div
                      key={row.label}
                      className={cn(
                        "flex items-center justify-between px-3.5 py-2.5",
                        idx !== card.rows.length - 1 && "border-b border-border/60"
                      )}
                    >
                      <span className="text-text-muted font-medium">{row.label}</span>
                      <div className="flex items-center gap-1.5 font-bold">
                        {row.status === "success" && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        )}
                        <span
                          className={cn(
                            row.status === "success"
                              ? "text-emerald-700"
                              : "text-brand-ink"
                          )}
                        >
                          {row.value}
                        </span>
                      </div>
                    </div>
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
