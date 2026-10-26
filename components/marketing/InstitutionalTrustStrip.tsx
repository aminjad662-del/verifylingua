"use client";

import React from "react";
import { Scale, Landmark, ShieldCheck, GraduationCap, Award, Building2 } from "lucide-react";

export function InstitutionalTrustStrip() {
  const trustPartners = [
    { 
      name: "USCIS Immigration Service Centers", 
      acronym: "USCIS", 
      spec: "8 CFR § 103.2(b)(3)", 
      icon: Landmark 
    },
    { 
      name: "Executive Office for Immigration Review", 
      acronym: "EOIR", 
      spec: "Court Admissible", 
      icon: Scale 
    },
    { 
      name: "American Translators Association", 
      acronym: "ATA", 
      spec: "Corporate No. 278190", 
      icon: Award 
    },
    { 
      name: "National Association of Credential Evaluation", 
      acronym: "NACES", 
      spec: "WES & ECE Certified", 
      icon: GraduationCap 
    },
    { 
      name: "U.S. Department of State Consular Posts", 
      acronym: "DOS", 
      spec: "Worldwide Consulates", 
      icon: ShieldCheck 
    },
  ];

  return (
    <section className="py-8 bg-surface border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center space-y-4">
          <p className="text-center text-[11px] font-mono uppercase tracking-widest text-text-subtle">
            Accepted Across All U.S. Federal Agencies, Immigration Courts, and Consulates
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 w-full pt-2">
            {trustPartners.map((partner) => {
              const Icon = partner.icon;
              return (
                <div 
                  key={partner.name}
                  className="flex items-center gap-3 p-3 rounded-xl bg-surface-raised border border-border/80 hover:border-border transition-colors group text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center text-brand-600 shrink-0 group-hover:scale-105 transition-transform">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-brand-ink truncate">
                      {partner.acronym}
                    </div>
                    <div className="text-[10px] font-mono text-text-muted truncate">
                      {partner.spec}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}