"use client";

import * as React from "react";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { cn, formatCurrency } from "@/lib/utils";

export interface ToggleRowProps {
  id: string;
  title: string;
  description: string;
  priceDelta: number | string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  badge?: string;
  recommended?: boolean;
  disabled?: boolean;
  className?: string;
}

export function ToggleRow({
  id,
  title,
  description,
  priceDelta,
  checked,
  onCheckedChange,
  badge,
  recommended,
  disabled = false,
  className,
}: ToggleRowProps) {
  return (
    <div
      onClick={() => !disabled && onCheckedChange(!checked)}
      className={cn(
        "flex items-center justify-between p-4 md:p-5 rounded-2xl border transition-all cursor-pointer select-none",
        checked
          ? "border-brand-500 bg-brand-50/50 dark:bg-brand-500/20 dark:border-brand-400 shadow-sm"
          : "border-border bg-surface-raised dark:bg-slate-900/60 dark:border-white/10 hover:border-brand-300/60 hover:bg-surface dark:hover:border-white/20 dark:hover:bg-slate-900/90",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <div className="flex-1 pr-4 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <label
            htmlFor={id}
            className="text-base font-semibold text-brand-ink dark:text-white cursor-pointer"
          >
            {title}
          </label>
          {recommended && (
            <Badge variant="default" className="text-[10px] py-0 px-2">
              Recommended
            </Badge>
          )}
          {badge && (
            <Badge variant="secondary" className="text-[10px] py-0 px-2">
              {badge}
            </Badge>
          )}
        </div>
        <p className="text-sm text-text-muted dark:text-slate-400 leading-normal">{description}</p>
      </div>

      <div className="flex items-center gap-4 shrink-0">
        <span className="text-sm md:text-base font-bold text-brand-ink dark:text-white font-mono">
          {typeof priceDelta === "number" ? `+${formatCurrency(priceDelta)}` : priceDelta}
        </span>
        <Switch
          id={id}
          checked={checked}
          onCheckedChange={onCheckedChange}
          disabled={disabled}
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  );
}
