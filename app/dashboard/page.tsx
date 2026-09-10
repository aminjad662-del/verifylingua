"use client";

import * as React from "react";
import Link from "next/link";
import { DashboardNav } from "@/components/layout/DashboardNav";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  UploadCloud,
  FileSpreadsheet,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  Search,
  MessageSquare,
  DollarSign,
  Sparkles,
  ChevronRight,
  FolderLock,
  Eye,
} from "lucide-react";

export default function ClientDashboardOverview() {
  const [orders, setOrders] = React.useState<any[]>([]);
  const [overviewMetrics, setOverviewMetrics] = React.useState<any>({
    activeCount: 3,
    awaitingActionCount: 2,
    inProgressCount: 1,
    completedCount: 1,
    outstandingInvoicesCount: 1,
    outstandingBalance: 144.70,
  });
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("ALL");
  const [loading, setLoading] = React.useState(true);

  const fetchDashboardData = React.useCallback(async () => {
    try {
      const [overviewRes, ordersRes] = await Promise.all([
        fetch("/api/dashboard/overview"),
        fetch("/api/dashboard/orders"),
      ]);

      if (overviewRes.ok) {
        const ovData = await overviewRes.json();
        setOverviewMetrics(ovData.metrics);
      }
      if (ordersRes.ok) {
        const ordData = await ordersRes.json();
        setOrders(ordData.orders || []);
      }
    } catch (err) {
      console.warn("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.publicCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.serviceType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.sourceLang?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.targetLangs?.some((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (o.matterNumber && o.matterNumber.toLowerCase().includes(searchQuery.toLowerCase()));

    if (statusFilter === "ALL") return matchesSearch;
    if (statusFilter === "ACTION_REQUIRED") {
      return (
        matchesSearch &&
        (o.status === "CLIENT_REVIEW" || o.status === "QUOTE_SENT" || o.status === "PAYMENT_PENDING")
      );
    }
    if (statusFilter === "IN_TRANSLATION") {
      return matchesSearch && (o.status === "IN_TRANSLATION" || o.status === "QUALITY_REVIEW");
    }
    if (statusFilter === "COMPLETED") {
      return matchesSearch && o.status === "COMPLETED";
    }
    return matchesSearch;
  });

  const actionRequiredOrders = orders.filter(
    (o) => o.status === "CLIENT_REVIEW" || o.status === "QUOTE_SENT" || o.status === "PAYMENT_PENDING"
  );

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-text">
      <DashboardNav />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Editorial Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-text-muted mb-1">
              <span className="inline-block w-2 h-2 rounded-full bg-status-success" />
              <span>APEX IMMIGRATION LAW GROUP ? ENCRYPTED CLIENT PORTAL</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-ink tracking-tight">
              Translation Operations Workspace
            </h1>
            <p className="text-xs sm:text-sm text-text-muted mt-1">
              Manage certified legal translations, monitor sworn ATA linguist workflows, and approve official filings.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button asChild size="lg" className="rounded-xl font-bold bg-brand-500 hover:bg-brand-600 text-white gap-2 shadow-sm">
              <Link href="/dashboard/request">
                <PlusCircle className="w-4 h-4" />
                Start Translation Request
              </Link>
            </Button>
          </div>
        </div>

        {/* 4 Summary KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5 rounded-2xl border border-border bg-surface-raised space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-text-muted">
              <span>Active Orders</span>
              <FileText className="w-4 h-4 text-brand-500" />
            </div>
            <p className="text-3xl font-black font-mono text-brand-ink">
              {overviewMetrics.activeCount || 3}
            </p>
            <p className="text-[11px] text-text-muted font-mono">
              {overviewMetrics.inProgressCount || 1} in translation / QA
            </p>
          </Card>

          <Card className="p-5 rounded-2xl border border-status-warning/30 bg-status-warning-bg/40 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-amber-800">
              <span>Awaiting Your Action</span>
              <AlertCircle className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-3xl font-black font-mono text-amber-900">
              {overviewMetrics.awaitingActionCount || 2}
            </p>
            <p className="text-[11px] text-amber-800 font-mono">
              Quotes &amp; review approvals pending
            </p>
          </Card>

          <Card className="p-5 rounded-2xl border border-border bg-surface-raised space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-text-muted">
              <span>Completed Deliveries</span>
              <CheckCircle2 className="w-4 h-4 text-status-success" />
            </div>
            <p className="text-3xl font-black font-mono text-brand-ink">
              {overviewMetrics.completedCount || 1}
            </p>
            <p className="text-[11px] text-text-muted font-mono">
              Archived in 256-Bit Vault
            </p>
          </Card>

          <Card className="p-5 rounded-2xl border border-border bg-surface-raised space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-text-muted">
              <span>Outstanding Invoices</span>
              <DollarSign className="w-4 h-4 text-brand-ink" />
            </div>
            <p className="text-3xl font-black font-mono text-brand-ink">
              ${Number(overviewMetrics.outstandingBalance || 144.7).toFixed(2)}
            </p>
            <p className="text-[11px] text-text-muted font-mono">
              {overviewMetrics.outstandingInvoicesCount || 1} pending invoice
            </p>
          </Card>
        </div>

        {/* Quick Actions Bar */}
        <div className="p-4 rounded-2xl border border-border bg-surface flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <span className="text-text-muted font-semibold uppercase tracking-wider pl-2">
            Quick Actions:
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild variant="outline" size="sm" className="rounded-xl gap-1.5 h-9">
              <Link href="/dashboard/request">
                <PlusCircle className="w-3.5 h-3.5 text-brand-500" />
                New Request
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="rounded-xl gap-1.5 h-9">
              <Link href="/dashboard/documents">
                <FolderLock className="w-3.5 h-3.5 text-brand-ink" />
                Upload Documents
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="rounded-xl gap-1.5 h-9">
              <Link href="/dashboard/request?mode=quote">
                <FileSpreadsheet className="w-3.5 h-3.5 text-status-success" />
                Request Custom Quote
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="rounded-xl gap-1.5 h-9">
              <Link href="/dashboard/billing">
                <DollarSign className="w-3.5 h-3.5 text-amber-600" />
                View Invoices
              </Link>
            </Button>
          </div>
        </div>

        {/* Action Required Callout Banner */}
        {actionRequiredOrders.length > 0 && (
          <div className="p-5 rounded-2xl border border-amber-200 bg-amber-50/70 space-y-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
              <h2 className="text-sm font-bold text-amber-950 font-mono">
                Action Required on {actionRequiredOrders.length} Order(s)
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {actionRequiredOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="p-3.5 rounded-xl border border-amber-200/80 bg-white flex items-center justify-between gap-4 shadow-sm"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-brand-ink">
                        {ord.publicCode}
                      </span>
                      <Badge variant="warning" className="text-[10px] font-mono">
                        {ord.status.replace(/_/g, " ")}
                      </Badge>
                    </div>
                    <p className="text-xs text-text-muted">
                      {ord.sourceLang} ? {ord.targetLangs?.join(", ")} ({ord.serviceType})
                    </p>
                  </div>
                  <Button asChild size="sm" className="rounded-xl font-bold bg-amber-600 hover:bg-amber-700 text-white h-8 text-xs shrink-0">
                    <Link href={`/dashboard/orders/${ord.publicCode}`}>
                      Review Now
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Orders Table Section */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-brand-ink">
                All Orders &amp; Workflows
              </h2>
              <p className="text-xs text-text-muted">
                Search and track active translation dossiers, legal affidavits, and certificates.
              </p>
            </div>

            {/* Filter Tabs & Search */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="text"
                  placeholder="Search code, language, matter..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 pl-9 pr-3 rounded-xl border border-border bg-surface text-xs text-text placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-brand-500 w-48 sm:w-64"
                />
              </div>

              <div className="flex items-center rounded-xl border border-border bg-surface p-0.5 text-xs font-mono">
                <button
                  onClick={() => setStatusFilter("ALL")}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    statusFilter === "ALL"
                      ? "bg-brand-500 text-white font-bold"
                      : "text-text-muted hover:text-brand-ink"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setStatusFilter("ACTION_REQUIRED")}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    statusFilter === "ACTION_REQUIRED"
                      ? "bg-brand-500 text-white font-bold"
                      : "text-text-muted hover:text-brand-ink"
                  }`}
                >
                  Needs Action
                </button>
                <button
                  onClick={() => setStatusFilter("IN_TRANSLATION")}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    statusFilter === "IN_TRANSLATION"
                      ? "bg-brand-500 text-white font-bold"
                      : "text-text-muted hover:text-brand-ink"
                  }`}
                >
                  In Translation
                </button>
                <button
                  onClick={() => setStatusFilter("COMPLETED")}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    statusFilter === "COMPLETED"
                      ? "bg-brand-500 text-white font-bold"
                      : "text-text-muted hover:text-brand-ink"
                  }`}
                >
                  Completed
                </button>
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="rounded-2xl border border-border bg-surface-raised overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border bg-surface text-[11px] font-mono text-text-muted uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Order Code</th>
                    <th className="p-4">Matter / Subject</th>
                    <th className="p-4">Language Pair</th>
                    <th className="p-4">Service</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Delivery ETA</th>
                    <th className="p-4 text-right">Total</th>
                    <th className="p-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-xs font-mono text-text-muted">
                        No orders match the selected search or filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-surface/50 transition-colors">
                        <td className="p-4 font-mono font-bold text-brand-ink">
                          <Link
                            href={`/dashboard/orders/${ord.publicCode}`}
                            className="hover:underline flex items-center gap-1"
                          >
                            {ord.publicCode}
                          </Link>
                        </td>
                        <td className="p-4">
                          <p className="font-semibold text-text truncate max-w-xs">
                            {ord.matterNumber || "Standard Filing"}
                          </p>
                          <p className="text-[11px] text-text-muted">
                            {ord.uploadedFiles?.length || 1} file(s) ? {ord.pageCount} page(s)
                          </p>
                        </td>
                        <td className="p-4 font-mono">
                          {ord.sourceLang} ? {ord.targetLangs?.join(", ")}
                        </td>
                        <td className="p-4">
                          <span className="inline-block px-2 py-0.5 rounded bg-brand-50 text-brand-600 font-mono text-[10px] font-semibold border border-brand-100">
                            {ord.serviceType}
                          </span>
                        </td>
                        <td className="p-4">
                          <Badge
                            variant={
                              ord.status === "COMPLETED"
                                ? "success"
                                : ord.status === "CLIENT_REVIEW" || ord.status === "QUOTE_SENT"
                                ? "warning"
                                : "default"
                            }
                            className="text-[10px] font-mono uppercase"
                          >
                            {ord.status.replace(/_/g, " ")}
                          </Badge>
                        </td>
                        <td className="p-4 font-mono text-text-muted text-[11px]">
                          {ord.status === "COMPLETED"
                            ? "Delivered"
                            : new Date(ord.promisedAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                        </td>
                        <td className="p-4 text-right font-mono font-bold text-brand-ink">
                          ${ord.total.toFixed(2)}
                        </td>
                        <td className="p-4 text-center">
                          <Button asChild variant="outline" size="sm" className="rounded-lg h-7 px-2.5 text-[11px] gap-1">
                            <Link href={`/dashboard/orders/${ord.publicCode}`}>
                              <Eye className="w-3 h-3 text-text-muted" />
                              View
                            </Link>
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Security & Regulatory Compliance Footer Banner */}
        <div className="p-5 rounded-2xl border border-brand-100 bg-surface flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-mono text-text-muted">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-brand-500 shrink-0" />
            <span>USCIS 8 CFR 103.2 Guaranteed Acceptance ? ATA Corporate Member ? AES-256 Storage</span>
          </div>
          <Link href="/help" className="text-brand-500 hover:underline flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5" />
            Translation Compliance Guide
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
