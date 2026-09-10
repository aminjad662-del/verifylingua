"use client";

import * as React from "react";
import Link from "next/link";
import { AdminNav } from "@/components/admin/AdminNav";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Settings,
  ShieldCheck,
  Globe,
  Clock,
  Lock,
  Save,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sliders,
  Webhook,
  Database,
  Trash2,
} from "lucide-react";

interface LanguageConfig {
  code: string;
  name: string;
  active: boolean;
  requiresSpecialist: boolean;
}

interface ServiceConfig {
  id: string;
  name: string;
  baseRatePerPage: number;
  turnAroundHours: number;
  active: boolean;
  description: string;
}

export default function AdminSettingsPage() {
  const [languages, setLanguages] = React.useState<LanguageConfig[]>([
    { code: "es", name: "Spanish", active: true, requiresSpecialist: false },
    { code: "ar", name: "Arabic", active: true, requiresSpecialist: true },
    { code: "de", name: "German", active: true, requiresSpecialist: false },
    { code: "ja", name: "Japanese", active: true, requiresSpecialist: true },
    { code: "fr", name: "French", active: true, requiresSpecialist: false },
    { code: "pt", name: "Portuguese", active: true, requiresSpecialist: false },
    { code: "it", name: "Italian", active: true, requiresSpecialist: false },
    { code: "zh", name: "Chinese (Simplified)", active: true, requiresSpecialist: true },
    { code: "ru", name: "Russian", active: true, requiresSpecialist: true },
  ]);

  const [retentionDays, setRetentionDays] = React.useState(90);
  const [enforceMfa, setEnforceMfa] = React.useState(true);
  const [sessionTimeoutMins, setSessionTimeoutMins] = React.useState(30);
  const [enableClientDelete, setEnableClientDelete] = React.useState(true);
  const [businessHoursOpen, setBusinessHoursOpen] = React.useState("08:00");
  const [businessHoursClose, setBusinessHoursClose] = React.useState("20:00");
  const [timezone, setTimezone] = React.useState("America/New_York");

  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [feedback, setFeedback] = React.useState<string | null>(null);

  const fetchSettings = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/settings");
      const data = await res.json();
      if (data.settings) {
        if (data.settings.supportedLanguages) setLanguages(data.settings.supportedLanguages);
        if (data.settings.retentionPolicyDays) setRetentionDays(data.settings.retentionPolicyDays);
        if (data.settings.businessHours) {
          setBusinessHoursOpen(data.settings.businessHours.open || "08:00");
          setBusinessHoursClose(data.settings.businessHours.close || "20:00");
          setTimezone(data.settings.businessHours.timezone || "America/New_York");
        }
      }
    } catch (err) {
      console.error("Failed to load settings", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleToggleLang = (code: string) => {
    setLanguages((prev) =>
      prev.map((l) => (l.code === code ? { ...l, active: !l.active } : l))
    );
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      const payload = {
        supportedLanguages: languages,
        retentionPolicyDays: retentionDays,
        businessHours: {
          open: businessHoursOpen,
          close: businessHoursClose,
          timezone,
        },
      };

      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setFeedback("System configuration successfully saved and applied to all intake nodes.");
        setTimeout(() => setFeedback(null), 4000);
      }
    } catch (err) {
      setFeedback("Failed to update system settings.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas text-text flex flex-col">
      <AdminNav />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-ink border border-brand-500/20 mb-2">
              <Settings className="w-3.5 h-3.5" />
              <span>Platform Administration</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text">
              Platform Configuration & Security Controls
            </h1>
            <p className="text-sm text-text-muted mt-1">
              Configure supported languages, document vault retention windows, MFA security enforcement, and webhook integrations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchSettings}
              className="border-border text-text hover:bg-surface-raised"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Reload
            </Button>
            <Button
              size="sm"
              onClick={handleSaveSettings}
              disabled={isSaving}
              className="bg-brand-500 hover:bg-brand-600 text-white font-medium"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className="p-4 rounded-lg bg-status-success/10 border border-status-success/30 text-status-success flex items-center gap-3 text-sm">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Section 1: Data Vault & Security */}
        <Card className="p-6 border-border bg-surface shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <ShieldCheck className="w-5 h-5 text-brand-ink" />
            <div>
              <h2 className="text-base font-bold text-text">
                Document Vault Retention & Cryptographic Security
              </h2>
              <p className="text-xs text-text-muted mt-0.5">
                HIPAA & GDPR compliant file shredding rules and session authentication policies
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-xs font-semibold">
                Auto-Purge Document Retention Window
              </Label>
              <select
                value={retentionDays}
                onChange={(e) => setRetentionDays(parseInt(e.target.value) || 90)}
                className="w-full h-9 rounded-md border border-border bg-surface text-text text-sm px-3"
              >
                <option value={30}>30 Days (Maximum Privacy / Ephemeral)</option>
                <option value={90}>90 Days (Standard USCIS Filing Window - Recommended)</option>
                <option value={365}>1 Year (Legal Firm Retainer Standard)</option>
                <option value={2555}>7 Years (HIPAA Medical / Court Litigation Records)</option>
              </select>
              <p className="text-[11px] text-text-muted">
                Original source scans and translated certificates are cryptographically shredded after this period.
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold">
                Admin & Staff Session Idle Timeout
              </Label>
              <select
                value={sessionTimeoutMins}
                onChange={(e) => setSessionTimeoutMins(parseInt(e.target.value) || 30)}
                className="w-full h-9 rounded-md border border-border bg-surface text-text text-sm px-3"
              >
                <option value={15}>15 Minutes (Strict Financial/Medical)</option>
                <option value={30}>30 Minutes (Recommended)</option>
                <option value={60}>60 Minutes</option>
              </select>
              <p className="text-[11px] text-text-muted">
                Forces session re-authentication after inactivity to prevent unauthorized terminal access.
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-border flex flex-col sm:flex-row gap-6">
            <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={enforceMfa}
                onChange={(e) => setEnforceMfa(e.target.checked)}
                className="rounded border-border"
              />
              <span>Enforce Two-Factor Authentication (MFA) for Linguists & Project Managers</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={enableClientDelete}
                onChange={(e) => setEnableClientDelete(e.target.checked)}
                className="rounded border-border"
              />
              <span>Allow Clients to Request Immediate Hard-Deletion of Vault Scans</span>
            </label>
          </div>
        </Card>

        {/* Section 2: Supported Languages & Turnaround */}
        <Card className="p-6 border-border bg-surface shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <Globe className="w-5 h-5 text-brand-ink" />
            <div>
              <h2 className="text-base font-bold text-text">
                Supported Language Pairs & Intake Toggles
              </h2>
              <p className="text-xs text-text-muted mt-0.5">
                Enable or disable languages available in the client instant-quote order wizard
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {languages.map((lang) => (
              <div
                key={lang.code}
                onClick={() => handleToggleLang(lang.code)}
                className={`p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                  lang.active
                    ? "border-brand-500/40 bg-surface-raised"
                    : "border-border bg-surface opacity-60"
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-text">{lang.name}</span>
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {lang.code.toUpperCase()}
                    </Badge>
                  </div>
                  <span className="text-[11px] text-text-muted block mt-0.5">
                    {lang.requiresSpecialist ? "Specialist Certified" : "General & Vital Records"}
                  </span>
                </div>

                <div
                  className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${
                    lang.active ? "bg-status-success" : "bg-text-muted"
                  }`}
                >
                  {lang.active && <CheckCircle2 className="w-3 h-3 text-white" />}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Section 3: Operating Hours & SLAs */}
        <Card className="p-6 border-border bg-surface shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <Clock className="w-5 h-5 text-brand-ink" />
            <div>
              <h2 className="text-base font-bold text-text">
                Operational Business Hours & Turnaround Schedule
              </h2>
              <p className="text-xs text-text-muted mt-0.5">
                Defines intake SLA countdown timers and notary availability windows
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Intake Window Opens</Label>
              <Input
                type="time"
                value={businessHoursOpen}
                onChange={(e) => setBusinessHoursOpen(e.target.value)}
                className="h-9 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Intake Window Closes</Label>
              <Input
                type="time"
                value={businessHoursClose}
                onChange={(e) => setBusinessHoursClose(e.target.value)}
                className="h-9 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Primary Timezone</Label>
              <Input
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="h-9 text-sm font-mono"
              />
            </div>
          </div>
        </Card>

        {/* Section 4: Webhook Integrations */}
        <Card className="p-6 border-border bg-surface shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <Webhook className="w-5 h-5 text-brand-ink" />
            <div>
              <h2 className="text-base font-bold text-text">
                External Production Webhooks & Integrations
              </h2>
              <p className="text-xs text-text-muted mt-0.5">
                Synchronize order statuses with merchant gateways, SMS providers, and CRM endpoints
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-3.5 rounded-lg border border-border bg-surface-raised space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-text">Stripe Merchant Gateway</span>
                <span className="text-[10px] font-bold text-status-success bg-status-success/10 px-2 py-0.5 rounded">
                  CONNECTED
                </span>
              </div>
              <p className="text-[11px] text-text-muted">Live webhook receiving payment intent events</p>
            </div>

            <div className="p-3.5 rounded-lg border border-border bg-surface-raised space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-text">Twilio SMS Notifications</span>
                <span className="text-[10px] font-bold text-status-success bg-status-success/10 px-2 py-0.5 rounded">
                  ACTIVE
                </span>
              </div>
              <p className="text-[11px] text-text-muted">Dispatches SMS alerts for urgent review requests</p>
            </div>

            <div className="p-3.5 rounded-lg border border-border bg-surface-raised space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-text">SendGrid SMTP Relay</span>
                <span className="text-[10px] font-bold text-status-success bg-status-success/10 px-2 py-0.5 rounded">
                  VERIFIED
                </span>
              </div>
              <p className="text-[11px] text-text-muted">Sends certified document delivery packets</p>
            </div>
          </div>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
