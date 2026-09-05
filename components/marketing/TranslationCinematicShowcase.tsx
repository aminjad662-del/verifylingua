"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
  Play,
  Pause,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  QrCode,
  Stamp,
  Layers,
  Sparkles,
  Lock,
  Gauge,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ShowcaseDoc {
  id: string;
  name: string;
  sourceLang: string;
  targetLang: string;
  type: string;
  originalHeader: string;
  translatedHeader: string;
  subHeaderEs: string;
  subHeaderEn: string;
  rows: { labelEs: string; labelEn: string; valEs: string; valEn: string }[];
  sealNoticeEs: string;
  sealNoticeEn: string;
  qrCode: string;
}

const SHOWCASE_DOCS: ShowcaseDoc[] = [
  {
    id: "birth",
    name: "Civil Birth Certificate",
    sourceLang: "Spanish",
    targetLang: "English",
    type: "USCIS Vital Record",
    originalHeader: "REPÚBLICA DE COLOMBIA • REGISTRO CIVIL DE NACIMIENTO",
    translatedHeader: "REPUBLIC OF COLOMBIA • CIVIL REGISTRY OF BIRTH",
    subHeaderEs: "NOTARÍA PRIMERA DEL CÍRCULO DE BOGOTÁ • FOLIO 0482",
    subHeaderEn: "FIRST NOTARIAL OFFICE OF BOGOTA DISTRICT • PAGE 0482",
    rows: [
      {
        labelEs: "Nombre Completo del Inscrito",
        labelEn: "Full Legal Name of Registered",
        valEs: "CAMILA SOFÍA VALENCIA MENDOZA",
        valEn: "CAMILA SOFIA VALENCIA MENDOZA",
      },
      {
        labelEs: "Fecha de Nacimiento",
        labelEn: "Date of Birth",
        valEs: "14 de Mayo de 1998 (14/05/1998)",
        valEn: "May 14, 1998 (05/14/1998)",
      },
      {
        labelEs: "Lugar de Nacimiento",
        labelEn: "Place of Birth",
        valEs: "Bogotá D.C., Cundinamarca, Colombia",
        valEn: "Bogota D.C., Cundinamarca, Colombia",
      },
      {
        labelEs: "Datos de Filiación (Padres)",
        labelEn: "Parentage Information",
        valEs: "Carlos Valencia & Elena Mendoza",
        valEn: "Carlos Valencia & Elena Mendoza",
      },
    ],
    sealNoticeEs: "[SELLO NOTARIAL EN RELIEVE: NOTARÍA 1 BOGOTÁ - FIRMA ILEGIBLE]",
    sealNoticeEn: "[EMBOSSED NOTARIAL SEAL: NOTARY 1 BOGOTA - SIGNATURE ILLEGIBLE]",
    qrCode: "VL-BOG-9842",
  },
  {
    id: "transcript",
    name: "University Transcript",
    sourceLang: "German",
    targetLang: "English",
    type: "WES & Academic Standards",
    originalHeader: "LUDWIG-MAXIMILIANS-UNIVERSITÄT MÜNCHEN • NOTENSPIEGEL",
    translatedHeader: "LUDWIG MAXIMILIAN UNIVERSITY OF MUNICH • OFFICIAL TRANSCRIPT",
    subHeaderEs: "FAKULTÄT FÜR INFORMATIK • MASTER OF SCIENCE",
    subHeaderEn: "FACULTY OF COMPUTER SCIENCE • MASTER OF SCIENCE",
    rows: [
      {
        labelEs: "Name des Studierenden",
        labelEn: "Student Legal Name",
        valEs: "MAXIMILIAN ALEXANDER VON BERG",
        valEn: "MAXIMILIAN ALEXANDER VON BERG",
      },
      {
        labelEs: "Matrikelnummer / Abschluss",
        labelEn: "Student ID / Conferred Degree",
        valEs: "LMU-849102 • Master of Science (Sehr Gut 1,2)",
        valEn: "LMU-849102 • Master of Science (High Honors 1.2)",
      },
      {
        labelEs: "Leistungspunkte (ECTS)",
        labelEn: "Total Credit Units (ECTS)",
        valEs: "120 ECTS • Vollständig Erbracht",
        valEn: "120 ECTS Credits • Fully Completed",
      },
      {
        labelEs: "Datum der Urkundenverleihung",
        labelEn: "Degree Conferred Date",
        valEs: "28. Juli 2022 (28/07/2022)",
        valEn: "July 28, 2022 (07/28/2022)",
      },
    ],
    sealNoticeEs: "[AMTLICHES UNIVERSITÄTSSIEGEL UND STEMPEL DES DEKANATS]",
    sealNoticeEn: "[OFFICIAL UNIVERSITY EMBOSSED SEAL & DEAN'S REGISTRAR STAMP]",
    qrCode: "VL-MUN-7104",
  },
  {
    id: "legal",
    name: "Court Power of Attorney",
    sourceLang: "French",
    targetLang: "English",
    type: "Federal Court Rule 902",
    originalHeader: "RÉPUBLIQUE FRANÇAISE • ACTE NOTARIÉ DE PROCURATION",
    translatedHeader: "FRENCH REPUBLIC • NOTARIAL ACT OF POWER OF ATTORNEY",
    subHeaderEs: "ÉTUDE NOTARIALE DE PARIS • RÉPERTOIRE N° 2023/889",
    subHeaderEn: "NOTARIAL PRACTICE OF PARIS • REPERTORY NO. 2023/889",
    rows: [
      {
        labelEs: "Mandant (Donneur d'Ordre)",
        labelEn: "Grantor / Principal",
        valEs: "ANTOINE MARCEL DELACOUR",
        valEn: "ANTOINE MARCEL DELACOUR",
      },
      {
        labelEs: "Objet de la Procuration",
        labelEn: "Scope of Power Granted",
        valEs: "Représentation Juridique & Actes d'Immigration",
        valEn: "Legal Representation & Immigration Filings",
      },
      {
        labelEs: "Légalisation / Apostille",
        labelEn: "Legalization / Hague Apostille",
        valEs: "Convention de La Haye du 5 Octobre 1961 - N° 4819",
        valEn: "Hague Convention of 5 October 1961 - No. 4819",
      },
      {
        labelEs: "Certification de Conformité",
        labelEn: "Certification of Conformity",
        valEs: "Copie Authentique Conforme à l'Original",
        valEn: "True Certified Copy Conforming to Original",
      },
    ],
    sealNoticeEs: "[SCEAU DE LA RÉPUBLIQUE FRANÇAISE & CACHET DU NOTAIRE]",
    sealNoticeEn: "[SEAL OF THE FRENCH REPUBLIC & NOTARY PUBLIC OFFICIAL STAMP]",
    qrCode: "VL-PAR-5531",
  },
];

export function TranslationCinematicShowcase() {
  const [selectedDocId, setSelectedDocId] = React.useState<string>("birth");
  const [isTranslated, setIsTranslated] = React.useState<boolean>(true);
  const [isScanning, setIsScanning] = React.useState<boolean>(true);
  const [scanSpeed, setScanSpeed] = React.useState<number>(1);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const docCardRef = React.useRef<HTMLDivElement>(null);
  const laserRef = React.useRef<HTMLDivElement>(null);
  const tweenRef = React.useRef<gsap.core.Tween | null>(null);

  const activeDoc = SHOWCASE_DOCS.find((d) => d.id === selectedDocId) || SHOWCASE_DOCS[0];

  // GSAP Laser Scan Tween with Scoping & Clean Cleanup
  useGSAP(
    () => {
      if (laserRef.current) {
        tweenRef.current = gsap.to(laserRef.current, {
          top: "92%",
          duration: 3.2,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }
    },
    { scope: containerRef }
  );

  // Play / Pause / Speed Controller
  React.useEffect(() => {
    if (tweenRef.current) {
      if (isScanning) {
        tweenRef.current.play();
        tweenRef.current.timeScale(scanSpeed);
      } else {
        tweenRef.current.pause();
      }
    }
  }, [isScanning, scanSpeed]);

  // GSAP Table Stagger Animation on Document Transition
  useGSAP(
    () => {
      gsap.fromTo(
        ".showcase-row",
        { opacity: 0.25, y: 6 },
        { opacity: 1, y: 0, duration: 0.28, stagger: 0.04, ease: "power2.out" }
      );
    },
    { dependencies: [selectedDocId, isTranslated], scope: containerRef }
  );

  // Tactile Mouse 3D Tilt Interaction (Emil Kowalski Philosophy)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!docCardRef.current) return;
    const rect = docCardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    gsap.to(docCardRef.current, {
      rotationY: x * 3.5,
      rotationX: -y * 3.5,
      transformPerspective: 1200,
      ease: "power2.out",
      duration: 0.35,
    });
  };

  const handleMouseLeave = () => {
    if (!docCardRef.current) return;
    gsap.to(docCardRef.current, {
      rotationY: 0,
      rotationX: 0,
      ease: "power2.out",
      duration: 0.5,
    });
  };

  const toggleSpeed = () => {
    const nextSpeed = scanSpeed === 1 ? 1.75 : scanSpeed === 1.75 ? 2.5 : 1;
    setScanSpeed(nextSpeed);
  };

  return (
    <section ref={containerRef} className="py-20 md:py-32 bg-canvas border-b border-border/60 relative overflow-hidden">
      {/* Warm Radiant Sunset Halo (Synthesia & Sunsama Reference Style) */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[550px] rounded-full bg-brand-500/10 blur-[140px] -z-10"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-6 space-y-12">
        {/* Flagship Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-brand-200/60 bg-brand-50 text-brand-500 text-xs font-mono font-bold uppercase tracking-wider">
            <Layers className="w-4 h-4 text-brand-500" />
            <span>Interactive Layout Preservation Simulator</span>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-brand-ink tracking-tight font-display leading-[1.02]">
            Look Inside the <br className="hidden sm:inline" />
            <span className="text-brand-500">1:1 Translation Engine.</span>
          </h2>

          <p className="text-base sm:text-lg text-ink-soft leading-relaxed">
            See how VerifyLingua transforms foreign legal documents into USCIS-accepted certified translations
            while locking geometric table boundaries, seals, and passport spellings.
          </p>
        </div>

        {/* Document Scenario Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          {SHOWCASE_DOCS.map((doc) => {
            const isSelected = doc.id === selectedDocId;
            return (
              <button
                key={doc.id}
                type="button"
                onClick={() => setSelectedDocId(doc.id)}
                className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all duration-200 flex items-center gap-2 ${
                  isSelected
                    ? "bg-brand-500 text-white shadow-md shadow-brand-500/20 scale-[1.02]"
                    : "bg-surface-raised border border-border/80 text-brand-ink hover:bg-surface hover:border-brand-500/40"
                }`}
              >
                <span>{doc.name}</span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                    isSelected ? "bg-white/20 text-white" : "bg-brand-50 text-brand-500"
                  }`}
                >
                  {doc.sourceLang} → {doc.targetLang}
                </span>
              </button>
            );
          })}
        </div>

        {/* Centerpiece Double-Bezel Cinematic Frame with GSAP 3D Tilt */}
        <div
          ref={docCardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="p-3 sm:p-4 rounded-[36px] bg-surface-raised/90 border border-border/80 shadow-2xl backdrop-blur-xl relative transition-shadow duration-300 hover:shadow-brand-500/10"
        >
          {/* Top Window Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-3 border-b border-border/60 bg-surface/60 rounded-t-[28px]">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-status-danger/70" />
                <span className="w-3 h-3 rounded-full bg-status-warning/70" />
                <span className="w-3 h-3 rounded-full bg-status-success/70" />
              </div>
              <span className="text-xs font-mono font-bold text-brand-ink hidden sm:inline">
                VerifyLingua Coordinate Visualizer • {activeDoc.type}
              </span>
            </div>

            {/* Interactive Toggle Controls */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsScanning((prev) => !prev)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  isScanning
                    ? "bg-brand-50 text-brand-500 border border-brand-200"
                    : "bg-surface text-ink-softer border border-border"
                }`}
                title={isScanning ? "Pause scanning beam" : "Play scanning beam"}
              >
                {isScanning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isScanning ? "Scanning Active" : "Scan Paused"}</span>
              </button>

              <button
                type="button"
                onClick={toggleSpeed}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-surface border border-border text-[11px] font-mono font-bold text-brand-ink hover:bg-brand-50"
                title="Toggle scan speed"
              >
                <Gauge className="w-3 h-3 text-brand-500" />
                <span>{scanSpeed}x</span>
              </button>

              <button
                type="button"
                onClick={() => setIsTranslated((prev) => !prev)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold shadow-sm transition-all active:scale-[0.97]"
              >
                <span>{isTranslated ? "Switch to Source Scan" : "Switch to Certified English"}</span>
              </button>
            </div>
          </div>

          {/* Interactive Document Sheet Canvas */}
          <div className="relative p-6 sm:p-10 md:p-12 rounded-[28px] bg-white border border-border shadow-inner text-brand-ink overflow-hidden min-h-[480px]">
            {/* GSAP Driven Laser Scanning Beam */}
            <div
              ref={laserRef}
              className={`absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-brand-500 to-transparent pointer-events-none shadow-[0_0_16px_rgba(59,130,246,0.65)] z-20 top-2 ${
                isScanning ? "opacity-100" : "opacity-0"
              } transition-opacity duration-300`}
            />

            {/* Status Overlay Watermark */}
            <div className="flex items-center justify-between pb-6 border-b border-gray-200">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-500 shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold tracking-widest text-brand-500 uppercase block">
                    {isTranslated ? "USCIS 8 CFR § 103.2(b)(3) CERTIFIED TRANSLATION" : "FOREIGN SOURCE DOCUMENT RECORD"}
                  </span>
                  <p className="text-xs font-semibold text-gray-500">
                    {isTranslated ? "Signed ATA Member Affidavit Attached" : "Original Civil Registry Copy"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="default" className="text-[11px] font-mono py-1 px-3 bg-brand-500 text-white">
                  {isTranslated ? "100% Geometry Match" : "Source Dimensions: 300 DPI"}
                </Badge>
              </div>
            </div>

            {/* Document Title Header */}
            <div className="py-6 text-center space-y-1.5 border-b border-gray-100">
              <h3 className="text-base sm:text-xl md:text-2xl font-black text-brand-ink tracking-tight font-display">
                {isTranslated ? activeDoc.translatedHeader : activeDoc.originalHeader}
              </h3>
              <p className="text-xs font-mono text-gray-500 uppercase tracking-wider">
                {isTranslated ? activeDoc.subHeaderEn : activeDoc.subHeaderEs}
              </p>
            </div>

            {/* Document Data Table Grid */}
            <div className="py-6 space-y-4">
              <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-200 text-xs sm:text-sm">
                {activeDoc.rows.map((row, idx) => (
                  <div
                    key={idx}
                    className="showcase-row grid grid-cols-12 divide-x divide-gray-200 hover:bg-brand-50/20 transition-colors"
                  >
                    <div className="col-span-4 sm:col-span-5 p-3 sm:p-4 font-bold text-gray-700 bg-gray-50/70">
                      {isTranslated ? row.labelEn : row.labelEs}
                    </div>
                    <div className="col-span-8 sm:col-span-7 p-3 sm:p-4 font-mono font-semibold text-brand-ink flex items-center justify-between">
                      <span>{isTranslated ? row.valEn : row.valEs}</span>
                      {isTranslated && (
                        <span className="text-[10px] font-mono text-status-success font-bold shrink-0 ml-2">
                          ✓ Verified
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Notarial Seal & Transcription Box */}
              <div className="p-3.5 rounded-xl border border-dashed border-gray-300 bg-gray-50/50 text-xs text-gray-600 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Stamp className="w-4 h-4 text-brand-500 shrink-0" />
                  <span className="font-mono">{isTranslated ? activeDoc.sealNoticeEn : activeDoc.sealNoticeEs}</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-brand-500 uppercase shrink-0">
                  Transcribed in [Brackets]
                </span>
              </div>
            </div>

            {/* Bottom Verification Footer & QR Seal */}
            <div className="pt-6 border-t border-gray-200 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gray-50 border border-gray-200 p-1 flex items-center justify-center shrink-0">
                  <QrCode className="w-9 h-9 text-brand-ink" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono uppercase text-brand-500 font-bold block">
                    Public Verification Portal
                  </span>
                  <p className="text-xs font-mono font-bold text-brand-ink">
                    /verify/{activeDoc.qrCode}
                  </p>
                  <p className="text-[10px] text-gray-500">
                    Cryptographic SHA-256 Ledger • Instant Consular Adjudication
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-status-success/10 text-status-success border border-status-success/20 text-xs font-bold font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>USCIS Competence Sworn</span>
                </div>
                <p className="text-[10px] text-gray-400 font-mono mt-1">
                  Signed: Elena Vance • ATA Cert No. 274892
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Interactive Checkpoints Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-surface/50 rounded-b-[28px] border-t border-border/60">
            <div className="p-3 rounded-xl bg-surface-raised border border-border/80 text-left space-y-1">
              <div className="flex items-center gap-1.5 text-brand-500 text-xs font-bold">
                <Lock className="w-3.5 h-3.5" />
                <span>Passport Name Lock</span>
              </div>
              <p className="text-[11px] text-ink-soft">
                Zero spelling variation against government MRZ passports.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-surface-raised border border-border/80 text-left space-y-1">
              <div className="flex items-center gap-1.5 text-brand-500 text-xs font-bold">
                <Layers className="w-3.5 h-3.5" />
                <span>Table Geometry Preserved</span>
              </div>
              <p className="text-[11px] text-ink-soft">
                Reconstructed into exact source cell boundaries and font hierarchy.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-surface-raised border border-border/80 text-left space-y-1">
              <div className="flex items-center gap-1.5 text-brand-500 text-xs font-bold">
                <Stamp className="w-3.5 h-3.5" />
                <span>Raised Seal Transcription</span>
              </div>
              <p className="text-[11px] text-ink-soft">
                All physical emblems and notary stamps accurately bracketed.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-surface-raised border border-border/80 text-left space-y-1">
              <div className="flex items-center gap-1.5 text-brand-500 text-xs font-bold">
                <QrCode className="w-3.5 h-3.5" />
                <span>Encrypted QR Verification</span>
              </div>
              <p className="text-[11px] text-ink-soft">
                Clerks can verify translator credentials with a phone camera scan.
              </p>
            </div>
          </div>
        </div>

        {/* Direct Action Link */}
        <div className="text-center pt-2">
          <Button asChild size="lg" className="gap-2 px-8 h-14 rounded-full font-bold shadow-lg active:scale-[0.97] bg-brand-500 hover:bg-brand-600 text-white">
            <Link href="/order/triage">
              Translate your document with 1:1 layout preservation
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
