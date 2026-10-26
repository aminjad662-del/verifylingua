"use client";

import React from "react";
import { Scale, Building2, Landmark, ShieldCheck, GraduationCap, Award } from "lucide-react";

export function InstitutionalTrustStrip() {
  const trustPartners = [
    { name: "USCIS Immigration Service Centers", icon: Landmark },
    { name: "Executive Office for Immigration Review (EOIR)", icon: Scale },
    { name: "American Translators Association (ATA)", icon: Award },
    { name: "National Association of Credential Evaluation (NACES)", icon: GraduationCap },
    { name: "U.S. Department of State Consular Posts", icon: ShieldCheck },
  ];

  return (
    <section className="py-8 bg-surface border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-[11px] font-mono uppercase tracking-widest text-text-subtle mb-6">
          Accepted Across All U.S. Federal Agencies and Immigration Courts
        </p>

        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 md:gap-16 opacity-85">
          {trustPartners.map((partner) => {
            const Icon = partner.icon;
            return (
              <div 
                key={partner.name}
                className="flex items-center gap-2 text-text-muted hover:text-brand-ink transition-colors"
                title={partner.name}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span className="text-xs font-semibold tracking-tight">
                  {partner.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
