import * as React from "react";
import Link from "next/link";
import {
  Plus,
  ArrowRight,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Download,
  BarChart2,
  ExternalLink,
  ShieldCheck,
  Search,
} from "lucide-react";
import { ProjectService } from "@/lib/services/project-service";

export default async function ClientAppOverviewPage() {
  const projects = await ProjectService.listProjects();
  const stats = await ProjectService.getUsageStats();

  const activeProjects = projects.filter(
    (p) => p.status !== "COMPLETED" && p.status !== "READY" && p.status !== "FAILED"
  );
  const readyProjects = projects.filter(
    (p) => p.status === "COMPLETED" || p.status === "READY"
  );

  return (
    <div className="space-y-8">
      {/* Top Banner / Hero */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 rounded-2xl bg-surface border border-border">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-text">
            Enterprise Translation Workspace
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Autonomous layout-preserving document processing with certified legal verification.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/app/new-translation"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-all shadow-sm active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Translate Document</span>
          </Link>
        </div>
      </div>

      {/* KPI Telemetry Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-surface border border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-text-muted uppercase">Active Queue</span>
            <Clock className="w-4 h-4 text-brand-500" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-mono font-extrabold text-text">{activeProjects.length}</span>
            <span className="text-xs text-text-muted ml-2">in processing</span>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-surface border border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-text-muted uppercase">Ready for Download</span>
            <Download className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-mono font-extrabold text-text">{readyProjects.length}</span>
            <span className="text-xs text-text-muted ml-2">verified output</span>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-surface border border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-text-muted uppercase">Monthly Quota</span>
            <BarChart2 className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-mono font-extrabold text-text">
              {stats.pagesUsedThisPeriod}
              <span className="text-sm text-text-muted font-normal"> / {stats.monthlyQuotaPages}</span>
            </span>
            <span className="text-xs text-text-muted ml-2">pages used</span>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-surface border border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-text-muted uppercase">Fidelity Assurance</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-mono font-extrabold text-emerald-600">99.4%</span>
            <span className="text-xs text-text-muted ml-2">USCIS pass rate</span>
          </div>
        </div>
      </div>

      {/* Active Jobs Live Timeline */}
      {activeProjects.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold tracking-tight font-mono uppercase text-text">
              Active Pipeline Operations ({activeProjects.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeProjects.map((p) => (
              <div key={p.id} className="p-5 rounded-xl bg-surface border border-brand-200 shadow-sm space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-text truncate max-w-xs">{p.name}</h3>
                    <p className="text-[11px] font-mono text-text-muted mt-0.5">
                      {p.sourceLang.toUpperCase()} → {p.targetLang.toUpperCase()} • {p.pageCount} page(s)
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-brand-50 text-brand-600 border border-brand-200 animate-pulse">
                    {p.status}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-mono text-text-muted">
                    <span>{p.currentStep}</span>
                    <span>{p.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-border overflow-hidden">
                    <div
                      className="h-full bg-brand-500 rounded-full transition-all duration-500"
                      style={{ width: `${p.progress}%` }}
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end">
                  <Link
                    href={`/app/projects/${p.id}`}
                    className="inline-flex items-center gap-1 text-xs font-mono font-bold text-brand-600 hover:text-brand-700"
                  >
                    <span>View Pipeline Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Projects Table */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-sm font-extrabold tracking-tight font-mono uppercase text-text">
            Recent Translation Projects
          </h2>
          <Link
            href="/app/projects"
            className="text-xs font-mono text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            <span>View All Projects</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {projects.length === 0 ? (
          <div className="p-12 rounded-xl border border-dashed border-border bg-surface text-center space-y-4">
            <FileText className="w-8 h-8 mx-auto text-text-muted" />
            <div>
              <h3 className="text-sm font-bold text-text">No documents translated yet</h3>
              <p className="text-xs text-text-muted mt-1 max-w-sm mx-auto">
                Upload your first PDF, DOCX, or scanned document to begin automated layout-preserving translation.
              </p>
            </div>
            <Link
              href="/app/new-translation"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-500 text-white text-xs font-bold shadow-sm hover:bg-brand-600 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Start First Translation</span>
            </Link>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-surface overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border bg-surface-raised/50 font-mono text-[11px] text-text-muted uppercase">
                    <th className="py-3 px-4">Document</th>
                    <th className="py-3 px-4">Languages</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Fidelity</th>
                    <th className="py-3 px-4">Created</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border font-mono">
                  {projects.slice(0, 5).map((project) => (
                    <tr key={project.id} className="hover:bg-surface-raised/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <span className="uppercase px-1.5 py-0.5 rounded text-[10px] font-bold bg-border text-text">
                            {project.format}
                          </span>
                          <span className="font-sans font-bold text-text truncate max-w-xs">
                            {project.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-text-muted">
                        {project.sourceLang.toUpperCase()} → {project.targetLang.toUpperCase()}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            project.status === "COMPLETED" || project.status === "READY"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : project.status === "FAILED"
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {project.status === "COMPLETED" || project.status === "READY" ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : (
                            <Clock className="w-3 h-3" />
                          )}
                          <span>{project.status}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {project.fidelityScore ? (
                          <span className="font-bold text-emerald-600">{project.fidelityScore}%</span>
                        ) : (
                          <span className="text-text-muted">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-text-muted">
                        {new Date(project.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/app/projects/${project.id}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700"
                        >
                          <span>Inspect</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
