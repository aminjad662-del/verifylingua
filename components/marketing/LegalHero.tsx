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
  FileText, 
  Clock, 
  Layers, 
  Scale,
  Sparkles,
  Camera,
  Maximize2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export function LegalHero() {
  const [activeView, setActiveView] = useState<"physical" | "translated" | "ledger">("physical");
  const [activePin, setActivePin] = useState<number | null>(null);

  const INSPECTION_PINS = [
    {
      id: 1,
      x: "38%",
      y: "42%",
      label: "Mexican Birth Certificate Folio",
      detail: "Civil Registry stamp & handwritten marginal notations 1:1 preserved",
    },
    {
      id: 2,
      x: "62%",
      y: "65%",
      label: "Consular Identification",
      detail: "Passport MRZ name-locked to prevent USCIS identity mismatch",
    },
    {
      id: 3,
      x: "78%",
      y: "28%",
      label: "Official Notarial Jurat",
      detail: "Sworn 8 CFR § 103.2 translator competence declaration",
    },
  ];

  return (
    <section className="relative pt-6 pb-16 sm:pt-12 sm:pb-20 overflow-hidden bg-canvas border-b border-border">
      {/* Subtle fine architectural hairline grid */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
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
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-border bg-surface-raised text-text-muted text-xs font-medium shadow-xs">
              <span className="flex h-2 w-2 rounded-full bg-court-emerald animate-pulse" />
              <span>USCIS 8 CFR § 103.2(b)(3) Compliance • ATA Member No. 278190</span>
            </div>

            {/* Main Headline (2 lines max desktop per taste-skill) */}
            <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold tracking-tight text-brand-ink leading-[1.06] font-display">
              Certified Legal Translations for USCIS and Federal Courts
            </h1>

            {/* Subtitle (under 20 words per taste-skill) */}
            <p className="text-base sm:text-lg text-text-muted leading-relaxed max-w-xl">
              Sworn translator competence affidavits, 1:1 format preservation, and cryptographic verification accepted by all immigration judges and consular posts.
            </p>

            {/* Primary & Secondary CTAs */}
            <div className="flex flex-wrap items-center gap-3.5 pt-1">
              <Link
                href="/translate"
                className="h-12 px-6 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-xs transition-all duration-150 active:scale-[0.98] cursor-pointer"
              >
                <span>Start certified translation</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/counsel"
                className="h-12 px-5 rounded-xl border border-border bg-surface-raised hover:bg-surface text-text font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-150 active:scale-[0.98] cursor-pointer"
              >
                <Scale className="w-4 h-4 text-brand-600" />
                <span>Institutional law firm portal</span>
              </Link>
            </div>

            {/* Core Institutional Guarantees */}
            <div className="pt-4 border-t border-border grid grid-cols-3 gap-3 text-xs text-text-muted">
              <div className="space-y-0.5">
                <div className="font-semibold text-brand-ink flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-status-success shrink-0" />
                  <span>Guaranteed Acceptance</span>
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

          {/* Right Column: Physical & Digital Documentary Inspection Docket */}
          <div className="lg:col-span-6">
            <div className="rounded-2xl border border-border bg-surface-raised shadow-xl overflow-hidden transition-all">
              
              {/* Docket Control Bar */}
              <div className="h-12 px-4 bg-surface border-b border-border flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                  <span className="text-xs font-mono font-medium text-text-muted ml-1.5">
                    Docket No. VL-8492-CERT.pdf
                  </span>
                </div>

                {/* View Switcher Tabs */}
                <div className="flex items-center gap-1 bg-surface-raised p-0.5 rounded-lg border border-border">
                  <button
                    onClick={() => setActiveView("physical")}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                      activeView === "physical"
                        ? "bg-brand-600 text-white shadow-xs"
                        : "text-text-muted hover:text-brand-ink"
                    }`}
                  >
                    Physical Exhibit
                  </button>
                  <button
                    onClick={() => setActiveView("translated")}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                      activeView === "translated"
                        ? "bg-brand-600 text-white shadow-xs"
                        : "text-text-muted hover:text-brand-ink"
                    }`}
                  >
                    1:1 Translation
                  </button>
                  <button
                    onClick={() => setActiveView("ledger")}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                      activeView === "ledger"
                        ? "bg-brand-600 text-white shadow-xs"
                        : "text-text-muted hover:text-brand-ink"
                    }`}
                  >
                    Audit Ledger
                  </button>
                </div>
              </div>

              {/* Document Interactive Stage */}
              <div className="relative min-h-[420px] bg-canvas flex flex-col justify-between overflow-hidden">
                
                <AnimatePresence mode="wait">
                  {/* View 1: Physical Authentic Photography Exhibit */}
                  {activeView === "physical" && (
                    <motion.div
                      key="physical"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="relative h-[420px] w-full"
                    >
                      <Image
                        src="/images/auth-desk-legal.jpg"
                        alt="Authentic certified translation document with Mexican birth certificate and passport on executive oak desk"
                        fill
                        priority
                        className="object-cover object-center"
                        sizes="(max-width: 1024px) 100vw, 50vw"
                      />
                      {/* Subtle gradient overlay to keep text legible */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/30 pointer-events-none" />

                      {/* Overlaid Coordinate Inspection Pins */}
                      {INSPECTION_PINS.map((pin) => (
                        <div
                          key={pin.id}
                          style={{ left: pin.x, top: pin.y }}
                          className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
                        >
                          <button
                            onClick={() => setActivePin(activePin === pin.id ? null : pin.id)}
                            className="relative flex items-center justify-center w-7 h-7 rounded-full bg-white text-brand-ink shadow-lg border-2 border-brand-500 cursor-pointer hover:scale-110 active:scale-95 transition-transform"
                            title={pin.label}
                          >
                            <span className="w-2.5 h-2.5 rounded-full bg-brand-600" />
                          </button>

                          {activePin === pin.id && (
                            <motion.div
                              initial={{ opacity: 0, y: 4, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-56 p-2.5 rounded-xl bg-surface-raised border border-border shadow-xl text-left z-30 text-xs"
                            >
                              <div className="font-bold text-brand-ink text-[11px] leading-tight">
                                {pin.label}
                              </div>
                              <div className="text-[10px] text-text-muted mt-0.5 leading-snug">
                                {pin.detail}
                              </div>
                            </motion.div>
                          )}
                        </div>
                      ))}

                      {/* Bottom Overlay Label */}
                      <div className="absolute bottom-4 left-4 right-4 z-10 flex items-center justify-between text-white text-xs">
                        <div className="space-y-0.5">
                          <div className="font-bold text-sm text-white flex items-center gap-1.5">
                            <Camera className="w-4 h-4 text-brand-300" />
                            <span>Physical Exhibit Examination</span>
                          </div>
                          <p className="text-[11px] text-white/80">
                            Mexican Civil Vital Record • Passport MRZ • ATA Jurat
                          </p>
                        </div>
                        <div className="px-2.5 py-1 rounded-md bg-white/20 backdrop-blur-md border border-white/30 text-[10px] font-mono uppercase tracking-wider text-white">
                          Live Sample
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* View 2: Certified Translation Document Body */}
                  {activeView === "translated" && (
                    <motion.div
                      key="translated"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.15 }}
                      className="p-5 sm:p-6 space-y-4 text-left"
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
                              Member ID: No. 278190 • Sworn Certification of Fluency
                            </div>
                          </div>
                        </div>
                        <div className="text-[10px] font-mono font-bold text-amber-900 dark:text-amber-300 px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/30">
                          SEALED
                        </div>
                      </div>

                      {/* Notarial Document Body */}
                      <div className="p-4 rounded-xl bg-surface-raised border border-border space-y-3 text-xs">
                        <div className="border-b border-border pb-2 flex justify-between items-start">
                          <div>
                            <div className="font-bold text-brand-ink uppercase tracking-wider text-[11px]">
                              Certified Translation of Birth Record
                            </div>
                            <div className="text-[10px] text-text-subtle font-mono">
                              Issuing Authority: Civil Registry of Mexico City • Folio No. 8492-C
                            </div>
                          </div>
                          <span className="text-[10px] font-mono bg-court-emerald/10 text-court-emerald px-2 py-0.5 rounded font-semibold">
                            8 CFR § 103.2
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-[11px]">
                          <div>
                            <span className="text-text-subtle block text-[10px] uppercase font-mono">Full Legal Name</span>
                            <span className="font-semibold text-brand-ink">CAMILA SOFIA VALENCIA MENDOZA</span>
                          </div>
                          <div>
                            <span className="text-text-subtle block text-[10px] uppercase font-mono">Date & Place of Birth</span>
                            <span className="font-semibold text-brand-ink">14 OCTOBER 1994 • CDMX</span>
                          </div>
                          <div>
                            <span className="text-text-subtle block text-[10px] uppercase font-mono">Father&apos;s Name</span>
                            <span className="text-text-muted">CARLOS VALENCIA ORTIZ</span>
                          </div>
                          <div>
                            <span className="text-text-subtle block text-[10px] uppercase font-mono">Mother&apos;s Name</span>
                            <span className="text-text-muted">ELENA MENDOZA SALGADO</span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-border flex items-center justify-between text-[10px] text-text-subtle font-mono">
                          <span>Signatures & Notary Stamps: Authenticated 1:1</span>
                          <span className="text-status-success font-semibold">Ready for USCIS</span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* View 3: Cryptographic Audit Seal */}
                  {activeView === "ledger" && (
                    <motion.div
                      key="ledger"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.15 }}
                      className="p-5 sm:p-6 space-y-4 text-left"
                    >
                      <div className="p-4 rounded-xl bg-surface-raised border border-border space-y-3 font-mono text-xs">
                        <div className="flex items-center justify-between border-b border-border pb-2">
                          <span className="text-text-subtle text-[10px]">CERTIFICATE LEDGER RECORD</span>
                          <span className="text-status-success text-[10px] font-bold bg-status-success/10 px-2 py-0.5 rounded border border-status-success/30">
                            IMMUTABLE
                          </span>
                        </div>

                        <div className="space-y-1.5 text-[11px]">
                          <div className="flex justify-between">
                            <span className="text-text-subtle">Certificate Code:</span>
                            <span className="font-bold text-brand-ink">VL-CERT-8492-USCIS</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-text-subtle">ATA Corporate Accreditation:</span>
                            <span className="text-text">Member No. 278190</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-text-subtle">Timestamp of Sworn Seal:</span>
                            <span className="text-text">2026-10-27T11:40:00Z</span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-border space-y-1">
                          <span className="text-[10px] text-text-subtle block">SHA-256 Digest:</span>
                          <div className="p-2 rounded bg-surface border border-border text-[10px] text-brand-ink break-all select-all font-mono">
                            7d4a98f1c830b201a4e89b210459c31e89b21d01f82e04d7c81a942b8219c04a
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-text-subtle pt-1">
                          <span className="flex items-center gap-1 text-court-emerald">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Federal Evidentiary Rule 902(11) Self-Authenticating
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Sub-Docket Verification Strip */}
                <div className="p-3 bg-surface border-t border-border flex items-center justify-between text-xs font-mono text-text-muted">
                  <span className="flex items-center gap-1.5 text-[11px]">
                    <Lock className="w-3 h-3 text-status-success" />
                    Zero-Knowledge Privacy Vault
                  </span>
                  <Link
                    href="/verify"
                    className="text-[11px] font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 transition-colors"
                  >
                    <span>Inspect verification ledger</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
