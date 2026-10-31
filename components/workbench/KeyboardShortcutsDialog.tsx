"use client";

import * as React from "react";
import { Command, X, Keyboard } from "lucide-react";

export interface KeyboardShortcutsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsDialog({ isOpen, onClose }: KeyboardShortcutsDialogProps) {
  // 0ms Esc key dismissal (Gate G21)
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const SHORTCUT_GROUPS = [
    {
      title: "Editor & Verification",
      items: [
        { keys: ["⌘", "↵"], description: "Affirm segment & advance to next" },
        { keys: ["⌘", "S"], description: "Save workbench draft to server" },
        { keys: ["J"], description: "Focus previous segment" },
        { keys: ["K"], description: "Focus next segment" },
      ],
    },
    {
      title: "Notarial Mark Insertion",
      items: [
        { keys: ["⌘", "1"], description: "Insert Official Embossed Seal" },
        { keys: ["⌘", "2"], description: "Insert Notary Wet-Ink Stamp" },
        { keys: ["⌘", "3"], description: "Insert Sworn Jurat Statement" },
        { keys: ["⌘", "4"], description: "Insert Hague Apostille Mark" },
        { keys: ["⌘", "5"], description: "Insert Barcode / QR Identifier" },
      ],
    },
    {
      title: "Canvas & Viewport Navigation",
      items: [
        { keys: ["+"], description: "Zoom in on document instrument" },
        { keys: ["-"], description: "Zoom out from document instrument" },
        { keys: ["0"], description: "Reset zoom to 100% standard" },
        { keys: ["Drag"], description: "Pan document viewport with pointer capture" },
      ],
    },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-ink/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="rounded-[var(--r-2xl)] bg-surface-raised border border-border p-2 shadow-2xl max-w-lg w-full"
      >
        <div className="rounded-[calc(var(--r-2xl)-0.5rem)] bg-surface border border-border/40 p-6 space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <Command className="w-4 h-4 text-signal-accent" />
              <h3 id="shortcuts-dialog-title" className="text-sm font-bold text-brand-ink font-display">
                Workbench Keyboard Shortcuts
              </h3>
            </div>
            <button
              onClick={onClose}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-surface-raised text-text-muted hover:text-brand-ink transition-colors cursor-pointer active:scale-[0.98] touch-manipulation"
              aria-label="Close shortcuts"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Shortcut Groups */}
          <div className="space-y-4 text-xs">
            {SHORTCUT_GROUPS.map((group) => (
              <div key={group.title} className="space-y-2">
                <span className="font-mono text-[10px] text-text-subtle uppercase font-bold tracking-wider">
                  {group.title}
                </span>
                <div className="space-y-1.5">
                  {group.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-xl bg-surface-raised border border-border"
                    >
                      <span className="text-text-muted">{item.description}</span>
                      <div className="flex items-center gap-1">
                        {item.keys.map((k) => (
                          <kbd
                            key={k}
                            className="px-2 py-0.5 rounded-md bg-surface border border-border text-[11px] font-mono font-bold text-brand-ink shadow-2xs"
                          >
                            {k}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-border flex justify-end">
            <button
              onClick={onClose}
              className="min-h-[44px] px-5 py-2 rounded-xl bg-brand-ink hover:bg-brand-900 text-white font-semibold text-xs transition-all cursor-pointer active:scale-[0.98] touch-manipulation"
            >
              Close Palette
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
