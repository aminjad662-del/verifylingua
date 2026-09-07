"use client";

import * as React from "react";
import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Truck,
  Printer,
  PackageCheck,
  Clock,
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  MapPin,
  Stamp,
  Barcode,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ShippingItem {
  id: string;
  publicCode: string;
  clientName: string;
  carrier: string;
  tier: string;
  address: string;
  status: "PENDING_PRINT" | "DISPATCHED";
  pageCount: number;
  embossedSealRequired: boolean;
  orderedAt: string;
  trackingNumber: string | null;
}

function ShippingDispatchContent() {
  const [queue, setQueue] = React.useState<ShippingItem[]>([]);
  const [metrics, setMetrics] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [dispatchingCode, setDispatchingCode] = React.useState<string | null>(null);

  const loadQueue = React.useCallback(async () => {
    try {
      const res = await fetch("/api/shipping/fulfill");
      const data = await res.json();
      if (data.success) {
        setQueue(data.queue);
        setMetrics(data.metrics);
      }
    } catch (err) {
      console.error("Error loading shipping queue", err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  const handleDispatch = async (publicCode: string, carrier: string) => {
    setDispatchingCode(publicCode);
    try {
      const res = await fetch("/api/shipping/fulfill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicCode, carrier }),
      });
      const data = await res.json();
      if (data.success) {
        setQueue((prev) =>
          prev.map((item) =>
            item.publicCode === publicCode
              ? { ...item, status: "DISPATCHED", trackingNumber: data.trackingNumber }
              : item
          )
        );
      }
    } catch (err) {
      console.error("Dispatch error", err);
    } finally {
      setDispatchingCode(null);
    }
  };

  const filtered = queue.filter(
    (item) =>
      item.publicCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-canvas flex flex-col selection:bg-brand-100 selection:text-brand-ink">
      {/* Top Header */}
      <header className="bg-surface-raised border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <Link
                  href="/admin/queue"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-surface border border-border text-brand-ink hover:bg-brand-50 hover:border-brand-300 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Admin Queue</span>
                </Link>
                <Badge variant="outline" className="text-xs font-mono uppercase bg-brand-50 text-brand-700 border-brand-200">
                  Physical Mail Fulfillment
                </Badge>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-ink tracking-tight font-display">
                Physical Print &amp; Wet-Ink Dispatch Center
              </h1>
              <p className="text-xs sm:text-sm text-text-muted max-w-3xl">
                Manage high-security paper translation print runs, consular raised seals, and USPS/FedEx barcode label generation.
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* KPI Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-5 rounded-2xl bg-surface-raised border border-border space-y-2">
            <span className="text-[11px] font-mono text-text-muted uppercase font-bold">
              Pending Print &amp; Embossing
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-extrabold text-brand-ink font-display">
                {metrics?.pendingPrint || 2}
              </span>
              <Badge variant="outline" className="text-[10px] font-mono bg-brand-50 text-brand-700 border-brand-200">
                Awaiting Dispatch
              </Badge>
            </div>
          </Card>

          <Card className="p-5 rounded-2xl bg-surface-raised border border-border space-y-2">
            <span className="text-[11px] font-mono text-text-muted uppercase font-bold">
              Dispatched Today
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-extrabold text-status-success font-display">
                {metrics?.dispatchedToday || 14} Packets
              </span>
              <span className="text-xs text-status-success font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>On Schedule</span>
              </span>
            </div>
          </Card>

          <Card className="p-5 rounded-2xl bg-surface-raised border border-border space-y-2">
            <span className="text-[11px] font-mono text-text-muted uppercase font-bold">
              Average Print Turnaround
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-extrabold text-brand-ink font-display">
                {metrics?.avgFulfillmentHours || 1.6}h
              </span>
              <span className="text-xs text-text-muted flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-brand-500" />
                <span>USPS Pickup 4:00 PM</span>
              </span>
            </div>
          </Card>
        </div>

        {/* Search Bar */}
        <Card className="p-4 rounded-2xl bg-surface-raised border border-border">
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <Input
              placeholder="Filter by public code, client name, or address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 text-xs rounded-xl bg-surface border-border"
            />
          </div>
        </Card>

        {/* Physical Dispatch Table */}
        <Card className="rounded-[24px] bg-surface-raised border border-border overflow-hidden shadow-xs">
          <div className="p-5 border-b border-border">
            <h3 className="text-sm font-bold text-brand-ink font-display flex items-center gap-2">
              <Truck className="w-4 h-4 text-brand-500" />
              <span>Hard-Copy Dispatch Queue</span>
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border bg-surface text-text-muted font-mono uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-5">Order Code</th>
                  <th className="py-3 px-5">Client &amp; Verified Delivery Address</th>
                  <th className="py-3 px-5">Carrier &amp; Tier</th>
                  <th className="py-3 px-5 text-center">Security Seal</th>
                  <th className="py-3 px-5 text-center">Status</th>
                  <th className="py-3 px-5 text-right">Dispatch Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-surface/60 transition-colors">
                    <td className="py-4 px-5 font-mono font-bold text-brand-ink">
                      {item.publicCode}
                    </td>

                    <td className="py-4 px-5 max-w-xs">
                      <div className="font-bold text-brand-ink">{item.clientName}</div>
                      <div className="flex items-start gap-1 text-[11px] text-text-muted mt-0.5">
                        <MapPin className="w-3 h-3 shrink-0 mt-0.5 text-brand-500" />
                        <span className="font-mono">{item.address}</span>
                      </div>
                    </td>

                    <td className="py-4 px-5">
                      <Badge variant="outline" className="font-sans text-[11px] bg-surface border-border">
                        {item.tier}
                      </Badge>
                      {item.trackingNumber && (
                        <div className="font-mono text-[10px] text-brand-500 font-bold mt-1">
                          Track: {item.trackingNumber}
                        </div>
                      )}
                    </td>

                    <td className="py-4 px-5 text-center">
                      {item.embossedSealRequired ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-200 font-bold">
                          <Stamp className="w-3 h-3" />
                          <span>Embossed Seal</span>
                        </span>
                      ) : (
                        <span className="text-text-muted text-[11px] font-mono">Digital Only</span>
                      )}
                    </td>

                    <td className="py-4 px-5 text-center">
                      <Badge
                        className={cn(
                          "text-[10px] font-mono uppercase",
                          item.status === "DISPATCHED"
                            ? "bg-status-success-bg text-status-success border-status-success/30"
                            : "bg-brand-50 text-brand-700 border-brand-200"
                        )}
                      >
                        {item.status.replace("_", " ")}
                      </Badge>
                    </td>

                    <td className="py-4 px-5 text-right">
                      {item.status === "DISPATCHED" ? (
                        <span className="text-xs text-status-success font-semibold flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Dispatched</span>
                        </span>
                      ) : (
                        <Button
                          size="sm"
                          disabled={dispatchingCode === item.publicCode}
                          onClick={() => handleDispatch(item.publicCode, item.carrier)}
                          className="h-8 px-3 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-[11px] font-semibold gap-1.5 shadow-xs"
                        >
                          <Barcode className="w-3.5 h-3.5" />
                          <span>{dispatchingCode === item.publicCode ? "Printing..." : "Generate Label"}</span>
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </main>
    </div>
  );
}

export default function ShippingDispatchPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-text-muted">Loading Shipping Center...</div>}>
      <ShippingDispatchContent />
    </Suspense>
  );
}
