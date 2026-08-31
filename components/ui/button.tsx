import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:pointer-events-none disabled:opacity-50 min-h-[44px]",
  {
    variants: {
      variant: {
        default:
          "bg-brand-500 text-white shadow-sm hover:bg-brand-700 active:scale-[0.98]",
        secondary:
          "bg-surface-raised text-brand-ink border border-border hover:bg-surface active:scale-[0.98]",
        outline:
          "border border-border bg-transparent hover:bg-surface text-brand-ink active:scale-[0.98]",
        ghost:
          "hover:bg-surface hover:text-brand-ink text-text-muted",
        link:
          "text-brand-500 underline-offset-4 hover:underline p-0 min-h-0",
        destructive:
          "bg-status-danger text-white hover:bg-status-danger/90 active:scale-[0.98]",
        dark:
          "bg-brand-ink text-white hover:bg-brand-800 active:scale-[0.98]",
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-9 rounded-lg px-3.5 text-xs min-h-[36px]",
        lg: "h-14 rounded-2xl px-8 text-base font-semibold",
        icon: "h-11 w-11 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
