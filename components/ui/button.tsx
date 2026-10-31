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
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--r-md)] text-base font-medium transition-[transform,background-color,border-color,color,box-shadow] duration-150 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--focus-ring)] disabled:pointer-events-none disabled:opacity-50 min-h-[44px] select-none",
  {
    variants: {
      variant: {
        default:
          "bg-brand-500 text-white shadow-sm hover:bg-brand-600 active:scale-[0.97] group",
        primary:
          "bg-brand-500 text-white shadow-sm hover:bg-brand-600 active:scale-[0.97] group",
        cta:
          "bg-cta text-white shadow-md hover:bg-cta-hover active:bg-cta-active active:scale-[0.97] group font-semibold",
        secondary:
          "bg-canvas text-brand-ink border border-border-strong hover:bg-surface-sunken active:scale-[0.97]",
        outline:
          "border border-border-strong bg-transparent hover:bg-surface-sunken text-brand-ink active:scale-[0.97]",
        ghost:
          "hover:bg-surface-sunken text-text-muted hover:text-brand-ink active:scale-[0.97]",
        tertiary:
          "text-brand-ink hover:text-brand-500 p-0 min-h-0 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-brand-500 hover:after:w-full after:transition-[width] after:duration-150 after:ease-out active:scale-[0.97]",
        link:
          "text-brand-500 underline-offset-4 hover:underline p-0 min-h-0",
        destructive:
          "bg-status-danger text-white hover:bg-status-danger/90 active:scale-[0.97]",
        dark:
          "bg-brand-ink text-white hover:bg-brand-900 active:scale-[0.97]",
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

/**
 * Button-in-Button Trailing Icon Pill Primitive (§G6)
 */
function ButtonIconPill({
  children,
  className,
  variant = "dark",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "dark" | "light";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center w-7 h-7 -mr-2 rounded-full shrink-0 pointer-events-none transition-[transform,background-color] duration-150 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-active:scale-90",
        variant === "dark"
          ? "bg-white/15 text-white group-hover:bg-white/25"
          : "bg-brand-ink/10 text-brand-ink group-hover:bg-brand-ink/15",
        className
      )}
    >
      {children}
    </span>
  );
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
  /** Trailing icon rendered in nested pill enclosure with kinetic tension (§G6) */
  trailingIcon?: React.ReactNode;
  /** Custom class for trailing icon pill */
  pillClassName?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size,
      asChild = false,
      isLoading = false,
      trailingIcon,
      pillClassName,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    const isLight =
      variant === "secondary" ||
      variant === "outline" ||
      variant === "ghost" ||
      variant === "tertiary";

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
        ) : trailingIcon && !asChild ? (
          <>
            {children}
            <ButtonIconPill variant={isLight ? "light" : "dark"} className={pillClassName}>
              {trailingIcon}
            </ButtonIconPill>
          </>
        ) : (
          children
        )}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, ButtonIconPill, buttonVariants };
