import * as React from "react";
import { CreditCard, DollarSign, TrendingUp, ShieldCheck, Download, ArrowUpRight } from "lucide-react";

export default function AdminBillingPage() {
  const transactions = [
    { id: "tx_10921", client: "Apex Immigration Law Group", plan: "Enterprise Law (Annual)", amount: "$4,800.00", status: "PAID", date: "2026-09-01" },
    { id: "tx_10920", client: "Morales & Partners LLC", plan: "Pro Tier (Monthly)", amount: "$99.00", status: "PAID", date: "2026-09-02" },
    { id: "tx_10919", client: "Alejandro Garcia", plan: "Certified Legal Translation (2 pages)", amount: "$49.90", status: "PAID", date: "2026-09-03" },
    { id: "tx_10918", client: "Global Talent Mobility", plan: "Business Tier (Monthly)", amount: "$249.00", status: "PAID", date: "2026-09-04" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-2xl bg-surface border border-border">
        <div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-brand-500" />
            <h1 className="text-xl font-extrabold tracking-tight text-text">
              Platform Financial Telemetry & Billing
            </h1>
          </div>
          <p className="text-xs text-text-muted mt-1">
            Revenue recognition, Stripe subscription management, volume invoicing, and refund auditing.
          </p>
        </div>

        <button className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-all shadow-sm">
          <span>Stripe Executive Portal</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Financial KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono">
        <div className="p-4 rounded-xl bg-surface border border-border">
          <span className="text-[10px] text-text-muted uppercase">Gross MRR</span>
          <p className="text-2xl font-extrabold text-text mt-1">$48,250</p>
        </div>
        <div className="p-4 rounded-xl bg-surface border border-border">
          <span className="text-[10px] text-emerald-600 uppercase">Paid Seats</span>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">184</p>
        </div>
        <div className="p-4 rounded-xl bg-surface border border-border">
          <span className="text-[10px] text-brand-600 uppercase">Avg Contract Value</span>
          <p className="text-2xl font-extrabold text-brand-600 mt-1">$262.22</p>
        </div>
        <div className="p-4 rounded-xl bg-surface border border-border">
          <span className="text-[10px] text-text-muted uppercase">Refund Rate</span>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">0.00%</p>
        </div>
      </div>

      {/* Transaction Log */}
      <div className="rounded-xl border border-border bg-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-surface-raised/50 font-mono text-[11px] text-text-muted uppercase">
                <th className="py-3 px-4">Transaction ID</th>
                <th className="py-3 px-4">Client / Tenant</th>
                <th className="py-3 px-4">Contract / SKU</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-mono">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-surface-raised/50 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-text">{tx.id}</td>
                  <td className="py-3.5 px-4 font-sans font-bold text-text">{tx.client}</td>
                  <td className="py-3.5 px-4 text-text-muted">{tx.plan}</td>
                  <td className="py-3.5 px-4 font-bold text-text">{tx.amount}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {tx.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-text-muted">{tx.date}</td>
                  <td className="py-3.5 px-4 text-right">
                    <button className="text-xs font-bold text-brand-600 hover:underline">
                      Inspect
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
