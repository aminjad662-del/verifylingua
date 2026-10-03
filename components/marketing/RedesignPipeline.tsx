"use client";

import React, { useRef } from "react";
import { motion, useInView } from "motion/react";
import { 
  FileUp, 
  Scan, 
  Grid, 
  Languages, 
  Layers, 
  Stamp, 
  ShieldCheck, 
  Award,
  CheckCircle2
} from "lucide-react";
import { SPRING_VIEW } from "@/lib/motion";

const PIPELINE_STEPS = [
  {
    id: "01",
    icon: FileUp,
    title: "Intake & Script Sentry",
    description: "Validates format, DPI ≥ 300, Core 4 LTR script matrix",
  },
  {
    id: "02",
    icon: Scan,
    title: "Sub-Pixel Vision OCR",
    description: "99.98% accuracy character extraction",
  },
  {
    id: "03",
    icon: Grid,
    title: "Artwork & Seal Isolator",
    description: "Preserves watermarks, stamps, signatures",
  },
  {
    id: "04",
    icon: Languages,
    title: "Contextual Legal MT",
    description: "Neural synthesis with ATA glossaries",
  },
  {
    id: "05",
    icon: Layers,
    title: "Vector Layout Reconstructor",
    description: "0px shift reflow preservation",
  },
  {
    id: "06",
    icon: Stamp,
    title: "Notarial Certification Engine",
    description: "8 CFR § 103.2 affidavit attachment",
  },
  {
    id: "07",
    icon: ShieldCheck,
    title: "Cryptographic Proof Seal",
    description: "SHA-256 hash + QR audit badge",
  },
  {
    id: "08",
    icon: Award,
    title: "Vault Delivery Gateway",
    description: "AES-256 encrypted instant PDF",
  },
];

export function RedesignPipeline() {
  const containerRef = useRef<HTMLElement>(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.2 });

  return (
    <section 
      ref={containerRef}
      className="relative py-24 sm:py-28 bg-obsidian-950 text-white overflow-hidden"
    >
      {/* Grid background overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03]" 
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 24V0H24' stroke='white' stroke-width='1'/%3E%3C/svg%3E")`,
          backgroundSize: '24px 24px'
        }}
      />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-8 mb-20">
          <div className="max-w-3xl">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
              transition={{ ...SPRING_VIEW, delay: 0.1 }}
              className="inline-flex items-center rounded-full px-3 py-1 text-sm font-mono text-amber-statutory bg-amber-statutory/10 ring-1 ring-amber-statutory/20 mb-6"
            >
              THE 8-AGENT NEURAL PIPELINE
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ ...SPRING_VIEW, delay: 0.2 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-display tracking-tight text-white leading-[1.1]"
            >
              Every document passes through{" "}
              <span className="font-serif italic text-neutral-400 font-light">eight specialized AI agents.</span>
            </motion.h2>
          </div>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ ...SPRING_VIEW, delay: 0.3 }}
            className="text-neutral-400 max-w-md lg:text-right"
          >
            Our proprietary pipeline orchestrates multiple specialized models to guarantee cryptographic fidelity, legal compliance, and sub-pixel accuracy.
          </motion.p>
        </div>

        {/* Timeline Flow */}
        <div className="relative max-w-4xl mx-auto pl-12 sm:pl-20">
          {/* Vertical Line */}
          <div className="absolute left-[1.4rem] sm:left-[2.4rem] top-8 bottom-8 w-px bg-white/[0.04]" />
          <motion.div 
            initial={{ height: 0 }}
            animate={isInView ? { height: "100%" } : { height: 0 }}
            transition={{ duration: 1.5, ease: [0.23, 1, 0.32, 1], delay: 0.4 }}
            className="absolute left-[1.4rem] sm:left-[2.4rem] top-8 w-px bg-gradient-to-b from-amber-statutory to-amber-statutory/20 origin-top z-0"
          />

          <div className="flex flex-col gap-4 sm:gap-6 relative z-10">
            {PIPELINE_STEPS.map((step, index) => {
              const Icon = step.icon;
              const isEven = index % 2 === 0;
              
              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                  transition={{ ...SPRING_VIEW, delay: 0.4 + index * 0.1 }}
                  className={`relative flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 p-5 sm:p-6 rounded-2xl border border-white/[0.08] ${
                    isEven ? "bg-obsidian-900/80" : "bg-obsidian-950/80"
                  } backdrop-blur-sm`}
                >
                  {/* Timeline dot */}
                  <div className="absolute -left-[3.35rem] sm:-left-[4.35rem] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-obsidian-950 border-2 border-amber-statutory shadow-[0_0_12px_rgba(255,191,0,0.3)] z-20 flex items-center justify-center">
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={isInView ? { scale: 1 } : { scale: 0 }}
                      transition={{ type: "spring", delay: 0.6 + index * 0.1 }}
                      className="w-1.5 h-1.5 bg-amber-statutory rounded-full"
                    />
                  </div>

                  {/* Icon & ID */}
                  <div className="flex items-center gap-4 min-w-[140px]">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/[0.04] text-white">
                      <Icon className="w-6 h-6" strokeWidth={1.5} />
                    </div>
                    <div className="font-mono text-sm text-neutral-500">{step.id}</div>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="text-lg font-display text-white mb-1">{step.title}</h3>
                    <p className="text-sm text-neutral-400">{step.description}</p>
                  </div>

                  {/* Status Badge */}
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }}
                    transition={{ ...SPRING_VIEW, delay: 0.8 + index * 0.1 }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-court-emerald/10 border border-court-emerald/20 text-court-emerald font-mono text-xs w-fit mt-2 sm:mt-0"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>VERIFIED</span>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
