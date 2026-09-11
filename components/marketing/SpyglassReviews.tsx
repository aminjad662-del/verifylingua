"use client";

import * as React from "react";
import { Star, ShieldCheck, Quote } from "lucide-react";
import { cn } from "@/lib/utils";

interface Review {
  id: string;
  rating: number;
  quote: string;
  author: string;
  role: string;
  organization: string;
  badge: string;
  initials: string;
}

const REVIEWS: Review[] = [
  {
    id: "rev-1",
    rating: 5,
    quote:
      "VerifyLingua is the only translation provider our immigration practice trusts for affirmative asylum and adjustment of status filings. Zero RFEs across more than 400 client document submissions.",
    author: "Elena Rostova, Esq.",
    role: "Managing Partner (AILA Member)",
    organization: "Rostova & Morales Immigration Law, P.C.",
    badge: "Verified Law Firm Account",
    initials: "ER",
  },
  {
    id: "rev-2",
    rating: 5,
    quote:
      "When evaluating foreign engineering degrees from Germany, India, and Brazil, credential evaluators need 1:1 table fidelity and verified grade scales. VerifyLingua's certified translations have never failed our academic review.",
    author: "Dr. Marcus Vance",
    role: "Senior Foreign Credential Evaluator",
    organization: "International Academic Evaluation Services",
    badge: "NACES Evaluation Specialist",
    initials: "MV",
  },
  {
    id: "rev-3",
    rating: 5,
    quote:
      "We needed certified translations of our Ukrainian birth certificates and marriage decree within 24 hours for our USCIS interview in Chicago. The translations included exact seal transcriptions and our green cards were approved on the spot.",
    author: "Carlos & Sofia Mendoza",
    role: "EB-2 NIW Applicants",
    organization: "USCIS Chicago Field Office Approval",
    badge: "Verified Individual Client",
    initials: "CS",
  },
];

export function SpyglassReviews() {
  const [activeDot, setActiveDot] = React.useState(0);

  return (
    <section className="relative py-20 sm:py-28 bg-canvas border-b border-border/40 dark:border-white/10">
      <div className="max-w-7xl mx-auto px-6 space-y-12">
        {/* Section Header matching 'Creative strategists already love Spyglass.' */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-border bg-surface dark:bg-white/5 dark:border-white/15 text-brand-ink dark:text-slate-200 text-xs font-mono font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-500 dark:text-brand-400" />
            <span>48,000+ Certified Pages Delivered</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-brand-ink dark:text-white font-display leading-[1.08]">
            Immigration attorneys & filers already <br className="hidden sm:inline" />
            <span className="font-serif italic font-normal text-brand-900 dark:text-brand-300">
              love VerifyLingua.
            </span>
          </h2>

          <p className="text-sm sm:text-base text-text-muted dark:text-slate-400">
            0% USCIS rejection rate across more than 90 languages and 140 official document formats.
          </p>
        </div>

        {/* 3 Dark Elevated Review Cards Side-by-Side */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {REVIEWS.map((review) => (
            <div
              key={review.id}
              className="flex flex-col justify-between p-6 sm:p-7 rounded-2xl bg-brand-ink dark:bg-slate-900/90 text-white border border-white/10 dark:border-white/15 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-brand-500/50 dark:hover:border-white/30"
            >
              <div className="space-y-4">
                {/* Top: Star rating + Quote icon */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <Quote className="w-5 h-5 text-white/20" />
                </div>

                {/* Quote text */}
                <p className="text-sm sm:text-base text-white/90 leading-relaxed font-normal">
                  &ldquo;{review.quote}&rdquo;
                </p>
              </div>

              {/* Author Footer */}
              <div className="pt-6 mt-6 border-t border-white/10 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-500/30 border border-brand-400/40 text-brand-200 flex items-center justify-center font-bold text-sm shrink-0">
                  {review.initials}
                </div>
                <div className="overflow-hidden">
                  <h3 className="text-sm font-bold text-white truncate">
                    {review.author}
                  </h3>
                  <p className="text-xs text-white/60 truncate">{review.role}</p>
                  <p className="text-[11px] text-white/40 truncate">
                    {review.organization}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Dots indicator matching Spyglass reference */}
        <div className="flex items-center justify-center gap-2 pt-2">
          {[0, 1, 2].map((idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveDot(idx)}
              className={cn(
                "h-2 rounded-full transition-all duration-200 cursor-pointer",
                activeDot === idx
                  ? "w-6 bg-brand-ink dark:bg-white"
                  : "w-2 bg-border-strong dark:bg-white/20 hover:bg-brand-ink/40 dark:hover:bg-white/40"
              )}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
