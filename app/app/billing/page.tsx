import * as React from "react";
import Link from "next/link";
import { CreditCard, CheckCircle2, ArrowUpRight, ShieldCheck, Download } from "lucide-react";

export default function BillingPage() {
  const invoices = [
    { id: "INV-2026-091", date: "Sep 01, 2026", amount: "$99.00", status: "PAID", plan: "Pro Tier (100 Pages/mo)" },
    { id: "INV-2026-081", date: "Aug 01, 2026", amount: "$99.00", status: "PAID", plan: "Pro Tier (100 Pages/mo)" },
    { id: "INV-2026-071", date: "Jul 01, 2026", amount: "$99.00", status: "PAID", plan: "Pro Tier (100 Pages/mo)" },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-2xl bg-surface border border-border">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-text">
            Billing & Subscriptions
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Manage your enterprise translation subscription, payment methods, and tax invoices.
          </p>
        </div>
        <button
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-all shadow-sm self-start sm:self-auto"
        >
          <span>Stripe Customer Portal</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Active Plan Overview */}
      <div className="p-6 rounded-2xl bg-surface border border-border space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <span className="text-[10px] font-mono uppercase text-brand-600 font-bold">Active Plan</span>
            <h2 className="text-lg font-extrabold text-text mt-0.5">Professional Law & Corporate Tier</h2>
            <p className="text-xs text-text-muted mt-0.5">Includes 100 automated pages/month + unlimited OCR triage</p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-mono font-extrabold text-text">$99</span>
            <span className="text-xs text-text-muted"> / month</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-surface-raised border border-border text-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CreditCard className="w-5 h-5 text-brand-500" />
            <div>
              <p className="font-bold text-text">Visa ending in 4242</p>
              <p className="text-[11px] font-mono text-text-muted">Expires 12/2028 • Default Payment Method</p>
            </div>
          </div>
          <button className="text-xs font-mono font-bold text-brand-600 hover:underline">
            Update Card
          </button>
        </div>
      </div>

      {/* Invoice History */}
      <div className="p-6 rounded-2xl bg-surface border border-border space-y-4">
        <h2 className="text-xs font-mono font-extrabold uppercase tracking-wider text-text">
          Invoice History
        </h2>

        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-surface-raised/50 font-mono text-[11px] text-text-muted uppercase">
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-mono">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-surface-raised/50 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-text">{inv.id}</td>
                  <td className="py-3.5 px-4 text-text-muted">{inv.date}</td>
                  <td className="py-3.5 px-4 font-sans text-text-muted">{inv.plan}</td>
                  <td className="py-3.5 px-4 font-bold text-text">{inv.amount}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:underline">
                      <Download className="w-3 h-3" />
                      <span>PDF</span>
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
