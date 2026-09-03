"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";

/**
 * App Router Page Transition template (§3.5.5).
 * - Enter: opacity 0 -> 1, translateY 10px -> 0, --dur-page (420ms), --ease-out-quart.
 * - Exit: opacity -> 0, translateY -8px, --dur-fast (150ms).
 * - Completely bypassed under prefers-reduced-motion.
 * - Persistent elements (sticky bars, progress indicators) are outside template.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <>{children}</>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{
        duration: 0.42, // --dur-page: 420ms per §3.5.1
        ease: [0.25, 1, 0.5, 1], // --ease-out-quart per §3.5.1
      }}
      className="w-full flex-1 flex flex-col"
    >
      {children}
    </motion.div>
  );
}
