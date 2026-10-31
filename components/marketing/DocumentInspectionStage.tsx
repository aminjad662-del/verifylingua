"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { 
  ShieldCheck, 
  QrCode, 
  CheckCircle2, 
  Copy, 
  Check, 
  Search, 
  Columns2, 
  MoveHorizontal,
  Lock,
  ChevronRight,
  ExternalLink,
  Sparkles
} from "lucide-react";
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from "motion/react";

export interface LegalClause {
  id: string;
  label: string;
  sourceText: string;
  translatedText: string;
  sourceCoordinate: string;
  statuteNotice: string;
}

export interface DocumentSpecimen {
  id: string;
  name: string;
  jurisdictionTag: string;
  sourceLanguage: string;
  targetLanguage: string;
  direction?: "ltr" | "rtl";
  authoritySource: string;
  authorityTranslated: string;
  sourceImagePath: string;
  clauses: LegalClause[];
  sealTranscription: {
    source: string;
    translated: string;
  };
  sha256Digest: string;
  qrCodeUrl: string;
  juratStatement: string;
  linguistCredential: string;
}

export const SPECIMENS: DocumentSpecimen[] = [
  {
    id: "colombian-birth",
    name: "Civil Birth Certificate",
    jurisdictionTag: "USCIS Vital Record",
    sourceLanguage: "Spanish",
    targetLanguage: "English",
    authoritySource: "REPUBLICA DE COLOMBIA : REGISTRO CIVIL DE NACIMIENTO",
    authorityTranslated: "REPUBLIC OF COLOMBIA : CIVIL REGISTRY OF BIRTH",
    sourceImagePath: "/images/docs/birth-certificate.jpg",
    clauses: [
      {
        id: "authority",
        label: "Issuing Notarial Authority",
        sourceText: "Notaria Primera del Circulo de Bogota : Folio 0482",
        translatedText: "First Notarial District of Bogota : Page 0482",
        sourceCoordinate: "X: 140, Y: 85 (300 DPI)",
        statuteNotice: "Civil Registry stamp typeset at exact original millimeter coordinates",
      },
      {
        id: "name",
        label: "Full Legal Name of Registered",
        sourceText: "CAMILA SOFIA VALENCIA MENDOZA",
        translatedText: "CAMILA SOFIA VALENCIA MENDOZA",
        sourceCoordinate: "X: 140, Y: 155 (300 DPI)",
        statuteNotice: "MRZ Passport name-locked to prevent USCIS petitioner mismatch",
      },
      {
        id: "vital",
        label: "Date and Place of Birth",
        sourceText: "14 de Mayo de 1998 (14/05/1998) : Bogota D.C.",
        translatedText: "May 14, 1998 (05/14/1998) : Bogota D.C., Colombia",
        sourceCoordinate: "X: 140, Y: 225 (300 DPI)",
        statuteNotice: "Dual-format date transcription strictly adhering to ISO standards",
      },
      {
        id: "filiation",
        label: "Parentage / Filiation Information",
        sourceText: "Carlos Valencia Ortiz & Elena Mendoza Salgado",
        translatedText: "Carlos Valencia Ortiz & Elena Mendoza Salgado",
        sourceCoordinate: "X: 140, Y: 295 (300 DPI)",
        statuteNotice: "Complete maternal and paternal lineage verified against registry",
      },
    ],
    sealTranscription: {
      source: "[SELLO NOTARIAL EN RELIEVE: NOTARIA 1 BOGOTA : FIRMA ILEGIBLE]",
      translated: "[EMBOSSED NOTARIAL SEAL: NOTARY 1 BOGOTA : SIGNATURE ILLEGIBLE]",
    },
    sha256Digest: "7d4a98f1c830b201a4e89b210459c31e89b21d01f82e04d7c81a942b8219c04a",
    qrCodeUrl: "VL-BOG-9842-CERT",
    juratStatement: "I certify that I am fluent in Spanish and English and that the translation is true, accurate, and complete to the best of my abilities under penalty of perjury.",
    linguistCredential: "Elena Vance : ATA Professional Member No. 278190",
  },
  {
    id: "mexican-apostille",
    name: "Civil Marriage & Hague Apostille",
    jurisdictionTag: "Hague Convention & Consular",
    sourceLanguage: "Spanish",
    targetLanguage: "English",
    authoritySource: "ESTADOS UNIDOS MEXICANOS : ACTA DE MATRIMONIO Y APOSTILLA",
    authorityTranslated: "UNITED MEXICAN STATES : MARRIAGE ACT & HAGUE APOSTILLE",
    sourceImagePath: "/images/docs/marriage-certificate.jpg",
    clauses: [
      {
        id: "authority",
        label: "Civil Registry & Apostille Registry",
        sourceText: "Juzgado 14 del Registro Civil CDMX : Folio 9821-C",
        translatedText: "14th Civil Registry Court CDMX : Page 9821-C",
        sourceCoordinate: "X: 140, Y: 85 (300 DPI)",
        statuteNotice: "Federal Evidentiary Rule 902(11) self-authenticating foreign record",
      },
      {
        id: "name",
        label: "Contracting Parties (Spouses)",
        sourceText: "Alejandro Morales Vega & Sofia Ines Castillo",
        translatedText: "Alejandro Morales Vega & Sofia Ines Castillo",
        sourceCoordinate: "X: 140, Y: 155 (300 DPI)",
        statuteNotice: "Spousal legal identities locked against consular visa applications",
      },
      {
        id: "vital",
        label: "Apostille Certificate Number",
        sourceText: "Convention de La Haye du 5 Octobre 1961 : N A-849201",
        translatedText: "Hague Convention of 5 October 1961 : No. A-849201",
        sourceCoordinate: "X: 140, Y: 225 (300 DPI)",
        statuteNotice: "Official Hague apostille verified against Mexican Secretariat ledger",
      },
      {
        id: "filiation",
        label: "Civil Status & Matrimonial Regime",
        sourceText: "Sociedad Conyugal : Testigos: Marcos Vega, Laura Pena",
        translatedText: "Community Property : Witnesses: Marcos Vega, Laura Pena",
        sourceCoordinate: "X: 140, Y: 295 (300 DPI)",
        statuteNotice: "Preserved 1:1 format for federal immigration marriage petitions",
      },
    ],
    sealTranscription: {
      source: "[SELLO DEL REGISTRO CIVIL DEL DISTRITO FEDERAL : FIRMA DEL JUEZ]",
      translated: "[SEAL OF THE FEDERAL DISTRICT CIVIL REGISTRY : JUDGE SIGNATURE]",
    },
    sha256Digest: "3e8f49b201a4e89b210459c31e89b21d017d4a98f1c830b201f82e04d7c81a94",
    qrCodeUrl: "VL-MEX-8492-APOST",
    juratStatement: "I hereby certify under penalty of perjury under the laws of the United States that this translation is a true and accurate English rendering of the Mexican civil record.",
    linguistCredential: "David Sterling : ATA Corporate Linguist No. 278190",
  },
  {
    id: "german-degree",
    name: "University Transcript & Diploma",
    jurisdictionTag: "WES & NACES Evaluation",
    sourceLanguage: "German",
    targetLanguage: "English",
    authoritySource: "LUDWIG-MAXIMILIANS-UNIVERSITAT MUNCHEN : NOTENSPIEGEL",
    authorityTranslated: "LUDWIG MAXIMILIAN UNIVERSITY OF MUNICH : TRANSCRIPT",
    sourceImagePath: "/images/docs/diploma.jpg",
    clauses: [
      {
        id: "authority",
        label: "Faculty & Dean of Informatics",
        sourceText: "Fakultat fur Informatik : Master-Urkunde",
        translatedText: "Faculty of Computer Science : Master Degree Certificate",
        sourceCoordinate: "X: 140, Y: 85 (300 DPI)",
        statuteNotice: "Official university academic credentials formatted for WES course evaluation",
      },
      {
        id: "name",
        label: "Student Legal Name",
        sourceText: "MAXIMILIAN ALEXANDER VON BERG",
        translatedText: "MAXIMILIAN ALEXANDER VON BERG",
        sourceCoordinate: "X: 140, Y: 155 (300 DPI)",
        statuteNotice: "Conferred degree identity verified against German matriculation ledger",
      },
      {
        id: "vital",
        label: "Conferred Degree & Grade Mark",
        sourceText: "Master of Science (Gesamtnote: Sehr Gut 1,2) : 120 ECTS",
        translatedText: "Master of Science (Final Grade: High Honors 1.2) : 120 ECTS",
        sourceCoordinate: "X: 140, Y: 225 (300 DPI)",
        statuteNotice: "Exact German grading scale transcribed with US equivalence notes",
      },
      {
        id: "filiation",
        label: "Date of Conferral & Registry",
        sourceText: "Munchen, den 28. Juli 2022 : Matrikel LMU-849102",
        translatedText: "Munich, July 28, 2022 : Student ID LMU-849102",
        sourceCoordinate: "X: 140, Y: 295 (300 DPI)",
        statuteNotice: "Official registrar seal and signature transcribed per academic standards",
      },
    ],
    sealTranscription: {
      source: "[AMTLICHES UNIVERSITATSSIEGEL UND STEMPEL DES DEKANATS]",
      translated: "[OFFICIAL UNIVERSITY EMBOSSED SEAL & DEAN REGISTRAR STAMP]",
    },
    sha256Digest: "9b21d017d4a98f1c830b201a4e89b210459c31e8f82e04d7c81a942b8219c04a",
    qrCodeUrl: "VL-MUN-7104-ACAD",
    juratStatement: "I certify that I am competent to translate German academic records into English and that the educational terminology corresponds faithfully to original degree requirements.",
    linguistCredential: "Clara Hoffmann : ATA Certified German-English Specialist",
  },
];

export const EGYPTIAN_BIRTH_SPECIMEN: DocumentSpecimen = {
  id: "egyptian-birth",
  name: "Civil Birth Certificate",
  jurisdictionTag: "USCIS Vital Record (Arabic)",
  sourceLanguage: "Arabic",
  targetLanguage: "English",
  direction: "rtl",
  authoritySource: "جمهورية مصر العربية : وزارة الداخلية - مصلحة الأحوال المدنية",
  authorityTranslated: "ARAB REPUBLIC OF EGYPT : MINISTRY OF INTERIOR - CIVIL STATUS ORGANIZATION",
  sourceImagePath: "/images/docs/egyptian-birth-certificate.jpg",
  clauses: [
    {
      id: "authority",
      label: "Issuing Civil Registry Office",
      sourceText: "مكتب صحة قصر النيل : محافظة القاهرة : قيد رقم ٨٤٩٢",
      translatedText: "Qasr El Nil Health Bureau : Cairo Governorate : Entry No. 8492",
      sourceCoordinate: "X: 460, Y: 85 (300 DPI)",
      statuteNotice: "BiDi HarfBuzz shaping preserved with Arabic-Indic digit parity",
    },
    {
      id: "name",
      label: "Full Legal Name of Registered",
      sourceText: "طارق عمر عبد الرحمن الشريف",
      translatedText: "TAREK OMAR ABDEL RAHMAN EL-SHERIF",
      sourceCoordinate: "X: 460, Y: 155 (300 DPI)",
      statuteNotice: "Transliterated per US Department of State and BGN standards",
    },
    {
      id: "vital",
      label: "Date and Place of Birth",
      sourceText: "١٥ شعبان ١٤١٩ هـ (1998/12/04 م) : القاهرة",
      translatedText: "December 4, 1998 (15 Sha'ban 1419 AH) : Cairo, Egypt",
      sourceCoordinate: "X: 460, Y: 225 (300 DPI)",
      statuteNotice: "Dual Hijri and Gregorian chronological conversion verified against astronomical ledger",
    },
    {
      id: "filiation",
      label: "Parentage / Filiation Information",
      sourceText: "الأب: عمر عبد الرحمن الشريف (مصري) / الأم: منى سامي الكردي (مصرية)",
      translatedText: "Father: Omar Abdel Rahman El-Sherif (Egyptian) / Mother: Mona Sami El-Kourdy (Egyptian)",
      sourceCoordinate: "X: 460, Y: 295 (300 DPI)",
      statuteNotice: "Maternal and paternal filiation verified per 8 CFR Section 204.2",
    },
  ],
  sealTranscription: {
    source: "[ختم شعار الجمهورية: مصلحة الأحوال المدنية بالقاهرة : توقيع الموثق]",
    translated: "[EMBOSSED ARAB REPUBLIC EMBLEM SEAL: CAIRO CIVIL STATUS AUTHORITY : REGISTRAR SIGNATURE]",
  },
  sha256Digest: "5c8b210459c31e89b21d017d4a98f1c830b201f82e04d7c81a942b8219c04a8f",
  qrCodeUrl: "VL-CAI-9182-EGYP",
  juratStatement: "I certify that I am competent to translate Arabic legal documents into English and that the Arabic-Indic numerals, dual Hijri dates, and Diacritics are faithfully transcribed under penalty of perjury.",
  linguistCredential: "Kareem Mansour : ATA Certified Arabic-English Master Translator No. 278190",
};

export const ALL_SPECIMENS: DocumentSpecimen[] = [
  ...SPECIMENS,
  EGYPTIAN_BIRTH_SPECIMEN,
];

export function DocumentInspectionStage() {
  const [selectedDocId, setSelectedDocId] = useState<string>("colombian-birth");
  const [activeMode, setActiveMode] = useState<"slider" | "side-by-side" | "loupe" | "ledger">("slider");
  const [sliderPos, setSliderPos] = useState<number>(50);
  const [isDraggingSlider, setIsDraggingSlider] = useState<boolean>(false);
  const [activeClauseId, setActiveClauseId] = useState<string | null>(null);
  const [hashCopied, setHashCopied] = useState<boolean>(false);
  const [simulatedCheck, setSimulatedCheck] = useState<boolean>(false);
  const [isTouchDevice, setIsTouchDevice] = useState<boolean>(false);
  const [stageWidth, setStageWidth] = useState<number>(600);

  const stageRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const activeDoc = ALL_SPECIMENS.find((d) => d.id === selectedDocId) || ALL_SPECIMENS[0];
  const isRtl = activeDoc.direction === "rtl";

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsTouchDevice(window.matchMedia("(pointer: coarse)").matches);
    }
    if (!stageRef.current) return;
    const updateWidth = () => {
      if (stageRef.current) setStageWidth(stageRef.current.clientWidth);
    };
    updateWidth();
    const ro = new ResizeObserver(updateWidth);
    ro.observe(stageRef.current);
    return () => ro.disconnect();
  }, []);

  const handleSliderKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    let step = 5;
    if (e.shiftKey) step = 10;
    switch (e.key) {
      case "ArrowLeft":
        e.preventDefault();
        setSliderPos((prev) => Math.max(0, Math.min(100, isRtl ? prev + step : prev - step)));
        break;
      case "ArrowRight":
        e.preventDefault();
        setSliderPos((prev) => Math.max(0, Math.min(100, isRtl ? prev - step : prev + step)));
        break;
      case "Home":
        e.preventDefault();
        setSliderPos(0);
        break;
      case "End":
        e.preventDefault();
        setSliderPos(100);
        break;
    }
  };

  // MOTION VALUE LOUPE MECHANICS (Compositor Thread Only - 0 React Re-renders on mousemove)
  const mouseX = useMotionValue(200);
  const mouseY = useMotionValue(200);
  const loupeOpacity = useMotionValue(0);

  const springConfig = shouldReduceMotion
    ? { stiffness: 1000, damping: 100 }
    : { stiffness: 400, damping: 30, mass: 0.1 };

  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const LOUPE_RADIUS = 80; // 160px diameter
  const MAGNIFICATION = 2.5;

  const lensLeft = useTransform(smoothX, (x) => x - LOUPE_RADIUS);
  const lensTop = useTransform(smoothY, (y) => y - LOUPE_RADIUS);
  const contentTranslateX = useTransform(smoothX, (x) => -x * MAGNIFICATION + LOUPE_RADIUS);
  const contentTranslateY = useTransform(smoothY, (y) => -y * MAGNIFICATION + LOUPE_RADIUS);

  // Pointer Movement across Stage Viewport
  const handleStagePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const relX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const relY = Math.max(0, Math.min(rect.height, e.clientY - rect.top));

    mouseX.set(relX);
    mouseY.set(relY);
    loupeOpacity.set(1);

    if (isDraggingSlider) {
      const pct = Math.max(0, Math.min(100, Math.round((relX / rect.width) * 100)));
      setSliderPos(pct);
    }
  };

  const handleStagePointerLeave = () => {
    loupeOpacity.set(0);
    if (isDraggingSlider) setIsDraggingSlider(false);
  };

  const handleSliderPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDraggingSlider(true);
  };

  const handleSliderPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
    setIsDraggingSlider(false);
  };

  const copyHash = () => {
    navigator.clipboard?.writeText(activeDoc.sha256Digest);
    setHashCopied(true);
    setTimeout(() => setHashCopied(false), 2000);
  };

  return (
    <div className="w-full rounded-2xl border border-border bg-surface-raised shadow-xl overflow-hidden text-left flex flex-col">
      
      {/* 1. TOP DOCKET CHROME & SPECIMEN SWITCHER */}
      <div className="p-3 sm:p-4 bg-surface border-b border-border space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-court-emerald animate-pulse" />
              <span className="w-2.5 h-2.5 rounded-full bg-border" />
              <span className="w-2.5 h-2.5 rounded-full bg-border" />
            </div>
            <span className="font-mono text-xs font-bold text-brand-ink ml-1 truncate">
              Docket No. {activeDoc.qrCodeUrl}.pdf
            </span>
            <span className="font-mono text-[10px] text-court-emerald font-semibold bg-court-emerald/10 px-2 py-0.5 rounded border border-court-emerald/30">
              {activeDoc.jurisdictionTag}
            </span>
          </div>

          {/* Mode Switcher Buttons */}
          <div className="flex items-center gap-1 bg-surface-raised p-0.5 rounded-lg border border-border">
            <button
              onClick={() => setActiveMode("slider")}
              className={`min-h-[44px] sm:min-h-[32px] px-3 py-2 sm:py-1 rounded-md text-[11px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer active:scale-[0.98] touch-manipulation ${
                activeMode === "slider"
                  ? "bg-brand-500 text-white shadow-2xs"
                  : "text-text-muted hover:text-brand-ink"
              }`}
            >
              <MoveHorizontal className="w-3 h-3" />
              <span>Split Slider</span>
            </button>
            <button
              onClick={() => setActiveMode("side-by-side")}
              className={`min-h-[44px] sm:min-h-[32px] px-3 py-2 sm:py-1 rounded-md text-[11px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer active:scale-[0.98] touch-manipulation ${
                activeMode === "side-by-side"
                  ? "bg-brand-500 text-white shadow-2xs"
                  : "text-text-muted hover:text-brand-ink"
              }`}
            >
              <Columns2 className="w-3 h-3" />
              <span>Side-by-Side</span>
            </button>
            <button
              onClick={() => setActiveMode("loupe")}
              className={`min-h-[44px] sm:min-h-[32px] px-3 py-2 sm:py-1 rounded-md text-[11px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer active:scale-[0.98] touch-manipulation ${
                activeMode === "loupe"
                  ? "bg-brand-500 text-white shadow-2xs"
                  : "text-text-muted hover:text-brand-ink"
              }`}
            >
              <Search className="w-3 h-3" />
              <span>2.5x Loupe</span>
            </button>
            <button
              onClick={() => setActiveMode("ledger")}
              className={`min-h-[44px] sm:min-h-[32px] px-3 py-2 sm:py-1 rounded-md text-[11px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer active:scale-[0.98] touch-manipulation ${
                activeMode === "ledger"
                  ? "bg-brand-500 text-white shadow-2xs"
                  : "text-text-muted hover:text-brand-ink"
              }`}
            >
              <QrCode className="w-3 h-3" />
              <span>Audit Ledger</span>
            </button>
          </div>
        </div>

        {/* Specimen Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {ALL_SPECIMENS.map((doc) => {
            const isSelected = doc.id === selectedDocId;
            return (
              <button
                key={doc.id}
                onClick={() => setSelectedDocId(doc.id)}
                className={`min-h-[44px] sm:min-h-[32px] px-3.5 py-2 sm:py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer active:scale-[0.98] flex items-center gap-1.5 touch-manipulation ${
                  isSelected
                    ? "bg-brand-50 text-brand-ink border border-brand-200"
                    : "text-text-muted hover:text-brand-ink hover:bg-surface-raised border border-transparent"
                }`}
              >
                <span>{doc.name}</span>
                <span className="font-mono text-[10px] text-text-subtle">
                  ({doc.sourceLanguage} to EN)
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. THE DOCUMENT INSPECTION VIEWPORT CANVAS */}
      <div
        ref={stageRef}
        onPointerMove={handleStagePointerMove}
        onPointerLeave={handleStagePointerLeave}
        className="relative min-h-[460px] bg-canvas overflow-hidden select-none"
      >
        
        {/* MODE 1: SPLIT COMPARISON SLIDER */}
        {activeMode === "slider" && (
          <div className="relative w-full h-[460px] flex items-center justify-center">
            {/* Base Layer: Certified English Translation */}
            <div className="absolute inset-0 p-6 sm:p-8 bg-surface-raised flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div className="space-y-0.5">
                    <span className="font-mono text-[10px] font-bold text-court-emerald uppercase tracking-wider block">
                      USCIS 8 CFR Section 103.2 CERTIFIED TRANSLATION
                    </span>
                    <h3 className="font-bold text-brand-ink text-sm sm:text-base font-display">
                      {activeDoc.authorityTranslated}
                    </h3>
                  </div>
                  <span className="font-mono text-[10px] bg-court-emerald/10 text-court-emerald px-2 py-0.5 rounded font-bold border border-court-emerald/20">
                    1:1 LOCKED
                  </span>
                </div>

                <div className="space-y-3">
                  {activeDoc.clauses.map((clause) => (
                    <div
                      key={clause.id}
                      className="p-2.5 rounded-xl border border-border/80 bg-surface/50 text-xs flex justify-between items-start gap-4"
                    >
                      <div className="space-y-0.5">
                        <span className="font-mono text-[10px] text-text-subtle uppercase block">
                          {clause.label}
                        </span>
                        <div className="font-semibold text-brand-ink text-xs">
                          {clause.translatedText}
                        </div>
                      </div>
                      <span className="font-mono text-[10px] text-text-subtle shrink-0">
                        {clause.sourceCoordinate}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="p-3 rounded-xl border border-dashed border-border bg-surface text-xs flex items-center justify-between">
                  <span className="font-mono text-[11px] text-text-muted">
                    {activeDoc.sealTranscription.translated}
                  </span>
                  <span className="font-mono text-[10px] text-brand-ink font-bold uppercase shrink-0">
                    Transcription [Brackets]
                  </span>
                </div>
              </div>

              {/* Bottom Stamp Jurat */}
              <div className="pt-3 border-t border-border flex items-center justify-between text-[11px] font-mono text-text-muted">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-court-emerald" />
                  {activeDoc.linguistCredential}
                </span>
                <span className="text-brand-ink font-bold">
                  SHA-256 Verified
                </span>
              </div>
            </div>

            {/* Overlaid Layer: Foreign Scanned Record (Clipped by Slider) */}
            <div
              className="absolute inset-0 p-6 sm:p-8 bg-canvas-subtle/70 flex flex-col justify-between overflow-hidden pointer-events-none"
              dir={isRtl ? "rtl" : "ltr"}
              style={{
                clipPath: isRtl ? `inset(0 0 0 ${100 - sliderPos}%)` : `inset(0 ${100 - sliderPos}% 0 0)`,
                transition: isDraggingSlider ? "none" : "clip-path 200ms cubic-bezier(0.32, 0.72, 0, 1)",
              }}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div className="space-y-0.5">
                    <span className="font-mono text-[10px] font-bold text-amber-statutory uppercase tracking-wider block">
                      FOREIGN CIVIL SOURCE DOCUMENT (ORIGINAL SCAN)
                    </span>
                    <h3 className={`font-bold text-brand-ink text-sm sm:text-base ${isRtl ? "font-arabic" : "font-serif italic"}`}>
                      {activeDoc.authoritySource}
                    </h3>
                  </div>
                  <span className="font-mono text-[10px] bg-amber-statutory/15 text-amber-statutory px-2 py-0.5 rounded font-bold border border-amber-statutory/30">
                    300 DPI RASTER
                  </span>
                </div>

                <div className="space-y-3">
                  {activeDoc.clauses.map((clause) => (
                    <div
                      key={clause.id}
                      className="p-2.5 rounded-xl border border-amber-statutory/30 bg-amber-statutory/5 text-xs flex justify-between items-start gap-4"
                    >
                      <div className="space-y-0.5">
                        <span className="font-mono text-[10px] text-amber-statutory uppercase block">
                          {clause.label} (Original)
                        </span>
                        <div className={`text-brand-ink text-xs font-semibold ${isRtl ? "font-arabic text-sm" : "font-serif"}`}>
                          {clause.sourceText}
                        </div>
                      </div>
                      <span className="font-mono text-[10px] text-amber-statutory shrink-0">
                        Physical Ink
                      </span>
                    </div>
                  ))}
                </div>

                <div className="p-3 rounded-xl border border-dashed border-amber-statutory/40 bg-amber-statutory/5 text-xs flex items-center justify-between">
                  <span className="font-mono text-[11px] text-brand-ink font-serif italic">
                    {activeDoc.sealTranscription.source}
                  </span>
                  <span className="font-mono text-[10px] text-amber-statutory font-bold uppercase shrink-0">
                    Foreign State Seal
                  </span>
                </div>
              </div>

              {/* Bottom Stamp Jurat */}
              <div className="pt-3 border-t border-amber-statutory/30 flex items-center justify-between text-[11px] font-mono text-amber-statutory">
                <span>Civil Folio Registered</span>
                <span>Original Physical Record</span>
              </div>
            </div>

            {/* Draggable Divider Line & Grip Knob */}
            <div
              className="absolute top-0 bottom-0 z-30 pointer-events-none"
              style={{ left: `${isRtl ? 100 - sliderPos : sliderPos}%` }}
            >
              <div className="absolute top-0 bottom-0 w-0.5 bg-signal-accent -translate-x-1/2 shadow-sm" />
              
              <div
                role="slider"
                aria-label="Document comparison split slider"
                aria-valuenow={sliderPos}
                aria-valuemin={0}
                aria-valuemax={100}
                tabIndex={0}
                onKeyDown={handleSliderKeyDown}
                onPointerDown={handleSliderPointerDown}
                onPointerUp={handleSliderPointerUp}
                className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-11 h-11 sm:w-10 sm:h-10 rounded-full bg-surface-raised border border-border shadow-lg flex items-center justify-center text-brand-ink cursor-ew-resize hover:scale-110 active:scale-95 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 transition-transform pointer-events-auto touch-manipulation"
                title="Drag to compare original scan and certified translation"
              >
                <MoveHorizontal className="w-4 h-4 text-signal-accent" />
              </div>
            </div>

            {/* Preset Ratio Chips */}
            <div className="absolute bottom-3 left-4 z-40 flex items-center gap-1.5 bg-surface-raised/90 backdrop-blur px-2 py-1 rounded-lg border border-border shadow-2xs">
              <span className="font-mono text-[10px] text-text-subtle mr-1">PRESETS:</span>
              <button
                onClick={() => setSliderPos(100)}
                className={`min-h-[44px] sm:min-h-[26px] px-2.5 py-2 sm:py-0.5 rounded text-[10px] font-mono font-semibold transition-colors cursor-pointer active:scale-[0.98] touch-manipulation flex items-center ${
                  sliderPos === 100 ? "bg-brand-500 text-white" : "hover:bg-surface text-text-muted"
                }`}
              >
                100% Scan
              </button>
              <button
                onClick={() => setSliderPos(50)}
                className={`min-h-[44px] sm:min-h-[26px] px-2.5 py-2 sm:py-0.5 rounded text-[10px] font-mono font-semibold transition-colors cursor-pointer active:scale-[0.98] touch-manipulation flex items-center ${
                  sliderPos === 50 ? "bg-brand-500 text-white" : "hover:bg-surface text-text-muted"
                }`}
              >
                50/50 Split
              </button>
              <button
                onClick={() => setSliderPos(0)}
                className={`min-h-[44px] sm:min-h-[26px] px-2.5 py-2 sm:py-0.5 rounded text-[10px] font-mono font-semibold transition-colors cursor-pointer active:scale-[0.98] touch-manipulation flex items-center ${
                  sliderPos === 0 ? "bg-brand-500 text-white" : "hover:bg-surface text-text-muted"
                }`}
              >
                100% English
              </button>
            </div>
          </div>
        )}

        {/* MODE 2: SYNCHRONIZED SIDE-BY-SIDE CLAUSE MAPPING */}
        {activeMode === "side-by-side" && (
          <div className="p-5 sm:p-6 h-[460px] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between text-[11px] font-mono text-text-subtle">
              <span>SYNCHRONIZED CLAUSE PARITY INSPECTION</span>
              <span className="text-court-emerald font-bold">1:1 GEOMETRIC CORRESPONDENCE</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
              {/* Source Column */}
              <div className="space-y-3" dir={isRtl ? "rtl" : "ltr"}>
                <div className="font-mono text-[10px] text-amber-statutory uppercase font-bold flex items-center justify-between">
                  <span>FOREIGN SOURCE SCAN</span>
                  <span>{activeDoc.sourceLanguage}</span>
                </div>
                {activeDoc.clauses.map((clause) => {
                  const isHovered = activeClauseId === clause.id;
                  return (
                    <div
                      key={clause.id}
                      onMouseEnter={() => setActiveClauseId(clause.id)}
                      onMouseLeave={() => setActiveClauseId(null)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        isHovered
                          ? "bg-amber-statutory/15 border-signal-accent shadow-2xs"
                          : "bg-surface border-border hover:border-border-strong"
                      }`}
                    >
                      <div className="flex items-center justify-between font-mono text-[10px] text-text-subtle mb-1">
                        <span>{clause.label}</span>
                        <span>{clause.sourceCoordinate}</span>
                      </div>
                      <div className={`text-brand-ink text-xs font-semibold ${isRtl ? "font-arabic text-sm text-right" : "font-serif"}`}>
                        {clause.sourceText}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Translation Column */}
              <div className="space-y-3">
                <div className="font-mono text-[10px] text-brand-ink uppercase font-bold flex items-center justify-between">
                  <span>CERTIFIED TRANSLATION</span>
                  <span>English (USCIS)</span>
                </div>
                {activeDoc.clauses.map((clause) => {
                  const isHovered = activeClauseId === clause.id;
                  return (
                    <div
                      key={clause.id}
                      onMouseEnter={() => setActiveClauseId(clause.id)}
                      onMouseLeave={() => setActiveClauseId(null)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        isHovered
                          ? "bg-brand-50 border-brand-500 shadow-2xs"
                          : "bg-surface border-border hover:border-border-strong"
                      }`}
                    >
                      <div className="flex items-center justify-between font-mono text-[10px] text-brand-ink mb-1">
                        <span>{clause.label}</span>
                        <span className="flex items-center gap-1 font-bold text-court-emerald">
                          <CheckCircle2 className="w-3 h-3" />
                          LOCKED
                        </span>
                      </div>
                      <div className="font-sans text-brand-ink text-xs font-semibold">
                        {clause.translatedText}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Clause Detail Callout */}
            {activeClauseId && (
              <div className="p-3 rounded-xl bg-surface-raised border border-brand-200 text-xs flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="font-mono text-[10px] text-signal-accent font-bold uppercase">
                    ACTIVE INSPECTION TARGET
                  </span>
                  <p className="text-text-muted text-[11px]">
                    {activeDoc.clauses.find((c) => c.id === activeClauseId)?.statuteNotice}
                  </p>
                </div>
                <span className="font-mono text-[10px] font-bold text-court-emerald bg-court-emerald/10 px-2 py-0.5 rounded border border-court-emerald/30">
                  PASSPORT MRZ MATCH
                </span>
              </div>
            )}
          </div>
        )}

        {/* MODE 3: DYNAMIC 2.5X OPTICAL MAGNIFICATION LOUPE */}
        {activeMode === "loupe" && (
          <div className="relative w-full h-[460px] p-6 sm:p-8 bg-surface-raised flex flex-col justify-between overflow-hidden">
            {/* Base Document Content */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="space-y-0.5">
                  <span className="font-mono text-[10px] font-bold text-court-emerald uppercase tracking-wider block">
                    USCIS 8 CFR Section 103.2 CERTIFIED TRANSLATION
                  </span>
                  <h3 className="font-bold text-brand-ink text-base font-display">
                    {activeDoc.authorityTranslated}
                  </h3>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-[10px] text-brand-ink bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                  <Search className="w-3 h-3 text-signal-accent" />
                  <span>HOVER TO MAGNIFY (2.5X)</span>
                </div>
              </div>

              <div className="space-y-3">
                {activeDoc.clauses.map((clause) => (
                  <div
                    key={clause.id}
                    className="p-3 rounded-xl border border-border/80 bg-surface/40 text-xs flex justify-between items-start"
                  >
                    <div className="space-y-0.5">
                      <span className="font-mono text-[10px] text-text-subtle uppercase block">
                        {clause.label}
                      </span>
                      <div className="font-semibold text-brand-ink text-xs">
                        {clause.translatedText}
                      </div>
                    </div>
                    <span className="font-mono text-[10px] text-text-subtle">
                      {clause.sourceCoordinate}
                    </span>
                  </div>
                ))}
              </div>

              <div className="p-3.5 rounded-xl border border-dashed border-border bg-surface text-xs flex items-center justify-between">
                <span className="font-mono text-[11px] text-text-muted">
                  {activeDoc.sealTranscription.translated}
                </span>
                <span className="font-mono text-[10px] text-brand-ink font-bold uppercase">
                  Notary Raised Seal
                </span>
              </div>
            </div>

            {/* Bottom Sworn Affidavit */}
            <div className="pt-3 border-t border-border flex items-center justify-between text-[11px] font-mono text-text-muted">
              <span>{activeDoc.linguistCredential}</span>
              <span className="text-court-emerald font-bold">2.5x Reticle Active</span>
            </div>

            {/* DYNAMIC LOUPE APERTURE (Compositor Only) */}
            {!isTouchDevice && (
              <motion.div
                style={{
                  left: lensLeft,
                  top: lensTop,
                  opacity: loupeOpacity,
                }}
                className="absolute w-40 h-40 rounded-full border-2 border-signal-accent bg-surface-raised shadow-2xl overflow-hidden pointer-events-none z-50 ring-4 ring-black/5"
              >
                {/* Scaled & Offset Internal Layer */}
                <motion.div
                  style={{
                    x: contentTranslateX,
                    y: contentTranslateY,
                    transformOrigin: "0 0",
                    width: stageWidth || 600,
                    height: 460,
                    scale: MAGNIFICATION,
                  }}
                  className="p-6 bg-surface-raised"
                >
                  <div className="space-y-4">
                    <h3 className="font-bold text-brand-ink text-base">
                      {activeDoc.authorityTranslated}
                    </h3>
                    <div className="space-y-3">
                      {activeDoc.clauses.map((clause) => (
                        <div key={clause.id} className="p-2 border border-border text-xs">
                          <div className="font-mono text-[9px] text-text-subtle">{clause.label}</div>
                          <div className="font-bold text-brand-ink text-xs">{clause.translatedText}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>

                {/* Central Optical Reticle Crosshair */}
                <div className="absolute inset-0 m-auto w-4 h-4 rounded-full border border-signal-accent/80 pointer-events-none flex items-center justify-center">
                  <div className="w-1 h-1 rounded-full bg-signal-accent" />
                </div>

                {/* Reticle Readout Badge */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-brand-ink text-white font-mono text-[9px] font-bold tracking-widest shadow-md">
                  2.5x ZOOM
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* MODE 4: CRYPTOGRAPHIC AUDIT LEDGER & QR PROOF */}
        {activeMode === "ledger" && (
          <div className="p-6 h-[460px] flex flex-col justify-between space-y-4 text-xs">
            <div className="space-y-4">
              <div className="flex items-center justify-between font-mono text-[11px]">
                <span className="text-text-subtle">PUBLIC VERIFICATION DIGEST</span>
                <span className="font-bold text-court-emerald bg-court-emerald/10 px-2 py-0.5 rounded border border-court-emerald/30">
                  {simulatedCheck ? "ADJUDICATOR CONFIRMED" : "IMMUTABLE LEDGER"}
                </span>
              </div>

              {/* SHA-256 Checksum Card */}
              <div className="p-4 rounded-xl bg-surface border border-border font-mono text-[11px] space-y-1.5">
                <div className="text-[10px] text-text-subtle uppercase">
                  SHA-256 TAMPER-EVIDENT DOCUMENT CHECKSUM
                </div>
                <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-surface-raised border border-border">
                  <span className="truncate text-brand-ink font-bold select-all">
                    {activeDoc.sha256Digest}
                  </span>
                  <button
                    onClick={copyHash}
                    className="min-h-[44px] min-w-[44px] flex items-center justify-center p-1.5 rounded hover:bg-surface text-text-muted hover:text-brand-ink transition-colors cursor-pointer shrink-0 active:scale-[0.98] touch-manipulation"
                    title="Copy SHA-256 digest"
                  >
                    {hashCopied ? (
                      <Check className="w-4 h-4 text-court-emerald" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* QR Verification Proof Card */}
              <div className="p-4 rounded-xl bg-surface border border-border flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-surface-raised border border-border flex items-center justify-center text-brand-ink shrink-0 shadow-2xs">
                  <QrCode className="w-8 h-8 text-signal-accent" />
                </div>
                <div className="space-y-1 min-w-0">
                  <div className="font-bold text-brand-ink text-xs">
                    Adjudicator Instant QR Verification Route
                  </div>
                  <div className="font-mono text-[11px] text-text-muted truncate">
                    verifylingua.pages.dev/verify/{activeDoc.qrCodeUrl}
                  </div>
                  <div className="text-[10px] text-court-emerald font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Federal Evidentiary Rule 902(11) Self-Authenticating Record
                  </div>
                </div>
              </div>

              {/* Sworn Jurat Text */}
              <div className="p-3.5 rounded-xl bg-surface border border-border text-[11px] space-y-1">
                <div className="font-bold text-brand-ink flex items-center justify-between">
                  <span>8 CFR Section 103.2(b)(3) Competence Statement</span>
                  <span className="font-mono text-[10px] text-signal-accent font-bold">ATA Member No. 278190</span>
                </div>
                <p className="text-text-muted font-serif italic leading-relaxed">
                  "{activeDoc.juratStatement}"
                </p>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-border flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1.5 text-text-subtle font-mono">
                <Lock className="w-3.5 h-3.5 text-court-emerald" />
                Statutory Ephemeral Vault
              </span>
              <button
                onClick={() => setSimulatedCheck(!simulatedCheck)}
                className="min-h-[44px] inline-flex items-center font-bold text-brand-ink hover:text-signal-accent cursor-pointer active:scale-[0.98] transition-transform touch-manipulation"
              >
                {simulatedCheck ? "Reset verification simulation" : "Simulate consular QR check"}
              </button>
            </div>
          </div>
        )}

      </div>

      {/* 3. DOCKET FOOTER HUD STRIP */}
      <div className="h-11 px-4 bg-surface border-t border-border flex items-center justify-between text-xs font-mono text-text-subtle">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-court-emerald shrink-0" />
          <span className="truncate">ATA Member No. 278190 : 28 U.S.C. Section 1746 Sworn</span>
        </div>
        <Link
          href="/verify"
          className="font-semibold text-brand-ink hover:text-signal-accent flex items-center gap-1 transition-colors active:scale-[0.98]"
        >
          <span>Public verification route</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

    </div>
  );
}
