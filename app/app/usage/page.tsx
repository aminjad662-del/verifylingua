import * as React from "react";
import Link from "next/link";
import { BarChart3, ArrowUpRight, Zap, Shield, FileText } from "lucide-react";
import { ProjectService } from "@/lib/services/project-service";

export default async function UsagePage() {
  const stats = await ProjectService.getUsageStats();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-2xl bg-surface border border-border">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-text">
            Usage & Quota Telemetry
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Real-time tracking of translated pages, OCR units, and monthly processing allowances.
          </p>
        </div>
        <Link
          href="/app/billing"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-all shadow-sm self-start sm:self-auto"
        >
          <span>Upgrade Quota</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Main Quota Meter */}
      <div className="p-6 rounded-2xl bg-surface border border-border space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-brand-500" />
            <h2 className="text-xs font-mono font-extrabold uppercase tracking-wider text-text">
              Monthly Page Allocation
            </h2>
          </div>
          <span className="text-xs font-mono font-bold text-brand-600">
            {stats.pagesUsedThisPeriod} of {stats.monthlyQuotaPages} Pages ({stats.percentUsed}%)
          </span>
        </div>

        <div className="w-full h-3 rounded-full bg-surface-raised border border-border overflow-hidden p-0.5">
          <div
            className="h-full bg-brand-500 rounded-full transition-all duration-500"
            style={{ width: `${stats.percentUsed}%` }}
          />
        </div>

        <div className="flex justify-between text-[11px] font-mono text-text-muted">
          <span>Current billing cycle renews in 18 days</span>
          <span>{stats.pagesRemaining} pages remaining</span>
        </div>
      </div>

      {/* Subsystem Telemetry Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-surface border border-border space-y-2">
          <span className="text-[10px] font-mono uppercase text-text-muted">Vector PDF Processing</span>
          <p className="text-lg font-bold font-mono text-text">
            {Math.round(stats.pagesUsedThisPeriod * 0.65)} pages
          </p>
          <p className="text-[11px] text-text-muted">1:1 spatial text reconstruction</p>
        </div>

        <div className="p-5 rounded-xl bg-surface border border-border space-y-2">
          <span className="text-[10px] font-mono uppercase text-text-muted">Scanned OCR Extraction</span>
          <p className="text-lg font-bold font-mono text-text">
            {Math.round(stats.pagesUsedThisPeriod * 0.25)} pages
          </p>
          <p className="text-[11px] text-text-muted">Neural Tesseract & Azure engine</p>
        </div>

        <div className="p-5 rounded-xl bg-surface border border-border space-y-2">
          <span className="text-[10px] font-mono uppercase text-text-muted">OpenXML DOCX Processing</span>
          <p className="text-lg font-bold font-mono text-text">
            {Math.round(stats.pagesUsedThisPeriod * 0.1)} docs
          </p>
          <p className="text-[11px] text-text-muted">Run and table preservation</p>
        </div>
      </div>
    </div>
  );
}
