import * as React from "react";
import { BookOpen, Plus, Lock, ShieldCheck } from "lucide-react";

export default function AdminGlossariesPage() {
  const terms = [
    { id: "term_01", source: "Notaría Segunda del Círculo de Medellín", target: "Second Notary Public of the Circle of Medellin", kind: "ORGANIZATION", scope: "GLOBAL", locked: true },
    { id: "term_02", source: "Registro Civil de Nacimiento", target: "Civil Registry of Birth", kind: "LEGAL_HEADER", scope: "GLOBAL", locked: true },
    { id: "term_03", source: "Alejandro Hernandez Garcia", target: "Alejandro Hernandez Garcia", kind: "PASSPORT_NAME", scope: "Apex Law Group", locked: true },
    { id: "term_04", source: "Cédula de Ciudadanía", target: "National Citizenship Identity Card", kind: "ID_DOCUMENT", scope: "GLOBAL", locked: true },
    { id: "term_05", source: "Apostille (Convention de La Haye du 5 octobre 1961)", target: "Apostille (Hague Convention of October 5, 1961)", kind: "TREATY", scope: "GLOBAL", locked: true },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-2xl bg-surface border border-border">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-brand-500" />
            <h1 className="text-xl font-extrabold tracking-tight text-text">
              Enterprise Glossaries & Locked Passport Terms
            </h1>
          </div>
          <p className="text-xs text-text-muted mt-1">
            Enforce mandatory transliterations, proper names, and official government entity translations.
          </p>
        </div>

        <button className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-all shadow-sm">
          <Plus className="w-4 h-4" />
          <span>Add Glossary Term</span>
        </button>
      </div>

      {/* Terms Table */}
      <div className="rounded-xl border border-border bg-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-surface-raised/50 font-mono text-[11px] text-text-muted uppercase">
                <th className="py-3 px-4">Source Term</th>
                <th className="py-3 px-4">Mandatory Target Translation</th>
                <th className="py-3 px-4">Entity Kind</th>
                <th className="py-3 px-4">Scope</th>
                <th className="py-3 px-4">Lock State</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-mono">
              {terms.map((t) => (
                <tr key={t.id} className="hover:bg-surface-raised/50 transition-colors">
                  <td className="py-3.5 px-4 font-sans font-bold text-text">{t.source}</td>
                  <td className="py-3.5 px-4 font-sans font-bold text-brand-600">{t.target}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-surface-raised border border-border text-text-muted">
                      {t.kind}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-text-muted">{t.scope}</td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                      <Lock className="w-3 h-3" />
                      <span>LOCKED</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button className="text-xs font-bold text-brand-600 hover:underline">
                      Edit Term
                    </button>
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
