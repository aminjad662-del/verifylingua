import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const cardVariants = cva(
  "text-text transition-[transform,background-color,border-color,color,box-shadow,opacity] duration-200",
  {
    variants: {
      variant: {
        application:
          "rounded-[var(--r-xl)] bg-surface-raised/60 border border-border/80 p-1.5 md:p-2 shadow-xs",
        marketing:
          "rounded-[var(--r-xl)] bg-surface-raised/60 border border-border/80 p-1.5 md:p-2 shadow-md hover:-translate-y-0.5 hover:shadow-lg duration-220",
        warm:
          "rounded-[var(--r-xl)] bg-surface-warm/60 border border-border/80 p-1.5 md:p-2 shadow-xs",
        sunken:
          "rounded-[var(--r-lg)] bg-surface-sunken border-transparent",
        doubleBezel:
          "rounded-[var(--r-xl)] bg-surface-raised/60 border border-border/80 p-1.5 md:p-2 shadow-xs",
        doppelrand:
          "rounded-[var(--r-xl)] bg-surface-raised/60 border border-border/80 p-1.5 md:p-2 shadow-xs",
        doppelrandRaised:
          "rounded-[var(--r-xl)] bg-surface-raised border border-border-raised shadow-md",
      },
    },
    defaultVariants: {
      variant: "application",
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  /** Enables concentric double-bezel enclosure (default: true, false for sunken) */
  doubleBezel?: boolean;
  /** Additional classes applied directly to the inner concentric core */
  innerClassName?: string;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = "application",
      doubleBezel,
      innerClassName,
      children,
      ...props
    },
    ref
  ) => {
    const isDouble =
      doubleBezel !== undefined ? doubleBezel : variant !== "sunken";

    if (!isDouble) {
      return (
        <div
          ref={ref}
          className={cn(cardVariants({ variant, className }))}
          {...props}
        >
          {children}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(cardVariants({ variant, className }))}
        {...props}
      >
        <div
          className={cn(
            "rounded-[calc(var(--r-xl)-0.375rem)] md:rounded-[calc(var(--r-xl)-0.5rem)] bg-surface text-text shadow-xs border border-border/40 flex flex-col flex-1 h-full w-full overflow-hidden",
            innerClassName
          )}
        >
          {children}
        </div>
      </div>
    );
  }
);
Card.displayName = "Card";

const CardInner = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-[calc(var(--r-xl)-0.375rem)] md:rounded-[calc(var(--r-xl)-0.5rem)] bg-surface text-text shadow-xs border border-border/40 flex flex-col flex-1 h-full w-full overflow-hidden",
      className
    )}
    {...props}
  />
));
CardInner.displayName = "CardInner";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6 md:p-8", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold tracking-tight text-brand-ink leading-tight",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-text-muted leading-relaxed", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0 md:p-8 md:pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0 md:p-8 md:pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export { Card, CardInner, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, cardVariants };
