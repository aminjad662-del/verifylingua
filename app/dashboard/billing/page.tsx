"use client";

import * as React from "react";
import Link from "next/link";
import { DashboardNav } from "@/components/layout/DashboardNav";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  CreditCard,
  FileText,
  Download,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Printer,
  Building2,
  Plus,
} from "lucide-react";

export default function ClientBillingPage() {
  const [billingData, setBillingData] = React.useState<any>({
    metrics: { totalSpent: "409.30", outstandingBalance: "144.70", paidCount: 4 },
    invoices: [],
    quotes: [],
  });
  const [loading, setLoading] = React.useState(true);
  const [selectedInvoice, setSelectedInvoice] = React.useState<any | null>(null);

  React.useEffect(() => {
    fetch("/api/dashboard/billing")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setBillingData(data);
      })
      .catch((err) => console.warn(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-text">
      <DashboardNav />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-text-muted mb-1">
              <CreditCard className="w-3.5 h-3.5 text-brand-500" />
              <span>FINANCIAL MANAGEMENT &amp; INVOICING</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-brand-ink tracking-tight">
              Billing, Invoices &amp; Formal Quotes
            </h1>
            <p className="text-xs sm:text-sm text-text-muted mt-0.5">
              Review itemized invoices, download official receipts, and approve pending formal quotes.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button asChild size="sm" className="rounded-xl font-bold bg-brand-500 hover:bg-brand-600 text-white gap-2">
              <Link href="/dashboard/request">
                <Plus className="w-4 h-4" />
                New Translation Request
              </Link>
            </Button>
          </div>
        </div>

        {/* 3 Metric Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-5 rounded-2xl border border-border bg-surface-raised space-y-2">
            <span className="text-xs font-mono text-text-muted">Total Translation Investment</span>
            <p className="text-3xl font-black font-mono text-brand-ink">
              ${billingData.metrics?.totalSpent || "409.30"}
            </p>
            <p className="text-[11px] font-mono text-text-muted">
              {billingData.metrics?.paidCount || 4} settled invoices
            </p>
          </Card>

          <Card className="p-5 rounded-2xl border border-status-warning/30 bg-status-warning-bg/40 space-y-2">
            <span className="text-xs font-mono text-amber-800">Outstanding Balance</span>
            <p className="text-3xl font-black font-mono text-amber-900">
              ${billingData.metrics?.outstandingBalance || "144.70"}
            </p>
            <p className="text-[11px] font-mono text-amber-800">
              Awaiting client approval / payment
            </p>
          </Card>

          <Card className="p-5 rounded-2xl border border-border bg-surface-raised space-y-2">
            <span className="text-xs font-mono text-text-muted">Primary Payment Method</span>
            <div className="flex items-center gap-2 pt-1">
              <CreditCard className="w-5 h-5 text-brand-ink" />
              <span className="text-sm font-mono font-bold text-brand-ink">Visa ending in 4242</span>
            </div>
            <p className="text-[11px] font-mono text-text-muted">
              Expires 12/2028 ? Stripe Vault Protected
            </p>
          </Card>
        </div>

        {/* Pending Quotes Section */}
        {billingData.quotes?.filter((q: any) => q.status === "SENT").length > 0 && (
          <div className="p-6 rounded-3xl border border-amber-200 bg-amber-50/60 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold font-mono text-amber-950 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                Pending Formal Quotes Requiring Approval
              </h2>
              <span className="text-[11px] font-mono text-amber-800">
                Guaranteed rates valid for 7 calendar days
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {billingData.quotes
                ?.filter((q: any) => q.status === "SENT")
                .map((q: any) => (
                  <div
                    key={q.id}
                    className="p-4 rounded-2xl border border-amber-200 bg-white space-y-3 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-sm text-brand-ink">
                        Order {q.orderCode}
                      </span>
                      <span className="font-mono font-black text-lg text-brand-ink">
                        ${q.totalAmount?.toFixed(2)} USD
                      </span>
                    </div>

                    <p className="text-xs text-text-muted">
                      {q.serviceType} ? Includes certification affidavit &amp; notary jurat.
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-amber-100 text-[11px] font-mono">
                      <span className="text-text-muted">
                        Expires: {new Date(q.expiresAt).toLocaleDateString()}
                      </span>
                      <Button asChild size="sm" className="rounded-xl font-bold bg-amber-600 hover:bg-amber-700 text-white h-8 text-xs gap-1">
                        <Link href={`/dashboard/orders/${q.orderCode}`}>
                          Review &amp; Authorize
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Invoices Table Section */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold text-brand-ink">
                Invoices &amp; Tax Receipts
              </h2>
              <p className="text-xs text-text-muted">
                Download PDF invoices, review transaction timestamps, and print business receipts.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-surface-raised overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border bg-surface text-[11px] font-mono text-text-muted uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Invoice #</th>
                    <th className="p-4">Order Reference</th>
                    <th className="p-4">Issue Date</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Amount</th>
                    <th className="p-4 text-center">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {billingData.invoices?.map((inv: any) => (
                    <tr key={inv.id} className="hover:bg-surface/50 transition-colors">
                      <td className="p-4 font-mono font-bold text-brand-ink">
                        {inv.invoiceNumber}
                      </td>
                      <td className="p-4 font-mono">
                        <Link href={`/dashboard/orders/${inv.orderCode}`} className="text-brand-500 hover:underline">
                          {inv.orderCode}
                        </Link>
                      </td>
                      <td className="p-4 font-mono text-text-muted">
                        {new Date(inv.issuedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="p-4">
                        <Badge
                          variant={inv.status === "PAID" ? "success" : "warning"}
                          className="text-[10px] font-mono"
                        >
                          {inv.status}
                        </Badge>
                      </td>
                      <td className="p-4 text-right font-mono font-bold text-brand-ink">
                        ${inv.amount?.toFixed(2)} USD
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => setSelectedInvoice(inv)}
                          className="text-xs font-mono text-brand-500 hover:text-brand-600 inline-flex items-center gap-1 hover:underline"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          Print / View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Organization Billing & Tax Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 rounded-2xl border border-border bg-surface-raised space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-text-muted flex items-center gap-2">
              <Building2 className="w-4 h-4 text-brand-500" />
              Invoicing &amp; Tax Entity Details
            </h3>
            <div className="space-y-1 text-xs text-text">
              <p className="font-bold text-brand-ink">Apex Immigration Law Group, PLLC</p>
              <p className="text-text-muted">Tax ID / EIN: XX-XXX8921</p>
              <p className="text-text-muted">Invoicing Email: accounting@lawdesk.org</p>
              <p className="text-text-muted">Address: 450 Lexington Avenue, Suite 1400, New York, NY 10017</p>
            </div>
          </Card>

          <Card className="p-6 rounded-2xl border border-border bg-surface-raised space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-text-muted flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-status-success" />
              Organizational Billing Controls
            </h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Only users with the <strong className="text-brand-ink">Owner</strong> or <strong className="text-brand-ink">Billing Manager</strong> role may approve invoices over $500.00 USD. Team members in the <strong className="text-brand-ink">Requester</strong> tier may submit documents but cannot incur charges without review.
            </p>
          </Card>
        </div>

        {/* INVOICE MODAL */}
        {selectedInvoice && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="max-w-lg w-full bg-surface-raised rounded-3xl border border-border p-6 space-y-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-brand-500 text-white flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-mono font-bold text-sm text-brand-ink">
                      VERIFYLINGUA INVOICE
                    </h3>
                    <p className="text-[10px] font-mono text-text-muted">
                      {selectedInvoice.invoiceNumber}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="text-text-muted hover:text-brand-ink font-mono text-xs p-1"
                >
                  ?
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-2 text-text-muted">
                  <div>
                    <span>Billed To:</span>
                    <p className="font-bold text-brand-ink mt-0.5">Apex Immigration Law Group</p>
                    <p>accounting@lawdesk.org</p>
                  </div>
                  <div className="text-right">
                    <span>Order Code:</span>
                    <p className="font-mono font-bold text-brand-ink mt-0.5">{selectedInvoice.orderCode}</p>
                    <p>Status: <strong className="text-status-success">{selectedInvoice.status}</strong></p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-border bg-surface space-y-2">
                  <div className="flex justify-between font-mono">
                    <span>Certified Legal Document Translation</span>
                    <span className="font-bold">${selectedInvoice.amount?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-mono text-text-muted text-[11px]">
                    <span>Sworn 8 CFR 103.2 Affidavit &amp; QR Seal</span>
                    <span>$0.00</span>
                  </div>
                  <div className="pt-2 border-t border-border flex justify-between font-mono font-black text-sm text-brand-ink">
                    <span>Total Amount Paid</span>
                    <span>${selectedInvoice.amount?.toFixed(2)} USD</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <Button
                  onClick={() => window.print()}
                  variant="outline"
                  size="sm"
                  className="rounded-xl font-bold gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Receipt
                </Button>
                <Button
                  onClick={() => setSelectedInvoice(null)}
                  size="sm"
                  className="rounded-xl font-bold bg-brand-500 hover:bg-brand-600 text-white"
                >
                  Done
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
