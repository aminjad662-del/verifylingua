"use client";

import React from "react";
import { motion, useReducedMotion, type Variants } from "motion/react";

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  yOffset?: number;
}

/**
 * Reusable scroll-reveal component per §3.5.3.
 * - Triggered via whileInView with once: true.
 * - Animates opacity (0 -> 1) and translateY (16px -> 0) with --dur-slow (340ms) and --ease-out-soft.
 * - Completely bypasses translation when prefers-reduced-motion is active.
 * - Zero CLS: only compositor properties (opacity, transform) are animated.
 */
export function ScrollReveal({
  children,
  className = "",
  delay = 0,
  yOffset = 16, // Default 16px per §3.5.3
}: ScrollRevealProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: yOffset }}
      whileInView={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{
        duration: 0.34, // --dur-slow: 340ms per §3.5.1
        delay,
        ease: [0.22, 1, 0.36, 1], // --ease-out-soft: cubic-bezier(0.22, 1, 0.36, 1) per §3.5.1
      }}
      suppressHydrationWarning
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface StaggerContainerProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number; // Delay between items (default: 0.06s)
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: (staggerDelay = 0.06) => ({
    opacity: 1,
    transition: {
      staggerChildren: staggerDelay,
      delayChildren: 0.05,
    },
  }),
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.34, // --dur-slow: 340ms
      ease: [0.22, 1, 0.36, 1], // --ease-out-soft
    },
  },
};

const reducedVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
};

export function StaggerContainer({
  children,
  className = "",
  staggerDelay = 0.06,
}: StaggerContainerProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      variants={shouldReduceMotion ? undefined : containerVariants}
      custom={staggerDelay}
      initial={shouldReduceMotion ? false : "hidden"}
      whileInView={shouldReduceMotion ? undefined : "visible"}
      viewport={{ once: true, margin: "-40px" }}
      suppressHydrationWarning
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      variants={shouldReduceMotion ? reducedVariants : itemVariants}
      suppressHydrationWarning
      className={className}
    >
      {children}
    </motion.div>
  );
}
