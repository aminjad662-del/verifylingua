"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Loader2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface MorphingActionButtonProps {
  label: string;
  successLabel?: string;
  icon?: React.ReactNode;
  onClick: () => Promise<void> | void;
  className?: string;
  variant?: "primary" | "secondary" | "outline" | "dark";
  size?: "sm" | "md";
}

export function MorphingActionButton({
  label,
  successLabel = "Completed",
  icon,
  onClick,
  className = "",
  variant = "outline",
  size = "sm",
}: MorphingActionButtonProps) {
  const [status, setStatus] = React.useState<"idle" | "loading" | "success">("idle");

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (status !== "idle") return;

    setStatus("loading");
    try {
      await onClick();
      setStatus("success");
      setTimeout(() => {
        setStatus("idle");
      }, 2200);
    } catch {
      setStatus("idle");
    }
  };

  const baseStyles = "relative inline-flex items-center justify-center font-bold tracking-tight rounded-xl transition-colors select-none";
  const sizeStyles = size === "sm" ? "h-9 px-3.5 text-xs gap-2" : "h-11 px-5 text-sm gap-2.5";

  const variantStyles = {
    primary: "bg-neutral-950 text-white hover:bg-neutral-800 border border-neutral-800 shadow-sm",
    secondary: "bg-neutral-100 text-neutral-900 hover:bg-neutral-200 border border-neutral-200",
    outline: "bg-surface text-brand-ink hover:bg-surface-raised border border-border hover:border-neutral-400",
    dark: "bg-white/10 text-white hover:bg-white/20 border border-white/15",
  }[variant];

  return (
    <motion.button
      layout
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 450, damping: 25 }}
      onClick={handleClick}
      disabled={status === "loading"}
      className={cn(baseStyles, sizeStyles, variantStyles, className)}
    >
      <AnimatePresence mode="wait" initial={false}>
        {status === "idle" && (
          <motion.span
            key="idle"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-1.5"
          >
            {icon}
            <span>{label}</span>
          </motion.span>
        )}

        {status === "loading" && (
          <motion.span
            key="loading"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-2 text-text-muted"
          >
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Processing...</span>
          </motion.span>
        )}

        {status === "success" && (
          <motion.span
            key="success"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: [0.95, 1.06, 1] }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="flex items-center gap-1.5 text-status-success font-extrabold"
          >
            <Check className="w-3.5 h-3.5" />
            <span>{successLabel}</span>
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
