import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold tracking-wide uppercase transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500",
  {
    variants: {
      variant: {
        default:
          "border-brand-100 bg-brand-50 text-brand-500",
        secondary:
          "border-border bg-lavender-50 text-brand-800",
        outline:
          "border-border bg-transparent text-text-muted",
        success:
          "border-status-success/20 bg-status-success/10 text-status-success",
        warning:
          "border-status-warning/20 bg-status-warning/10 text-status-warning",
        danger:
          "border-status-danger/20 bg-status-danger/10 text-status-danger",
        dark:
          "border-white/10 bg-white/5 text-white backdrop-blur-sm",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
