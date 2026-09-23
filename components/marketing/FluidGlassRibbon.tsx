"use client";

import * as React from "react";
import { motion, useReducedMotion } from "motion/react";

/**
 * FluidGlassRibbon - High-fidelity 3D organic glass ribbon inspired by Runey.app.
 * Represents fluid translation, linguistic harmony, and crystalline legal certainty.
 * Rendered using vector SVG paths with multi-layered specular highlights,
 * glass-like refraction gradients, and floating physical motion.
 */
export function FluidGlassRibbon({ className = "" }: { className?: string }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden select-none ${className}`}
    >
      {/* Ambient soft green aura behind ribbons */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] bg-gradient-to-tr from-emerald-400/15 via-lime-300/10 to-teal-400/15 blur-[120px] rounded-full" />

      {/* Animated Floating Ribbon Cluster */}
      <motion.svg
        viewBox="0 0 1600 900"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        initial={false}
        animate={
          shouldReduceMotion
            ? undefined
            : {
                y: [-6, 6, -6],
                rotate: [-0.4, 0.4, -0.4],
              }
        }
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] max-w-none h-[120%] opacity-90"
      >
        <defs>
          {/* Main Ribbon Emerald Gradient */}
          <linearGradient id="ribbonGrad1" x1="0%" y1="20%" x2="100%" y2="80%">
            <stop offset="0%" stopColor="#059669" stopOpacity="0.85" />
            <stop offset="25%" stopColor="#10B981" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#34D399" stopOpacity="0.75" />
            <stop offset="75%" stopColor="#84CC16" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#047857" stopOpacity="0.85" />
          </linearGradient>

          {/* Deep Underside Shadow Gradient */}
          <linearGradient id="ribbonDark" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#064E3B" stopOpacity="0.9" />
            <stop offset="40%" stopColor="#065F46" stopOpacity="0.8" />
            <stop offset="70%" stopColor="#047857" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#022C22" stopOpacity="0.95" />
          </linearGradient>

          {/* Glass Specular Refraction Highlight */}
          <linearGradient id="ribbonHighlight" x1="10%" y1="0%" x2="90%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.6" />
            <stop offset="30%" stopColor="#ECFDF5" stopOpacity="0.2" />
            <stop offset="70%" stopColor="#FFFFFF" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.1" />
          </linearGradient>

          {/* Lime Accent Gradient */}
          <linearGradient id="ribbonLime" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#65A30D" stopOpacity="0.7" />
            <stop offset="50%" stopColor="#A3E635" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0.7" />
          </linearGradient>

          {/* Soft Blur Filter for Depth of Field */}
          <filter id="ribbonGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Layer 1: Background Deep Volume Curve (Underside shadow) */}
        <path
          d="M -100 450 C 200 650, 450 250, 800 480 C 1150 710, 1400 320, 1700 420 L 1700 560 C 1400 460, 1150 850, 800 620 C 450 390, 200 790, -100 590 Z"
          fill="url(#ribbonDark)"
          opacity="0.6"
        />

        {/* Layer 2: Main Curving Translucent Body */}
        <path
          d="M -100 420 C 220 620, 460 220, 800 450 C 1140 680, 1380 290, 1700 390 L 1700 490 C 1380 390, 1140 780, 800 550 C 460 320, 220 720, -100 520 Z"
          fill="url(#ribbonGrad1)"
          opacity="0.88"
        />

        {/* Layer 3: Lime Refraction Edge (Adds vivid organic Runey feel) */}
        <path
          d="M -80 435 C 240 635, 470 235, 800 465 C 1130 695, 1370 305, 1680 405 L 1680 445 C 1370 345, 1130 735, 800 505 C 470 275, 240 675, -80 475 Z"
          fill="url(#ribbonLime)"
          opacity="0.75"
        />

        {/* Layer 4: Primary Specular Light Ribbon (Gleaming white hairline curve) */}
        <path
          d="M -100 422 C 220 622, 460 222, 800 452 C 1140 682, 1380 292, 1700 392"
          stroke="url(#ribbonHighlight)"
          strokeWidth="7"
          strokeLinecap="round"
          opacity="0.9"
        />

        {/* Layer 5: Secondary Specular Inner Reflection */}
        <path
          d="M -90 432 C 230 632, 465 232, 800 462 C 1135 692, 1375 302, 1690 402"
          stroke="#FFFFFF"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.75"
        />

        {/* Layer 6: Counter-Twist Fluid Ribbon (Sweeps lower in perspective) */}
        <path
          d="M -50 560 C 280 420, 550 780, 900 520 C 1250 260, 1450 620, 1750 490"
          stroke="url(#ribbonGrad1)"
          strokeWidth="28"
          strokeLinecap="round"
          opacity="0.45"
          filter="url(#ribbonGlow)"
        />

        {/* Layer 7: Fine Specular Accent Line on Counter-Twist */}
        <path
          d="M -50 558 C 280 418, 550 778, 900 518 C 1250 258, 1450 618, 1750 488"
          stroke="#FFFFFF"
          strokeWidth="2"
          opacity="0.5"
        />
      </motion.svg>
    </div>
  );
}
