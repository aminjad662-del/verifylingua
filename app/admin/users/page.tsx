import * as React from "react";
import Link from "next/link";
import { Users, Search, Shield, UserCheck, MoreVertical, Plus } from "lucide-react";

export default function AdminUsersPage() {
  const users = [
    { id: "usr_01", name: "Alexander Vance", email: "alex@apexlegal.com", role: "ATTORNEY", accountType: "LAW_FIRM", jobsCount: 14, status: "ACTIVE", joined: "2026-08-12" },
    { id: "usr_02", name: "Maria Rodriguez", email: "maria.r@verifylingua.com", role: "TRANSLATOR_REVIEWER", accountType: "STAFF", jobsCount: 88, status: "ACTIVE", joined: "2026-07-01" },
    { id: "usr_03", name: "Johnathan Smith", email: "jsmith@corporate.org", role: "CUSTOMER", accountType: "INDIVIDUAL", jobsCount: 3, status: "ACTIVE", joined: "2026-09-02" },
    { id: "usr_04", name: "Elena Rostova", email: "elena@verifylingua.com", role: "OPERATIONS_MANAGER", accountType: "STAFF", jobsCount: 240, status: "ACTIVE", joined: "2026-06-15" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-2xl bg-surface border border-border">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-brand-500" />
            <h1 className="text-xl font-extrabold tracking-tight text-text">
              Platform User Directory & Role Governance
            </h1>
          </div>
          <p className="text-xs text-text-muted mt-1">
            Manage client accounts, assign internal administrative roles, and inspect activity logs.
          </p>
        </div>

        <button className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-all shadow-sm">
          <Plus className="w-4 h-4" />
          <span>Invite Member</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="rounded-xl border border-border bg-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-surface-raised/50 font-mono text-[11px] text-text-muted uppercase">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Account Type</th>
                <th className="py-3 px-4">Jobs / Orders</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Joined Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-mono">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-surface-raised/50 transition-colors">
                  <td className="py-3.5 px-4">
                    <div>
                      <p className="font-sans font-bold text-text">{u.name}</p>
                      <p className="text-[11px] text-text-muted">{u.email}</p>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        u.role.includes("ADMIN") || u.role.includes("MANAGER")
                          ? "bg-purple-50 text-purple-700 border border-purple-200"
                          : u.role.includes("TRANSLATOR")
                          ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                          : "bg-surface-raised text-text-muted border border-border"
                      }`}
                    >
                      {u.role.replace("_", " ")}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-text-muted">{u.accountType}</td>
                  <td className="py-3.5 px-4 font-bold text-text">{u.jobsCount}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {u.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-text-muted">{u.joined}</td>
                  <td className="py-3.5 px-4 text-right">
                    <button className="text-xs font-bold text-brand-600 hover:underline">
                      Edit Role
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
