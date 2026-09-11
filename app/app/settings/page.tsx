"use client";

import * as React from "react";
import { Settings, Shield, Bell, Save, CheckCircle2 } from "lucide-react";

export default function ClientSettingsPage() {
  const [autoDelete, setAutoDelete] = React.useState(false);
  const [retentionDays, setRetentionDays] = React.useState(30);
  const [defaultTargetLang, setDefaultTargetLang] = React.useState("en");
  const [notifyEmail, setNotifyEmail] = React.useState(true);
  const [saved, setSaved] = React.useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-6 rounded-2xl bg-surface border border-border">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-text">
            Workspace Settings
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Configure default language pairs, security controls, and document lifecycle retention policies.
          </p>
        </div>
        <Settings className="w-6 h-6 text-brand-500" />
      </div>

      {saved && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Settings successfully saved and synchronized.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Data Retention & Privacy */}
        <div className="p-6 rounded-2xl bg-surface border border-border space-y-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-brand-500" />
            <h2 className="text-xs font-mono font-extrabold uppercase tracking-wider text-text">
              Document Lifecycle & Retention Policies
            </h2>
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-text">Automatic Document Deletion</p>
                <p className="text-[11px] text-text-muted">
                  Automatically purge source files and translated deliverables after a set retention window.
                </p>
              </div>
              <input
                type="checkbox"
                checked={autoDelete}
                onChange={(e) => setAutoDelete(e.target.checked)}
                className="w-4 h-4 rounded text-brand-500 border-border focus:ring-brand-500"
              />
            </div>

            {autoDelete && (
              <div className="p-4 rounded-xl bg-surface-raised border border-border space-y-2">
                <label className="text-xs font-mono font-bold uppercase text-text-muted">
                  Retention Window (Days)
                </label>
                <select
                  value={retentionDays}
                  onChange={(e) => setRetentionDays(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg text-xs bg-surface border border-border focus:outline-none focus:border-brand-500"
                >
                  <option value={7}>7 Days</option>
                  <option value={14}>14 Days</option>
                  <option value={30}>30 Days (Recommended)</option>
                  <option value={90}>90 Days</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Translation Preferences */}
        <div className="p-6 rounded-2xl bg-surface border border-border space-y-4">
          <h2 className="text-xs font-mono font-extrabold uppercase tracking-wider text-text">
            Default Translation Preferences
          </h2>

          <div className="space-y-2">
            <label className="text-xs font-mono font-bold uppercase text-text-muted">
              Default Target Language
            </label>
            <select
              value={defaultTargetLang}
              onChange={(e) => setDefaultTargetLang(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl text-xs bg-surface border border-border focus:outline-none focus:border-brand-500"
            >
              <option value="en">English (US/UK)</option>
              <option value="es">Spanish (Español)</option>
              <option value="ar">Arabic (العربية) - RTL</option>
              <option value="fr">French (Français)</option>
              <option value="de">German (Deutsch)</option>
            </select>
          </div>
        </div>

        {/* Notifications */}
        <div className="p-6 rounded-2xl bg-surface border border-border space-y-4">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-brand-500" />
            <h2 className="text-xs font-mono font-extrabold uppercase tracking-wider text-text">
              Notification Channels
            </h2>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-text">Email Delivery Notifications</p>
              <p className="text-[11px] text-text-muted">Receive download links when jobs complete.</p>
            </div>
            <input
              type="checkbox"
              checked={notifyEmail}
              onChange={(e) => setNotifyEmail(e.target.checked)}
              className="w-4 h-4 rounded text-brand-500 border-border focus:ring-brand-500"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-all shadow-sm"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
