"use client";

import { motion } from "motion/react";
import { ArrowRight, CheckCircle2, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const SPRING_CONFIG = { type: "spring", stiffness: 350, damping: 28, mass: 1 } as const;
const EASE_OUT = [0.23, 1, 0.32, 1] as const;

export function AwwwardsHero() {
  const [isTranslated, setIsTranslated] = useState(false);

  return (
    <section className="relative min-h-[90vh] pt-32 pb-16 overflow-hidden bg-[#FAFAF8] text-[#1A1816]">
      {/* Absolute positioning background grid or noise (subtle) */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #000 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>

      <div className="container mx-auto px-6 lg:px-12 relative z-10 max-w-7xl">
        <div className="grid lg:grid-cols-12 gap-16 lg:gap-8 items-center">
          
          {/* Left Content - Typography & CTA */}
          <motion.div 
            className="lg:col-span-5 flex flex-col items-start"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE_OUT }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neutral-200 bg-white shadow-sm mb-8">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
              <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-600 font-medium">USCIS 8 CFR § 103.2 Compliant</span>
            </div>

            <h1 className="text-5xl lg:text-7xl font-serif tracking-tight leading-[1.05] text-[#1A1816] mb-6">
              Precision legal translation.<br/>
              <span className="text-neutral-400 italic">No overlap.</span>
            </h1>

            <p className="text-lg text-neutral-500 leading-relaxed max-w-lg mb-10 font-sans">
              The world’s first bounding-box aware engine for immigration, court, and patent documents. 
              We extract graphics securely and reconstruct authentic layouts down to the pixel.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link href="/translate">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  transition={SPRING_CONFIG}
                  className="w-full sm:w-auto px-8 py-4 bg-[#1A1816] text-white rounded-xl font-medium tracking-wide flex items-center justify-center gap-2 shadow-xl shadow-black/10 hover:shadow-black/20"
                >
                  Start Translation
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </Link>
              <Link href="/pricing">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  transition={SPRING_CONFIG}
                  className="w-full sm:w-auto px-8 py-4 bg-white border border-neutral-200 text-[#1A1816] rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-neutral-50"
                >
                  View Pricing
                </motion.button>
              </Link>
            </div>

            <div className="mt-10 flex items-center gap-6 text-sm text-neutral-500 font-medium">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Instant Turnaround</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Zero Data Retention</span>
              </div>
            </div>
          </motion.div>

          {/* Right Content - Interactive Stage */}
          <motion.div 
            className="lg:col-span-7 relative"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: EASE_OUT, delay: 0.2 }}
          >
            <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] bg-white rounded-2xl border border-neutral-200 shadow-2xl shadow-black/5 overflow-hidden flex flex-col">
              
              {/* Studio Toolbar */}
              <div className="h-12 border-b border-neutral-100 bg-[#FAFAF8] flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                  </div>
                  <div className="ml-4 h-6 px-3 bg-white border border-neutral-200 rounded-md flex items-center justify-center">
                    <span className="text-[10px] font-mono text-neutral-400">document_v2.pdf</span>
                  </div>
                </div>
                
                {/* Before/After Toggle */}
                <div className="flex bg-neutral-100 p-1 rounded-lg">
                  <button 
                    onClick={() => setIsTranslated(false)}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${!isTranslated ? 'bg-white shadow-sm text-black' : 'text-neutral-500 hover:text-black'}`}
                  >
                    Original
                  </button>
                  <button 
                    onClick={() => setIsTranslated(true)}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${isTranslated ? 'bg-white shadow-sm text-black' : 'text-neutral-500 hover:text-black'}`}
                  >
                    Translated
                  </button>
                </div>
              </div>

              {/* Canvas Area */}
              <div className="flex-1 relative bg-neutral-50 overflow-hidden group cursor-crosshair">
                <motion.div 
                  className="absolute inset-0 p-8 flex items-center justify-center"
                  animate={{ opacity: isTranslated ? 0 : 1, y: isTranslated ? -10 : 0 }}
                  transition={{ duration: 0.4, ease: EASE_OUT }}
                  style={{ pointerEvents: isTranslated ? 'none' : 'auto' }}
                >
                  {/* Mock Original Document */}
                  <div className="w-full max-w-sm bg-white shadow-lg border border-neutral-200 p-8 flex flex-col gap-4 relative">
                    {/* Bounding box overlay on hover */}
                    <div className="absolute top-8 left-8 right-8 h-8 border border-dashed border-blue-400 bg-blue-50/30 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute -top-5 left-0 bg-blue-500 text-white text-[9px] font-mono px-1 rounded-sm">TEXT_BLOCK_01</div>
                    </div>
                    <div className="h-8 bg-neutral-200 rounded-sm w-3/4"></div>
                    <div className="h-32 bg-neutral-100 rounded-sm w-full border border-neutral-200 flex items-center justify-center text-neutral-400 text-xs">
                      [ Illustration Area ]
                    </div>
                    <div className="h-4 bg-neutral-200 rounded-sm w-full mt-2"></div>
                    <div className="h-4 bg-neutral-200 rounded-sm w-5/6"></div>
                    <div className="h-4 bg-neutral-200 rounded-sm w-4/6"></div>
                  </div>
                </motion.div>

                <motion.div 
                  className="absolute inset-0 p-8 flex items-center justify-center"
                  animate={{ opacity: isTranslated ? 1 : 0, y: isTranslated ? 0 : 10 }}
                  transition={{ duration: 0.4, ease: EASE_OUT }}
                  style={{ pointerEvents: isTranslated ? 'auto' : 'none' }}
                >
                  {/* Mock Translated Document */}
                  <div className="w-full max-w-sm bg-white shadow-lg border border-neutral-200 p-8 flex flex-col gap-4 relative">
                    <div className="h-8 bg-emerald-100 border border-emerald-200 rounded-sm w-3/4 flex items-center px-2">
                      <span className="text-[10px] text-emerald-800 font-medium">Translated Title Block</span>
                    </div>
                    <div className="h-32 bg-neutral-100 rounded-sm w-full border border-neutral-200 flex items-center justify-center text-neutral-400 text-xs">
                      [ Extracted & Preserved ]
                    </div>
                    <div className="h-4 bg-emerald-100 border border-emerald-200 rounded-sm w-full mt-2 flex items-center px-2"><span className="text-[8px] text-emerald-800">Translated Line</span></div>
                    <div className="h-4 bg-emerald-100 border border-emerald-200 rounded-sm w-5/6 flex items-center px-2"><span className="text-[8px] text-emerald-800">Translated Line</span></div>
                    <div className="h-4 bg-emerald-100 border border-emerald-200 rounded-sm w-4/6 flex items-center px-2"><span className="text-[8px] text-emerald-800">Translated Line</span></div>
                  </div>
                </motion.div>

                {/* Magnification Loupe (Follows mouse via CSS/JS normally, here abstract representation) */}
                <div className="absolute right-6 bottom-6 w-12 h-12 rounded-full bg-white shadow-xl border border-neutral-200 flex items-center justify-center text-neutral-400 pointer-events-none group-hover:scale-110 transition-transform">
                  <Search className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Decorative abstract lines/shapes */}
            <div className="absolute -z-10 -right-12 -top-12 w-64 h-64 bg-amber-100/50 rounded-full blur-3xl opacity-50 mix-blend-multiply"></div>
            <div className="absolute -z-10 -left-12 -bottom-12 w-64 h-64 bg-blue-100/50 rounded-full blur-3xl opacity-50 mix-blend-multiply"></div>

          </motion.div>
        </div>
      </div>
    </section>
  );
}
