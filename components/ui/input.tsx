import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

/**
 * Standard Form Input Component (§3.6.5).
 * - --r-sm (10px) radius, 1px --border-strong, --canvas fill, 14-16px padding.
 * - Persistent labels should be placed above this component in usage.
 * - Focus: 2px --focus-ring at 2px offset.
 * - Placeholder: --text-subtle.
 * - Error: --status-danger border and focus ring.
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-[var(--r-sm)] border border-border-strong bg-canvas px-4 py-3 text-base text-text placeholder:text-text-subtle transition-all duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--focus-ring)] focus-visible:border-transparent",
          "disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-status-danger focus-visible:ring-status-danger",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
