"use client";

import * as React from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useReducedMotion } from "motion/react";
import { ShieldCheck, Lock, Fingerprint, Activity, Check } from "lucide-react";

export function SecurityVaultBeacon() {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const radarRingRef = React.useRef<HTMLDivElement>(null);
  const pulseDotRef = React.useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const [heartbeatTime, setHeartbeatTime] = React.useState("0.04s");

  React.useEffect(() => {
    // Subtle realistic heartbeat jitter for live telemetry
    const interval = setInterval(() => {
      const ms = (35 + Math.floor(Math.random() * 15)) / 1000;
      setHeartbeatTime(`${ms.toFixed(2)}s`);
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  useGSAP(
    () => {
      if (shouldReduceMotion || !radarRingRef.current || !pulseDotRef.current) return;

      // GSAP Radar Pulse Animation
      gsap.fromTo(
        radarRingRef.current,
        { scale: 0.9, opacity: 0.8 },
        {
          scale: 1.7,
          opacity: 0,
          duration: 2.4,
          repeat: -1,
          ease: "power2.out",
        }
      );

      // Heartbeat pulse on the green status dot
      gsap.to(pulseDotRef.current, {
        scale: 1.25,
        opacity: 0.9,
        duration: 1.2,
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
      className="p-4 rounded-2xl bg-surface border border-border/90 shadow-xs space-y-3.5 select-none"
    >
      {/* Top Header with GSAP Radar Signal */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-status-success/10 text-status-success border border-status-success/30">
            {/* GSAP animated expanding radar ring */}
            <div
              ref={radarRingRef}
              className="absolute inset-0 rounded-lg border border-status-success/40 pointer-events-none"
            />
            <ShieldCheck className="w-4 h-4 relative z-10" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold font-display text-brand-ink">Institutional Security Vault</span>
              <div ref={pulseDotRef} className="w-1.5 h-1.5 rounded-full bg-status-success shrink-0" />
            </div>
            <span className="text-[10px] font-mono text-text-muted">Status: Zero-Trust Encrypted</span>
          </div>
        </div>

        {/* Live Latency telemetry pill */}
        <div className="px-2 py-0.5 rounded-md bg-surface-raised border border-border flex items-center gap-1 text-[10px] font-mono text-text-muted">
          <Activity className="w-3 h-3 text-status-success" />
          <span>{heartbeatTime}</span>
        </div>
      </div>

      {/* Security Specifications Grid */}
      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border/70 text-[11px]">
        <div className="flex items-start gap-1.5">
          <Check className="w-3.5 h-3.5 text-status-success shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-brand-ink">TLS 1.3 / AES-GCM</span>
            <p className="text-[10px] text-text-muted">Military 256-bit vault</p>
          </div>
        </div>

        <div className="flex items-start gap-1.5">
          <Check className="w-3.5 h-3.5 text-status-success shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-brand-ink">SHA-256 Hashed</span>
            <p className="text-[10px] text-text-muted">Tamper-evident QR seal</p>
          </div>
        </div>

        <div className="flex items-start gap-1.5">
          <Check className="w-3.5 h-3.5 text-status-success shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-brand-ink">8 CFR § 103.2(b)(3)</span>
            <p className="text-[10px] text-text-muted">USCIS legal acceptance</p>
          </div>
        </div>

        <div className="flex items-start gap-1.5">
          <Check className="w-3.5 h-3.5 text-status-success shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-brand-ink">Zero AI Training</span>
            <p className="text-[10px] text-text-muted">Complete client privacy</p>
          </div>
        </div>
      </div>
    </div>
  );
}
