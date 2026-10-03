"use client";

import { motion } from "motion/react";

const logos = [
  "MORRISON & KELLY LLP",
  "CHEN IMMIGRATION",
  "BAKER FEDERAL COUNSEL",
  "RIVERA LAW GROUP",
  "GOLDSTEIN PETITIONS",
  "ATLAS LEGAL SERVICES",
];

export function RedesignLogoBar() {
  return (
    <section className="bg-canvas py-10 sm:py-12 border-b border-black/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col items-center">
        <p className="text-neutral-400 text-xs font-mono uppercase tracking-wider mb-8 text-center">
          Trusted by leading immigration law firms and institutions
        </p>
        <div className="flex flex-row flex-wrap justify-center items-center gap-10 sm:gap-14">
          {logos.map((logo) => (
            <motion.div
              key={logo}
              whileHover={{ y: -3 }}
              transition={{ type: "spring", stiffness: 400, damping: 30, mass: 0.8 }}
              className="text-neutral-300 font-display font-bold text-sm tracking-tight opacity-50 hover:opacity-100 hover:text-neutral-600 transition-colors cursor-default"
            >
              {logo}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
