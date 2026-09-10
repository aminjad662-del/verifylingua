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
  DollarSign,
  TrendingUp,
  Receipt,
  Download,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  FileSpreadsheet,
  RefreshCw,
  CreditCard,
  Building,
  RotateCcw,
} from "lucide-react";

interface InvoiceItem {
  id: string;
  orderCode: string;
  orderId: string;
  clientName: string;
  clientEmail: string;
  serviceType: string;
  sourceLang: string;
  targetLang: string;
  amount: number;
  status: "PAID" | "PENDING" | "OVERDUE" | "REFUNDED";
  issuedAt: string;
  paidAt?: string;
}

interface FinanceMetrics {
  totalRevenue: string;
  pendingReceivables: string;
  refundsTotal: string;
  grossMargin: string;
}

interface ServiceRevenue {
  service: string;
  revenue: number;
  count: number;
}

export default function AdminFinancePage() {
  const [metrics, setMetrics] = React.useState<FinanceMetrics>({
    totalRevenue: "0.00",
    pendingReceivables: "0.00",
    refundsTotal: "0.00",
    grossMargin: "94.2%",
  });
  const [invoices, setInvoices] = React.useState<InvoiceItem[]>([]);
  const [revenueByService, setRevenueByService] = React.useState<ServiceRevenue[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("ALL");
  const [feedback, setFeedback] = React.useState<string | null>(null);

  const fetchFinanceData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/finance");
      const data = await res.json();
      if (data.metrics) setMetrics(data.metrics);
      if (data.invoices) setInvoices(data.invoices);
      if (data.revenueByService) setRevenueByService(data.revenueByService);
    } catch (err) {
      console.error("Failed to load finance data", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchFinanceData();
  }, [fetchFinanceData]);

  const handleMarkPaid = async (invoiceId: string) => {
    try {
      const res = await fetch("/api/admin/finance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "markPaid", invoiceId }),
      });
      const data = await res.json();
      if (data.success) {
        setInvoices((prev) =>
          prev.map((i) => (i.id === invoiceId ? { ...i, status: "PAID" as any } : i))
        );
        setFeedback("Invoice marked as PAID. Accounts receivable updated.");
        setTimeout(() => setFeedback(null), 3000);
      }
    } catch (err) {
      console.error("Failed to mark invoice paid", err);
    }
  };

  const handleRefund = async (invoiceId: string) => {
    if (!confirm("Are you sure you want to issue a full refund for this transaction?")) return;
    try {
      const res = await fetch("/api/admin/finance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "refund", invoiceId }),
      });
      const data = await res.json();
      if (data.success) {
        setInvoices((prev) =>
          prev.map((i) => (i.id === invoiceId ? { ...i, status: "REFUNDED" as any } : i))
        );
        setFeedback("Refund issued. Transaction logged in compliance ledger.");
        setTimeout(() => setFeedback(null), 3000);
      }
    } catch (err) {
      console.error("Failed to issue refund", err);
    }
  };

  const handleExportCSV = () => {
    const headers = [
      "Invoice ID",
      "Order Code",
      "Client Name",
      "Email",
      "Service Tier",
      "Amount",
      "Status",
      "Issued Date",
    ];
    const rows = invoices.map((i) => [
      i.id,
      i.orderCode,
      i.clientName,
      i.clientEmail,
      i.serviceType,
      i.amount.toFixed(2),
      i.status,
      i.issuedAt,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `VerifyLingua_Finance_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredInvoices = invoices.filter((i) => {
    const matchesSearch =
      i.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.orderCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.clientEmail.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || i.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-canvas text-text flex flex-col">
      <AdminNav />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-ink border border-brand-500/20 mb-2">
              <Receipt className="w-3.5 h-3.5" />
              <span>Revenue Operations & Accounting Ledger</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text">
              Financial Ledger & Revenue Operations
            </h1>
            <p className="text-sm text-text-muted mt-1">
              Track settled merchant revenues, accounts receivable, service tier margins, and export QuickBooks reconciliation batches.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchFinanceData}
              className="border-border text-text hover:bg-surface-raised"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button
              size="sm"
              onClick={handleExportCSV}
              className="bg-brand-500 hover:bg-brand-600 text-white font-medium"
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Export QuickBooks CSV
            </Button>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className="p-4 rounded-lg bg-status-success/10 border border-status-success/30 text-status-success flex items-center gap-3 text-sm">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        {/* KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5 border-border bg-surface shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-text-muted uppercase tracking-wider">
                Settled Revenue
              </span>
              <DollarSign className="w-4 h-4 text-status-success" />
            </div>
            <p className="text-2xl font-bold tracking-tight mt-2 text-status-success">
              ${metrics.totalRevenue}
            </p>
            <p className="text-xs text-text-muted mt-1">Net deposits via Stripe & ACH</p>
          </Card>

          <Card className="p-5 border-border bg-surface shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-text-muted uppercase tracking-wider">
                Outstanding Receivables
              </span>
              <Clock className="w-4 h-4 text-status-warning" />
            </div>
            <p className="text-2xl font-bold tracking-tight mt-2 text-status-warning">
              ${metrics.pendingReceivables}
            </p>
            <p className="text-xs text-text-muted mt-1">Pending corporate Net-30 clearance</p>
          </Card>

          <Card className="p-5 border-border bg-surface shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-text-muted uppercase tracking-wider">
                Gross Platform Margin
              </span>
              <TrendingUp className="w-4 h-4 text-brand-ink" />
            </div>
            <p className="text-2xl font-bold tracking-tight mt-2 text-brand-ink">
              {metrics.grossMargin}
            </p>
            <p className="text-xs text-text-muted mt-1">Linguist COGS deducted</p>
          </Card>

          <Card className="p-5 border-border bg-surface shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-text-muted uppercase tracking-wider">
                Total Refund Volume
              </span>
              <RotateCcw className="w-4 h-4 text-text-muted" />
            </div>
            <p className="text-2xl font-bold tracking-tight mt-2 text-text">
              ${metrics.refundsTotal}
            </p>
            <p className="text-xs text-text-muted mt-1">Under 0.1% dispute rate</p>
          </Card>
        </div>

        {/* Revenue by Service Breakdown */}
        <Card className="p-6 border-border bg-surface shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h3 className="text-sm font-semibold text-text">Revenue Distribution by Service Tier</h3>
              <p className="text-xs text-text-muted mt-0.5">Product segment contribution to gross top-line</p>
            </div>
            <span className="text-xs font-semibold text-brand-ink">CY 2026</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {revenueByService.map((item) => (
              <div key={item.service} className="p-3.5 rounded-lg bg-surface-raised border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-text">{item.service}</span>
                  <span className="text-[11px] text-text-muted font-mono">{item.count} orders</span>
                </div>
                <p className="text-lg font-bold text-brand-ink font-mono">
                  ${item.revenue.toFixed(2)}
                </p>
                <div className="w-full bg-surface rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-brand-500 h-1.5 rounded-full"
                    style={{
                      width: `${Math.min(100, Math.max(10, (item.revenue / (parseFloat(metrics.totalRevenue) || 1)) * 100))}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Invoices Table */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search invoice, client, order code..."
                className="pl-9 h-9 text-sm"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-text-muted font-medium">Status:</span>
              {["ALL", "PAID", "PENDING", "REFUNDED"].map((status) => (
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

          <Card className="border-border bg-surface shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-surface-raised border-b border-border text-text-muted uppercase tracking-wider font-semibold">
                    <th className="p-3">Invoice / Order</th>
                    <th className="p-3">Client</th>
                    <th className="p-3">Service Tier</th>
                    <th className="p-3">Language Pair</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Issued Date</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-text-muted">
                        No financial records match the current filter.
                      </td>
                    </tr>
                  ) : (
                    filteredInvoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-surface-raised/60 transition-colors">
                        <td className="p-3">
                          <p className="font-mono font-bold text-text">{inv.id}</p>
                          <Link
                            href={`/admin/orders?search=${inv.orderCode}`}
                            className="font-mono text-[11px] text-brand-ink hover:underline"
                          >
                            {inv.orderCode}
                          </Link>
                        </td>
                        <td className="p-3">
                          <p className="font-semibold text-text">{inv.clientName}</p>
                          <p className="text-[11px] text-text-muted">{inv.clientEmail}</p>
                        </td>
                        <td className="p-3">
                          <Badge variant="outline" className="text-[10px]">
                            {inv.serviceType}
                          </Badge>
                        </td>
                        <td className="p-3 font-medium text-text">
                          {inv.sourceLang} → {inv.targetLang}
                        </td>
                        <td className="p-3 font-mono font-bold text-sm text-text">
                          ${inv.amount.toFixed(2)}
                        </td>
                        <td className="p-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                              inv.status === "PAID"
                                ? "bg-status-success/10 text-status-success"
                                : inv.status === "PENDING"
                                ? "bg-status-warning/10 text-status-warning"
                                : "bg-status-error/10 text-status-error"
                            }`}
                          >
                            {inv.status}
                          </span>
                        </td>
                        <td className="p-3 text-text-muted text-[11px]">
                          {new Date(inv.issuedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {inv.status === "PENDING" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleMarkPaid(inv.id)}
                                className="h-7 text-xs border-border text-status-success hover:bg-status-success/10"
                              >
                                Mark Paid
                              </Button>
                            )}
                            {inv.status === "PAID" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRefund(inv.id)}
                                className="h-7 text-xs border-border text-status-error hover:bg-status-error/10"
                              >
                                Refund
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
