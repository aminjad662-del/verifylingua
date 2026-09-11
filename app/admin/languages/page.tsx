import * as React from "react";
import { Languages, Plus, CheckCircle2, Shield } from "lucide-react";

export default function AdminLanguagesPage() {
  const languages = [
    { code: "es", name: "Spanish", native: "Español", dir: "LTR", primary: "Gemini 3.1 Pro", fallback: "DeepL Pro", ocr: "Tesseract Latin", status: "ACTIVE" },
    { code: "ar", name: "Arabic", native: "العربية", dir: "RTL", primary: "Gemini 3.1 Pro", fallback: "DeepL Pro", ocr: "Azure Doc Intel", status: "ACTIVE" },
    { code: "fr", name: "French", native: "Français", dir: "LTR", primary: "Gemini 3.1 Pro", fallback: "DeepL Pro", ocr: "Tesseract Latin", status: "ACTIVE" },
    { code: "de", name: "German", native: "Deutsch", dir: "LTR", primary: "Gemini 3.1 Pro", fallback: "DeepL Pro", ocr: "Tesseract Latin", status: "ACTIVE" },
    { code: "pt", name: "Portuguese", native: "Português", dir: "LTR", primary: "Gemini 3.1 Pro", fallback: "DeepL Pro", ocr: "Tesseract Latin", status: "ACTIVE" },
    { code: "zh", name: "Chinese (Simp)", native: "简体中文", dir: "LTR", primary: "Gemini 3.1 Pro", fallback: "DeepL Pro", ocr: "Azure Doc Intel", status: "ACTIVE" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-2xl bg-surface border border-border">
        <div>
          <div className="flex items-center gap-2">
            <Languages className="w-5 h-5 text-brand-500" />
            <h1 className="text-xl font-extrabold tracking-tight text-text">
              Language Governance & Provider Routing
            </h1>
          </div>
          <p className="text-xs text-text-muted mt-1">
            Configure active language pairs, directionality (LTR/RTL), neural models, and failover priority.
          </p>
        </div>

        <button className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-all shadow-sm">
          <Plus className="w-4 h-4" />
          <span>Add Language Pair</span>
        </button>
      </div>

      {/* Languages Table */}
      <div className="rounded-xl border border-border bg-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b border-border bg-surface-raised/50 text-[11px] text-text-muted uppercase">
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Language</th>
                <th className="py-3 px-4">Direction</th>
                <th className="py-3 px-4">Primary Engine</th>
                <th className="py-3 px-4">Fallback Provider</th>
                <th className="py-3 px-4">OCR Pipeline</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Configure</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {languages.map((lang) => (
                <tr key={lang.code} className="hover:bg-surface-raised/50 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-text uppercase">{lang.code}</td>
                  <td className="py-3.5 px-4">
                    <span className="font-sans font-bold text-text">{lang.name}</span>
                    <span className="text-text-muted ml-1.5">({lang.native})</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        lang.dir === "RTL"
                          ? "bg-purple-50 text-purple-700 border border-purple-200"
                          : "bg-surface-raised text-text-muted border border-border"
                      }`}
                    >
                      {lang.dir}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-brand-600 font-bold">{lang.primary}</td>
                  <td className="py-3.5 px-4 text-text-muted">{lang.fallback}</td>
                  <td className="py-3.5 px-4 text-text-muted">{lang.ocr}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {lang.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button className="text-xs font-bold text-brand-600 hover:underline">
                      Edit Rules
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
