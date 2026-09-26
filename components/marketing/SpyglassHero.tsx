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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { InspectionStage } from "./InspectionStage";

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
    <section className="relative pt-12 sm:pt-16 md:pt-20 pb-16 lg:pb-24 overflow-hidden bg-neutral-50/50 dark:bg-neutral-950 border-b border-neutral-200/80 dark:border-neutral-850">
      {/* Precision hairline architectural grid pattern - Raycast & Framer style */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#0000000a_1px,transparent_1px),linear-gradient(to_bottom,#0000000a_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"
      />

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

      <div className="relative max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          {/* Left Column: Editorial Headline, Subtext, Raycast Pill CTA */}
          <div className="lg:col-span-5 space-y-6 text-left">
            {/* Pill Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xs text-neutral-900 dark:text-neutral-100 text-[11px] font-mono font-semibold tracking-wider shadow-2xs">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>USCIS 8 CFR § 103.2 CERTIFIED</span>
              <span className="text-neutral-300 dark:text-neutral-700">|</span>
              <span className="text-neutral-500">100% ADMISSIBLE</span>
            </div>

            {/* Editorial Display Heading */}
            <div className="space-y-3">
              <h1 className="text-4xl sm:text-5xl xl:text-6xl font-extrabold tracking-tight text-neutral-950 dark:text-white leading-[1.06] font-display">
                Stop filing <br />
                <span className="font-serif italic font-normal text-neutral-800 dark:text-neutral-200 block mt-1">
                  with uncertified translations.
                </span>
              </h1>
              <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-xl">
                Precision automated legal translation that strictly preserves your original layout, tables, stamps, and typography. VerifyLingua delivers court-admissible, notarized translations with cryptographic verification in minutes.
              </p>
            </div>

            {/* Primary Action Button & Secondary Document Explore Link */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                href="/order/triage"
                className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full bg-neutral-950 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-950 text-xs sm:text-sm font-bold shadow-sm transition-all duration-150 active:scale-[0.97] group shrink-0"
              >
                <span>Translate Your Documents</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/documents"
                className="inline-flex items-center justify-center gap-1.5 px-5 py-3.5 rounded-full border border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 hover:bg-neutral-100 dark:hover:bg-neutral-850 text-xs sm:text-sm font-semibold text-neutral-700 dark:text-neutral-300 transition-all duration-150 active:scale-[0.97]"
              >
                <span>Explore 140+ official formats</span>
                <span className="text-neutral-400">→</span>
              </Link>
            </div>

            {/* Interactive Dropzone & Quick Search Bar */}
            <div
              {...getRootProps()}
              className={cn(
                "relative flex items-center gap-2 p-2 px-3 rounded-xl border transition-all duration-150 bg-white dark:bg-neutral-900/90 shadow-2xs cursor-pointer mt-3",
                isDragActive
                  ? "border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/30 dark:bg-emerald-950/20"
                  : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700"
              )}
            >
              <input {...getInputProps()} aria-label="Drop legal documents here" />
              <Search className="w-4 h-4 text-neutral-400 ml-1 shrink-0" />
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
                className="w-full bg-transparent border-0 text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none"
              />
              <div className="flex items-center gap-1 shrink-0">
                <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-500 border border-neutral-200 dark:border-neutral-700">
                  ⌘K
                </kbd>
                <button
                  type="button"
                  onClick={handleCameraClick}
                  className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  title="Scan document with camera"
                >
                  <Camera className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </button>
              </div>
            </div>

            {/* Social Proof Trust Snippet */}
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-mono text-neutral-500 dark:text-neutral-400">
              <div className="flex items-center gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <span className="font-bold text-neutral-900 dark:text-white">4.98/5</span>
              <span className="text-neutral-300 dark:text-neutral-700">|</span>
              <span>2,400+ Law Firms</span>
              <span className="text-neutral-300 dark:text-neutral-700">|</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> 0% USCIS Rejections
              </span>
            </div>
          </div>

          {/* Right Column: High-Precision Interactive Inspection Stage */}
          <div className="lg:col-span-7 relative flex items-center justify-center">
            <InspectionStage />
          </div>
        </div>
      </div>
    </section>
  );
}
