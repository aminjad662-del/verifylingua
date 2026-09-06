"use client";

import * as React from "react";
import Link from "next/link";
import {
  FileText,
  ShieldCheck,
  CheckCircle2,
  Stamp,
  Award,
  ArrowUpRight,
  Sparkles,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MatrixItem {
  id: string;
  category: string;
  title: string;
  originalLanguage: string;
  sampleName: string;
  agency: string;
  badge: string;
  turnaround: string;
  slug: string;
  accentBorder: string;
  sealColor: string;
  sealText: string;
}

const MATRIX_ITEMS: MatrixItem[] = [
  {
    id: "m-1",
    category: "Civil Registry",
    title: "Birth Certificate",
    originalLanguage: "Spanish, Arabic, French, +87",
    sampleName: "Acta de Nacimiento • Registro Civil",
    agency: "USCIS Form I-130 / I-485 / N-400",
    badge: "100% USCIS Guaranteed",
    turnaround: "24h standard",
    slug: "/documents/birth-certificate",
    accentBorder: "group-hover:border-blue-500/50",
    sealColor: "text-amber-400 border-amber-500/40 bg-amber-950/40",
    sealText: "REGISTRO CIVIL SELLO OFICIAL",
  },
  {
    id: "m-2",
    category: "Academic Credentials",
    title: "University Transcripts",
    originalLanguage: "German, Italian, Russian, +87",
    sampleName: "Zeugnis der Universitätsprüfung",
    agency: "WES, ECE, Josef Silny, Spantran",
    badge: "NACES & AICE Approved",
    turnaround: "24-48h",
    slug: "/documents/academic-transcript",
    accentBorder: "group-hover:border-indigo-500/50",
    sealColor: "text-blue-400 border-blue-500/40 bg-blue-950/40",
    sealText: "UNIVERSITÄT PRÜFUNGSAMT",
  },
  {
    id: "m-3",
    category: "Vital Records",
    title: "Marriage Certificate",
    originalLanguage: "Portuguese, Tagalog, Polish, +87",
    sampleName: "Certidão de Casamento com Apostila",
    agency: "USCIS Marriage Green Card (CR-1 / IR-1)",
    badge: "Consular & Embassy Ready",
    turnaround: "24h standard",
    slug: "/documents/marriage-certificate",
    accentBorder: "group-hover:border-emerald-500/50",
    sealColor: "text-emerald-400 border-emerald-500/40 bg-emerald-950/40",
    sealText: "CARTÓRIO DE REGISTRO CIVIL",
  },
  {
    id: "m-4",
    category: "Judicial & Legal",
    title: "Court Judgments & Divorces",
    originalLanguage: "Ukrainian, Russian, Turkish, +87",
    sampleName: "Рішення суду про розірвання шлюбу",
    agency: "EOIR Immigration Court & Family Court",
    badge: "DOJ & Court Sworn",
    turnaround: "24-48h",
    slug: "/documents/court-record",
    accentBorder: "group-hover:border-purple-500/50",
    sealColor: "text-purple-400 border-purple-500/40 bg-purple-950/40",
    sealText: "МІНІСТЕРСТВО ЮСТИЦІЇ СУД",
  },
  {
    id: "m-5",
    category: "Higher Education",
    title: "Diplomas & Degrees",
    originalLanguage: "Chinese, Korean, Japanese, +87",
    sampleName: "毕业证书与学士学位认证 (Gongzhengshu)",
    agency: "H-1B, O-1, EB-1/2/3 Visa Petitions",
    badge: "USCIS 8 CFR § 204.2",
    turnaround: "24h standard",
    slug: "/documents/diploma-and-degree",
    accentBorder: "group-hover:border-rose-500/50",
    sealColor: "text-rose-400 border-rose-500/40 bg-rose-950/40",
    sealText: "中华人民共和国公证处",
  },
  {
    id: "m-6",
    category: "Civil Registry",
    title: "Death Certificates",
    originalLanguage: "French, Arabic, Hindi, +87",
    sampleName: "Acte de Décès / شهادة الوفاة الرسمية",
    agency: "Estate, Probate & Consular Filings",
    badge: "Sworn Legal Certified",
    turnaround: "24h standard",
    slug: "/documents/death-certificate",
    accentBorder: "group-hover:border-teal-500/50",
    sealColor: "text-teal-400 border-teal-500/40 bg-teal-950/40",
    sealText: "RÉPUBLIQUE FRANÇAISE ÉTAT CIVIL",
  },
  {
    id: "m-7",
    category: "Corporate & Tax",
    title: "Tax Returns & Bank Statements",
    originalLanguage: "Spanish, German, Japanese, +87",
    sampleName: "Declaración de Impuestos SAT / Steuerbescheid",
    agency: "EB-5 Investor, E-2 Treaty, SBA & Mortgage",
    badge: "1:1 Table Precision",
    turnaround: "24-48h",
    slug: "/documents/tax-return",
    accentBorder: "group-hover:border-amber-500/50",
    sealColor: "text-amber-400 border-amber-500/40 bg-amber-950/40",
    sealText: "FINANZAMT / SAT CERTIFIED",
  },
  {
    id: "m-8",
    category: "Legal Authentication",
    title: "Apostille & Notarial Certs",
    originalLanguage: "All Hague Convention Nations",
    sampleName: "Apostille Convention de La Haye 1961",
    agency: "State Department & Foreign Consulates",
    badge: "Hague Apostille Compliant",
    turnaround: "24h standard",
    slug: "/documents/apostille",
    accentBorder: "group-hover:border-sky-500/50",
    sealColor: "text-sky-400 border-sky-500/40 bg-sky-950/40",
    sealText: "APOSTILLE LA HAYE 1961",
  },
  {
    id: "m-9",
    category: "Healthcare & Immigration",
    title: "Vaccination & Medical Records",
    originalLanguage: "Vietnamese, Spanish, Russian, +87",
    sampleName: "Sổ Tiêm Chủng / Certificado de Vacunación",
    agency: "CDC & USCIS Form I-693 Medical Exam",
    badge: "USCIS Civil Surgeon Ready",
    turnaround: "12-24h",
    slug: "/documents/medical-record",
    accentBorder: "group-hover:border-emerald-500/50",
    sealColor: "text-emerald-400 border-emerald-500/40 bg-emerald-950/40",
    sealText: "CLINICAL REGISTRY SEAL",
  },
  {
    id: "m-10",
    category: "Law Enforcement & Visas",
    title: "Police Clearance / Background",
    originalLanguage: "Portuguese, Italian, Arabic, +87",
    sampleName: "Certidão de Antecedentes Criminais",
    agency: "NVC Consular Processing & State Dept",
    badge: "State Dept Accepted",
    turnaround: "24h standard",
    slug: "/documents/police-clearance",
    accentBorder: "group-hover:border-blue-500/50",
    sealColor: "text-blue-400 border-blue-500/40 bg-blue-950/40",
    sealText: "POLÍCIA FEDERAL BRASIL",
  },
];

export function SpyglassDarkMatrix() {
  return (
    <section className="relative py-24 sm:py-32 bg-brand-ink text-white overflow-hidden border-y border-white/10">
      {/* Background radial highlight */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-brand-500/10 blur-[140px]" />

      <div className="max-w-7xl mx-auto px-6 relative z-10 space-y-16">
        {/* Header matching "Meta. Instagram. TikTok. One Search." */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-brand-300 text-xs font-mono font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-brand-300" />
            <span>Comprehensive Official Coverage</span>
          </div>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white font-display">
            Civil. Academic. Legal. <br className="hidden sm:inline" />
            <span className="text-brand-300">One Engine.</span>
          </h2>

          <p className="text-base sm:text-lg text-white/70 leading-relaxed max-w-2xl mx-auto">
            Search, transcribe, and certified-translate 140+ document types across 90+ languages with sworn legal accuracy.
          </p>
        </div>

        {/* 2-Row x 5-Column Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {MATRIX_ITEMS.map((item) => (
            <Link
              key={item.id}
              href={item.slug}
              className={cn(
                "group relative flex flex-col justify-between p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 shadow-lg",
                item.accentBorder
              )}
            >
              {/* Card Top: Category & Arrow */}
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-white/50 font-bold">
                    {item.category}
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-white/40 group-hover:text-white transition-colors" />
                </div>

                {/* Title & Document Sample Name */}
                <div className="pt-3 space-y-1.5">
                  <h3 className="text-sm font-bold text-white group-hover:text-brand-300 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-white/60 line-clamp-2 leading-snug">
                    {item.sampleName}
                  </p>
                </div>

                {/* Seal Mockup */}
                <div
                  className={cn(
                    "mt-3 px-2 py-1 rounded border text-[9px] font-mono font-bold flex items-center gap-1.5 truncate",
                    item.sealColor
                  )}
                >
                  <Stamp className="w-3 h-3 shrink-0" />
                  <span className="truncate">{item.sealText}</span>
                </div>
              </div>

              {/* Card Bottom: Agency & Badge */}
              <div className="pt-4 mt-4 border-t border-white/10 space-y-2">
                <div className="flex items-center justify-between text-[10px] font-mono text-white/50">
                  <span className="truncate max-w-[110px]">{item.agency}</span>
                  <span className="text-white/70">{item.turnaround}</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400">
                  <CheckCircle2 className="w-3 h-3 shrink-0" />
                  <span className="truncate">{item.badge}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom Explorer Action Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md">
          <div className="flex items-center gap-3 text-sm text-white/80">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-brand-500/20 text-brand-300 border border-brand-500/30">
              <FileText className="w-4 h-4" />
            </div>
            <span>
              Need a rare civil registry, foreign apostille, or multilingual court bundle?
            </span>
          </div>
          <Link
            href="/documents"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-white text-brand-ink text-xs font-bold hover:bg-white/90 transition-colors shrink-0"
          >
            <span>Explore All 140+ Documents</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
