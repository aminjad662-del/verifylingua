"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import {
  ShieldCheck,
  Search,
  UploadCloud,
  Camera,
  ArrowRight,
  CheckCircle2,
  Star,
  FileCheck,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CurvedDocumentArc } from "@/components/marketing/CurvedDocumentArc";

const QUICK_SEARCH_CHIPS = [
  { label: "All Documents", query: "all", count: "140+" },
  { label: "Birth Certificates", query: "birth-certificate", count: "USCIS Ready" },
  { label: "Academic Transcripts", query: "academic-transcript", count: "WES Approved" },
  { label: "Marriage Certificates", query: "marriage-certificate", count: "Consular" },
  { label: "Court Decrees", query: "court-record", count: "Sworn" },
  { label: "Passports & Apostilles", query: "apostille", count: "Hague 1961" },
  { label: "Tax & Bank Statements", query: "bank-statement", count: "Corporate" },
];

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
    <section className="relative pt-12 sm:pt-16 md:pt-20 pb-10 overflow-hidden bg-canvas border-b border-border/40">
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

      <div className="max-w-6xl mx-auto px-6 text-center relative z-10 space-y-6 sm:space-y-8">
        {/* Eyebrow badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border/80 bg-surface text-brand-ink text-xs font-bold uppercase tracking-wider font-mono">
          <ShieldCheck className="w-4 h-4 text-brand-500 shrink-0" />
          <span>USCIS 8 CFR § 204.2 COMPLIANT • 100% GUARANTEED ACCEPTANCE</span>
        </div>

        {/* Monolithic Centered Display Headline */}
        <div className="space-y-4 max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-brand-ink leading-[1.02] font-display">
            The only certified <br className="hidden sm:inline" />
            <span className="text-brand-500">translation engine</span>
          </h1>
          <p className="text-base sm:text-xl text-text-muted max-w-2xl mx-auto leading-relaxed">
            Official human certified translations trusted by immigration attorneys, universities, and federal courts.
            Guaranteed acceptance with zero formatting drift.
          </p>
        </div>

        {/* Interactive Search & File Upload Bar */}
        <div className="max-w-3xl mx-auto">
          <div
            {...getRootProps()}
            className={cn(
              "relative flex flex-col sm:flex-row items-center gap-2 p-2 rounded-2xl border transition-all duration-200 bg-surface-raised shadow-lg cursor-pointer",
              isDragActive
                ? "border-brand-500 ring-4 ring-brand-500/20 bg-brand-50/50"
                : "border-border/80 hover:border-brand-500/60"
            )}
          >
            <input {...getInputProps()} aria-label="Drop files for certified translation" />

            <div className="flex items-center gap-2.5 px-3 py-1.5 w-full flex-1">
              <Search className="w-5 h-5 text-text-subtle shrink-0" />
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
                    ? "Release files to start instant certified translation..."
                    : "Search document type or drop file (e.g. Mexican Birth Certificate)..."
                }
                className="w-full bg-transparent border-0 text-sm sm:text-base text-brand-ink placeholder:text-text-subtle focus:outline-none"
              />
            </div>

            {/* Quick Actions in Pill */}
            <div className="flex items-center gap-2 w-full sm:w-auto px-2 justify-end">
              <button
                type="button"
                onClick={handleCameraClick}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-text-muted hover:text-brand-ink hover:bg-surface border border-transparent hover:border-border transition-colors shrink-0"
                title="Scan document with camera"
              >
                <Camera className="w-4 h-4 text-brand-500" />
                <span className="hidden sm:inline">Camera</span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push("/order/triage");
                }}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-brand-ink hover:bg-brand-900 text-white text-sm font-bold shadow transition-transform active:scale-95 shrink-0"
              >
                <span>Upload & Verify</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Filter Search Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
            {QUICK_SEARCH_CHIPS.map((chip) => (
              <button
                key={chip.label}
                type="button"
                onClick={() => {
                  if (chip.query === "all") {
                    router.push("/documents");
                  } else {
                    router.push(`/documents/${chip.query}`);
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-border/70 bg-surface/80 hover:bg-surface text-xs font-medium text-text-muted hover:text-brand-ink transition-all hover:border-brand-300 shadow-2xs"
              >
                <span>{chip.label}</span>
                <span className="text-[10px] font-mono font-semibold px-1 rounded bg-surface-sunken text-text-subtle">
                  {chip.count}
                </span>
              </button>
            ))}
          </div>

          {/* Social Proof Trust Snippet */}
          <div className="pt-3 flex items-center justify-center gap-4 text-xs text-text-muted">
            <div className="flex items-center gap-1 text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-current" />
              ))}
            </div>
            <span className="font-semibold text-brand-ink">4.98/5</span>
            <span className="text-border-strong">•</span>
            <span>2,400+ Law Firms & Applicants</span>
            <span className="text-border-strong">•</span>
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> 0% USCIS Rejection Rate
            </span>
          </div>
        </div>
      </div>

      {/* Curved Fan / Panoramic Ribbon of International Document Cards */}
      <CurvedDocumentArc />
    </section>
  );
}
