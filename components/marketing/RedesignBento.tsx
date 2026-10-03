"use client";

import * as React from "react";
import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { Stamp, Maximize2, Zap, QrCode, Lock, CheckCircle2, ShieldCheck } from "lucide-react";
import { springConfig } from "@/lib/motion";

const cards = [
  {
    id: 1,
    colSpan: "md:col-span-7",
    icon: Stamp,
    iconColor: "text-amber-statutory",
    iconBg: "bg-amber-statutory/10",
    title: "USCIS 8 CFR § 103.2(b)(3) Compliance",
    description: "Architected strictly for legal admissibility. Every translation includes a statutorily compliant certification, corporate seal, and optional notary jurat to meet Federal Court and USCIS evidentiary standards.",
    badges: [
      { text: "Ready for immediate filing", color: "text-court-emerald bg-court-emerald/10 border-court-emerald/20", icon: CheckCircle2 },
      { text: "ATA Seal ID 278190", color: "text-neutral-400 bg-white/5 border-white/10", icon: ShieldCheck }
    ],
    delay: 0
  },
  {
    id: 2,
    colSpan: "md:col-span-5",
    icon: Maximize2,
    iconColor: "text-white",
    iconBg: "bg-white/10",
    title: "Sub-Pixel Layout Lock",
    description: "Our engine preserves the exact coordinate geometry, tables, signatures, and stamps of your original document. The translated output perfectly mirrors the source layout.",
    badges: [
      { text: "Max deviation: < 0.1mm", color: "text-neutral-400 bg-white/5 border-white/10" },
      { text: "1:1 Geometry", color: "text-neutral-400 bg-white/5 border-white/10" }
    ],
    delay: 0.08
  },
  {
    id: 3,
    colSpan: "md:col-span-4",
    icon: Zap,
    iconColor: "text-amber-statutory",
    iconBg: "bg-amber-statutory/10",
    title: "90-Second Turnaround",
    description: "Proprietary autonomous neural processing eliminates human bottlenecks. Get fully certified, review-ready documents in under 90 seconds, 24/7/365.",
    badges: [
      { text: "Instant PDF Download", color: "text-neutral-400 bg-white/5 border-white/10" }
    ],
    delay: 0.16
  },
  {
    id: 4,
    colSpan: "md:col-span-4",
    icon: QrCode,
    iconColor: "text-white",
    iconBg: "bg-white/10",
    title: "Public Verification Portal",
    description: "Each document is cryptographically hashed with SHA-256. Any reviewing officer can scan the embedded QR code to verify authenticity instantly on our secure portal.",
    badges: [
      { text: "SHA-256 Tamper-Proof", color: "text-neutral-400 bg-white/5 border-white/10" }
    ],
    delay: 0.24
  },
  {
    id: 5,
    colSpan: "md:col-span-4",
    icon: Lock,
    iconColor: "text-court-emerald",
    iconBg: "bg-court-emerald/10",
    title: "Bank-Grade Vault Isolation",
    description: "Your sensitive PII and legal documents are protected with AES-256 encryption in transit and at rest. Files are processed in isolated, ephemeral environments.",
    badges: [
      { text: "Zero Data Retention Mode", color: "text-neutral-400 bg-white/5 border-white/10" }
    ],
    delay: 0.32
  }
];

export function RedesignBento() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.2 });

  return (
    <section className="bg-obsidian-950 text-white py-24 sm:py-28 relative overflow-hidden">
      {/* Background Subtle Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/[0.03] via-transparent to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Header */}
        <motion.div 
          ref={containerRef}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          className="flex flex-col items-center text-center max-w-3xl mx-auto mb-16 sm:mb-24"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-statutory/10 border border-amber-statutory/20 mb-6">
            <span className="text-amber-statutory text-xs font-mono font-medium tracking-wider uppercase">
              USCIS & Federal Court Standards
            </span>
          </div>
          
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-white mb-6">
            Engineered for <span className="font-serif italic text-white/90 font-normal">zero court rejections.</span>
          </h2>
          
          <p className="text-lg text-neutral-400 font-medium">
            Every translation backed by ATA accreditation and 100% money-back guarantee.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-12 gap-5">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.6, delay: card.delay, ease: [0.23, 1, 0.32, 1] }}
                whileHover={{ y: -3 }}
                className={`col-span-12 ${card.colSpan} p-1.5 rounded-3xl bg-obsidian-950 border border-white/[0.08] group`}
              >
                <div className="h-full bg-obsidian-900 rounded-[1.125rem] p-8 sm:p-10 flex flex-col justify-between overflow-hidden relative">
                  
                  {/* Subtle Top Inner Highlight */}
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.05] to-transparent pointer-events-none" />

                  <div className="relative z-10">
                    <motion.div 
                      className={`inline-flex p-3 rounded-xl ${card.iconBg} mb-6`}
                      transition={springConfig}
                      whileHover={{ scale: 1.05 }}
                    >
                      <Icon className={`w-6 h-6 ${card.iconColor} group-hover:scale-110 transition-transform duration-300 ease-out`} />
                    </motion.div>
                    
                    <h3 className="font-display text-2xl font-semibold text-white mb-4 tracking-tight">
                      {card.title}
                    </h3>
                    
                    <p className="text-neutral-400 leading-relaxed text-[15px]">
                      {card.description}
                    </p>
                  </div>

                  {/* Footers / Badges */}
                  <div className="mt-10 flex flex-wrap gap-3 relative z-10">
                    {card.badges.map((badge, i) => (
                      <div 
                        key={i} 
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-xs font-mono font-medium ${badge.color}`}
                      >
                        {"icon" in badge && (badge as any).icon && React.createElement((badge as any).icon, { className: "w-3.5 h-3.5" })}
                        {badge.text}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
