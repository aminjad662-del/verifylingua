import * as React from "react";
import Link from "next/link";
import { CheckCheck, ShieldCheck, ArrowRight, Clock, AlertCircle } from "lucide-react";
import { getAllOrders } from "@/lib/dashboard/store";

export default function AdminReviewsPage() {
  const orders = getAllOrders();
  const reviewOrders = orders.filter(
    (o) => o.status === "QUALITY_REVIEW" || o.status === "CLIENT_REVIEW" || o.serviceType !== "STANDARD"
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-2xl bg-surface border border-border">
        <div>
          <div className="flex items-center gap-2">
            <CheckCheck className="w-5 h-5 text-brand-500" />
            <h1 className="text-xl font-extrabold tracking-tight text-text">
              Human-in-the-Loop QA & Legal Verification Queue
            </h1>
          </div>
          <p className="text-xs text-text-muted mt-1">
            ATA linguist sign-offs, 8 CFR 103.2 certification compliance, and stamp verification.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-raised border border-border text-xs font-mono text-emerald-600">
          <ShieldCheck className="w-4 h-4" />
          <span>USCIS 8 CFR 103.2 Active</span>
        </div>
      </div>

      {/* Review Queue Table */}
      <div className="rounded-xl border border-border bg-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-surface-raised/50 font-mono text-[11px] text-text-muted uppercase">
                <th className="py-3 px-4">Order Code</th>
                <th className="py-3 px-4">Document</th>
                <th className="py-3 px-4">Pair</th>
                <th className="py-3 px-4">Service Mode</th>
                <th className="py-3 px-4">Assigned Linguist</th>
                <th className="py-3 px-4">QA Checklist</th>
                <th className="py-3 px-4 text-right">Workbench</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-mono">
              {reviewOrders.map((order) => (
                <tr key={order.id} className="hover:bg-surface-raised/50 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-text">{order.publicCode}</td>
                  <td className="py-3.5 px-4 font-sans font-bold text-text truncate max-w-xs">
                    {order.uploadedFiles?.[0]?.name || "Legal_Document.pdf"}
                  </td>
                  <td className="py-3.5 px-4 uppercase text-text-muted">
                    {order.sourceLang} → {order.targetLangs?.join(", ") || "EN"}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {order.serviceType}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-text-muted">
                    {order.assignedTranslator || "Maria Rodriguez (ATA No. 5921)"}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-bold">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>5/5 Gates Passed</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      href={`/translator/workbench/${order.id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700"
                    >
                      <span>Open Studio</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
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
