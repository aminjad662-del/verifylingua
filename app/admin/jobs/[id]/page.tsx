import * as React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Layers,
  ShieldAlert,
  Sliders,
  Terminal,
  FileCode,
} from "lucide-react";
import { ProjectService } from "@/lib/services/project-service";

export default async function AdminJobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const job = await ProjectService.getProjectById(id);

  if (!job) {
    notFound();
  }

  const sampleSegments = [
    { idx: 1, src: "CERTIFICADO DE NACIMIENTO", tgt: "OFFICIAL BIRTH CERTIFICATE", bbox: "[120, 750, 360, 24]", confidence: 99.4 },
    { idx: 2, src: "Nombre del Inscrito: Alejandro Hernandez Garcia", tgt: "Name of Registrant: Alejandro Hernandez Garcia", bbox: "[120, 710, 480, 18]", confidence: 100.0 },
    { idx: 3, src: "Fecha de Nacimiento: 14 de Mayo de 1994", tgt: "Date of Birth: May 14, 1994", bbox: "[120, 680, 320, 18]", confidence: 98.9 },
    { idx: 4, src: "Lugar de Registro: Notaría Segunda de Medellín", tgt: "Place of Registry: Second Notary of Medellin", bbox: "[120, 650, 410, 18]", confidence: 99.2 },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back Link */}
      <Link
        href="/admin/jobs"
        className="inline-flex items-center gap-1.5 text-xs font-mono text-text-muted hover:text-text"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Queue</span>
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-2xl bg-surface border border-border">
        <div>
          <div className="flex items-center gap-2 font-mono">
            <span className="uppercase px-2 py-0.5 rounded text-[10px] font-bold bg-border text-text">
              {job.format}
            </span>
            <h1 className="text-lg font-extrabold text-text tracking-tight font-mono">{job.id}</h1>
          </div>
          <p className="text-xs text-text-muted mt-1 font-sans">
            File: <span className="font-bold text-text">{job.name}</span> • Pair: <span className="uppercase font-mono">{job.sourceLang} → {job.targetLang}</span>
          </p>
        </div>

        {/* Operational Control Triggers */}
        <div className="flex items-center gap-2.5">
          <button
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-surface hover:bg-surface-raised text-xs font-mono font-bold text-text transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-brand-500" />
            <span>Reprocess Job</span>
          </button>
          <button
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-mono font-bold transition-colors shadow-sm"
          >
            <span>Assign Reviewer</span>
          </button>
        </div>
      </div>

      {/* Pipeline Diagnostics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 font-mono text-xs">
        <div className="p-4 rounded-xl bg-surface border border-border">
          <span className="text-text-muted text-[10px] uppercase">Job Status</span>
          <p className="font-bold text-brand-600 uppercase mt-1">{job.status}</p>
        </div>
        <div className="p-4 rounded-xl bg-surface border border-border">
          <span className="text-text-muted text-[10px] uppercase">Primary Provider</span>
          <p className="font-bold text-text mt-1">Gemini 3.1 Pro</p>
        </div>
        <div className="p-4 rounded-xl bg-surface border border-border">
          <span className="text-text-muted text-[10px] uppercase">Failover Fallback</span>
          <p className="font-bold text-emerald-600 mt-1">DeepL API Ready</p>
        </div>
        <div className="p-4 rounded-xl bg-surface border border-border">
          <span className="text-text-muted text-[10px] uppercase">Fidelity Parity</span>
          <p className="font-bold text-emerald-600 mt-1">{job.fidelityScore ? `${job.fidelityScore}%` : "100%"}</p>
        </div>
      </div>

      {/* Extracted Layout Graph & Translated Segments */}
      <div className="p-6 rounded-2xl bg-surface border border-border space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-brand-500" />
            <h2 className="text-xs font-mono font-extrabold uppercase tracking-wider text-text">
              Extracted Layout Graph & Translated Run Segments
            </h2>
          </div>
          <span className="text-[10px] font-mono text-text-muted">
            {sampleSegments.length} Segments Audited
          </span>
        </div>

        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b border-border bg-surface-raised/50 text-[10px] text-text-muted uppercase">
                <th className="py-2.5 px-3">#</th>
                <th className="py-2.5 px-3">Source Run</th>
                <th className="py-2.5 px-3">Target Reconstructed Run</th>
                <th className="py-2.5 px-3">Bounding Box [x, y, w, h]</th>
                <th className="py-2.5 px-3 text-right">Confidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sampleSegments.map((seg) => (
                <tr key={seg.idx} className="hover:bg-surface-raised/50 transition-colors">
                  <td className="py-3 px-3 text-text-muted">{seg.idx}</td>
                  <td className="py-3 px-3 font-sans text-text font-medium">{seg.src}</td>
                  <td className="py-3 px-3 font-sans text-brand-600 font-bold">{seg.tgt}</td>
                  <td className="py-3 px-3 text-text-muted text-[11px]">{seg.bbox}</td>
                  <td className="py-3 px-3 text-right font-bold text-emerald-600">{seg.confidence}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Low-Level Worker Terminal Log */}
      <div className="p-6 rounded-2xl bg-brand-ink text-white font-mono text-xs space-y-3 shadow-sm">
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <div className="flex items-center gap-2 text-[11px] text-zinc-400">
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span>Worker Execution Audit Log</span>
          </div>
          <span className="text-[10px] text-emerald-400">STATUS: ZERO DRIFT</span>
        </div>

        <div className="space-y-1 text-[11px] text-zinc-300">
          <p>[0.00s] [INGESTION] Multi-part buffer ingested (SHA-256 verified).</p>
          <p>[0.12s] [CLASSIFY] Magic bytes match %PDF-1.7. Page count = 2.</p>
          <p>[0.45s] [EXTRACT] pdf-lib text layer parsed: 42 vector text runs, 1 table grid detected.</p>
          <p>[1.20s] [TRANSLATE] Gemini 3.1 Pro contextual inference completed. Status: 200 OK.</p>
          <p>[1.85s] [RECONSTRUCT] Dynamic font scaling applied. Table cell geometry preserved (0pt drift).</p>
          <p>[2.10s] [QA_GATE] Programmatic checksum match verified. Output file size = 482.1 KB.</p>
        </div>
      </div>
    </div>
  );
}
