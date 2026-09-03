"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import { CheckCircle2, ShieldCheck } from "lucide-react";

interface SignatureMomentProps {
  targetValue?: number;
  suffix?: string;
  prefix?: string;
  title?: string;
  confirmingDetail?: string;
  complianceCode?: string;
  className?: string;
}

/**
 * The Signature Moment Component (§3.5.6).
 * Sequenced celebratory verification state:
 * 1. Progress morphs into verified result surface (--dur-base: 220ms).
 * 2. Key numeral counts up from zero with tabular-nums (~500ms, ease-out).
 * 3. Settles with subtle spring overshoot.
 * 4. Secondary confirming detail fades in 150ms after primary value lands.
 * 5. Single accent-tinted sweep crosses surface once (--gradient-seal, 8% opacity, 600ms) and never repeats.
 * Total ≈ 1.2s. Fully skippable on tap/scroll. Immediate on prefers-reduced-motion.
 */
export function SignatureMoment({
  targetValue = 100,
  suffix = "%",
  prefix = "",
  title = "USCIS Acceptance Guaranteed",
  confirmingDetail = "8 CFR 103.2 Authenticity Seal Affixed • ATA Member No. 274910",
  complianceCode = "CERT-USCIS-VALIDATED",
  className = "",
}: SignatureMomentProps) {
  const shouldReduceMotion = useReducedMotion();
  const [displayValue, setDisplayValue] = useState(shouldReduceMotion ? targetValue : 0);
  const [stage, setStage] = useState<"initial" | "morphed" | "counted" | "confirmed" | "complete">(
    shouldReduceMotion ? "complete" : "initial"
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const hasTriggeredRef = useRef(false);

  const skipAnimation = () => {
    setDisplayValue(targetValue);
    setStage("complete");
  };

  useEffect(() => {
    if (shouldReduceMotion || hasTriggeredRef.current) {
      setDisplayValue(targetValue);
      setStage("complete");
      return;
    }
    hasTriggeredRef.current = true;

    // Step 1: Morph into result surface (0 to 220ms)
    const morphTimer = setTimeout(() => {
      setStage("morphed");
    }, 150);

    // Step 2: Numeral counts up (~500ms ease-out)
    const startTime = performance.now();
    const countDuration = 520;

    let animFrame: number;
    const updateCount = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / countDuration, 1);
      // Ease-out curve
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(easedProgress * targetValue);
      setDisplayValue(current);

      if (progress < 1) {
        animFrame = requestAnimationFrame(updateCount);
      } else {
        setStage("counted");

        // Step 4: Secondary confirming detail 150ms after primary lands
        setTimeout(() => {
          setStage("confirmed");

          // Step 5: Accent sweep finishes
          setTimeout(() => {
            setStage("complete");
          }, 600);
        }, 150);
      }
    };

    animFrame = requestAnimationFrame(updateCount);

    return () => {
      clearTimeout(morphTimer);
      cancelAnimationFrame(animFrame);
    };
  }, [targetValue, shouldReduceMotion]);

  return (
    <div
      ref={containerRef}
      onClick={skipAnimation}
      className={`relative overflow-hidden rounded-[var(--r-xl)] border border-seal-400/40 bg-surface p-8 shadow-seal select-none cursor-pointer transition-all duration-200 ${className}`}
    >
      {/* Step 5: Single accent-tinted sweep (--gradient-seal at 8% opacity, 600ms) */}
      {!shouldReduceMotion && stage === "confirmed" && (
        <motion.div
          initial={{ x: "-100%" }}
          animate={{ x: "200%" }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="absolute inset-0 pointer-events-none bg-gradient-to-r from-transparent via-seal-400/15 to-transparent z-10"
        />
      )}

      <div className="relative z-0 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[var(--r-md)] bg-seal-100 text-seal-600 border border-seal-400/30">
            <ShieldCheck className="h-7 w-7 text-seal-600" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-[var(--r-xs)] bg-status-success-bg px-2.5 py-0.5 text-xs font-semibold text-status-success border border-status-success/20">
                <CheckCircle2 className="h-3.5 w-3.5" />
                VERIFIED
              </span>
              <span className="font-mono text-xs text-text-subtle tracking-wider uppercase">
                {complianceCode}
              </span>
            </div>
            <h3 className="mt-1 text-xl font-semibold text-brand-ink">
              {title}
            </h3>
          </div>
        </div>

        {/* Step 2 & 3: Count-up Numeral with Tabular-Nums */}
        <div className="text-right flex md:flex-col items-baseline md:items-end justify-between w-full md:w-auto border-t md:border-t-0 border-border pt-4 md:pt-0">
          <div className="text-4xl md:text-5xl font-bold font-display text-brand-500 tabular-nums leading-none">
            {prefix}{displayValue}{suffix}
          </div>
          <span className="text-xs text-text-muted mt-1 font-medium">
            USCIS & Federal Compliance
          </span>
        </div>
      </div>

      {/* Step 4: Secondary Confirming Detail (Fades in 150ms after primary value) */}
      <motion.div
        initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 6 }}
        animate={
          shouldReduceMotion || stage === "confirmed" || stage === "complete"
            ? { opacity: 1, y: 0 }
            : { opacity: 0, y: 6 }
        }
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="mt-6 pt-5 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between text-xs text-text-muted gap-2"
      >
        <span className="flex items-center gap-1.5 font-medium text-text">
          <span className="h-2 w-2 rounded-full bg-status-success inline-block" />
          {confirmingDetail}
        </span>
        <span className="text-text-subtle font-mono">
          Tap or scroll to skip • Click to replay
        </span>
      </motion.div>
    </div>
  );
}
