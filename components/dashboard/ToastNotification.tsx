"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type?: "success" | "info" | "warning" | "error";
  duration?: number;
}

// Simple internal event bus for instant, zero-boilerplate toast dispatch
type ToastListener = (toast: ToastMessage) => void;
const listeners: Set<ToastListener> = new Set();

export function showToast(toast: Omit<ToastMessage, "id">) {
  const id = "toast_" + Math.random().toString(36).substring(2, 9);
  const fullToast: ToastMessage = { ...toast, id };
  listeners.forEach((listener) => listener(fullToast));
}

export function ToastContainer() {
  const [toasts, setToasts] = React.useState<ToastMessage[]>([]);

  React.useEffect(() => {
    const handleNewToast = (toast: ToastMessage) => {
      setToasts((prev) => [...prev.slice(-3), toast]); // keep at most 4 visible
      const timeout = setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, toast.duration || 3500);
      return () => clearTimeout(timeout);
    };

    listeners.add(handleNewToast);
    return () => {
      listeners.delete(handleNewToast);
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <aside aria-label="Notifications" className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, y: 24, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.94 }}
            transition={{ type: "spring", stiffness: 420, damping: 28 }}
            className="pointer-events-auto flex items-start gap-3 p-4 rounded-2xl bg-neutral-950/95 border border-white/10 text-white shadow-2xl backdrop-blur-xl"
          >
            <div className="shrink-0 mt-0.5">
              {toast.type === "error" ? (
                <AlertCircle className="w-4 h-4 text-status-danger" />
              ) : toast.type === "info" ? (
                <Info className="w-4 h-4 text-brand-400" />
              ) : (
                <div className="flex items-center justify-center w-4 h-4 rounded-full bg-status-success/20 text-status-success">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-success inline-block animate-pulse" />
                </div>
              )}
            </div>

            <div className="flex-1 space-y-0.5 pr-2">
              <p className="text-xs font-bold text-white tracking-tight">{toast.title}</p>
              {toast.description && (
                <p className="text-[11px] text-neutral-400 leading-snug">{toast.description}</p>
              )}
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-neutral-500 hover:text-white transition-colors p-0.5"
              aria-label="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </aside>
  );
}
