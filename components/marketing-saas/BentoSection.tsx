"use client";

import React from "react";
import { motion } from "motion/react";
import { Search, Compass, Zap, Workflow, SearchCheck, Fingerprint } from "lucide-react";

export function BentoSection() {
  return (
    <section className="w-full bg-[#050505] text-white py-32 px-6">
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        
        {/* Section Headline */}
        <div className="text-center mb-20 max-w-3xl">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Watch. Search. <span className="text-slate-500">Translate.</span>
          </h2>
          <p className="text-lg md:text-xl text-slate-400 font-medium">
            Creative intelligence in three moves. The world&apos;s fastest compliance engine for certified translation, indexed and searchable.
          </p>
        </div>

        {/* Bento Grid (Spyglass inspired) */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Card 1: Large Wide */}
          <div className="lg:col-span-2 bg-[#111111] border border-white/10 rounded-3xl p-10 flex flex-col justify-between overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none transition-opacity group-hover:bg-blue-500/20" />
            
            <div className="relative z-10 mb-12">
              <span className="text-xs font-mono text-slate-500 mb-4 block">01</span>
              <h3 className="text-3xl font-bold mb-4">Protect your privacy</h3>
              <p className="text-slate-400 text-lg max-w-md">
                Every document is encrypted at rest and in transit. We automatically redact PII before translation and delete raw files within 24 hours of delivery.
              </p>
            </div>

            <div className="relative z-10 w-full h-48 bg-[#1A1A1A] rounded-2xl border border-white/5 p-6 flex flex-col gap-4 overflow-hidden">
               {/* Mock UI snippet */}
               <div className="w-full h-8 bg-[#222] rounded flex items-center px-4">
                 <LockIcon className="w-4 h-4 text-emerald-400 mr-3" />
                 <span className="text-xs font-mono text-emerald-400">256-BIT AES ENCRYPTION ACTIVE</span>
               </div>
               <div className="w-3/4 h-8 bg-[#222] rounded flex items-center px-4">
                 <Fingerprint className="w-4 h-4 text-blue-400 mr-3" />
                 <span className="text-xs font-mono text-blue-400">PII REDACTION COMPLETE</span>
               </div>
            </div>
          </div>

          {/* Card 2: Tall */}
          <div className="bg-[#111111] border border-white/10 rounded-3xl p-10 flex flex-col justify-between relative group overflow-hidden">
            <div className="absolute bottom-0 left-0 w-full h-64 bg-purple-500/10 blur-[80px] pointer-events-none group-hover:bg-purple-500/20 transition-colors" />
            
            <div className="relative z-10">
              <span className="text-xs font-mono text-slate-500 mb-4 block">02</span>
              <h3 className="text-3xl font-bold mb-4">Search the database</h3>
              <p className="text-slate-400 text-lg">
                Ask anything about any certified document. Get instant results across millions of pages.
              </p>
            </div>

            <div className="relative z-10 mt-12 w-full h-48 bg-[#1A1A1A] rounded-2xl border border-white/5 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-[#222] border border-white/10 flex items-center justify-center">
                <Search className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* Card 3: Standard */}
          <div className="bg-[#111111] border border-white/10 rounded-3xl p-10 relative group overflow-hidden">
            <div className="relative z-10">
              <span className="text-xs font-mono text-slate-500 mb-4 block">03</span>
              <h3 className="text-2xl font-bold mb-3">Save what works</h3>
              <p className="text-slate-400">
                Clip translations to boards. Download assets. Share with your team or agency. Your file, always current, always organized.
              </p>
            </div>
          </div>

          {/* Card 4: Standard */}
          <div className="bg-[#111111] border border-white/10 rounded-3xl p-10 relative group overflow-hidden">
            <div className="relative z-10">
              <span className="text-xs font-mono text-slate-500 mb-4 block">04</span>
              <h3 className="text-2xl font-bold mb-3">Automated Triage</h3>
              <p className="text-slate-400">
                Our vision AI checks your scans for glare, crops, and illegible text before you even pay.
              </p>
            </div>
          </div>

          {/* Card 5: Standard */}
          <div className="bg-[#111111] border border-white/10 rounded-3xl p-10 relative group overflow-hidden">
            <div className="relative z-10">
              <span className="text-xs font-mono text-slate-500 mb-4 block">05</span>
              <h3 className="text-2xl font-bold mb-3">Layout Preservation</h3>
              <p className="text-slate-400">
                Signatures, stamps, and tables are preserved 1:1 in the output document.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

function LockIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  );
}

