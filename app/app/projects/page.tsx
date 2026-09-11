import * as React from "react";
import Link from "next/link";
import { Plus, ArrowRight, CheckCircle2, Clock, Search, Filter } from "lucide-react";
import { ProjectService } from "@/lib/services/project-service";

export default async function ProjectsListPage({
  searchParams,
}: {
  searchParams?: Promise<{ search?: string; status?: string }>;
}) {
  const params = await searchParams;
  const projects = await ProjectService.listProjects(undefined, {
    search: params?.search,
    status: params?.status,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-text">
            Translation Projects
          </h1>
          <p className="text-xs text-text-muted mt-0.5">
            Manage your document translation lifecycle, revisions, and verified outputs.
          </p>
        </div>

        <Link
          href="/app/new-translation"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-all shadow-sm active:scale-[0.98] self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </Link>
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
              placeholder="Search projects by document name or language..."
              className="w-full pl-9 pr-4 py-1.5 rounded-lg text-xs bg-surface-raised border border-border focus:outline-none focus:border-brand-500"
            />
          </form>
        </div>

        <div className="flex items-center gap-2">
          {["ALL", "COMPLETED", "IN_TRANSLATION", "FAILED"].map((st) => {
            const isSelected = (params?.status || "ALL").toUpperCase() === st;
            return (
              <Link
                key={st}
                href={`/app/projects?status=${st}${params?.search ? `&search=${params.search}` : ""}`}
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

      {/* Projects Table */}
      {projects.length === 0 ? (
        <div className="p-12 rounded-xl border border-dashed border-border bg-surface text-center space-y-3">
          <p className="text-xs text-text-muted">No projects found matching your criteria.</p>
          <Link
            href="/app/new-translation"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-700"
          >
            <span>Create a new translation project</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border bg-surface-raised/50 font-mono text-[11px] text-text-muted uppercase">
                  <th className="py-3 px-4">Project ID & Name</th>
                  <th className="py-3 px-4">Language Pair</th>
                  <th className="py-3 px-4">Mode</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Fidelity</th>
                  <th className="py-3 px-4">Revisions</th>
                  <th className="py-3 px-4">Created</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-mono">
                {projects.map((project) => (
                  <tr key={project.id} className="hover:bg-surface-raised/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="uppercase px-1.5 py-0.5 rounded text-[10px] font-bold bg-border text-text">
                            {project.format}
                          </span>
                          <span className="font-sans font-bold text-text truncate max-w-xs">
                            {project.name}
                          </span>
                        </div>
                        <p className="text-[10px] text-text-muted mt-0.5">{project.id}</p>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-text-muted uppercase">
                      {project.sourceLang} → {project.targetLang}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-[11px] font-bold text-text-muted">
                        {project.serviceTier}
                      </span>
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
                      {project.revisionCount > 0 ? (
                        <span className="text-amber-600 font-bold">{project.revisionCount} request(s)</span>
                      ) : (
                        <span>0</span>
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
                        <span>Open</span>
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
  );
}
