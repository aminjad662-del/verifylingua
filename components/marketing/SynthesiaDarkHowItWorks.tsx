"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  UploadCloud,
  FileCheck2,
  Stamp,
  Download,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Lock,
  Layers,
  FileText,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface WorkflowStep {
  id: string;
  stepNumber: string;
  tabLabel: string;
  headline: string;
  description: string;
  metrics: { label: string; value: string }[];
  previewTitle: string;
  previewSnippet: string;
}

const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    id: "step1",
    stepNumber: "01",
    tabLabel: "Optical Ingestion",
    headline: "Pre-Payment Quality Triage & Stamp Extraction",
    description:
      "Our AI audit analyzes your scan in seconds to detect embossed notary seals, handwritten marginal notations, and cropped margins before you pay.",
    metrics: [
      { label: "OCR Confidence", value: "99.8% Legibility" },
      { label: "Embossed Seals", value: "2 Stamps Detected" },
      { label: "Page Count", value: "1 Certified Page" },
    ],
    previewTitle: "DOCUMENT_TRIAGE_INSPECTOR.RAW",
    previewSnippet:
      "Extracting vital statistics from civil registry of Madrid: Full Name, Date of Birth, Parental Lineage, and State Notary Stamp confirmed legible.",
  },
  {
    id: "step2",
    stepNumber: "02",
    tabLabel: "ATA Certified Translation",
    headline: "Legal Terminology Translation & Consistency Lock",
    description:
      "Certified legal linguists match official Spanish-English statutory terms, locking passport spelling transliterations to prevent silent RFE rejections.",
    metrics: [
      { label: "Terminology Match", value: "100% USCIS Standard" },
      { label: "Passport Lock", value: "Name Consistency Locked" },
      { label: "Human Review", value: "Senior ATA Linguist" },
    ],
    previewTitle: "LEGAL_TRANSLATION_CORE.TXT",
    previewSnippet:
      "Civil Certificate of Birth translated in verbatim accordance with Spanish Civil Code and United States Department of State Foreign Affairs Manual (FAM).",
  },
  {
    id: "step3",
    stepNumber: "03",
    tabLabel: "Sworn Affidavit & Seal",
    headline: "Sworn 8 CFR § 103.2 Competence Certification",
    description:
      "Every document receives a formal Certificate of Accuracy bearing ATA Corporate Member No. 278190, a digital notary seal, and an encrypted QR verification link.",
    metrics: [
      { label: "Regulation", value: "8 CFR § 103.2(b)(3)" },
      { label: "ATA Credential", value: "Member No. 278190" },
      { label: "Cryptographic Hash", value: "SHA-256 Validated" },
    ],
    previewTitle: "SWORN_CERTIFICATE_OF_ACCURACY.SEAL",
    previewSnippet:
      "I hereby certify that the translated document is a complete and accurate translation of the Spanish original, certified by VerifyLingua LLC.",
  },
  {
    id: "step4",
    stepNumber: "04",
    tabLabel: "USCIS Packet Delivery",
    headline: "Instant Digital PDF Delivery & Archival Vault",
    description:
      "Download your print-ready PDF packet with mirror layout formatting. Guaranteed for immediate e-filing across USCIS, Department of State, and courts.",
    metrics: [
      { label: "Delivery Time", value: "< 24 Hours SLA" },
      { label: "Acceptance", value: "100% Guaranteed" },
      { label: "Format", value: "USCIS Direct E-Filing PDF" },
    ],
    previewTitle: "VERIFIED_USCIS_PACKET_FINAL.PDF",
    previewSnippet:
      "Complete packet assembled with Title Page, Certified Translation, Original Source Document, and Sworn Verification Certificate.",
  },
];

export function SynthesiaDarkHowItWorks() {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const activeStep = WORKFLOW_STEPS[activeStepIndex];

  return (
    <section className="py-20 sm:py-32 bg-canvas">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Dark Container Box (Matches Screenshot Dark How It Works) */}
        <div className="rounded-3xl bg-obsidian-950 border border-obsidian-border p-6 sm:p-12 shadow-2xl relative overflow-hidden">
          {/* Subtle Ambient Radial Lighting */}
          <div
            className="pointer-events-none absolute -top-40 -left-40 w-96 h-96 opacity-20 rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(59, 130, 246, 0.8) 0%, transparent 70%)",
            }}
            aria-hidden="true"
          />

          <div className="relative z-10 space-y-10 sm:space-y-12">
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-brand-400">
                End-to-End Certified Pipeline
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white font-display">
                How VerifyLingua works
              </h2>
              <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
                From raw document scan to certified, tamper-evident court submission in 4 deterministic steps.
              </p>
            </div>

            {/* 4 Interactive Stage Tabs (Matches Screenshot dark tab bar) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 p-1.5 rounded-2xl bg-obsidian-card border border-obsidian-border">
              {WORKFLOW_STEPS.map((step, idx) => (
                <button
                  key={step.id}
                  onClick={() => setActiveStepIndex(idx)}
                  className={`p-3 sm:p-4 rounded-xl text-left transition-all cursor-pointer relative ${
                    activeStepIndex === idx
                      ? "bg-brand-500 text-white shadow-md shadow-brand-500/20"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <div className="space-y-1">
                    <span
                      className={`text-[10px] font-mono font-bold block ${
                        activeStepIndex === idx ? "text-brand-100" : "text-slate-500"
                      }`}
                    >
                      STEP {step.stepNumber}
                    </span>
                    <span className="text-xs sm:text-sm font-bold block leading-tight">
                      {step.tabLabel}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* Application Studio Preview Window (Matches Screenshot editor mockup) */}
            <div className="rounded-2xl bg-obsidian-card border border-obsidian-border p-4 sm:p-8 space-y-6 shadow-xl">
              {/* Studio Window Bar */}
              <div className="flex items-center justify-between pb-4 border-b border-obsidian-border">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="text-xs font-mono text-slate-400 ml-2">
                    VerifyLingua Studio — {activeStep.previewTitle}
                  </span>
                </div>
                <Badge variant="outline" className="border-brand-500/40 text-brand-300 text-[10px] font-mono">
                  ACTIVE STAGE {activeStep.stepNumber} / 04
                </Badge>
              </div>

              {/* Step Detail Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Left Detail */}
                <div className="lg:col-span-5 space-y-5">
                  <div className="space-y-2">
                    <h3 className="text-xl sm:text-2xl font-bold text-white font-display">
                      {activeStep.headline}
                    </h3>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      {activeStep.description}
                    </p>
                  </div>

                  {/* Metrics Pills */}
                  <div className="space-y-2 pt-2">
                    {activeStep.metrics.map((m, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-obsidian-elevated border border-obsidian-border text-xs"
                      >
                        <span className="text-slate-400 font-mono">{m.label}</span>
                        <span className="font-bold text-white font-mono">{m.value}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2">
                    <Link href="/translate">
                      <Button className="bg-brand-500 hover:bg-brand-600 text-white font-semibold text-xs sm:text-sm px-5 py-4 rounded-xl cursor-pointer">
                        <span>Try live with your document</span>
                        <ArrowRight className="w-4 h-4 ml-1.5" />
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Right Mock Studio Document View */}
                <div className="lg:col-span-7">
                  <div className="rounded-xl bg-canvas p-5 sm:p-8 text-text space-y-4 border border-slate-200 shadow-lg font-sans">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-brand-600" />
                        <span className="text-xs font-bold text-text uppercase tracking-wider font-mono">
                          CERTIFIED TRANSLATION PACKET
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-status-success bg-status-success-bg px-2 py-0.5 rounded-full font-bold">
                        SEAL APPLIED
                      </span>
                    </div>

                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 space-y-2 text-xs font-mono">
                      <span className="text-text-subtle text-[10px] block">
                        VERIFIED DOCUMENT RECORD:
                      </span>
                      <p className="text-slate-800 leading-relaxed font-sans text-xs">
                        {activeStep.previewSnippet}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                      <span className="font-mono text-slate-500 text-[11px]">
                        ATA Corporate Member No. 278190
                      </span>
                      <span className="font-bold text-brand-600 text-xs flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        8 CFR § 103.2 Guaranteed
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
