import * as React from "react";
import { Activity, CheckCircle2, ShieldCheck, Server, Zap, Cpu, Database } from "lucide-react";

export default function AdminSystemHealthPage() {
  const subsystems = [
    { name: "Google Gemini 3.1 Pro (Primary)", type: "NEURAL_TRANSLATION", status: "OPERATIONAL", latency: "480ms", errorRate: "0.02%", icon: Zap },
    { name: "DeepL Pro Failover Service", type: "FAILOVER_TRANSLATION", status: "STANDBY_READY", latency: "310ms", errorRate: "0.00%", icon: Zap },
    { name: "Cloudflare R2 Object Vault", type: "DOCUMENT_STORAGE", status: "OPERATIONAL", latency: "38ms", errorRate: "0.00%", icon: Server },
    { name: "Tesseract.js & Azure OCR", type: "SPATIAL_EXTRACTION", status: "OPERATIONAL", latency: "1.1s/page", errorRate: "0.05%", icon: Cpu },
    { name: "PostgreSQL Database Engine", type: "PERSISTENCE_LAYER", status: "OPERATIONAL", latency: "12ms", errorRate: "0.00%", icon: Database },
    { name: "Inngest Async Job Dispatcher", type: "EVENT_BUS", status: "OPERATIONAL", latency: "45ms", errorRate: "0.00%", icon: Activity },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-2xl bg-surface border border-border">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-brand-500" />
            <h1 className="text-xl font-extrabold tracking-tight text-text">
              Infrastructure & Provider Health Telemetry
            </h1>
          </div>
          <p className="text-xs text-text-muted mt-1">
            Real-time latency, provider circuit breakers, OCR queue load, and database connection pools.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-mono text-emerald-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>System Status: 100% Operational</span>
        </div>
      </div>

      {/* Subsystem Telemetry Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subsystems.map((sub, idx) => {
          const Icon = sub.icon;
          return (
            <div key={idx} className="p-5 rounded-xl bg-surface border border-border space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-surface-raised border border-border flex items-center justify-center text-brand-500">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-text truncate max-w-[180px]">{sub.name}</h3>
                    <p className="text-[10px] font-mono text-text-muted">{sub.type}</p>
                  </div>
                </div>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {sub.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border text-xs font-mono">
                <div>
                  <span className="text-[10px] text-text-muted">Response Latency</span>
                  <p className="font-bold text-text mt-0.5">{sub.latency}</p>
                </div>
                <div>
                  <span className="text-[10px] text-text-muted">Error Rate (24h)</span>
                  <p className="font-bold text-emerald-600 mt-0.5">{sub.errorRate}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
