"use client";

import React from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Star, Sparkles } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative w-full pt-32 pb-20 overflow-hidden bg-white selection:bg-blue-500/30">
      {/* Background Glow (Arcade / Synthesia inspired) */}
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-500/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-[40%] left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-500/20 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col items-center text-center">
        {/* Top Badge */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold mb-8 shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>The new standard for certified translations</span>
        </motion.div>

        {/* Headline (Spyglass / Arcade inspired) */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1] max-w-4xl mb-6"
        >
          Certified translations that <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">drive approvals.</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
          className="text-lg md:text-xl text-slate-600 max-w-2xl mb-10 leading-relaxed font-medium"
        >
          Upload your documents, and our AI-assisted expert network guarantees USCIS compliance and court acceptance with a 100% success rate.
        </motion.p>

        {/* CTAs */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
          className="flex flex-col sm:flex-row items-center gap-4 mb-16"
        >
          <Link href="/order/triage">
            <button className="h-14 px-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-[0_8px_20px_rgba(37,99,235,0.25)] transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_25px_rgba(37,99,235,0.35)] flex items-center gap-2">
              Get started for free
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
          <Link href="/contact">
            <button className="h-14 px-8 rounded-full bg-white border border-slate-200 text-slate-700 font-bold text-base hover:bg-slate-50 transition-colors shadow-sm">
              Talk to Sales
            </button>
          </Link>
        </motion.div>

        {/* Social Proof Text */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="text-sm text-slate-500 font-medium mb-12"
        >
          Trusted by <span className="text-slate-900 font-bold">10,000+</span> law firms, agencies, and creators.
        </motion.div>

        {/* Floating Mockup with UI Elements (FeedHive inspired) */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, type: "spring", stiffness: 100 }}
          className="relative w-full max-w-5xl aspect-video bg-white rounded-2xl border border-slate-200 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] p-2 md:p-4 overflow-hidden z-20"
        >
          {/* Main Mockup Inner */}
          <div className="w-full h-full bg-slate-50 rounded-xl border border-slate-100 overflow-hidden relative">
             {/* Fake App Interface */}
             <div className="h-12 border-b border-slate-200 flex items-center px-4 gap-2 bg-white">
               <div className="flex gap-1.5">
                 <div className="w-3 h-3 rounded-full bg-red-400"></div>
                 <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                 <div className="w-3 h-3 rounded-full bg-green-400"></div>
               </div>
               <div className="mx-auto h-6 w-64 bg-slate-100 rounded-md"></div>
             </div>
             
             <div className="p-8 flex gap-8 h-full bg-[#F8FAFC]">
               {/* Sidebar */}
               <div className="w-48 hidden md:flex flex-col gap-3">
                 <div className="h-4 w-24 bg-slate-200 rounded"></div>
                 <div className="h-8 w-full bg-white border border-slate-200 rounded shadow-sm"></div>
                 <div className="h-8 w-full bg-white border border-slate-200 rounded shadow-sm"></div>
                 <div className="h-8 w-full bg-white border border-slate-200 rounded shadow-sm"></div>
               </div>
               
               {/* Main Canvas */}
               <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm p-6 relative">
                 <div className="h-6 w-48 bg-slate-200 rounded mb-6"></div>
                 <div className="space-y-4">
                   <div className="h-32 w-full bg-slate-50 border border-slate-100 rounded-lg"></div>
                   <div className="h-32 w-full bg-slate-50 border border-slate-100 rounded-lg"></div>
                 </div>

                 {/* Floating Badges */}
                 <motion.div 
                   animate={{ y: [0, -10, 0] }}
                   transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                   className="absolute -right-12 top-12 bg-white px-4 py-3 rounded-xl shadow-xl border border-slate-100 flex items-center gap-3"
                 >
                   <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                     <CheckCircle2 className="w-4 h-4 text-green-600" />
                   </div>
                   <div className="flex flex-col text-left">
                     <span className="text-xs font-bold text-slate-800">100% Readable</span>
                     <span className="text-[10px] text-slate-500">Quality gate passed</span>
                   </div>
                 </motion.div>

                 <motion.div 
                   animate={{ y: [0, 10, 0] }}
                   transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                   className="absolute -left-10 bottom-20 bg-white px-4 py-3 rounded-xl shadow-xl border border-slate-100 flex items-center gap-3"
                 >
                   <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-lg">
                     🎯
                   </div>
                   <div className="flex flex-col text-left">
                     <span className="text-xs font-bold text-slate-800">Perfect Formatting</span>
                     <span className="text-[10px] text-slate-500">Layout preserved</span>
                   </div>
                 </motion.div>

               </div>
             </div>
          </div>
        </motion.div>
      </div>

    </section>
  );
}
