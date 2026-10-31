"use client";

import * as React from "react";
import { Stamp, ShieldCheck, Award, FileText, QrCode } from "lucide-react";

export interface JuratStampPaletteProps {
  onInsertTag: (tag: string) => void;
  publicCode?: string;
}

export function JuratStampPalette({ onInsertTag, publicCode = "VL-7X9K2" }: JuratStampPaletteProps) {
  const STAMPS = [
    {
      id: "seal",
      label: "Official Seal",
      shortcut: "⌘1",
      tag: "[Official Embossed Seal: State Civil Registry]",
      icon: Stamp,
    },
    {
      id: "notary",
      label: "Notary Stamp",
      shortcut: "⌘2",
      tag: "[Notary Wet-Ink Stamp: Legible / Commission No. GG-918231]",
      icon: Award,
    },
    {
      id: "jurat",
      label: "Sworn Jurat",
      shortcut: "⌘3",
      tag: "[Sworn Jurat: 8 CFR § 204.2 ATA Cert No. 271892]",
      icon: ShieldCheck,
    },
    {
      id: "apostille",
      label: "Apostille",
      shortcut: "⌘4",
      tag: "[Hague Apostille Certificate: Authenticated]",
      icon: FileText,
    },
    {
      id: "barcode",
      label: "Barcode ID",
      shortcut: "⌘5",
      tag: `[Barcode / QR Identifier: ${publicCode}]`,
      icon: QrCode,
    },
  ];

  return (
    <div className="rounded-[var(--r-xl)] bg-surface-raised/60 border border-border/80 p-1.5 md:p-2 shadow-2xs">
      <div className="rounded-[calc(var(--r-xl)-0.375rem)] md:rounded-[calc(var(--r-xl)-0.5rem)] bg-surface border border-border/40 p-3 sm:p-4 space-y-2.5">
        <div className="flex items-center justify-between text-xs font-mono text-text-subtle">
          <span className="font-bold text-brand-ink uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <Stamp className="w-3.5 h-3.5 text-signal-accent" />
            <span>Sworn Jurat &amp; Notarial Stamp Palette</span>
          </span>
          <span className="hidden sm:inline text-[10px]">Shortcuts ⌘1–⌘5</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {STAMPS.map((stamp) => {
            const Icon = stamp.icon;
            return (
              <button
                key={stamp.id}
                onClick={() => onInsertTag(stamp.tag)}
                className="min-h-[44px] inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-raised border border-border hover:border-border-strong text-brand-ink text-xs font-mono font-semibold transition-all cursor-pointer active:scale-[0.98] touch-manipulation shadow-2xs"
                title={`Insert ${stamp.tag} (${stamp.shortcut})`}
              >
                <Icon className="w-3.5 h-3.5 text-signal-accent shrink-0" />
                <span>+ {stamp.label}</span>
                <kbd className="hidden sm:inline px-1 py-0.2 rounded bg-surface border border-border text-[9px] text-text-subtle">
                  {stamp.shortcut}
                </kbd>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
