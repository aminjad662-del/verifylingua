import * as React from "react";
import { AdminNav } from "@/components/admin/AdminNav";

export const metadata = {
  title: "Admin Executive Console | VerifyLingua",
  description: "Executive operational telemetry, ATA linguist throughput, queue management, and system health.",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface-raised flex flex-col text-text">
      {/* Admin Top Navigation */}
      <AdminNav />

      {/* Admin Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8">
        {children}
      </main>
    </div>
  );
}
