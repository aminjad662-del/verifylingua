"use client";

import * as React from "react";
import Link from "next/link";
import { CheckCircle2, Stamp, Award, QrCode } from "lucide-react";
import { cn } from "@/lib/utils";

interface TickerDoc {
  id: string;
  country: string;
  countryCode: string;
  flag: string;
  type: string;
  originalTitle: string;
  agency: string;
  badge: string;
  sealText: string;
  sealColor: string;
  slug: string;
}

const TICKER_DOCS: TickerDoc[] = [
  {
    id: "tk-1",
    country: "Mexico",
    countryCode: "MEX",
    flag: "🇲🇽",
    type: "Civil Registry",
    originalTitle: "Copia Certificada de Acta de Nacimiento",
    agency: "Registro Civil de la CDMX",
    badge: "USCIS 8 CFR",
    sealText: "REGISTRO CIVIL SELLO",
    sealColor: "text-amber-400 border-amber-500/30 bg-amber-950/40",
    slug: "/documents/birth-certificate",
  },
  {
    id: "tk-2",
    country: "Germany",
    countryCode: "DEU",
    flag: "🇩🇪",
    type: "Academic Transcript",
    originalTitle: "Zeugnis der Ludwig-Maximilians-Universität",
    agency: "LMU München Prüfungsamt",
    badge: "WES Compliant",
    sealText: "LMU MÜNCHEN SIEGEL",
    sealColor: "text-blue-400 border-blue-500/30 bg-blue-950/40",
    slug: "/documents/academic-transcript",
  },
  {
    id: "tk-3",
    country: "France",
    countryCode: "FRA",
    flag: "🇫🇷",
    type: "Marriage Act",
    originalTitle: "Extrait d'Acte de Mariage avec Apostille",
    agency: "Mairie de Paris • Cour d'Appel",
    badge: "Hague 1961",
    sealText: "RÉPUBLIQUE FRANÇAISE",
    sealColor: "text-indigo-400 border-indigo-500/30 bg-indigo-950/40",
    slug: "/documents/marriage-certificate",
  },
  {
    id: "tk-4",
    country: "Japan",
    countryCode: "JPN",
    flag: "🇯🇵",
    type: "Family Registry",
    originalTitle: "戸籍謄本 (Koseki Tohon Full Copy)",
    agency: "Tokyo Minato Ward Civil Office",
    badge: "Consular Cleared",
    sealText: "港区長公印 (Inkan)",
    sealColor: "text-rose-400 border-rose-500/30 bg-rose-950/40",
    slug: "/documents/birth-certificate",
  },
  {
    id: "tk-5",
    country: "Ukraine",
    countryCode: "UKR",
    flag: "🇺🇦",
    type: "Court Decree",
    originalTitle: "Свідоцтво про розірвання шлюбу",
    agency: "Міністерство юстиції України",
    badge: "DOJ EOIR Sworn",
    sealText: "МІНІСТЕРСТВО ЮСТИЦІЇ",
    sealColor: "text-blue-400 border-blue-500/30 bg-blue-950/40",
    slug: "/documents/court-record",
  },
  {
    id: "tk-6",
    country: "Brazil",
    countryCode: "BRA",
    flag: "🇧🇷",
    type: "Civil Marriage",
    originalTitle: "Certidão de Casamento de Inteiro Teor",
    agency: "Cartório de Registro Civil SP",
    badge: "ATA Certified",
    sealText: "CARTÓRIO REGISTRO",
    sealColor: "text-emerald-400 border-emerald-500/30 bg-emerald-950/40",
    slug: "/documents/marriage-certificate",
  },
  {
    id: "tk-7",
    country: "China",
    countryCode: "CHN",
    flag: "🇨🇳",
    type: "Notarial Certificate",
    originalTitle: "毕业证书与学士学位公证书 (Gongzhengshu)",
    agency: "Beijing Notary Public Office",
    badge: "NACES Approved",
    sealText: "中华人民共和国公证处",
    sealColor: "text-rose-400 border-rose-500/30 bg-rose-950/40",
    slug: "/documents/diploma-and-degree",
  },
  {
    id: "tk-8",
    country: "Colombia",
    countryCode: "COL",
    flag: "🇨🇴",
    type: "Judicial Custody",
    originalTitle: "Sentencia de Custodia y Patria Potestad",
    agency: "Juzgado de Familia de Bogotá",
    badge: "Court Admissible",
    sealText: "NOTARÍA 14 DE BOGOTÁ",
    sealColor: "text-amber-400 border-amber-500/30 bg-amber-950/40",
    slug: "/documents/court-record",
  },
  {
    id: "tk-9",
    country: "Spain",
    countryCode: "ESP",
    flag: "🇪🇸",
    type: "Medical Certification",
    originalTitle: "Certificado Médico Oficial de Salud",
    agency: "Colegio de Médicos de Madrid",
    badge: "USCIS I-693",
    sealText: "COLEGIO MÉDICOS",
    sealColor: "text-emerald-400 border-emerald-500/30 bg-emerald-950/40",
    slug: "/documents/medical-record",
  },
  {
    id: "tk-10",
    country: "Egypt",
    countryCode: "EGY",
    flag: "🇪🇬",
    type: "Vital Record",
    originalTitle: "شهادة ميلاد رسمية مميكنة وموثقة",
    agency: "Ministry of Health & Foreign Affairs Cairo",
    badge: "Consular Verified",
    sealText: "تصديق وزارة الخارجية",
    sealColor: "text-amber-400 border-amber-500/30 bg-amber-950/40",
    slug: "/documents/birth-certificate",
  },
  {
    id: "tk-11",
    country: "Italy",
    countryCode: "ITA",
    flag: "🇮🇹",
    type: "Atto di Nascita",
    originalTitle: "Estratto per Riassunto dell'Atto di Nascita",
    agency: "Comune di Roma • Anagrafe",
    badge: "Jure Sanguinis",
    sealText: "COMUNE DI ROMA",
    sealColor: "text-emerald-400 border-emerald-500/30 bg-emerald-950/40",
    slug: "/documents/birth-certificate",
  },
  {
    id: "tk-12",
    country: "South Korea",
    countryCode: "KOR",
    flag: "🇰🇷",
    type: "Family Certificate",
    originalTitle: "가족관계증명서 (기본증명서 상세)",
    agency: "Supreme Court of Korea Registry",
    badge: "Apostille Ready",
    sealText: "대한민국 대법원",
    sealColor: "text-blue-400 border-blue-500/30 bg-blue-950/40",
    slug: "/documents/birth-certificate",
  },
];

export function SpyglassTickerBar() {
  return (
    <section className="relative py-16 sm:py-20 bg-brand-ink text-white overflow-hidden border-y border-white/10">
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute inset-0 bg-radial-gradient from-brand-500/10 via-transparent to-transparent blur-3xl opacity-50" />

      <div className="max-w-7xl mx-auto px-6 relative z-10 text-center space-y-8">
        {/* Editorial Ticker Header matching Spyglass reference */}
        <div className="space-y-2 max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white font-display">
            Tracking 119,981,940 certified words <br className="hidden sm:inline" />
            <span className="font-serif italic font-normal text-brand-300">
              across 85+ languages / 100% acceptance guaranteed
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-white/60 font-mono">
            LIVE CROSS-BORDER CERTIFICATION DISPATCH • ZERO USCIS REJECTIONS
          </p>
        </div>

        {/* Continuous Horizontal Marquee Container with Slender Portrait Cards */}
        <div className="relative w-full overflow-hidden select-none pt-4">
          {/* Gradient fade edge masks */}
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-r from-brand-ink via-brand-ink/80 to-transparent z-20" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-l from-brand-ink via-brand-ink/80 to-transparent z-20" />

          {/* Scrolling Marquee Strip */}
          <div className="animate-marquee gap-4">
            {[...TICKER_DOCS, ...TICKER_DOCS].map((doc, idx) => (
              <Link
                key={`${doc.id}-${idx}`}
                href={doc.slug}
                className="w-40 sm:w-44 h-60 shrink-0 p-3.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 backdrop-blur-md text-left transition-all duration-300 hover:border-brand-500/60 hover:-translate-y-1 flex flex-col justify-between group shadow-lg"
              >
                {/* Header: Flag & Country Code */}
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <div className="flex items-center gap-1.5">
                      <span className="text-base" role="img" aria-label={doc.country}>
                        {doc.flag}
                      </span>
                      <span className="text-[11px] font-bold text-white uppercase font-mono tracking-wider">
                        {doc.countryCode}
                      </span>
                    </div>
                    <span className="text-[9px] font-mono font-semibold text-brand-300">
                      {doc.type}
                    </span>
                  </div>

                  {/* Title & Agency */}
                  <div className="pt-2 space-y-1">
                    <h3 className="text-[11px] font-bold text-white group-hover:text-brand-300 transition-colors line-clamp-2 leading-tight">
                      {doc.originalTitle}
                    </h3>
                    <p className="text-[9px] text-white/50 truncate">
                      {doc.agency}
                    </p>
                  </div>
                </div>

                {/* Bottom: Seal & Badge */}
                <div className="space-y-1.5">
                  <div
                    className={cn(
                      "px-1.5 py-1 rounded border text-[8px] font-mono font-bold flex items-center justify-between gap-1 truncate",
                      doc.sealColor
                    )}
                  >
                    <span className="truncate flex items-center gap-1">
                      <Stamp className="w-2.5 h-2.5 shrink-0" />
                      {doc.sealText}
                    </span>
                    <Award className="w-2.5 h-2.5 shrink-0 opacity-80" />
                  </div>

                  <div className="pt-1.5 border-t border-white/10 flex items-center justify-between text-[9px] font-mono">
                    <div className="flex items-center gap-1 text-emerald-400 font-semibold truncate">
                      <CheckCircle2 className="w-3 h-3 shrink-0" />
                      <span className="truncate">{doc.badge}</span>
                    </div>
                    <QrCode className="w-3 h-3 text-white/40 group-hover:text-white transition-colors shrink-0" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
