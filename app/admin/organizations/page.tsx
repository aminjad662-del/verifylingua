import * as React from "react";
import { Building, Plus, ArrowRight, ShieldCheck } from "lucide-react";

export default function AdminOrganizationsPage() {
  const orgs = [
    { id: "org_01", name: "Apex Immigration Law Group", tier: "ENTERPRISE LAW", seats: 12, quota: 500, activeProjects: 8, status: "ACTIVE" },
    { id: "org_02", name: "Morales & Partners LLC", tier: "PRO WORKSPACE", seats: 5, quota: 200, activeProjects: 3, status: "ACTIVE" },
    { id: "org_03", name: "Global Talent Mobility Inc", tier: "ENTERPRISE", seats: 25, quota: 1000, activeProjects: 14, status: "ACTIVE" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-2xl bg-surface border border-border">
        <div>
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-brand-500" />
            <h1 className="text-xl font-extrabold tracking-tight text-text">
              Enterprise Organizations & Multi-Tenancy
            </h1>
          </div>
          <p className="text-xs text-text-muted mt-1">
            Manage corporate accounts, law firm matters, seat allocations, and custom quota agreements.
          </p>
        </div>

        <button className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-all shadow-sm">
          <Plus className="w-4 h-4" />
          <span>Provision Organization</span>
        </button>
      </div>

      {/* Organizations Table */}
      <div className="rounded-xl border border-border bg-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-surface-raised/50 font-mono text-[11px] text-text-muted uppercase">
                <th className="py-3 px-4">Organization Name</th>
                <th className="py-3 px-4">Contract Tier</th>
                <th className="py-3 px-4">Seats Allocated</th>
                <th className="py-3 px-4">Monthly Quota</th>
                <th className="py-3 px-4">Active Projects</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-mono">
              {orgs.map((org) => (
                <tr key={org.id} className="hover:bg-surface-raised/50 transition-colors">
                  <td className="py-3.5 px-4">
                    <div>
                      <p className="font-sans font-bold text-text">{org.name}</p>
                      <p className="text-[10px] text-text-muted">{org.id}</p>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-brand-50 text-brand-600 border border-brand-200">
                      {org.tier}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-text-muted">{org.seats} seats</td>
                  <td className="py-3.5 px-4 font-bold text-text">{org.quota} pages/mo</td>
                  <td className="py-3.5 px-4 text-brand-600 font-bold">{org.activeProjects}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {org.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button className="text-xs font-bold text-brand-600 hover:underline">
                      Manage Org
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
