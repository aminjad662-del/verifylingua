"use client";

import * as React from "react";
import Link from "next/link";
import { AdminNav } from "@/components/admin/AdminNav";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  BarChart3,
  TrendingUp,
  Award,
  ShieldCheck,
  FileCheck2,
  Download,
  Calendar,
  Clock,
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  Percent,
  RefreshCw,
} from "lucide-react";

export default function AdminReportsPage() {
  const [dateRange, setDateRange] = React.useState<"7D" | "30D" | "90D" | "YTD">("30D");
  const [isExporting, setIsExporting] = React.useState(false);

  const handleExportReport = (reportName: string) => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      alert(`Report "${reportName}" successfully generated and downloaded.`);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-canvas text-text flex flex-col">
      <AdminNav />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-ink border border-brand-500/20 mb-2">
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Intelligence & Audits</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text">
              Executive Analytics & Compliance Audit Reports
            </h1>
            <p className="text-sm text-text-muted mt-1">
              Verify SLA commitments, USCIS 8 CFR acceptance rates, linguist quality indices, and export official audit packages.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-lg border border-border bg-surface p-1">
              {(["7D", "30D", "90D", "YTD"] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setDateRange(range)}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    dateRange === range
                      ? "bg-brand-500 text-white"
                      : "text-text-muted hover:text-text"
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Top KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5 border-border bg-surface shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-text-muted uppercase tracking-wider">
                Translated Volume
              </span>
              <FileCheck2 className="w-4 h-4 text-brand-ink" />
            </div>
            <p className="text-2xl font-bold tracking-tight mt-2 text-text">
              384,200 Words
            </p>
            <p className="text-xs text-text-muted mt-1">1,482 certified pages delivered</p>
          </Card>

          <Card className="p-5 border-border bg-surface shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-text-muted uppercase tracking-wider">
                USCIS Acceptance Rate
              </span>
              <ShieldCheck className="w-4 h-4 text-status-success" />
            </div>
            <p className="text-2xl font-bold tracking-tight mt-2 text-status-success">
              100.0%
            </p>
            <p className="text-xs text-text-muted mt-1">Zero rejections across all filings</p>
          </Card>

          <Card className="p-5 border-border bg-surface shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-text-muted uppercase tracking-wider">
                Average Velocity
              </span>
              <Clock className="w-4 h-4 text-brand-ink" />
            </div>
            <p className="text-2xl font-bold tracking-tight mt-2 text-text">
              18.5 Hours
            </p>
            <p className="text-xs text-text-muted mt-1">From upload to notary certification</p>
          </Card>

          <Card className="p-5 border-border bg-surface shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-text-muted uppercase tracking-wider">
                Customer Satisfaction
              </span>
              <Award className="w-4 h-4 text-status-warning fill-current" />
            </div>
            <p className="text-2xl font-bold tracking-tight mt-2 text-text">
              4.96 / 5.0
            </p>
            <p className="text-xs text-text-muted mt-1">Based on 320 client reviews</p>
          </Card>
        </div>

        {/* 2-Column Analytics Grids */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Language Pair Distribution */}
          <Card className="p-6 border-border bg-surface shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-base font-semibold text-text">
                  Language Pair Distribution
                </h3>
                <p className="text-xs text-text-muted mt-0.5">
                  Breakdown of client filing languages for {dateRange}
                </p>
              </div>
              <Badge variant="outline" className="text-xs">
                Top 6
              </Badge>
            </div>

            <div className="space-y-3">
              {[
                { lang: "Spanish → English (USCIS Vital Records)", pct: 44, count: 652 },
                { lang: "Arabic → English (Diplomas & Affidavits)", pct: 18, count: 266 },
                { lang: "German → English (Patents & Corporate)", pct: 12, count: 178 },
                { lang: "Japanese → English (Technical & Financial)", pct: 10, count: 148 },
                { lang: "French → English (Notarial & Legal)", pct: 9, count: 133 },
                { lang: "Portuguese & Other Regional Dialects", pct: 7, count: 105 },
              ].map((item) => (
                <div key={item.lang} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-text">{item.lang}</span>
                    <span className="font-mono text-text-muted">
                      {item.count} orders ({item.pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-surface-raised rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-brand-500 h-2 rounded-full"
                      style={{ width: `${item.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Quality & Compliance Scorecard */}
          <Card className="p-6 border-border bg-surface shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-base font-semibold text-text">
                  Quality & Compliance Indices
                </h3>
                <p className="text-xs text-text-muted mt-0.5">
                  ISO 17100 translation services quality framework
                </p>
              </div>
              <span className="text-xs font-semibold text-status-success flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Compliant
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-surface-raised border border-border space-y-1">
                <span className="text-xs text-text-muted">Glossary Adherence</span>
                <p className="text-xl font-bold text-text">99.8%</p>
                <p className="text-[11px] text-text-muted">Strict institutional terminology</p>
              </div>

              <div className="p-4 rounded-lg bg-surface-raised border border-border space-y-1">
                <span className="text-xs text-text-muted">First-Pass QA Approval</span>
                <p className="text-xl font-bold text-status-success">97.8%</p>
                <p className="text-[11px] text-text-muted">Passed 5-point gate without rework</p>
              </div>

              <div className="p-4 rounded-lg bg-surface-raised border border-border space-y-1">
                <span className="text-xs text-text-muted">Client Revision Rate</span>
                <p className="text-xl font-bold text-brand-ink">2.1%</p>
                <p className="text-[11px] text-text-muted">Industry benchmark &lt; 5.0%</p>
              </div>

              <div className="p-4 rounded-lg bg-surface-raised border border-border space-y-1">
                <span className="text-xs text-text-muted">On-Time SLA Delivery</span>
                <p className="text-xl font-bold text-status-success">99.4%</p>
                <p className="text-[11px] text-text-muted">Met 24h & 48h commitments</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Official Export Center */}
        <Card className="p-6 border-border bg-surface shadow-sm space-y-4">
          <div className="border-b border-border pb-3">
            <h3 className="text-base font-semibold text-text">Official Compliance & Export Packages</h3>
            <p className="text-xs text-text-muted mt-0.5">
              Download certified evidence packages for USCIS audit trials, tax reconciliation, and ISO quality inspections.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border border-border bg-surface-raised flex flex-col justify-between space-y-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-brand-ink" />
                  <h4 className="text-sm font-semibold text-text">USCIS Attestation Pack</h4>
                </div>
                <p className="text-xs text-text-muted">
                  Consolidated log of 8 CFR certifications, translator competence affidavits, and notarized seal verifications.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExportReport("USCIS Attestation Pack (PDF)")}
                disabled={isExporting}
                className="border-border text-text hover:bg-surface w-full"
              >
                <Download className="w-3.5 h-3.5 mr-1.5" />
                Download PDF
              </Button>
            </div>

            <div className="p-4 rounded-lg border border-border bg-surface-raised flex flex-col justify-between space-y-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-brand-ink" />
                  <h4 className="text-sm font-semibold text-text">Linguist Performance Audit</h4>
                </div>
                <p className="text-xs text-text-muted">
                  Quality rating records, word volume by ATA credential number, and peer review variance data.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExportReport("Linguist Quality Audit (CSV)")}
                disabled={isExporting}
                className="border-border text-text hover:bg-surface w-full"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5" />
                Export CSV
              </Button>
            </div>

            <div className="p-4 rounded-lg border border-border bg-surface-raised flex flex-col justify-between space-y-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-brand-ink" />
                  <h4 className="text-sm font-semibold text-text">Quarterly Revenue Ledger</h4>
                </div>
                <p className="text-xs text-text-muted">
                  Itemized receivables, sales tax collections, translator payouts, and GAAP margin reconciliation.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExportReport("Quarterly Financial Ledger (CSV)")}
                disabled={isExporting}
                className="border-border text-text hover:bg-surface w-full"
              >
                <Download className="w-3.5 h-3.5 mr-1.5" />
                Export Ledger
              </Button>
            </div>
          </div>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
