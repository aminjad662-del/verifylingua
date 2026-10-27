"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  ShieldCheck, 
  ArrowRight, 
  QrCode, 
  CheckCircle2, 
  Lock, 
  Clock, 
  Scale,
  Landmark,
  GraduationCap,
  Copy,
  Check,
  UploadCloud,
  FileCheck2,
  Layers,
  ChevronRight,
  ShieldAlert,
  SlidersHorizontal,
  BadgeCheck
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface JurisdictionInfo {
  id: string;
  name: string;
  agency: string;
  statute: string;
  spec: string;
  sla: string;
  affidavitWording: string;
}

const JURISDICTIONS: JurisdictionInfo[] = [
  {
    id: "uscis",
    name: "USCIS Immigration Petitions",
    agency: "U.S. Citizenship & Immigration Services",
    statute: "8 CFR § 103.2(b)(3)",
    spec: "Mandatory Sworn Translator Competence Affidavit",
    sla: "Under 24 Hours Guaranteed",
    affidavitWording: "I certify that I am competent to translate from the foreign language into English, and that the translation is true and accurate to the best of my abilities.",
  },
  {
    id: "eoir",
    name: "EOIR Immigration Courts",
    agency: "Executive Office for Immigration Review",
    statute: "EOIR Practice Manual § 3.3(a)",
    spec: "Court-Admissible Jurat & Line-Numbered Folios",
    sla: "Priority Same-Day Dispatch",
    affidavitWording: "Sworn under penalty of perjury under the laws of the United States. Admissible in federal removal and asylum proceedings.",
  },
  {
    id: "consular",
    name: "U.S. Consular Posts & Embassies",
    agency: "Department of State / Consular Affairs",
    statute: "9 FAM 502.1 / DS-260 Guidelines",
    spec: "Apostille & Civil Registry Verification",
    sla: "Under 24 Hours Worldwide",
    affidavitWording: "Certified corporate linguist affidavit accepted across all U.S. Embassies, Consulates, and National Visa Center (NVC) filings.",
  },
  {
    id: "academic",
    name: "Academic Credentials & WES",
    agency: "NACES & AICE Evaluators",
    statute: "WES Document Submission Policy",
    spec: "Grade Mark Sheet & Syllabus 1:1 Layout",
    sla: "Under 24 Hours",
    affidavitWording: "Certified academic transcript and diploma translation formatted to preserve original university grading scales and seals.",
  },
];

export function SovereignLegalConsole() {
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<string>("uscis");
  const [activeStageMode, setActiveStageMode] = useState<"physical" | "overlay" | "ledger">("physical");
  const [activePin, setActivePin] = useState<number | null>(null);
  const [hashCopied, setHashCopied] = useState(false);
  const [simulatedCheck, setSimulatedCheck] = useState(false);

  const currentJurisdiction = JURISDICTIONS.find((j) => j.id === selectedJurisdiction) || JURISDICTIONS[0];

  const INSPECTION_PINS = [
    {
      id: 1,
      x: "36%",
      y: "40%",
      label: "Foreign Registry Folio",
      detail: "Civil Registry stamp and marginal annotations typeset 1:1 at exact millimeter coordinates",
    },
    {
      id: 2,
      x: "64%",
      y: "62%",
      label: "Consular Identification Match",
      detail: "Passport MRZ name-locked to prevent USCIS petitioner identity rejection",
    },
    {
      id: 3,
      x: "76%",
      y: "26%",
      label: "Statutory Competence Jurat",
      detail: "Sworn affidavit signed by ATA corporate linguist under penalty of perjury",
    },
  ];

  const copyHash = () => {
    navigator.clipboard?.writeText("7d4a98f1c830b201a4e89b210459c31e89b21d01");
    setHashCopied(true);
    setTimeout(() => setHashCopied(false), 2000);
  };

  return (
    <div className="w-full bg-canvas text-text">
      
      {/* ─── 1. TOP STATUTORY JURISDICTION BAR ─── */}
      <div className="border-b border-border bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 py-2.5 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-court-emerald animate-pulse shrink-0" />
              <span className="font-mono text-[11px] text-text-muted">STATUTORY FILING TARGET:</span>
              <span className="font-semibold text-brand-ink">{currentJurisdiction.name}</span>
            </div>

            {/* Jurisdiction Switcher Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              {JURISDICTIONS.map((j) => (
                <button
                  key={j.id}
                  onClick={() => setSelectedJurisdiction(j.id)}
                  className={`px-3 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all cursor-pointer ${
                    selectedJurisdiction === j.id
                      ? "bg-brand-600 text-white shadow-2xs font-semibold"
                      : "text-text-muted hover:text-brand-ink hover:bg-surface-raised"
                  }`}
                >
                  {j.id === "uscis" && "USCIS"}
                  {j.id === "eoir" && "EOIR Courts"}
                  {j.id === "consular" && "Consulates"}
                  {j.id === "academic" && "WES / Academic"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── 2. THE SOVEREIGN DOCKET & INTAKE HERO ─── */}
      <section className="relative pt-8 pb-16 sm:pt-14 sm:pb-24 border-b border-border">
        {/* Subtle architectural hairline grid background */}
        <div 
          className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
            backgroundSize: "32px 32px"
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            
            {/* Left Column: Authoritative Legal Copy & Intake Hub */}
            <div className="lg:col-span-6 space-y-7 text-left">
              
              {/* Institutional Accreditation Pill */}
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-border bg-surface-raised text-text-muted text-xs font-medium shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                <span className="font-mono text-[11px] text-text-subtle">ATA Corporate Member No. 278190</span>
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                <span className="font-mono text-[11px] text-court-emerald font-semibold">{currentJurisdiction.statute}</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-[3.35rem] font-bold tracking-tight text-brand-ink leading-[1.08] font-display">
                Certified Legal Translations for Federal Adjudication
              </h1>

              {/* Subheadline (under 20 words per taste-skill) */}
              <p className="text-base sm:text-lg text-text-muted leading-relaxed max-w-xl">
                Sworn translator competence affidavits, 1:1 coordinate typesetting, and cryptographic verification accepted by all immigration judges and consular posts.
              </p>

              {/* Live Statutory Specification Notice */}
              <div className="p-4 rounded-xl bg-surface border border-border/80 space-y-1.5 text-xs">
                <div className="flex items-center justify-between font-mono text-[10px] text-text-subtle">
                  <span>JURISDICTION REQUIREMENT</span>
                  <span className="text-brand-600 font-bold">{currentJurisdiction.agency}</span>
                </div>
                <div className="font-semibold text-brand-ink text-xs">
                  {currentJurisdiction.spec}
                </div>
                <p className="text-[11px] text-text-muted font-serif italic">
                  "{currentJurisdiction.affidavitWording}"
                </p>
              </div>

              {/* Interactive Direct Intake & Commercial Bar */}
              <div className="space-y-3 pt-1">
                <div className="p-5 rounded-2xl bg-surface-raised border border-border shadow-xs space-y-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-brand-ink text-sm">Instant Certified Intake</span>
                    <span className="font-mono text-xs font-bold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-lg border border-brand-200">
                      $24.95 / standard page
                    </span>
                  </div>

                  {/* Drag-and-Drop Intake Dropzone */}
                  <Link
                    href="/order/triage"
                    className="flex flex-col items-center justify-center p-6 rounded-xl border border-dashed border-border hover:border-brand-500 bg-surface/60 hover:bg-brand-50/30 transition-all text-center group cursor-pointer"
                  >
                    <UploadCloud className="w-8 h-8 text-brand-600 group-hover:scale-110 transition-transform mb-2" />
                    <span className="text-xs font-bold text-brand-ink group-hover:text-brand-600 transition-colors">
                      Upload Foreign Civil Record (PDF, JPG, PNG)
                    </span>
                    <span className="text-[11px] text-text-muted mt-0.5">
                      Birth certificate, marriage act, passport, or academic transcript
                    </span>
                  </Link>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                    <Link
                      href="/order/triage"
                      className="flex-1 h-11 px-5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition-transform active:scale-[0.98]"
                    >
                      <span>Proceed to certified triage</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                      href="/counsel"
                      className="h-11 px-4 rounded-xl border border-border bg-surface hover:bg-surface-warm text-text font-semibold text-xs flex items-center justify-center gap-1.5 transition-transform active:scale-[0.98]"
                    >
                      <Scale className="w-3.5 h-3.5 text-brand-600" />
                      <span>Law firm portal</span>
                    </Link>
                  </div>
                </div>

                {/* Micro Institutional Guarantees */}
                <div className="grid grid-cols-3 gap-2 text-[11px] text-text-muted pt-1">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-status-success shrink-0" />
                    <span>Acceptance Warranty</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-status-success shrink-0" />
                    <span>{currentJurisdiction.sla}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-status-success shrink-0" />
                    <span>Ephemeral Vault</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: The Living Legal Inspection Docket */}
            <div className="lg:col-span-6">
              <div className="rounded-2xl border border-border bg-surface-raised shadow-xl overflow-hidden text-left">
                
                {/* Docket Chrome Header */}
                <div className="h-12 px-4 bg-surface border-b border-border flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                    <span className="font-mono text-xs text-text-muted ml-1.5 font-medium truncate">
                      Docket No. VL-8492-CERT.pdf
                    </span>
                  </div>

                  {/* Mode Selector */}
                  <div className="flex items-center gap-1 bg-surface-raised p-0.5 rounded-lg border border-border">
                    <button
                      onClick={() => setActiveStageMode("physical")}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                        activeStageMode === "physical"
                          ? "bg-brand-600 text-white shadow-2xs"
                          : "text-text-muted hover:text-brand-ink"
                      }`}
                    >
                      Physical Exhibit
                    </button>
                    <button
                      onClick={() => setActiveStageMode("overlay")}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                        activeStageMode === "overlay"
                          ? "bg-brand-600 text-white shadow-2xs"
                          : "text-text-muted hover:text-brand-ink"
                      }`}
                    >
                      1:1 Typeset
                    </button>
                    <button
                      onClick={() => setActiveStageMode("ledger")}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                        activeStageMode === "ledger"
                          ? "bg-brand-600 text-white shadow-2xs"
                          : "text-text-muted hover:text-brand-ink"
                      }`}
                    >
                      Audit Ledger
                    </button>
                  </div>
                </div>

                {/* Stage Screen */}
                <div className="relative min-h-[440px] bg-canvas flex flex-col justify-between overflow-hidden">
                  
                  {activeStageMode === "physical" && (
                    <div className="relative w-full h-[440px] bg-neutral-900 overflow-hidden">
                      <Image
                        src="/images/auth-desk-legal.jpg"
                        alt="Authentic sworn foreign civil record, consular passport, and legal translation jurat"
                        fill
                        priority
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="object-cover object-center brightness-[0.92] contrast-[1.05]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

                      {/* Interactive Pulsing Coordinate Pins */}
                      {INSPECTION_PINS.map((pin) => (
                        <div
                          key={pin.id}
                          className="absolute z-20"
                          style={{ left: pin.x, top: pin.y }}
                        >
                          <button
                            onClick={() => setActivePin(activePin === pin.id ? null : pin.id)}
                            className="relative flex items-center justify-center w-6 h-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-600 text-white border-2 border-white shadow-lg cursor-pointer hover:scale-125 transition-transform"
                            aria-label={pin.label}
                          >
                            <span className="w-2 h-2 rounded-full bg-white animate-ping absolute inset-0 m-auto" />
                            <span className="w-2 h-2 rounded-full bg-white relative z-10" />
                          </button>

                          {/* Pin Tooltip Popover */}
                          <AnimatePresence>
                            {activePin === pin.id && (
                              <motion.div
                                initial={{ opacity: 0, y: 6, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 4, scale: 0.95 }}
                                transition={{ duration: 0.15 }}
                                className="absolute left-1/2 -translate-x-1/2 top-8 w-60 p-3 rounded-xl bg-surface-raised border border-border shadow-xl text-left z-30"
                              >
                                <div className="text-[10px] font-mono font-bold text-brand-600 uppercase">
                                  COORDINATE INSPECTION
                                </div>
                                <div className="text-xs font-bold text-brand-ink mt-0.5">
                                  {pin.label}
                                </div>
                                <div className="text-[11px] text-text-muted mt-1 leading-snug">
                                  {pin.detail}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}

                      {/* Bottom Banner */}
                      <div className="absolute bottom-3 left-4 right-4 z-10 flex items-center justify-between text-white text-xs">
                        <div className="flex items-center gap-2">
                          <BadgeCheck className="w-4 h-4 text-emerald-400" />
                          <span className="font-medium text-[11px]">Mexican Vital Record + Passport MRZ Verified</span>
                        </div>
                        <span className="font-mono text-[10px] bg-black/60 backdrop-blur px-2 py-0.5 rounded border border-white/20">
                          300 DPI ALIGNED
                        </span>
                      </div>
                    </div>
                  )}

                  {activeStageMode === "overlay" && (
                    <div className="p-6 space-y-4 text-xs h-[440px] overflow-y-auto">
                      <div className="flex items-center justify-between text-[11px] font-mono text-text-subtle">
                        <span>1:1 COORDINATE MAPPING ENGINE</span>
                        <span className="text-status-success font-bold">ZERO STRUCTURAL DRIFT</span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-left">
                        {/* Foreign Record Box */}
                        <div className="p-3.5 rounded-xl bg-surface border border-border space-y-2">
                          <div className="flex items-center justify-between font-mono text-[10px]">
                            <span className="text-text-subtle">SPANISH SOURCE</span>
                            <span className="text-amber-700 font-bold">ACTA CIVIL</span>
                          </div>
                          <div className="font-serif text-[11px] text-text-muted border-l-2 border-amber-500/40 pl-2 space-y-0.5">
                            <div className="font-bold text-brand-ink text-[11px]">ACTA DE NACIMIENTO</div>
                            <div>Registrado: Sofia Isabel Morales</div>
                            <div>Folio Registro: 9842-A</div>
                            <div>Fecha: 14 Mayo 2024</div>
                          </div>
                          <div className="text-[10px] font-mono text-text-subtle pt-1">
                            Physical Seal at (X:142, Y:890)
                          </div>
                        </div>

                        {/* Certified Translation Box */}
                        <div className="p-3.5 rounded-xl bg-brand-50/50 border border-brand-200 space-y-2">
                          <div className="flex items-center justify-between font-mono text-[10px]">
                            <span className="text-brand-700">CERTIFIED ENGLISH</span>
                            <span className="text-status-success font-bold flex items-center gap-0.5">
                              <CheckCircle2 className="w-3 h-3" />
                              LOCKED
                            </span>
                          </div>
                          <div className="font-sans text-[11px] text-text-muted border-l-2 border-brand-500/60 pl-2 space-y-0.5">
                            <div className="font-bold text-brand-ink text-[11px]">BIRTH CERTIFICATE</div>
                            <div>Registered: Sofia Isabel Morales</div>
                            <div>Registry Folio: 9842-A</div>
                            <div>Date: May 14, 2024</div>
                          </div>
                          <div className="text-[10px] font-mono text-brand-700 pt-1">
                            Exact Geometry at 300 DPI
                          </div>
                        </div>
                      </div>

                      {/* Statutory Declaration Jurat */}
                      <div className="p-3.5 rounded-xl bg-surface border border-border text-[11px] space-y-1.5">
                        <div className="font-bold text-brand-ink flex items-center justify-between text-xs">
                          <span>8 CFR § 103.2(b)(3) Competence Statement</span>
                          <span className="font-mono text-[10px] text-brand-600">ATA No. 278190</span>
                        </div>
                        <p className="text-text-muted font-serif italic leading-relaxed">
                          "I, certified translator for the American Translators Association, hereby certify that I am fluent in Spanish and English and that the above translation is true and accurate to the best of my knowledge."
                        </p>
                      </div>
                    </div>
                  )}

                  {activeStageMode === "ledger" && (
                    <div className="p-6 space-y-4 text-xs h-[440px] flex flex-col justify-between">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between font-mono text-[11px]">
                          <span className="text-text-subtle">PUBLIC VERIFICATION LEDGER</span>
                          <span className="font-bold text-status-success bg-status-success/10 px-2 py-0.5 rounded border border-status-success/30">
                            {simulatedCheck ? "BLOCK NO. 8492 CONFIRMED" : "IMMUTABLE DIGEST"}
                          </span>
                        </div>

                        {/* Hash Display */}
                        <div className="p-3.5 rounded-xl bg-surface border border-border font-mono text-[11px] text-text-muted space-y-1">
                          <div className="text-[10px] text-text-subtle">SHA-256 DOCUMENT CHECKSUM</div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="truncate text-brand-ink font-bold">
                              7d4a98f1c830b201a4e89b210459c31e89b21d01
                            </span>
                            <button
                              onClick={copyHash}
                              className="p-1 rounded hover:bg-surface-raised text-text-muted hover:text-brand-ink transition-colors cursor-pointer shrink-0"
                              title="Copy SHA-256 digest"
                            >
                              {hashCopied ? <Check className="w-3.5 h-3.5 text-status-success" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>

                        {/* QR Verification Proof */}
                        <div className="p-3.5 rounded-xl bg-surface border border-border flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-surface-raised border border-border flex items-center justify-center text-brand-600 shrink-0">
                            <QrCode className="w-6 h-6" />
                          </div>
                          <div className="text-left space-y-0.5 min-w-0">
                            <div className="font-bold text-brand-ink text-xs">Adjudicator Instant QR Verification</div>
                            <div className="text-[11px] text-text-muted truncate">
                              Route: verifylingua.pages.dev/verify/VL-CERT-8921
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Simulation Trigger */}
                      <div className="pt-2 border-t border-border flex items-center justify-between text-[11px]">
                        <span className="flex items-center gap-1.5 text-text-subtle">
                          <Lock className="w-3.5 h-3.5 text-status-success" />
                          Zero-knowledge client proof
                        </span>
                        <button
                          onClick={() => setSimulatedCheck(!simulatedCheck)}
                          className="font-bold text-brand-600 hover:text-brand-700 cursor-pointer active:scale-[0.98] transition-transform"
                        >
                          {simulatedCheck ? "Reset verification" : "Simulate consular QR check"}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Docket Footer Status */}
                  <div className="h-10 px-4 bg-surface border-t border-border flex items-center justify-between text-[11px] text-text-subtle">
                    <span className="flex items-center gap-1.5 font-mono">
                      <Lock className="w-3 h-3 text-status-success" />
                      Statutory Ephemeral Vault
                    </span>
                    <Link
                      href="/verify"
                      className="font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                    >
                      <span>Public verification portal</span>
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>

                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── 3. CONTINUOUS ARCHITECTURAL LEGAL MATRIX (NO BOXED BENTO CARDS) ─── */}
      <section className="border-b border-border bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 space-y-12 text-left">
          
          <div className="max-w-3xl space-y-3">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-brand-ink font-display">
              Four Pillars of Federal Translation Admissibility
            </h2>
            <p className="text-base text-text-muted leading-relaxed">
              Engineered without generic marketing filler. Every civil record is typeset to match original coordinates, certified under penalty of perjury, and cryptographically anchored against fraud.
            </p>
          </div>

          {/* Continuous Hairline Matrix: 4 Pillars with 1px dividers */}
          <div className="border border-border rounded-2xl bg-surface-raised overflow-hidden divide-y lg:divide-y-0 lg:divide-x divide-border grid grid-cols-1 lg:grid-cols-4">
            
            {/* Pillar 1 */}
            <div className="p-6 sm:p-7 space-y-4">
              <div className="w-9 h-9 rounded-xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-600">
                <Layers className="w-4 h-4" />
              </div>
              <div className="space-y-1.5">
                <span className="font-mono text-[10px] text-text-subtle uppercase">PILLAR 01</span>
                <h3 className="text-base font-bold text-brand-ink">
                  1:1 Layout & Coordinate Preservation
                </h3>
              </div>
              <p className="text-xs text-text-muted leading-relaxed">
                Adjudicators cross-reference original documents by eye. We preserve exact table columns, stamps, signatures, and registry folios so officers never question omitted clauses.
              </p>
              <div className="pt-2 font-mono text-[11px] text-brand-600 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-status-success" />
                <span>300 DPI Resolution Lock</span>
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="p-6 sm:p-7 space-y-4">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-700">
                <Scale className="w-4 h-4" />
              </div>
              <div className="space-y-1.5">
                <span className="font-mono text-[10px] text-text-subtle uppercase">PILLAR 02</span>
                <h3 className="text-base font-bold text-brand-ink">
                  8 CFR § 103.2 Sworn Competence Jurat
                </h3>
              </div>
              <p className="text-xs text-text-muted leading-relaxed">
                Every packet includes a sworn legal declaration of translator fluency, formal competence statement, and official ATA corporate seal accepted in federal tribunals nationwide.
              </p>
              <div className="pt-2 font-mono text-[11px] text-amber-800 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-status-success" />
                <span>ATA Member No. 278190</span>
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="p-6 sm:p-7 space-y-4">
              <div className="w-9 h-9 rounded-xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-600">
                <QrCode className="w-4 h-4" />
              </div>
              <div className="space-y-1.5">
                <span className="font-mono text-[10px] text-text-subtle uppercase">PILLAR 03</span>
                <h3 className="text-base font-bold text-brand-ink">
                  Tamper-Evident SHA-256 QR Seal
                </h3>
              </div>
              <p className="text-xs text-text-muted leading-relaxed">
                Immigration officers scan the embedded QR code to verify the immutable cryptographic digest against our public ledger, eliminating document tampering concerns.
              </p>
              <div className="pt-2 font-mono text-[11px] text-brand-600 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-status-success" />
                <span>Public Ledger Verification</span>
              </div>
            </div>

            {/* Pillar 4 */}
            <div className="p-6 sm:p-7 space-y-4 bg-brand-900 text-white relative overflow-hidden">
              <div className="relative z-10 space-y-4">
                <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-emerald-400">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div className="space-y-1.5">
                  <span className="font-mono text-[10px] text-white/60 uppercase">PILLAR 04</span>
                  <h3 className="text-base font-bold text-white">
                    Acceptance Warranty & RFE Defense
                  </h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  If USCIS, an immigration court, or an academic evaluator issues an inquiry regarding our translation, our senior legal staff drafts and dispatches a free supplemental response packet within 4 hours.
                </p>
                <div className="pt-2 font-mono text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                  <BadgeCheck className="w-3.5 h-3.5" />
                  <span>Free 4-Hour Supplemental Jurat</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

    </div>
  );
}
