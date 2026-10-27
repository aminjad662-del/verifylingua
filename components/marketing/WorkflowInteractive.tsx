"use client";

import React, { useState } from "react";
import Image from "next/image";
import { 
  UploadCloud, 
  Award, 
  Download, 
  ShieldCheck, 
  ArrowRight,
  CheckCircle2,
  Lock,
  Layers,
  FileCheck2,
  FileText,
  BadgeCheck
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";

interface WorkflowStep {
  id: string;
  number: string;
  title: string;
  shortDesc: string;
  description: string;
  image: string;
  icon: React.ElementType;
  tag: string;
  previewHeading: string;
  previewSubheading: string;
  details: { label: string; value: string }[];
  artifactSnippet: {
    badge: string;
    line1: string;
    line2: string;
    status: string;
  };
}

const STEPS: WorkflowStep[] = [
  {
    id: "upload",
    number: "01",
    title: "Document Triage & Structure Extraction",
    shortDesc: "Coordinate parsing that maps stamps, signatures, and marginalia.",
    description: "Upload high-resolution scans or photos of civil records. Our OCR engine parses document layout geometry down to exact pixel coordinates before linguist assignment.",
    image: "/images/step-ai-triage-3d.jpg",
    icon: UploadCloud,
    tag: "AES-256 Vault",
    previewHeading: "Physical Geometry & Structure Extraction",
    previewSubheading: "Automated pre-flight detects seals, multi-column tables, and handwritten marginal notes.",
    details: [
      { label: "Security", value: "TLS 1.3 / AES-256" },
      { label: "AI Retention", value: "Zero Training Policy" },
      { label: "Accepted Formats", value: "PDF, JPG, TIFF, PNG" },
    ],
    artifactSnippet: {
      badge: "PRE-FLIGHT TRIAGE",
      line1: "Civil Registry Certificate: 300 DPI Validated",
      line2: "Bounding boxes calibrated: 14 structural zones detected",
      status: "CALIBRATION READY",
    },
  },
  {
    id: "linguist",
    number: "02",
    title: "Sworn ATA Linguist Human Translation",
    shortDesc: "Court-admissible translation certified by verified linguists.",
    description: "A certified professional translator translates every sentence, official seal, registration folio, and endorsement in full accordance with statutory guidelines.",
    image: "/images/step-human-cert-3d.jpg",
    icon: Award,
    tag: "ATA No. 278190",
    previewHeading: "Human Translation & Peer Review",
    previewSubheading: "Every foreign vital record is translated and verified by credentialed language experts.",
    details: [
      { label: "Governing Rule", value: "8 CFR § 103.2(b)(3)" },
      { label: "Credential", value: "ATA Corporate Member" },
      { label: "Acceptance", value: "USCIS & EOIR Courts" },
    ],
    artifactSnippet: {
      badge: "SWORN ATTESTATION",
      line1: "Linguist ID: ATA Professional Certified (ES to EN)",
      line2: "Competence Declaration: Full fluency sworn under penalty of perjury",
      status: "TRANSLATION CERTIFIED",
    },
  },
  {
    id: "seal",
    number: "03",
    title: "Cryptographic SHA-256 Sealing",
    shortDesc: "Public audit ledger stamp with embedded QR code.",
    description: "Each completed translation is digitally bound with a formal translator competence affidavit, tamper-evident SHA-256 hash, and adjudicator verification QR code.",
    image: "/images/step-qr-verified-3d.jpg",
    icon: ShieldCheck,
    tag: "Tamper Evident",
    previewHeading: "Cryptographic Integrity Ledger",
    previewSubheading: "Immigration officers scan the embedded QR code to verify the original file checksum.",
    details: [
      { label: "Ledger", value: "Live Public Route" },
      { label: "Signature", value: "Cryptographic Seal" },
      { label: "Verification", value: "Zero-Knowledge Hash" },
    ],
    artifactSnippet: {
      badge: "CRYPTOGRAPHIC SEAL",
      line1: "Digest: SHA-256: 7d4a98f1c830b201...e89b21d01",
      line2: "Public Verification URL: verifylingua.pages.dev/verify",
      status: "IMMUTABLE LEDGER",
    },
  },
  {
    id: "delivery",
    number: "04",
    title: "Instant Download & Physical Dispatch",
    shortDesc: "Court-ready PDF under 24 hours with optional overnight mail.",
    description: "Receive your certified, adjudication-ready PDF in under 24 hours. Need physical embossed copies? We ship via FedEx Priority directly to your law firm or home address.",
    image: "/images/doc-certificate-3d.jpg",
    icon: Download,
    tag: "Under 24 Hours",
    previewHeading: "Adjudication-Ready Filing Packet",
    previewSubheading: "Ready for immediate upload to USCIS online portals or court submission binders.",
    details: [
      { label: "Standard SLA", value: "Under 24 Hours Guaranteed" },
      { label: "Acceptance", value: "Guaranteed or Full Refund" },
      { label: "Physical Courier", value: "FedEx Priority Available" },
    ],
    artifactSnippet: {
      badge: "SUBMISSION READY",
      line1: "Format: PDF/A-1b Archival Standard with Vector Typography",
      line2: "Packet Contents: Certified Translation + Original Record + Sworn Affidavit",
      status: "DELIVERY COMPLETE",
    },
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
          <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold tracking-tight text-brand-ink leading-tight font-display">
            How VerifyLingua Delivers Court-Ready Translations
          </h2>
          <p className="text-base text-text-muted leading-relaxed">
            From raw foreign civil scans to sealed legal submissions in four verifiable, audit-trailed stages.
          </p>
        </div>

        {/* 2-Column Split: Interactive Pipeline vs Stage Details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Pipeline Step Selectors (Col Span 5) */}
          <div className="lg:col-span-5 space-y-3">
            {STEPS.map((step) => {
              const Icon = step.icon;
              const isActive = activeStepId === step.id;
              return (
                <button
                  key={step.id}
                  onClick={() => setActiveStepId(step.id)}
                  className={`w-full p-4 sm:p-5 rounded-2xl text-left transition-all cursor-pointer border ${
                    isActive
                      ? "bg-surface-raised border-brand-500 shadow-xs ring-1 ring-brand-500/20"
                      : "bg-surface border-border hover:bg-surface-raised hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold transition-colors shrink-0 ${
                          isActive
                            ? "bg-brand-600 text-white shadow-xs"
                            : "bg-surface-raised border border-border text-text-muted"
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
                  <p className="text-xs text-text-muted leading-relaxed mt-2 pl-[46px]">
                    {step.shortDesc}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Right Column: Stage Preview Inspector (Col Span 7) */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl bg-surface-raised border border-border shadow-md overflow-hidden text-left">
              
              {/* Visual Asset Header for Active Stage */}
              <div className="relative h-48 sm:h-56 w-full overflow-hidden bg-neutral-900 border-b border-border">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeStep.id}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="relative w-full h-full"
                  >
                    <Image
                      src={activeStep.image}
                      alt={activeStep.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 58vw"
                      className="object-cover object-center brightness-[0.8] contrast-[1.05]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                    
                    <div className="absolute bottom-4 left-5 right-5 flex items-center justify-between text-white">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-white/80">
                          {activeStep.previewHeading}
                        </span>
                        <h4 className="text-base font-bold text-white">
                          {activeStep.title}
                        </h4>
                      </div>
                      <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-white/20 backdrop-blur-md border border-white/30 text-white font-bold">
                        Stage {activeStep.number} of 04
                      </span>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Stage Body Specs & Artifact */}
              <div className="p-6 sm:p-8 space-y-6">
                <div className="space-y-2">
                  <p className="text-sm text-text leading-relaxed">
                    {activeStep.description}
                  </p>
                  <p className="text-xs text-text-muted leading-relaxed bg-surface p-3 rounded-xl border border-border">
                    {activeStep.previewSubheading}
                  </p>
                </div>

                {/* Stage Operational Artifact */}
                <div className="p-4 rounded-xl bg-surface border border-border font-mono text-xs space-y-2">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-text-subtle uppercase">{activeStep.artifactSnippet.badge}</span>
                    <span className="font-bold text-status-success bg-status-success/10 px-2 py-0.5 rounded border border-status-success/30">
                      {activeStep.artifactSnippet.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-brand-ink font-semibold">
                    {activeStep.artifactSnippet.line1}
                  </div>
                  <div className="text-[10px] text-text-muted">
                    {activeStep.artifactSnippet.line2}
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-3 gap-3 pt-2 border-t border-border">
                  {activeStep.details.map((detail, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="text-[10px] font-mono text-text-subtle uppercase truncate">
                        {detail.label}
                      </div>
                      <div className="text-xs font-bold text-brand-ink truncate">
                        {detail.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
