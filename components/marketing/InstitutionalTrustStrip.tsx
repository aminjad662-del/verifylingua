"use client";

import React from "react";
import { Scale, Landmark, ShieldCheck, GraduationCap, Award } from "lucide-react";

export function InstitutionalTrustStrip() {
  const trustPartners = [
    { 
      name: "USCIS Immigration Centers", 
      acronym: "USCIS", 
      spec: "8 CFR § 103.2(b)(3)", 
      icon: Landmark 
    },
    { 
      name: "Immigration Review Courts", 
      acronym: "EOIR Courts", 
      spec: "Court Admissible", 
      icon: Scale 
    },
    { 
      name: "American Translators Association", 
      acronym: "ATA Corporate", 
      spec: "Member No. 278190", 
      icon: Award 
    },
    { 
      name: "Credential Evaluation Services", 
      acronym: "NACES / WES", 
      spec: "Academic Certified", 
      icon: GraduationCap 
    },
    { 
      name: "U.S. Department of State", 
      acronym: "Consular Posts", 
      spec: "Global Embassies", 
      icon: ShieldCheck 
    },
  ];

  return (
    <section className="py-8 bg-surface border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center space-y-4">
          <div className="text-center text-xs text-text-muted font-medium">
            Accepted Across All U.S. Federal Agencies, Immigration Courts, and Consular Posts
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 w-full pt-1">
            {trustPartners.map((partner) => {
              const Icon = partner.icon;
              return (
                <div 
                  key={partner.name}
                  className="flex items-center gap-3 p-3.5 rounded-xl bg-surface-raised border border-border/80 hover:border-border transition-all duration-150 group text-left shadow-2xs"
                >
                  <div className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center text-brand-ink group-hover:text-brand-500 shrink-0 group-hover:scale-105 transition-all">
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