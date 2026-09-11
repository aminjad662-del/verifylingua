import * as React from "react";
import Link from "next/link";
import {
  Layers,
  Search,
  Filter,
  RefreshCw,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Zap,
} from "lucide-react";
import { ProjectService } from "@/lib/services/project-service";

export default async function AdminJobsQueuePage({
  searchParams,
}: {
  searchParams?: Promise<{ search?: string; status?: string }>;
}) {
  const params = await searchParams;
  const projects = await ProjectService.listProjects(undefined, {
    search: params?.search,
    status: params?.status,
  });

  const activeCount = projects.filter((p) => p.status !== "COMPLETED" && p.status !== "READY" && p.status !== "FAILED").length;
  const completedCount = projects.filter((p) => p.status === "COMPLETED" || p.status === "READY").length;
  const failedCount = projects.filter((p) => p.status === "FAILED").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-2xl bg-surface border border-border">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-brand-500" />
            <h1 className="text-xl font-extrabold tracking-tight text-text">
              Translation Job Queue Telemetry
            </h1>
          </div>
          <p className="text-xs text-text-muted mt-1">
            Real-time operational queue, worker allocation, provider failovers, and reprocess controls.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/jobs"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-surface hover:bg-surface-raised text-xs font-mono font-bold text-text transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-text-muted" />
            <span>Refresh Queue</span>
          </Link>
        </div>
      </div>

      {/* Operational KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono">
        <div className="p-4 rounded-xl bg-surface border border-border">
          <span className="text-[10px] text-text-muted uppercase">Total Jobs</span>
          <p className="text-2xl font-extrabold text-text mt-1">{projects.length}</p>
        </div>
        <div className="p-4 rounded-xl bg-surface border border-border">
          <span className="text-[10px] text-brand-600 uppercase">In Flight</span>
          <p className="text-2xl font-extrabold text-brand-600 mt-1">{activeCount}</p>
        </div>
        <div className="p-4 rounded-xl bg-surface border border-border">
          <span className="text-[10px] text-emerald-600 uppercase">Completed</span>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">{completedCount}</p>
        </div>
        <div className="p-4 rounded-xl bg-surface border border-border">
          <span className="text-[10px] text-rose-600 uppercase">Failed / Blocked</span>
          <p className="text-2xl font-extrabold text-rose-600 mt-1">{failedCount}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-surface border border-border">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-text-muted" />
          <form method="GET">
            <input
              type="text"
              name="search"
              defaultValue={params?.search || ""}
              placeholder="Search queue by Job ID, filename, or language pair..."
              className="w-full pl-9 pr-4 py-1.5 rounded-lg text-xs bg-surface-raised border border-border focus:outline-none focus:border-brand-500 font-mono"
            />
          </form>
        </div>

        <div className="flex items-center gap-2">
          {["ALL", "COMPLETED", "IN_TRANSLATION", "FAILED"].map((st) => {
            const isSelected = (params?.status || "ALL").toUpperCase() === st;
            return (
              <Link
                key={st}
                href={`/admin/jobs?status=${st}${params?.search ? `&search=${params.search}` : ""}`}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors ${
                  isSelected
                    ? "bg-brand-500 text-white font-bold"
                    : "bg-surface-raised text-text-muted hover:text-text"
                }`}
              >
                {st}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Queue Table */}
      <div className="rounded-xl border border-border bg-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-surface-raised/50 font-mono text-[11px] text-text-muted uppercase">
                <th className="py-3 px-4">Job ID</th>
                <th className="py-3 px-4">Source Document</th>
                <th className="py-3 px-4">Pair</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Progress</th>
                <th className="py-3 px-4">Provider</th>
                <th className="py-3 px-4">Fidelity</th>
                <th className="py-3 px-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-mono">
              {projects.map((job) => (
                <tr key={job.id} className="hover:bg-surface-raised/50 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-text">{job.id.slice(0, 14)}...</td>
                  <td className="py-3.5 px-4 font-sans font-bold text-text truncate max-w-xs">
                    <div className="flex items-center gap-2">
                      <span className="uppercase px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-border text-text">
                        {job.format}
                      </span>
                      <span className="truncate">{job.name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 uppercase text-text-muted">
                    {job.sourceLang} → {job.targetLang}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        job.status === "COMPLETED" || job.status === "READY"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : job.status === "FAILED"
                          ? "bg-rose-50 text-rose-700 border border-rose-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {job.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-border overflow-hidden">
                        <div
                          className="h-full bg-brand-500 rounded-full"
                          style={{ width: `${job.progress}%` }}
                        />
                      </div>
                      <span className="text-[11px] text-text-muted">{job.progress}%</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-text-muted">
                    <span className="px-1.5 py-0.5 rounded bg-surface-raised border border-border text-[10px]">
                      Gemini 3.1
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    {job.fidelityScore ? (
                      <span className="font-bold text-emerald-600">{job.fidelityScore}%</span>
                    ) : (
                      <span className="text-text-muted">—</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      href={`/admin/jobs/${job.id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700"
                    >
                      <span>Triage</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
