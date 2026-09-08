"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  FileText,
  Search,
  Download,
  QrCode,
  Clock,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  SlidersHorizontal,
  CheckCircle2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MorphingActionButton } from "./MorphingActionButton";
import { showToast } from "./ToastNotification";
import { OrderDetail } from "./OrderDrawer";
import Link from "next/link";

interface OrderVaultProps {
  orders: OrderDetail[];
  onSelectOrder: (order: OrderDetail) => void;
}

type FilterTab = "ALL" | "ACTIVE" | "DELIVERED" | "PROOFING";

export function OrderVault({ orders, onSelectOrder }: OrderVaultProps) {
  const [activeTab, setActiveTab] = React.useState<FilterTab>("ALL");
  const [searchQuery, setSearchQuery] = React.useState("");

  const filteredOrders = React.useMemo(() => {
    return orders.filter((ord) => {
      // Tab filter
      if (activeTab === "ACTIVE" && ord.status === "DELIVERED") return false;
      if (activeTab === "DELIVERED" && ord.status !== "DELIVERED") return false;
      if (activeTab === "PROOFING" && ord.status !== "PROOFING" && ord.status !== "TRANSLATING") return false;

      // Search query
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        ord.publicCode.toLowerCase().includes(q) ||
        ord.documentName.toLowerCase().includes(q) ||
        ord.sourceLang.toLowerCase().includes(q) ||
        ord.targetLang.toLowerCase().includes(q) ||
        (ord.matterNumber && ord.matterNumber.toLowerCase().includes(q)) ||
        ord.translator.toLowerCase().includes(q)
      );
    });
  }, [orders, activeTab, searchQuery]);

  const tabs: { id: FilterTab; label: string; count: number }[] = [
    { id: "ALL", label: "All Orders", count: orders.length },
    { id: "ACTIVE", label: "Active Filings", count: orders.filter((o) => o.status !== "DELIVERED").length },
    { id: "DELIVERED", label: "Certified & Delivered", count: orders.filter((o) => o.status === "DELIVERED").length },
    { id: "PROOFING", label: "Needs Proofing", count: orders.filter((o) => o.status === "PROOFING" || o.status === "TRANSLATING").length },
  ];

  const handleDownloadReceipt = (code: string) => async () => {
    window.open(`/api/order/${code}/receipt`, "_blank");
    showToast({
      title: "Receipt Downloaded",
      description: `Itemized legal receipt for order ${code} generated.`,
      type: "success",
    });
  };

  const handleDownloadDeliverable = (verifyCode: string) => async () => {
    window.open(`/api/certificate/${verifyCode}/download`, "_blank");
    showToast({
      title: "Certified PDF Downloaded",
      description: "USCIS 8 CFR § 103.2 evidentiary packet streamed.",
      type: "success",
    });
  };

  return (
    <section aria-labelledby="vault-heading" className="space-y-6">
      {/* Vault Header & Filter Utility Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 id="vault-heading" className="text-xl sm:text-2xl font-black text-brand-ink tracking-tight font-display">
              Order Vault & Evidentiary Archive
            </h2>
            <span className="font-mono text-xs text-text-muted bg-surface px-2.5 py-0.5 rounded-full border border-border">
              {filteredOrders.length} {filteredOrders.length === 1 ? "Record" : "Records"}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-text-muted">
            Search your complete filing ledger, launch the Interactive Proofing Studio, and inspect sealed deliverables.
          </p>
        </div>

        {/* Search Input with ⌘K Badge */}
        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search code, document, or matter..."
            className="w-full h-10 pl-9 pr-12 text-xs rounded-xl bg-surface border border-border focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all placeholder:text-text-muted/60"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-mono text-text-muted bg-surface-raised border border-border rounded">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Filter Tabs with Shared Layout Animation (layoutId) */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-surface border border-border max-w-fit overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="relative px-4 py-2 text-xs font-bold rounded-xl transition-colors select-none text-text-muted hover:text-brand-ink whitespace-nowrap"
            >
              {isActive && (
                <motion.div
                  layoutId="activeVaultTab"
                  className="absolute inset-0 bg-neutral-950 text-white rounded-xl shadow-sm -z-0"
                  transition={{ type: "spring", stiffness: 450, damping: 30 }}
                />
              )}
              <span className={`relative z-10 flex items-center gap-1.5 ${isActive ? "text-white" : ""}`}>
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    isActive ? "bg-white/20 text-white" : "bg-surface-raised text-text-muted border border-border"
                  }`}
                >
                  {tab.count}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Order Cards Grid / List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredOrders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="p-12 text-center rounded-3xl bg-surface border border-border space-y-2"
            >
              <FileText className="w-8 h-8 text-text-muted mx-auto" />
              <p className="text-sm font-bold text-brand-ink">No evidentiary records found</p>
              <p className="text-xs text-text-muted">Try adjusting your search query or active filter tab.</p>
            </motion.div>
          ) : (
            filteredOrders.map((ord, idx) => {
              const isDelivered = ord.status === "DELIVERED";
              const isProofing = ord.status === "PROOFING" || ord.status === "TRANSLATING";

              return (
                <motion.div
                  key={ord.id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 28,
                    delay: idx * 0.04,
                  }}
                  className="group relative p-6 rounded-2xl bg-surface hover:bg-surface-raised border border-border hover:border-neutral-400 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="space-y-2.5 flex-1 cursor-pointer" onClick={() => onSelectOrder(ord)}>
                    {/* Top Badges */}
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="font-mono text-xs font-extrabold text-brand-ink bg-surface-raised px-2.5 py-0.5 rounded-lg border border-border">
                        {ord.publicCode}
                      </span>

                      <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border border-border bg-surface">
                        <span
                          className={`w-2 h-2 rounded-full inline-block ${
                            isDelivered ? "bg-status-success" : "bg-status-warning animate-pulse"
                          }`}
                        />
                        <span className={isDelivered ? "text-status-success" : "text-brand-ink"}>
                          {ord.statusLabel}
                        </span>
                      </div>

                      {ord.matterNumber && (
                        <span className="font-mono text-[11px] text-brand-500 font-bold bg-brand-50 px-2 py-0.5 rounded border border-brand-100">
                          {ord.matterNumber}
                        </span>
                      )}

                      <span className="text-xs text-text-muted font-mono">
                        {ord.sourceLang} → {ord.targetLang}
                      </span>
                    </div>

                    {/* Document Title */}
                    <h3 className="text-base font-extrabold text-brand-ink group-hover:text-brand-500 transition-colors flex items-center gap-2 font-display">
                      <span>{ord.documentName}</span>
                      <ChevronRight className="w-4 h-4 text-text-muted group-hover:translate-x-0.5 transition-transform" />
                    </h3>

                    {/* Metadata Strip */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-text-muted">
                      <span className="flex items-center gap-1.5 font-mono">
                        <Clock className="w-3.5 h-3.5 text-brand-500" />
                        <span>{isDelivered ? ord.promisedAt : `Promised by: ${ord.promisedAt}`}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-mono">
                        <ShieldCheck className="w-3.5 h-3.5 text-brand-500" />
                        <span>{ord.translator}</span>
                      </span>
                      <span>•</span>
                      <span className="font-mono font-bold text-brand-ink">${ord.total.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Actions Button Cluster */}
                  <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                    <MorphingActionButton
                      label="Download Receipt"
                      successLabel="Receipt Saved"
                      icon={<Download className="w-3.5 h-3.5" />}
                      onClick={handleDownloadReceipt(ord.publicCode)}
                      variant="outline"
                      size="sm"
                    />

                    {isProofing && (
                      <Button asChild size="sm" variant="outline" className="h-9 rounded-xl text-xs font-bold gap-1.5 border-border">
                        <Link href={`/order/${ord.publicCode}/proof`}>
                          <span>Proofing Studio</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </Button>
                    )}

                    {isDelivered ? (
                      <MorphingActionButton
                        label="Download PDF"
                        successLabel="PDF Saved"
                        icon={<Download className="w-3.5 h-3.5" />}
                        onClick={handleDownloadDeliverable(ord.verifyCode)}
                        variant="primary"
                        size="sm"
                      />
                    ) : (
                      <Button asChild size="sm" className="h-9 rounded-xl text-xs font-bold gap-1.5 bg-neutral-950 hover:bg-neutral-800 text-white">
                        <Link href={`/order/${ord.publicCode}`}>
                          <span>Live Tracker</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSelectOrder(ord)}
                      className="h-9 rounded-xl text-xs font-bold border-border"
                    >
                      Inspect
                    </Button>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
