"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  ShieldCheck, 
  ArrowRight, 
  QrCode, 
  CheckCircle2, 
  Lock, 
  FileText, 
  BadgeCheck, 
  Clock, 
  Layers, 
  Scale,
  Sparkles,
  Search
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export function LegalHero() {
  const [activeView, setActiveView] = useState<"translated" | "source" | "ledger">("translated");
  const [inspectCoordinates, setInspectCoordinates] = useState(false);

  return (
    <section className="relative pt-6 pb-16 sm:pt-12 sm:pb-20 overflow-hidden bg-canvas border-b border-border">
      {/* Subtle fine architectural hairline grid */}
      <div 
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
          backgroundSize: "32px 32px"
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left Column: Authoritative Editorial Copy */}
          <div className="lg:col-span-6 space-y-6 text-left">
            {/* Regulatory Accreditation Marker */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-border bg-surface text-text-muted text-xs font-medium shadow-xs">
              <span className="flex h-2 w-2 rounded-full bg-court-emerald" />
              <span>USCIS 8 CFR § 103.2(b)(3) · ATA Member No. 278190</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold tracking-tight text-brand-ink leading-[1.06]">
              Certified Legal Translations for USCIS and Federal Courts
            </h1>

            {/* Subtitle (max 20 words as per taste-skill) */}
            <p className="text-base sm:text-lg text-text-muted leading-relaxed max-w-xl">
              Sworn translator competence affidavits, 1:1 format preservation, and cryptographic verification accepted by all immigration judges and consular posts.
            </p>

            {/* Primary & Secondary CTAs */}
            <div className="flex flex-wrap items-center gap-3.5 pt-1">
              <Link
                href="/order/triage"
                className="h-12 px-6 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-xs transition-all duration-150 active:scale-[0.98] cursor-pointer"
              >
                <span>Start certified translation</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/verify"
                className="h-12 px-5 rounded-xl border border-border bg-surface hover:bg-surface-raised text-text font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-150 active:scale-[0.98] cursor-pointer"
              >
                <QrCode className="w-4 h-4 text-text-muted" />
                <span>Verify document seal</span>
              </Link>
            </div>

            {/* Core Institutional Guarantees */}
            <div className="pt-4 border-t border-border grid grid-cols-3 gap-3 text-xs text-text-muted">
              <div className="space-y-0.5">
                <div className="font-semibold text-brand-ink flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-status-success shrink-0" />
                  <span>100% Acceptance</span>
                </div>
                <div className="text-[11px] text-text-subtle">USCIS & federal courts</div>
              </div>

              <div className="space-y-0.5">
                <div className="font-semibold text-brand-ink flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-status-success shrink-0" />
                  <span>Under 24 Hours</span>
                </div>
                <div className="text-[11px] text-text-subtle">Standard turnaround</div>
              </div>

              <div className="space-y-0.5">
                <div className="font-semibold text-brand-ink flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-status-success shrink-0" />
                  <span>RFE Defense</span>
                </div>
                <div className="text-[11px] text-text-subtle">Free 4-hour re-affidavit</div>
              </div>
            </div>
          </div>

          {/* Right Column: Physical/Digital Legal Docket Preview */}
          <div className="lg:col-span-6">
            <div className="rounded-2xl border border-border bg-surface-raised shadow-lg overflow-hidden transition-all">
              
              {/* Docket Control Bar */}
              <div className="h-12 px-4 bg-surface border-b border-border flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                  <span className="text-xs font-mono font-medium text-text-muted ml-1.5">
                    Docket #VL-8492-CERT.pdf
                  </span>
                </div>

                {/* View Switcher Tabs */}
                <div className="flex items-center gap-1 bg-surface-raised p-0.5 rounded-lg border border-border">
                  <button
                    onClick={() => setActiveView("translated")}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                      activeView === "translated"
                        ? "bg-brand-600 text-white shadow-xs"
                        : "text-text-muted hover:text-brand-ink"
                    }`}
                  >
                    Certified Translation
                  </button>
                  <button
                    onClick={() => setActiveView("source")}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                      activeView === "source"
                        ? "bg-brand-600 text-white shadow-xs"
                        : "text-text-muted hover:text-brand-ink"
                    }`}
                  >
                    Original Record
                  </button>
                  <button
                    onClick={() => setActiveView("ledger")}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                      activeView === "ledger"
                        ? "bg-brand-600 text-white shadow-xs"
                        : "text-text-muted hover:text-brand-ink"
                    }`}
                  >
                    Audit Seal
                  </button>
                </div>
              </div>

              {/* Document Interactive Stage */}
              <div className="p-5 sm:p-6 bg-canvas min-h-[410px] flex flex-col justify-between relative">
                
                <AnimatePresence mode="wait">
                  {/* View 1: Certified Translation Document */}
                  {activeView === "translated" && (
                    <motion.div
                      key="translated"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.15 }}
                      className="space-y-4 text-left"
                    >
                      {/* Certified Header Ribbon */}
                      <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                            ATA
                          </div>
                          <div>
                            <div className="text-xs font-bold text-amber-950 dark:text-amber-200">
                              American Translators Association Corporate Member
                            </div>
                            <div className="text-[10px] font-mono text-amber-800 dark:text-amber-400">
                              Member ID: No. 278190 · Sworn Certification of Fluency
                            </div>
                          </div>
                        </div>
                        <div className="text-[10px] font-mono font-bold text-amber-900 dark:text-amber-300 px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/30">
                          SEALED
                        </div>
                      </div>

                      {/* Notarial Document Body */}
                      <div className="p-4 rounded-xl bg-surface-raised border border-border space-y-3 text-xs relative">
                        {inspectCoordinates && (
                          <div className="absolute inset-0 bg-brand-500/5 border-2 border-dashed border-brand-500/30 rounded-xl pointer-events-none flex items-center justify-center">
                            <span className="text-[10px] font-mono text-brand-600 bg-surface px-2 py-0.5 rounded border border-brand-200 shadow-xs">
                              Coordinate Anchor: X:180 Y:420 (Preserved)
                            </span>
                          </div>
                        )}

                        <div className="border-b border-border pb-2 flex justify-between items-start">
                          <div>
                            <div className="font-bold text-brand-ink uppercase tracking-wider text-[11px]">
                              Certified Translation of Birth Record
                            </div>
                            <div className="text-text-muted text-[10px]">
                              Jurisdiction: Civil Registry of Guadalajara, Jalisco, Mexico
                            </div>
                          </div>
                          <div className="text-right font-mono text-[10px] text-text-subtle">
                            Folio: 0948-B
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 py-1 text-[11px]">
                          <div>
                            <span className="text-text-subtle block text-[10px] uppercase font-mono">Full Legal Name</span>
                            <span className="font-semibold text-brand-ink">Maria Sofia Rodriguez Navarro</span>
                          </div>
                          <div>
                            <span className="text-text-subtle block text-[10px] uppercase font-mono">Date of Registration</span>
                            <span className="font-semibold text-brand-ink">October 14, 1994</span>
                          </div>
                          <div>
                            <span className="text-text-subtle block text-[10px] uppercase font-mono">Parent 1 (Father)</span>
                            <span className="font-medium text-text">Carlos Alberto Rodriguez Mendez</span>
                          </div>
                          <div>
                            <span className="text-text-subtle block text-[10px] uppercase font-mono">Parent 2 (Mother)</span>
                            <span className="font-medium text-text">Elena Navarro Gutierrez</span>
                          </div>
                        </div>

                        <div className="p-2.5 rounded-lg bg-surface border border-border text-[11px] text-text-muted italic">
                          &quot;I hereby certify that I am competent in Spanish and English, and that the above is a true and accurate translation of the attached foreign civil record.&quot;
                        </div>
                      </div>

                      {/* Verification Digest */}
                      <div className="flex items-center justify-between text-[11px] font-mono text-text-subtle px-1 pt-1">
                        <span className="flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-status-success" />
                          <span>SHA-256: 7d4a98f1c8...e89b21</span>
                        </span>
                        <button
                          onClick={() => setInspectCoordinates(!inspectCoordinates)}
                          className="flex items-center gap-1 text-[10px] font-semibold text-brand-600 hover:text-brand-700 cursor-pointer"
                        >
                          <Search className="w-3 h-3" />
                          <span>{inspectCoordinates ? "Hide Coordinates" : "Inspect Layout Coordinates"}</span>
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* View 2: Original Record (Spanish Civil Scan) */}
                  {activeView === "source" && (
                    <motion.div
                      key="source"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.15 }}
                      className="space-y-4 text-left"
                    >
                      <div className="p-3 rounded-xl bg-surface border border-border flex items-center justify-between text-xs">
                        <span className="font-semibold text-text">Original Scanned Foreign Record (ES)</span>
                        <span className="font-mono text-[10px] text-text-muted">Resolution: 300 DPI Validated</span>
                      </div>

                      <div className="p-5 rounded-xl bg-surface-raised border border-border space-y-3 font-serif text-slate-800 dark:text-slate-200 text-xs">
                        <div className="text-center border-b border-border pb-2.5">
                          <div className="font-bold tracking-widest uppercase text-[10px] text-slate-500">
                            ESTADOS UNIDOS MEXICANOS
                          </div>
                          <div className="font-bold text-sm text-slate-900 dark:text-slate-100">
                            ACTA DE NACIMIENTO
                          </div>
                          <div className="text-[10px] text-slate-500">
                            Oficina del Registro Civil No. 04 · Guadalajara, Jalisco
                          </div>
                        </div>

                        <div className="space-y-2 text-[11px] leading-relaxed">
                          <p>
                            En la ciudad de Guadalajara, a catorce de Octubre de mil novecientos noventa y cuatro, ante mi compareció Carlos Alberto Rodriguez para registrar el nacimiento de:
                          </p>
                          <p className="font-bold text-slate-950 dark:text-slate-50">
                            MARIA SOFIA RODRIGUEZ NAVARRO
                          </p>
                          <p className="text-[10px] text-slate-500 pt-1">
                            Sello Oficial del Registro Civil y firma delegatoria certificada.
                          </p>
                        </div>
                      </div>

                      <div className="text-xs text-text-muted flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-brand-600" />
                        <span>Source format parsed and calibrated for 1:1 coordinate matching.</span>
                      </div>
                    </motion.div>
                  )}

                  {/* View 3: Cryptographic Audit Ledger */}
                  {activeView === "ledger" && (
                    <motion.div
                      key="ledger"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.15 }}
                      className="space-y-3.5 font-mono text-xs text-left"
                    >
                      <div className="p-3 rounded-xl bg-surface border border-border flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <QrCode className="w-4 h-4 text-brand-600" />
                          <span className="font-bold text-brand-ink">Digital Certification Audit Ledger</span>
                        </div>
                        <span className="text-[10px] font-bold text-status-success bg-status-success/10 px-2 py-0.5 rounded border border-status-success/30">
                          VALIDATED
                        </span>
                      </div>

                      <div className="p-4 rounded-xl bg-surface-raised border border-border space-y-2 text-[11px] leading-relaxed">
                        <div className="flex justify-between border-b border-border pb-1.5">
                          <span className="text-text-subtle">Digital Certificate ID</span>
                          <span className="font-bold text-brand-ink">VL-2026-USCIS-8492</span>
                        </div>
                        <div className="flex justify-between border-b border-border pb-1.5">
                          <span className="text-text-subtle">ATA Member Number</span>
                          <span className="font-bold text-brand-ink">No. 278190</span>
                        </div>
                        <div className="flex justify-between border-b border-border pb-1.5">
                          <span className="text-text-subtle">Document SHA-256</span>
                          <span className="text-text truncate max-w-[180px]">7d4a98f1c830b201...e89b21</span>
                        </div>
                        <div className="flex justify-between border-b border-border pb-1.5">
                          <span className="text-text-subtle">Statutory Rule</span>
                          <span className="text-text">8 CFR § 103.2(b)(3)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-subtle">Adjudicator Verification</span>
                          <span className="text-status-success font-semibold">Active Public Endpoint</span>
                        </div>
                      </div>

                      <p className="text-[10px] text-text-subtle">
                        Government adjudicators scan the embedded QR code to confirm original digital hashes in real time.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}