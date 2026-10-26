"use client";

import React, { useState, useRef } from "react";
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
  ExternalLink,
  Copy,
  Check,
  Crosshair,
  Sparkles,
  Award
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export function LegalHero() {
  const [activeView, setActiveView] = useState<"translated" | "source" | "ledger">("translated");
  const [copiedHash, setCopiedHash] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0, show: false });
  const docRef = useRef<HTMLDivElement>(null);

  const handleCopyHash = () => {
    navigator.clipboard.writeText("7d4a98f1c830b201a4e89b210459c31e89b21d0194481fa73e0474bb2e189871");
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!docRef.current) return;
    const rect = docRef.current.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);
    setMousePos({ x, y, show: true });
  };

  return (
    <section className="relative pt-10 pb-20 sm:pt-16 sm:pb-28 overflow-hidden bg-canvas border-b border-border/80">
      {/* Precision architectural hairline background grid */}
      <div 
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
          backgroundSize: "48px 48px"
        }}
      />

      {/* Subtle warm radial ambiance in the background (no cheesy purples, purely warm paper/bone tones) */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[420px] pointer-events-none opacity-40"
        style={{
          background: "radial-gradient(ellipse at 50% 0%, var(--parchment-50) 0%, transparent 75%)"
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          
          {/* Left Column: Authoritative Editorial Hierarchy */}
          <div className="lg:col-span-6 space-y-7 text-left">
            
            {/* Regulatory Credential Badge */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-border bg-surface-raised shadow-xs hover:border-brand-500/30 transition-colors">
              <span className="flex h-2 w-2 rounded-full bg-court-emerald animate-pulse" />
              <span className="text-[11px] font-mono font-semibold tracking-wide text-text-muted">
                GOVERNING STATUTE · 8 CFR § 103.2(b)(3) COMPLIANT
              </span>
              <span className="w-1 h-1 rounded-full bg-border" />
              <span className="text-[11px] font-mono font-bold text-amber-700 dark:text-amber-400">
                ATA NO. 278190
              </span>
            </div>

            {/* Main Editorial Headline */}
            <div className="space-y-3">
              <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold tracking-tight text-brand-ink leading-[1.06]">
                Certified Legal Translations <br className="hidden sm:inline" />
                for <span className="font-serif italic font-normal text-brand-700">USCIS</span> and Federal Courts
              </h1>
              <p className="text-base sm:text-lg text-text-muted leading-relaxed max-w-xl">
                Sworn translator competence affidavits, 1:1 coordinate format preservation, and cryptographic verification accepted by all immigration judges, consular officers, and university credential evaluators.
              </p>
            </div>

            {/* Direct Action CTAs with tactile Emil Kowalski physics */}
            <div className="flex flex-wrap items-center gap-3.5 pt-1">
              <Link
                href="/order/triage"
                className="h-12 px-7 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm flex items-center justify-center gap-2.5 shadow-sm transition-all duration-150 active:scale-[0.975] cursor-pointer group"
              >
                <span>Start Certified Translation</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/verify"
                className="h-12 px-6 rounded-xl border border-border bg-surface-raised hover:bg-surface text-text font-semibold text-sm flex items-center justify-center gap-2.5 shadow-2xs transition-all duration-150 active:scale-[0.975] cursor-pointer"
              >
                <QrCode className="w-4 h-4 text-brand-600" />
                <span>Verify Document Seal</span>
              </Link>
            </div>

            {/* Institutional Acceptance Indicators (Crisp tactile pills) */}
            <div className="pt-4 border-t border-border/80 grid grid-cols-2 sm:grid-cols-3 gap-3.5 text-xs text-text-muted">
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-court-emerald shrink-0" />
                <span>100% USCIS Acceptance</span>
              </div>
              <div className="flex items-center gap-2 font-medium">
                <Clock className="w-4 h-4 text-court-emerald shrink-0" />
                <span>Under 24-Hour Delivery</span>
              </div>
              <div className="flex items-center gap-2 font-medium col-span-2 sm:col-span-1">
                <ShieldCheck className="w-4 h-4 text-court-emerald shrink-0" />
                <span>Free 4-Hour RFE Defense</span>
              </div>
            </div>

          </div>

          {/* Right Column: Physical-Digital Notarial Docket Inspector */}
          <div className="lg:col-span-6">
            <div className="relative rounded-2xl border border-border-strong/70 bg-surface-raised shadow-lg overflow-hidden transition-all duration-200">
              
              {/* Window Header / Docket Title Bar */}
              <div className="h-12 px-4 bg-surface border-b border-border flex items-center justify-between select-none">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-border-strong/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-border-strong/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-border-strong/60" />
                  <span className="text-xs font-mono font-medium text-text-muted ml-2">
                    DOCKET #VL-8492-USCIS · CERTIFIED
                  </span>
                </div>

                {/* State Lens Switcher */}
                <div className="flex items-center gap-1 bg-surface-raised p-0.5 rounded-lg border border-border">
                  <button
                    onClick={() => setActiveView("translated")}
                    className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                      activeView === "translated"
                        ? "bg-brand-600 text-white shadow-xs"
                        : "text-text-muted hover:text-brand-ink"
                    }`}
                  >
                    Certified Translation
                  </button>
                  <button
                    onClick={() => setActiveView("source")}
                    className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                      activeView === "source"
                        ? "bg-brand-600 text-white shadow-xs"
                        : "text-text-muted hover:text-brand-ink"
                    }`}
                  >
                    Source Record
                  </button>
                  <button
                    onClick={() => setActiveView("ledger")}
                    className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                      activeView === "ledger"
                        ? "bg-brand-600 text-white shadow-xs"
                        : "text-text-muted hover:text-brand-ink"
                    }`}
                  >
                    Cryptographic Seal
                  </button>
                </div>
              </div>

              {/* Interactive Document Body with Coordinate Tracking */}
              <div 
                ref={docRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={() => setMousePos(prev => ({ ...prev, show: false }))}
                className="relative p-6 sm:p-7 bg-canvas min-h-[430px] flex flex-col justify-between"
              >
                {/* Floating Coordinate Inspector Tooltip on hover */}
                {mousePos.show && activeView === "translated" && (
                  <div 
                    className="absolute pointer-events-none z-30 px-2.5 py-1 rounded-md bg-obsidian-900/95 text-white border border-white/15 text-[10px] font-mono shadow-md backdrop-blur-xs flex items-center gap-2 transform -translate-x-1/2 -translate-y-9"
                    style={{ left: mousePos.x, top: mousePos.y }}
                  >
                    <Crosshair className="w-3 h-3 text-court-emerald" />
                    <span>COORD X:{mousePos.x} Y:{mousePos.y} · 1:1 MATCH</span>
                  </div>
                )}

                <AnimatePresence mode="wait">
                  {/* View 1: Certified Legal Translation Document */}
                  {activeView === "translated" && (
                    <motion.div
                      key="translated"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }}
                      className="space-y-4"
                    >
                      {/* ATA Corporate Member Header Banner */}
                      <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                            ATA
                          </div>
                          <div>
                            <div className="text-xs font-bold text-amber-950 dark:text-amber-200">
                              American Translators Association Corporate Member
                            </div>
                            <div className="text-[10px] font-mono text-amber-800 dark:text-amber-400">
                              Member No. 278190 · Sworn Certification of Fluency
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/20 border border-amber-500/35 text-[10px] font-mono font-bold text-amber-900 dark:text-amber-300">
                          <Award className="w-3 h-3 text-amber-600" />
                          <span>SEALED</span>
                        </div>
                      </div>

                      {/* Notarial Record Body */}
                      <div className="p-4 rounded-xl bg-surface-raised border border-border space-y-3.5 text-xs">
                        <div className="border-b border-border pb-2.5 flex justify-between items-start">
                          <div>
                            <div className="font-bold text-brand-ink uppercase tracking-wider text-[11px]">
                              Certified Translation of Birth Record
                            </div>
                            <div className="text-text-muted text-[10px]">
                              Jurisdiction: Civil Registry of Guadalajara, Jalisco, Mexico
                            </div>
                          </div>
                          <div className="text-right font-mono text-[10px] text-text-subtle">
                            Folio: 0948-B · Page 1 of 1
                          </div>
                        </div>

                        {/* Structured Civil Metadata */}
                        <div className="grid grid-cols-2 gap-3.5 py-1 text-[11px]">
                          <div>
                            <span className="text-text-subtle block text-[10px] uppercase font-mono">Registered Subject</span>
                            <span className="font-bold text-brand-ink">Maria Sofia Rodriguez Navarro</span>
                          </div>
                          <div>
                            <span className="text-text-subtle block text-[10px] uppercase font-mono">Registration Date</span>
                            <span className="font-semibold text-brand-ink">October 14, 1994</span>
                          </div>
                          <div>
                            <span className="text-text-subtle block text-[10px] uppercase font-mono">Father / Parent 1</span>
                            <span className="font-medium text-text">Carlos Alberto Rodriguez Mendez</span>
                          </div>
                          <div>
                            <span className="text-text-subtle block text-[10px] uppercase font-mono">Mother / Parent 2</span>
                            <span className="font-medium text-text">Elena Navarro Gutierrez</span>
                          </div>
                        </div>

                        {/* Sworn Affidavit Clause */}
                        <div className="p-3 rounded-lg bg-surface border border-border/80 text-[11px] text-text-muted italic leading-relaxed">
                          &quot;I hereby certify that I am fluent in Spanish and English, and that the above is a true, complete, and accurate translation of the attached foreign civil record.&quot;
                        </div>
                      </div>

                      {/* Cryptographic Tamper-Proof Footer Bar */}
                      <div className="flex items-center justify-between text-[11px] font-mono text-text-subtle pt-1 px-1">
                        <span className="flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-court-emerald" />
                          <span>SHA-256: 7d4a98f1c8...e89b21</span>
                        </span>
                        <span className="text-court-emerald font-semibold flex items-center gap-1">
                          <BadgeCheck className="w-3.5 h-3.5" />
                          Tamper Proof Certified
                        </span>
                      </div>
                    </motion.div>
                  )}

                  {/* View 2: High-Resolution Foreign Civil Scan */}
                  {activeView === "source" && (
                    <motion.div
                      key="source"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }}
                      className="space-y-4"
                    >
                      <div className="p-3 rounded-xl bg-surface border border-border flex items-center justify-between text-xs">
                        <span className="font-semibold text-text">Original Scanned Foreign Record (ES)</span>
                        <span className="font-mono text-[10px] text-text-muted">Resolution: 300 DPI · Vector OCR</span>
                      </div>

                      <div className="p-5 rounded-xl bg-surface-raised border border-border space-y-3 font-serif text-slate-800 dark:text-slate-200 text-xs">
                        <div className="text-center border-b border-border pb-2.5">
                          <div className="font-bold tracking-widest uppercase text-[10px] text-slate-500">
                            ESTADOS UNIDOS MEXICANOS
                          </div>
                          <div className="font-bold text-base text-slate-900 dark:text-slate-100 mt-0.5">
                            ACTA DE NACIMIENTO
                          </div>
                          <div className="text-[10px] text-slate-500 font-sans mt-0.5">
                            Oficina del Registro Civil No. 04 · Guadalajara, Jalisco
                          </div>
                        </div>

                        <div className="space-y-2 text-[11px] leading-relaxed">
                          <p>
                            En la ciudad de Guadalajara, a catorce de Octubre de mil novecientos noventa y cuatro, ante mi compareció Carlos Alberto Rodriguez para registrar el nacimiento de:
                          </p>
                          <p className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                            MARIA SOFIA RODRIGUEZ NAVARRO
                          </p>
                          <p className="text-[10px] text-slate-500 pt-1 font-sans">
                            Sello Oficial del Registro Civil y firma autógrafa del Oficial Registrador delegatorio.
                          </p>
                        </div>
                      </div>

                      <div className="text-xs text-text-muted flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-brand-600" />
                        <span>Source format parsed and calibrated for 1:1 coordinate matching.</span>
                      </div>
                    </motion.div>
                  )}

                  {/* View 3: Cryptographic Public Audit Ledger */}
                  {activeView === "ledger" && (
                    <motion.div
                      key="ledger"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }}
                      className="space-y-3.5 font-mono text-xs"
                    >
                      <div className="p-3 rounded-xl bg-surface border border-border flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <QrCode className="w-4 h-4 text-brand-600" />
                          <span className="font-bold text-brand-ink">Digital Certification Audit Ledger</span>
                        </div>
                        <span className="text-[10px] font-bold text-court-emerald bg-court-emerald/10 px-2 py-0.5 rounded border border-court-emerald/30">
                          IMMUTABLE
                        </span>
                      </div>

                      <div className="p-4 rounded-xl bg-surface-raised border border-border space-y-2.5 text-[11px] leading-relaxed">
                        <div className="flex justify-between border-b border-border pb-1.5">
                          <span className="text-text-subtle">Digital Certificate ID</span>
                          <span className="font-bold text-brand-ink">VL-2026-USCIS-8492</span>
                        </div>
                        <div className="flex justify-between border-b border-border pb-1.5">
                          <span className="text-text-subtle">ATA Member Number</span>
                          <span className="font-bold text-brand-ink">No. 278190</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-border pb-1.5">
                          <span className="text-text-subtle">Document SHA-256</span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-text truncate max-w-[140px] sm:max-w-[200px]">
                              7d4a98f1c830b201...e89b21
                            </span>
                            <button
                              onClick={handleCopyHash}
                              className="p-1 rounded hover:bg-surface text-text-muted hover:text-brand-ink transition-colors cursor-pointer"
                              title="Copy SHA-256 Digest"
                            >
                              {copiedHash ? <Check className="w-3.5 h-3.5 text-court-emerald" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                        <div className="flex justify-between border-b border-border pb-1.5">
                          <span className="text-text-subtle">Statutory Standard</span>
                          <span className="text-text">8 CFR § 103.2(b)(3)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-subtle">Adjudicator Verification</span>
                          <span className="text-court-emerald font-semibold">Active Public Endpoint</span>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-lg bg-surface border border-border flex items-center justify-between text-[10px]">
                        <span className="text-text-muted">
                          Official adjudicators verify original records at:
                        </span>
                        <Link 
                          href="/verify" 
                          className="font-bold text-brand-600 hover:text-brand-500 flex items-center gap-1"
                        >
                          <span>/verify</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
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