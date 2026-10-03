"use client";

import React, { useRef } from "react";
import { motion, useInView } from "motion/react";
import { Star } from "lucide-react";
import { SPRING_VIEW } from "@/lib/motion";

const testimonials = [
  {
    quote:
      "We switched from a traditional agency charging $35 per page. VerifyLingua delivered identical quality in 90 seconds for $0.30. Zero USCIS rejections in 14 months.",
    author: "Maria Chen, Partner",
    firm: "Chen Immigration Law, San Francisco",
    badge: "Immigration Attorney",
  },
  {
    quote:
      "The layout preservation is remarkable. Mexican birth certificates with complex tables and stamps come through pixel-perfect. Our paralegals save 4 hours per petition packet.",
    author: "David Rivera, Managing Attorney",
    firm: "Rivera Federal Practice, Miami",
    badge: "Federal Practice",
  },
  {
    quote:
      "The cryptographic verification sealed the deal. When an immigration judge questioned our translation, we scanned the QR code and proved authenticity on the spot.",
    author: "Sarah Goldstein, Of Counsel",
    firm: "Goldstein & Associates, New York",
    badge: "Litigation Counsel",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 200,
      damping: 25,
      mass: 1.0,
    },
  },
};

const StarRating = () => {
  return (
    <div className="flex gap-1 mb-6">
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 30,
            mass: 0.8,
            delay: i * 0.05,
          }}
        >
          <Star className="w-4 h-4 fill-amber-statutory text-amber-statutory" />
        </motion.div>
      ))}
    </div>
  );
};

export default function RedesignTestimonials() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.2 });

  return (
    <section className="bg-canvas py-24 sm:py-28 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          ref={containerRef}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={containerVariants}
          className="text-center max-w-3xl mx-auto mb-16 sm:mb-20"
        >
          <motion.h2
            variants={itemVariants}
            className="text-4xl sm:text-5xl tracking-tight text-neutral-900 font-display mb-4"
          >
            <span className="font-normal">Immigration attorneys already trust </span>
            <span className="font-extrabold">VerifyLingua.</span>
          </motion.h2>
          <motion.div variants={itemVariants}>
            <span className="font-mono text-neutral-500 text-sm tracking-tight px-4 py-1.5 rounded-full border border-black/[0.06] bg-white">
              4.98/5 from 2,400+ law firms
            </span>
          </motion.div>
        </motion.div>

        {/* Testimonial Grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 sm:mb-16"
        >
          {testimonials.map((testimonial, idx) => (
            <motion.div key={idx} variants={itemVariants} whileHover={{ y: -3 }} className="h-full">
              {/* Outer Bezel (Light) */}
              <div className="p-1 bg-white border border-black/[0.06] rounded-2xl shadow-2xs h-full">
                {/* Inner Bezel */}
                <div className="p-6 sm:p-8 bg-canvas rounded-xl border border-black/[0.04] h-full flex flex-col">
                  <StarRating />
                  <p className="text-neutral-700 leading-relaxed flex-grow mb-8">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>
                  <div className="mt-auto">
                    <div className="font-mono text-xs text-neutral-400 mb-2 uppercase tracking-wider">
                      {testimonial.badge}
                    </div>
                    <div className="font-medium text-neutral-900">{testimonial.author}</div>
                    <div className="text-sm text-neutral-500">{testimonial.firm}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Featured Testimonial */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ type: "spring", stiffness: 200, damping: 25, mass: 1.0 }}
        >
          {/* Subtle gradient border wrapper for amber glow */}
          <div className="p-[1px] bg-gradient-to-br from-amber-statutory/30 via-black/[0.08] to-transparent rounded-2xl md:rounded-3xl shadow-xl">
            <div className="bg-obsidian-950 rounded-[15px] md:rounded-[23px] p-8 md:p-12 border border-white/[0.08]">
              <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
                <div className="flex-1">
                  <div className="flex gap-1 justify-center md:justify-start mb-6">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <Star key={i} className="w-5 h-5 fill-amber-statutory text-amber-statutory" />
                    ))}
                  </div>
                  <h3 className="text-xl sm:text-2xl text-white font-display leading-snug mb-8">
                    &ldquo;VerifyLingua has fundamentally changed how our firm handles multi-language petition packets. The combination of instant delivery, guaranteed USCIS acceptance, and cryptographic proof makes it indispensable.&rdquo;
                  </h3>
                  <div>
                    <div className="font-medium text-white text-lg">James Morrison, Founding Partner</div>
                    <div className="text-neutral-400">Morrison & Kelly LLP, Washington D.C.</div>
                  </div>
                </div>

                {/* Stats Divider (Desktop) / Separator (Mobile) */}
                <div className="hidden md:block w-px h-auto self-stretch bg-white/[0.08] mx-4" />
                <div className="md:hidden w-full h-px bg-white/[0.08] my-4" />

                {/* Featured Stats */}
                <div className="flex flex-col gap-6 md:w-64 shrink-0">
                  <div className="flex flex-col gap-1">
                    <span className="font-mono text-amber-statutory text-sm">Volume</span>
                    <span className="text-white font-medium">1,200+ Documents Translated</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-mono text-amber-statutory text-sm">Efficiency</span>
                    <span className="text-white font-medium">$0.28 avg/page</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-mono text-amber-statutory text-sm">Success Rate</span>
                    <span className="text-white font-medium">0 Rejections</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
