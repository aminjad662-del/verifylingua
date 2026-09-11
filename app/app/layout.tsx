import * as React from "react";
import { ClientAppNav } from "@/components/client/ClientAppNav";

export const metadata = {
  title: "Client Workspace | VerifyLingua",
  description: "Enterprise layout-preserving document translation, project tracking, and verification.",
};

export default function ClientAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface-raised flex text-text">
      {/* Client Sidebar */}
      <ClientAppNav />

      {/* Main Content Surface */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Workspace Top Header Bar */}
        <header className="h-16 border-b border-border bg-surface px-8 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-text-muted">WORKSPACE /</span>
            <span className="text-xs font-bold font-mono text-text uppercase tracking-wider">
              Legal & Enterprise Document Translation
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Pipeline: 100% Operational</span>
            </div>
          </div>
        </header>

        {/* Page Canvas */}
        <div className="p-8 max-w-7xl w-full mx-auto flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
