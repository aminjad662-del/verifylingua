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
import { FluidGlassRibbon } from "./FluidGlassRibbon";
import { HeroInteractiveCard } from "./HeroInteractiveCard";

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
    <section className="relative pt-12 sm:pt-16 md:pt-20 pb-16 lg:pb-24 overflow-hidden bg-canvas border-b border-border/40">
      {/* Runey-style Organic 3D Fluid Glass Ribbon Backdrop */}
      <FluidGlassRibbon />

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

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Editorial Headline, Subtext, Pill CTA */}
          <div className="lg:col-span-6 space-y-7 text-left">
            {/* Pill Eyebrow Badge matching Spyglass minimalism */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border/80 bg-surface text-brand-ink text-xs font-mono font-bold tracking-wider">
              <ShieldCheck className="w-4 h-4 text-brand-500 shrink-0" />
              <span>USCIS 8 CFR § 204.2 COMPLIANT • 100% ACCEPTANCE</span>
            </div>

            {/* Editorial Display Heading matching Spyglass typography */}
            <div className="space-y-3">
              <h1 className="text-5xl sm:text-6xl xl:text-7xl font-bold tracking-tight text-brand-ink leading-[1.03] font-display">
                Stop filing <br />
                <span className="font-serif italic font-normal text-brand-900 block mt-1">
                  with uncertified translations.
                </span>
              </h1>
              <p className="text-base sm:text-lg text-text-muted leading-relaxed max-w-xl">
                Precision automated document processing that strictly preserves your original layout, tables, and typography.
                VerifyLingua delivers court-admissible, notarized translations with cryptographic verification in minutes, not days.
              </p>
            </div>

            {/* Primary Action Button & Secondary Document Explore Link */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-1">
              <Link
                href="/order/triage"
                className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full bg-brand-ink hover:bg-brand-900 text-white text-sm sm:text-base font-bold shadow-md transition-all duration-200 active:scale-95 group shrink-0"
              >
                <span>Translate Your Documents</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/documents"
                className="text-xs sm:text-sm font-semibold text-text-muted hover:text-brand-ink transition-colors flex items-center gap-1.5 py-2"
              >
                <span>Explore 140+ official formats</span>
                <span className="text-brand-500">→</span>
              </Link>
            </div>

            {/* Interactive Dropzone & Quick Search Bar */}
            <div
              {...getRootProps()}
              className={cn(
                "relative flex items-center gap-2 p-2 rounded-2xl border transition-all duration-200 bg-surface-raised shadow-sm cursor-pointer mt-4",
                isDragActive
                  ? "border-brand-500 ring-4 ring-brand-500/20 bg-brand-50/50"
                  : "border-border/80 hover:border-brand-500/50"
              )}
            >
              <input {...getInputProps()} aria-label="Drop legal documents here" />
              <Search className="w-4 h-4 text-text-subtle ml-2 shrink-0" />
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
                className="w-full bg-transparent border-0 text-xs sm:text-sm text-brand-ink placeholder:text-text-subtle focus:outline-none"
              />
              <button
                type="button"
                onClick={handleCameraClick}
                className="p-2 rounded-xl text-text-muted hover:text-brand-ink hover:bg-surface border border-transparent hover:border-border transition-colors shrink-0"
                title="Scan document with camera"
              >
                <Camera className="w-4 h-4 text-brand-500" />
              </button>
            </div>

            {/* Social Proof Trust Snippet */}
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-text-muted">
              <div className="flex items-center gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <span className="font-bold text-brand-ink">4.98/5</span>
              <span className="text-border-strong">•</span>
              <span>2,400+ Law Firms & Applicants</span>
              <span className="text-border-strong">•</span>
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> 0% USCIS Rejection Rate
              </span>
            </div>
          </div>

          {/* Right Column: Runey-Style Floating Glassmorphic Interactive Exhibit Card */}
          <div className="lg:col-span-6 relative flex items-center justify-center py-6">
            <HeroInteractiveCard />
          </div>
        </div>
      </div>
    </section>
  );
}
