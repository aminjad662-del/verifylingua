"use client";

import * as React from "react";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ShieldCheck,
  CheckCircle2,
  Stamp,
  Award,
  QrCode,
  Lock,
  FileText,
  Sparkles,
  Layers,
  ArrowRight,
} from "lucide-react";
import { SPRING_MICRO } from "@/lib/motion";

type TabId = "civil" | "affidavit" | "consular";

interface TabItem {
  id: TabId;
  label: string;
  flag: string;
  badge: string;
}

const TABS: TabItem[] = [
  { id: "civil", label: "Civil Record", flag: "🇲🇽", badge: "Acta de Nacimiento" },
  { id: "affidavit", label: "ATA Affidavit", flag: "📜", badge: "8 CFR § 103.2" },
  { id: "consular", label: "Consular Node", flag: "🛡️", badge: "SHA-256 Sealed" },
];

export function HeroInteractiveCard() {
  const [activeTab, setActiveTab] = useState<TabId>("civil");
  const [showTranslated, setShowTranslated] = useState(true);

  return (
    <div className="relative w-full max-w-lg mx-auto">
      {/* Runey-style Floating Glassmorphic Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative rounded-[32px] bg-white/95 backdrop-blur-xl border border-zinc-200/90 shadow-[0_24px_70px_-15px_rgba(16,185,129,0.18),0_12px_32px_-6px_rgba(0,0,0,0.06)] overflow-hidden p-6 sm:p-7 text-left"
      >
        {/* Card Header: Node Status & Legal Standard */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-zinc-950 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-zinc-950">VerifyLingua Vault</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <p className="text-[10px] font-mono text-zinc-400">USCIS 8 CFR § 103.2 Verified</p>
            </div>
          </div>

          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-mono font-bold">
            <CheckCircle2 className="w-3 h-3" />
            <span>100% Admissible</span>
          </div>
        </div>

        {/* Interactive Runey-style Pill Tabs */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-zinc-100/90 rounded-2xl my-4 text-xs font-medium border border-zinc-200/60">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`relative py-2 px-2 rounded-xl text-center transition-colors cursor-pointer ${
                  isActive ? "text-zinc-950 font-semibold" : "text-zinc-500 hover:text-zinc-900"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="heroTabIndicator"
                    className="absolute inset-0 bg-white rounded-xl shadow-xs border border-zinc-200/70"
                    transition={SPRING_MICRO}
                  />
                )}
                <span className="relative z-10 flex items-center justify-center gap-1 truncate text-[11px]">
                  <span>{tab.flag}</span>
                  <span className="truncate">{tab.label}</span>
                </span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Panels */}
        <div className="min-h-[250px] relative">
          <AnimatePresence mode="wait">
            {activeTab === "civil" && (
              <motion.div
                key="civil-tab"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={SPRING_MICRO}
                className="space-y-3"
              >
                {/* Before/After Toggle Pill */}
                <div className="flex items-center justify-between pb-2 border-b border-zinc-100 text-xs">
                  <span className="text-[11px] font-mono uppercase text-zinc-400 tracking-wider">
                    Mexican Birth Certificate
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowTranslated(!showTranslated)}
                    className="px-2.5 py-1 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-[10px] font-mono font-medium transition-colors flex items-center gap-1.5"
                  >
                    <span>{showTranslated ? "🇺🇸 English Certified" : "🇲🇽 Spanish Original"}</span>
                    <span className="text-zinc-400">⇄</span>
                  </button>
                </div>

                {/* Document Preview Snippet */}
                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase">
                      {showTranslated ? "CIVIL REGISTRY • STATE OF JALISCO" : "REGISTRO CIVIL DEL ESTADO DE JALISCO"}
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-200/70 text-zinc-700">
                      ACTA NO. 49102
                    </span>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-zinc-950">
                      {showTranslated
                        ? "CERTIFIED COPY OF BIRTH RECORD"
                        : "COPIA CERTIFICADA DE ACTA DE NACIMIENTO"}
                    </p>
                    <p className="text-[11px] text-zinc-600 leading-relaxed font-mono">
                      {showTranslated
                        ? "Registered: SOFIA ELENA MORALES DELGADO • Date of Birth: 14/AUG/1998 • City: Guadalajara"
                        : "Registrado: SOFIA ELENA MORALES DELGADO • Fecha de Nacimiento: 14/AGO/1998 • Ciudad: Guadalajara"}
                    </p>
                  </div>

                  {/* Stamp & Seal Preservation Badge */}
                  <div className="p-2.5 rounded-xl border border-amber-500/30 bg-amber-50 text-[10px] font-mono font-bold text-amber-900 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 truncate">
                      <Stamp className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>{showTranslated ? "[OFFICIAL EMBOSSED SEAL: CIVIL REGISTRY GUADALAJARA]" : "SELLO OFICIAL REGISTRO CIVIL GUADALAJARA"}</span>
                    </span>
                    <Award className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-[11px] text-zinc-500 font-mono">
                  <span>Spatial Coordinate Lock: 100%</span>
                  <span className="text-emerald-600 font-bold">Zero Table Shift</span>
                </div>
              </motion.div>
            )}

            {activeTab === "affidavit" && (
              <motion.div
                key="affidavit-tab"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={SPRING_MICRO}
                className="space-y-3"
              >
                <div className="p-4 rounded-2xl bg-zinc-950 text-white border border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-200">
                        Sworn Affidavit
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">
                      8 CFR § 103.2(b)(3)
                    </span>
                  </div>

                  <p className="text-[11px] text-zinc-300 italic leading-relaxed">
                    &ldquo;I hereby certify that I am competent in both Spanish and English, and that the foregoing is a true, accurate, and complete translation of the original document.&rdquo;
                  </p>

                  <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-[10px] font-mono text-zinc-400">
                    <div>
                      <span className="block text-zinc-200 font-bold">Elena Rostova, CT</span>
                      <span>ATA Member #278190</span>
                    </div>
                    <div className="text-right">
                      <span className="text-emerald-400 font-bold block">Wet-Ink Signed</span>
                      <span>Notary Jurat Attached</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
                  <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Recognized across all 50 U.S. states, USCIS Service Centers, and EOIR courts.</span>
                </div>
              </motion.div>
            )}

            {activeTab === "consular" && (
              <motion.div
                key="consular-tab"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={SPRING_MICRO}
                className="space-y-3"
              >
                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
                    <span className="text-xs font-bold text-zinc-950">Dossier: VL-2026-8941</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                      VERIFIED PRE-CLEARED
                    </span>
                  </div>

                  <div className="grid grid-cols-12 gap-3 items-center">
                    <div className="col-span-8 space-y-1 text-left">
                      <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">
                        Cryptographic SHA-256 Seal
                      </span>
                      <p className="text-[11px] font-mono text-zinc-700 truncate font-semibold">
                        9e4f1a8c3d...c82a01bf92
                      </p>
                      <div className="inline-flex items-center gap-1 text-[10px] font-semibold text-zinc-900 pt-1">
                        <Lock className="w-3 h-3 text-emerald-600" />
                        <span>Tamper-Evident Federal Audit Trail</span>
                      </div>
                    </div>

                    <div className="col-span-4 flex justify-end">
                      <div className="p-2 rounded-xl bg-white border border-zinc-200 shadow-2xs">
                        <QrCode className="w-12 h-12 text-zinc-950" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl border border-zinc-200 bg-white text-xs text-zinc-600 flex items-center justify-between">
                  <span>Instant consular scan verification</span>
                  <span className="font-mono text-[10px] font-bold text-emerald-600">Active SLA</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Floating Runey Specimen Accents */}
        <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500 font-mono">
          <span className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-zinc-400" />
            <span>140+ Official Legal Formats</span>
          </span>
          <span className="text-zinc-900 font-semibold flex items-center gap-1">
            <span>Live Sandbox Ready</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </motion.div>

      {/* Floating Micro-Badges orbiting the card (Runey depth effect) */}
      <motion.div
        animate={{ y: [-4, 4, -4] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="hidden sm:flex absolute -top-4 -right-4 p-2.5 rounded-2xl bg-white/95 backdrop-blur-md border border-zinc-200 shadow-lg items-center gap-2 z-20"
      >
        <div className="w-6 h-6 rounded-lg bg-emerald-500 text-white flex items-center justify-center text-xs font-bold">
          ✓
        </div>
        <div className="text-left pr-1">
          <p className="text-[11px] font-bold text-zinc-950 leading-tight">USCIS Certified</p>
          <p className="text-[9px] font-mono text-zinc-400">0% RFE Rejection</p>
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [4, -4, 4] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="hidden sm:flex absolute -bottom-4 -left-4 p-2.5 rounded-2xl bg-zinc-950 text-white border border-zinc-800 shadow-xl items-center gap-2.5 z-20"
      >
        <Award className="w-5 h-5 text-emerald-400" />
        <div className="text-left pr-1">
          <p className="text-[11px] font-bold leading-tight">ATA Corporate Member</p>
          <p className="text-[9px] font-mono text-zinc-400">ID #278190</p>
        </div>
      </motion.div>
    </div>
  );
}
