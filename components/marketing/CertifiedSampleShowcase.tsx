"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck,
  CheckCircle2,
  QrCode,
  Stamp,
  ArrowRight,
  Eye,
  FileText,
  Sliders,
  Columns,
} from "lucide-react";

interface SampleItem {
  id: string;
  title: string;
  format: "PDF" | "DOCX" | "Scanned Image";
  sourceLang: string;
  targetLang: string;
  agency: string;
  sourceImg: string;
  certImg: string;
  highlights: string[];
}

const SAMPLES: SampleItem[] = [
  {
    id: "birth-cert",
    title: "Birth Certificate (Acta de Nacimiento)",
    format: "PDF",
    sourceLang: "Spanish (Mexico)",
    targetLang: "English (US)",
    agency: "USCIS Form I-485 / N-400",
    sourceImg: "/images/docs/birth-certificate.jpg",
    certImg: "/images/docs/marriage-certificate.jpg",
    highlights: [
      "Exact tabular layout mirroring of Mexican Civil Registry",
      "All marginal stamps, seal notations & signatures bracketed",
      "Sworn 8 CFR 103.2(b)(3) statement of competence attached",
      "Public QR code verifiable by USCIS immigration officers",
    ],
  },
  {
    id: "diploma",
    title: "University Diploma & Transcript",
    format: "DOCX",
    sourceLang: "French (France)",
    targetLang: "English (US)",
    agency: "WES, ECE & University Admissions",
    sourceImg: "/images/docs/diploma.jpg",
    certImg: "/images/docs/transcript.jpg",
    highlights: [
      "Latin honors and French academic grading mirrored in OpenXML",
      "Rector signature and university dry seal transcribed",
      "Directly accepted by WES, SpanTran & top US grad schools",
      "Preserves tables, cell dimensions, and header/footer definitions",
    ],
  },
  {
    id: "apostille",
    title: "Commercial Register & Notary Apostille",
    format: "Scanned Image",
    sourceLang: "German (Germany)",
    targetLang: "English (US)",
    agency: "US District Courts & Consulates",
    sourceImg: "/images/docs/court-order.jpg",
    certImg: "/images/docs/bank-statement.jpg",
    highlights: [
      "OCR text identification with exact coordinate alignment",
      "German Handelsregister notary seals transcribed verbatim",
      "High-contrast text replacement without pixel distortion",
      "Fed. Rules of Evidence 902(11) certified affidavit attached",
    ],
  },
  {
    id: "marriage-cert",
    title: "Marriage Record & Family Book",
    format: "PDF",
    sourceLang: "Portuguese (Brazil)",
    targetLang: "English (US)",
    agency: "USCIS Consular Processing",
    sourceImg: "/images/docs/marriage-certificate.jpg",
    certImg: "/images/docs/birth-certificate.jpg",
    highlights: [
      "Cartório civil registry format mirrored across pages",
      "Affidavit of translator accuracy included on every copy",
      "Tamper-proof SHA-256 cryptographic verification token",
      "Guaranteed zero-rejection policy with free instant revisions",
    ],
  },
];

export function CertifiedSampleShowcase() {
  const [activeTab, setActiveTab] = React.useState(0);
  const [mode, setMode] = React.useState<"side-by-side" | "slider">("side-by-side");
  const [sliderPos, setSliderPos] = React.useState(50);
  const sample = SAMPLES[activeTab];

  return (
    <section className="py-24 md:py-36 bg-canvas border-b border-border/60 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 space-y-14">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-100 text-brand-500 text-xs font-bold uppercase tracking-wider font-mono">
              <Eye className="w-4 h-4" />
              Document Anatomy & Specimen Pairs
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-brand-ink tracking-tight font-display">
              See Exactly What You & USCIS Receive.
            </h2>
            <p className="text-base sm:text-lg text-ink-soft leading-relaxed">
              Every certified translation is delivered with strict layout preservation across PDF, DOCX, and scanned images — engineered to pass USCIS, court, and university scrutiny on first submission.
            </p>
          </div>

          {/* Mode Selector & Format Badges */}
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-surface border border-border">
            <button
              onClick={() => setMode("side-by-side")}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                mode === "side-by-side"
                  ? "bg-brand-500 text-white shadow-sm"
                  : "text-text-muted hover:text-brand-ink hover:bg-surface-raised"
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Side-by-Side</span>
            </button>
            <button
              onClick={() => setMode("slider")}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                mode === "slider"
                  ? "bg-brand-500 text-white shadow-sm"
                  : "text-text-muted hover:text-brand-ink hover:bg-surface-raised"
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Swipe Slider</span>
            </button>
          </div>
        </div>

        {/* Tab Selector: 4 Language Pairs Across 3 Container Formats */}
        <div className="flex flex-wrap gap-2.5 p-2 rounded-2xl bg-surface border border-border">
          {SAMPLES.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setActiveTab(idx)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 active:scale-[0.98] ${
                activeTab === idx
                  ? "bg-brand-500 text-white shadow-md"
                  : "text-ink-softer hover:text-brand-ink hover:bg-surface-raised"
              }`}
            >
              <span className="font-mono px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 text-[10px]">
                {s.format}
              </span>
              <span>{s.title.split("(")[0].trim()}</span>
            </button>
          ))}
        </div>

        {/* Visual Specimen Double-Bezel Card */}
        <div className="p-2 sm:p-2.5 rounded-[2.25rem] bg-black/5 dark:bg-white/5 ring-1 ring-border/80 shadow-xl shadow-brand-500/5">
          <div className="p-6 sm:p-10 rounded-[calc(2.25rem-0.625rem)] bg-surface-raised border border-border space-y-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-border">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant="default" className="text-xs font-mono">
                    {sample.sourceLang} → {sample.targetLang}
                  </Badge>
                  <span className="text-xs font-mono font-bold text-brand-500 uppercase">
                    Container: {sample.format}
                  </span>
                  <span className="text-xs text-text-muted font-semibold">
                    Target Spec: <strong className="text-brand-ink">{sample.agency}</strong>
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-brand-ink tracking-tight font-display">
                  {sample.title} Certified Packet
                </h3>
              </div>

              <Button asChild size="lg" className="group rounded-full font-bold pl-6 pr-3.5 shadow-md active:scale-[0.97] bg-brand-500 hover:bg-brand-600 text-white">
                <Link href="/order/triage">
                  <span>Start this translation ($24.95)</span>
                  <span className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center ml-2 transition-transform duration-200 group-hover:translate-x-0.5">
                    <ArrowRight className="w-3.5 h-3.5 text-white" />
                  </span>
                </Link>
              </Button>
            </div>

            {/* Specimen View Mode: Side-by-Side or Interactive Clip-Path Slider */}
            {mode === "side-by-side" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
                {/* Left: Source Document Card */}
                <div className="space-y-4 flex flex-col justify-between p-6 rounded-3xl bg-surface border border-border">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-brand-500" />
                        Original Source Document ({sample.format})
                      </span>
                      <Badge variant="secondary" className="text-[11px]">Foreign Language</Badge>
                    </div>
                    <p className="text-xs text-ink-softer">
                      Foreign civil registry, degree scroll, or court order with original notary stamps.
                    </p>
                  </div>

                  <div className="relative w-full h-80 rounded-2xl overflow-hidden border border-border shadow-sm bg-white">
                    <Image
                      src={sample.sourceImg}
                      alt={`${sample.title} foreign source document sample`}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                    />
                  </div>

                  <div className="pt-2 text-[11px] text-text-muted flex items-center justify-between border-t border-border">
                    <span>Format: {sample.format}</span>
                    <span className="text-status-success font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> High Resolution
                    </span>
                  </div>
                </div>

                {/* Right: Certified Translation & Certificate Card */}
                <div className="space-y-4 flex flex-col justify-between p-6 rounded-3xl bg-brand-50/40 border-2 border-brand-500/40 relative">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-brand-500 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-brand-500" />
                        Mirrored Certified Translation + QR
                      </span>
                      <Badge variant="success" className="text-[11px]">USCIS Compliant</Badge>
                    </div>
                    <p className="text-xs text-ink-softer">
                      Exact layout preservation with ATA certification statement & live QR stamp.
                    </p>
                  </div>

                  <div className="relative w-full h-80 rounded-2xl overflow-hidden border-2 border-brand-100 shadow-md bg-white">
                    <Image
                      src={sample.certImg}
                      alt={`${sample.title} certified translation specimen with QR code`}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                    />
                    <div className="absolute top-3 right-3 px-3 py-1.5 rounded-xl bg-brand-500 text-white text-[11px] font-mono font-bold shadow-lg flex items-center gap-1.5">
                      <QrCode className="w-3.5 h-3.5" />
                      Verifiable QR
                    </div>
                  </div>

                  <div className="pt-2 text-[11px] text-brand-ink font-semibold flex items-center justify-between border-t border-brand-100">
                    <span className="flex items-center gap-1 text-brand-500">
                      <Stamp className="w-3.5 h-3.5" /> ATA Credentialed Seal
                    </span>
                    <span className="font-mono text-xs text-brand-500 font-bold">8 CFR 103.2</span>
                  </div>
                </div>
              </div>
            ) : (
              /* Emil Kowalski Clip-Path Slider Mode */
              <div className="space-y-4">
                <div className="relative w-full h-96 sm:h-[420px] rounded-3xl overflow-hidden border border-border bg-white select-none">
                  {/* Background: Original Image */}
                  <Image
                    src={sample.sourceImg}
                    alt={`${sample.title} foreign source document`}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-xl bg-black/70 text-white text-xs font-mono font-bold">
                    Original ({sample.sourceLang})
                  </div>

                  {/* Foreground: Certified Translated Image clipped by percentage */}
                  <div
                    className="absolute inset-0 overflow-hidden"
                    style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
                  >
                    <Image
                      src={sample.certImg}
                      alt={`${sample.title} certified translation`}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-xl bg-brand-500 text-white text-xs font-mono font-bold shadow-md">
                      Certified Translation ({sample.targetLang})
                    </div>
                  </div>

                  {/* Center Divider Line */}
                  <div
                    className="absolute top-0 bottom-0 w-1 bg-brand-500 shadow-xl pointer-events-none"
                    style={{ left: `${sliderPos}%` }}
                  >
                    <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-brand-500 text-white flex items-center justify-center text-xs font-bold shadow-lg">
                      ⇄
                    </div>
                  </div>
                </div>

                {/* Range Slider Control */}
                <div className="flex items-center gap-4 px-2">
                  <span className="text-xs font-mono font-bold text-text-muted">Original</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={sliderPos}
                    onChange={(e) => setSliderPos(Number(e.target.value))}
                    className="flex-1 h-2 bg-surface-raised rounded-lg appearance-none cursor-pointer accent-brand-500 border border-border"
                  />
                  <span className="text-xs font-mono font-bold text-brand-500">Translated</span>
                </div>
              </div>
            )}

            {/* Compliance Anatomy Checklist */}
            <div className="pt-6 border-t border-border grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {sample.highlights.map((h, i) => (
                <div key={i} className="flex items-start gap-2.5 p-4 rounded-2xl bg-surface border border-border">
                  <CheckCircle2 className="w-5 h-5 text-status-success shrink-0 mt-0.5" />
                  <span className="text-xs font-semibold text-brand-ink leading-relaxed">
                    {h}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
