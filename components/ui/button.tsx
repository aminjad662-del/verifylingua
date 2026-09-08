import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Standard Button Primitive (§3.6.3).
 * - --r-md (14px) radius, 44px min height.
 * - Generous horizontal padding (20px sm / 28px md / 36px lg).
 * - Display font at weight 500-600.
 * - Solid --brand-500 primary, never gradient-filled.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--r-md)] text-base font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--focus-ring)] disabled:pointer-events-none disabled:opacity-50 min-h-[44px] select-none",
  {
    variants: {
      variant: {
        default:
          "bg-brand-500 text-white shadow-sm hover:bg-brand-600 active:scale-[0.985] group",
        primary:
          "bg-brand-500 text-white shadow-sm hover:bg-brand-600 active:scale-[0.985] group",
        cta:
          "bg-cta text-white shadow-md hover:bg-cta-hover active:bg-cta-active active:scale-[0.985] group font-semibold",
        secondary:
          "bg-canvas text-brand-ink border border-border-strong hover:bg-surface-sunken active:scale-[0.985]",
        outline:
          "border border-border-strong bg-transparent hover:bg-surface-sunken text-brand-ink active:scale-[0.985]",
        ghost:
          "hover:bg-surface-sunken text-text-muted hover:text-brand-ink",
        tertiary:
          "text-brand-ink hover:text-brand-500 p-0 min-h-0 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-brand-500 hover:after:w-full after:transition-all after:duration-150",
        link:
          "text-brand-500 underline-offset-4 hover:underline p-0 min-h-0",
        destructive:
          "bg-status-danger text-white hover:bg-status-danger/90 active:scale-[0.985]",
        dark:
          "bg-brand-ink text-white hover:bg-brand-900 active:scale-[0.985]",
      },
      size: {
        default: "h-12 px-7 py-3",          // 28px md padding (§3.6.3)
        sm: "h-11 px-5 text-sm min-h-[44px]", // 20px sm padding, maintains 44px min touch target
        lg: "h-14 px-9 text-base font-semibold", // 36px lg padding
        icon: "h-11 w-11 p-0 min-h-[44px] min-w-[44px]",
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
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, isLoading = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <span className="inline-block w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
            <span className="opacity-90">{typeof children === "string" ? children : "Loading…"}</span>
          </div>
        ) : (
          children
        )}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
