"use client";

import { useState, useCallback, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "motion/react";

const SUPPORTED_LANGS = [
  { code: "en", label: "English" },
  { code: "es", label: "Spanish" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
  { code: "it", label: "Italian" },
  { code: "pt", label: "Portuguese" },
  { code: "nl", label: "Dutch" },
  { code: "pl", label: "Polish" },
  { code: "ru", label: "Russian" },
  { code: "ar", label: "Arabic" },
  { code: "ja", label: "Japanese" },
  { code: "zh", label: "Chinese" },
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
  } | null;
  /** null = not yet determined; true = full spatial reconstruction; false = text-only fallback */
  layoutPreserved: boolean | null;
  error: string | null;
}

const STATUS_LABELS: Record<JobStatus, string> = {
  idle: "Idle",
  uploading: "Uploading…",
  queued: "Queued",
  extracting: "Extracting Geometry…",
  translating: "Translating…",
  reconstructing: "Reconstructing…",
  ready: "Certified & Ready",
  failed: "Failed",
};

const FORMAT_LABELS: Record<string, string> = {
  pdf: "PDF",
  docx: "DOCX",
  png: "PNG",
  jpg: "JPG",
};

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="w-full h-1.5 bg-ink/10 rounded-full overflow-hidden">
      <motion.div
        className="h-full bg-cta rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      />
    </div>
  );
}

function PulsingDot({ status }: { status: JobStatus }) {
  if (status === "ready") {
    return (
      <span className="inline-flex h-2.5 w-2.5 rounded-full bg-trust" />
    );
  }
  if (status === "failed") {
    return (
      <span className="inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
    );
  }
  return (
    <span className="relative inline-flex h-2.5 w-2.5">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cta opacity-60" />
      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-cta" />
    </span>
  );
}

export default function TranslatePage() {
  const [sourceLang, setSourceLang] = useState("es");
  const [targetLang, setTargetLang] = useState("en");
  const [job, setJob] = useState<JobState | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  const startPolling = (jobId: string) => {
    stopPolling();
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/translate/status/${jobId}`);
        if (!res.ok) return;
        const data = await res.json();

        setJob((prev) =>
          prev
            ? {
                ...prev,
                status: data.status,
                progress: data.progress,
                currentStep: data.currentStep,
                downloadUrl: data.downloadUrl,
                qualityGate: data.qualityGate,
                layoutPreserved: data.layoutPreserved ?? null,
                error: data.error,
              }
            : null
        );

        if (data.status === "ready" || data.status === "failed") {
          stopPolling();
        }
      } catch {
        // ignore transient network errors during polling
      }
    }, 800);
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      stopPolling();
      setJob({
        jobId: "",
        fileName: file.name,
        fileFormat: "",
        status: "uploading",
        progress: 5,
        currentStep: "Uploading document to secure processing vault…",
        downloadUrl: null,
        downloadToken: null,
        qualityGate: null,
        layoutPreserved: null,
        error: null,
      });

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("sourceLang", sourceLang);
        formData.append("targetLang", targetLang);

        const uploadRes = await fetch("/api/translate/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          const err = await uploadRes.json();
          setJob((prev) =>
            prev
              ? {
                  ...prev,
                  status: "failed",
                  error: err.error || "Upload failed.",
                  progress: 0,
                  currentStep: "Upload failed.",
                }
              : null
          );
          return;
        }

        const data = await uploadRes.json();
        setJob({
          jobId: data.jobId,
          fileName: data.fileName,
          fileFormat: data.fileFormat,
          status: data.status,
          progress: data.progress,
          currentStep: data.currentStep,
          downloadUrl: null,
          downloadToken: data.downloadToken,
          qualityGate: null,
          layoutPreserved: null,
          error: null,
        });

        startPolling(data.jobId);
      } catch (err: any) {
        setJob((prev) =>
          prev
            ? {
                ...prev,
                status: "failed",
                error: err.message || "An unexpected error occurred.",
                progress: 0,
                currentStep: "Error.",
              }
            : null
        );
      }
    },
    [sourceLang, targetLang]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
    },
    maxFiles: 1,
    disabled: job?.status === "uploading" || job?.status === "queued" || job?.status === "extracting" || job?.status === "translating" || job?.status === "reconstructing",
  });

  const handleDownload = () => {
    if (!job?.jobId || !job?.downloadToken) return;
    const url = `/api/translate/download/${job.jobId}?token=${job.downloadToken}`;
    const a = document.createElement("a");
    a.href = url;
    a.download = job.fileName.replace(/\.[^/.]+$/, "") + `_translated_${targetLang}.${job.fileFormat}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleReset = () => {
    stopPolling();
    setJob(null);
  };

  const isProcessing = job && !["idle", "ready", "failed"].includes(job.status);

  return (
    <div className="min-h-screen bg-sand">
      {/* Page Header */}
      <div className="border-b border-ink/10 bg-sand/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-ink/40 text-sm font-mono">VL</span>
            <span className="w-px h-4 bg-ink/20" />
            <h1 className="text-sm font-medium text-ink">Document Translation</h1>
          </div>
          <span className="text-xs text-ink/40 font-mono">8 CFR 103.2 Certified</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Hero */}
        <div className="mb-10">
          <h2 className="text-3xl font-serif text-ink mb-2">
            High-Fidelity Document Translation
          </h2>
          <p className="text-ink/60 text-base max-w-2xl">
            Upload a PDF, DOCX, PNG, or JPG. The engine extracts spatial geometry,
            translates with legal-register accuracy, and reconstructs the original
            layout — pixel-perfect, certified output.
          </p>
        </div>

        {/* Language Selectors */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1">
            <label className="block text-xs font-mono text-ink/50 uppercase tracking-widest mb-1.5">
              Source Language
            </label>
            <select
              value={sourceLang}
              onChange={(e) => setSourceLang(e.target.value)}
              disabled={!!isProcessing}
              className="w-full bg-white border border-ink/15 rounded text-sm text-ink px-3 py-2 focus:outline-none focus:ring-1 focus:ring-cta disabled:opacity-50"
            >
              {SUPPORTED_LANGS.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-5">
            <svg
              className="w-5 h-5 text-ink/30"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </div>

          <div className="flex-1">
            <label className="block text-xs font-mono text-ink/50 uppercase tracking-widest mb-1.5">
              Target Language
            </label>
            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              disabled={!!isProcessing}
              className="w-full bg-white border border-ink/15 rounded text-sm text-ink px-3 py-2 focus:outline-none focus:ring-1 focus:ring-cta disabled:opacity-50"
            >
              {SUPPORTED_LANGS.filter((l) => l.code !== sourceLang).map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Drop Zone */}
        <AnimatePresence mode="wait">
          {!job ? (
            <motion.div
              key="dropzone"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <div
                {...getRootProps()}
                className={`
                  relative border-2 border-dashed rounded-lg p-16 text-center cursor-pointer
                  transition-colors duration-150
                  ${isDragActive
                    ? "border-cta bg-cta/5"
                    : "border-ink/15 bg-white hover:border-cta/40 hover:bg-cta/3"
                  }
                `}
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-ink/5 flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-ink/40"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ink">
                      {isDragActive
                        ? "Drop your document here"
                        : "Drop a document or click to browse"}
                    </p>
                    <p className="text-xs text-ink/40 mt-1">
                      PDF · DOCX · PNG · JPG — max 50 MB
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {["PDF", "DOCX", "PNG", "JPG"].map((fmt) => (
                      <span
                        key={fmt}
                        className="text-xs font-mono text-ink/40 border border-ink/10 px-2 py-0.5 rounded"
                      >
                        {fmt}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="job-card"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="bg-white border border-ink/10 rounded-lg overflow-hidden"
            >
              {/* Job Header */}
              <div className="px-6 py-4 border-b border-ink/8 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <PulsingDot status={job.status} />
                  <div>
                    <p className="text-sm font-medium text-ink leading-tight">
                      {job.fileName}
                    </p>
                    <p className="text-xs text-ink/40 font-mono mt-0.5">
                      {job.fileFormat
                        ? `${FORMAT_LABELS[job.fileFormat] || job.fileFormat} · ${sourceLang.toUpperCase()} → ${targetLang.toUpperCase()}`
                        : `${sourceLang.toUpperCase()} → ${targetLang.toUpperCase()}`}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-xs font-mono px-2 py-0.5 rounded ${
                    job.status === "ready"
                      ? "bg-trust/10 text-trust"
                      : job.status === "failed"
                      ? "bg-red-50 text-red-600"
                      : "bg-cta/10 text-cta"
                  }`}
                >
                  {STATUS_LABELS[job.status]}
                </span>
              </div>

              {/* Progress */}
              <div className="px-6 py-4">
                <ProgressBar value={job.progress} />
                <p className="text-xs text-ink/50 mt-2">{job.currentStep}</p>
              </div>

              {/* Quality Gate Notes */}
              {job.qualityGate && job.status === "ready" && (
                <div className="px-6 pb-4">
                  <p className="text-xs font-mono text-ink/40 uppercase tracking-wider mb-2">
                    Quality Gate — Passed
                  </p>
                  <ul className="space-y-1">
                    {job.qualityGate.notes.map((note, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <svg
                          className="w-3.5 h-3.5 text-trust flex-shrink-0 mt-0.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span className="text-xs text-ink/60">{note}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-ink/30 font-mono mt-3">
                    {job.qualityGate.byteSize.toLocaleString()} bytes ·{" "}
                    {new Date(job.qualityGate.verifiedAt).toLocaleTimeString()}
                  </p>
                </div>
              )}

              {/* Layout Fallback Warning — shown when layout_preserved: false */}
              {job.status === "ready" && job.layoutPreserved === false && (
                <div className="px-6 pb-4">
                  <div className="bg-amber-50 border border-amber-200 rounded p-3 flex gap-3">
                    <svg className="w-4 h-4 text-cta flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.27 16.5C2.5 18.333 3.462 20 5.002 20z" />
                    </svg>
                    <div>
                      <p className="text-xs font-medium text-cta">Layout Fallback Applied</p>
                      <p className="text-xs text-amber-700 mt-0.5">
                        Spatial reconstruction could not be completed for this document.
                        A text-only PDF has been generated (<code className="font-mono">layout_preserved: false</code>).
                        Contact <span className="font-medium">support@verifylingua.com</span> for a manual layout-preserving translation.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Error */}
              {job.status === "failed" && job.error && (
                <div className="px-6 pb-4">
                  <div className="bg-red-50 border border-red-100 rounded p-3">
                    <p className="text-xs text-red-600">{job.error}</p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="px-6 py-4 border-t border-ink/8 flex gap-3">
                {job.status === "ready" && (
                  <button
                    onClick={handleDownload}
                    className="flex-1 bg-cta hover:bg-cta-hover active:bg-cta-active text-white text-sm font-medium py-2.5 rounded transition-colors duration-100 flex items-center justify-center gap-2"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    Download Certified Translation
                  </button>
                )}
                <button
                  onClick={handleReset}
                  disabled={!!isProcessing}
                  className="px-4 py-2.5 border border-ink/15 text-ink/60 text-sm rounded hover:bg-ink/5 transition-colors duration-100 disabled:opacity-40"
                >
                  {job.status === "ready" || job.status === "failed"
                    ? "Translate Another"
                    : "Cancel"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* How it works — shown only before job starts */}
        {!job && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-12 grid grid-cols-3 gap-6"
          >
            {[
              {
                step: "01",
                title: "Spatial Extraction",
                desc: "Every text element is extracted with its exact X, Y, Width, and Height bounding box from the source document.",
              },
              {
                step: "02",
                title: "Neural Translation",
                desc: "DeepL neural engine translates with legal-register accuracy. Gemini LLM provides contextual fallback with glossary enforcement.",
              },
              {
                step: "03",
                title: "Layout Reconstruction",
                desc: "Translated text is injected back at original coordinates. Dynamic font scaling prevents overflow. Output is certified 8 CFR 103.2.",
              },
            ].map((item) => (
              <div key={item.step} className="p-5 bg-white border border-ink/8 rounded-lg">
                <span className="text-xs font-mono text-ink/30">{item.step}</span>
                <h3 className="text-sm font-medium text-ink mt-2 mb-1.5">{item.title}</h3>
                <p className="text-xs text-ink/50 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </motion.div>
        )}

        {/* Compliance Footer */}
        <div className="mt-12 pt-6 border-t border-ink/8 flex items-center justify-between">
          <p className="text-xs text-ink/30">
            VerifyLingua · ATA Member No. 278190 · 8 CFR 103.2 Compliant
          </p>
          <p className="text-xs text-ink/30 font-mono">
            Files auto-purged after 24 hours
          </p>
        </div>
      </div>
    </div>
  );
}
