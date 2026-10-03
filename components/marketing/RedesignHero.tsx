"use client";

import React, { useCallback, useState } from "react";
import { motion, useInView } from "motion/react";
import { ArrowRight, Camera, Search, Upload, Star, CheckCircle2 } from "lucide-react";
import { useDropzone } from "react-dropzone";

import { InspectionStage } from "./InspectionStage";
import { SPRING_MICRO } from "@/lib/motion";
import { cn } from "@/lib/utils";

const FADE_UP_ANIMATION_VARIANTS = {
  hidden: { opacity: 0, y: 15 },
  show: (custom: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 200,
      damping: 25,
      mass: 1.0,
      delay: custom * 0.1,
    },
  }),
};

export function RedesignHero() {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Handle files here
    console.log(acceptedFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
  });

  return (
    <section
      ref={ref}
      className="relative w-full overflow-hidden bg-canvas py-24 sm:py-28"
    >
      {/* Grid Pattern Overlay */}
      <div className="pointer-events-none absolute inset-0 z-0 flex justify-center">
        <div
          className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTAgMGg0MHY0MEgwVjB6bTM5IDM5VjFoLTM4djM4aDM4eiIgZmlsbD0icmdiYSgwLDAsMCwwLjAyKSIgZmlsbC1ydWxlPSJldmVub2RkIi8+PC9zdmc+')] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]"
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8 items-center">
          
          {/* Left Column */}
          <div className="col-span-1 lg:col-span-5 flex flex-col items-start text-left">
            
            {/* Eyebrow */}
            <motion.div
              custom={0}
              initial="hidden"
              animate={isInView ? "show" : "hidden"}
              variants={FADE_UP_ANIMATION_VARIANTS}
              className="mb-6 inline-flex items-center space-x-2 rounded-full border border-black/[0.06] bg-white px-3 py-1 text-xs font-mono font-medium text-neutral-900 shadow-sm"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-court-emerald opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-court-emerald"></span>
              </span>
              <span>USCIS 8 CFR § 103.2 CERTIFIED</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              custom={1}
              initial="hidden"
              animate={isInView ? "show" : "hidden"}
              variants={FADE_UP_ANIMATION_VARIANTS}
              className="mb-6 text-5xl font-display font-medium tracking-tight text-neutral-900 sm:text-6xl md:text-7xl leading-[1.05]"
            >
              Stop filing with <br className="hidden sm:block" />
              <span className="font-serif italic text-neutral-500">uncertified translations.</span>
            </motion.h1>

            {/* Subtext */}
            <motion.p
              custom={2}
              initial="hidden"
              animate={isInView ? "show" : "hidden"}
              variants={FADE_UP_ANIMATION_VARIANTS}
              className="mb-8 max-w-lg text-lg text-neutral-600 sm:text-xl leading-relaxed"
            >
              Get compliant, sub-pixel accurate translations in 90 seconds. Cryptographically verified and accepted by USCIS—or your money back.
            </motion.p>

            {/* Search / Drop Bar */}
            <motion.div
              custom={3}
              initial="hidden"
              animate={isInView ? "show" : "hidden"}
              variants={FADE_UP_ANIMATION_VARIANTS}
              className="mb-8 w-full max-w-md"
            >
              <div 
                {...getRootProps()}
                className={cn(
                  "relative flex items-center rounded-2xl border bg-white p-2 shadow-sm transition-all duration-300",
                  isDragActive ? "border-amber-statutory bg-amber-50/50" : "border-black/[0.08]",
                  isSearchFocused ? "ring-2 ring-amber-statutory/20 border-amber-statutory" : ""
                )}
              >
                <div className="pointer-events-none pl-3 text-neutral-400">
                  <Search className="h-5 w-5" />
                </div>
                <input
                  {...getInputProps()}
                  className="hidden"
                />
                <input
                  type="text"
                  placeholder={isDragActive ? "Drop files here..." : "Search docs or drop file..."}
                  className="w-full bg-transparent px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                />
                
                <div className="flex items-center space-x-2 pr-2">
                  <button 
                    type="button"
                    aria-label="Upload document"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
                  >
                    <Upload className="h-4 w-4" />
                  </button>
                  <button 
                    type="button"
                    aria-label="Scan document with camera"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-900 sm:hidden"
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>

            {/* CTAs */}
            <motion.div
              custom={4}
              initial="hidden"
              animate={isInView ? "show" : "hidden"}
              variants={FADE_UP_ANIMATION_VARIANTS}
              className="mb-12 flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-x-6 sm:space-y-0"
            >
              <motion.button
                whileHover={{ scale: 1.015, y: -1 }}
                whileTap={{ scale: 0.985 }}
                transition={SPRING_MICRO}
                className="group flex items-center justify-center space-x-2 rounded-full bg-obsidian-950 px-6 py-3.5 text-sm font-medium text-white transition-colors hover:bg-obsidian-900 focus:outline-none focus:ring-2 focus:ring-obsidian-950/50 focus:ring-offset-2 focus:ring-offset-canvas"
              >
                <span>Translate Your Documents</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </motion.button>

              <a
                href="#"
                className="text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900 flex items-center group"
              >
                Explore 140+ official formats
                <ArrowRight className="ml-1 h-3.5 w-3.5 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
              </a>
            </motion.div>

            {/* Social Proof */}
            <motion.div
              custom={5}
              initial="hidden"
              animate={isInView ? "show" : "hidden"}
              variants={FADE_UP_ANIMATION_VARIANTS}
              className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-x-6 sm:space-y-0 text-sm"
            >
              <div className="flex flex-col space-y-1">
                <div className="flex items-center space-x-1 text-amber-statutory">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                  <span className="ml-2 font-mono font-medium text-neutral-900">4.98/5</span>
                </div>
                <span className="text-neutral-500 font-mono text-xs">2,400+ Law Firms</span>
              </div>
              
              <div className="hidden h-8 w-px bg-black/[0.06] sm:block" />
              
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-5 w-5 text-court-emerald" />
                <span className="font-mono text-neutral-900">0% USCIS Rejections</span>
              </div>
            </motion.div>

          </div>

          {/* Right Column - InspectionStage */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
            transition={{ type: "spring", stiffness: 200, damping: 25, mass: 1.0, delay: 0.3 }}
            className="col-span-1 lg:col-span-7"
          >
            <InspectionStage />
          </motion.div>

        </div>
      </div>
    </section>
  );
}
