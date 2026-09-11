"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import {
  ShieldCheck,
  Search,
  ArrowRight,
  CheckCircle2,
  Star,
  Camera,
  Award,
  QrCode,
  Stamp,
  Lock,
  FileCheck2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function SpyglassHero() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState("");
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const onDrop = React.useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        const reader = new FileReader();
        reader.onload = () => {
          try {
            sessionStorage.setItem(
              "pending_upload",
              JSON.stringify({
                fileName: file.name,
                fileSize: file.size,
                sourceLang: "auto",
                targetLang: "en",
                fileCount: acceptedFiles.length,
                fileBase64: (reader.result as string)?.split(",")[1] || "",
              })
            );
          } catch {
            // ignore sessionStorage error
          }
          router.push("/order/triage?source=auto&target=en");
        };
        reader.readAsDataURL(file);
      }
    },
    [router]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "application/msword": [".doc"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
    },
    maxSize: 50 * 1024 * 1024,
    noClick: false,
  });

  const handleCameraClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleCameraChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      try {
        sessionStorage.setItem(
          "pending_upload",
          JSON.stringify({
            fileName: file.name || "camera-scan.jpg",
            fileSize: file.size,
            sourceLang: "auto",
            targetLang: "en",
            fileCount: 1,
            isCameraScan: true,
          })
        );
      } catch {
        // ignore
      }
      router.push("/order/triage?source=auto&target=en&camera=true");
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/documents?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/order/triage");
    }
  };

  return (
    <section className="relative pt-12 sm:pt-16 md:pt-20 pb-16 lg:pb-24 overflow-hidden bg-canvas border-b border-border/40 dark:border-white/10 transition-colors duration-200">
      {/* Ambient celestial cosmic radial glow matching Slice 0 */}
      <div className="pointer-events-none absolute inset-0 dark-radial-hero opacity-0 dark:opacity-100 transition-opacity duration-300" />

      {/* Hidden camera upload input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleCameraChange}
        aria-label="Scan document with camera"
      />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Editorial Headline, Subtext, Pill CTA */}
          <div className="lg:col-span-6 space-y-7 text-left">
            {/* Pill Eyebrow Badge matching Spyglass minimalism */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border/80 bg-surface text-brand-ink dark:bg-white/5 dark:border-white/15 dark:text-slate-200 text-xs font-mono font-bold tracking-wider">
              <ShieldCheck className="w-4 h-4 text-brand-500 shrink-0" />
              <span>USCIS 8 CFR § 204.2 COMPLIANT • 100% ACCEPTANCE</span>
            </div>

            {/* Editorial Display Heading matching Spyglass typography */}
            <div className="space-y-3">
              <h1 className="text-5xl sm:text-6xl xl:text-7xl font-bold tracking-tight text-brand-ink dark:text-white leading-[1.03] font-display">
                Stop filing <br />
                <span className="font-serif italic font-normal text-brand-900 dark:text-slate-300 block mt-1">
                  with uncertified translations.
                </span>
              </h1>
              <p className="text-base sm:text-lg text-text-muted dark:text-slate-400 leading-relaxed max-w-xl">
                Precision automated document processing that strictly preserves your original layout, tables, and typography.
                VerifyLingua delivers court-admissible, notarized translations with cryptographic verification in minutes, not days.
              </p>
            </div>

            {/* Primary Action Button & Secondary Document Explore Link */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-1">
              <Link
                href="/order/triage"
                className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full bg-brand-ink hover:bg-brand-900 text-white dark:bg-white dark:text-black dark:hover:bg-slate-200 dark:shadow-[0_0_25px_rgba(255,255,255,0.25)] text-sm sm:text-base font-bold shadow-md transition-all duration-200 active:scale-95 group shrink-0"
              >
                <span>Translate Your Documents</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/documents"
                className="text-xs sm:text-sm font-semibold text-text-muted hover:text-brand-ink dark:text-slate-400 dark:hover:text-white transition-colors flex items-center gap-1.5 py-2"
              >
                <span>Explore 140+ official formats</span>
                <span className="text-brand-500">→</span>
              </Link>
            </div>

            {/* Interactive Dropzone & Quick Search Bar */}
            <div
              {...getRootProps()}
              className={cn(
                "relative flex items-center gap-2 p-2 rounded-2xl border transition-all duration-200 bg-surface-raised dark:bg-white/5 shadow-sm cursor-pointer mt-4",
                isDragActive
                  ? "border-brand-500 ring-4 ring-brand-500/20 bg-brand-50/50 dark:bg-brand-500/20"
                  : "border-border/80 dark:border-white/15 hover:border-brand-500/50 dark:hover:border-white/30"
              )}
            >
              <input {...getInputProps()} aria-label="Drop legal documents here" />
              <Search className="w-4 h-4 text-text-subtle dark:text-slate-400 ml-2 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSearchSubmit(e);
                  }
                }}
                placeholder={
                  isDragActive
                    ? "Release files to start instant translation..."
                    : "Drop document or search (e.g. Mexican Birth Certificate)..."
                }
                className="w-full bg-transparent border-0 text-xs sm:text-sm text-brand-ink dark:text-white placeholder:text-text-subtle dark:placeholder:text-slate-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleCameraClick}
                className="p-2 rounded-xl text-text-muted hover:text-brand-ink dark:text-slate-400 dark:hover:text-white hover:bg-surface dark:hover:bg-white/10 border border-transparent hover:border-border dark:hover:border-white/15 transition-colors shrink-0"
                title="Scan document with camera"
              >
                <Camera className="w-4 h-4 text-brand-500" />
              </button>
            </div>

            {/* Social Proof Trust Snippet */}
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-text-muted dark:text-slate-400">
              <div className="flex items-center gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <span className="font-bold text-brand-ink dark:text-white">4.98/5</span>
              <span className="text-border-strong dark:text-slate-600">•</span>
              <span>2,400+ Law Firms & Applicants</span>
              <span className="text-border-strong dark:text-slate-600">•</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> 0% USCIS Rejection Rate
              </span>
            </div>
          </div>

          {/* Right Column: Asymmetric Floating Layered Stack of Translated Documents */}
          <div className="lg:col-span-6 relative flex items-center justify-center min-h-[480px] sm:min-h-[540px]">
            {/* Ambient shadow gradient */}
            <div className="pointer-events-none absolute inset-0 bg-radial-gradient from-brand-100/40 via-transparent to-transparent blur-3xl opacity-70" />

            {/* Floating Document Collage Container */}
            <div className="relative w-full max-w-lg mx-auto h-[500px]">
              {/* Card 1: Top-Left - Mexican Birth Certificate (Acta de Nacimiento) */}
              <div className="absolute top-0 left-2 w-64 sm:w-72 p-4 rounded-2xl bg-surface-raised dark:bg-slate-900/95 border border-border dark:border-white/15 shadow-xl dark:shadow-black/60 transform -rotate-3 hover:-rotate-1 hover:scale-105 transition-all duration-300 z-10">
                <div className="flex items-center justify-between pb-2 border-b border-border/60 dark:border-white/10">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">🇲🇽</span>
                    <span className="text-[11px] font-bold text-brand-ink dark:text-white uppercase font-mono">
                      Civil Registry
                    </span>
                  </div>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
                    USCIS Ready
                  </span>
                </div>
                <div className="pt-2.5 pb-2 space-y-1">
                  <span className="text-[10px] font-mono text-text-subtle dark:text-slate-400 block">
                    MEXICAN BIRTH CERTIFICATE
                  </span>
                  <p className="text-xs font-bold text-brand-ink dark:text-white leading-snug">
                    Acta de Nacimiento No. 49102
                  </p>
                  <div className="space-y-1 py-1" aria-hidden="true">
                    <div className="h-1.5 w-full bg-border/40 dark:bg-white/10 rounded-full" />
                    <div className="h-1.5 w-4/5 bg-border/40 dark:bg-white/10 rounded-full" />
                  </div>
                </div>
                <div className="p-2 rounded border border-amber-600/30 dark:border-amber-500/30 bg-amber-500/10 dark:bg-amber-950/40 text-[9px] font-mono font-bold text-amber-800 dark:text-amber-300 flex items-center justify-between">
                  <span className="flex items-center gap-1 truncate">
                    <Stamp className="w-3 h-3 shrink-0" />
                    REGISTRO CIVIL SELLO OFICIAL
                  </span>
                  <Award className="w-3 h-3 shrink-0 text-amber-700 dark:text-amber-400" />
                </div>
              </div>

              {/* Card 2: Top-Right - ATA Sworn Competency Affidavit */}
              <div className="absolute top-6 right-2 w-64 sm:w-72 p-4 rounded-2xl bg-brand-ink text-white dark:bg-slate-950/95 border border-white/10 dark:border-white/20 shadow-2xl dark:shadow-black/80 transform rotate-3 hover:rotate-1 hover:scale-105 transition-all duration-300 z-20">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-brand-300" />
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-300">
                      ATA Affidavit
                    </span>
                  </div>
                  <span className="text-[9px] font-mono text-white/50">
                    8 CFR § 204.2
                  </span>
                </div>
                <div className="pt-2 space-y-1.5">
                  <div className="text-[11px] font-bold text-white leading-tight">
                    Certificate of Translator Competency
                  </div>
                  <p className="text-[10px] text-white/70 italic leading-relaxed">
                    &ldquo;I hereby certify that I am fluent in Spanish & English, and this is a true, complete translation.&rdquo;
                  </p>
                  <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[9px] font-mono text-white/60">
                    <span>ATA Member No. 27194</span>
                    <span className="text-emerald-400 font-bold">Wet-Ink Verified</span>
                  </div>
                </div>
              </div>

              {/* Card 3: Center Foreground - Tamper-Proof QR & SHA-256 Ledger Node */}
              <div className="absolute top-44 left-1/2 -translate-x-1/2 w-72 sm:w-80 p-4 rounded-2xl bg-surface-raised dark:bg-slate-900/95 border-2 border-brand-500/80 dark:border-brand-400 shadow-2xl dark:shadow-[0_0_35px_rgba(59,130,246,0.3)] transform hover:scale-105 transition-all duration-300 z-30">
                <div className="flex items-center justify-between pb-2 border-b border-border/80 dark:border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-mono font-bold text-brand-ink dark:text-white uppercase">
                      Consular Ledger Node
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
                    100% Pre-Cleared
                  </span>
                </div>
                <div className="pt-3 grid grid-cols-12 gap-3 items-center">
                  <div className="col-span-8 space-y-1.5 text-left">
                    <div className="text-xs font-bold text-brand-ink dark:text-white truncate">
                      Dossier: VL-2026-8941
                    </div>
                    <div className="text-[10px] font-mono text-text-subtle dark:text-slate-400 truncate">
                      SHA256: 9e4f1a...c82a01
                    </div>
                    <div className="inline-flex items-center gap-1 text-[10px] font-semibold text-brand-500 dark:text-brand-400">
                      <Lock className="w-3 h-3" />
                      <span>Immutable Cryptographic Seal</span>
                    </div>
                  </div>
                  <div className="col-span-4 flex justify-end">
                    <div className="p-2 rounded-xl bg-surface dark:bg-slate-950 border border-border dark:border-white/15 flex items-center justify-center">
                      <QrCode className="w-11 h-11 text-brand-ink dark:text-white" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 4: Bottom-Left - Ukrainian Court Decree & Hague Apostille */}
              <div className="absolute bottom-2 left-2 w-64 sm:w-70 p-4 rounded-2xl bg-surface-raised dark:bg-slate-900/95 border border-border dark:border-white/15 shadow-xl dark:shadow-black/60 transform rotate-1 hover:rotate-0 hover:scale-105 transition-all duration-300 z-10">
                <div className="flex items-center justify-between pb-2 border-b border-border/60 dark:border-white/10">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">🇺🇦</span>
                    <span className="text-[11px] font-bold text-brand-ink dark:text-white uppercase font-mono">
                      Court Decree
                    </span>
                  </div>
                  <span className="text-[9px] font-mono text-text-muted dark:text-slate-400">
                    Hague 1961
                  </span>
                </div>
                <div className="pt-2 space-y-1">
                  <span className="text-[10px] font-mono text-text-subtle dark:text-slate-400 block">
                    UKRAINIAN COURT ORDER
                  </span>
                  <p className="text-xs font-bold text-brand-ink dark:text-white leading-snug truncate">
                    Рішення суду про розірвання шлюбу
                  </p>
                  <div className="p-1.5 rounded border border-blue-600/30 dark:border-blue-500/30 bg-blue-500/10 dark:bg-blue-950/40 text-[9px] font-mono font-bold text-blue-800 dark:text-blue-300 flex items-center gap-1 truncate">
                    <Stamp className="w-3 h-3 shrink-0" />
                    APOSTILLE CONVENTION DE LA HAYE
                  </div>
                </div>
              </div>

              {/* Card 5: Bottom-Right - Munich University Academic Transcript */}
              <div className="absolute bottom-0 right-2 w-60 sm:w-68 p-3.5 rounded-2xl bg-surface dark:bg-slate-900/95 border border-border dark:border-white/15 shadow-lg dark:shadow-black/60 transform -rotate-2 hover:rotate-0 hover:scale-105 transition-all duration-300 z-20">
                <div className="flex items-center justify-between pb-2 border-b border-border/60 dark:border-white/10">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">🇩🇪</span>
                    <span className="text-[10px] font-bold text-brand-ink dark:text-white uppercase font-mono">
                      University LMU
                    </span>
                  </div>
                  <span className="text-[9px] font-mono text-text-subtle dark:text-slate-400 font-bold">
                    WES Approved
                  </span>
                </div>
                <div className="pt-1.5 space-y-1">
                  <p className="text-[11px] font-bold text-brand-ink dark:text-white truncate">
                    Zeugnis der Bachelorprüfung
                  </p>
                  <div className="text-[9px] font-mono text-text-subtle dark:text-slate-400 flex items-center justify-between">
                    <span>ECTS Credits: 180</span>
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold">1:1 Table Match</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
