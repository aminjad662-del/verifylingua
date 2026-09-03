"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion, type HTMLMotionProps } from "motion/react";

interface MagneticButtonProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  maxPull?: number; // Capped at 9px per §3.5.2
  className?: string;
}

/**
 * Reusable Magnetic Button primitive per §3.5.2.
 * - Translates toward cursor within ~80px bounds, capped at 9px displacement.
 * - Inner label translates at 0.4x parent offset (parallax differential).
 * - Spring back using physical spring damping.
 * - Disabled on (pointer: coarse) and prefers-reduced-motion.
 * - Enforces minimum 44px touch target.
 */
export function MagneticButton({
  children,
  maxPull = 9,
  className = "",
  ...props
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== "undefined") {
      setIsTouchDevice(window.matchMedia("(pointer: coarse)").matches);
    }
  }, []);

  // Motion values for offset
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Physics spring configurations per §3.5.1 and §3.5.2 (damping factor 0.22 equivalent)
  const springConfig = { stiffness: 350, damping: 25, mass: 0.1 };
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);

  // 0.4x parallax differential for inner label per §3.5.2
  const innerX = useTransform(x, (val) => val * 0.4);
  const innerY = useTransform(y, (val) => val * 0.4);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isMounted || shouldReduceMotion || isTouchDevice || !ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = e.clientX - centerX;
    const deltaY = e.clientY - centerY;
    const distance = Math.hypot(deltaX, deltaY);

    // Magnetic proximity threshold ~80px outside element bounds
    const proximity = 80;
    const maxRadius = Math.max(rect.width, rect.height) / 2 + proximity;

    if (distance > maxRadius) {
      mouseX.set(0);
      mouseY.set(0);
      return;
    }

    // Displacement ratio capped at maxPull (9px)
    const ratio = Math.min(distance / maxRadius, 1);
    const pullX = (deltaX / (distance || 1)) * ratio * maxPull;
    const pullY = (deltaY / (distance || 1)) * ratio * maxPull;

    mouseX.set(isNaN(pullX) ? 0 : pullX);
    mouseY.set(isNaN(pullY) ? 0 : pullY);
  };

  const handlePointerLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const isMotionEnabled = isMounted && !shouldReduceMotion && !isTouchDevice;

  return (
    <motion.div
      ref={ref}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={isMotionEnabled ? { x, y } : undefined}
      suppressHydrationWarning
      className={`inline-block min-h-[44px] min-w-[44px] active:scale-[0.985] transition-transform duration-90 ${className}`}
      {...props}
    >
      <motion.div
        style={isMotionEnabled ? { x: innerX, y: innerY } : undefined}
        className="w-full h-full"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
