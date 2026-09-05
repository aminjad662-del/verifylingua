"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MagneticButton } from "@/components/ui/magnetic-button";
import {
  UploadCloud,
  FileCheck,
  Award,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
  Stamp,
  Lock,
  QrCode,
  FileSearch,
  Layers,
  Sparkles,
  Clock,
} from "lucide-react";

interface StepDetail {
  id: string;
  stepNumber: string;
  title: string;
  shortDesc: string;
  badge: string;
  uiHeader: string;
  uiStatus: string;
  previewImage: string;
  details: { label: string; value: string; isGood?: boolean }[];
  summary: string;
  microCards: { title: string; description: string; icon: React.ComponentType<{ className?: string }> }[];
}

const STEPS: StepDetail[] = [
  {
    id: "triage",
    stepNumber: "01",
    title: "Instant AI Quality Triage",
    shortDesc: "Pre-payment audit catches blur, fold lines, and cut-off seals before you pay.",
    badge: "Pre-Payment Quality Check",
    uiHeader: "Document Triage & Clarity Engine",
    uiStatus: "Passed • High Legibility",
    previewImage: "/images/step-ai-triage-3d.jpg",
    details: [
      { label: "Resolution & Contrast", value: "300 DPI • Crisp", isGood: true },
      { label: "Seal & Stamp Detection", value: "2 Official Emblems Found", isGood: true },
      { label: "Word Count Audit", value: "218 words (1 Page Rate)", isGood: true },
      { label: "Calculated Price", value: "$24.95 Flat Guaranteed", isGood: true },
    ],
    summary:
      "Our AI audit analyzes your scan in seconds to guarantee it meets strict USCIS image clarity standards before linguists begin.",
    microCards: [
      {
        title: "Embossed Seal Discovery",
        description: "Identifies raised notary stamps and marginal notations so no legal marks are omitted.",
        icon: Stamp,
      },
      {
        title: "300 DPI Contrast & Glare Audit",
        description: "Ensures scan resolution satisfies USCIS electronic filing mandates before payment.",
        icon: FileSearch,
      },
      {
        title: "Guaranteed $24.95 Flat Quote",
        description: "Exact word and page count calculation with zero post-payment cost surprises.",
        icon: Zap,
      },
    ],
  },
  {
    id: "translation",
    stepNumber: "02",
    title: "Human ATA Linguist Translation",
    shortDesc: "Accredited native translators mirror original layout line-by-line.",
    badge: "ATA Member No. 274892",
    uiHeader: "1:1 Mirror Layout Construction",
    uiStatus: "In Progress • Senior Linguist",
    previewImage: "/images/step-human-cert-3d.jpg",
    details: [
      { label: "Name Match Lock", value: "Locked to Passport Data", isGood: true },
      { label: "Marginal Transcriptions", value: "All Stamps Bracketed [SEAL]", isGood: true },
      { label: "Legal Date Standard", value: "Standardized US Format", isGood: true },
      { label: "Turnaround Countdown", value: "Guaranteed within 24h", isGood: true },
    ],
    summary:
      "Every document is translated by an accredited human linguist who maintains strict typographic and structural parity with the source document.",
    microCards: [
      {
        title: "OpenXML & PDF Coordinate Lock",
        description: "Rebuilds translated text inside original cell boundaries, headers, and margins.",
        icon: Layers,
      },
      {
        title: "Passport Name & Date Locking",
        description: "Hard-locks spellings against passport records to eliminate 90-day RFE rejections.",
        icon: Lock,
      },
      {
        title: "Sworn 8 CFR 103.2 Affidavit",
        description: "Accredited ATA competence declaration signed and bound to every certificate.",
        icon: ShieldCheck,
      },
    ],
  },
  {
    id: "verification",
    stepNumber: "03",
    title: "Cryptographic QR Ledger",
    shortDesc: "Tamper-proof SHA-256 digital signature and live public verification URL.",
    badge: "Instant Consular Audit",
    uiHeader: "Certificate Verification Ledger",
    uiStatus: "Verified • Tamper-Proof",
    previewImage: "/images/step-qr-verified-3d.jpg",
    details: [
      { label: "Document Hash", value: "SHA-256: 8f92...a34e", isGood: true },
      { label: "Public Portal URL", value: "/verify/VL-8942-US", isGood: true },
      { label: "USCIS 8 CFR Affidavit", value: "Sworn Statement Bound", isGood: true },
      { label: "Acceptance Guarantee", value: "100% Guaranteed", isGood: true },
    ],
    summary:
      "Immigration officers and court clerks can instantly scan the live QR code on the certificate to confirm validity and translator credentials.",
    microCards: [
      {
        title: "Public Consular Verification URL",
        description: "Live QR code resolving to /verify/{code} for instantaneous adjudication checks.",
        icon: QrCode,
      },
      {
        title: "SHA-256 Cryptographic Ledger",
        description: "Immutable mathematical hash guaranteeing the document has not been altered.",
        icon: Sparkles,
      },
      {
        title: "Immediate Round-Trip Download",
        description: "Translated deliverable delivered immediately in the identical source format.",
        icon: Clock,
      },
    ],
  },
];

export function DarkProductHowItWorks() {
  const [activeStep, setActiveStep] = useState<string>("triage");
  const current = STEPS.find((s) => s.id === activeStep) || STEPS[0];

  return (
    <section className="py-20 md:py-32 bg-surface">
      <div className="max-w-7xl mx-auto px-6">
        {/* Outer Dark Navy Container with Subtle Grain Overlay and Gradient (§3.2.2, §3.2.3, §3.6.1) */}
        <div className="rounded-[var(--r-2xl)] bg-gradient-dark-band border border-white/10 p-8 sm:p-12 md:p-16 relative overflow-hidden shadow-2xl space-y-12">
          {/* Subtle SVG Grain Overlay */}
          <div className="absolute inset-0 grain-overlay z-0 pointer-events-none" aria-hidden="true" />

          {/* Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4 relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/15 bg-white/5 text-brand-300 text-xs font-bold uppercase tracking-wider font-mono">
              <Zap className="w-4 h-4 text-brand-300" />
              <span>Engineered For Zero Rejections</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-[1.05] font-display">
              How VerifyLingua Works Under the Hood.
            </h2>

            <p className="text-base sm:text-lg text-white/70 leading-relaxed">
              We combine automated pre-payment scan triage with certified human ATA linguists and cryptographic verification so your application clears USCIS on the first review.
            </p>
          </div>

          {/* Interactive Step Tabs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
            {STEPS.map((step) => {
              const isActive = step.id === activeStep;
              return (
                <button
                  key={step.id}
                  onClick={() => setActiveStep(step.id)}
                  type="button"
                  className={`p-5 rounded-2xl text-left transition-all duration-300 border flex flex-col justify-between space-y-3 cursor-pointer ${
                    isActive
                      ? "bg-white/15 border-brand-300/60 shadow-lg"
                      : "bg-white/5 border-white/10 hover:bg-white/[0.08] hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-mono font-black ${
                        isActive ? "text-brand-300" : "text-white/50"
                      }`}
                    >
                      Step {step.stepNumber}
                    </span>
                    <Badge
                      variant={isActive ? "default" : "outline"}
                      className={`text-[10px] ${
                        isActive
                          ? "bg-brand-500 text-white"
                          : "border-white/20 text-white/70"
                      }`}
                    >
                      {step.badge}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white leading-snug">
                      {step.title}
                    </h3>
                    <p className="text-xs text-white/60 leading-relaxed pt-1">
                      {step.shortDesc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Embedded Real Product UI Mockup Card (Double-Bezel Architecture) */}
          <div className="relative z-10 p-2 sm:p-3 rounded-[32px] bg-white/10 border border-white/15 shadow-2xl backdrop-blur-md">
            <div className="rounded-[calc(32px-0.5rem)] bg-surface-raised text-brand-ink p-6 sm:p-8 md:p-10 space-y-8">
              {/* Mockup Card Top Bar (macOS Window Style) */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border/80">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-status-danger/70" />
                    <div className="w-3 h-3 rounded-full bg-status-warning/70" />
                    <div className="w-3 h-3 rounded-full bg-status-success/70" />
                  </div>
                  <span className="text-xs font-mono font-bold text-text-muted">
                    {current.uiHeader}
                  </span>
                </div>

                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-status-success/10 text-status-success border border-status-success/20 text-xs font-bold font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{current.uiStatus}</span>
                </div>
              </div>

              {/* 2-Column Mockup Content */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Left side: Live inspection specs & copy */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="space-y-2">
                    <span className="text-xs font-mono font-bold text-brand-500 uppercase tracking-wide">
                      Active Step • {current.title}
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-black text-brand-ink font-display">
                      {current.uiHeader}
                    </h3>
                    <p className="text-sm text-ink-soft leading-relaxed">
                      {current.summary}
                    </p>
                  </div>

                  {/* Checklist of audit metrics */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {current.details.map((detail, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-surface border border-border/80 space-y-1"
                      >
                        <span className="text-[11px] text-text-muted block font-medium">
                          {detail.label}
                        </span>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-brand-ink font-mono">
                          <CheckCircle2 className="w-3.5 h-3.5 text-status-success shrink-0" />
                          <span>{detail.value}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2">
                    <MagneticButton>
                      <Button size="lg" asChild className="gap-2 shadow-md">
                        <Link href="/order/triage">
                          Test with your scan ($24.95/page)
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </Button>
                    </MagneticButton>
                  </div>
                </div>

                {/* Right side: Visual artifact image banner */}
                <div className="lg:col-span-5">
                  <div className="relative w-full h-64 sm:h-72 rounded-2xl overflow-hidden border border-border bg-surface shadow-inner group">
                    <Image
                      src={current.previewImage}
                      alt={current.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 1024px) 100vw, 40vw"
                    />
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-brand-ink/85 backdrop-blur-md text-white text-[11px] font-mono font-bold shadow-md border border-white/10">
                      Step {current.stepNumber} Artifact
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3 Supporting Feature Micro-Cards Beneath the Mockup (Sunsama Reference Pattern) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10 pt-2">
            {current.microCards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2 backdrop-blur-sm hover:bg-white/[0.08] hover:border-brand-300/40 transition-all duration-200"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-brand-300 shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h4 className="text-sm font-bold text-white font-display">
                      {card.title}
                    </h4>
                  </div>
                  <p className="text-xs text-white/60 leading-relaxed pl-10.5">
                    {card.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
