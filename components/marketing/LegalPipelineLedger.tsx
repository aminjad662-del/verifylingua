"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
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
  BadgeCheck,
  Fingerprint
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface PipelineStage {
  id: string;
  stepNumber: string;
  title: string;
  shortDesc: string;
  technicalSpec: string;
  governingStandard: string;
  image: string;
  auditOutput: {
    badge: string;
    line1: string;
    line2: string;
    status: string;
  };
  metrics: { label: string; value: string }[];
}

const PIPELINE_STAGES: PipelineStage[] = [
  {
    id: "triage",
    stepNumber: "STAGE 01",
    title: "Document Triage & Spatial OCR Parsing",
    shortDesc: "Pixel-level bounding box mapping across seals, tables, and handwritten marginal notes.",
    technicalSpec: "Resolution verified at 300 DPI minimum. Bounding box coordinates extracted prior to human linguist assignment.",
    governingStandard: "ISO 32000-1 / Archival Raster Standard",
    image: "/images/step-ai-triage-3d.jpg",
    auditOutput: {
      badge: "PRE-FLIGHT TRIAGE",
      line1: "Civil Registry Certificate: 300 DPI Validated",
      line2: "Bounding geometry locked: 14 structural coordinate zones calibrated",
      status: "CALIBRATION READY",
    },
    metrics: [
      { label: "Security", value: "TLS 1.3 / AES-256" },
      { label: "Retention", value: "Zero Training Policy" },
      { label: "Format", value: "PDF, JPG, TIFF, PNG" },
    ],
  },
  {
    id: "linguist",
    stepNumber: "STAGE 02",
    title: "Sworn ATA Linguist Human Translation",
    shortDesc: "Court-admissible translation certified by verified ATA corporate linguists under penalty of perjury.",
    technicalSpec: "Every sentence, official stamp, registration folio, and endorsement translated in full compliance with federal statutory standards.",
    governingStandard: "8 CFR § 103.2(b)(3) / ATA Corporate Credential",
    image: "/images/step-human-cert-3d.jpg",
    auditOutput: {
      badge: "SWORN ATTESTATION",
      line1: "Linguist Credential: ATA Professional Certified (ES to EN)",
      line2: "Competence Declaration: Full fluency sworn under penalty of perjury",
      status: "TRANSLATION CERTIFIED",
    },
    metrics: [
      { label: "Governing Rule", value: "8 CFR § 103.2(b)(3)" },
      { label: "Credential", value: "ATA Corporate Member" },
      { label: "Admissibility", value: "USCIS & EOIR Courts" },
    ],
  },
  {
    id: "sealing",
    stepNumber: "STAGE 03",
    title: "Cryptographic SHA-256 Sealing & QR Generation",
    shortDesc: "Digital binding of translation, original source scan, competence jurat, and tamper-evident hash.",
    technicalSpec: "Cryptographic digest generated and recorded to the public ledger. Immigration officers verify integrity via embedded QR scan.",
    governingStandard: "FIPS 180-4 Secure Hash Standard",
    image: "/images/step-qr-verified-3d.jpg",
    auditOutput: {
      badge: "CRYPTOGRAPHIC SEAL",
      line1: "Digest: SHA-256: 7d4a98f1c830b201...e89b21d01",
      line2: "Public Verification URL: verifylingua.pages.dev/verify",
      status: "IMMUTABLE LEDGER",
    },
    metrics: [
      { label: "Ledger", value: "Live Public Route" },
      { label: "Signature", value: "Cryptographic Seal" },
      { label: "Verification", value: "Zero-Knowledge Hash" },
    ],
  },
  {
    id: "delivery",
    stepNumber: "STAGE 04",
    title: "Court-Ready PDF & Physical Courier Dispatch",
    shortDesc: "Adjudication-ready PDF deliverable in under 24 hours with optional embossed physical shipment.",
    technicalSpec: "Archival PDF/A-1b standard compliant with USCIS electronic submission portals and EOIR court e-filing systems.",
    governingStandard: "PDF/A-1b ISO 19005-1 Standard",
    image: "/images/doc-certificate-3d.jpg",
    auditOutput: {
      badge: "SUBMISSION READY",
      line1: "Format: PDF/A-1b Archival Standard with Vector Typography",
      line2: "Packet Contents: Certified Translation + Original Record + Sworn Affidavit",
      status: "DELIVERY COMPLETE",
    },
    metrics: [
      { label: "Standard SLA", value: "Under 24 Hours Guaranteed" },
      { label: "Acceptance", value: "Guaranteed or Full Refund" },
      { label: "Physical Courier", value: "FedEx Priority Available" },
    ],
  },
];

export function LegalPipelineLedger() {
  const [activeStageId, setActiveStageId] = useState("triage");
  const activeStage = PIPELINE_STAGES.find((s) => s.id === activeStageId) || PIPELINE_STAGES[0];

  return (
    <section className="py-16 sm:py-24 bg-canvas border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 text-left">
        
        {/* Header */}
        <div className="max-w-3xl space-y-3">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-brand-ink font-display">
            Auditable Chain of Custody Pipeline
          </h2>
          <p className="text-base text-text-muted leading-relaxed">
            From raw foreign civil scans to sealed legal submissions in four verifiable, audit-trailed stages designed for federal court scrutiny.
          </p>
        </div>

        {/* Continuous Hairline Timeline Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 border border-border rounded-2xl bg-surface-raised overflow-hidden divide-y lg:divide-y-0 lg:divide-x divide-border">
          
          {/* Left Column: Stage Selector Stream (Span 5) */}
          <div className="lg:col-span-5 divide-y divide-border bg-surface">
            {PIPELINE_STAGES.map((stage) => {
              const isActive = activeStageId === stage.id;
              return (
                <button
                  key={stage.id}
                  onClick={() => setActiveStageId(stage.id)}
                  className={`w-full p-5 text-left transition-all cursor-pointer flex flex-col gap-2 ${
                    isActive
                      ? "bg-surface-raised border-l-4 border-l-brand-600 shadow-2xs"
                      : "hover:bg-surface-raised/70 border-l-4 border-l-transparent"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold text-text-subtle">
                      {stage.stepNumber}
                    </span>
                    <span className="font-mono text-[10px] text-brand-600 font-semibold bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                      {stage.governingStandard}
                    </span>
                  </div>

                  <h3 className={`text-sm font-bold transition-colors ${isActive ? "text-brand-ink" : "text-text"}`}>
                    {stage.title}
                  </h3>

                  <p className="text-xs text-text-muted leading-relaxed line-clamp-2">
                    {stage.shortDesc}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Right Column: Active Stage Inspector (Span 7) */}
          <div className="lg:col-span-7 flex flex-col justify-between bg-surface-raised">
            
            {/* Visual Stage Asset Banner */}
            <div className="relative h-56 sm:h-64 w-full overflow-hidden bg-neutral-900 border-b border-border">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStage.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="relative w-full h-full"
                >
                  <Image
                    src={activeStage.image}
                    alt={activeStage.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 58vw"
                    className="object-cover object-center brightness-[0.85] contrast-[1.05]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

                  <div className="absolute bottom-4 left-5 right-5 flex items-center justify-between text-white">
                    <div className="space-y-0.5">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-white/80">
                        {activeStage.stepNumber} SPECIFICATION
                      </span>
                      <h4 className="text-base font-bold text-white">
                        {activeStage.title}
                      </h4>
                    </div>
                    <span className="font-mono text-xs px-2.5 py-1 rounded-md bg-white/20 backdrop-blur-md border border-white/30 text-white font-bold">
                      {activeStage.governingStandard}
                    </span>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Stage Body Specs */}
            <div className="p-6 sm:p-8 space-y-6 flex-1 flex flex-col justify-between">
              
              <div className="space-y-3">
                <p className="text-sm text-text leading-relaxed font-sans">
                  {activeStage.technicalSpec}
                </p>

                {/* Machine Readable Artifact Snippet */}
                <div className="p-4 rounded-xl bg-surface border border-border font-mono text-xs space-y-2">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-text-subtle uppercase">{activeStage.auditOutput.badge}</span>
                    <span className="font-bold text-status-success bg-status-success/10 px-2 py-0.5 rounded border border-status-success/30">
                      {activeStage.auditOutput.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-brand-ink font-semibold">
                    {activeStage.auditOutput.line1}
                  </div>
                  <div className="text-[10px] text-text-muted">
                    {activeStage.auditOutput.line2}
                  </div>
                </div>
              </div>

              {/* Metrics Row */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border">
                {activeStage.metrics.map((m, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="font-mono text-[10px] text-text-subtle uppercase truncate">
                      {m.label}
                    </div>
                    <div className="text-xs font-bold text-brand-ink truncate">
                      {m.value}
                    </div>
                  </div>
                ))}
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
