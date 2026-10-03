"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { Check, ShieldCheck, Lock, FileText, ArrowRight } from "lucide-react";

const plans = [
  {
    name: "Small Pack",
    price: "$9.99",
    unit: "one-time",
    description: "For individual filings",
    features: [
      "25 pages included ($0.40/page)",
      "USCIS certification",
      "ATA corporate seal",
      "Sub-pixel layout preservation",
      "QR verification",
      "Permanent vault access",
    ],
    cta: "Start with 25 Pages",
    popular: false,
  },
  {
    name: "Standard Pack",
    price: "$29.99",
    unit: "one-time",
    description: "For comprehensive petitions",
    features: [
      "100 pages included ($0.30/page)",
      "Priority processing",
      "USCIS + court admissibility",
      "Notary + ATA stamp",
      "Zero-retention policy",
      "Batch download",
      "30-day revision period",
    ],
    cta: "Get 100 Pages (Save 25%)",
    popular: true,
  },
  {
    name: "Agency Monthly",
    price: "$119",
    unit: "/mo",
    description: "For law firms and agencies",
    features: [
      "500 pages/mo included ($0.24/page)",
      "Team workspace",
      "Custom letterhead",
      "API access",
      "Compliance manager",
      "Rollover credits",
    ],
    cta: "Deploy Firm Workspace",
    popular: false,
  },
];

export function RedesignPricing() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  return (
    <section ref={ref} className="bg-obsidian-950 py-24 sm:py-28 relative overflow-hidden border-t border-white/[0.08]">
      {/* Background ambient glow for the popular card */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-amber-statutory/10 blur-[120px] rounded-full pointer-events-none opacity-50" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-statutory/10 border border-amber-statutory/20 text-amber-statutory text-sm font-mono tracking-tight mb-6"
          >
            TRANSPARENT US-LEGAL PRICING
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
            className="text-4xl sm:text-5xl font-display font-medium text-white tracking-tight mb-6"
          >
            Certified legal translations from <span className="font-serif italic text-amber-statutory">$0.24 / page.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className="text-lg text-neutral-400"
          >
            Zero lock-in. Pay only for the pages you need with transparent per-page pricing that scales with your filing volume.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: 0.3 + i * 0.1, ease: [0.23, 1, 0.32, 1] }}
              whileHover={{ y: -4 }}
              className={`p-1.5 rounded-3xl border ${
                plan.popular 
                  ? 'border-amber-statutory/30 bg-white/[0.04] md:-translate-y-2' 
                  : 'border-white/[0.08] bg-obsidian-950'
              }`}
            >
              <div className={`h-full rounded-[20px] p-8 border flex flex-col ${
                plan.popular 
                  ? 'bg-obsidian-900 border-amber-statutory/20 relative overflow-hidden' 
                  : 'bg-obsidian-900/50 border-white/[0.04]'
              }`}>
                {plan.popular && (
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-statutory/0 via-amber-statutory to-amber-statutory/0" />
                )}
                
                <div className="mb-8">
                  {plan.popular && (
                    <div className="text-xs font-bold uppercase tracking-wider text-amber-statutory mb-2">
                      Most Popular
                    </div>
                  )}
                  <h3 className="text-xl font-medium text-white mb-2">{plan.name}</h3>
                  <p className="text-sm text-neutral-400 mb-6 h-5">{plan.description}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-display font-medium text-white">{plan.price}</span>
                    <span className="text-neutral-400">{plan.unit}</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8 flex-grow">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-3">
                      <div className="mt-1 w-4 h-4 rounded-full bg-court-emerald/10 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-court-emerald" />
                      </div>
                      <span className="text-sm text-neutral-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`w-full py-3 px-4 rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2 ${
                    plan.popular
                      ? 'bg-white text-obsidian-950 hover:bg-neutral-200'
                      : 'bg-white/10 text-white border border-white/10 hover:bg-white/20'
                  }`}
                >
                  {plan.cta}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.6, ease: [0.23, 1, 0.32, 1] }}
          className="flex flex-wrap items-center justify-center gap-8 md:gap-16 pt-8 border-t border-white/[0.08]"
        >
          <div className="flex items-center gap-2 text-neutral-400">
            <ShieldCheck className="w-5 h-5" />
            <span className="text-sm font-medium">100% Money-Back</span>
          </div>
          <div className="flex items-center gap-2 text-neutral-400">
            <Lock className="w-5 h-5" />
            <span className="text-sm font-medium">Stripe 256-Bit</span>
          </div>
          <div className="flex items-center gap-2 text-neutral-400">
            <FileText className="w-5 h-5" />
            <span className="text-sm font-medium">ATA Corporate Seal</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
