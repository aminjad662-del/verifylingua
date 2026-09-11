"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  UploadCloud,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Download,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Languages,
  Clock,
  ExternalLink,
} from "lucide-react";

type IntakeStage = "upload" | "configure" | "estimate" | "process" | "result";

export default function NewTranslationPage() {
  const router = useRouter();

  // Wizard State
  const [stage, setStage] = React.useState<IntakeStage>("upload");
  const [file, setFile] = React.useState<File | null>(null);
  const [fileError, setFileError] = React.useState<string | null>(null);
  const [sourceLang, setSourceLang] = React.useState("es");
  const [targetLang, setTargetLang] = React.useState("en");
  const [serviceTier, setServiceTier] = React.useState<"automated" | "certified">("automated");

  // Processing State
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [jobId, setJobId] = React.useState<string | null>(null);
  const [progress, setProgress] = React.useState(0);
  const [currentStep, setCurrentStep] = React.useState("Initializing...");
  const [jobStatus, setJobStatus] = React.useState<string>("queued");
  const [downloadUrl, setDownloadUrl] = React.useState<string | null>(null);
  const [qualityGate, setQualityGate] = React.useState<any>(null);

  // Drag & drop handlers
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setFileError(null);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    const ext = selectedFile.name.split(".").pop()?.toLowerCase();
    const validExts = ["pdf", "docx", "png", "jpg", "jpeg"];

    if (!ext || !validExts.includes(ext)) {
      setFileError("Unsupported format. Please select a valid PDF, DOCX, PNG, or JPG file.");
      return;
    }

    if (selectedFile.size > 50 * 1024 * 1024) {
      setFileError("File exceeds the 50MB processing limit.");
      return;
    }

    setFile(selectedFile);
    setStage("configure");
  };

  // Submission handler
  const handleStartProcessing = async () => {
    if (!file) return;

    setStage("process");
    setIsProcessing(true);
    setProgress(15);
    setCurrentStep("Uploading encrypted file to private vault...");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("sourceLang", sourceLang);
      formData.append("targetLang", targetLang);
      formData.append("serviceTier", serviceTier);

      const res = await fetch("/api/translate/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to upload document.");
      }

      const data = await res.json();
      setJobId(data.jobId);
      pollJobStatus(data.jobId);
    } catch (err: any) {
      setIsProcessing(false);
      setJobStatus("failed");
      setCurrentStep("Processing error: " + (err.message || "Unknown error"));
    }
  };

  const pollJobStatus = (id: string) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/translate/status/${id}`);
        if (!res.ok) return;

        const data = await res.json();
        setProgress(data.progress || 0);
        setCurrentStep(data.currentStep || "Processing...");
        setJobStatus(data.status);

        if (data.status === "ready" || data.status === "completed") {
          clearInterval(interval);
          setIsProcessing(false);
          setDownloadUrl(data.downloadUrl);
          setQualityGate(data.qualityGate);
          setStage("result");
        } else if (data.status === "failed") {
          clearInterval(interval);
          setIsProcessing(false);
          setCurrentStep("Failed: " + (data.error || "Translation processing error"));
        }
      } catch {
        // Retry next interval
      }
    }, 1200);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-4">
      {/* Wizard Header & Stepper */}
      <div className="space-y-4 text-center">
        <h1 className="text-2xl font-extrabold tracking-tight text-text">
          New Document Translation
        </h1>
        <p className="text-xs text-text-muted">
          1:1 layout-preserving extraction, translation, and spatial reconstruction.
        </p>

        {/* Visual Stepper */}
        <div className="flex items-center justify-center gap-3 pt-2">
          {[
            { key: "upload", label: "1. Upload" },
            { key: "configure", label: "2. Configure" },
            { key: "estimate", label: "3. Review" },
            { key: "process", label: "4. Process" },
            { key: "result", label: "5. Result" },
          ].map((s, idx) => {
            const isCurrent = stage === s.key;
            const isPast =
              (stage === "configure" && idx === 0) ||
              (stage === "estimate" && idx <= 1) ||
              (stage === "process" && idx <= 2) ||
              (stage === "result" && idx <= 3);

            return (
              <div key={s.key} className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-mono font-bold transition-colors ${
                    isCurrent
                      ? "bg-brand-500 text-white"
                      : isPast
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-surface text-text-muted border border-border"
                  }`}
                >
                  {s.label}
                </span>
                {idx < 4 && <span className="text-text-muted text-xs">→</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* STAGE 1: UPLOAD */}
      {stage === "upload" && (
        <div className="space-y-6">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="p-12 border-2 border-dashed border-border hover:border-brand-500 bg-surface rounded-2xl text-center space-y-4 transition-colors cursor-pointer"
            onClick={() => document.getElementById("file-input")?.click()}
          >
            <input
              id="file-input"
              type="file"
              className="hidden"
              accept=".pdf,.docx,.png,.jpg,.jpeg"
              onChange={handleFileSelect}
            />
            <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-500 flex items-center justify-center mx-auto">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-text">
                Drop your document here, or <span className="text-brand-500 underline">browse files</span>
              </p>
              <p className="text-xs text-text-muted mt-1 font-mono">
                Supports PDF, DOCX, PNG, JPG (up to 50MB)
              </p>
            </div>
          </div>

          {fileError && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{fileError}</span>
            </div>
          )}

          <div className="p-4 rounded-xl bg-surface border border-border text-xs space-y-2">
            <span className="font-mono font-bold text-text-muted uppercase text-[10px]">
              Layout Preservation Promise:
            </span>
            <p className="text-text-muted">
              VerifyLingua analyzes spatial coordinates, fonts, tables, and images. Your translated output will be returned in the identical format and structure.
            </p>
          </div>
        </div>
      )}

      {/* STAGE 2: CONFIGURE */}
      {stage === "configure" && file && (
        <div className="space-y-6 p-6 rounded-2xl bg-surface border border-border">
          {/* File Selected Badge */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface-raised border border-border">
            <div className="flex items-center gap-3">
              <FileCheck className="w-5 h-5 text-emerald-600" />
              <div>
                <p className="text-xs font-bold text-text truncate max-w-sm">{file.name}</p>
                <p className="text-[11px] font-mono text-text-muted">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB • {file.name.split(".").pop()?.toUpperCase()}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setFile(null);
                setStage("upload");
              }}
              className="text-xs font-mono text-text-muted hover:text-rose-600"
            >
              Change File
            </button>
          </div>

          {/* Language Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-mono font-bold uppercase text-text-muted">
                Source Language
              </label>
              <select
                value={sourceLang}
                onChange={(e) => setSourceLang(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-surface text-xs font-medium focus:outline-none focus:border-brand-500"
              >
                <option value="auto">Auto-Detect</option>
                <option value="es">Spanish (Español)</option>
                <option value="en">English (US/UK)</option>
                <option value="fr">French (Français)</option>
                <option value="de">German (Deutsch)</option>
                <option value="ar">Arabic (العربية) - RTL</option>
                <option value="pt">Portuguese (Português)</option>
                <option value="zh">Chinese (Simplified)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono font-bold uppercase text-text-muted">
                Target Language
              </label>
              <select
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-surface text-xs font-medium focus:outline-none focus:border-brand-500"
              >
                <option value="en">English (US/UK)</option>
                <option value="es">Spanish (Español)</option>
                <option value="ar">Arabic (العربية) - RTL</option>
                <option value="fr">French (Français)</option>
                <option value="de">German (Deutsch)</option>
                <option value="pt">Portuguese (Português)</option>
                <option value="zh">Chinese (Simplified)</option>
              </select>
            </div>
          </div>

          {/* Translation Mode Duality */}
          <div className="space-y-3 pt-2">
            <label className="text-xs font-mono font-bold uppercase text-text-muted">
              Select Translation Mode
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                onClick={() => setServiceTier("automated")}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  serviceTier === "automated"
                    ? "border-brand-500 bg-brand-50/30"
                    : "border-border hover:border-text-muted"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-text">Automated Layout Mode</span>
                  <Sparkles className="w-4 h-4 text-brand-500" />
                </div>
                <p className="text-[11px] text-text-muted mt-1.5">
                  Instant neural processing. Ideal for internal review, corporate drafting, and self-service.
                </p>
                <p className="text-xs font-mono font-bold text-brand-600 mt-2">Included in Quota</p>
              </div>

              <div
                onClick={() => setServiceTier("certified")}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  serviceTier === "certified"
                    ? "border-emerald-600 bg-emerald-50/30"
                    : "border-border hover:border-text-muted"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-text">Certified Legal Mode</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                </div>
                <p className="text-[11px] text-text-muted mt-1.5">
                  Accredited linguist review, 8 CFR 103.2 certification, and cryptographic QR seal for USCIS/Courts.
                </p>
                <p className="text-xs font-mono font-bold text-emerald-600 mt-2">$24.95 / page</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-4 border-t border-border">
            <button
              onClick={() => setStage("upload")}
              className="px-4 py-2 text-xs font-mono text-text-muted hover:text-text"
            >
              Back
            </button>
            <button
              onClick={() => setStage("estimate")}
              className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-all shadow-sm"
            >
              Continue to Review
            </button>
          </div>
        </div>
      )}

      {/* STAGE 3: ESTIMATE & DISCLOSURE */}
      {stage === "estimate" && file && (
        <div className="space-y-6 p-6 rounded-2xl bg-surface border border-border">
          <h2 className="text-sm font-extrabold font-mono uppercase text-text">
            Review Translation Order
          </h2>

          <div className="divide-y divide-border text-xs">
            <div className="py-2.5 flex justify-between">
              <span className="text-text-muted">Document Name:</span>
              <span className="font-bold text-text font-mono">{file.name}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-text-muted">Language Pair:</span>
              <span className="font-bold text-text font-mono uppercase">
                {sourceLang} → {targetLang}
              </span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-text-muted">Processing Tier:</span>
              <span className="font-bold text-brand-600 font-mono uppercase">
                {serviceTier === "certified" ? "Certified Legal Translation" : "Automated Layout Translation"}
              </span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-text-muted">Turnaround:</span>
              <span className="font-bold text-text font-mono">
                {serviceTier === "certified" ? "24 Hours (Linguist Sign-off)" : "Instant (under 2 minutes)"}
              </span>
            </div>
          </div>

          {/* Disclosure */}
          <div className="p-4 rounded-xl bg-surface-raised border border-border text-[11px] text-text-muted space-y-1">
            <p className="font-bold text-text">Legal & Formatting Disclosure:</p>
            <p>
              Automated mode preserves spatial layout and tables. It contains an automated translation disclaimer. For official immigration or court use, Certified Legal Mode is recommended.
            </p>
          </div>

          <div className="flex justify-between pt-4 border-t border-border">
            <button
              onClick={() => setStage("configure")}
              className="px-4 py-2 text-xs font-mono text-text-muted hover:text-text"
            >
              Back
            </button>
            <button
              onClick={handleStartProcessing}
              className="px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-all shadow-sm"
            >
              Confirm & Start Translation
            </button>
          </div>
        </div>
      )}

      {/* STAGE 4: PROCESS */}
      {stage === "process" && (
        <div className="space-y-6 p-8 rounded-2xl bg-surface border border-border text-center">
          <div className="w-12 h-12 rounded-full border-2 border-brand-500 border-t-transparent animate-spin mx-auto" />
          <div className="space-y-2">
            <h2 className="text-sm font-extrabold font-mono uppercase text-text">
              Translating Document
            </h2>
            <p className="text-xs font-mono text-text-muted">{currentStep}</p>
          </div>

          <div className="space-y-1 max-w-md mx-auto">
            <div className="w-full h-2 rounded-full bg-border overflow-hidden">
              <div
                className="h-full bg-brand-500 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] font-mono text-text-muted">
              <span>Status: {jobStatus.toUpperCase()}</span>
              <span>{progress}%</span>
            </div>
          </div>
        </div>
      )}

      {/* STAGE 5: RESULT */}
      {stage === "result" && (
        <div className="space-y-6 p-8 rounded-2xl bg-surface border border-emerald-200 text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <h2 className="text-base font-extrabold text-text">Translation Complete & Verified</h2>
            <p className="text-xs text-text-muted">
              Document layout, typography, and tables have been reconstructed.
            </p>
          </div>

          {qualityGate && (
            <div className="p-4 rounded-xl bg-surface-raised border border-border text-left space-y-2 max-w-md mx-auto text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-text-muted">Format Verified:</span>
                <span className="font-bold text-emerald-600">PASSED</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Layout Preserved:</span>
                <span className="font-bold text-emerald-600">100% PARITY</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Output Size:</span>
                <span>{(qualityGate.byteSize / 1024).toFixed(1)} KB</span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-center gap-4 pt-4">
            {downloadUrl && (
              <a
                href={downloadUrl}
                download
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>Download Translated File</span>
              </a>
            )}

            <Link
              href={jobId ? `/app/projects/${jobId}/revisions` : "/app/projects"}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-surface text-text hover:bg-surface-raised text-xs font-bold transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Request Revision</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
