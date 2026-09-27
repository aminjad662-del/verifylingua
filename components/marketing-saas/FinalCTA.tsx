"use client";

import React from "react";
import Link from "next/link";

export function FinalCTA() {
  return (
    <section className="w-full bg-[#0A0A0A] py-32 px-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
      
      <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 relative z-10 tracking-tight">
        Stop translating <br/>
        <span className="italic font-light text-slate-400">at midnight.</span>
      </h2>
      
      <p className="text-slate-400 max-w-lg mb-10 relative z-10">
        VerifyLingua handles the formatting, OCR, and certified translation stamps. You get your documents back ready for court.
      </p>

      <Link href="/order/triage" className="relative z-10">
        <button className="h-14 px-10 rounded-full bg-white text-black font-bold text-base hover:bg-slate-100 transition-colors shadow-xl">
          Try VerifyLingua
        </button>
      </Link>
    </section>
  );
}
