"use client";

import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
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
  ExternalLink,
  Layers,
  FileCheck,
  Maximize2
} from "lucide-react";

const SPRING_MICRO = { type: "spring", stiffness: 400, damping: 30 } as const;

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

interface ResultViewerProps {
  jobId: string;
  sourceFilename?: string;
  sourceFormat?: string;
  sourceLanguage?: string;
  targetLanguage?: string;
  pageCount?: number;
  downloadUrl?: string;
  previewUrl?: string;
  onReset?: () => void;
  onUpgradeToCertified?: () => void;
}

export function ResultViewer({
  jobId,
  sourceFilename = "document.pdf",
  sourceFormat = "pdf",
  sourceLanguage = "en",
  targetLanguage = "es",
  pageCount = 1,
  downloadUrl = "",
  previewUrl = "",
  onReset,
  onUpgradeToCertified,
}: ResultViewerProps) {
  const [selectedPage, setSelectedPage] = useState<number>(1);
  const [qaReport, setQaReport] = useState<QAReportData | null>(null);
  const [segments, setSegments] = useState<DocumentSegment[]>([]);
  const [loadingQA, setLoadingQA] = useState<boolean>(true);
  const [loadingSegments, setLoadingSegments] = useState<boolean>(false);
  
  // Segment Editing State
  const [editingSegId, setEditingSegId] = useState<string | null>(null);
  const [editText, setEditText] = useState<string>("");
  const [savingSegment, setSavingSegment] = useState<boolean>(false);
  const [rerenderingPage, setRerenderingPage] = useState<boolean>(false);
  const [previewTimestamp, setPreviewTimestamp] = useState<number>(Date.now());
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

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

  const currentPageQA = qaReport?.pages?.find((p) => p.page_number === selectedPage);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Top Header & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-zinc-200/90 rounded-2xl p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 border border-zinc-200">
              {(sourceFormat || "pdf").toUpperCase()}
            </span>
            <h2 className="text-base font-bold text-zinc-950 truncate max-w-md">
              {sourceFilename || "document.pdf"}
            </h2>
            <span className="text-xs font-mono text-zinc-400">
              ({(sourceLanguage || "en").toUpperCase()} → {(targetLanguage || "es").toUpperCase()})
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Automated document processing complete • {pageCount} {pageCount === 1 ? "page" : "pages"} processed
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {onUpgradeToCertified && (
            <button
              onClick={onUpgradeToCertified}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-amber-300 bg-amber-50/70 hover:bg-amber-100/70 text-amber-900 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Upgrade to Certified</span>
            </button>
          )}

          <a
            href={downloadUrl}
            download
            className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-900 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download ({(sourceFormat || "pdf").toUpperCase()})</span>
          </a>
        </div>
      </div>

      {/* Per-Page Thumbnail & Status Strip */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-medium">
              Document Pages ({pageCount})
            </span>
            {qaReport && qaReport.overall_status && (
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                qaReport.overall_status === "ready"
                  ? "bg-emerald-100 text-emerald-800"
                  : qaReport.overall_status === "ready_with_warnings"
                  ? "bg-amber-100 text-amber-800"
                  : "bg-rose-100 text-rose-800"
              }`}>
                QA: {(qaReport.overall_status || "verified").replace(/_/g, " ")}
              </span>
            )}
          </div>
          <span className="text-xs font-mono text-zinc-400">
            Page {selectedPage} of {pageCount}
          </span>
        </div>

        {/* Page Thumbnail Strip */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
          {Array.from({ length: pageCount }, (_, i) => i + 1).map((pNum) => {
            const pageQA = qaReport?.pages?.find((p) => p.page_number === pNum);
            const isSelected = selectedPage === pNum;
            const status = pageQA?.status || "qa_passed";

            return (
              <button
                key={pNum}
                onClick={() => setSelectedPage(pNum)}
                className={`relative shrink-0 flex flex-col items-center justify-center w-20 h-28 rounded-xl border transition-all text-xs font-mono cursor-pointer ${
                  isSelected
                    ? "border-zinc-950 bg-zinc-50 ring-2 ring-zinc-950/10 shadow-xs"
                    : "border-zinc-200 bg-white hover:border-zinc-400 hover:bg-zinc-50/50"
                }`}
              >
                <span className="text-xs font-bold text-zinc-800">P. {pNum}</span>
                <span className="text-[10px] text-zinc-400 mt-1">
                  {status === "qa_passed" ? "100% OK" : status === "qa_warning" ? "Notice" : "Alert"}
                </span>

                {/* Status Dot */}
                <div
                  className={`absolute top-2 right-2 w-2.5 h-2.5 rounded-full ${
                    status === "qa_passed"
                      ? "bg-emerald-500"
                      : status === "qa_warning"
                      ? "bg-amber-500"
                      : "bg-rose-500"
                  }`}
                  title={`Status: ${status}`}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Workspace: Side-by-Side Preview (Left) & Segment Editor (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: High-Resolution Page Preview (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-xs">
            {/* Preview Header */}
            <div className="p-3.5 border-b border-zinc-100 flex items-center justify-between text-xs font-mono bg-zinc-50/50">
              <span className="text-zinc-600 font-medium">
                Rendered Preview • Page {selectedPage} (150 DPI)
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={selectedPage <= 1}
                  onClick={() => setSelectedPage((p) => Math.max(1, p - 1))}
                  className="p-1 rounded hover:bg-zinc-200 disabled:opacity-30 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4 text-zinc-700" />
                </button>
                <span className="text-zinc-500">
                  {selectedPage} / {pageCount}
                </span>
                <button
                  disabled={selectedPage >= pageCount}
                  onClick={() => setSelectedPage((p) => Math.min(pageCount, p + 1))}
                  className="p-1 rounded hover:bg-zinc-200 disabled:opacity-30 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4 text-zinc-700" />
                </button>
              </div>
            </div>

            {/* Document Image Surface */}
            <div className="relative min-h-[500px] flex items-center justify-center p-6 bg-zinc-100/70">
              {rerenderingPage && (
                <div className="absolute inset-0 bg-white/70 backdrop-blur-2xs flex flex-col items-center justify-center gap-3 z-10">
                  <RefreshCw className="w-6 h-6 text-zinc-950 animate-spin" />
                  <p className="text-xs font-mono font-medium text-zinc-900">
                    Re-rendering Page {selectedPage} with HarfBuzz shaping…
                  </p>
                </div>
              )}

              {/* Page Preview Image */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/jobs/${jobId}/preview?page=${selectedPage}&t=${previewTimestamp}`}
                alt={`Page ${selectedPage} preview`}
                className="max-h-[640px] w-auto object-contain rounded-lg shadow-md border border-zinc-200/80 bg-white"
              />
            </div>

            {/* Per-Page Quality Assurance Checks Banner */}
            {currentPageQA && (
              <div className="p-4 bg-zinc-50 border-t border-zinc-100 text-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-zinc-500 uppercase tracking-wider font-semibold">
                    Page {selectedPage} S9 Verification Matrix
                  </span>
                  <span className="font-mono text-zinc-400">
                    Non-text SSIM: {currentPageQA.non_text_ssim}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
                  <div className="bg-white p-2 rounded border border-zinc-200 flex items-center gap-1.5">
                    {currentPageQA.completeness ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    )}
                    <span>Completeness</span>
                  </div>

                  <div className="bg-white p-2 rounded border border-zinc-200 flex items-center gap-1.5">
                    {currentPageQA.glyph_integrity ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    )}
                    <span>Glyph / BiDi</span>
                  </div>

                  <div className="bg-white p-2 rounded border border-zinc-200 flex items-center gap-1.5">
                    {currentPageQA.structure_valid ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    )}
                    <span>Structure</span>
                  </div>

                  <div className="bg-white p-2 rounded border border-zinc-200 flex items-center gap-1.5">
                    {currentPageQA.protected_tokens_preserved ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    )}
                    <span>Tokens</span>
                  </div>
                </div>

                {/* Per-Page Warnings (Honest Transparency) */}
                {currentPageQA.warnings && currentPageQA.warnings.length > 0 && (
                  <div className="mt-3 p-3 rounded-lg border border-amber-200 bg-amber-50/70 text-amber-900">
                    <div className="flex items-center gap-1.5 font-semibold text-xs mb-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      <span>Transparent QA Notices for Page {selectedPage}:</span>
                    </div>
                    <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-800">
                      {currentPageQA.warnings.map((w, idx) => (
                        <li key={idx}>{w}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Interactive Segment Editor (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs flex flex-col h-[740px]">
            {/* Editor Header */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 shrink-0">
              <div>
                <h3 className="text-sm font-bold text-zinc-950 flex items-center gap-1.5">
                  <Edit3 className="w-4 h-4 text-zinc-600" />
                  <span>Segment Editor</span>
                </h3>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  Click any sentence to edit. Changes re-render only this page in seconds.
                </p>
              </div>

              <button
                onClick={handleRerenderPage}
                disabled={rerenderingPage}
                className="px-3 py-1.5 rounded-lg border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-900 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-40 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${rerenderingPage ? "animate-spin" : ""}`} />
                <span>Re-render</span>
              </button>
            </div>

            {/* Notification Alert Banner */}
            {statusMessage && (
              <div
                className={`mt-3 p-2.5 rounded-xl border text-xs flex items-center justify-between shrink-0 ${
                  statusMessage.type === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                    : "border-rose-200 bg-rose-50 text-rose-900"
                }`}
              >
                <span>{statusMessage.text}</span>
                <button
                  onClick={() => setStatusMessage(null)}
                  className="text-xs text-zinc-400 hover:text-zinc-600"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Segments List (Scrollable) */}
            <div className="flex-1 overflow-y-auto pt-3 space-y-3 pr-1 scrollbar-thin">
              {loadingSegments ? (
                <div className="h-full flex items-center justify-center text-xs font-mono text-zinc-400">
                  Loading page {selectedPage} segments…
                </div>
              ) : segments.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-400">
                  <Layers className="w-8 h-8 text-zinc-300 mb-2" />
                  <p className="text-xs">No extractable text segments on this page.</p>
                </div>
              ) : (
                segments.map((seg, idx) => {
                  const isEditing = editingSegId === seg.id;

                  return (
                    <div
                      key={seg.id || idx}
                      className={`p-3 rounded-xl border transition-all text-xs ${
                        isEditing
                          ? "border-zinc-950 bg-zinc-50/80 shadow-xs ring-1 ring-zinc-950"
                          : "border-zinc-200/90 bg-white hover:border-zinc-300"
                      }`}
                    >
                      {/* Segment Source Text */}
                      <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                        <span>Segment #{idx + 1}</span>
                        {seg.status === "reviewed" && (
                          <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 font-semibold">
                            Edited
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-500 mb-2 leading-relaxed italic">
                        &quot;{seg.source_text}&quot;
                      </p>

                      {/* Translated / Editable Text */}
                      {isEditing ? (
                        <div className="space-y-2 mt-2">
                          <textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            rows={3}
                            className="w-full text-xs font-medium text-zinc-950 bg-white border border-zinc-300 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-zinc-950 font-sans"
                          />
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setEditingSegId(null)}
                              className="px-2.5 py-1 text-[11px] font-medium text-zinc-600 hover:text-zinc-900"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSaveSegment(seg.id)}
                              disabled={savingSegment}
                              className="px-3 py-1 rounded bg-zinc-950 hover:bg-zinc-900 text-white text-[11px] font-semibold flex items-center gap-1 shadow-2xs"
                            >
                              <Save className="w-3 h-3" />
                              <span>{savingSegment ? "Saving…" : "Save"}</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div
                          onClick={() => {
                            setEditingSegId(seg.id);
                            setEditText(seg.translated_text);
                          }}
                          className="group cursor-pointer rounded p-1.5 -mx-1.5 hover:bg-zinc-50 transition-colors"
                        >
                          <p className="text-xs font-semibold text-zinc-950 leading-relaxed">
                            {seg.translated_text}
                          </p>
                          <span className="text-[10px] text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 mt-1 font-mono">
                            <Edit3 className="w-3 h-3" /> Click to edit
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Editor Footer Advice */}
            <div className="pt-3 border-t border-zinc-100 shrink-0">
              <button
                onClick={handleRerenderPage}
                disabled={rerenderingPage}
                className="w-full py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-900 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${rerenderingPage ? "animate-spin" : ""}`} />
                <span>Save All & Re-render Page {selectedPage}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
