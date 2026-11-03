"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  ArrowRight,
  FileCheck2,
  Lock,
  Scale,
  Award,
  Zap,
  HelpCircle,
  Play,
  Pause,
  ChevronRight,
  ChevronLeft,
  FileText,
  Scan,
  Compass,
  Cpu,
  Stamp,
  QrCode,
  Building2,
  Layers,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// ─── DIORAMA STAGE DEFINITIONS (scroll-world architecture) ───────────────
export interface DioramaStage {
  id: string;
  stationNumber: string;
  label: string;
  eyebrow: string;
  title: string;
  body: string;
  tags: string[];
  telemetry: {
    label: string;
    value: string;
    status: "verified" | "active" | "secured";
  }[];
}

export const DIORAMA_STAGES: DioramaStage[] = [
  {
    id: "intake",
    stationNumber: "01 INTAKE",
    label: "Global Intake",
    eyebrow: "Stage 01 · Global Ingestion & Triage",
    title: "Global Document Intake",
    body: "Foreign civil records, vital statistics, and judicial decrees ingested with instant optical raster analysis and multi-angle edge validation.",
    tags: ["600 DPI Gate", "Perimeter Detection", "Multi-Language Intake"],
    telemetry: [
      { label: "OPTICAL RESOLUTION", value: "600 DPI VERIFIED", status: "verified" },
      { label: "GOVERNMENT STAMP", value: "DETECTED (SPANISH CIVIL)", status: "active" },
      { label: "TAMPER STATUS", value: "ZERO RESAMPLE ARTIFACTS", status: "secured" },
    ],
  },
  {
    id: "engine",
    stationNumber: "02 ENGINE",
    label: "Forensic Core",
    eyebrow: "Stage 02 · 1:1 Format Reconstruction",
    title: "Neural Forensic Layout Engine",
    body: "Side-by-side linguistic reconstruction preserving 100% of original government stamps, seal matrices, tabular structures, and official signature coordinates.",
    tags: ["1:1 Geometry Lock", "Zero-Hallucination", "Bilingual Grid"],
    telemetry: [
      { label: "LAYOUT FIDELITY", value: "99.8% GEOMETRIC MATCH", status: "verified" },
      { label: "TERMINOLOGY VAULT", value: "USCIS 8 CFR § 103.2", status: "active" },
      { label: "CERTIFIED LINGUIST", value: "SWORN LEGAL SPECIALIST", status: "secured" },
    ],
  },
  {
    id: "certify",
    stationNumber: "03 CERTIFY",
    label: "ATA Jurat",
    eyebrow: "Stage 03 · Sworn Statutory Certification",
    title: "ATA-Certified Jurat & Notary",
    body: "Sworn legal competence affidavit signed by accredited American Translators Association (ATA) professionals under state notary commission.",
    tags: ["ATA Corporate Member", "State Notary Jurat", "8 CFR § 103.2(b)(3)"],
    telemetry: [
      { label: "ATA MEMBER ID", value: "CORPORATE NO. 278190", status: "verified" },
      { label: "LEGAL JURAT", value: "SWORN UNDER PENALTY OF PERJURY", status: "active" },
      { label: "SEAL EMBOSSING", value: "TAMPER-PROOF STATE SEAL", status: "secured" },
    ],
  },
  {
    id: "vault",
    stationNumber: "04 VAULT",
    label: "Cryptographic Vault",
    eyebrow: "Stage 04 · Digital Sovereign Ledger",
    title: "Sovereign Cryptographic Vault",
    body: "Cryptographic SHA-256 fingerprinting generates a tamper-evident QR verification seal, verifiable 24/7 by consular officers and immigration agents.",
    tags: ["SHA-256 Checksum", "Dynamic QR Registry", "24h Zero-Retention"],
    telemetry: [
      { label: "DIGITAL HASH", value: "SHA-256: 8F9B4D...3C21", status: "verified" },
      { label: "PUBLIC REGISTRY", value: "VERIFYLINGUA.PAGES.DEV/VERIFY", status: "active" },
      { label: "RETENTION POLICY", value: "ZERO AI RETENTION PURGE", status: "secured" },
    ],
  },
  {
    id: "accept",
    stationNumber: "05 ACCEPT",
    label: "Federal Gateway",
    eyebrow: "Stage 05 · Complete Institutional Clearance",
    title: "Institutional Acceptance Gateway",
    body: "Admissible packet delivered with guaranteed clearance across all USCIS field offices, federal immigration courts, universities, and foreign embassies.",
    tags: ["USCIS Guaranteed", "Federal Court Admissible", "Zero RFE Guarantee"],
    telemetry: [
      { label: "USCIS CLEARANCE", value: "GUARANTEED ACCEPTANCE", status: "verified" },
      { label: "LEGAL WARRANTY", value: "100% FREE REDO + FULL REFUND", status: "active" },
      { label: "DISPATCH TIME", value: "< 24 HOURS EXPEDITED", status: "secured" },
    ],
  },
];

// ─── COMPARISON MATRIX DATA ──────────────────────────────────────────────
type FilterCategory = "all" | "legal" | "speed" | "security" | "pricing";

interface MatrixRow {
  category: "legal" | "speed" | "security" | "pricing";
  feature: string;
  subtext: string;
  verifyLingua: string | boolean;
  rushTranslate: string | boolean;
  rev: string | boolean;
  generic: string | boolean;
  isPrice?: boolean;
}

const MATRIX_DATA: MatrixRow[] = [
  // Legal & Acceptance
  {
    category: "legal",
    feature: "8 CFR § 103.2(b)(3) Compliance",
    subtext: "Formal legal competence declaration with sworn translator certification",
    verifyLingua: "Guaranteed Sworn Format",
    rushTranslate: "Standard Template",
    rev: "Generic Statement",
    generic: false,
  },
  {
    category: "legal",
    feature: "ATA Corporate Member Sealed",
    subtext: "Corporate Member No. 278190 official embossed credential stamps",
    verifyLingua: true,
    rushTranslate: true,
    rev: false,
    generic: false,
  },
  {
    category: "legal",
    feature: "Tamper-Evident SHA-256 & QR Seal",
    subtext: "Immigration officers scan QR to verify original digital cryptographic hash",
    verifyLingua: true,
    rushTranslate: false,
    rev: false,
    generic: false,
  },
  {
    category: "legal",
    feature: "USCIS RFE Defense Warranty",
    subtext: "Free instant re-affidavit and legal response packet if ever questioned",
    verifyLingua: "100% Free Redo + Full Refund",
    rushTranslate: "Re-edit Only",
    rev: "No Guarantee",
    generic: false,
  },

  // Turnaround & SLA
  {
    category: "speed",
    feature: "Standard Guaranteed Turnaround",
    subtext: "Time required for certified vital records (Birth/Marriage/Court)",
    verifyLingua: "< 24 Hours Guaranteed",
    rushTranslate: "24-48 Hours Est.",
    rev: "48-72 Hours",
    generic: "3-7 Days",
    isPrice: true,
  },
  {
    category: "speed",
    feature: "Real-Time 8-Stage Telemetry",
    subtext: "Live state-machine tracker with cryptographic milestone logs",
    verifyLingua: true,
    rushTranslate: false,
    rev: false,
    generic: false,
  },
  {
    category: "speed",
    feature: "Pre-Payment Document Triage",
    subtext: "Automated scan to detect blurry seals and truncated margins before pay",
    verifyLingua: true,
    rushTranslate: false,
    rev: false,
    generic: false,
  },

  // Security & Privacy
  {
    category: "security",
    feature: "Zero AI Model Training Pledge",
    subtext: "Civil records, passports, and court exhibits are never retained for training",
    verifyLingua: "100% Zero-Retention Pledge",
    rushTranslate: "Vague Policy",
    rev: "Trained on Transcripts",
    generic: false,
  },
  {
    category: "security",
    feature: "256-Bit TLS End-to-End Vault",
    subtext: "Bank-grade cryptographic transit with ephemeral decryption",
    verifyLingua: true,
    rushTranslate: true,
    rev: true,
    generic: false,
  },

  // Pricing
  {
    category: "pricing",
    feature: "Certified Translation Rate",
    subtext: "Flat transparent cost per page (up to 250 words standard)",
    verifyLingua: "$24.95 / page",
    rushTranslate: "$24.95 / page",
    rev: "$33.00 / page",
    generic: "$45 - $90 / page",
    isPrice: true,
  },
  {
    category: "pricing",
    feature: "Notarization & Affidavit Seal",
    subtext: "Sworn notarial certificate signed under state commission",
    verifyLingua: "$19.00 / document",
    rushTranslate: "$19.95 / document",
    rev: "$25.00 / document",
    generic: "$35.00+",
    isPrice: true,
  },
];

export function ScrollWorldHero() {
  const [activeStageIndex, setActiveStageIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterCategory>("all");
  const [activeViewMode, setActiveViewMode] = useState<"diorama" | "matrix">("diorama");
  const stageIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const currentStage = DIORAMA_STAGES[activeStageIndex];

  // Auto-tour animation cycle when playing
  useEffect(() => {
    if (isPlaying) {
      stageIntervalRef.current = setInterval(() => {
        setActiveStageIndex((prev) => (prev + 1) % DIORAMA_STAGES.length);
      }, 4200);
    } else if (stageIntervalRef.current) {
      clearInterval(stageIntervalRef.current);
    }
    return () => {
      if (stageIntervalRef.current) clearInterval(stageIntervalRef.current);
    };
  }, [isPlaying]);

  const handleNextStage = () => {
    setActiveStageIndex((prev) => (prev + 1) % DIORAMA_STAGES.length);
  };

  const handlePrevStage = () => {
    setActiveStageIndex((prev) => (prev - 1 + DIORAMA_STAGES.length) % DIORAMA_STAGES.length);
  };

  const filteredRows =
    activeFilter === "all"
      ? MATRIX_DATA
      : MATRIX_DATA.filter((r) => r.category === activeFilter);

  const renderCellContent = (val: string | boolean, isHighlighted = false) => {
    if (typeof val === "boolean") {
      return val ? (
        <span
          aria-label="Supported"
          className={`inline-flex items-center justify-center w-7 h-7 rounded-full ${
            isHighlighted
              ? "bg-brand-50 text-brand-600 border border-brand-200"
              : "bg-surface-sunken text-text-muted border border-border"
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-inherit" />
        </span>
      ) : (
        <span
          aria-label="Not supported"
          className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-surface-sunken text-text-subtle/50"
        >
          <XCircle className="w-4 h-4 text-inherit" />
        </span>
      );
    }
    return (
      <span
        className={`text-xs sm:text-sm font-semibold ${
          isHighlighted ? "text-brand-600 font-bold" : "text-text"
        }`}
      >
        {val}
      </span>
    );
  };

  return (
    <section className="relative pt-12 sm:pt-20 pb-20 sm:pb-28 overflow-hidden bg-canvas">
      {/* ─── Atmospheric Cerulean Bleu Aura (Swiss & Apple lighting) ─── */}
      <div
        className="pointer-events-none absolute inset-x-0 -top-24 h-96 sm:h-[34rem] opacity-75"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 0%, rgba(219, 234, 254, 0.6) 0%, rgba(239, 246, 255, 0.4) 45%, rgba(253, 251, 247, 0) 80%)",
        }}
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 space-y-10 sm:space-y-14">
        {/* ─── Hero Main Title & Direct Action Suite ─── */}
        <div className="text-center max-w-4xl mx-auto space-y-6">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-brand-200/80 bg-brand-50/70 shadow-2xs backdrop-blur-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping motion-reduce:hidden absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500" />
            </span>
            <span className="text-xs font-sans font-bold uppercase tracking-wider text-brand-700">
              Certified Legal Translation Alternative
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-text leading-[1.08] font-display">
            Looking for a certified legal translation{" "}
            <span className="text-brand-600">
              alternative?
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl text-text-muted max-w-2xl mx-auto leading-relaxed">
            Discover why top immigration attorneys, universities, and applicants
            switch to VerifyLingua for guaranteed USCIS acceptance, tamper-proof
            seals, and under 24-hour turnaround.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-1">
            <Link href="/translate">
              <Button
                size="lg"
                className="bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm sm:text-base px-7 py-6 rounded-full shadow-md shadow-brand-500/20 transition-all hover:shadow-lg hover:shadow-brand-500/30 active:scale-[0.98] cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
              >
                <span>Start Certified Translation</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>

            <Button
              size="lg"
              variant="outline"
              onClick={() => {
                setActiveViewMode(activeViewMode === "diorama" ? "matrix" : "diorama");
              }}
              className="border-border bg-surface-raised hover:bg-surface text-text font-semibold text-sm sm:text-base px-6 py-6 rounded-full transition-all active:scale-[0.98] cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
            >
              <span>{activeViewMode === "diorama" ? "View Comparison Matrix" : "Explore 3D Diorama World"}</span>
            </Button>
          </div>

          {/* Micro Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-2 text-xs sm:text-sm font-sans text-slate-600 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-status-success shrink-0" />
              <span>USCIS 8 CFR § 103.2 Compliant</span>
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-status-success shrink-0" />
              <span>ATA Member No. 278190</span>
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-status-success shrink-0" />
              <span>100% Acceptance Guarantee</span>
            </span>
          </div>
        </div>

        {/* ─── Mode Switcher / View Tabs ─── */}
        <div className="flex justify-center">
          <div className="inline-flex p-1.5 rounded-full bg-surface-raised border border-border shadow-xs">
            <button
              onClick={() => setActiveViewMode("diorama")}
              className={`px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer flex items-center gap-2 ${
                activeViewMode === "diorama"
                  ? "bg-brand-500 text-white shadow-xs"
                  : "text-text-muted hover:text-text"
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Continuous 3D Diorama World</span>
            </button>
            <button
              onClick={() => setActiveViewMode("matrix")}
              className={`px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer flex items-center gap-2 ${
                activeViewMode === "matrix"
                  ? "bg-brand-500 text-white shadow-xs"
                  : "text-text-muted hover:text-text"
              }`}
            >
              <Scale className="w-4 h-4" />
              <span>Verification Matrix</span>
            </button>
          </div>
        </div>

        {/* ─── SECTION 1: CONTINUOUS SCROLL DIORAMA WORLD ─── */}
        {activeViewMode === "diorama" && (
          <div className="relative rounded-3xl bg-surface-raised border border-border shadow-xl shadow-slate-900/5 p-4 sm:p-6 lg:p-8 space-y-6">
            {/* Diorama Header HUD */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-border/80">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-500 animate-pulse" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-brand-600">
                    Continuous Scroll Diorama Engine
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-text font-display">
                  {currentStage.title}
                </h2>
              </div>

              {/* Station Step Selector */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none w-full md:w-auto">
                {DIORAMA_STAGES.map((stg, idx) => (
                  <button
                    key={stg.id}
                    onClick={() => {
                      setActiveStageIndex(idx);
                      setIsPlaying(false);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all duration-150 cursor-pointer whitespace-nowrap active:scale-[0.98] ${
                      activeStageIndex === idx
                        ? "bg-brand-500 text-white shadow-2xs font-bold"
                        : "bg-surface text-text-muted hover:text-text hover:bg-canvas-subtle border border-border"
                    }`}
                  >
                    {stg.stationNumber}
                  </button>
                ))}
              </div>
            </div>

            {/* 3D Diorama Stage Display */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Left/Main: Isometric Visual Diorama Window */}
              <div className="lg:col-span-7 relative h-80 sm:h-96 md:h-[26rem] rounded-2xl bg-gradient-to-b from-canvas to-surface-soft border border-border/80 overflow-hidden flex items-center justify-center p-6 shadow-inner">
                {/* 3D Perspective Canvas Background Grid */}
                <div
                  className="absolute inset-0 opacity-40 pointer-events-none"
                  style={{
                    backgroundImage:
                      "linear-gradient(to right, rgba(37,99,235,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(37,99,235,0.08) 1px, transparent 1px)",
                    backgroundSize: "28px 28px",
                  }}
                  aria-hidden="true"
                />

                {/* Animated Stage Representation */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStage.id}
                    initial={{ opacity: 0, scale: 0.92, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 1.05, y: -15 }}
                    transition={{ type: "spring", stiffness: 280, damping: 26 }}
                    className="relative z-10 w-full max-w-md"
                  >
                    {/* Stage 1: Intake Visual */}
                    {currentStage.id === "intake" && (
                      <div className="p-6 rounded-2xl bg-surface-raised border border-brand-200/80 shadow-xl space-y-4">
                        <div className="flex items-center justify-between border-b border-border pb-3">
                          <div className="flex items-center gap-2">
                            <Scan className="w-5 h-5 text-brand-500" />
                            <span className="font-mono text-xs font-bold text-text">SCAN_PORTAL_V3</span>
                          </div>
                          <Badge variant="outline" className="border-brand-500/30 text-brand-600 bg-brand-50">
                            600 DPI OK
                          </Badge>
                        </div>
                        <div className="relative h-28 rounded-xl bg-canvas border border-dashed border-brand-400/50 flex flex-col items-center justify-center p-3 text-center overflow-hidden">
                          <div className="absolute inset-x-0 top-0 h-1 bg-brand-500 shadow-sm animate-pulse" />
                          <FileText className="w-8 h-8 text-brand-600 mb-1" />
                          <p className="text-xs font-semibold text-text">Certificado de Nacimiento.pdf</p>
                          <p className="text-[10px] text-text-muted font-mono">1.4 MB · SPANISH CIVIL ARCHIVE</p>
                        </div>
                        <div className="flex justify-between items-center text-[11px] font-mono text-text-muted">
                          <span>OCR CONFIDENCE: 99.98%</span>
                          <span className="text-status-success font-bold">READY FOR RECONSTRUCTION</span>
                        </div>
                      </div>
                    )}

                    {/* Stage 2: Engine Visual */}
                    {currentStage.id === "engine" && (
                      <div className="p-5 rounded-2xl bg-surface-raised border border-brand-200/80 shadow-xl space-y-3">
                        <div className="flex items-center justify-between border-b border-border pb-2.5">
                          <div className="flex items-center gap-2">
                            <Layers className="w-5 h-5 text-brand-500" />
                            <span className="font-mono text-xs font-bold text-text">1:1 DUAL_MATRIX</span>
                          </div>
                          <Badge variant="outline" className="border-status-success/30 text-status-success bg-status-success-bg">
                            STAMP ALIGNED
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="p-3 rounded-lg bg-canvas border border-border space-y-1">
                            <span className="text-[10px] font-mono text-text-muted block">ORIGINAL (SPANISH)</span>
                            <p className="font-serif text-[11px] text-text-muted italic">«República de Colombia»</p>
                            <p className="text-[10px] font-sans text-text-subtle">Folio No. 4921-A</p>
                          </div>
                          <div className="p-3 rounded-lg bg-brand-50/60 border border-brand-200 space-y-1">
                            <span className="text-[10px] font-mono text-brand-700 block font-bold">USCIS TRANSLATION</span>
                            <p className="font-serif text-[11px] text-text font-semibold">"Republic of Colombia"</p>
                            <p className="text-[10px] font-sans text-brand-600 font-bold">Page/Folio No. 4921-A</p>
                          </div>
                        </div>
                        <div className="text-[11px] font-mono text-text-muted flex justify-between">
                          <span>GEOMETRIC ERROR: 0.00 px</span>
                          <span className="text-brand-600 font-bold">CERTIFIED ACCURATE</span>
                        </div>
                      </div>
                    )}

                    {/* Stage 3: Certify Visual */}
                    {currentStage.id === "certify" && (
                      <div className="p-6 rounded-2xl bg-surface-raised border border-brand-200/80 shadow-xl space-y-4">
                        <div className="flex items-center justify-between border-b border-border pb-3">
                          <div className="flex items-center gap-2">
                            <Stamp className="w-5 h-5 text-brand-500" />
                            <span className="font-mono text-xs font-bold text-text">ATA_JURAT_AFFIDAVIT</span>
                          </div>
                          <Badge variant="outline" className="border-brand-500/30 text-brand-600 bg-brand-50">
                            8 CFR § 103.2
                          </Badge>
                        </div>
                        <div className="p-4 rounded-xl bg-canvas border border-border space-y-2 text-xs">
                          <p className="font-sans text-[11px] text-text leading-relaxed">
                            "I, certified ATA translator No. 278190, swear under penalty of perjury that I am competent to translate from Spanish into English and that the translation is true and accurate."
                          </p>
                          <div className="pt-2 border-t border-border/80 flex items-center justify-between text-[10px] font-mono">
                            <span className="text-brand-600 font-bold">SWORN SEAL ATTACHED</span>
                            <span className="text-text-muted">NOTARIAL ID: 94104-SF</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Stage 4: Vault Visual */}
                    {currentStage.id === "vault" && (
                      <div className="p-6 rounded-2xl bg-surface-raised border border-brand-200/80 shadow-xl space-y-4">
                        <div className="flex items-center justify-between border-b border-border pb-3">
                          <div className="flex items-center gap-2">
                            <QrCode className="w-5 h-5 text-brand-500" />
                            <span className="font-mono text-xs font-bold text-text">SHA256_REGISTRY</span>
                          </div>
                          <Badge variant="outline" className="border-status-success/30 text-status-success bg-status-success-bg">
                            EDGE VERIFIED
                          </Badge>
                        </div>
                        <div className="p-3.5 rounded-xl bg-canvas border border-border flex items-center gap-4">
                          <div className="w-16 h-16 rounded-lg bg-surface-sunken border border-border flex items-center justify-center shrink-0">
                            <QrCode className="w-10 h-10 text-brand-600" />
                          </div>
                          <div className="space-y-1 text-xs">
                            <p className="font-mono text-[11px] font-bold text-text">VL-CERT-8921-XQ</p>
                            <p className="text-[10px] text-text-muted font-mono truncate max-w-[180px]">
                              SHA: 8f9b4d183c21e0...
                            </p>
                            <span className="inline-block text-[10px] font-semibold text-brand-600">
                              Instant Officer Scan Admissible
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Stage 5: Accept Visual */}
                    {currentStage.id === "accept" && (
                      <div className="p-6 rounded-2xl bg-surface-raised border border-brand-200/80 shadow-xl space-y-4">
                        <div className="flex items-center justify-between border-b border-border pb-3">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-brand-500" />
                            <span className="font-mono text-xs font-bold text-text">FEDERAL_GATEWAY</span>
                          </div>
                          <Badge variant="outline" className="border-status-success/30 text-status-success bg-status-success-bg">
                            100% ACCEPTED
                          </Badge>
                        </div>
                        <div className="space-y-2 text-xs">
                          <div className="p-2.5 rounded-lg bg-status-success-bg border border-status-success/20 flex items-center justify-between">
                            <span className="font-semibold text-text">USCIS Field Offices</span>
                            <span className="font-mono text-[11px] text-status-success font-bold">CLEARED (0 RFE)</span>
                          </div>
                          <div className="p-2.5 rounded-lg bg-status-success-bg border border-status-success/20 flex items-center justify-between">
                            <span className="font-semibold text-text">EOIR Immigration Courts</span>
                            <span className="font-mono text-[11px] text-status-success font-bold">ADMISSIBLE</span>
                          </div>
                          <div className="p-2.5 rounded-lg bg-status-success-bg border border-status-success/20 flex items-center justify-between">
                            <span className="font-semibold text-text">WES / Academic Credentials</span>
                            <span className="font-mono text-[11px] text-status-success font-bold">CERTIFIED</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* Floating Micro Controls on Canvas */}
                <div className="absolute bottom-3 inset-x-4 flex items-center justify-between z-20">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="px-3 py-1.5 rounded-full bg-surface-raised/90 backdrop-blur-md border border-border shadow-2xs text-xs font-mono font-semibold flex items-center gap-1.5 cursor-pointer hover:bg-surface text-text active:scale-[0.98]"
                    >
                      {isPlaying ? <Pause className="w-3.5 h-3.5 text-brand-500" /> : <Play className="w-3.5 h-3.5 text-brand-500" />}
                      <span>{isPlaying ? "PAUSE TOUR" : "PLAY TOUR"}</span>
                    </button>
                    <button
                      onClick={() => setActiveStageIndex(0)}
                      className="p-1.5 rounded-full bg-surface-raised/90 backdrop-blur-md border border-border shadow-2xs text-text-muted hover:text-text cursor-pointer active:scale-[0.98]"
                      title="Reset to Stage 1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handlePrevStage}
                      className="p-1.5 rounded-full bg-surface-raised/90 backdrop-blur-md border border-border shadow-2xs text-text hover:text-brand-600 cursor-pointer active:scale-[0.98]"
                      aria-label="Previous Stage"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-mono font-bold text-text-muted px-1.5">
                      {activeStageIndex + 1} / {DIORAMA_STAGES.length}
                    </span>
                    <button
                      onClick={handleNextStage}
                      className="p-1.5 rounded-full bg-surface-raised/90 backdrop-blur-md border border-border shadow-2xs text-text hover:text-brand-600 cursor-pointer active:scale-[0.98]"
                      aria-label="Next Stage"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Right: Stage Narrative & Telemetry Panel */}
              <div className="lg:col-span-5 space-y-5">
                <div className="space-y-2">
                  <span className="text-xs font-mono font-bold text-brand-600 uppercase tracking-wider block">
                    {currentStage.eyebrow}
                  </span>
                  <h3 className="text-2xl font-bold tracking-tight text-text font-display">
                    {currentStage.title}
                  </h3>
                  <p className="text-sm text-text-muted leading-relaxed">
                    {currentStage.body}
                  </p>
                </div>

                {/* Tag Pills */}
                <div className="flex flex-wrap gap-2">
                  {currentStage.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-md bg-canvas-subtle border border-border text-[11px] font-sans font-semibold text-text-subtle"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Forensic Telemetry Feed */}
                <div className="p-3.5 rounded-xl bg-canvas border border-border/80 space-y-2 font-mono text-xs">
                  <div className="text-[10px] text-text-muted uppercase tracking-wider border-b border-border/80 pb-1.5 flex items-center justify-between">
                    <span>LIVE FORENSIC TELEMETRY</span>
                    <span className="text-status-success font-bold">SYNCHRONIZED</span>
                  </div>
                  {currentStage.telemetry.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-[11px]">
                      <span className="text-text-muted">{item.label}</span>
                      <span className="font-semibold text-text">{item.value}</span>
                    </div>
                  ))}
                </div>

                {/* Direct Action for this Stage */}
                <div className="pt-2">
                  <Link href="/translate" className="w-full block">
                    <Button
                      className="w-full bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm py-5 rounded-xl shadow-xs transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>Certify Document Now</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Continuous Scrubber Rail at Bottom of Diorama */}
            <div className="pt-4 border-t border-border/80 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-text-muted">
                <span>SCROLL JOURNEY TIMELINE</span>
                <span>{Math.round(((activeStageIndex + 1) / DIORAMA_STAGES.length) * 100)}% COMPLETE</span>
              </div>
              <div className="w-full h-2 rounded-full bg-surface-sunken overflow-hidden">
                <motion.div
                  className="h-full bg-brand-500 rounded-full"
                  animate={{ width: `${((activeStageIndex + 1) / DIORAMA_STAGES.length) * 100}%` }}
                  transition={{ ease: "easeOut", duration: 0.3 }}
                />
              </div>

              {/* 5-Stage Journey Milestone Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2">
                {DIORAMA_STAGES.map((stg, idx) => (
                  <button
                    key={stg.id}
                    onClick={() => {
                      setActiveStageIndex(idx);
                      setIsPlaying(false);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all duration-150 cursor-pointer active:scale-[0.98] ${
                      activeStageIndex === idx
                        ? "bg-brand-50 border-brand-300 text-brand-900 shadow-2xs"
                        : "bg-surface border-border text-text-muted hover:text-text hover:bg-canvas-subtle"
                    }`}
                  >
                    <span className="block text-[10px] font-mono font-bold text-brand-600">
                      {stg.stationNumber}
                    </span>
                    <span className="block text-xs font-semibold text-text truncate mt-0.5">
                      {stg.title}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── SECTION 2: COMPREHENSIVE VERIFICATION MATRIX TABLE ─── */}
        <div className="relative pt-4 sm:pt-6">
          <div className="p-2 sm:p-3 rounded-2xl sm:rounded-3xl bg-surface-raised border border-border shadow-xl shadow-slate-900/5">
            <div className="bg-canvas rounded-xl sm:rounded-2xl border border-border/80 overflow-hidden">
              {/* Table Top Toolbar & Filters */}
              <div className="p-4 sm:p-6 border-b border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface/40">
                <div className="space-y-1">
                  <h3 className="text-base sm:text-lg font-bold text-text font-display flex items-center gap-2">
                    <Scale className="w-4 h-4 text-brand-500" />
                    <span>Comprehensive Verification Matrix</span>
                  </h3>
                  <p className="text-xs text-text-muted">
                    Side-by-side comparison with legacy translation bureaus and unverified tools.
                  </p>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                  {[
                    { id: "all", label: "All Features" },
                    { id: "legal", label: "Legal Acceptance" },
                    { id: "speed", label: "Speed & SLA" },
                    { id: "security", label: "Security & Privacy" },
                    { id: "pricing", label: "Pricing" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveFilter(tab.id as FilterCategory)}
                      className={`px-4 py-2 min-h-[44px] rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center justify-center focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-500 ${
                        activeFilter === tab.id
                          ? "bg-brand-500 text-white shadow-xs"
                          : "bg-surface-raised text-text-muted hover:text-text border border-border"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Responsive Table Container */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-surface-soft/60 text-xs font-semibold text-text-muted uppercase tracking-wider font-sans">
                      <th className="py-4 px-4 sm:px-6 w-2/5">Feature Specification</th>
                      <th className="py-4 px-4 sm:px-6 w-1/5 bg-brand-50/70 border-x border-brand-200/80 text-brand-700 font-bold">
                        <div className="flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-brand-600 shrink-0" />
                          <span>VerifyLingua</span>
                        </div>
                      </th>
                      <th className="py-4 px-4 sm:px-6 w-1/5">RushTranslate</th>
                      <th className="py-4 px-4 sm:px-6 w-1/5">Rev</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/80 text-sm">
                    {filteredRows.map((row, idx) => (
                      <tr
                        key={idx}
                        className="hover:bg-surface-raised/80 transition-colors"
                      >
                        {/* Feature column */}
                        <td className="py-4 px-4 sm:px-6 align-middle">
                          <div className="space-y-0.5">
                            <span className="font-semibold text-text block">
                              {row.feature}
                            </span>
                            <span className="text-xs text-text-muted leading-relaxed block">
                              {row.subtext}
                            </span>
                          </div>
                        </td>

                        {/* VerifyLingua (Highlighted Column) */}
                        <td className="py-4 px-4 sm:px-6 align-middle bg-brand-50/40 border-x border-brand-200/60">
                          {renderCellContent(row.verifyLingua, true)}
                        </td>

                        {/* RushTranslate */}
                        <td className="py-4 px-4 sm:px-6 align-middle text-text-muted">
                          {renderCellContent(row.rushTranslate, false)}
                        </td>

                        {/* Rev */}
                        <td className="py-4 px-4 sm:px-6 align-middle text-text-muted">
                          {renderCellContent(row.rev, false)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Table Bottom Action Footer */}
              <div className="p-4 sm:p-6 bg-surface/50 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs text-text-muted">
                  <ShieldCheck className="w-4 h-4 text-status-success shrink-0" />
                  <span>All certified translations backed by 100% USCIS acceptance warranty.</span>
                </div>
                <Link href="/translate">
                  <Button
                    size="sm"
                    className="bg-brand-500 hover:bg-brand-600 text-white font-semibold text-xs px-5 py-2.5 rounded-full shadow-2xs transition-all active:scale-[0.98] cursor-pointer"
                  >
                    <span>Start Your Translation</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
