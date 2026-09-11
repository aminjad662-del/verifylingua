import * as React from "react";
import { FileSearch, Search, ShieldCheck } from "lucide-react";

export default function AdminAuditLogPage() {
  const auditEvents = [
    { id: "evt_1091", timestamp: "2026-09-11 18:24:12 UTC", actor: "alex@apexlegal.com", action: "JOB_UPLOADED", resource: "doc_colombian_birth_cert.pdf", ip: "192.168.1.104", outcome: "SUCCESS" },
    { id: "evt_1090", timestamp: "2026-09-11 18:02:44 UTC", actor: "SYSTEM (Inngest Worker #4)", action: "TRANSLATION_COMPLETED", resource: "job_1789145180898", ip: "internal", outcome: "SUCCESS" },
    { id: "evt_1089", timestamp: "2026-09-11 17:45:10 UTC", actor: "maria.r@verifylingua.com", action: "CERTIFICATE_ISSUED", resource: "VL-CERT-8921", ip: "10.0.4.12", outcome: "SUCCESS" },
    { id: "evt_1088", timestamp: "2026-09-11 16:30:00 UTC", actor: "unknown_client", action: "ADMIN_ROUTE_ATTEMPT", resource: "/admin/jobs", ip: "185.220.101.5", outcome: "DENIED (307)" },
    { id: "evt_1087", timestamp: "2026-09-11 15:12:33 UTC", actor: "SYSTEM (Cron Service)", action: "RETENTION_POLICY_RUN", resource: "Purged 0 expired files", ip: "internal", outcome: "SUCCESS" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-2xl bg-surface border border-border">
        <div>
          <div className="flex items-center gap-2">
            <FileSearch className="w-5 h-5 text-brand-500" />
            <h1 className="text-xl font-extrabold tracking-tight text-text">
              Immutable Platform Security Audit Trail
            </h1>
          </div>
          <p className="text-xs text-text-muted mt-1">
            Tamper-evident logs of authentication events, administrative mutations, and document lifecycle operations.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-raised border border-border text-xs font-mono text-emerald-600">
          <ShieldCheck className="w-4 h-4" />
          <span>SOC-2 Type II Compliant</span>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-xl border border-border bg-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b border-border bg-surface-raised/50 text-[11px] text-text-muted uppercase">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Target Resource</th>
                <th className="py-3 px-4">IP Origin</th>
                <th className="py-3 px-4 text-right">Outcome</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {auditEvents.map((evt) => (
                <tr key={evt.id} className="hover:bg-surface-raised/50 transition-colors">
                  <td className="py-3.5 px-4 text-text-muted">{evt.timestamp}</td>
                  <td className="py-3.5 px-4 font-bold text-text">{evt.actor}</td>
                  <td className="py-3.5 px-4 font-bold text-brand-600">{evt.action}</td>
                  <td className="py-3.5 px-4 text-text-muted truncate max-w-xs">{evt.resource}</td>
                  <td className="py-3.5 px-4 text-text-muted">{evt.ip}</td>
                  <td className="py-3.5 px-4 text-right">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        evt.outcome.includes("SUCCESS")
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-rose-50 text-rose-700 border border-rose-200"
                      }`}
                    >
                      {evt.outcome}
                    </span>
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
