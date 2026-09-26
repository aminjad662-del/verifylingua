"use client";

import * as React from "react";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ShieldCheck,
  CheckCircle2,
  Stamp,
  QrCode,
  FileText,
  Sparkles,
  Maximize2,
  Eye,
  Columns,
  Layers,
  Award,
  ArrowRight,
  Fingerprint,
} from "lucide-react";
import { SPRING_MICRO } from "@/lib/motion";

type ViewMode = "split" | "translated" | "original";

interface OCRHighlight {
  id: string;
  sourceText: string;
  translatedText: string;
  category: "Issuing Authority" | "Civil Registry Seal" | "Legal Subject" | "Notarial Jurat";
  confidence: number;
}

const OCR_HOTSPOTS: OCRHighlight[] = [
  {
    id: "h-1",
    sourceText: "ESTADOS UNIDOS MEXICANOS • ACTA DE NACIMIENTO",
    translatedText: "UNITED MEXICAN STATES • OFFICIAL BIRTH CERTIFICATE",
    category: "Issuing Authority",
    confidence: 99.9,
  },
  {
    id: "h-2",
    sourceText: "OFICIALIA 01 DEL REGISTRO CIVIL DE GUADALAJARA, JALISCO",
    translatedText: "OFFICE 01 OF THE CIVIL REGISTRY OF GUADALAJARA, JALISCO",
    category: "Civil Registry Seal",
    confidence: 99.7,
  },
  {
    id: "h-3",
    sourceText: "REGISTRADO: CARLOS EDUARDO MENDOZA MORALES • 14 MARZO 1994",
    translatedText: "REGISTERED NAME: CARLOS EDUARDO MENDOZA MORALES • MARCH 14, 1994",
    category: "Legal Subject",
    confidence: 100.0,
  },
  {
    id: "h-4",
    sourceText: "DOY FE: ES COPIA FIEL SACADA DE SU ORIGINAL QUE OBRA EN EL ARCHIVO",
    translatedText: "I ATTEST: THIS IS A TRUE AND ACCURATE EXTRACT FROM THE OFFICIAL REGISTER",
    category: "Notarial Jurat",
    confidence: 99.8,
  },
];

export function InspectionStage() {
  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const [activeHotspot, setActiveHotspot] = useState<string>("h-1");
  const [isZoomed, setIsZoomed] = useState(false);

  const selectedHotspot = OCR_HOTSPOTS.find((h) => h.id === activeHotspot) || OCR_HOTSPOTS[0];

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* High-Precision Raycast-Style Workspace Shell with 1px border */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        className="relative rounded-2xl bg-white/95 dark:bg-neutral-950/95 backdrop-blur-xl border border-neutral-200/90 dark:border-neutral-800/90 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.1)] overflow-hidden text-left"
      >
        {/* Workspace Top Toolbar: Mode Switcher & Telemetry Pill */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b border-neutral-100 dark:border-neutral-850 bg-neutral-50/70 dark:bg-neutral-900/60">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-xs font-mono font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              INSPECTION WORKBENCH
            </span>
            <span className="text-neutral-300 dark:text-neutral-700">/</span>
            <span className="text-[11px] font-mono text-neutral-500">VL-MX-8921.PDF</span>
          </div>

          {/* Interactive Mode Pills */}
          <div className="flex items-center gap-1 p-0.5 rounded-lg bg-neutral-200/60 dark:bg-neutral-800 text-xs font-medium border border-neutral-200/80 dark:border-neutral-700">
            <button
              type="button"
              onClick={() => setViewMode("split")}
              className={`relative px-2.5 py-1 rounded-md text-[11px] transition-colors cursor-pointer flex items-center gap-1.5 ${
                viewMode === "split"
                  ? "text-neutral-950 dark:text-white font-semibold"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-950"
              }`}
            >
              {viewMode === "split" && (
                <motion.div
                  layoutId="viewModeHighlight"
                  className="absolute inset-0 bg-white dark:bg-neutral-700 rounded-md shadow-2xs border border-neutral-200/50"
                  transition={SPRING_MICRO}
                />
              )}
              <Columns className="w-3 h-3 relative z-10" />
              <span className="relative z-10">Split View</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode("translated")}
              className={`relative px-2.5 py-1 rounded-md text-[11px] transition-colors cursor-pointer flex items-center gap-1.5 ${
                viewMode === "translated"
                  ? "text-neutral-950 dark:text-white font-semibold"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-950"
              }`}
            >
              {viewMode === "translated" && (
                <motion.div
                  layoutId="viewModeHighlight"
                  className="absolute inset-0 bg-white dark:bg-neutral-700 rounded-md shadow-2xs border border-neutral-200/50"
                  transition={SPRING_MICRO}
                />
              )}
              <FileText className="w-3 h-3 relative z-10 text-emerald-600" />
              <span className="relative z-10">Certified EN</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode("original")}
              className={`relative px-2.5 py-1 rounded-md text-[11px] transition-colors cursor-pointer flex items-center gap-1.5 ${
                viewMode === "original"
                  ? "text-neutral-950 dark:text-white font-semibold"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-950"
              }`}
            >
              {viewMode === "original" && (
                <motion.div
                  layoutId="viewModeHighlight"
                  className="absolute inset-0 bg-white dark:bg-neutral-700 rounded-md shadow-2xs border border-neutral-200/50"
                  transition={SPRING_MICRO}
                />
              )}
              <Eye className="w-3 h-3 relative z-10 text-amber-600" />
              <span className="relative z-10">Source ES</span>
            </button>
          </div>
        </div>

        {/* Live Document Visual Comparison Surface */}
        <div className="relative p-5 bg-neutral-100/50 dark:bg-neutral-900/30 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Document: Original Spanish Civil Record */}
            {(viewMode === "split" || viewMode === "original") && (
              <motion.div
                layout
                className={`rounded-xl border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-4 shadow-2xs transition-all relative ${
                  viewMode === "original" ? "md:col-span-2 max-w-xl mx-auto w-full" : ""
                }`}
              >
                {/* Document Header Seal */}
                <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-850">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 flex items-center justify-center text-xs font-serif font-bold border border-amber-200/60">
                      ES
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-tight">
                        Acta de Nacimiento
                      </p>
                      <p className="text-[9px] font-mono text-neutral-400">Guadalajara, Jalisco • 1994</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                    SRC-ES
                  </span>
                </div>

                {/* Document Content Mock Lines */}
                <div className="py-3 space-y-2.5 text-[11px] font-serif leading-relaxed text-neutral-800 dark:text-neutral-200">
                  <div
                    onClick={() => setActiveHotspot("h-1")}
                    className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                      activeHotspot === "h-1"
                        ? "border-amber-400/80 bg-amber-50/50 dark:bg-amber-950/20 ring-1 ring-amber-400/40"
                        : "border-transparent hover:border-neutral-200"
                    }`}
                  >
                    <p className="font-bold text-[10px] text-amber-900 dark:text-amber-400 uppercase">
                      Estados Unidos Mexicanos
                    </p>
                    <p className="text-[10px] text-neutral-600 dark:text-neutral-400">
                      Oficialía 01 del Registro Civil
                    </p>
                  </div>

                  <div
                    onClick={() => setActiveHotspot("h-3")}
                    className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                      activeHotspot === "h-3"
                        ? "border-amber-400/80 bg-amber-50/50 dark:bg-amber-950/20 ring-1 ring-amber-400/40"
                        : "border-transparent hover:border-neutral-200"
                    }`}
                  >
                    <p className="text-[10px] text-neutral-500 font-sans uppercase">Nombre Registrado:</p>
                    <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                      Carlos Eduardo Mendoza Morales
                    </p>
                    <p className="text-[10px] text-neutral-500 font-sans">
                      Fecha: 14 de Marzo de 1994 • Sexo: Masculino
                    </p>
                  </div>

                  <div
                    onClick={() => setActiveHotspot("h-4")}
                    className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                      activeHotspot === "h-4"
                        ? "border-amber-400/80 bg-amber-50/50 dark:bg-amber-950/20 ring-1 ring-amber-400/40"
                        : "border-transparent hover:border-neutral-200"
                    }`}
                  >
                    <p className="text-[9.5px] italic text-neutral-500">
                      &quot;Doy fe: que la presente es copia fiel sacada de su original que obra en el archivo
                      de este registro civil.&quot;
                    </p>
                  </div>
                </div>

                {/* Seal Mock Stamp */}
                <div className="pt-2 flex items-center justify-between border-t border-neutral-100 dark:border-neutral-850 text-[10px] text-neutral-400 font-mono">
                  <span className="flex items-center gap-1">
                    <Stamp className="w-3.5 h-3.5 text-amber-600" /> Sello Notarial
                  </span>
                  <span>Folio: 0921-X</span>
                </div>
              </motion.div>
            )}

            {/* Right Document: USCIS Certified English Translation */}
            {(viewMode === "split" || viewMode === "translated") && (
              <motion.div
                layout
                className={`rounded-xl border-2 border-emerald-500/40 bg-white dark:bg-neutral-950 p-4 shadow-sm transition-all relative ${
                  viewMode === "translated" ? "md:col-span-2 max-w-xl mx-auto w-full" : ""
                }`}
              >
                {/* Document Header Seal */}
                <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-850">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-xs font-serif font-bold border border-emerald-200/60">
                      EN
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-tight">
                        Certified Translation (USCIS)
                      </p>
                      <p className="text-[9px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                        ATA Member No. 271892 • Notarized
                      </p>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200/50">
                    ADMISSIBLE
                  </span>
                </div>

                {/* Translated Content with Exact Form Factor */}
                <div className="py-3 space-y-2.5 text-[11px] font-serif leading-relaxed text-neutral-800 dark:text-neutral-200">
                  <div
                    onClick={() => setActiveHotspot("h-1")}
                    className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                      activeHotspot === "h-1"
                        ? "border-emerald-500/80 bg-emerald-50/50 dark:bg-emerald-950/20 ring-1 ring-emerald-500/40"
                        : "border-transparent hover:border-neutral-200"
                    }`}
                  >
                    <p className="font-bold text-[10px] text-emerald-900 dark:text-emerald-400 uppercase tracking-tight">
                      United Mexican States
                    </p>
                    <p className="text-[10px] text-neutral-600 dark:text-neutral-400">
                      Office 01 of the Civil Registry
                    </p>
                  </div>

                  <div
                    onClick={() => setActiveHotspot("h-3")}
                    className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                      activeHotspot === "h-3"
                        ? "border-emerald-500/80 bg-emerald-50/50 dark:bg-emerald-950/20 ring-1 ring-emerald-500/40"
                        : "border-transparent hover:border-neutral-200"
                    }`}
                  >
                    <p className="text-[10px] text-neutral-500 font-sans uppercase">Registered Individual:</p>
                    <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                      Carlos Eduardo Mendoza Morales
                    </p>
                    <p className="text-[10px] text-neutral-500 font-sans">
                      Date of Birth: March 14, 1994 • Sex: Male
                    </p>
                  </div>

                  <div
                    onClick={() => setActiveHotspot("h-4")}
                    className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                      activeHotspot === "h-4"
                        ? "border-emerald-500/80 bg-emerald-50/50 dark:bg-emerald-950/20 ring-1 ring-emerald-500/40"
                        : "border-transparent hover:border-neutral-200"
                    }`}
                  >
                    <p className="text-[9.5px] italic text-neutral-600 dark:text-neutral-300">
                      &quot;I attest: that this is a true and accurate translation of the official record
                      preserved in the archives of this Civil Registry.&quot;
                    </p>
                  </div>
                </div>

                {/* Cryptographic QR & Jurat Footer */}
                <div className="pt-2 flex items-center justify-between border-t border-neutral-100 dark:border-neutral-850 text-[10px] text-neutral-500 font-mono">
                  <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5" /> 8 CFR § 103.2(b)(3)
                  </span>
                  <span className="flex items-center gap-1">
                    <QrCode className="w-3.5 h-3.5 text-neutral-700 dark:text-neutral-300" />
                    SHA-256: 89f4…2b1
                  </span>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Selected Hotspot Deep-Dive Bar */}
        <div className="p-4 border-t border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-[10px] font-mono font-bold text-neutral-700 dark:text-neutral-300">
                {selectedHotspot.category}
              </span>
              <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                {selectedHotspot.confidence}% Neural Fidelity
              </span>
            </div>
            <p className="text-[11px] font-mono text-neutral-500 line-clamp-1">
              &quot;{selectedHotspot.sourceText}&quot; → &quot;{selectedHotspot.translatedText}&quot;
            </p>
          </div>

          <a
            href="/translate"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-black text-white text-[11px] font-bold transition-all active:scale-[0.97] shrink-0"
          >
            <span>Launch Studio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </motion.div>
    </div>
  );
}
