"use client";

import * as React from "react";
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
} from "lucide-react";

export default function SettingsPage() {
  const [saved, setSaved] = React.useState(false);
  const [name, setName] = React.useState("Mohammed Abdullah Al-Rashid");
  const [email, setEmail] = React.useState("user@example.com");
  const [phone, setPhone] = React.useState("+1 (555) 234-5678");

  // Preferences
  const [emailNotify, setEmailNotify] = React.useState(true);
  const [smsNotify, setSmsNotify] = React.useState(true);
  const [autoPurge, setAutoPurge] = React.useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
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
