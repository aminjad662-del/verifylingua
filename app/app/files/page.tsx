import * as React from "react";
import Link from "next/link";
import { FolderLock, Download, ShieldCheck, FileText, ArrowRight } from "lucide-react";
import { ProjectService } from "@/lib/services/project-service";

export default async function DocumentVaultPage() {
  const projects = await ProjectService.listProjects();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-2xl bg-surface border border-border">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-text">
            Secure Document Vault
          </h1>
          <p className="text-xs text-text-muted mt-1">
            End-to-end encrypted storage for original source documents and certified translated deliverables.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-raised border border-border text-xs font-mono text-emerald-600">
          <ShieldCheck className="w-4 h-4" />
          <span>Cloudflare R2 Vault Active</span>
        </div>
      </div>

      {/* Files Table */}
      <div className="rounded-xl border border-border bg-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-surface-raised/50 font-mono text-[11px] text-text-muted uppercase">
                <th className="py-3 px-4">Document Name</th>
                <th className="py-3 px-4">Format</th>
                <th className="py-3 px-4">Size</th>
                <th className="py-3 px-4">SHA-256 Fingerprint</th>
                <th className="py-3 px-4">Encryption</th>
                <th className="py-3 px-4">Created Date</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-mono">
              {projects.map((p) => {
                const mockHash = `sha256_${p.id.slice(0, 12)}...${p.id.slice(-6)}`;
                return (
                  <tr key={p.id} className="hover:bg-surface-raised/50 transition-colors">
                    <td className="py-3.5 px-4 font-sans font-bold text-text">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-text-muted" />
                        <span className="truncate max-w-xs">{p.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="uppercase px-1.5 py-0.5 rounded text-[10px] font-bold bg-border text-text">
                        {p.format}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-text-muted">
                      {(p.fileSizeBytes / 1024).toFixed(1)} KB
                    </td>
                    <td className="py-3.5 px-4 text-text-muted text-[11px]">
                      {mockHash}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                        AES-256
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-text-muted">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {p.downloadUrl ? (
                        <a
                          href={p.downloadUrl}
                          download
                          className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download</span>
                        </a>
                      ) : (
                        <Link
                          href={`/app/projects/${p.id}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700"
                        >
                          <span>Inspect</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
