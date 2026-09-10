"use client";

import * as React from "react";
import Link from "next/link";
import { DashboardNav } from "@/components/layout/DashboardNav";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Clock,
  ArrowRight,
  Settings,
  Mail,
  Smartphone,
  ShieldCheck,
} from "lucide-react";

export default function ClientNotificationsPage() {
  const [notifications, setNotifications] = React.useState<any[]>([]);
  const [filter, setFilter] = React.useState<"ALL" | "UNREAD">("ALL");
  const [preferences, setPreferences] = React.useState({
    orderStatusEmail: true,
    quoteAlertEmail: true,
    deliverySms: true,
    marketingPromo: false,
  });

  React.useEffect(() => {
    fetch("/api/dashboard/notifications")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setNotifications(data.notifications || []);
      })
      .catch((err) => console.warn(err));
  }, []);

  const filteredNotifs = notifications.filter((n) => {
    if (filter === "UNREAD") return !n.read;
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-text">
      <DashboardNav />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-text-muted mb-1">
              <Bell className="w-3.5 h-3.5 text-brand-500" />
              <span>COMMUNICATION &amp; EVENT DISPATCH</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-brand-ink tracking-tight">
              Notification &amp; Alert Center
            </h1>
            <p className="text-xs sm:text-sm text-text-muted mt-0.5">
              Real-time audit alerts for quote releases, delivery publications, and revision progress.
            </p>
          </div>

          <div className="flex items-center rounded-xl border border-border bg-surface p-0.5 text-xs font-mono">
            <button
              onClick={() => setFilter("ALL")}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filter === "ALL" ? "bg-brand-500 text-white font-bold" : "text-text-muted hover:text-brand-ink"
              }`}
            >
              All Alerts
            </button>
            <button
              onClick={() => setFilter("UNREAD")}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filter === "UNREAD" ? "bg-brand-500 text-white font-bold" : "text-text-muted hover:text-brand-ink"
              }`}
            >
              Unread
            </button>
          </div>
        </div>

        {/* Notifications Feed */}
        <div className="space-y-3">
          {filteredNotifs.length === 0 ? (
            <div className="p-8 rounded-2xl border border-border bg-surface text-center text-xs font-mono text-text-muted">
              You are completely caught up! No notifications to display.
            </div>
          ) : (
            filteredNotifs.map((n) => (
              <div
                key={n.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  !n.read
                    ? "border-brand-500/40 bg-brand-50/15 shadow-sm"
                    : "border-border bg-surface-raised"
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                    n.type === "DELIVERY"
                      ? "bg-status-success/10 text-status-success"
                      : n.type === "QUOTE"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-brand-50 text-brand-500"
                  }`}>
                    {n.type === "DELIVERY" ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : n.type === "QUOTE" ? (
                      <Clock className="w-4 h-4" />
                    ) : (
                      <FileCheck className="w-4 h-4" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-brand-ink">{n.title}</span>
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-surface border border-border text-text-muted">
                        {n.orderCode}
                      </span>
                    </div>
                    <p className="text-xs text-text-muted leading-relaxed">{n.message}</p>
                    <span className="text-[10px] font-mono text-text-muted block">
                      {new Date(n.createdAt).toLocaleString([], {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <Button asChild size="sm" className="rounded-xl font-bold bg-brand-500 hover:bg-brand-600 text-white h-8 text-xs gap-1">
                    <Link href={`/dashboard/orders/${n.orderCode}`}>
                      Inspect
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Notification Preferences Settings */}
        <div className="pt-6 border-t border-border space-y-4">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-brand-ink" />
            <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-brand-ink">
              Notification Channel Preferences
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-5 rounded-2xl border border-border bg-surface-raised space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-brand-ink flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-brand-500" />
                    Order Status &amp; Milestone Emails
                  </p>
                  <p className="text-[11px] text-text-muted">
                    Receive email receipts, assignment confirmations, and QA approvals.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.orderStatusEmail}
                  onChange={(e) => setPreferences({ ...preferences, orderStatusEmail: e.target.checked })}
                  className="w-4 h-4 text-brand-500 rounded"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-brand-ink flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-amber-600" />
                    Quote Availability &amp; Expiration Alerts
                  </p>
                  <p className="text-[11px] text-text-muted">
                    Alert when formal quotes are ready or within 24 hours of expiration.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.quoteAlertEmail}
                  onChange={(e) => setPreferences({ ...preferences, quoteAlertEmail: e.target.checked })}
                  className="w-4 h-4 text-brand-500 rounded"
                />
              </div>
            </Card>

            <Card className="p-5 rounded-2xl border border-border bg-surface-raised space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-brand-ink flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-status-success" />
                    SMS / Mobile Push on Final Delivery
                  </p>
                  <p className="text-[11px] text-text-muted">
                    Instant text message with direct secure certificate download link.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.deliverySms}
                  onChange={(e) => setPreferences({ ...preferences, deliverySms: e.target.checked })}
                  className="w-4 h-4 text-brand-500 rounded"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-brand-ink flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-text-muted" />
                    Promotional &amp; Platform Updates
                  </p>
                  <p className="text-[11px] text-text-muted">
                    Quarterly product improvements and regulatory rule changes.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.marketingPromo}
                  onChange={(e) => setPreferences({ ...preferences, marketingPromo: e.target.checked })}
                  className="w-4 h-4 text-brand-500 rounded"
                />
              </div>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
