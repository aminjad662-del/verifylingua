"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";

export function RedesignFinalCTA() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section ref={ref} className="bg-obsidian-950 py-24 sm:py-32 relative overflow-hidden border-t border-white/[0.08]">
      {/* Subtle warm ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[500px] bg-amber-statutory/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          className="text-amber-statutory text-xs sm:text-sm font-mono tracking-widest uppercase mb-8"
        >
          ZERO RISK • 100% USCIS MONEY-BACK GUARANTEE
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
          className="text-4xl sm:text-5xl md:text-6xl font-display font-medium text-white tracking-tight mb-6"
        >
          Ready to file your translation <br className="hidden sm:block" />
          <span className="font-serif italic text-amber-statutory font-normal">with absolute confidence?</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
          className="text-lg md:text-xl text-neutral-400 mb-10 max-w-2xl"
        >
          Upload your documents securely and receive a certified, USCIS-compliant translation in under 90 seconds. Sub-pixel layout preservation included.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.23, 1, 0.32, 1] }}
          className="flex flex-col sm:flex-row items-center gap-4 mb-12 w-full sm:w-auto"
        >
          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="w-full sm:w-auto px-8 py-4 bg-white text-obsidian-950 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-neutral-200 transition-colors"
          >
            Start Instant Translation
            <ArrowRight className="w-5 h-5" />
          </motion.button>
          
          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="w-full sm:w-auto px-8 py-4 bg-transparent text-white rounded-xl font-medium flex items-center justify-center gap-2 border border-white/10 hover:bg-white/5 transition-colors"
          >
            Speak with Compliance Specialist
          </motion.button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.4, ease: [0.23, 1, 0.32, 1] }}
          className="text-sm text-neutral-500 flex flex-col sm:flex-row items-center gap-2 sm:gap-4"
        >
          <span>No credit card required to inspect document</span>
          <span className="hidden sm:inline">•</span>
          <span>2,400+ law firms trust VerifyLingua</span>
        </motion.div>
      </div>
    </section>
  );
}
