"use client";

import * as React from "react";
import { useMotionValue, useSpring, useTransform, useReducedMotion } from "motion/react";

interface UseMagneticHoverOptions {
  maxPull?: number; // Maximum displacement in pixels (default: 8px)
  radius?: number; // Activation radius from center (default: 80px)
  parallaxRatio?: number; // Ratio of inner content movement (default: 0.4x)
}

/**
 * Custom hook implementing Emil Kowalski's magnetic hover physics.
 * Translates an element toward the cursor with calibrated spring damping,
 * with optional parallax for inner labels, automatically disabled on touch
 * and prefers-reduced-motion environments.
 */
export function useMagneticHover<T extends HTMLElement = HTMLDivElement>({
  maxPull = 8,
  radius = 80,
  parallaxRatio = 0.4,
}: UseMagneticHoverOptions = {}) {
  const ref = React.useRef<T>(null);
  const shouldReduceMotion = useReducedMotion();
  const [isTouchDevice, setIsTouchDevice] = React.useState(false);
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
    if (typeof window !== "undefined") {
      setIsTouchDevice(window.matchMedia("(pointer: coarse)").matches);
    }
  }, []);

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);

  // Emil Kowalski spring damping configuration
  const springConfig = { stiffness: 380, damping: 26, mass: 0.1 };
  const x = useSpring(rawX, springConfig);
  const y = useSpring(rawY, springConfig);

  const innerX = useTransform(x, (val) => val * parallaxRatio);
  const innerY = useTransform(y, (val) => val * parallaxRatio);

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isMounted || shouldReduceMotion || isTouchDevice || !ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = e.clientX - centerX;
    const deltaY = e.clientY - centerY;
    const distance = Math.hypot(deltaX, deltaY);

    if (distance < radius) {
      const pullFactor = 1 - distance / radius;
      const moveX = (deltaX / radius) * maxPull * pullFactor;
      const moveY = (deltaY / radius) * maxPull * pullFactor;
      rawX.set(moveX);
      rawY.set(moveY);
    } else {
      rawX.set(0);
      rawY.set(0);
    }
  };

  const handlePointerLeave = () => {
    rawX.set(0);
    rawY.set(0);
  };

  return {
    ref,
    x,
    y,
    innerX,
    innerY,
    handlers: {
      onPointerMove: handlePointerMove,
      onPointerLeave: handlePointerLeave,
    },
  };
}
