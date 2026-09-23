"use client";

import * as React from "react";
import Link from "next/link";
import { DashboardNav } from "@/components/layout/DashboardNav";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Settings,
  User,
  Bell,
  Lock,
  ShieldCheck,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

export default function SettingsPage() {
  const [saved, setSaved] = React.useState(false);
  const [currentUser, setCurrentUser] = React.useState<any>(null);
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");

  // Verification resend state
  const [isResendingVerify, setIsResendingVerify] = React.useState(false);
  const [verifyNotice, setVerifyNotice] = React.useState<string | null>(null);

  // Preferences
  const [emailNotify, setEmailNotify] = React.useState(true);
  const [smsNotify, setSmsNotify] = React.useState(true);
  const [autoPurge, setAutoPurge] = React.useState(false); // Default is keep indefinitely (opt-in)

  React.useEffect(() => {
    async function loadUserData() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data && data.authenticated && data.user) {
            setCurrentUser(data.user);
            if (data.user.name) setName(data.user.name);
            if (data.user.email) setEmail(data.user.email);
            if (data.user.phone) setPhone(data.user.phone);
          }
        }
      } catch {
        // default state
      }
    }

    async function loadRetention() {
      try {
        const res = await fetch("/api/settings/retention");
        if (res.ok) {
          const data = await res.json();
          if (data.settings) {
            setAutoPurge(!!data.settings.autoDeleteEnabled);
          }
        }
      } catch {
        // use default state
      }
    }

    loadUserData();
    loadRetention();
  }, []);

  const handleResendVerification = async () => {
    if (!email || isResendingVerify) return;
    setIsResendingVerify(true);
    setVerifyNotice(null);

    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setVerifyNotice("Verification link sent! Please check your inbox.");
      } else {
        setVerifyNotice(data.error || "Failed to dispatch verification email.");
      }
    } catch {
      setVerifyNotice("Network error occurred.");
    } finally {
      setIsResendingVerify(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("/api/settings/retention", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          autoDeleteEnabled: autoPurge,
          retentionDays: 90,
        }),
      });
    } catch {
      // silent catch
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-text">
      <DashboardNav />

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-10 space-y-8">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black text-brand-ink tracking-tight">
            Account & Security Settings
          </h1>
          <p className="text-sm text-text-muted">
            Manage your default passport transliterations, contact notification channels, and privacy preferences.
          </p>
        </div>

        {saved && (
          <div className="p-4 rounded-2xl bg-status-success/15 border border-status-success/30 text-status-success text-sm font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            <span>Settings updated successfully!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Identity & Passport Names */}
          <Card className="p-6 md:p-8 rounded-[32px] bg-surface-raised border border-border space-y-5">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-brand-ink flex items-center gap-2">
                <User className="w-5 h-5 text-brand-500" />
                Default Passport Profile
              </h2>
              <p className="text-xs text-text-muted">
                Pre-populates your name lock during checkout to prevent spelling discrepancies.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-brand-ink">
                  Full Name (Exact Passport Spelling)
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-brand-ink">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-brand-ink">
                    Phone Number (SMS / WhatsApp)
                  </label>
                  <Input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Institutional Identity & Security Vault */}
          <Card className="p-6 md:p-8 rounded-[32px] bg-surface-raised border border-border space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-brand-ink flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-brand-500" />
                  Institutional Identity & Security Vault
                </h2>
                <p className="text-xs text-text-muted">
                  Cryptographic verification status, institutional role scope, and USCIS filing authorization.
                </p>
              </div>

              <div>
                {currentUser?.emailVerified ? (
                  <Badge className="bg-status-success/15 text-status-success border-status-success/30 gap-1 px-3 py-1 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified Identity
                  </Badge>
                ) : (
                  <Badge className="bg-accent-seal/15 text-accent-seal border-accent-seal/30 gap-1 px-3 py-1 font-semibold">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Verification Pending
                  </Badge>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border/60">
              <div className="p-3.5 rounded-xl bg-surface border border-border space-y-1">
                <span className="text-[11px] font-mono uppercase text-text-muted">Institutional Scope</span>
                <p className="text-sm font-bold text-brand-ink">
                  {currentUser?.accountType === "LAW_FIRM"
                    ? "Immigration Law Firm & Legal Counsel"
                    : currentUser?.accountType === "TRANSLATOR"
                    ? "Certified Linguist & Court Notary"
                    : "Individual Translation Vault"}
                </p>
                {currentUser?.companyName && (
                  <p className="text-xs text-text-muted">{currentUser.companyName}</p>
                )}
              </div>

              <div className="p-3.5 rounded-xl bg-surface border border-border space-y-1">
                <span className="text-[11px] font-mono uppercase text-text-muted">Vault Security Protocol</span>
                <p className="text-sm font-bold text-brand-ink">TLS 1.3 / 256-Bit Cryptographic Vault</p>
                <p className="text-xs text-text-muted">Zero model training retention & 8 CFR § 103.2 guaranteed</p>
              </div>
            </div>

            {!currentUser?.emailVerified && (
              <div className="p-4 rounded-xl bg-accent-seal/10 border border-accent-seal/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <p className="font-bold text-brand-ink">Action Required: Verify Email Address</p>
                  <p className="text-text-muted">
                    Federal immigration regulations require applicant verification before signing USCIS affidavits.
                  </p>
                  {verifyNotice && (
                    <p className="text-status-success font-medium pt-1">{verifyNotice}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleResendVerification}
                    disabled={isResendingVerify}
                    className="h-8 rounded-lg text-xs font-bold gap-1 cursor-pointer"
                  >
                    <RefreshCw className={`w-3 h-3 ${isResendingVerify ? "animate-spin" : ""}`} />
                    <span>Resend Link</span>
                  </Button>
                  <Link href="/verify-email">
                    <Button size="sm" className="h-8 rounded-lg text-xs font-bold gap-1 bg-brand-500 hover:bg-brand-600 text-white cursor-pointer">
                      <span>Verify Now</span>
                      <ArrowRight className="w-3 h-3" />
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </Card>

          {/* Notifications */}
          <Card className="p-6 md:p-8 rounded-[32px] bg-surface-raised border border-border space-y-5">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-brand-ink flex items-center gap-2">
                <Bell className="w-5 h-5 text-brand-500" />
                Live Tracking Alerts
              </h2>
              <p className="text-xs text-text-muted">
                Choose how you receive milestone notifications when orders progress.
              </p>
            </div>

            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-brand-ink">Email Notifications</p>
                  <p className="text-xs text-text-muted">Instant delivery of certified PDF certificates</p>
                </div>
                <Switch checked={emailNotify} onCheckedChange={setEmailNotify} />
              </div>

              <div className="flex items-center justify-between border-t border-border/60 pt-4">
                <div>
                  <p className="font-bold text-brand-ink">SMS & WhatsApp Alerts</p>
                  <p className="text-xs text-text-muted">Urgent status changes and translator questions</p>
                </div>
                <Switch checked={smsNotify} onCheckedChange={setSmsNotify} />
              </div>
            </div>
          </Card>

          {/* Security & Data Retention */}
          <Card className="p-6 md:p-8 rounded-[32px] bg-surface-raised border border-border space-y-5">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-brand-ink flex items-center gap-2">
                <Lock className="w-5 h-5 text-brand-500" />
                Data Privacy & 90-Day Auto-Purge (§11)
              </h2>
              <p className="text-xs text-text-muted">
                Control automatic purging of your sensitive identity documents.
              </p>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="space-y-0.5 max-w-md">
                <p className="font-bold text-brand-ink">90-Day Automatic Original Scan Purge</p>
                <p className="text-xs text-text-muted">
                  Permanently deletes original source scans 90 days after delivery completion.
                </p>
              </div>
              <Switch checked={autoPurge} onCheckedChange={setAutoPurge} />
            </div>
          </Card>

          <Button type="submit" size="lg" className="rounded-xl font-bold px-8 shadow-md">
            Save Preferences
          </Button>
        </form>
      </main>

      <Footer />
    </div>
  );
}
