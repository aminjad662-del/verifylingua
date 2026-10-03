"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence, useInView } from "motion/react";
import { XCircle, CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";

const tabs = [
  { id: "fail", label: "Why agencies fail" },
  { id: "succeed", label: "Why VerifyLingua succeeds" },
  { id: "compare", label: "Before vs. After" },
];

const failItems = [
  "Manual retyping destroys table structure",
  "No cryptographic verification",
  "Missing notary jurat requirements",
  "48-72 hour turnaround delays",
  "Generic certification templates",
];

const succeedItems = [
  "Sub-pixel vector layout preservation",
  "SHA-256 tamper-proof hash on every page",
  "Statutory 8 CFR § 103.2(b)(3) affidavit",
  "90-second instant delivery",
  "ATA Corporate Member seal with unique ID",
];

const listVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 400, damping: 30, mass: 0.8 },
  },
};

export default function RedesignValueProps() {
  const [activeTab, setActiveTab] = useState(tabs[0].id);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 });

  return (
    <section
      ref={sectionRef}
      className="bg-canvas py-24 sm:py-28 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="font-display text-4xl sm:text-5xl tracking-tight text-neutral-900 mb-6">
            Certified translations are the <br className="hidden sm:block" />
            <span className="font-serif italic text-neutral-600">
              most rejected filings
            </span>{" "}
            at USCIS.
          </h2>
          <p className="text-lg text-neutral-600 leading-relaxed max-w-2xl mx-auto">
            Traditional agencies retype your documents, destroying layout
            integrity. Our autonomous neural pipeline preserves every pixel.
          </p>
        </motion.div>

        {/* Tab Switcher */}
        <div className="flex justify-center mb-12">
          <div className="flex space-x-1 p-1 bg-black/[0.04] rounded-full border border-black/[0.06]">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-5 py-2.5 rounded-full text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-obsidian-950 focus-visible:ring-offset-2 ${
                  activeTab === tab.id
                    ? "text-white"
                    : "text-neutral-600 hover:text-neutral-900"
                }`}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute inset-0 bg-obsidian-950 rounded-full"
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 30,
                      mass: 0.8,
                    }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content Panels */}
        <div className="max-w-4xl mx-auto min-h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 25,
                mass: 1.0,
              }}
              className="w-full"
            >
              {/* Tab 1: Why agencies fail */}
              {activeTab === "fail" && (
                <div className="bg-white rounded-2xl border border-black/[0.06] shadow-sm p-8 sm:p-12">
                  <motion.ul
                    variants={listVariants}
                    initial="hidden"
                    animate="show"
                    className="space-y-6"
                  >
                    {failItems.map((item, i) => (
                      <motion.li
                        key={i}
                        variants={itemVariants}
                        className="flex items-start"
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          <XCircle className="w-5 h-5 text-red-500" />
                        </div>
                        <span className="ml-4 text-neutral-700 text-lg">
                          {item}
                        </span>
                      </motion.li>
                    ))}
                  </motion.ul>
                </div>
              )}

              {/* Tab 2: Why VerifyLingua succeeds */}
              {activeTab === "succeed" && (
                <div className="bg-white rounded-2xl border border-black/[0.06] shadow-sm p-8 sm:p-12 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-court-emerald"></div>
                  <motion.ul
                    variants={listVariants}
                    initial="hidden"
                    animate="show"
                    className="space-y-6"
                  >
                    {succeedItems.map((item, i) => (
                      <motion.li
                        key={i}
                        variants={itemVariants}
                        className="flex items-start"
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          <CheckCircle2 className="w-5 h-5 text-court-emerald" />
                        </div>
                        <span className="ml-4 text-neutral-900 font-medium text-lg">
                          {item}
                        </span>
                      </motion.li>
                    ))}
                  </motion.ul>
                </div>
              )}

              {/* Tab 3: Before vs. After */}
              {activeTab === "compare" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                  {/* BEFORE */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 200,
                      damping: 25,
                      mass: 1.0,
                    }}
                    className="bg-neutral-100 rounded-2xl p-6 flex flex-col border border-neutral-200"
                  >
                    <div className="flex items-center justify-between mb-8">
                      <span className="font-mono text-xs font-semibold tracking-wider text-neutral-500">
                        BEFORE
                      </span>
                      <div className="flex items-center space-x-1.5 text-red-500 bg-red-50 px-2.5 py-1 rounded-full border border-red-100">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span className="text-xs font-medium">
                          Layout Broken
                        </span>
                      </div>
                    </div>
                    
                    {/* Messy Document Mockup */}
                    <div className="flex-1 bg-white rounded-lg shadow-sm border border-neutral-200 p-6 flex flex-col space-y-4 relative overflow-hidden">
                      <div className="h-4 bg-neutral-200 rounded w-3/4 transform -rotate-1 origin-left"></div>
                      <div className="h-4 bg-neutral-200 rounded w-full transform rotate-1 origin-left"></div>
                      <div className="h-4 bg-neutral-200 rounded w-5/6"></div>
                      <div className="pt-4 grid grid-cols-2 gap-4">
                        <div className="h-20 bg-neutral-100 border border-neutral-200 rounded transform rotate-2"></div>
                        <div className="h-24 bg-neutral-100 border border-neutral-200 rounded transform -rotate-1"></div>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-white/80 to-transparent pointer-events-none"></div>
                    </div>
                  </motion.div>

                  {/* AFTER */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 200,
                      damping: 25,
                      mass: 1.0,
                      delay: 0.1,
                    }}
                    className="bg-white rounded-2xl p-6 flex flex-col border border-court-emerald/20 shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-8">
                      <span className="font-mono text-xs font-semibold tracking-wider text-court-emerald">
                        AFTER
                      </span>
                      <div className="flex items-center space-x-1.5 text-court-emerald bg-court-emerald/10 px-2.5 py-1 rounded-full border border-court-emerald/20">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span className="text-xs font-medium">
                          Pixel Perfect
                        </span>
                      </div>
                    </div>

                    {/* Clean Document Mockup */}
                    <div className="flex-1 bg-white rounded-lg shadow-sm border border-black/[0.08] p-6 flex flex-col space-y-4">
                      <div className="h-4 bg-neutral-800 rounded w-3/4"></div>
                      <div className="h-4 bg-neutral-300 rounded w-full"></div>
                      <div className="h-4 bg-neutral-300 rounded w-5/6"></div>
                      <div className="pt-4 grid grid-cols-2 gap-4">
                        <div className="h-24 bg-neutral-50 border border-black/[0.06] rounded flex flex-col justify-between p-3">
                           <div className="h-2 w-1/2 bg-neutral-200 rounded"></div>
                           <div className="h-2 w-full bg-neutral-200 rounded"></div>
                           <div className="h-2 w-3/4 bg-neutral-200 rounded"></div>
                        </div>
                        <div className="h-24 bg-neutral-50 border border-black/[0.06] rounded flex flex-col justify-between p-3">
                           <div className="h-2 w-2/3 bg-neutral-200 rounded"></div>
                           <div className="h-2 w-full bg-neutral-200 rounded"></div>
                           <div className="h-2 w-1/2 bg-neutral-200 rounded"></div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
