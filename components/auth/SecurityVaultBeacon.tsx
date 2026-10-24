"use client";

import * as React from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useReducedMotion } from "motion/react";
import { ShieldCheck, Check, Lock, FileKey } from "lucide-react";

export function SecurityVaultBeacon() {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const radarRingRef = React.useRef<HTMLDivElement>(null);
  const pulseDotRef = React.useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  useGSAP(
    () => {
      if (shouldReduceMotion || !radarRingRef.current || !pulseDotRef.current) return;

      // GSAP Radar Pulse Animation
      gsap.fromTo(
        radarRingRef.current,
        { scale: 0.9, opacity: 0.7 },
        {
          scale: 1.6,
          opacity: 0,
          duration: 2.6,
          repeat: -1,
          ease: "power2.out",
        }
      );

      // Heartbeat pulse on the green status dot
      gsap.to(pulseDotRef.current, {
        scale: 1.25,
        opacity: 0.95,
        duration: 1.4,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
      });
    },
    { scope: containerRef, dependencies: [shouldReduceMotion] }
  );

  return (
    <div
      ref={containerRef}
      className="p-5 rounded-3xl bg-surface border border-border/80 shadow-xs space-y-4 select-none"
    >
      {/* Top Header with GSAP Signal */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-2xl bg-status-success/10 text-status-success border border-status-success/20">
            {/* GSAP animated expanding radar ring */}
            <div
              ref={radarRingRef}
              className="absolute inset-0 rounded-2xl border border-status-success/40 pointer-events-none"
            />
            <ShieldCheck className="w-4 h-4 relative z-10" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold font-display text-brand-ink">Institutional Security Vault</span>
              <div ref={pulseDotRef} className="w-1.5 h-1.5 rounded-full bg-status-success shrink-0" />
            </div>
            <span className="text-[11px] text-text-muted">Zero-Trust End-to-End Encryption</span>
          </div>
        </div>

        {/* Certified Status Badge */}
        <div className="px-2.5 py-1 rounded-full bg-status-success/10 border border-status-success/20 flex items-center gap-1.5 text-[11px] font-semibold text-status-success">
          <Lock className="w-3 h-3" />
          <span>FIPS 140-3 Active</span>
        </div>
      </div>

      {/* Security Specifications Grid */}
      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/60 text-xs">
        <div className="flex items-start gap-2">
          <div className="w-4 h-4 rounded-full bg-status-success/10 text-status-success flex items-center justify-center shrink-0 mt-0.5">
            <Check className="w-2.5 h-2.5" />
          </div>
          <div>
            <span className="font-semibold text-brand-ink">TLS 1.3 / AES-256</span>
            <p className="text-[11px] text-text-muted leading-tight mt-0.5">Hardware-isolated encryption</p>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <div className="w-4 h-4 rounded-full bg-status-success/10 text-status-success flex items-center justify-center shrink-0 mt-0.5">
            <Check className="w-2.5 h-2.5" />
          </div>
          <div>
            <span className="font-semibold text-brand-ink">SHA-256 Seal</span>
            <p className="text-[11px] text-text-muted leading-tight mt-0.5">Tamper-evident verification</p>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <div className="w-4 h-4 rounded-full bg-status-success/10 text-status-success flex items-center justify-center shrink-0 mt-0.5">
            <Check className="w-2.5 h-2.5" />
          </div>
          <div>
            <span className="font-semibold text-brand-ink">8 CFR § 103.2(b)(3)</span>
            <p className="text-[11px] text-text-muted leading-tight mt-0.5">USCIS guaranteed acceptance</p>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <div className="w-4 h-4 rounded-full bg-status-success/10 text-status-success flex items-center justify-center shrink-0 mt-0.5">
            <Check className="w-2.5 h-2.5" />
          </div>
          <div>
            <span className="font-semibold text-brand-ink">Zero AI Training</span>
            <p className="text-[11px] text-text-muted leading-tight mt-0.5">Strict legal confidentiality</p>
          </div>
        </div>
      </div>
    </div>
  );
}
