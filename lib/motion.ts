/**
 * Phase 4 Motion Design Tokens: Framer Motion & CSS Spring Specifications.
 * Strictly adheres to non-cartoony, high-precision physics:
 * - Micro-interactions: stiffness 380, damping 30
 * - Page/view transitions: stiffness 200, damping 25
 * - Pipeline stage snap: scale [1, 1.04, 1], 200ms
 * - Active stage pulse: opacity [0.6, 1, 0.6], 2s looping
 * - Accessible: respects prefers-reduced-motion
 */

export const SPRING_MICRO = {
  type: "spring" as const,
  stiffness: 380,
  damping: 30,
  mass: 0.8,
};

export const SPRING_VIEW = {
  type: "spring" as const,
  stiffness: 200,
  damping: 25,
  mass: 1.0,
};

export const PIPELINE_STAGE_VARIANTS = {
  initial: {
    scale: 1,
    opacity: 0.5,
  },
  active: {
    scale: 1,
    opacity: [0.6, 1, 0.6],
    transition: {
      duration: 2.0,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
  completed: {
    scale: [1, 1.04, 1],
    opacity: 1,
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
  failed: {
    scale: 1,
    opacity: 1,
  },
};

export const REDUCED_MOTION_VARIANTS = {
  initial: { opacity: 0.7 },
  active: { opacity: 1 },
  completed: { opacity: 1 },
  failed: { opacity: 1 },
};
