"use client";

import React from "react";

/**
 * App Router Page Transition template (§3.5.5).
 * Uses CSS animation instead of JS initial={opacity:0} to avoid blank page
 * on Cloudflare Pages when JS hydration is delayed or slow.
 * - Enter: CSS @keyframes page-enter — opacity 0->1, translateY 12px->0, 380ms ease-out.
 * - Completely bypassed under prefers-reduced-motion using globals.css @media block.
 * - Page content is ALWAYS visible in SSR HTML (no opacity:0 in initial render).
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="w-full flex-1 flex flex-col"
      style={{ animation: "page-enter 0.38s cubic-bezier(0.25,1,0.5,1) both" }}
    >
      {children}
    </div>
  );
}
