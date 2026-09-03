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
  Star,
  Sparkles,
  Stamp,
} from "lucide-react";
import { POPULAR_LANGUAGES } from "@/lib/constants";
import { calculatePricing, formatDeliveryDate } from "@/lib/pricing";
import { MagneticButton } from "@/components/ui/magnetic-button";

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
    <section className="relative pt-16 pb-24 md:pt-24 md:pb-32 overflow-hidden bg-gradient-hero border-b border-border/40">
      {/* Subtle SVG Grain Overlay (§3.2.3) */}
      <div className="absolute inset-0 grain-overlay z-0 pointer-events-none" aria-hidden="true" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-10 items-center">
          {/* Left Column (7/5 Asymmetrical Grid): Editorial Value Proposition & Real Translation Artwork */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Pill Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-brand-100/80 bg-brand-50/80 text-brand-500 text-xs font-bold uppercase tracking-wider font-mono">
              <ShieldCheck className="w-4 h-4 text-brand-500 shrink-0" />
              <span>USCIS & Federal Court Guaranteed Acceptance</span>
            </div>

            {/* Display Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-[4.75rem] font-bold tracking-tight text-brand-ink leading-[0.96] font-display">
              Certified Document Translations <br />
              <span className="text-brand-500">Without Rejection Risk.</span>
            </h1>

            {/* Lead Copy */}
            <p className="text-lg sm:text-xl text-ink-soft max-w-2xl leading-relaxed text-lead">
              Official human certified translations for USCIS, universities, courts, and foreign consulates.
              Backed by pre-payment AI document triage, passport name-locking, and public QR verification.
            </p>

            {/* Trust Rating Strip */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <div className="flex items-center gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-xs font-bold text-brand-ink">
                4.9/5 Rating
              </span>
              <span className="text-xs text-ink-softer">
                (2,840+ USCIS & Legal Submissions)
              </span>
              <span className="text-xs text-ink-softer hidden sm:inline">•</span>
              <span className="text-xs font-mono font-semibold text-brand-500 hidden sm:inline">
                ATA Member No. 271892
              </span>
            </div>

            {/* Visual Photography & Certified Translation Specimen Card */}
            <div className="relative w-full h-56 sm:h-64 rounded-3xl overflow-hidden border border-border/60 shadow-xl shadow-brand-500/5 bg-surface group">
              <Image
                src="/images/hero-photograph-document.jpg"
                alt="Person photographing official paper document with phone for certified translation"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/90 via-brand-ink/30 to-transparent flex items-end p-5 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3 w-full text-white">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold">
                      <Award className="w-4 h-4 text-brand-300" />
                      <span>Official ATA Certified Translation</span>
                    </div>
                    <p className="text-[11px] text-white/80">
                      Mirror formatted • Translator competence affidavit • Public QR verification
                    </p>
                  </div>
                  <Badge variant="success" className="text-xs py-1 px-3 shadow-md font-bold">
                    100% USCIS Guaranteed
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
            <div className="flex items-center gap-4 pt-2 text-xs text-ink-softer">
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
            <Card className="p-6 md:p-8 rounded-[var(--r-xl)] border border-border/60 bg-surface-raised/95 backdrop-blur-xl shadow-xl shadow-brand-500/5 space-y-6">
              <div className="space-y-1">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-brand-500">
                  Instant Quote & Triage
                </span>
                <h3 className="text-2xl font-bold text-brand-ink tracking-tight font-display">
                  Upload Your Document
                </h3>
                <p className="text-xs text-ink-softer">
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
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-3 ${
                  isDragActive
                    ? "border-brand-500 bg-brand-50/70 scale-[1.01]"
                    : "border-border/70 hover:border-brand-500/50 bg-surface hover:bg-brand-50/10"
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
                  <p className="text-xs text-ink-softer">
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
              <div className="p-4 rounded-2xl bg-lavender-50/80 border border-border/60 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-text-muted">Estimated Turnaround</span>
                  <span suppressHydrationWarning className="font-mono font-bold text-brand-ink">
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
              <MagneticButton className="w-full">
                <Button
                  size="lg"
                  onClick={() =>
                    router.push(
                      `/order/triage?source=${sourceLang}&target=${targetLang}`
                    )
                  }
                  className="w-full h-14 rounded-2xl text-base font-bold gap-2 shadow-md active:scale-[0.97] transition-all duration-200"
                >
                  Start translation
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </MagneticButton>
            </Card>
          </div>
        </div>

        {/* Institutional Trust Badges Strip (Similar to RushTranslate & ImmiTranslate) */}
        <div className="mt-16 pt-10 border-t border-border/60">
          <p className="text-center text-xs font-mono font-bold uppercase tracking-widest text-ink-softer mb-6">
            Trusted by Immigration Attorneys, Fortune 500 Legal Teams & Top Universities
          </p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 items-center justify-center text-center">
            <div className="p-3.5 rounded-2xl bg-surface-raised/80 border border-border/60 shadow-sm flex items-center justify-center gap-2.5">
              <Award className="w-5 h-5 text-brand-500 shrink-0" />
              <div className="text-left">
                <p className="text-xs font-bold text-brand-ink">ATA Corporate Member</p>
                <p className="text-[10px] text-ink-softer font-mono">No. 271892</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-surface-raised/80 border border-border/60 shadow-sm flex items-center justify-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-status-success shrink-0" />
              <div className="text-left">
                <p className="text-xs font-bold text-brand-ink">USCIS Guaranteed</p>
                <p className="text-[10px] text-ink-softer">100% Acceptance</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-surface-raised/80 border border-border/60 shadow-sm flex items-center justify-center gap-2.5">
              <FileText className="w-5 h-5 text-brand-500 shrink-0" />
              <div className="text-left">
                <p className="text-xs font-bold text-brand-ink">WES & ECE Evaluators</p>
                <p className="text-[10px] text-ink-softer">Degree Standards</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-surface-raised/80 border border-border/60 shadow-sm flex items-center justify-center gap-2.5">
              <Stamp className="w-5 h-5 text-brand-500 shrink-0" />
              <div className="text-left">
                <p className="text-xs font-bold text-brand-ink">Courts & Consulates</p>
                <p className="text-[10px] text-ink-softer">Fed Rule 902(11)</p>
              </div>
            </div>

            <div className="col-span-2 md:col-span-1 p-3.5 rounded-2xl bg-surface-raised/80 border border-border/60 shadow-sm flex items-center justify-center gap-2.5">
              <Lock className="w-5 h-5 text-brand-500 shrink-0" />
              <div className="text-left">
                <p className="text-xs font-bold text-brand-ink">256-Bit Vault</p>
                <p className="text-[10px] text-ink-softer">SOC-2 / HIPAA</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
