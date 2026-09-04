"use client";

import * as React from "react";
import { ShieldCheck, QrCode, ArrowLeftRight, CheckCircle2, FileText, Stamp } from "lucide-react";

interface TransformField {
  labelEs: string;
  labelEn: string;
  valEs: string;
  valEn: string;
}

const FIELDS: TransformField[] = [
  {
    labelEs: "Nombre Completo",
    labelEn: "Full Legal Name",
    valEs: "CAMILA SOFÍA VALENCIA M.",
    valEn: "CAMILA SOFIA VALENCIA M.",
  },
  {
    labelEs: "Fecha de Nacimiento",
    labelEn: "Date of Birth",
    valEs: "14 de Mayo de 1998",
    valEn: "May 14, 1998",
  },
  {
    labelEs: "Lugar de Expedición",
    labelEn: "Place of Issuance",
    valEs: "Bogotá D.C., Colombia",
    valEn: "Bogota D.C., Colombia",
  },
  {
    labelEs: "Número de Acta",
    labelEn: "Civil Record No.",
    valEs: "ACTA-7921-LIBRO 4",
    valEn: "RECORD-7921-BOOK 4",
  },
];

export function DocumentTransformVisualizer() {
  const [isTranslated, setIsTranslated] = React.useState(false);
  const [isTransitioning, setIsTransitioning] = React.useState(false);

  // Gentle automatic transformation loop with pause-on-hover
  const [isPaused, setIsPaused] = React.useState(false);

  React.useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      triggerTransform();
    }, 4000);
    return () => clearInterval(interval);
  }, [isPaused, isTranslated]);

  const triggerTransform = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setIsTranslated((prev) => !prev);
      setIsTransitioning(false);
    }, 180);
  };

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="p-2 sm:p-2.5 rounded-[2.25rem] bg-black/5 dark:bg-white/5 ring-1 ring-border/80 shadow-2xl shadow-brand-500/10"
    >
      <div className="p-5 sm:p-6 rounded-[calc(2.25rem-0.625rem)] bg-surface-raised border border-border space-y-4">
        {/* Interactive Bar */}
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-status-success animate-pulse" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-brand-ink">
              High-Fidelity Layout Engine
            </span>
          </div>

          <button
            type="button"
            onClick={triggerTransform}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-50 hover:bg-brand-100/80 text-brand-500 text-xs font-bold transition-all active:scale-[0.97]"
            title="Click to toggle between original document and certified translation"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>{isTranslated ? "Show Foreign Original" : "Show Certified Translation"}</span>
          </button>
        </div>

        {/* The Mirrored Document Preview Sheet */}
        <div
          className={`relative p-5 sm:p-6 rounded-2xl bg-white border border-border shadow-sm text-brand-ink space-y-4 transition-all duration-200 ${
            isTransitioning ? "opacity-75 blur-[1.5px] scale-[0.99]" : "opacity-100 blur-0 scale-100"
          }`}
        >
          {/* Header Seal & Title */}
          <div className="text-center space-y-1 pb-3 border-b border-gray-200">
            <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-brand-50 border border-brand-100 text-brand-500 mx-auto">
              {isTranslated ? <ShieldCheck className="w-4 h-4" /> : <Stamp className="w-4 h-4" />}
            </div>
            <p className="text-[10px] font-mono font-bold tracking-widest text-gray-500 uppercase">
              {isTranslated
                ? "OFFICIAL CERTIFIED TRANSLATION • USCIS 8 CFR 103.2"
                : "REPÚBLICA DE COLOMBIA • REGISTRO CIVIL"}
            </p>
            <h4 className="text-sm sm:text-base font-black tracking-tight text-brand-ink">
              {isTranslated
                ? "CERTIFICATE OF BIRTH RECORD"
                : "REGISTRO CIVIL DE NACIMIENTO"}
            </h4>
          </div>

          {/* Table Grid (Strictly preserved layout coordinates) */}
          <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-200 text-xs">
            {FIELDS.map((f, i) => (
              <div key={i} className="grid grid-cols-12 divide-x divide-gray-200 bg-gray-50/50">
                <div className="col-span-5 p-2 font-bold text-gray-600 bg-gray-100/40">
                  {isTranslated ? f.labelEn : f.labelEs}
                </div>
                <div className="col-span-7 p-2 font-mono text-gray-900 font-medium">
                  {isTranslated ? f.valEn : f.valEs}
                </div>
              </div>
            ))}
          </div>

          {/* Mirrored Stamp & QR */}
          <div className="pt-2 flex items-center justify-between gap-4 border-t border-gray-200 text-[10px]">
            <div className="flex items-center gap-1.5 text-gray-500">
              <CheckCircle2 className="w-3.5 h-3.5 text-status-success" />
              <span>{isTranslated ? "Sworn Competence Affidavit Included" : "Sello Notarial y Foliado Original"}</span>
            </div>

            <div className="flex items-center gap-1 font-mono text-brand-500 font-bold">
              <QrCode className="w-3.5 h-3.5" />
              <span>{isTranslated ? "VERIFIED #VL-7X9K2" : "REGISTRO #COL-4821"}</span>
            </div>
          </div>
        </div>

        {/* Footnote Indicator */}
        <p className="text-[11px] text-center text-text-muted">
          {isTranslated ? (
            <span className="text-brand-500 font-semibold">
              ✓ Output matches input format with exact table geometry, fonts, and marginal notes.
            </span>
          ) : (
            <span>Auto-transforming preview. Hover or click button above to compare.</span>
          )}
        </p>
      </div>
    </div>
  );
}
