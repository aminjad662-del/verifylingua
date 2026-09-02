"use client";

import React, { useRef } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion, type HTMLMotionProps } from "framer-motion";

interface MagneticButtonProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  maxPull?: number; // Max distance in px (default: 8px)
  className?: string;
}

/**
 * Reusable Magnetic Button primitive.
 * Pulls toward the pointer on hover using Framer Motion's useMotionValue and useSpring
 * outside the React render cycle, then springs back smoothly to rest on pointer leave.
 * Respects prefers-reduced-motion by bypassing motion entirely.
 */
export function MagneticButton({
  children,
  maxPull = 8,
  className = "",
  ...props
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // Raw coordinate offsets
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Physics spring configurations for physical return-to-rest
  const springConfig = { stiffness: 150, damping: 15, mass: 0.1 };
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isMounted || shouldReduceMotion || !ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = e.clientX - centerX;
    const deltaY = e.clientY - centerY;

    // Normalize and clamp pull distance to maxPull
    const distance = Math.hypot(deltaX, deltaY);
    const maxRadius = Math.max(rect.width, rect.height);
    const ratio = Math.min(distance / maxRadius, 1);

    const pullX = (deltaX / distance) * ratio * maxPull;
    const pullY = (deltaY / distance) * ratio * maxPull;

    mouseX.set(isNaN(pullX) ? 0 : pullX);
    mouseY.set(isNaN(pullY) ? 0 : pullY);
  };

  const handlePointerLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={isMounted && !shouldReduceMotion ? { x, y } : undefined}
      suppressHydrationWarning
      className={`inline-block active:scale-[0.97] transition-transform duration-150 ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}
