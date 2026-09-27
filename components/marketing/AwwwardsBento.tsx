"use client";

import { motion } from "motion/react";
import { Shield, Clock, Stamp, Scaling } from "lucide-react";

const SPRING_CONFIG = { type: "spring", stiffness: 350, damping: 28, mass: 1 } as const;
const EASE_OUT = [0.23, 1, 0.32, 1] as const;

export function AwwwardsBento() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE_OUT } }
  };

  return (
    <section className="py-24 bg-white border-t border-neutral-100">
      <div className="container mx-auto px-6 lg:px-12 max-w-7xl">
        
        <div className="mb-16">
          <h2 className="text-3xl font-serif text-[#1A1816] mb-4">Enterprise Grade Standards</h2>
          <p className="text-neutral-500 max-w-xl text-sm leading-relaxed">
            Designed specifically for legal, medical, and technical translation where structural variance is unacceptable.
          </p>
        </div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[280px]"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* Card 1 - Spans 2 cols */}
          <motion.div 
            variants={item}
            whileHover={{ scale: 0.985 }}
            transition={SPRING_CONFIG}
            className="md:col-span-2 lg:col-span-2 bg-[#FAFAF8] rounded-3xl p-10 flex flex-col justify-between border border-neutral-200 cursor-default"
          >
            <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-neutral-200 flex items-center justify-center text-[#1A1816] mb-6">
              <Scaling className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-medium text-[#1A1816] mb-2">Absolute Vector Fidelity</h3>
              <p className="text-neutral-500 text-sm leading-relaxed">
                Images, signatures, and stamps are strictly isolated. Text is injected exactly within the original bounding coordinates, dynamically scaled to prevent overflow.
              </p>
            </div>
          </motion.div>

          {/* Card 2 - Spans 1 col */}
          <motion.div 
            variants={item}
            whileHover={{ scale: 0.985 }}
            transition={SPRING_CONFIG}
            className="md:col-span-1 lg:col-span-1 bg-[#1A1816] text-white rounded-3xl p-10 flex flex-col justify-between cursor-default"
          >
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-6">
              <Shield className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-xl font-medium mb-2">USCIS 8 CFR § 103.2</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">
                Legally compliant for immigration submission.
              </p>
            </div>
          </motion.div>

          {/* Card 3 - Spans 1 col */}
          <motion.div 
            variants={item}
            whileHover={{ scale: 0.985 }}
            transition={SPRING_CONFIG}
            className="md:col-span-1 lg:col-span-1 bg-[#FAFAF8] rounded-3xl p-10 flex flex-col justify-between border border-neutral-200 cursor-default"
          >
            <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-neutral-200 flex items-center justify-center text-[#1A1816] mb-6">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-medium text-[#1A1816] mb-2">Instant Turnaround</h3>
              <p className="text-neutral-500 text-sm leading-relaxed">
                Processed in seconds, not days.
              </p>
            </div>
          </motion.div>

          {/* Card 4 - Spans full width on mobile, 3 cols on desktop */}
          <motion.div 
            variants={item}
            whileHover={{ scale: 0.985 }}
            transition={SPRING_CONFIG}
            className="md:col-span-3 lg:col-span-4 bg-[#FAFAF8] rounded-3xl p-10 flex flex-col sm:flex-row justify-between items-start sm:items-center border border-neutral-200 cursor-default relative overflow-hidden"
          >
            <div className="absolute right-0 bottom-0 opacity-5 w-64 h-64 translate-x-1/4 translate-y-1/4">
              <Stamp className="w-full h-full" />
            </div>
            
            <div className="relative z-10 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neutral-200 bg-white mb-6">
                <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-600 font-bold">Certification</span>
              </div>
              <h3 className="text-2xl font-medium text-[#1A1816] mb-3">Included Affidavit of Accuracy</h3>
              <p className="text-neutral-500 text-sm leading-relaxed">
                Every document output receives a dynamically generated certification page appended, containing the cryptographic hash and digital signature verifying translation integrity.
              </p>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}
