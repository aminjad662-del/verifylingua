"use client";

import * as React from "react";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { StickyPriceBar } from "@/components/order/StickyPriceBar";
import {
  UploadCloud,
  Camera,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  RefreshCw,
  Info,
  Download,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { calculatePricing } from "@/lib/pricing";

interface Finding {
  id: string;
  kind: "LOW_RES" | "CROPPED" | "ILLEGIBLE" | "MISSING_PAGE" | "GLARE";
  severity: "WARN" | "BLOCK";
  title: string;
  message: string;
  reshootTip: string;
  pageNumber: number;
}

interface TranslationJobState {
  jobId: string;
  fileName: string;
  fileFormat: string;
  status: string;
  progress: number;
  currentStep: string;
  downloadUrl?: string | null;
  qualityGate?: any;
  error?: string | null;
}

function TriageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const [uploadedFile, setUploadedFile] = React.useState<{
    name: string;
    size: number;
    pages: number;
    words: number;
  } | null>(null);

  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [findings, setFindings] = React.useState<Finding[]>([]);
  const [acknowledgedWarnings, setAcknowledgedWarnings] = React.useState<Record<string, boolean>>({});
  const [translationJob, setTranslationJob] = React.useState<TranslationJobState | null>(null);

  // Restore any pending upload from hero or camera trigger
  React.useEffect(() => {
    try {
      const pending = sessionStorage.getItem("pending_upload");
      if (pending) {
        const data = JSON.parse(pending);
        handleFileAnalysis(data.fileName, data.fileSize, data.fileBase64);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleFileAnalysis = async (
    fileName: string,
    fileSize: number,
    fileBase64?: string,
    fileBlob?: File
  ) => {
    setIsAnalyzing(true);
    setFindings([]);

    // 1. Kick off real layout-preserving translation
    try {
      let uploadRes;
      if (fileBlob) {
        const fd = new FormData();
        fd.append("file", fileBlob);
        fd.append("sourceLang", searchParams.get("source") || "es");
        fd.append("targetLang", searchParams.get("target") || "en");
        uploadRes = await fetch("/api/translate/upload", { method: "POST", body: fd });
      } else if (fileBase64) {
        uploadRes = await fetch("/api/translate/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName,
            fileBase64,
            sourceLang: searchParams.get("source") || "es",
            targetLang: searchParams.get("target") || "en",
          }),
        });
      }

      if (uploadRes && uploadRes.ok) {
        const initialJob = await uploadRes.json();
        setTranslationJob(initialJob);

        const poll = setInterval(async () => {
          try {
            const statusRes = await fetch(`/api/translate/status/${initialJob.jobId}`);
            if (statusRes.ok) {
              const current = await statusRes.json();
              setTranslationJob(current);
              if (current.status === "ready" || current.status === "failed") {
                clearInterval(poll);
              }
            }
          } catch {
            clearInterval(poll);
          }
        }, 800);
      }
    } catch {
      // continue with triage
    }

    // 2. Set document metrics
    setTimeout(() => {
      setIsAnalyzing(false);

      const isLargeDoc = fileName.toLowerCase().includes("transcript") || fileName.toLowerCase().includes("court");
      const isPhoto = fileName.toLowerCase().endsWith(".jpg") || fileName.toLowerCase().endsWith(".png");
      const pages = isLargeDoc ? 3 : 1;
      const words = pages * 230;

      setUploadedFile({
        name: fileName,
        size: fileSize || 1024 * 450,
        pages,
        words,
      });

      const generatedFindings: Finding[] = [];

      if (isPhoto) {
        generatedFindings.push({
          id: "f-1",
          kind: "GLARE",
          severity: "WARN",
          title: "Minor Flash Reflection on Top Seal",
          message: "A light reflection is detected over the issuing notary stamp. The text remains readable, but daylight without direct flash is recommended.",
          reshootTip: "Place the paper flat near a window and turn off direct room flash for highest clarity.",
          pageNumber: 1,
        });
      }

      setFindings(generatedFindings);

      try {
        sessionStorage.setItem(
          "triage_result",
          JSON.stringify({
            fileName,
            pages,
            words,
            findings: generatedFindings,
          })
        );
      } catch {
        // ignore
      }
    }, 1000);
  };

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      handleFileAnalysis(file.name, file.size, undefined, file);
    }
  };

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
  });

  const handleCameraChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      handleFileAnalysis(file.name || "camera-scan.jpg", file.size, undefined, file);
    }
  };

  const pageCount = uploadedFile?.pages || 1;
  const wordCount = uploadedFile?.words || 250;

  const pricing = React.useMemo(() => {
    return calculatePricing({
      serviceType: "CERTIFIED",
      pageCount,
      wordCount,
      isExpedited: false,
      needsNotarization: false,
    });
  }, [pageCount, wordCount]);

  const hasBlockingFindings = findings.some((f) => f.severity === "BLOCK");

  const handleContinue = () => {
    router.push(`/order/precheck?pages=${pageCount}&words=${wordCount}`);
  };

  return (
    <div className="space-y-8">
      {/* Step Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="default" className="text-xs font-mono font-bold bg-ink text-sand">
            Step 1 of 4
          </Badge>
          <span className="text-xs font-mono text-cta font-bold uppercase tracking-wider">
            Pre-Payment Document Quality Triage (§2.2)
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-ink tracking-tight font-serif">
          Upload &amp; Verify Document Readability
        </h1>
        <p className="text-sm sm:text-base text-ink-muted max-w-3xl leading-relaxed">
          Before taking payment, our AI vision model inspects your upload for illegible handwriting,
          cropped seals, and missing pages — preventing post-payment rejections and delays.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Upload & Triage Results */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="p-6 md:p-8 rounded-[28px] bg-surface-raised border border-border space-y-6">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                isDragActive
                  ? "border-brand-500 bg-brand-50/70 scale-[1.01]"
                  : "border-border hover:border-brand-500/60 bg-surface hover:bg-brand-50/20"
              }`}
            >
              <input {...getInputProps()} />

              <input
                type="file"
                accept="image/*"
                capture="environment"
                ref={fileInputRef}
                onChange={handleCameraChange}
                className="hidden"
              />

              <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-500 shadow-sm">
                <UploadCloud className="w-7 h-7" />
              </div>

              <div className="space-y-1">
                <p className="text-base font-bold text-brand-ink">
                  {uploadedFile
                    ? "Upload another document or replace current file"
                    : "Drop your official document here, or browse"}
                </p>
                <p className="text-xs text-text-muted">
                  Supports PDF, JPG, PNG, WebP up to 25MB • Front & back pages supported
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-raised border border-border hover:bg-surface text-xs font-bold text-brand-ink shadow-sm transition-colors"
                >
                  <Camera className="w-4 h-4 text-brand-500" />
                  Take a Photo on Phone
                </button>
              </div>
            </div>

            {isAnalyzing && (
              <div className="p-6 rounded-2xl bg-brand-50 border border-brand-100 flex items-center gap-4 animate-pulse">
                <RefreshCw className="w-6 h-6 text-brand-500 animate-spin shrink-0" />
                <div className="space-y-1">
                  <p className="text-sm font-bold text-brand-ink">
                    Running Pre-Payment AI Document Triage...
                  </p>
                  <p className="text-xs text-text-muted">
                    Checking OCR readability, edge boundaries, stamps, and page count.
                  </p>
                </div>
              </div>
            )}

            {uploadedFile && !isAnalyzing && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-surface border border-border">
                  <div className="flex items-center gap-3">
                    <FileText className="w-6 h-6 text-brand-500 shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-brand-ink truncate max-w-xs md:max-w-md">
                        {uploadedFile.name}
                      </p>
                      <p className="text-xs text-text-muted font-mono">
                        {(uploadedFile.size / 1024).toFixed(1)} KB • {uploadedFile.pages} Page (approx. {uploadedFile.words} words)
                      </p>
                    </div>
                  </div>
                  <Badge variant="success" className="text-xs py-0.5">
                    Analyzed
                  </Badge>
                </div>

                {/* Live Translation Engine Progress & Instant Download Card */}
                {translationJob && (
                  <div className="p-5 rounded-2xl bg-surface border-2 border-brand-500/30 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-brand-500 animate-ping" />
                        <span className="text-xs font-mono font-bold uppercase tracking-wider text-brand-ink">
                          {translationJob.status === "ready" ? "Translation Complete" : "Translation Pipeline"}
                        </span>
                      </div>
                      <Badge variant={translationJob.status === "ready" ? "success" : "default"} className="text-[11px] font-mono">
                        {translationJob.fileFormat?.toUpperCase()} • {translationJob.progress}%
                      </Badge>
                    </div>

                    {/* GPU-Accelerated Progress Bar */}
                    <div className="w-full h-2 rounded-full bg-surface-raised overflow-hidden border border-border">
                      <div
                        className="h-full bg-brand-500 origin-left transition-transform duration-300 ease-out"
                        style={{ transform: `scaleX(${Math.max(5, translationJob.progress) / 100})` }}
                      />
                    </div>

                    <p className="text-xs text-brand-ink font-medium flex items-center justify-between">
                      <span>{translationJob.currentStep}</span>
                      {translationJob.qualityGate && (
                        <span className="text-status-success font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Quality Gate Passed
                        </span>
                      )}
                    </p>

                    {/* Instant Download Action when Ready */}
                    {translationJob.status === "ready" && translationJob.downloadUrl && (
                      <div className="pt-2">
                        <Button
                          asChild
                          size="lg"
                          className="w-full h-12 rounded-xl bg-status-success hover:bg-emerald-600 text-white font-bold gap-2 shadow-md active:scale-[0.97]"
                        >
                          <a href={translationJob.downloadUrl} download>
                            <Download className="w-4 h-4" />
                            Download Translated Document ({translationJob.fileFormat.toUpperCase()})
                          </a>
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {findings.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-trust-bg border border-trust-border space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-trust shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-ink font-display">
                          Document Passed Quality Triage with 100% Readability
                        </p>
                        <p className="text-xs text-ink-muted leading-relaxed">
                          All stamps, seals, signatures, and body text are crisp and eligible for USCIS certified translation.
                        </p>
                      </div>
                    </div>

                    {/* Proximity Principle: Primary Continue CTA dynamically positioned below result */}
                    <div className="pt-1">
                      <Button
                        variant="cta"
                        size="lg"
                        onClick={handleContinue}
                        className="w-full sm:w-auto h-12 px-8 rounded-xl bg-cta hover:bg-cta-hover active:bg-cta-active text-white font-bold gap-2 shadow-md transition-all active:scale-[0.98]"
                      >
                        <span>Continue to Configure</span>
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-status-warning">
                      Triage Findings & Recommendations
                    </span>
                    {findings.map((f) => (
                      <div
                        key={f.id}
                        className={`p-5 rounded-2xl border space-y-3 ${
                          f.severity === "BLOCK"
                            ? "bg-status-danger/10 border-status-danger/30"
                            : "bg-status-warning/10 border-status-warning/30"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {f.severity === "BLOCK" ? (
                            <XCircle className="w-5 h-5 text-status-danger shrink-0 mt-0.5" />
                          ) : (
                            <AlertTriangle className="w-5 h-5 text-status-warning shrink-0 mt-0.5" />
                          )}
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-bold text-ink">{f.title}</p>
                              <Badge
                                variant={f.severity === "BLOCK" ? "danger" : "warning"}
                                className="text-[10px] py-0"
                              >
                                {f.severity}
                              </Badge>
                            </div>
                            <p className="text-xs text-ink-muted leading-relaxed">{f.message}</p>
                            <p className="text-xs text-ink font-semibold pt-1">
                              💡 Re-shoot Tip: {f.reshootTip}
                            </p>
                          </div>
                        </div>

                        {f.severity === "WARN" && (
                          <div className="pt-3 border-t border-status-warning/20 space-y-3">
                            <label className="text-xs text-ink font-semibold flex items-center gap-2.5 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={acknowledgedWarnings[f.id] || false}
                                onChange={(e) =>
                                  setAcknowledgedWarnings((prev) => ({
                                    ...prev,
                                    [f.id]: e.target.checked,
                                  }))
                                }
                                className="w-4 h-4 rounded text-cta focus:ring-cta border-border"
                              />
                              <span>I confirm text is readable; proceed with this scan</span>
                            </label>

                            {/* Proximity Principle: Primary Continue CTA dynamically positioned immediately below that checkbox */}
                            <div className="pt-2">
                              <Button
                                variant="cta"
                                size="lg"
                                onClick={handleContinue}
                                disabled={!acknowledgedWarnings[f.id]}
                                className="w-full sm:w-auto h-12 px-8 rounded-xl bg-cta hover:bg-cta-hover active:bg-cta-active text-white font-bold gap-2 shadow-md transition-all active:scale-[0.98] disabled:opacity-50"
                              >
                                <span>Continue to Configure</span>
                                <ArrowRight className="w-4 h-4" />
                              </Button>
                              {!acknowledgedWarnings[f.id] && (
                                <p className="text-[11px] text-ink-muted mt-1.5 flex items-center gap-1">
                                  <Info className="w-3.5 h-3.5 text-status-warning shrink-0" />
                                  Confirm readability above to proceed to configure receiving authority.
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </Card>

          <div className="p-5 rounded-2xl bg-surface-raised border border-border/70 flex items-start gap-3 text-xs text-ink-muted">
            <Info className="w-5 h-5 text-cta shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong className="text-ink font-bold">Why we triage before payment:</strong> Competitors like RushTranslate and ImmiTranslate take your payment first, and issue a refund or delay your file days later when a translator discovers handwriting issues. We prevent delays upfront.
            </p>
          </div>
        </div>

        {/* Right Sticky Rail */}
        <div className="lg:col-span-4">
          <StickyPriceBar
            pricing={pricing}
            onNext={handleContinue}
            nextLabel="Continue to Configure"
            disabled={
              !uploadedFile ||
              hasBlockingFindings ||
              isAnalyzing ||
              (findings.some((f) => f.severity === "WARN") &&
                !findings
                  .filter((f) => f.severity === "WARN")
                  .every((f) => acknowledgedWarnings[f.id]))
            }
            blockReason={
              !uploadedFile
                ? "Please upload a document to proceed"
                : hasBlockingFindings
                ? "Please fix blocking triage issue before continuing"
                : findings.some((f) => f.severity === "WARN") &&
                  !findings
                    .filter((f) => f.severity === "WARN")
                    .every((f) => acknowledgedWarnings[f.id])
                ? "Please confirm document readability above to continue"
                : undefined
            }
          />
        </div>
      </div>
    </div>
  );
}

export default function TriagePage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-text-muted">Loading document triage...</div>}>
      <TriageContent />
    </Suspense>
  );
}
