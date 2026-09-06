"use client";

import * as React from "react";
import { ShieldCheck, CheckCircle2, Award, QrCode, Stamp } from "lucide-react";
import { cn } from "@/lib/utils";

interface DocumentCard {
  id: string;
  country: string;
  flag: string;
  type: string;
  originalTitle: string;
  agency: string;
  targetLang: string;
  sealColor: string;
  sealText: string;
  badge: string;
  hash: string;
}

const DOCUMENTS: DocumentCard[] = [
  {
    id: "doc-1",
    country: "Mexico",
    flag: "🇲🇽",
    type: "Birth Certificate",
    originalTitle: "Copia Certificada de Acta de Nacimiento",
    agency: "Registro Civil de la CDMX",
    targetLang: "Spanish → English",
    sealColor: "text-amber-700 bg-amber-500/10 border-amber-600/30",
    sealText: "SELLO OFICIAL REGISTRO CIVIL",
    badge: "USCIS 8 CFR § 204.2",
    hash: "SHA256: 9e4f...a812",
  },
  {
    id: "doc-2",
    country: "Germany",
    flag: "🇩🇪",
    type: "University Transcript",
    originalTitle: "Zeugnis der Ludwig-Maximilians-Universität",
    agency: "LMU München Prüfungsamt",
    targetLang: "German → English",
    sealColor: "text-blue-700 bg-blue-500/10 border-blue-600/30",
    sealText: "SIEGEL DER UNIVERSITÄT MÜNCHEN",
    badge: "WES / ECE Compliant",
    hash: "SHA256: c3b1...7f04",
  },
  {
    id: "doc-3",
    country: "France",
    flag: "🇫🇷",
    type: "Marriage Certificate",
    originalTitle: "Extrait d'Acte de Mariage avec Apostille",
    agency: "Mairie de Paris • Cour d'Appel",
    targetLang: "French → English",
    sealColor: "text-indigo-700 bg-indigo-500/10 border-indigo-600/30",
    sealText: "RÉPUBLIQUE FRANÇAISE APOSTILLE",
    badge: "Hague Convention 1961",
    hash: "SHA256: 41d2...b990",
  },
  {
    id: "doc-4",
    country: "Japan",
    flag: "🇯🇵",
    type: "Family Registry",
    originalTitle: "戸籍謄本 (Koseki Tohon Full Copy)",
    agency: "Tokyo Minato Ward Civil Office",
    targetLang: "Japanese → English",
    sealColor: "text-red-700 bg-red-500/10 border-red-600/30",
    sealText: "港区長公印 (Inkan Verification)",
    badge: "Consular Acceptance",
    hash: "SHA256: e87a...3319",
  },
  {
    id: "doc-5",
    country: "Colombia",
    flag: "🇨🇴",
    type: "Court Affidavit",
    originalTitle: "Sentencia Judicial de Divorcio y Custodia",
    agency: "Juzgado de Familia de Bogotá",
    targetLang: "Spanish → English",
    sealColor: "text-amber-800 bg-amber-500/10 border-amber-600/30",
    sealText: "NOTARÍA 14 DE BOGOTÁ D.C.",
    badge: "DOJ EOIR Certified",
    hash: "SHA256: 21fa...c783",
  },
  {
    id: "doc-6",
    country: "Ukraine",
    flag: "🇺🇦",
    type: "Birth Record",
    originalTitle: "Свідоцтво про народження з апостилем",
    agency: "Відділ ДРАЦС м. Києва",
    targetLang: "Ukrainian → English",
    sealColor: "text-blue-700 bg-blue-500/10 border-blue-600/30",
    sealText: "МІНІСТЕРСТВО ЮСТИЦІЇ УКРАЇНИ",
    badge: "USCIS Guaranteed",
    hash: "SHA256: bb09...51aa",
  },
  {
    id: "doc-7",
    country: "Italy",
    flag: "🇮🇹",
    type: "Judicial Decree",
    originalTitle: "Decreto del Tribunale Ordinario di Roma",
    agency: "Ministero della Giustizia Roma",
    targetLang: "Italian → English",
    sealColor: "text-emerald-700 bg-emerald-500/10 border-emerald-600/30",
    sealText: "REPUBBLICA ITALIANA SIGILLO",
    badge: "Legal Sworn Translation",
    hash: "SHA256: 7d44...90e1",
  },
  {
    id: "doc-8",
    country: "Brazil",
    flag: "🇧🇷",
    type: "Civil Marriage",
    originalTitle: "Certidão de Casamento de Inteiro Teor",
    agency: "1º Ofício de Registro Civil SP",
    targetLang: "Portuguese → English",
    sealColor: "text-emerald-800 bg-emerald-500/10 border-emerald-600/30",
    sealText: "CARTÓRIO DE REGISTRO CIVIL",
    badge: "ATA Member No. 27194",
    hash: "SHA256: 3c99...ef62",
  },
  {
    id: "doc-9",
    country: "China",
    flag: "🇨🇳",
    type: "Notarial Certificate",
    originalTitle: "公证书 (Notarized Degree & Transcript)",
    agency: "Beijing Notary Public Office",
    targetLang: "Chinese → English",
    sealColor: "text-rose-700 bg-rose-500/10 border-rose-600/30",
    sealText: "中华人民共和国公证处",
    badge: "NACES & AICE Approved",
    hash: "SHA256: f162...aa88",
  },
  {
    id: "doc-10",
    country: "Egypt",
    flag: "🇪🇬",
    type: "Vital Record",
    originalTitle: "شهادة ميلاد رسمية مميكنة وموثقة",
    agency: "Ministry of Health & Population Cairo",
    targetLang: "Arabic → English",
    sealColor: "text-amber-800 bg-amber-500/10 border-amber-600/30",
    sealText: "تصديق وزارة الخارجية المصرية",
    badge: "Consular Verified",
    hash: "SHA256: 55bc...021d",
  },
  {
    id: "doc-11",
    country: "Spain",
    flag: "🇪🇸",
    type: "Medical Certification",
    originalTitle: "Certificado Médico Oficial de Salud",
    agency: "Colegio Oficial de Médicos de Madrid",
    targetLang: "Spanish → English",
    sealColor: "text-red-700 bg-red-500/10 border-red-600/30",
    sealText: "CONSEJO GENERAL DE COLEGIOS MÉDICOS",
    badge: "Civil Surgeon Form I-693",
    hash: "SHA256: d08e...339a",
  },
];

export function CurvedDocumentArc() {
  const [hoveredDoc, setHoveredDoc] = React.useState<string | null>(null);

  return (
    <div className="relative w-full overflow-hidden pt-8 pb-14 select-none">
      {/* Top subtle fade gradient */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-r from-canvas to-transparent z-20" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-l from-canvas to-transparent z-20" />

      {/* Horizontal Scroll & Arc Container */}
      <div className="w-full overflow-x-auto scrollbar-none pb-6 px-4 sm:px-10">
        <div className="flex items-end justify-center min-w-[1240px] max-w-7xl mx-auto gap-3.5 sm:gap-4 px-4 h-[330px]">
          {DOCUMENTS.map((doc, idx) => {
            // Parabolic curve calculation: center is at idx 5
            const total = DOCUMENTS.length;
            const mid = (total - 1) / 2;
            const offset = idx - mid; // e.g. -5 to +5
            
            // Rotation angle: outer cards tilt outwards
            const rotationDeg = offset * 2.4; // -12deg to +12deg
            // Vertical offset: center cards are slightly lower to form a gentle concave smile arc
            const translateYPx = Math.abs(offset) * 3.8;

            const isHovered = hoveredDoc === doc.id;

            return (
              <div
                key={doc.id}
                onMouseEnter={() => setHoveredDoc(doc.id)}
                onMouseLeave={() => setHoveredDoc(null)}
                style={{
                  transform: `translateY(${translateYPx}px) rotate(${rotationDeg}deg) scale(${isHovered ? 1.08 : 1})`,
                  transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease",
                  zIndex: isHovered ? 30 : 10 + Math.floor(10 - Math.abs(offset)),
                }}
                className={cn(
                  "relative w-48 sm:w-56 shrink-0 rounded-xl p-3.5 text-left border bg-surface-raised cursor-pointer",
                  "shadow-md hover:shadow-2xl transition-all duration-300",
                  isHovered
                    ? "border-brand-500 ring-2 ring-brand-500/20"
                    : "border-border/80"
                )}
              >
                {/* Micro Header with Flag & Certified Badge */}
                <div className="flex items-center justify-between gap-1.5 pb-2 border-b border-border/50">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base" role="img" aria-label={doc.country}>
                      {doc.flag}
                    </span>
                    <span className="text-[11px] font-bold text-brand-ink uppercase tracking-wider truncate">
                      {doc.country}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-brand-50 text-brand-600 border border-brand-200/60">
                    <CheckCircle2 className="w-2.5 h-2.5 text-brand-500 shrink-0" />
                    ATA Cert
                  </span>
                </div>

                {/* Document Body Mockup */}
                <div className="pt-2.5 pb-2 space-y-1.5">
                  <span className="block text-[10px] font-mono text-text-muted font-medium">
                    {doc.type}
                  </span>
                  <p className="text-xs font-bold text-brand-ink line-clamp-2 leading-snug">
                    {doc.originalTitle}
                  </p>
                  <p className="text-[10px] text-text-subtle truncate">
                    {doc.agency}
                  </p>
                </div>

                {/* Visual Stamp / Official Seal simulation */}
                <div
                  className={cn(
                    "my-1.5 px-2 py-1 rounded border text-[8px] font-mono font-bold flex items-center justify-between gap-1 truncate",
                    doc.sealColor
                  )}
                >
                  <span className="truncate flex items-center gap-1">
                    <Stamp className="w-2.5 h-2.5 shrink-0" />
                    {doc.sealText}
                  </span>
                  <Award className="w-3 h-3 shrink-0 opacity-80" />
                </div>

                {/* Simulated Text Lines */}
                <div className="space-y-1 py-1" aria-hidden="true">
                  <div className="h-1 w-full bg-border/40 rounded-full" />
                  <div className="h-1 w-4/5 bg-border/40 rounded-full" />
                  <div className="h-1 w-2/3 bg-border/30 rounded-full" />
                </div>

                {/* Footer Strip with Hash & Regulatory Standard */}
                <div className="pt-2 mt-1 border-t border-border/40 flex items-center justify-between text-[9px] font-mono text-text-muted">
                  <span className="text-brand-500 font-bold truncate max-w-[100px]">
                    {doc.badge}
                  </span>
                  <div className="flex items-center gap-1 shrink-0 text-text-subtle">
                    <QrCode className="w-3 h-3 text-brand-ink/70" />
                  </div>
                </div>

                {/* Hover Quick Action Glow Indicator */}
                {isHovered && (
                  <div className="absolute inset-x-0 -bottom-3 flex justify-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold text-white bg-brand-ink shadow-lg animate-in fade-in zoom-in-95 duration-200">
                      <ShieldCheck className="w-3 h-3 text-brand-300" />
                      View Certified Sample
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Helper caption */}
      <div className="text-center pt-2 text-xs font-mono text-text-muted flex items-center justify-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>140+ official formats sworn & certified across 90+ languages daily</span>
      </div>
    </div>
  );
}
