"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck,
  CheckCircle2,
  FileCheck2,
  QrCode,
  Stamp,
  ArrowRight,
  Eye,
  FileText,
  Lock,
} from "lucide-react";

const SAMPLES = [
  {
    id: "birth-cert",
    title: "Birth Certificate (Acta de Nacimiento)",
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
    title: "University Diploma & Degree Scroll",
    sourceLang: "French (France)",
    targetLang: "English (US)",
    agency: "WES, ECE & University Admissions",
    sourceImg: "/images/docs/diploma.jpg",
    certImg: "/images/docs/transcript.jpg",
    highlights: [
      "Latin honors and French academic grading mirrored",
      "Rector signature and university dry seal transcribed",
      "Directly accepted by WES, SpanTran & top US grad schools",
      "Cryptographic SHA-256 fingerprint on certificate",
    ],
  },
  {
    id: "court-order",
    title: "Court Decree & Legal Judgment",
    sourceLang: "Arabic / Portuguese",
    targetLang: "English (US)",
    agency: "US District Courts & Immigration Judges",
    sourceImg: "/images/docs/court-order.jpg",
    certImg: "/images/docs/bank-statement.jpg",
    highlights: [
      "Federal Rules of Evidence 902(11) compliant",
      "Judicial seal and case docket numbers verbatim",
      "Includes ATA certified legal linguist credentials",
      "Full corporate liability backing",
    ],
  },
];

export function CertifiedSampleShowcase() {
  const [activeTab, setActiveTab] = React.useState(0);
  const sample = SAMPLES[activeTab];

  return (
    <section className="py-20 md:py-28 bg-canvas border-b border-border/60 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 space-y-16">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-100 text-brand-500 text-xs font-bold uppercase tracking-wider font-mono">
              <Eye className="w-4 h-4" />
              Specimen & Document Anatomy
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-brand-ink tracking-tight font-display">
              See Exactly What You & USCIS Receive.
            </h2>
            <p className="text-base sm:text-lg text-ink-soft leading-relaxed">
              Every VerifyLingua certified translation is delivered as an official multi-page PDF packet engineered to pass USCIS, court, and university scrutiny on the first review.
            </p>
          </div>

          {/* Tab Selector */}
          <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-surface border border-border">
            {SAMPLES.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => setActiveTab(idx)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                  activeTab === idx
                    ? "bg-brand-500 text-white shadow-md"
                    : "text-ink-softer hover:text-brand-ink hover:bg-surface-raised"
                }`}
              >
                {s.title.split("(")[0].trim()}
              </button>
            ))}
          </div>
        </div>

        {/* Visual Specimen Card */}
        <div className="p-8 sm:p-10 md:p-12 rounded-[36px] bg-surface-raised border border-border/60 shadow-lg shadow-brand-500/5 space-y-10">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-8 border-b border-border">
            <div className="space-y-1.5">
              <div className="flex items-center gap-3">
                <Badge variant="default" className="text-xs font-mono">
                  {sample.sourceLang} → {sample.targetLang}
                </Badge>
                <span className="text-xs text-text-muted font-semibold">
                  Required for: <strong className="text-brand-ink">{sample.agency}</strong>
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-brand-ink tracking-tight font-display">
                {sample.title} Translation Packet
              </h3>
            </div>

            <Button asChild size="lg" className="gap-2 rounded-2xl font-bold shadow-sm shrink-0">
              <Link href="/order/triage">
                Order this translation ($24.95/page)
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>

          {/* Visual Showcase: 2-Column Document Specimen Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {/* Left: Source Document Card */}
            <div className="space-y-4 flex flex-col justify-between p-6 rounded-3xl bg-surface border border-border">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-brand-500" />
                    Page 1: Original Source Document
                  </span>
                  <Badge variant="secondary" className="text-[11px]">Foreign Language</Badge>
                </div>
                <p className="text-xs text-ink-softer">
                  Foreign civil registry, university degree, or court decree with official seals.
                </p>
              </div>

              <div className="relative w-full h-80 rounded-2xl overflow-hidden border border-border shadow-md bg-white">
                <Image
                  src={sample.sourceImg}
                  alt={`${sample.title} foreign source document sample`}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="pt-2 text-[11px] text-text-muted flex items-center justify-between border-t border-border">
                <span>Scanned at 300+ DPI</span>
                <span className="text-status-success font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> High Legibility
                </span>
              </div>
            </div>

            {/* Right: Certified Translation & Certificate Card */}
            <div className="space-y-4 flex flex-col justify-between p-6 rounded-3xl bg-brand-50/50 border-2 border-brand-500/40 relative">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-brand-500 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-brand-500" />
                    Page 2: Official Certified Translation + QR
                  </span>
                  <Badge variant="success" className="text-[11px]">USCIS Compliant</Badge>
                </div>
                <p className="text-xs text-ink-softer">
                  Mirror-formatted English translation with ATA certification statement & live QR stamp.
                </p>
              </div>

              <div className="relative w-full h-80 rounded-2xl overflow-hidden border-2 border-brand-100 shadow-md bg-white">
                <Image
                  src={sample.certImg}
                  alt={`${sample.title} certified translation specimen with QR code`}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-3 right-3 px-3 py-1.5 rounded-xl bg-brand-500 text-white text-[11px] font-mono font-bold shadow-lg flex items-center gap-1.5">
                  <QrCode className="w-3.5 h-3.5" />
                  Verifiable /verify/code
                </div>
              </div>

              <div className="pt-2 text-[11px] text-brand-ink font-semibold flex items-center justify-between border-t border-brand-100">
                <span className="flex items-center gap-1 text-brand-500">
                  <Stamp className="w-3.5 h-3.5" /> ATA Credentialed Seal
                </span>
                <span className="font-mono text-xs text-brand-500 font-bold">8 CFR 103.2(b)(3)</span>
              </div>
            </div>
          </div>

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
    </section>
  );
}
