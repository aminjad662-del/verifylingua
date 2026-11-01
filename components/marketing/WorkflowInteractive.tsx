"use client";

import React, { useState } from "react";
import { 
  UploadCloud, 
  FileCheck2, 
  Award, 
  Download, 
  ShieldCheck, 
  Clock, 
  Lock,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";

interface WorkflowStep {
  id: string;
  number: string;
  title: string;
  description: string;
  icon: React.ElementType;
  tag: string;
  previewTitle: string;
  previewDetail: string;
  previewMetrics: { label: string; value: string }[];
}

const STEPS: WorkflowStep[] = [
  {
    id: "upload",
    number: "01",
    title: "Secure Upload & Coordinate Parsing",
    description: "Upload scans or photos of your civil records. Our system preserves exact table structures, stamps, and layout coordinates.",
    icon: UploadCloud,
    tag: "AES-256 Encrypted",
    previewTitle: "Document Triage & Structure Extraction",
    previewDetail: "Automatic layout parsing matches original physical document geometry.",
    previewMetrics: [
      { label: "Security", value: "TLS 1.3 / AES-256" },
      { label: "Retention", value: "Zero Data Training" },
      { label: "Formats", value: "PDF, JPG, PNG" },
    ],
  },
  {
    id: "linguist",
    number: "02",
    title: "Sworn ATA Linguist Translation",
    description: "Certified professional translators translate every line, stamp, handwritten notation, and marginal note to legal court standards.",
    icon: Award,
    tag: "ATA No. 278190",
    previewTitle: "Human Linguist Verification",
    previewDetail: "Every foreign vital record is certified by verified language specialists.",
    previewMetrics: [
      { label: "Standards", value: "8 CFR § 103.2(b)(3)" },
      { label: "Linguists", value: "ATA Certified" },
      { label: "Accuracy", value: "Court Admissible" },
    ],
  },
  {
    id: "seal",
    number: "03",
    title: "Cryptographic SHA-256 Sealing",
    description: "Each completed translation receives a formal translator competence certificate, tamper-evident SHA-256 hash, and adjudicator QR seal.",
    icon: ShieldCheck,
    tag: "Tamper Proof",
    previewTitle: "Digital Cryptographic Digest",
    previewDetail: "Immigration officers scan the embedded QR code to confirm document integrity.",
    previewMetrics: [
      { label: "Verification", value: "Live Public Ledger" },
      { label: "Signature", value: "Sworn Translator" },
      { label: "Hash", value: "SHA-256 Sealed" },
    ],
  },
  {
    id: "delivery",
    number: "04",
    title: "Instant Download & Physical Dispatch",
    description: "Receive your certified, court-ready PDF in under 24 hours, with optional expedited physical copies shipped to your law firm or home.",
    icon: Download,
    tag: "Under 24 Hours",
    previewTitle: "Adjudicator Ready Packet",
    previewDetail: "Ready for direct submission with Form I-130, I-485, N-400, or consular packets.",
    previewMetrics: [
      { label: "Turnaround", value: "< 24 Hours Guaranteed" },
      { label: "Acceptance", value: "100% Guaranteed" },
      { label: "Format", value: "Certified Vector PDF" },
    ],
  },
];

export function WorkflowInteractive() {
  const [activeStepId, setActiveStepId] = useState("upload");
  const activeStep = STEPS.find((s) => s.id === activeStepId) || STEPS[0];

  return (
    <section className="py-16 sm:py-24 bg-surface border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="max-w-3xl text-left space-y-3">
          <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-200">
            Certified Workflow
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-brand-ink leading-tight">
            How VerifyLingua Delivers Court-Ready Translations
          </h2>
          <p className="text-base text-text-muted leading-relaxed">
            From raw foreign scans to sealed legal submissions in four verifiable stages.
          </p>
        </div>

        {/* 2-Column Split: Interactive Steps vs Step Details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Step Selectors (Col Span 5) */}
          <div className="lg:col-span-5 space-y-3">
            {STEPS.map((step) => {
              const Icon = step.icon;
              const isActive = activeStepId === step.id;
              return (
                <button
                  key={step.id}
                  onClick={() => setActiveStepId(step.id)}
                  className={`w-full p-4 sm:p-5 rounded-2xl text-left transition-all border ${
                    isActive
                      ? "bg-surface-raised border-brand-500 shadow-xs ring-1 ring-brand-500/20"
                      : "bg-surface border-border hover:bg-surface-raised hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold transition-colors ${
                          isActive
                            ? "bg-brand-600 text-white"
                            : "bg-surface border border-border text-text-muted"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono font-bold text-text-subtle uppercase">
                          Stage {step.number}
                        </span>
                        <h4 className="text-sm font-bold text-brand-ink">
                          {step.title}
                        </h4>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-surface border border-border text-text-muted shrink-0">
                      {step.tag}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Column: Step Preview Card (Col Span 7) */}
          <div className="lg:col-span-7">
            <div className="p-6 sm:p-8 rounded-2xl bg-surface-raised border border-border shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-brand-600" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-text-muted">
                    {activeStep.previewTitle}
                  </span>
                </div>
                <span className="text-xs font-mono text-brand-600 font-semibold">
                  Stage {activeStep.number} of 04
                </span>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl sm:text-2xl font-bold text-brand-ink">
                  {activeStep.title}
                </h3>
                <p className="text-sm text-text-muted leading-relaxed">
                  {activeStep.description}
                </p>
                <p className="text-xs text-text-subtle leading-relaxed bg-surface p-3.5 rounded-xl border border-border">
                  {activeStep.previewDetail}
                </p>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                {activeStep.previewMetrics.map((metric) => (
                  <div
                    key={metric.label}
                    className="p-3.5 rounded-xl bg-surface border border-border text-center space-y-1"
                  >
                    <span className="text-[10px] font-mono uppercase text-text-subtle block">
                      {metric.label}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-brand-ink block">
                      {metric.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* CTA link */}
              <div className="pt-2 flex justify-end">
                <Link
                  href="/order/triage"
                  className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1.5"
                >
                  <span>Start with this stage</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
