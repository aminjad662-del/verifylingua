"use client";

import React from "react";

const tickerStats = [
  <span key="1"><span className="text-white">2,400+</span> Law Firms Trust VerifyLingua</span>,
  <span key="2"><span className="text-white">100%</span> USCIS Acceptance Rate</span>,
  <span key="3">ATA Corporate Member ID <span className="text-white">278190</span></span>,
  <span key="4"><span className="text-white">90-Second</span> Certified Delivery</span>,
  <span key="5">SHA-256 Verified</span>,
  <span key="6"><span className="text-white">70+</span> Languages Supported</span>,
  <span key="7">Zero Court Rejections</span>,
];

export function RedesignTickerBar() {
  return (
    <section className="bg-obsidian-950 border-y border-white/[0.08] py-4 overflow-hidden relative flex">
      <style>{`
        @keyframes ticker-marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-ticker {
          animation: ticker-marquee 40s linear infinite;
        }
      `}</style>
      
      <div className="flex w-max animate-ticker font-mono text-xs uppercase tracking-[0.1em] text-neutral-400 whitespace-nowrap items-center">
        {[0, 1].map((setIndex) => (
          <div key={setIndex} className="flex items-center">
            {tickerStats.map((item, i) => (
              <React.Fragment key={i}>
                <span className="mx-6">{item}</span>
                <span className="text-white/[0.15]">{"\u2022"}</span>
              </React.Fragment>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
