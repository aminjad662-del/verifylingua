"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  ShieldCheck, 
  ArrowRight, 
  QrCode, 
  CheckCircle2, 
  Lock, 
  FileCheck2, 
  Scale, 
  Building2,
  FileText
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export function LegalHero() {
  const [activeView, setActiveView] = useState<"translated" | "source" | "ledger">("translated");

  return (
    <section className="relative pt-8 pb-16 sm:pt-14 sm:pb-24 overflow-hidden bg-canvas border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Column: Authoritative Editorial Copy */}
          <div className="lg:col-span-6 space-y-6 text-left">
            {/* Regulatory Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-surface shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-text-muted">
                8 CFR § 103.2(b)(3) Compliant · ATA No. 278190
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-5xl font-extrabold tracking-tight text-brand-ink leading-[1.12]">
              Certified Legal Translations for USCIS and Federal Courts
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-text-muted leading-relaxed max-w-xl">
              Sworn translator competence affidavits, 1:1 format preservation, and cryptographic verification accepted by all immigration judges and consular posts.
            </p>

            {/* Direct Action CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/order/triage"
                className="h-11 px-6 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <span>Start Certified Translation</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/verify"
                className="h-11 px-5 rounded-xl border border-border bg-surface hover:bg-surface-raised text-text font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <QrCode className="w-4 h-4 text-text-muted" />
                <span>Verify Document Seal</span>
              </Link>
            </div>

            {/* Institutional Acceptance Indicators */}
            <div className="pt-4 border-t border-border grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-text-muted">
              <div className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-status-success shrink-0" />
                <span>100% USCIS Acceptance</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-status-success shrink-0" />
                <span>Under 24-Hour Delivery</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium col-span-2 sm:col-span-1">
                <CheckCircle2 className="w-4 h-4 text-status-success shrink-0" />
                <span>Free RFE Legal Defense</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Document Inspector */}
          <div className="lg:col-span-6">
            <div className="rounded-2xl border border-border bg-surface-raised shadow-lg overflow-hidden">
              {/* Document Header & State Switcher */}
              <div className="h-12 px-4 bg-surface border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                  <span className="text-xs font-mono font-medium text-text-muted ml-2">
                    Matter #VL-8492-CERT.pdf
                  </span>
                </div>

                <div className="flex items-center gap-1 bg-surface-raised p-0.5 rounded-lg border border-border">
                  <button
                    onClick={() => setActiveView("translated")}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                      activeView === "translated"
                        ? "bg-brand-600 text-white shadow-xs"
                        : "text-text-muted hover:text-brand-ink"
                    }`}
                  >
                    Translation
                  </button>
                  <button
                    onClick={() => setActiveView("source")}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                      activeView === "source"
                        ? "bg-brand-600 text-white shadow-xs"
                        : "text-text-muted hover:text-brand-ink"
                    }`}
                  >
                    Original Record
                  </button>
                  <button
                    onClick={() => setActiveView("ledger")}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                      activeView === "ledger"
                        ? "bg-brand-600 text-white shadow-xs"
                        : "text-text-muted hover:text-brand-ink"
                    }`}
                  >
                    Audit Seal
                  </button>
                </div>
              </div>

              {/* Document Paper Preview */}
              <div className="p-6 bg-canvas min-h-[380px] flex flex-col justify-between">
                <AnimatePresence mode="wait">
                  {activeView === "translated" && (
                    <motion.div
                      key="translated"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.15 }}
                      className="space-y-4"
                    >
                      {/* Certified Header Banner */}
                      <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold text-xs">
                            ATA
                          </div>
                          <div>
                            <div className="text-xs font-bold text-amber-950">
                              American Translators Association Corporate Member
                            </div>
                            <div className="text-[10px] font-mono text-amber-800">
                              Member ID: No. 278190 · Sworn Certification of Fluency
                            </div>
                          </div>
                        </div>
                        <div className="text-[10px] font-mono font-bold text-amber-900 px-2 py-0.5 rounded bg-amber-100 border border-amber-300">
                          SEALED
                        </div>
                      </div>

                      {/* Document Body Sample */}
                      <div className="p-4 rounded-xl bg-surface-raised border border-border space-y-3 text-xs">
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
                            <span className="text-text-subtle block text-[10px] uppercase font-mono">Full Name</span>
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
                          &quot;I hereby certify that I am fluent in Spanish and English, and that the above is a true and accurate translation of the attached foreign civil record.&quot;
                        </div>
                      </div>

                      {/* Verification Digest */}
                      <div className="flex items-center justify-between text-[11px] font-mono text-text-subtle px-1">
                        <span className="flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-status-success" />
                          SHA-256: 7d4a98f1c8...e89b21
                        </span>
                        <span className="text-status-success font-semibold">
                          Tamper Proof Certified
                        </span>
                      </div>
                    </motion.div>
                  )}

                  {activeView === "source" && (
                    <motion.div
                      key="source"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.15 }}
                      className="space-y-4"
                    >
                      <div className="p-3 rounded-xl bg-surface border border-border flex items-center justify-between text-xs">
                        <span className="font-semibold text-text">Original Scanned Civil Document (ES)</span>
                        <span className="font-mono text-[10px] text-text-muted">Resolution: 300 DPI</span>
                      </div>

                      <div className="p-5 rounded-xl bg-surface-raised border border-border space-y-3 font-serif text-slate-700 text-xs">
                        <div className="text-center border-b border-border pb-2">
                          <div className="font-bold tracking-widest uppercase text-[10px] text-slate-500">
                            ESTADOS UNIDOS MEXICANOS
                          </div>
                          <div className="font-bold text-sm text-slate-800">
                            ACTA DE NACIMIENTO
                          </div>
                          <div className="text-[10px] text-slate-500">
                            Oficina del Registro Civil No. 04 · Guadalajara, Jalisco
                          </div>
                        </div>

                        <div className="space-y-1.5 text-[11px] leading-relaxed">
                          <p>
                            En la ciudad de Guadalajara, a catorce de Octubre de mil novecientos noventa y cuatro, ante mi compareció Carlos Alberto Rodriguez para registrar el nacimiento de:
                          </p>
                          <p className="font-bold text-slate-900">
                            MARIA SOFIA RODRIGUEZ NAVARRO
                          </p>
                          <p className="text-[10px] text-slate-500 pt-1">
                            Sello Oficial del Registro Civil y firma del Oficial Registrador delegatorio.
                          </p>
                        </div>
                      </div>

                      <div className="text-xs text-text-muted flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-brand-600" />
                        <span>Source format parsed and calibrated for 1:1 coordinate matching.</span>
                      </div>
                    </motion.div>
                  )}

                  {activeView === "ledger" && (
                    <motion.div
                      key="ledger"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.15 }}
                      className="space-y-3 font-mono text-xs"
                    >
                      <div className="p-3 rounded-xl bg-surface border border-border flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <QrCode className="w-4 h-4 text-brand-600" />
                          <span className="font-bold text-brand-ink">Digital Certification Audit Ledger</span>
                        </div>
                        <span className="text-[10px] font-bold text-status-success bg-green-50 px-2 py-0.5 rounded border border-green-200">
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
                          <span className="font-bold text-brand-ink">278190</span>
                        </div>
                        <div className="flex justify-between border-b border-border pb-1.5">
                          <span className="text-text-subtle">Document SHA-256</span>
                          <span className="text-text truncate max-w-[180px]">7d4a98f1c830b201...e89b21</span>
                        </div>
                        <div className="flex justify-between border-b border-border pb-1.5">
                          <span className="text-text-subtle">Statutory Declaration</span>
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
