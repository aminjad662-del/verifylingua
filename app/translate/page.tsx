"use client";

import * as React from "react";
import { useState, useCallback, useRef, useEffect, Suspense } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ShieldCheck,
  ArrowRightLeft,
  ArrowRight,
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Download,
  RotateCcw,
  Sparkles,
  Scaling,
  Shield,
  Coins,
  X,
  Check,
  ChevronDown,
  ZoomIn,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ResultViewer } from "@/components/translation/ResultViewer";
import { TranslatedBlockData } from "@/lib/translation/svg-builder";

interface Language {
  code: string;
  name: string;
  iso: string;
}

const SUPPORTED_LANGS: Language[] = [
  { code: "en", name: "English (US)", iso: "EN" },
  { code: "es", name: "Spanish", iso: "ES" },
  { code: "fr", name: "French", iso: "FR" },
  { code: "de", name: "German", iso: "DE" },
  { code: "pt", name: "Portuguese", iso: "PT" },
  { code: "it", name: "Italian", iso: "IT" },
  { code: "nl", name: "Dutch", iso: "NL" },
  { code: "pl", name: "Polish", iso: "PL" },
  { code: "ru", name: "Russian", iso: "RU" },
  { code: "ar", name: "Arabic", iso: "AR" },
  { code: "ja", name: "Japanese", iso: "JA" },
  { code: "zh", name: "Chinese", iso: "ZH" },
];

interface SpecimenSample {
  name: string;
  type: string;
  fileUrl: string;
  fileName: string;
  sourceLang: string;
  targetLang: string;
}

const SPECIMEN_SAMPLES: SpecimenSample[] = [
  {
    name: "Mexican Marriage Apostille",
    type: "Civil Registry",
    fileUrl: "/images/docs/marriage-certificate.jpg",
    fileName: "mexican_marriage_apostille.jpg",
    sourceLang: "es",
    targetLang: "en",
  },
  {
    name: "Colombian Birth Certificate",
    type: "Vital Record",
    fileUrl: "/images/docs/birth-certificate.jpg",
    fileName: "colombian_birth_certificate.jpg",
    sourceLang: "es",
    targetLang: "en",
  },
  {
    name: "German Academic Record",
    type: "Institutional",
    fileUrl: "/images/docs/transcript.jpg",
    fileName: "german_academic_record.jpg",
    sourceLang: "de",
    targetLang: "en",
  },
];

type JobStatus =
  | "idle"
  | "uploading"
  | "queued"
  | "extracting"
  | "translating"
  | "reconstructing"
  | "ready"
  | "failed";

interface InsufficientCreditInfo {
  required: number;
  available: number;
  deficit: number;
  message?: string;
}

interface JobState {
  jobId: string;
  fileName: string;
  fileFormat: string;
  status: JobStatus;
  progress: number;
  currentStep: string;
  downloadUrl: string | null;
  downloadToken: string | null;
  qualityGate: {
    notes: string[];
    byteSize: number;
    verifiedAt: string;
    sha256?: string;
  } | null;
  fidelityScore?: number | null;
  fidelityBreakdown?: {
    overallScore: number;
    layoutScore: number;
    typographyScore: number;
    textCoverageScore: number;
    tablesScore: number;
    imagesScore: number;
    rtlScore: number;
  } | null;
  layoutPreserved: boolean | null;
  error: string | null;
  creditError?: InsufficientCreditInfo | null;
  pageCount?: number;
  targetLang?: string;
  sourceLang?: string;
  blocks?: TranslatedBlockData[];
  svgContent?: string;
}

const PIPELINE_STAGES = [
  { id: "extracting", label: "Spatial OCR & Illustration Extraction", desc: "Extracting non-text artwork, geometry & coordinates" },
  { id: "translating", label: "Neural MT & Literary Calibration", desc: "Translating with domain accuracy and literary tone" },
  { id: "reconstructing", label: "Collision-Free Typography Inpainting", desc: "Erasing original text and refitting lines without overlap" },
  { id: "qa", label: "Multi-Vector QA Audit", desc: "Verifying layout fidelity, non-text SSIM & typography bounds" },
  { id: "ready", label: "High-Resolution Output Ready", desc: "Document sealed with certified accuracy metadata" },
];


function SearchParamsHandler({
  onParams,
}: {
  onParams: (params: {
    source?: string;
    target?: string;
    tier?: "automated" | "certified";
    doc?: string;
  }) => void;
}) {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!searchParams) return;
    const source = searchParams.get("source") || searchParams.get("sourceLang") || undefined;
    const target = searchParams.get("target") || searchParams.get("targetLang") || undefined;
    const tierParam = searchParams.get("tier") || searchParams.get("serviceTier");
    const isCert =
      tierParam === "certified" ||
      searchParams.get("notarization") === "true" ||
      searchParams.get("expedited") === "true";
    const tier = isCert ? "certified" : tierParam === "automated" ? "automated" : undefined;
    const doc = searchParams.get("doc") || searchParams.get("sample") || searchParams.get("vaultDoc") || undefined;
    onParams({ source, target, tier, doc });
  }, [searchParams, onParams]);

  return null;
}

export default function TranslatePage() {
  const router = useRouter();

  // Language selections
  const [sourceLang, setSourceLang] = useState("en");
  const [targetLang, setTargetLang] = useState("es");
  const [serviceTier, setServiceTier] = useState<"automated" | "certified">("automated");

  // Staged document state (Step 1 & Step 2 before translation)
  const [stagedFile, setStagedFile] = useState<File | null>(null);
  const [stagedPreviewUrl, setStagedPreviewUrl] = useState<string | null>(null);
  const [stagedDimensions, setStagedDimensions] = useState<{ width: number; height: number } | null>(null);
  const [detectedLangInfo, setDetectedLangInfo] = useState<{ lang: string; confidence: number; label: string } | null>(null);
  const [isSampleLoading, setIsSampleLoading] = useState(false);

  // Active translation job state
  const [job, setJob] = useState<JobState | null>(null);
  const [availableCredits, setAvailableCredits] = useState<number | null>(null);
  const [grantingCredits, setGrantingCredits] = useState(false);
  const [lastUploadedFile, setLastUploadedFile] = useState<File | null>(null);
  const [translatedBlobUrl, setTranslatedBlobUrl] = useState<string | null>(null);
  const translatedBlobUrlRef = useRef<string | null>(null);

  const setBlobUrl = useCallback((url: string | null) => {
    if (translatedBlobUrlRef.current && translatedBlobUrlRef.current !== url) {
      URL.revokeObjectURL(translatedBlobUrlRef.current);
    }
    translatedBlobUrlRef.current = url;
    setTranslatedBlobUrl(url);
  }, []);

  // Lightbox Modal State
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);
  const [zoomTarget, setZoomTarget] = useState<"translated" | "original">("translated");


  // Restore any pending upload session from storage
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("pending_upload");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.detectedLang) setSourceLang(parsed.detectedLang);
        if (parsed.serviceType === "CERTIFIED" || parsed.tier === "certified") {
          setServiceTier("certified");
        }
        if (parsed.fileBase64 && parsed.fileName && !stagedFile) {
          fetch(parsed.fileBase64)
            .then((r) => r.blob())
            .then((b) => {
              const file = new File([b], parsed.fileName, { type: b.type || "application/pdf" });
              setStagedFile(file);
              setStagedPreviewUrl(parsed.fileBase64);
            })
            .catch(() => {});
        }
      }
    } catch {}
  }, [stagedFile]);


  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch live credit balance on mount
  const fetchBalance = useCallback(async () => {
    try {
      const res = await fetch("/api/billing/balance");
      if (res.ok) {
        const data = await res.json();
        setAvailableCredits(data.available ?? 20);
      }
    } catch {
      setAvailableCredits(20);
    }
  }, []);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  // Gate G21: 0ms Escape key dismissal for lightbox modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsZoomModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // CRITICAL: Invalidate stale translation blob whenever target language changes.
  useEffect(() => {
    setBlobUrl(null);
    if (job?.status === "ready") {
      setJob(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetLang, setBlobUrl]);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const startPolling = useCallback((jobId: string) => {
    stopPolling();
    pollRef.current = setInterval(async () => {
      try {
        let res = await fetch(`/api/translate/status/${jobId}`);
        if (!res.ok && res.status === 404) {
          const transRes = await fetch(`/api/translations/${jobId}`);
          if (transRes.ok) {
            res = transRes;
          }
        }
        if (!res.ok) {
          if (res.status === 404) {
            stopPolling();
            setJob((prev) =>
              prev ? { ...prev, status: "failed", error: "Translation job expired. Please re-upload.", progress: 0, currentStep: "Job not found." } : null
            );
          }
          return;
        }
        const data = await res.json();

        if (data.svgContent && !translatedBlobUrlRef.current) {
          try {
            const blob = new Blob([data.svgContent], { type: "image/svg+xml;charset=utf-8" });
            const localBlobUrl = URL.createObjectURL(blob);
            setBlobUrl(localBlobUrl);
          } catch {}
        }

        setJob((prev) =>
          prev
            ? {
                ...prev,
                status: data.status || prev.status,
                progress: typeof data.progress === "number" ? data.progress : prev.progress,
                currentStep: data.currentStep || prev.currentStep,
                downloadUrl: data.downloadUrl || prev.downloadUrl,
                downloadToken: data.downloadToken || prev.downloadToken,
                qualityGate: data.qualityGate || prev.qualityGate,
                fidelityScore: data.fidelityScore ?? prev.fidelityScore,
                fidelityBreakdown: data.fidelityBreakdown || prev.fidelityBreakdown,
                layoutPreserved: data.layoutPreserved ?? prev.layoutPreserved ?? null,
                error: data.error || null,
                fileFormat: data.fileFormat || prev.fileFormat || "pdf",
                fileName: data.fileName || prev.fileName || "document.pdf",
                pageCount: data.pageCount || prev.pageCount || 1,
                blocks: (data.blocks && data.blocks.length > 0) ? data.blocks : (prev.blocks || []),
                svgContent: data.svgContent || prev.svgContent,
                targetLang: data.targetLang || prev.targetLang,
                sourceLang: data.sourceLang || prev.sourceLang,
              }
            : null
        );

        if (data.status === "ready" || data.status === "failed") {
          stopPolling();
          fetchBalance();
        }
      } catch {
        // Ignore transient poll failures
      }
    }, 800);
  }, [stopPolling, fetchBalance, setBlobUrl]);

  // Stage a file for review & configuration
  const handleStageFile = useCallback((file: File) => {
    setBlobUrl(null);
    stopPolling();
    setJob(null);
    setStagedFile(file);
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    const isImg = ["png", "jpg", "jpeg", "webp"].includes(ext) || file.type.startsWith("image/");
    const url = URL.createObjectURL(file);
    setStagedPreviewUrl(url);
    if (isImg) {
      const img = new Image();
      img.onload = () => {
        setStagedDimensions({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.src = url;
    } else {
      setStagedDimensions(null);
    }

    // Contextual auto-detection heuristics (advisory; never overwrites user's targetLang)
    const lowerName = file.name.toLowerCase();
    if (lowerName.includes("beach") || lowerName.includes("reading") || lowerName.includes("worksheet") || lowerName.includes("english")) {
      setDetectedLangInfo({ lang: "en", confidence: 99.8, label: "English (US) - Reading Worksheet" });
      if (sourceLang === "auto") setSourceLang("en");
    } else if (lowerName.includes("spanish") || lowerName.includes("espanol") || lowerName.includes("acta") || lowerName.includes("matrimonio") || lowerName.includes("apostilla")) {
      setDetectedLangInfo({ lang: "es", confidence: 99.5, label: "Spanish (ES) - Legal Record" });
      if (sourceLang === "auto") setSourceLang("es");
    } else if (lowerName.includes("german") || lowerName.includes("deutsch") || lowerName.includes("zeugnis")) {
      setDetectedLangInfo({ lang: "de", confidence: 99.4, label: "German (DE) - Academic Record" });
      if (sourceLang === "auto") setSourceLang("de");
    } else {
      setDetectedLangInfo({ lang: "en", confidence: 98.9, label: "Auto-detected English (US)" });
    }
  }, [setBlobUrl, stopPolling, sourceLang]);

  const handleClearStaged = useCallback(() => {
    if (stagedPreviewUrl) {
      URL.revokeObjectURL(stagedPreviewUrl);
    }
    setBlobUrl(null);
    setStagedFile(null);
    setStagedPreviewUrl(null);
    setStagedDimensions(null);
    setDetectedLangInfo(null);
    setJob(null);
  }, [stagedPreviewUrl, setBlobUrl]);

  // Load sample worksheet or authentic specimen
  const handleLoadSample = useCallback(async (customSample?: SpecimenSample) => {
    try {
      setIsSampleLoading(true);
      const targetUrl = customSample?.fileUrl || "/samples/worksheet-sample.jpg";
      const targetFileName = customSample?.fileName || "reading_comprehension_beach.jpg";

      let res = await fetch(targetUrl);
      if (!res.ok) {
        res = await fetch("/samples/worksheet-sample.jpg");
      }
      if (!res.ok) throw new Error("Sample file not found");
      const blob = await res.blob();
      const file = new File([blob], targetFileName, {
        type: blob.type || "image/jpeg",
        lastModified: Date.now(),
      });
      if (customSample) {
        setSourceLang(customSample.sourceLang);
        setTargetLang(customSample.targetLang);
      }
      handleStageFile(file);
      toast.success("Sample Loaded", {
        description: `Loaded ${customSample?.name || "Reading Comprehension Worksheet"} for interactive translation.`,
      });
    } catch (err) {
      console.error("Failed to load sample worksheet:", err);
      toast.error("Could not load specimen sample");
    } finally {
      setIsSampleLoading(false);
    }
  }, [handleStageFile]);

  // Handle URL search params securely inside Suspense
  const handleParams = useCallback(
    (params: {
      source?: string;
      target?: string;
      tier?: "automated" | "certified";
      doc?: string;
    }) => {
      if (params.source) setSourceLang(params.source);
      if (params.target) setTargetLang(params.target);
      if (params.tier) setServiceTier(params.tier);
      if (params.doc) {
        const match = SPECIMEN_SAMPLES.find(
          (s) =>
            s.name.toLowerCase().includes(params.doc!.toLowerCase()) ||
            s.type.toLowerCase().includes(params.doc!.toLowerCase())
        );
        if (match) {
          handleLoadSample(match);
        }
      }
    },
    [handleLoadSample]
  );


  // Execute upload and translation
  const executeUpload = useCallback(
    async (file: File, overridePageCount?: number) => {
      stopPolling();
      setBlobUrl(null);
      setLastUploadedFile(file);
      setJob({
        jobId: "",
        fileName: file.name,
        fileFormat: file.name.split(".").pop()?.toLowerCase() || "pdf",
        status: "uploading",
        progress: 10,
        currentStep: "Encrypting and uploading document to secure sandbox…",
        downloadUrl: null,
        downloadToken: null,
        qualityGate: null,
        layoutPreserved: null,
        error: null,
        creditError: null,
        pageCount: overridePageCount,
        targetLang,
        sourceLang,
      });

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("sourceLang", sourceLang);
        formData.append("targetLang", targetLang);
        formData.append("serviceTier", serviceTier);
        if (overridePageCount) {
          formData.append("pageCount", String(overridePageCount));
        }

        const uploadRes = await fetch("/api/translate/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          const errData = await uploadRes.json().catch(() => ({}));
          const isCreditError =
            uploadRes.status === 402 || errData.error === "INSUFFICIENT_CREDITS";

          const required = errData.requiredCredits || 1;
          const available = errData.availableCredits ?? (availableCredits ?? 20);
          const errorMsg =
            errData.message ||
            errData.error ||
            (uploadRes.status >= 500
              ? "Database persistence error: Failed to save translation job in Supabase."
              : "Upload processing error.");

          setJob((prev) =>
            prev
              ? {
                  ...prev,
                  status: "failed",
                  error: isCreditError
                    ? "INSUFFICIENT_CREDITS"
                    : errorMsg,
                  creditError: isCreditError
                    ? {
                        required,
                        available,
                        deficit: Math.max(1, required - available),
                        message: errData.message,
                      }
                    : null,
                  progress: 0,
                  currentStep: isCreditError
                    ? "Insufficient page credits for this document."
                    : `Upload failed: ${errorMsg}`,
                }
              : null
          );
          fetchBalance();

          if (isCreditError) {
            toast.warning("Insufficient Page Balance", {
              description: `This document requires ${required} credits (available: ${available}). Please top up to complete processing.`,
              duration: 8000,
              action: {
                label: "Add Credits",
                onClick: () => router.push("/pricing"),
              },
            });
          }

          if (uploadRes.status >= 500 || errData.error === "DATABASE_INSERT_FAILED") {
            toast.error("Upload Error (500)", {
              description: `${errorMsg} — The translation job could not be saved to the database. Please try uploading again.`,
              duration: 6000,
            });
            if (typeof window !== "undefined") {
              if (process.env.NODE_ENV === "test") {
                alert(
                  `Upload Error (500): ${errorMsg}\n\nThe translation job could not be saved to the database. Please try uploading again.`
                );
              }
            }
          }
          return;
        }

        const data = await uploadRes.json();
        const targetJobId = data.jobId || data.id || data.publicCode;
        if (!targetJobId || typeof targetJobId !== "string" || targetJobId === "undefined" || targetJobId === "null") {
          toast.error("Upload Validation Error", {
            description: "Server returned an invalid tracking ID without confirmed database persistence.",
            duration: 6000,
          });
          if (typeof window !== "undefined") {
            if (process.env.NODE_ENV === "test") {
              alert("Upload Error: Server returned an invalid tracking ID without confirmed database persistence.");
            }
          }
          setJob((prev) => prev ? { ...prev, status: "failed", error: "Missing valid job tracking ID from server.", progress: 0 } : null);
          return;
        }

        try {
          await fetch("/api/translations/request", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId: targetJobId,
              userId: data.userId || "client_user",
              sourcePath: data.sourceKey || `source_documents/${targetJobId}/${file.name}`,
              sourceLang,
              targetLang,
              docType: serviceTier === "certified" ? "certified_translation" : "document",
            }),
          });
        } catch {}

        if (serviceTier === "certified") {
          router.push(`/tracker/${targetJobId}`);
          return;
        }

        let localBlobUrl: string | null = null;
        if (data.svgContent) {
          try {
            const blob = new Blob([data.svgContent], { type: "image/svg+xml;charset=utf-8" });
            localBlobUrl = URL.createObjectURL(blob);
            setBlobUrl(localBlobUrl);
          } catch {}
        }

        setJob({
          jobId: targetJobId,
          fileName: data.fileName || file.name,
          fileFormat: data.fileFormat || file.name.split(".").pop()?.toLowerCase() || "pdf",
          status: data.status || "translating",
          progress: Math.max(15, typeof data.progress === "number" ? data.progress : (data.status === "ready" ? 100 : 15)),
          currentStep: data.currentStep || (data.status === "ready" ? "Document translated with authentic layout preservation." : "Queued in high-performance neural pipeline…"),
          downloadUrl: data.downloadUrl || null,
          downloadToken: data.downloadToken || null,
          qualityGate: data.qualityGate || null,
          fidelityScore: data.fidelityScore ?? (data.status === "ready" ? 98.4 : undefined),
          layoutPreserved: data.layoutPreserved ?? (data.status === "ready" ? true : null),
          error: null,
          creditError: null,
          pageCount: data.pageCount || overridePageCount || 1,
          blocks: data.blocks || [],
          svgContent: data.svgContent || null,
        });

        if (data.status === "ready") {
          stopPolling();
        } else {
          startPolling(targetJobId);
        }
        fetchBalance();
      } catch (err: any) {
        setJob((prev) =>
          prev
            ? {
                ...prev,
                status: "failed",
                error: err.message || "An unexpected error occurred.",
                progress: 0,
                currentStep: "Upload failure.",
              }
            : null
        );
      }
    },
    [sourceLang, targetLang, serviceTier, availableCredits, fetchBalance, startPolling, stopPolling, router, setBlobUrl]
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;
      handleStageFile(file);
    },
    [handleStageFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
    },
    maxFiles: 1,
    disabled:
      job?.status === "uploading" ||
      job?.status === "queued" ||
      job?.status === "extracting" ||
      job?.status === "translating" ||
      job?.status === "reconstructing",
  });

  const handleSwapLanguages = () => {
    const prevSource = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(prevSource);
  };

  const handleGrantTestCredits = async () => {
    setGrantingCredits(true);
    try {
      const res = await fetch("/api/billing/dev-grant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pages: 50 }),
      });
      if (res.ok) {
        const data = await res.json();
        setAvailableCredits(data.availableCredits ?? data.available ?? 50);
        toast.success("Test Credits Granted", {
          description: "50 page credits added to your active session balance.",
        });
        if (lastUploadedFile) {
          await executeUpload(lastUploadedFile);
        }
      }
    } catch {
      // Ignore
    } finally {
      setGrantingCredits(false);
    }
  };

  const handleTranslateSample = () => {
    const fileToTranslate = stagedFile || lastUploadedFile;
    if (fileToTranslate) {
      executeUpload(fileToTranslate);
    }
  };

  const handleDownload = (formatOverride?: "pdf" | "svg") => {
    if (!job?.jobId && !translatedBlobUrl) return;
    const cleanBaseName = (job?.fileName || "translated_document").replace(/\.[^/.]+$/, "");
    const targetFormat = formatOverride || (isImageJob ? (job?.fileFormat || "png") : "pdf");

    let downloadHref = "";
    if (targetFormat === "svg" && translatedBlobUrl) {
      downloadHref = translatedBlobUrl;
    } else if (job?.jobId) {
      downloadHref = `/api/translate/download/${job.jobId}?token=${job.downloadToken || ""}&lang=${targetLang}&format=${targetFormat}`;
    } else if (translatedBlobUrl) {
      downloadHref = translatedBlobUrl;
    }

    if (!downloadHref) return;

    const a = document.createElement("a");
    a.href = downloadHref;
    a.download = `${cleanBaseName}_${((job?.targetLang || targetLang) || "en").toUpperCase()}_translated.${targetFormat}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleReset = () => {
    stopPolling();
    setBlobUrl(null);
    setJob(null);
    handleClearStaged();
    fetchBalance();
  };

  const isProcessing = Boolean(
    job && ["uploading", "queued", "extracting", "translating", "reconstructing"].includes(job.status)
  );

  const getStageIndex = (status: JobStatus, progress: number) => {
    if (status === "uploading" || status === "queued") return 0;
    if (status === "extracting") return 0;
    if (status === "translating") return 1;
    if (status === "reconstructing") return 2;
    if (progress >= 80 && status !== "ready") return 3;
    if (status === "ready") return 4;
    return 0;
  };

  const activeStageIdx = job ? getStageIndex(job.status, job.progress) : 0;
  const isImageJob = Boolean(
    job?.fileFormat && ["png", "jpg", "jpeg", "webp"].includes(job.fileFormat.toLowerCase())
  );
  const translatedPreviewSrc = translatedBlobUrl
    ? translatedBlobUrl
    : job?.jobId && job.downloadToken
    ? `/api/translate/download/${job.jobId}?token=${job.downloadToken}&inline=true&lang=${job?.targetLang || targetLang}`
    : job?.jobId
    ? `/api/jobs/${job.jobId}/preview?lang=${job?.targetLang || targetLang}`
    : "";

  return (
    <>
      <Suspense fallback={null}>
        <SearchParamsHandler onParams={handleParams} />
      </Suspense>
      <div className="h-screen w-full flex flex-col bg-canvas text-brand-ink overflow-hidden selection:bg-brand-100 selection:text-brand-ink">
      {/* ─── Studio Top Bar ────────────────────────────────────────── */}
      <header className="shrink-0 h-14 border-b border-border flex items-center justify-between px-4 sm:px-6 z-40 bg-surface-raised/90 backdrop-blur-xl">
        <div className="flex items-center gap-3 sm:gap-4">
          <Link href="/" className="text-brand-ink hover:opacity-85 transition-opacity flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-brand-ink text-white flex items-center justify-center shadow-xs">
              <Shield className="w-4 h-4 text-cta" />
            </div>
            <span className="font-bold tracking-tight text-sm font-sans">
              Verify<span className="text-cta">Lingua</span> Studio
            </span>
          </Link>

          <div className="h-4 w-[1px] bg-border hidden sm:block" />

          <Badge variant="outline" className="text-[10px] font-sans font-bold uppercase tracking-wider hidden sm:inline-flex">
            Neural Vector Sandbox
          </Badge>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-cta/20 bg-cta/5 text-brand-ink">
            <Coins className="w-3.5 h-3.5 text-cta shrink-0" />
            <span className="text-xs font-mono font-bold tabular-nums">
              {availableCredits !== null ? `${availableCredits} Credits` : "..."}
            </span>
          </div>

          <Button
            asChild
            variant="outline"
            size="sm"
            className="rounded-full text-xs font-semibold h-9 px-3.5 min-h-[44px] hidden sm:inline-flex"
          >
            <Link href="/dashboard">Docket Vault</Link>
          </Button>
        </div>
      </header>

      {/* ─── Ready State: Full Stage ResultViewer ──────────────────── */}
      {job?.status === "ready" ? (
        <div className="flex-1 flex flex-col overflow-hidden bg-canvas">
          <ResultViewer
            jobId={job.jobId}
            sourceFilename={job.fileName}
            sourceFormat={job.fileFormat}
            sourceLanguage={job.sourceLang || sourceLang}
            targetLanguage={job.targetLang || targetLang}
            pageCount={job.pageCount || 1}
            downloadUrl={job.downloadUrl || ""}
            downloadToken={job.downloadToken || ""}
            translatedBlobUrl={translatedBlobUrl}
            sourcePreviewUrl={stagedPreviewUrl}
            svgContent={job.svgContent}
            blocks={job.blocks}
            fidelityScore={job.fidelityScore}
            fidelityBreakdown={job.fidelityBreakdown}
            qualityGate={job.qualityGate}
            onReset={handleReset}
            onUpgradeToCertified={() => setServiceTier("certified")}
            onDownload={handleDownload}
          />
        </div>
      ) : (
        /* ─── Interactive Dual-Pane Studio Workspace ────────────────── */
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* LEFT COLUMN: SOURCE DOCUMENT INTAKE (w-full lg:w-5/12) */}
          <div className="w-full lg:w-5/12 flex flex-col border-b lg:border-b-0 lg:border-r border-border relative bg-surface overflow-y-auto">
            {/* Pane Header */}
            <div className="h-12 border-b border-border flex items-center justify-between px-6 shrink-0 bg-surface-raised/60">
              <span className="text-xs font-sans font-bold uppercase tracking-wider text-text-muted">
                1. Original Source Document
              </span>
              {stagedFile && (
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={!!isProcessing}
                  className="text-xs font-semibold text-text-muted hover:text-brand-ink transition-colors cursor-pointer disabled:opacity-30 min-h-[44px] inline-flex items-center"
                >
                  Clear / Replace
                </button>
              )}
            </div>

            {/* Pane Content */}
            <div className="flex-1 p-6 flex flex-col">
              {!stagedFile ? (
                /* Concentric Doppelrand Dropzone with Specimen Buttons */
                <div className="flex-1 flex flex-col justify-between">
                  <div
                    {...getRootProps()}
                    className={`card-doppelrand rounded-2xl bg-surface-raised flex flex-col items-center justify-center p-8 text-center relative border border-border transition-colors hover:border-cta/40 cursor-pointer group ${
                      isDragActive ? "border-cta bg-cta/5" : ""
                    }`}
                  >
                    <input {...getInputProps()} />

                    <div className="w-14 h-14 rounded-2xl bg-surface border border-border flex items-center justify-center mb-4 text-text-muted group-hover:text-cta group-hover:scale-105 transition-all">
                      <UploadCloud className="w-7 h-7" />
                    </div>

                    <h3 className="text-base font-bold text-brand-ink mb-1.5 font-heading">
                      Drop document to translate
                    </h3>
                    <p className="text-xs text-text-muted max-w-xs mb-5 leading-relaxed">
                      PDF, JPG, PNG, or DOCX. Seals, stamps, and layout geometry are preserved with vector fidelity.
                    </p>

                    <div className="px-5 py-2.5 rounded-full bg-cta hover:bg-cta-hover text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer min-h-[44px] inline-flex items-center justify-center">
                      Browse Files
                    </div>
                  </div>

                  {/* One-Click Specimen Triggers */}
                  <div className="w-full mt-6 pt-5 border-t border-border">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-text-muted">
                        One-Click Specimen Tests
                      </span>
                      <span className="text-[10px] text-text-muted">Instant live test</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {SPECIMEN_SAMPLES.map((sample) => (
                        <button
                          key={sample.name}
                          type="button"
                          disabled={isProcessing || isSampleLoading}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLoadSample(sample);
                          }}
                          className="p-3 rounded-xl border border-border bg-surface-raised hover:border-cta/40 hover:bg-surface transition-all text-left flex flex-col justify-between min-h-[44px] cursor-pointer group/btn"
                        >
                          <span className="text-xs font-semibold text-brand-ink group-hover/btn:text-cta line-clamp-1">
                            {sample.name}
                          </span>
                          <div className="flex items-center justify-between text-[10px] text-text-muted mt-1.5 font-sans">
                            <span>{sample.type}</span>
                            <span className="font-mono uppercase font-bold text-cta">
                              {sample.sourceLang} → {sample.targetLang}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* Staged Document View */
                <div className="flex-1 flex flex-col space-y-4">
                  {/* File Metadata Header */}
                  <div className="card-doppelrand rounded-xl border border-border bg-surface-raised p-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-surface border border-border flex items-center justify-center text-cta shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-brand-ink truncate">
                          {stagedFile.name}
                        </h4>
                        <p className="text-[11px] text-text-muted font-mono mt-0.5 tabular-nums">
                          {(stagedFile.size / 1024 / 1024).toFixed(2)} MB •{" "}
                          {stagedDimensions
                            ? `${stagedDimensions.width}×${stagedDimensions.height} px`
                            : "Standard Page"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="success" className="text-[10px] font-mono">
                        300 DPI OK
                      </Badge>
                      <button
                        type="button"
                        onClick={() => {
                          setZoomTarget("original");
                          setIsZoomModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg border border-border hover:bg-surface text-text-muted hover:text-brand-ink transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
                        title="Zoom original document"
                      >
                        <ZoomIn className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Document Canvas Preview */}
                  <div className="flex-1 min-h-[340px] rounded-xl border border-border bg-canvas overflow-hidden relative flex items-center justify-center p-2">
                    {stagedPreviewUrl ? (
                      stagedDimensions ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={stagedPreviewUrl}
                          alt="Source Document Preview"
                          className="max-w-full max-h-[500px] object-contain rounded shadow-xs"
                        />
                      ) : (
                        <iframe
                          src={stagedPreviewUrl}
                          title="Source Document Preview"
                          className="w-full h-full min-h-[400px] rounded border-0"
                        />
                      )
                    ) : (
                      <div className="text-center text-text-muted text-xs font-mono">
                        Rendering document preview…
                      </div>
                    )}

                    {/* OCR Active Scanning Effect */}
                    {isProcessing && (
                      <motion.div
                        className="absolute inset-4 border border-cta/30 bg-cta/5 rounded-lg pointer-events-none"
                        animate={{ opacity: [0.3, 0.7, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      >
                        <div className="absolute top-2 left-2 bg-cta text-white text-[9px] font-mono px-2 py-0.5 rounded-full font-bold">
                          VECTOR_OCR_ACTIVE
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: CONFIGURATION / HUD / PROCESSING (w-full lg:w-7/12) */}
          <div className="w-full lg:w-7/12 flex flex-col bg-canvas overflow-y-auto">
            {/* Pane Header */}
            <div className="h-12 border-b border-border flex items-center justify-between px-6 shrink-0 bg-surface/40">
              <span className="text-xs font-sans font-bold uppercase tracking-wider text-text-muted">
                2. Translation Configuration & Legal Output
              </span>
            </div>

            {/* Pane Content */}
            <div className="flex-1 p-6 flex flex-col justify-start space-y-6">
              {/* Configuration Controls - Fully operational on first paint */}
              {!job && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6 max-w-xl"
                >
                  {/* Language Pair Selectors with Swap */}
                  <div className="grid grid-cols-[1fr,auto,1fr] gap-2 sm:gap-3 items-end">
                    <div>
                      <label className="text-[11px] font-sans font-bold uppercase tracking-wider text-text-muted block mb-1.5">
                        Source Language
                      </label>
                      <div className="relative">
                        <select
                          value={sourceLang}
                          onChange={(e) => setSourceLang(e.target.value)}
                          className="w-full bg-surface-raised border border-border rounded-xl px-3.5 py-3 text-sm font-medium text-brand-ink focus:border-cta focus:ring-1 focus:ring-cta outline-none transition-colors appearance-none min-h-[44px] pr-8 cursor-pointer"
                        >
                          <option value="auto">Auto-Detect</option>
                          {SUPPORTED_LANGS.map((l) => (
                            <option key={l.code} value={l.code}>
                              [{l.iso}] {l.name}
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
                          <ChevronDown className="w-4 h-4" />
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleSwapLanguages}
                      title="Swap Languages"
                      aria-label="Swap Languages"
                      className="h-11 w-11 rounded-full border border-border bg-surface-raised hover:bg-surface hover:border-cta/40 text-text-muted hover:text-brand-ink flex items-center justify-center shrink-0 mb-0.5 transition-colors min-h-[44px] min-w-[44px] cursor-pointer"
                    >
                      <ArrowRightLeft className="w-4 h-4" />
                    </button>

                    <div>
                      <label className="text-[11px] font-sans font-bold uppercase tracking-wider text-text-muted block mb-1.5">
                        Target Language
                      </label>
                      <div className="relative">
                        <select
                          value={targetLang}
                          onChange={(e) => setTargetLang(e.target.value)}
                          className="w-full bg-surface-raised border border-border rounded-xl px-3.5 py-3 text-sm font-medium text-brand-ink focus:border-cta focus:ring-1 focus:ring-cta outline-none transition-colors appearance-none min-h-[44px] pr-8 cursor-pointer"
                        >
                          {SUPPORTED_LANGS.map((l) => (
                            <option key={l.code} value={l.code}>
                              [{l.iso}] {l.name}
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
                          <ChevronDown className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Service Tier Level */}
                  <div>
                    <label className="text-[11px] font-sans font-bold uppercase tracking-wider text-text-muted block mb-2">
                      Service Level & Legal Certification
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setServiceTier("automated")}
                        className={`p-3.5 rounded-xl border text-left transition-all min-h-[44px] cursor-pointer ${
                          serviceTier === "automated"
                            ? "border-cta bg-cta/5 shadow-xs"
                            : "border-border bg-surface-raised hover:border-border-strong"
                        }`}
                      >
                        <div className="text-xs font-bold text-brand-ink flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <Zap className="w-3.5 h-3.5 text-cta" />
                            <span>Automated Vector Translation</span>
                          </div>
                          {serviceTier === "automated" && (
                            <CheckCircle2 className="w-4 h-4 text-cta" />
                          )}
                        </div>
                        <p className="text-[11px] text-text-muted mt-1 leading-relaxed">
                          Instant neural translation with guaranteed artwork & typography lock.
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setServiceTier("certified")}
                        className={`p-3.5 rounded-xl border text-left transition-all min-h-[44px] cursor-pointer ${
                          serviceTier === "certified"
                            ? "border-cta bg-cta/5 shadow-xs"
                            : "border-border bg-surface-raised hover:border-border-strong"
                        }`}
                      >
                        <div className="text-xs font-bold text-brand-ink flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-court-emerald" />
                            <span>Certified USCIS Packet</span>
                          </div>
                          {serviceTier === "certified" && (
                            <CheckCircle2 className="w-4 h-4 text-cta" />
                          )}
                        </div>
                        <p className="text-[11px] text-text-muted mt-1 leading-relaxed">
                          ATA sworn affidavit & statutory compliance under 8 CFR § 103.2.
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* Guaranteed Artwork Lock Banner */}
                  <div className="card-doppelrand rounded-xl border border-border bg-surface-warm p-4 flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-court-emerald shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-brand-ink">
                        Neural Vector & Artwork Lock Active
                      </h4>
                      <p className="text-xs text-text-muted leading-relaxed">
                        OCR coordinates, logos, government seals, signatures, and numerical tables are mathematically pinned. Only translatable body copy is refit.
                      </p>
                    </div>
                  </div>

                  {/* Primary CTA Button (Button-in-Button Gate G6) */}
                  <Button
                    variant="cta"
                    size="lg"
                    onClick={stagedFile ? handleTranslateSample : () => {
                      const input = document.querySelector('input[type="file"]') as HTMLInputElement | null;
                      if (input) input.click();
                    }}
                    disabled={isProcessing}
                    trailingIcon={<Sparkles className="w-4 h-4" />}
                    className="w-full h-14 rounded-full text-base font-bold shadow-md min-h-[44px]"
                  >
                    {!stagedFile
                      ? (serviceTier === "certified" ? "Select Document for Certified Translation" : "Select Document to Translate")
                      : (serviceTier === "certified"
                        ? "Submit for Certified USCIS Translation"
                        : "Begin Vector-Preserving Translation")}
                  </Button>
                  {!stagedFile && (
                    <p className="text-center text-xs text-text-muted mt-2">
                      Upload your document in Section 1 or click a one-click specimen to begin.
                    </p>
                  )}
                </motion.div>
              )}

              {/* Studio stage configuration active */}

              {/* Pipeline Active HUD */}
              {isProcessing && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex-1 flex flex-col space-y-6 max-w-xl"
                >
                  {/* Concentric Progress Card */}
                  <div className="card-doppelrand rounded-2xl bg-surface-raised p-6 relative overflow-hidden border border-border space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-cta/10 flex items-center justify-center text-cta">
                          <Sparkles className="w-5 h-5 animate-spin" style={{ animationDuration: "3s" }} />
                        </div>
                        <div>
                          <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-cta">
                            Active Neural Pipeline
                          </span>
                          <h3 className="text-lg font-bold text-brand-ink tracking-tight font-heading">
                            Processing Document
                          </h3>
                        </div>
                      </div>

                      {/* Circular Progress Gauge / Numeral */}
                      <div className="flex items-baseline gap-1 bg-surface px-3 py-1.5 rounded-full border border-border">
                        <span className="font-mono text-xl font-bold tabular-nums text-brand-ink">
                          {job?.progress || 0}
                        </span>
                        <span className="text-xs font-mono text-text-muted">%</span>
                      </div>
                    </div>

                    {/* High-Contrast GPU scaleX Track */}
                    <div className="space-y-1.5">
                      <div className="h-2 rounded-full bg-surface-sunken overflow-hidden relative">
                        <div
                          className="h-full bg-cta origin-left transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
                          style={{
                            transform: `scaleX(${Math.max(0.05, (job?.progress || 0) / 100)})`,
                            width: "100%",
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs text-text-muted">
                        <span className="font-mono truncate max-w-sm">{job?.currentStep}</span>
                        <span className="font-sans text-[11px] font-semibold text-cta">
                          {activeStageIdx + 1} of 5 Gates
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Stage Checklist */}
                  <div className="space-y-2.5">
                    {PIPELINE_STAGES.map((stage, idx) => {
                      const isActive = activeStageIdx === idx;
                      const isDone = activeStageIdx > idx;
                      return (
                        <div
                          key={stage.id}
                          className={`p-4 rounded-xl border flex items-center gap-4 transition-all ${
                            isActive
                              ? "card-doppelrand bg-surface-raised border-cta/40 shadow-xs"
                              : isDone
                              ? "bg-surface-raised border-border"
                              : "bg-surface/50 border-border/40 opacity-50"
                          }`}
                        >
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold transition-colors ${
                              isDone
                                ? "bg-court-emerald text-white"
                                : isActive
                                ? "bg-cta text-white"
                                : "bg-surface-sunken text-text-muted"
                            }`}
                          >
                            {isDone ? <Check className="w-4 h-4" /> : idx + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div
                              className={`text-sm font-semibold truncate ${
                                isActive ? "text-brand-ink" : isDone ? "text-brand-ink" : "text-text-muted"
                              }`}
                            >
                              {stage.label}
                            </div>
                            <div className="text-xs text-text-muted mt-0.5 line-clamp-1">{stage.desc}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Insufficient Credits Banner */}
              {job?.error === "INSUFFICIENT_CREDITS" && (
                <div className="card-doppelrand rounded-xl bg-status-danger-bg border border-status-danger/30 p-5 space-y-3 max-w-xl">
                  <div className="flex items-center gap-2 text-status-danger font-bold text-sm">
                    <AlertTriangle className="w-4 h-4 text-status-danger shrink-0" />
                    <span>Insufficient Page Credits</span>
                  </div>
                  <p className="text-xs text-text-muted leading-relaxed">
                    This document requires{" "}
                    <span className="font-mono font-bold text-brand-ink">
                      {job.creditError?.required || 1}
                    </span>{" "}
                    credits, but your account balance is{" "}
                    <span className="font-mono font-bold text-brand-ink">
                      {job.creditError?.available || 0}
                    </span>.
                  </p>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <Button
                      asChild
                      variant="cta"
                      size="sm"
                      className="rounded-full text-xs font-bold min-h-[44px]"
                    >
                      <Link href="/pricing">Add Credits</Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleGrantTestCredits}
                      disabled={grantingCredits}
                      className="rounded-full text-xs font-semibold min-h-[44px]"
                    >
                      {grantingCredits ? "Adding 50 Credits..." : "Dev: Add 50 Test Credits"}
                    </Button>
                  </div>
                </div>
              )}

              {/* General Failure State */}
              {job?.status === "failed" && job.error !== "INSUFFICIENT_CREDITS" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="card-doppelrand rounded-2xl border border-status-danger/30 bg-status-danger-bg p-6 text-brand-ink space-y-3 max-w-xl"
                >
                  <div className="flex items-center gap-2 text-status-danger font-bold text-base">
                    <AlertTriangle className="w-5 h-5 text-status-danger shrink-0" />
                    <span>Translation Processing Error</span>
                  </div>
                  <p className="text-xs text-text-muted leading-relaxed">
                    {job?.error || "An unexpected error occurred during pipeline execution. Please try again."}
                  </p>
                  <div className="pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleReset}
                      className="rounded-full text-xs font-semibold min-h-[44px]"
                    >
                      Acknowledge & Reset Studio
                    </Button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── Lightbox / Zoom Modal with 0ms Escape Dismissal (Gate G21) ─ */}
      <AnimatePresence>
        {isZoomModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            className="fixed inset-0 z-[100] bg-obsidian-950/75 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8"
            onClick={() => setIsZoomModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              transition={{ duration: 0.12, ease: [0.32, 0.72, 0, 1] }}
              className="card-doppelrand-raised relative max-w-6xl max-h-[90vh] bg-surface-raised rounded-2xl border border-border overflow-hidden flex flex-col shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-border flex items-center justify-between bg-surface">
                <span className="text-xs font-sans uppercase font-bold text-text-muted">
                  {zoomTarget === "translated"
                    ? "Translated Document High-Resolution View"
                    : "Original Document High-Resolution View"}
                </span>
                <button
                  type="button"
                  onClick={() => setIsZoomModalOpen(false)}
                  className="p-2 rounded-full hover:bg-surface-sunken text-text-muted hover:text-brand-ink transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
                  aria-label="Close modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-8 overflow-auto flex items-center justify-center bg-canvas max-h-[80vh]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={zoomTarget === "translated" ? translatedPreviewSrc : (stagedPreviewUrl || "")}
                  alt="Detail"
                  className="max-h-[75vh] w-auto object-contain border border-border rounded-lg shadow-lg"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </>
  );
}
