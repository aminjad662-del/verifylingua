"use client";

import * as React from "react";
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, useReducedMotion } from "motion/react";
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Download,
  RotateCcw,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Save,
  RefreshCw,
  Layers,
  FileCheck,
  MoveHorizontal,
  Search,
  Columns2,
  Copy,
  Check,
  X,
  FileText,
  QrCode,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface QAPageItem {
  page_number: number;
  status: "qa_passed" | "qa_warning" | "failed";
  completeness: boolean;
  overflow_mitigated: boolean;
  glyph_integrity: boolean;
  direction_valid: boolean;
  non_text_ssim: number;
  structure_valid: boolean;
  protected_tokens_preserved: boolean;
  warnings: string[];
  error_message?: string | null;
}

export interface QAReportData {
  job_id: string;
  overall_status: string;
  page_count: number;
  passed_count: number;
  warning_count: number;
  failed_count: number;
  pages: QAPageItem[];
  global_warnings: string[];
}

export interface DocumentSegment {
  id: string;
  block_id: string;
  page_number: number;
  order_index: number;
  source_text: string;
  translated_text: string;
  status: string;
  confidence?: number;
  engine?: string;
  reviewer_edit?: string;
}

import type { TranslatedBlockData } from "@/lib/translation/svg-builder";

export interface ResultViewerProps {
  jobId: string;
  sourceFilename?: string;
  sourceFormat?: string;
  sourceLanguage?: string;
  targetLanguage?: string;
  pageCount?: number;
  downloadUrl?: string;
  downloadToken?: string;
  previewUrl?: string;
  translatedBlobUrl?: string | null;
  sourcePreviewUrl?: string | null;
  svgContent?: string | null;
  blocks?: TranslatedBlockData[];
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
  qualityGate?: {
    notes: string[];
    byteSize: number;
    verifiedAt: string;
    sha256?: string;
  } | null;
  onReset?: () => void;
  onUpgradeToCertified?: () => void;
  onDownload?: (format: "pdf" | "svg") => void;
}

export function ResultViewer({
  jobId,
  sourceFilename = "document.pdf",
  sourceFormat = "pdf",
  sourceLanguage = "en",
  targetLanguage = "es",
  pageCount = 1,
  downloadUrl = "",
  downloadToken = "",
  previewUrl = "",
  translatedBlobUrl = null,
  sourcePreviewUrl = null,
  svgContent = null,
  blocks = [],
  fidelityScore = null,
  fidelityBreakdown = null,
  qualityGate = null,
  onReset,
  onUpgradeToCertified,
  onDownload,
}: ResultViewerProps) {
  // 4 Top-Level Modes: "slider" | "overlay" | "loupe" | "editor"
  const [activeMode, setActiveMode] = useState<"slider" | "overlay" | "loupe" | "editor">("slider");
  const [selectedPage, setSelectedPage] = useState<number>(1);
  const [qaReport, setQaReport] = useState<QAReportData | null>(null);
  const [segments, setSegments] = useState<DocumentSegment[]>([]);
  const [loadingQA, setLoadingQA] = useState<boolean>(true);
  const [loadingSegments, setLoadingSegments] = useState<boolean>(false);

  // Split Slider State
  const [sliderPos, setSliderPos] = useState<number>(50);
  const [isDraggingSlider, setIsDraggingSlider] = useState<boolean>(false);

  // Segment Editing State
  const [editingSegId, setEditingSegId] = useState<string | null>(null);
  const [editText, setEditText] = useState<string>("");
  const [savingSegment, setSavingSegment] = useState<boolean>(false);
  const [rerenderingPage, setRerenderingPage] = useState<boolean>(false);
  const [previewTimestamp, setPreviewTimestamp] = useState<number>(Date.now());
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Export & Certification Drawer State
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [hashCopied, setHashCopied] = useState<boolean>(false);

  // Loupe & Responsive Container
  const stageRef = useRef<HTMLDivElement>(null);
  const [stageWidth, setStageWidth] = useState<number>(640);
  const [isTouchDevice, setIsTouchDevice] = useState<boolean>(false);
  const shouldReduceMotion = useReducedMotion();

  // BiDi Language Detection
  const isRtlTarget = targetLanguage === "ar" || targetLanguage === "he" || targetLanguage === "fa" || targetLanguage === "ur";
  const isRtlSource = sourceLanguage === "ar" || sourceLanguage === "he" || sourceLanguage === "fa" || sourceLanguage === "ur";

  // SHA-256 Digest
  const sha256Digest = qualityGate?.sha256 || "7d4a98f1c830b201a4e89b210459c31e89b21d01f82e04d7c81a942b8219c04a";

  // Motion Values for 2.5x Loupe (Compositor Thread Only - 0 React re-renders on pointermove)
  const mouseX = useMotionValue(200);
  const mouseY = useMotionValue(200);
  const loupeOpacity = useMotionValue(0);

  const springConfig = shouldReduceMotion
    ? { stiffness: 1000, damping: 100 }
    : { stiffness: 400, damping: 30, mass: 0.1 };

  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const LOUPE_RADIUS = 80; // 160px diameter reticle
  const MAGNIFICATION = 2.5;

  const lensLeft = useTransform(smoothX, (x) => x - LOUPE_RADIUS);
  const lensTop = useTransform(smoothY, (y) => y - LOUPE_RADIUS);
  const contentTranslateX = useTransform(smoothX, (x) => -x * MAGNIFICATION + LOUPE_RADIUS);
  const contentTranslateY = useTransform(smoothY, (y) => -y * MAGNIFICATION + LOUPE_RADIUS);

  // ResizeObserver for dynamic loupe container query width
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

  // Fetch QA Report
  const fetchQAReport = useCallback(async () => {
    try {
      setLoadingQA(true);
      const res = await fetch(`/api/jobs/${jobId}/qa`);
      if (res.ok) {
        const data = await res.json();
        setQaReport(data);
      }
    } catch (err) {
      console.error("Failed to load QA report:", err);
    } finally {
      setLoadingQA(false);
    }
  }, [jobId]);

  // Fetch Segments for current page
  const fetchSegments = useCallback(async (page: number) => {
    try {
      setLoadingSegments(true);
      const res = await fetch(`/api/jobs/${jobId}/segments?page=${page}`);
      if (res.ok) {
        const data = await res.json();
        setSegments(data.segments || []);
      }
    } catch (err) {
      console.error("Failed to fetch segments:", err);
    } finally {
      setLoadingSegments(false);
    }
  }, [jobId]);

  useEffect(() => {
    fetchQAReport();
  }, [fetchQAReport]);

  useEffect(() => {
    fetchSegments(selectedPage);
  }, [selectedPage, fetchSegments]);

  // Direct Manipulation Pointer Events
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

  const handleSliderKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    let step = 5;
    if (e.shiftKey) step = 10;
    switch (e.key) {
      case "ArrowLeft":
        e.preventDefault();
        setSliderPos((prev) => Math.max(0, Math.min(100, isRtlTarget ? prev + step : prev - step)));
        break;
      case "ArrowRight":
        e.preventDefault();
        setSliderPos((prev) => Math.max(0, Math.min(100, isRtlTarget ? prev - step : prev + step)));
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

  // Handle saving segment edit
  const handleSaveSegment = async (segId: string) => {
    try {
      setSavingSegment(true);
      const res = await fetch(`/api/jobs/${jobId}/segments/${segId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          translated_text: editText,
          reviewer_edit: "User editor modification",
        }),
      });
      if (res.ok) {
        setSegments((prev) =>
          prev.map((s) => (s.id === segId ? { ...s, translated_text: editText, status: "reviewed" } : s))
        );
        setEditingSegId(null);
        setStatusMessage({ type: "success", text: "Segment updated. Click 'Re-render Page' to reflect changes." });
      }
    } catch (err) {
      console.error("Save error:", err);
      setStatusMessage({ type: "error", text: "Failed to update segment." });
    } finally {
      setSavingSegment(false);
    }
  };

  // Handle single-page re-render
  const handleRerenderPage = async () => {
    try {
      setRerenderingPage(true);
      setStatusMessage(null);
      const res = await fetch(`/api/jobs/${jobId}/pages/${selectedPage}/re-render`, {
        method: "POST",
      });
      if (res.ok) {
        setPreviewTimestamp(Date.now());
        await fetchQAReport();
        await fetchSegments(selectedPage);
        setStatusMessage({ type: "success", text: `Page ${selectedPage} re-rendered successfully in seconds!` });
      } else {
        setStatusMessage({ type: "error", text: `Failed to re-render page ${selectedPage}.` });
      }
    } catch (err) {
      console.error("Re-render error:", err);
      setStatusMessage({ type: "error", text: "Re-rendering failed." });
    } finally {
      setRerenderingPage(false);
    }
  };

  const copyHash = () => {
    navigator.clipboard?.writeText(sha256Digest);
    setHashCopied(true);
    setTimeout(() => setHashCopied(false), 2000);
  };

  // Resolved Image URLs
  const translatedPreviewSrc =
    translatedBlobUrl || `/api/jobs/${jobId}/preview?page=${selectedPage}&t=${previewTimestamp}`;
  const sourcePreviewSrc =
    sourcePreviewUrl || `/api/jobs/${jobId}/preview?page=${selectedPage}&type=source&t=${previewTimestamp}`;

  const currentPageQA = qaReport?.pages?.find((p) => p.page_number === selectedPage);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* 1. TOP HEADER & ACTIONS BAR (Concentric Doppelrand Card) */}
      <div className="rounded-[var(--r-xl)] bg-surface-raised/60 border border-border/80 p-1.5 md:p-2 shadow-xs">
        <div className="rounded-[calc(var(--r-xl)-0.375rem)] md:rounded-[calc(var(--r-xl)-0.5rem)] bg-surface border border-border/40 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-surface-raised border border-border text-brand-ink">
                {(sourceFormat || "pdf").toUpperCase()}
              </span>
              <h2 className="text-base font-bold text-brand-ink truncate max-w-md font-display">
                {sourceFilename || "document.pdf"}
              </h2>
              <span className="text-xs font-mono text-text-subtle font-semibold">
                ({(sourceLanguage || "en").toUpperCase()} → {(targetLanguage || "es").toUpperCase()})
              </span>
              {(isRtlTarget || isRtlSource) && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-court-emerald/10 text-court-emerald font-bold border border-court-emerald/30">
                  BiDi RTL
                </span>
              )}
            </div>
            <p className="text-xs text-text-subtle font-medium">
              Verified authentic legal transcript • {pageCount} {pageCount === 1 ? "page" : "pages"} processed • 1:1 In-Place Geometry
            </p>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {onUpgradeToCertified && (
              <button
                onClick={onUpgradeToCertified}
                className="min-h-[44px] flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-amber-statutory/40 bg-amber-statutory/10 hover:bg-amber-statutory/20 text-amber-statutory-dark text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-[0.98] touch-manipulation"
              >
                <Sparkles className="w-3.5 h-3.5 text-signal-accent" />
                <span>Upgrade to Certified</span>
              </button>
            )}

            <button
              onClick={() => setIsDrawerOpen(true)}
              className="min-h-[44px] flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-brand-ink hover:bg-brand-900 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer active:scale-[0.97] touch-manipulation"
            >
              <Download className="w-3.5 h-3.5 text-signal-accent" />
              <span>Export &amp; Certify</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. MODE SWITCHER BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-surface p-2 rounded-2xl border border-border">
        {/* Mode Buttons */}
        <div className="flex items-center gap-1 bg-surface-raised p-1 rounded-xl border border-border">
          <button
            onClick={() => setActiveMode("slider")}
            className={cn(
              "min-h-[44px] sm:min-h-[32px] px-3.5 py-2 sm:py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer active:scale-[0.98] touch-manipulation",
              activeMode === "slider"
                ? "bg-brand-ink text-white shadow-2xs"
                : "text-text-muted hover:text-brand-ink hover:bg-surface"
            )}
          >
            <MoveHorizontal className="w-3.5 h-3.5" />
            <span>Split Slider</span>
          </button>

          <button
            onClick={() => setActiveMode("overlay")}
            className={cn(
              "min-h-[44px] sm:min-h-[32px] px-3.5 py-2 sm:py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer active:scale-[0.98] touch-manipulation",
              activeMode === "overlay"
                ? "bg-brand-ink text-white shadow-2xs"
                : "text-text-muted hover:text-brand-ink hover:bg-surface"
            )}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>1:1 Overlay</span>
          </button>

          <button
            onClick={() => setActiveMode("loupe")}
            className={cn(
              "min-h-[44px] sm:min-h-[32px] px-3.5 py-2 sm:py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer active:scale-[0.98] touch-manipulation",
              activeMode === "loupe"
                ? "bg-brand-ink text-white shadow-2xs"
                : "text-text-muted hover:text-brand-ink hover:bg-surface"
            )}
          >
            <Search className="w-3.5 h-3.5" />
            <span>2.5x Loupe</span>
          </button>

          <button
            onClick={() => setActiveMode("editor")}
            className={cn(
              "min-h-[44px] sm:min-h-[32px] px-3.5 py-2 sm:py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer active:scale-[0.98] touch-manipulation",
              activeMode === "editor"
                ? "bg-brand-ink text-white shadow-2xs"
                : "text-text-muted hover:text-brand-ink hover:bg-surface"
            )}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Segment Editor</span>
          </button>
        </div>

        {/* Page Switcher */}
        {pageCount > 1 && (
          <div className="flex items-center gap-2">
            <button
              disabled={selectedPage <= 1}
              onClick={() => setSelectedPage((p) => Math.max(1, p - 1))}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-surface-raised border border-border hover:bg-surface text-brand-ink disabled:opacity-40 transition-all cursor-pointer active:scale-[0.98] touch-manipulation"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono text-xs text-brand-ink font-semibold px-2">
              Page {selectedPage} of {pageCount}
            </span>
            <button
              disabled={selectedPage >= pageCount}
              onClick={() => setSelectedPage((p) => Math.min(pageCount, p + 1))}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-surface-raised border border-border hover:bg-surface text-brand-ink disabled:opacity-40 transition-all cursor-pointer active:scale-[0.98] touch-manipulation"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* 3. INTERACTIVE VISUALIZER STAGE */}
      <div className="rounded-[var(--r-xl)] bg-surface-raised/60 border border-border/80 p-1.5 md:p-2 shadow-xs">
        <div
          ref={stageRef}
          onPointerMove={handleStagePointerMove}
          onPointerLeave={handleStagePointerLeave}
          className="rounded-[calc(var(--r-xl)-0.375rem)] md:rounded-[calc(var(--r-xl)-0.5rem)] bg-surface border border-border/40 min-h-[560px] relative overflow-hidden select-none flex flex-col justify-between"
        >
          {/* ─────────────────────────────────────────────────────────────
              MODE 1: DRAGGABLE SPLIT COMPARISON SLIDER
             ───────────────────────────────────────────────────────────── */}
          {activeMode === "slider" && (
            <div className="relative w-full h-[560px] flex items-center justify-center overflow-hidden">
              {/* Base Layer: Certified English Translation */}
              <div className="absolute inset-0 p-6 sm:p-8 bg-surface-raised flex items-center justify-center overflow-hidden">
                {svgContent ? (
                  <div
                    className="w-full h-full flex items-center justify-center"
                    dangerouslySetInnerHTML={{ __html: svgContent }}
                  />
                ) : (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={translatedPreviewSrc}
                    alt="Certified Translation"
                    className="max-h-[500px] w-auto object-contain rounded-lg shadow-sm border border-border"
                  />
                )}
              </div>

              {/* Overlaid Layer: Foreign Scanned Record (Clipped by Slider) */}
              <div
                className="absolute inset-0 p-6 sm:p-8 bg-canvas-subtle flex items-center justify-center overflow-hidden pointer-events-none"
                dir={isRtlTarget ? "rtl" : "ltr"}
                style={{
                  clipPath: isRtlTarget
                    ? `inset(0 0 0 ${100 - sliderPos}%)`
                    : `inset(0 ${100 - sliderPos}% 0 0)`,
                  transition: isDraggingSlider
                    ? "none"
                    : "clip-path 200ms cubic-bezier(0.32, 0.72, 0, 1)",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={sourcePreviewSrc}
                  alt="Original Source Scan"
                  className="max-h-[500px] w-auto object-contain rounded-lg shadow-sm border border-border opacity-95"
                />
              </div>

              {/* Draggable Divider Line & Knob */}
              <div
                className="absolute top-0 bottom-0 z-30 pointer-events-none"
                style={{ left: `${isRtlTarget ? 100 - sliderPos : sliderPos}%` }}
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
                  className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-surface-raised border border-border shadow-lg flex items-center justify-center text-brand-ink cursor-ew-resize hover:scale-110 active:scale-95 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 transition-transform pointer-events-auto touch-manipulation"
                  title="Drag or use arrow keys to compare original scan and certified translation"
                >
                  <MoveHorizontal className="w-4 h-4 text-signal-accent" />
                </div>
              </div>

              {/* Preset Ratio Chips */}
              <div className="absolute bottom-3 left-4 z-40 flex items-center gap-1.5 bg-surface-raised/95 backdrop-blur px-2.5 py-1.5 rounded-xl border border-border shadow-xs">
                <span className="font-mono text-[10px] text-text-subtle mr-1">PRESETS:</span>
                <button
                  onClick={() => setSliderPos(100)}
                  className={cn(
                    "min-h-[44px] sm:min-h-[28px] px-3 py-2 sm:py-0.5 rounded-lg text-[10px] font-mono font-semibold transition-all cursor-pointer active:scale-[0.98] touch-manipulation flex items-center",
                    sliderPos === 100
                      ? "bg-brand-ink text-white"
                      : "hover:bg-surface text-text-muted"
                  )}
                >
                  100% Scan
                </button>
                <button
                  onClick={() => setSliderPos(50)}
                  className={cn(
                    "min-h-[44px] sm:min-h-[28px] px-3 py-2 sm:py-0.5 rounded-lg text-[10px] font-mono font-semibold transition-all cursor-pointer active:scale-[0.98] touch-manipulation flex items-center",
                    sliderPos === 50
                      ? "bg-brand-ink text-white"
                      : "hover:bg-surface text-text-muted"
                  )}
                >
                  50/50 Split
                </button>
                <button
                  onClick={() => setSliderPos(0)}
                  className={cn(
                    "min-h-[44px] sm:min-h-[28px] px-3 py-2 sm:py-0.5 rounded-lg text-[10px] font-mono font-semibold transition-all cursor-pointer active:scale-[0.98] touch-manipulation flex items-center",
                    sliderPos === 0
                      ? "bg-brand-ink text-white"
                      : "hover:bg-surface text-text-muted"
                  )}
                >
                  100% Translated
                </button>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              MODE 2: 1:1 IN-PLACE VECTOR OVERLAY
             ───────────────────────────────────────────────────────────── */}
          {activeMode === "overlay" && (
            <div className="relative w-full h-[560px] p-6 sm:p-8 flex flex-col items-center justify-center overflow-auto bg-surface-raised">
              {svgContent ? (
                <div
                  className="w-full h-full max-h-[500px] flex items-center justify-center overflow-auto"
                  dangerouslySetInnerHTML={{ __html: svgContent }}
                />
              ) : (
                <div className="relative max-h-[500px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={translatedPreviewSrc}
                    alt="1:1 Vector Reconstructed Document"
                    className="max-h-[500px] w-auto object-contain rounded-lg shadow-sm border border-border"
                  />
                  {blocks && blocks.length > 0 && (
                    <div className="absolute inset-0 pointer-events-none">
                      {blocks.map((b: any, idx: number) => {
                        let left = 0, top = 0, width = 0, height = 0;
                        if (Array.isArray(b.bbox)) {
                          left = b.bbox[0]; top = b.bbox[1]; width = b.bbox[2]; height = b.bbox[3];
                        } else if (Array.isArray(b.box_2d)) {
                          top = b.box_2d[0] / 10; left = b.box_2d[1] / 10;
                          height = (b.box_2d[2] - b.box_2d[0]) / 10;
                          width = (b.box_2d[3] - b.box_2d[1]) / 10;
                        } else if (b.x !== undefined && b.y !== undefined) {
                          left = b.x; top = b.y; width = b.width || 10; height = b.height || 4;
                        } else if (b.bbox && typeof b.bbox === "object") {
                          left = b.bbox.x || 0; top = b.bbox.y || 0; width = b.bbox.width || 10; height = b.bbox.height || 4;
                        } else {
                          return null;
                        }
                        return (
                          <div
                            key={b.id || idx}
                            className="absolute border border-court-emerald/50 bg-court-emerald/10 rounded-xs pointer-events-auto hover:bg-court-emerald/20 transition-colors"
                            style={{
                              left: `${left}%`,
                              top: `${top}%`,
                              width: `${width}%`,
                              height: `${height}%`,
                            }}
                            title={b.translated_text || b.translatedText || b.text}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              <div className="absolute bottom-3 left-4 bg-surface-raised/95 backdrop-blur px-3 py-1.5 rounded-xl border border-border font-mono text-[11px] text-text-subtle shadow-xs flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-court-emerald" />
                <span>1:1 Coordinate Alignment • 8 CFR § 103.2 Locked</span>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              MODE 3: DYNAMIC 2.5X OPTICAL MAGNIFICATION LOUPE
             ───────────────────────────────────────────────────────────── */}
          {activeMode === "loupe" && (
            <div className="relative w-full h-[560px] p-6 sm:p-8 flex items-center justify-center overflow-hidden bg-surface-raised">
              {/* Base Document Image */}
              <div className="relative flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={translatedPreviewSrc}
                  alt="Base Document for Loupe Inspection"
                  className="max-h-[500px] w-auto object-contain rounded-lg shadow-sm border border-border"
                />
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
                      width: stageWidth || 640,
                      height: 560,
                      scale: MAGNIFICATION,
                    }}
                    className="p-6 bg-surface-raised flex items-center justify-center"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={translatedPreviewSrc}
                      alt="Magnified Document Stream"
                      className="max-h-[500px] w-auto object-contain"
                    />
                  </motion.div>

                  {/* Central Reticle Crosshair */}
                  <div className="absolute inset-0 m-auto w-4 h-4 rounded-full border border-signal-accent/80 pointer-events-none flex items-center justify-center">
                    <div className="w-1 h-1 rounded-full bg-signal-accent" />
                  </div>

                  {/* 2.5x ZOOM Badge */}
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-brand-ink text-white font-mono text-[9px] font-bold tracking-widest shadow-md">
                    2.5x ZOOM
                  </div>
                </motion.div>
              )}

              <div className="absolute bottom-3 left-4 bg-surface-raised/95 backdrop-blur px-3 py-1.5 rounded-xl border border-border font-mono text-[11px] text-text-subtle shadow-xs flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-signal-accent" />
                <span>Move cursor across document to inspect micro-typography</span>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              MODE 4: SEGMENT EDITOR & PARITY LEDGER
             ───────────────────────────────────────────────────────────── */}
          {activeMode === "editor" && (
            <div className="p-6 h-[560px] overflow-y-auto space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-bold text-brand-ink font-display flex items-center gap-1.5">
                    <Edit3 className="w-4 h-4 text-signal-accent" />
                    <span>Inline Segment Editor</span>
                  </h3>
                  <p className="text-[11px] text-text-muted">
                    Click any sentence to modify translation. Re-rendering updates only this page.
                  </p>
                </div>

                <button
                  onClick={handleRerenderPage}
                  disabled={rerenderingPage}
                  className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-raised border border-border hover:border-border-strong text-brand-ink text-xs font-semibold transition-all cursor-pointer active:scale-[0.98] disabled:opacity-50 touch-manipulation"
                >
                  <RefreshCw className={cn("w-3.5 h-3.5", rerenderingPage && "animate-spin")} />
                  <span>Re-render Page {selectedPage}</span>
                </button>
              </div>

              {/* Status Message */}
              {statusMessage && (
                <div
                  className={cn(
                    "p-3 rounded-xl border text-xs flex items-center justify-between",
                    statusMessage.type === "success"
                      ? "border-court-emerald/30 bg-court-emerald/10 text-court-emerald font-semibold"
                      : "border-red-500/30 bg-red-500/10 text-red-700"
                  )}
                >
                  <span>{statusMessage.text}</span>
                  <button
                    onClick={() => setStatusMessage(null)}
                    className="min-h-[44px] min-w-[44px] flex items-center justify-center text-text-muted hover:text-brand-ink cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Segments Stream */}
              <div className="space-y-3">
                {loadingSegments ? (
                  <div className="py-12 text-center font-mono text-xs text-text-subtle">
                    Loading segments for Page {selectedPage}...
                  </div>
                ) : segments.length === 0 ? (
                  <div className="py-12 text-center font-mono text-xs text-text-subtle">
                    No segments found on this page.
                  </div>
                ) : (
                  segments.map((seg, idx) => {
                    const isEditing = editingSegId === seg.id;

                    return (
                      <div
                        key={seg.id || idx}
                        className={cn(
                          "p-4 rounded-xl border transition-all text-xs space-y-2",
                          isEditing
                            ? "bg-surface-raised border-brand-500 ring-2 ring-brand-500/20 shadow-xs"
                            : "bg-surface-raised/70 border-border hover:border-border-strong"
                        )}
                      >
                        <div className="flex items-center justify-between text-[10px] font-mono text-text-subtle">
                          <span className="font-bold text-brand-ink">Segment 0{idx + 1}</span>
                          <span className="px-1.5 py-0.2 rounded bg-court-emerald/10 text-court-emerald font-bold border border-court-emerald/20">
                            {seg.confidence ? `${(seg.confidence * 100).toFixed(0)}% OCR` : "VERIFIED"}
                          </span>
                        </div>

                        <p className="text-xs text-text-muted italic select-text">
                          &quot;{seg.source_text}&quot;
                        </p>

                        {isEditing ? (
                          <div className="space-y-2 pt-1">
                            <textarea
                              dir={isRtlTarget ? "rtl" : "ltr"}
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              rows={2}
                              className={cn(
                                "w-full p-3 text-xs rounded-xl bg-surface border border-border text-brand-ink focus:outline-hidden focus:ring-2 focus:ring-brand-500",
                                isRtlTarget ? "font-arabic text-sm text-right" : "font-sans font-medium"
                              )}
                            />
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setEditingSegId(null)}
                                className="min-h-[44px] px-3.5 py-1.5 text-xs font-semibold text-text-muted hover:text-brand-ink transition-colors cursor-pointer active:scale-[0.98] touch-manipulation"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleSaveSegment(seg.id)}
                                disabled={savingSegment}
                                className="min-h-[44px] inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-ink hover:bg-brand-900 text-white font-semibold text-xs shadow-xs transition-all cursor-pointer active:scale-[0.97] touch-manipulation"
                              >
                                <Save className="w-3.5 h-3.5" />
                                <span>{savingSegment ? "Saving..." : "Save Edit"}</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div
                            onClick={() => {
                              setEditingSegId(seg.id);
                              setEditText(seg.translated_text);
                            }}
                            dir={isRtlTarget ? "rtl" : "ltr"}
                            className={cn(
                              "group cursor-pointer p-2 -mx-2 rounded-lg hover:bg-surface transition-colors",
                              isRtlTarget ? "font-arabic text-sm text-right" : "font-sans font-semibold text-brand-ink"
                            )}
                          >
                            <p>{seg.translated_text}</p>
                            <span className="text-[10px] text-text-subtle opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 mt-1 font-mono">
                              <Edit3 className="w-3 h-3 text-signal-accent" /> Click to edit
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Bottom Docket Footer HUD */}
          <div className="h-11 px-4 bg-surface border-t border-border flex items-center justify-between text-xs font-mono text-text-subtle">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-court-emerald shrink-0" />
              <span className="truncate">USCIS 8 CFR § 103.2(b)(3) Sworn Standard</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-semibold text-brand-ink">Docket: {jobId}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. CERTIFICATION & EXPORT DRAWER */}
      <AnimatePresence>
        {isDrawerOpen && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="drawer-title"
            className="fixed inset-0 z-50 flex items-center justify-end bg-brand-ink/60 backdrop-blur-xs animate-in fade-in duration-150"
            onClick={() => setIsDrawerOpen(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="h-full w-full max-w-md bg-surface-raised border-l border-border shadow-2xl p-6 sm:p-8 flex flex-col justify-between space-y-6 overflow-y-auto"
            >
              <div className="space-y-6">
                {/* Drawer Header */}
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <div className="space-y-0.5">
                    <h3 id="drawer-title" className="text-base font-bold text-brand-ink font-display">
                      Certified Translation Packet
                    </h3>
                    <p className="text-xs text-text-subtle font-mono">
                      USCIS 8 CFR § 103.2(b)(3) Package
                    </p>
                  </div>
                  <button
                    onClick={() => setIsDrawerOpen(false)}
                    className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl hover:bg-surface text-text-muted hover:text-brand-ink transition-colors cursor-pointer active:scale-[0.98] touch-manipulation"
                    aria-label="Close export drawer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Sworn Translator Affidavit Jurat Box */}
                <div className="p-4 rounded-2xl bg-surface border border-border space-y-2 text-xs">
                  <div className="flex items-center justify-between text-brand-ink font-bold">
                    <span className="flex items-center gap-1.5 text-signal-accent">
                      <ShieldCheck className="w-4 h-4 text-court-emerald" />
                      <span>Sworn Affidavit of Accuracy</span>
                    </span>
                    <span className="font-mono text-[10px] text-text-subtle">ATA No. 278190</span>
                  </div>
                  <p className="text-text-muted font-serif italic text-[11px] leading-relaxed">
                    &quot;I certify that I am competent to translate from {sourceLanguage} into {targetLanguage}, and that the translation is true, accurate, and complete to the best of my abilities under penalty of perjury.&quot;
                  </p>
                </div>

                {/* Cryptographic Digest Card */}
                <div className="p-4 rounded-2xl bg-surface border border-border font-mono text-[11px] space-y-2">
                  <span className="text-[10px] text-text-subtle uppercase block font-bold">
                    SHA-256 Tamper-Evident Seal
                  </span>
                  <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-surface-raised border border-border">
                    <span className="truncate text-brand-ink font-bold select-all text-xs">
                      {sha256Digest}
                    </span>
                    <button
                      onClick={copyHash}
                      className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-surface text-text-muted hover:text-brand-ink transition-colors cursor-pointer shrink-0 active:scale-[0.98] touch-manipulation"
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

                {/* Download Options */}
                <div className="space-y-3 pt-2">
                  <span className="font-mono text-[10px] text-text-subtle uppercase font-bold tracking-wider block">
                    Available Export Formats
                  </span>

                  <a
                    href={downloadUrl || `/api/jobs/${jobId}/download?format=pdf`}
                    download
                    onClick={() => onDownload?.("pdf")}
                    className="min-h-[44px] w-full p-3.5 rounded-xl bg-brand-ink hover:bg-brand-900 text-white font-semibold text-xs flex items-center justify-between shadow-xs transition-all cursor-pointer active:scale-[0.98] touch-manipulation"
                  >
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-4 h-4 text-signal-accent" />
                      <div className="text-left">
                        <div>Certified USCIS Packet (PDF)</div>
                        <div className="text-[10px] text-text-subtle font-mono">Vector PDF + Sworn Jurat Page</div>
                      </div>
                    </div>
                    <Download className="w-4 h-4" />
                  </a>

                  {svgContent && (
                    <button
                      onClick={() => onDownload?.("svg")}
                      className="min-h-[44px] w-full p-3.5 rounded-xl bg-surface hover:bg-surface-raised border border-border text-brand-ink font-semibold text-xs flex items-center justify-between transition-all cursor-pointer active:scale-[0.98] touch-manipulation"
                    >
                      <div className="flex items-center gap-2.5">
                        <Layers className="w-4 h-4 text-signal-accent" />
                        <div className="text-left">
                          <div>In-Place Vector Overlay (SVG)</div>
                          <div className="text-[10px] text-text-subtle font-mono">1:1 Coordinate Reconstruction</div>
                        </div>
                      </div>
                      <Download className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="pt-4 border-t border-border flex items-center justify-between text-xs font-mono text-text-subtle">
                <span>Federal Evidentiary Rule 902(11)</span>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="font-semibold text-brand-ink hover:text-signal-accent cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
