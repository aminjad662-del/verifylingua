"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  UploadCloud,
  Camera,
  ShieldCheck,
  ArrowRight,
  FileText,
  Clock,
  CheckCircle2,
  Lock,
  Award,
} from "lucide-react";
import { POPULAR_LANGUAGES } from "@/lib/constants";
import { calculatePricing, formatDeliveryDate } from "@/lib/pricing";

export function Hero() {
  const router = useRouter();
  const [sourceLang, setSourceLang] = React.useState("es");
  const [targetLang, setTargetLang] = React.useState("en");
  const [pageCount, setPageCount] = React.useState(1);
  const [dragActive, setDragActive] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const pricing = React.useMemo(() => {
    return calculatePricing({
      serviceType: "CERTIFIED",
      pageCount,
      isExpedited: false,
    });
  }, [pageCount]);

  const onDrop = React.useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        try {
          sessionStorage.setItem(
            "pending_upload",
            JSON.stringify({
              fileName: acceptedFiles[0].name,
              fileSize: acceptedFiles[0].size,
              sourceLang,
              targetLang,
              fileCount: acceptedFiles.length,
            })
          );
        } catch {
          // ignore
        }
        router.push(`/order/triage?source=${sourceLang}&target=${targetLang}`);
      }
    },
    [router, sourceLang, targetLang]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
    },
    maxSize: 25 * 1024 * 1024,
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
            sourceLang,
            targetLang,
            fileCount: 1,
            isCameraScan: true,
          })
        );
      } catch {
        // ignore
      }
      router.push(`/order/triage?source=${sourceLang}&target=${targetLang}&camera=true`);
    }
  };

  return (
    <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden bg-gradient-hero border-b border-border/60">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Editorial Value Proposition & Real Translation Artwork */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Pill Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-brand-100 bg-brand-50 text-brand-500 text-xs font-bold uppercase tracking-wider font-mono">
              <ShieldCheck className="w-4 h-4 text-brand-500 shrink-0" />
              <span>USCIS & Federal Court Guaranteed Acceptance</span>
            </div>

            {/* Display Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-[4.75rem] font-black tracking-tight text-brand-ink leading-[0.96]">
              Certified Document Translations <br />
              <span className="text-brand-500">Without Rejection Risk.</span>
            </h1>

            {/* Lead Copy */}
            <p className="text-lg sm:text-xl text-text-muted max-w-2xl leading-relaxed">
              Official human certified translations for USCIS, universities, courts, and foreign consulates.
              Backed by pre-payment AI document triage, passport name-locking, and public QR verification.
            </p>

            {/* Visual Photography Proof Card */}
            <div className="relative w-full h-48 sm:h-56 rounded-3xl overflow-hidden border-2 border-border shadow-lg bg-surface group">
              <Image
                src="/images/hero-photograph-document.jpg"
                alt="Person photographing official paper document with phone for certified translation"
                fill
                priority
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/80 via-transparent to-transparent flex items-end p-5">
                <div className="flex flex-wrap items-center justify-between gap-3 w-full text-white">
                  <div className="flex items-center gap-2 text-xs font-bold">
                    <Award className="w-4 h-4 text-brand-300" />
                    <span>ATA Corporate Member No. 271892</span>
                  </div>
                  <Badge variant="success" className="text-[11px] shadow-sm">
                    100% USCIS Acceptance Guaranteed
                  </Badge>
                </div>
              </div>
            </div>

            {/* Rejection Guarantee Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              <div className="flex items-center gap-2.5 text-sm font-semibold text-brand-ink">
                <CheckCircle2 className="w-5 h-5 text-status-success shrink-0" />
                <span>Pre-payment OCR & vision quality triage</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm font-semibold text-brand-ink">
                <CheckCircle2 className="w-5 h-5 text-status-success shrink-0" />
                <span>Passport name & date format lock</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm font-semibold text-brand-ink">
                <CheckCircle2 className="w-5 h-5 text-status-success shrink-0" />
                <span>$24.95 / page standard flat rate</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm font-semibold text-brand-ink">
                <CheckCircle2 className="w-5 h-5 text-status-success shrink-0" />
                <span>Full refund + free redo guarantee</span>
              </div>
            </div>

            {/* Micro Trust Proof */}
            <div className="flex items-center gap-4 pt-2 text-xs text-text-muted">
              <div className="flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-brand-500" />
                <span>256-bit AES Encryption</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-brand-500" />
                <span>Guaranteed 24-Hour Delivery</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-brand-500" />
                <span>Signed Accuracy Certificate</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Dropzone & Instant Quote Widget */}
          <div className="lg:col-span-5">
            <Card className="p-6 md:p-8 rounded-[28px] border-2 border-border bg-surface-raised/95 backdrop-blur-md shadow-xl space-y-6">
              <div className="space-y-1">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-brand-500">
                  Instant Quote & Triage
                </span>
                <h3 className="text-2xl font-black text-brand-ink tracking-tight">
                  Upload Your Document
                </h3>
                <p className="text-xs text-text-muted">
                  Drag files or snap a photo. We check readability before you pay.
                </p>
              </div>

              {/* Language Selection Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label htmlFor="source-lang-select" className="text-xs font-bold uppercase tracking-wider text-text-muted">
                    Translate From
                  </label>
                  <select
                    id="source-lang-select"
                    value={sourceLang}
                    onChange={(e) => setSourceLang(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl border border-border bg-surface text-sm font-semibold text-brand-ink focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    {POPULAR_LANGUAGES.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.name} ({lang.nativeName})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="target-lang-select" className="text-xs font-bold uppercase tracking-wider text-text-muted">
                    Translate To
                  </label>
                  <select
                    id="target-lang-select"
                    value={targetLang}
                    onChange={(e) => setTargetLang(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl border border-border bg-surface text-sm font-semibold text-brand-ink focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="en">English (USCIS Standard)</option>
                    {POPULAR_LANGUAGES.filter((l) => l.code !== "en").map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Interactive Drag & Drop Area */}
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-150 flex flex-col items-center justify-center gap-3 ${
                  isDragActive
                    ? "border-brand-500 bg-brand-50/70 scale-[1.01]"
                    : "border-border hover:border-brand-500/60 bg-surface hover:bg-brand-50/20"
                }`}
              >
                <input {...getInputProps()} />

                {/* Hidden direct camera input */}
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  ref={fileInputRef}
                  onChange={handleCameraChange}
                  className="hidden"
                />

                <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-500 shadow-sm">
                  <UploadCloud className="w-6 h-6" />
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-bold text-brand-ink">
                    Drop your PDF or image here, or{" "}
                    <span className="text-brand-500 underline underline-offset-2">browse</span>
                  </p>
                  <p className="text-xs text-text-muted">
                    PDF, JPG, PNG up to 25MB • Scans, photos, certificates
                  </p>
                </div>

                {/* Mobile First: Take a Photo Button */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={handleCameraClick}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-raised border border-border hover:bg-surface text-xs font-bold text-brand-ink shadow-sm transition-colors"
                  >
                    <Camera className="w-4 h-4 text-brand-500" />
                    Take a Photo on Phone
                  </button>
                </div>
              </div>

              {/* Real-time Pricing & Delivery Time Preview */}
              <div className="p-4 rounded-2xl bg-lavender-50 border border-border/80 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-text-muted">Estimated Turnaround</span>
                  <span className="font-mono font-bold text-brand-ink">
                    {pricing.promisedAtFormatted}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-text-muted block">Guaranteed Rate</span>
                    <span className="text-xs font-semibold text-brand-500">
                      1 Page (250 words)
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-brand-ink font-mono">
                      ${pricing.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* One Single Sitewide CTA Verb */}
              <Button
                size="lg"
                onClick={() =>
                  router.push(
                    `/order/triage?source=${sourceLang}&target=${targetLang}`
                  )
                }
                className="w-full h-14 rounded-2xl text-base font-bold gap-2 shadow-md"
              >
                Start translation
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
