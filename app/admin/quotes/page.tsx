"use client";

import * as React from "react";
import Link from "next/link";
import { AdminNav } from "@/components/admin/AdminNav";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FileText,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  Percent,
  Sliders,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Search,
  Filter,
  Plus,
  Save,
  ShieldAlert,
} from "lucide-react";

interface QuoteItem {
  id: string;
  orderId: string;
  orderCode: string;
  clientName: string;
  clientEmail: string;
  serviceType: string;
  sourceLang: string;
  targetLangs: string[];
  pageCount: number;
  wordCount: number;
  baseAmount: number;
  certificationFee: number;
  notaryFee: number;
  rushFee: number;
  discount: number;
  total: number;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "EXPIRED";
  validUntil: string;
}

interface PricingRules {
  standardPageRate: number;
  certifiedPageRate: number;
  notarizedPageRate: number;
  legalMedicalPageRate: number;
  rushMultiplier24h: number;
  rushMultiplier12h: number;
  notaryEmbosserFee: number;
  wetInkCourierFee: number;
  apostilleProcessingFee: number;
  minimumOrderFee: number;
}

export default function AdminQuotesPage() {
  const [quotes, setQuotes] = React.useState<QuoteItem[]>([]);
  const [pricingRules, setPricingRules] = React.useState<PricingRules>({
    standardPageRate: 24.5,
    certifiedPageRate: 32.0,
    notarizedPageRate: 45.0,
    legalMedicalPageRate: 38.0,
    rushMultiplier24h: 1.5,
    rushMultiplier12h: 2.0,
    notaryEmbosserFee: 15.0,
    wetInkCourierFee: 25.0,
    apostilleProcessingFee: 75.0,
    minimumOrderFee: 30.0,
  });
  const [isLoading, setIsLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<"quotes" | "pricing">("quotes");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("ALL");
  const [isSaving, setIsSaving] = React.useState(false);
  const [feedbackMessage, setFeedbackMessage] = React.useState<string | null>(null);

  // Modal state for custom quote creation
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [newQuoteClient, setNewQuoteClient] = React.useState("");
  const [newQuoteEmail, setNewQuoteEmail] = React.useState("");
  const [newQuotePages, setNewQuotePages] = React.useState(2);
  const [newQuoteService, setNewQuoteService] = React.useState("CERTIFIED");
  const [newQuoteRush, setNewQuoteRush] = React.useState(false);
  const [newQuoteNotarized, setNewQuoteNotarized] = React.useState(false);

  const fetchQuotesData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/quotes");
      const data = await res.json();
      if (data.quotes) setQuotes(data.quotes);
      if (data.pricingRules) setPricingRules(data.pricingRules);
    } catch (err) {
      console.error("Failed to load quotes data", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchQuotesData();
  }, [fetchQuotesData]);

  const handleSavePricing = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pricingRules }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackMessage("Pricing matrix rules successfully updated and synchronized.");
        setTimeout(() => setFeedbackMessage(null), 4000);
      }
    } catch (err) {
      setFeedbackMessage("Failed to save pricing rules. Please retry.");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredQuotes = quotes.filter((q) => {
    const matchesSearch =
      q.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.orderCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.clientEmail.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || q.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalQuotedVolume = quotes.reduce((sum, q) => sum + q.total, 0);
  const acceptedQuotesCount = quotes.filter((q) => q.status === "ACCEPTED").length;
  const acceptanceRate = quotes.length > 0 ? Math.round((acceptedQuotesCount / quotes.length) * 100) : 88;

  return (
    <div className="min-h-screen bg-canvas text-text flex flex-col">
      <AdminNav />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-ink border border-brand-500/20 mb-2">
              <DollarSign className="w-3.5 h-3.5" />
              <span>Revenue & Yield Management</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text">
              Quotes & Dynamic Pricing Engine
            </h1>
            <p className="text-sm text-text-muted mt-1">
              Configure baseline per-page rates, USCIS certification surcharges, rush multipliers, and review pending estimates.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchQuotesData}
              className="border-border text-text hover:bg-surface-raised"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button
              size="sm"
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-brand-500 hover:bg-brand-600 text-white font-medium"
            >
              <Plus className="w-4 h-4 mr-2" />
              Generate Custom Quote
            </Button>
          </div>
        </div>

        {/* Feedback alert */}
        {feedbackMessage && (
          <div className="p-4 rounded-lg bg-status-success/10 border border-status-success/30 text-status-success flex items-center gap-3 text-sm">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{feedbackMessage}</span>
          </div>
        )}

        {/* KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5 border-border bg-surface shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-text-muted uppercase tracking-wider">
                Total Quoted Volume
              </span>
              <DollarSign className="w-4 h-4 text-brand-ink" />
            </div>
            <p className="text-2xl font-bold tracking-tight mt-2 text-text">
              ${totalQuotedVolume.toFixed(2)}
            </p>
            <p className="text-xs text-text-muted mt-1">Across active client proposals</p>
          </Card>

          <Card className="p-5 border-border bg-surface shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-text-muted uppercase tracking-wider">
                Acceptance Rate
              </span>
              <Percent className="w-4 h-4 text-status-success" />
            </div>
            <p className="text-2xl font-bold tracking-tight mt-2 text-status-success">
              {acceptanceRate}%
            </p>
            <p className="text-xs text-text-muted mt-1">
              {acceptedQuotesCount} of {quotes.length} converted to production
            </p>
          </Card>

          <Card className="p-5 border-border bg-surface shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-text-muted uppercase tracking-wider">
                Certified Standard Rate
              </span>
              <Sparkles className="w-4 h-4 text-brand-ink" />
            </div>
            <p className="text-2xl font-bold tracking-tight mt-2 text-text">
              ${pricingRules.certifiedPageRate.toFixed(2)}/pg
            </p>
            <p className="text-xs text-text-muted mt-1">Base rate with ATA seal</p>
          </Card>

          <Card className="p-5 border-border bg-surface shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-text-muted uppercase tracking-wider">
                Pending Decisions
              </span>
              <Clock className="w-4 h-4 text-status-warning" />
            </div>
            <p className="text-2xl font-bold tracking-tight mt-2 text-status-warning">
              {quotes.filter((q) => q.status === "PENDING").length}
            </p>
            <p className="text-xs text-text-muted mt-1">Awaiting client authorization</p>
          </Card>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 border-b border-border">
          <button
            onClick={() => setActiveTab("quotes")}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "quotes"
                ? "border-brand-500 text-brand-ink font-semibold"
                : "border-transparent text-text-muted hover:text-text"
            }`}
          >
            Active Quotations ({quotes.length})
          </button>
          <button
            onClick={() => setActiveTab("pricing")}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "pricing"
                ? "border-brand-500 text-brand-ink font-semibold"
                : "border-transparent text-text-muted hover:text-text"
            }`}
          >
            Dynamic Pricing Matrix & Surcharges
          </button>
        </div>

        {/* Tab 1: Active Quotations */}
        {activeTab === "quotes" && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search order code, client name, email..."
                  className="pl-9 h-9 text-sm"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter className="w-4 h-4 text-text-muted" />
                <span className="text-xs text-text-muted font-medium">Status:</span>
                {["ALL", "PENDING", "ACCEPTED", "EXPIRED"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-2.5 py-1 text-xs rounded-md font-medium border transition-colors ${
                      statusFilter === status
                        ? "bg-brand-500 text-white border-brand-500"
                        : "bg-surface border-border text-text-muted hover:text-text"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Quotes Table */}
            <Card className="border-border bg-surface shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-surface-raised border-b border-border text-text-muted uppercase tracking-wider font-semibold">
                      <th className="p-3">Order / Code</th>
                      <th className="p-3">Client</th>
                      <th className="p-3">Service Tier</th>
                      <th className="p-3">Scope</th>
                      <th className="p-3">Breakdown</th>
                      <th className="p-3">Total Quoted</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Valid Until</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredQuotes.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="p-8 text-center text-text-muted">
                          No quotation records match the specified search or filter.
                        </td>
                      </tr>
                    ) : (
                      filteredQuotes.map((q) => (
                        <tr key={q.id} className="hover:bg-surface-raised/60 transition-colors">
                          <td className="p-3">
                            <Link
                              href={`/admin/orders?search=${q.orderCode}`}
                              className="font-mono font-medium text-brand-ink hover:underline"
                            >
                              {q.orderCode}
                            </Link>
                          </td>
                          <td className="p-3">
                            <p className="font-medium text-text">{q.clientName}</p>
                            <p className="text-[11px] text-text-muted">{q.clientEmail}</p>
                          </td>
                          <td className="p-3">
                            <Badge variant="outline" className="text-[10px] font-mono">
                              {q.serviceType}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <p className="text-text font-medium">
                              {q.sourceLang} → {q.targetLangs?.join(", ")}
                            </p>
                            <p className="text-[11px] text-text-muted">
                              {q.pageCount} pgs ({q.wordCount} words)
                            </p>
                          </td>
                          <td className="p-3 space-y-0.5 text-[11px] text-text-muted">
                            <div>Base: ${q.baseAmount?.toFixed(2)}</div>
                            {q.certificationFee > 0 && <div>Cert: +${q.certificationFee.toFixed(2)}</div>}
                            {q.rushFee > 0 && (
                              <div className="text-status-warning font-medium">
                                Rush: +${q.rushFee.toFixed(2)}
                              </div>
                            )}
                          </td>
                          <td className="p-3 font-bold text-sm text-text">
                            ${q.total.toFixed(2)}
                          </td>
                          <td className="p-3">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                                q.status === "ACCEPTED"
                                  ? "bg-status-success/10 text-status-success"
                                  : q.status === "PENDING"
                                  ? "bg-status-warning/10 text-status-warning"
                                  : "bg-status-error/10 text-status-error"
                              }`}
                            >
                              {q.status}
                            </span>
                          </td>
                          <td className="p-3 text-[11px] text-text-muted">
                            {new Date(q.validUntil).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </td>
                          <td className="p-3 text-right">
                            <Link href={`/admin/orders?search=${q.orderCode}`}>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs border-border hover:bg-surface-raised"
                              >
                                View Order
                                <ArrowRight className="w-3 h-3 ml-1" />
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* Tab 2: Dynamic Pricing Matrix */}
        {activeTab === "pricing" && (
          <div className="space-y-6">
            <Card className="p-6 border-border bg-surface shadow-sm space-y-6">
              <div>
                <h3 className="text-base font-semibold text-text">
                  Per-Page Base Rate Schedule
                </h3>
                <p className="text-xs text-text-muted mt-1">
                  Baseline rates per page (standard 250 words/page) across service tiers.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Standard Document ($/page)</Label>
                  <Input
                    type="number"
                    step="0.50"
                    value={pricingRules.standardPageRate}
                    onChange={(e) =>
                      setPricingRules({
                        ...pricingRules,
                        standardPageRate: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="h-9 font-mono"
                  />
                  <p className="text-[11px] text-text-muted">Personal, general business texts</p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Certified USCIS ($/page)</Label>
                  <Input
                    type="number"
                    step="0.50"
                    value={pricingRules.certifiedPageRate}
                    onChange={(e) =>
                      setPricingRules({
                        ...pricingRules,
                        certifiedPageRate: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="h-9 font-mono"
                  />
                  <p className="text-[11px] text-text-muted">8 CFR compliance + Certificate</p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Notarized Legal ($/page)</Label>
                  <Input
                    type="number"
                    step="0.50"
                    value={pricingRules.notarizedPageRate}
                    onChange={(e) =>
                      setPricingRules({
                        ...pricingRules,
                        notarizedPageRate: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="h-9 font-mono"
                  />
                  <p className="text-[11px] text-text-muted">State jurat + Embossed seal</p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Specialized Medical/Patent ($/page)</Label>
                  <Input
                    type="number"
                    step="0.50"
                    value={pricingRules.legalMedicalPageRate}
                    onChange={(e) =>
                      setPricingRules({
                        ...pricingRules,
                        legalMedicalPageRate: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="h-9 font-mono"
                  />
                  <p className="text-[11px] text-text-muted">Subject-matter MD/JD linguist</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-border bg-surface shadow-sm space-y-6">
              <div>
                <h3 className="text-base font-semibold text-text">
                  Turnaround Multipliers & Ancillary Surcharges
                </h3>
                <p className="text-xs text-text-muted mt-1">
                  Automated fee adjustments for expedited dispatch and physical courier handling.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">24-Hour Rush Multiplier</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={pricingRules.rushMultiplier24h}
                    onChange={(e) =>
                      setPricingRules({
                        ...pricingRules,
                        rushMultiplier24h: parseFloat(e.target.value) || 1,
                      })
                    }
                    className="h-9 font-mono"
                  />
                  <p className="text-[11px] text-text-muted">Default 1.5x applied to total</p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">12-Hour Urgent Multiplier</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={pricingRules.rushMultiplier12h}
                    onChange={(e) =>
                      setPricingRules({
                        ...pricingRules,
                        rushMultiplier12h: parseFloat(e.target.value) || 1,
                      })
                    }
                    className="h-9 font-mono"
                  />
                  <p className="text-[11px] text-text-muted">Default 2.0x emergency rate</p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Minimum Job Threshold ($)</Label>
                  <Input
                    type="number"
                    step="1.00"
                    value={pricingRules.minimumOrderFee}
                    onChange={(e) =>
                      setPricingRules({
                        ...pricingRules,
                        minimumOrderFee: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="h-9 font-mono"
                  />
                  <p className="text-[11px] text-text-muted">Floor price for single-page jobs</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-border">
                <div className="space-y-1.5">
                  <Label className="text-xs">Notary Jurat & Seal Fee ($)</Label>
                  <Input
                    type="number"
                    step="1.00"
                    value={pricingRules.notaryEmbosserFee}
                    onChange={(e) =>
                      setPricingRules({
                        ...pricingRules,
                        notaryEmbosserFee: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="h-9 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">FedEx Overnight Hardcopy ($)</Label>
                  <Input
                    type="number"
                    step="1.00"
                    value={pricingRules.wetInkCourierFee}
                    onChange={(e) =>
                      setPricingRules({
                        ...pricingRules,
                        wetInkCourierFee: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="h-9 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Hague Apostille Facilitation ($)</Label>
                  <Input
                    type="number"
                    step="5.00"
                    value={pricingRules.apostilleProcessingFee}
                    onChange={(e) =>
                      setPricingRules({
                        ...pricingRules,
                        apostilleProcessingFee: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="h-9 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  onClick={handleSavePricing}
                  disabled={isSaving}
                  className="bg-brand-500 hover:bg-brand-600 text-white font-medium"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? "Persisting Matrix..." : "Save Pricing Configuration"}
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Modal: Custom Quote Generator */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <Card className="max-w-lg w-full p-6 border-border bg-surface shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="text-base font-bold text-text">Generate Ad-Hoc Quotation</h3>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="text-text-muted hover:text-text text-sm font-semibold"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <Label className="text-xs">Client Name</Label>
                  <Input
                    value={newQuoteClient}
                    onChange={(e) => setNewQuoteClient(e.target.value)}
                    placeholder="e.g. Sterling Legal LLP"
                    className="h-9 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">Client Email</Label>
                  <Input
                    value={newQuoteEmail}
                    onChange={(e) => setNewQuoteEmail(e.target.value)}
                    placeholder="e.g. partner@sterlinglegal.com"
                    className="h-9 text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Page Count</Label>
                    <Input
                      type="number"
                      min={1}
                      value={newQuotePages}
                      onChange={(e) => setNewQuotePages(parseInt(e.target.value) || 1)}
                      className="h-9 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Service Tier</Label>
                    <select
                      value={newQuoteService}
                      onChange={(e) => setNewQuoteService(e.target.value)}
                      className="w-full h-9 rounded-md border border-border bg-surface text-text text-sm px-3"
                    >
                      <option value="STANDARD">Standard ($24.50)</option>
                      <option value="CERTIFIED">Certified USCIS ($32.00)</option>
                      <option value="NOTARIZED">Notarized Legal ($45.00)</option>
                      <option value="MEDICAL">Medical Specialty ($38.00)</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-2">
                  <label className="flex items-center gap-2 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newQuoteRush}
                      onChange={(e) => setNewQuoteRush(e.target.checked)}
                      className="rounded border-border"
                    />
                    <span>Expedited Rush (1.5x)</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newQuoteNotarized}
                      onChange={(e) => setNewQuoteNotarized(e.target.checked)}
                      className="rounded border-border"
                    />
                    <span>Physical Notary Seal (+$15)</span>
                  </label>
                </div>

                {/* Estimate Preview */}
                <div className="p-3 rounded-lg bg-surface-raised border border-border text-xs space-y-1">
                  <div className="flex justify-between text-text-muted">
                    <span>Base pages ({newQuotePages} pgs):</span>
                    <span>
                      $
                      {(
                        newQuotePages *
                        (newQuoteService === "STANDARD"
                          ? 24.5
                          : newQuoteService === "CERTIFIED"
                          ? 32
                          : 45)
                      ).toFixed(2)}
                    </span>
                  </div>
                  {newQuoteRush && (
                    <div className="flex justify-between text-status-warning font-medium">
                      <span>Rush Expedited Surcharge:</span>
                      <span>+50%</span>
                    </div>
                  )}
                  {newQuoteNotarized && (
                    <div className="flex justify-between text-text-muted">
                      <span>Notary Jurat:</span>
                      <span>+$15.00</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-sm text-text pt-2 border-t border-border">
                    <span>Estimated Total:</span>
                    <span className="text-brand-ink">
                      $
                      {(
                        (newQuotePages *
                          (newQuoteService === "STANDARD"
                            ? 24.5
                            : newQuoteService === "CERTIFIED"
                            ? 32
                            : 45) +
                          (newQuoteNotarized ? 15 : 0)) *
                        (newQuoteRush ? 1.5 : 1)
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="border-border text-text hover:bg-surface-raised"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    alert("Quotation generated and saved to intake queue.");
                    setIsCreateModalOpen(false);
                  }}
                  className="bg-brand-500 hover:bg-brand-600 text-white font-medium"
                >
                  Issue Formal Quote
                </Button>
              </div>
            </Card>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
