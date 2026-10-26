"use client";

import React from "react";
import { Scale, Landmark, ShieldCheck, GraduationCap, Award, Building2, CheckCircle2 } from "lucide-react";

export function InstitutionalTrustStrip() {
  const trustPartners = [
    { 
      name: "USCIS Immigration Service Centers", 
      acronym: "USCIS", 
      spec: "8 CFR § 103.2(b)(3)",
      desc: "Federal Immigration Petitions",
      icon: Landmark 
    },
    { 
      name: "Executive Office for Immigration Review", 
      acronym: "EOIR", 
      spec: "Court Admissible", 
      desc: "Immigration Court Proceedings",
      icon: Scale 
    },
    { 
      name: "American Translators Association", 
      acronym: "ATA", 
      spec: "Corporate No. 278190", 
      desc: "Sworn Competence Standard",
      icon: Award 
    },
    { 
      name: "Credential Evaluation Services", 
      acronym: "NACES & AICE", 
      spec: "WES & ECE Certified", 
      desc: "University & Board Evaluations",
      icon: GraduationCap 
    },
    { 
      name: "U.S. Department of State", 
      acronym: "DOS CONSULATES", 
      spec: "Worldwide Posts", 
      desc: "Embassy Visa Interviews",
      icon: ShieldCheck 
    },
  ];

  return (
    <section className="py-10 bg-surface-raised border-b border-border/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          
          {/* Header Label */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
            <div className="flex items-center gap-2">
              <span className="flex h-1.5 w-1.5 rounded-full bg-court-emerald" />
              <p className="text-[11px] font-mono font-bold uppercase tracking-widest text-text-muted">
                Statutory Agency & Judicial Acceptance Network
              </p>
            </div>
            <span className="text-[11px] font-mono text-text-subtle">
              100% Acceptance Guaranteed Across All 50 States & Consulates
            </span>
          </div>

          {/* 5-Column High-Craft Architectural Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
            {trustPartners.map((partner) => {
              const Icon = partner.icon;
              return (
                <div 
                  key={partner.name}
                  className="p-4 rounded-xl bg-canvas border border-border hover:border-brand-500/40 hover:shadow-xs transition-all duration-200 group text-left flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center text-brand-600 shrink-0 group-hover:scale-105 transition-transform duration-200">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] font-mono font-bold text-amber-700 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      VALIDATED
                    </span>
                  </div>

                  <div>
                    <div className="text-xs font-bold text-brand-ink group-hover:text-brand-600 transition-colors">
                      {partner.acronym}
                    </div>
                    <div className="text-[11px] text-text-muted mt-0.5 leading-snug">
                      {partner.desc}
                    </div>
                    <div className="text-[10px] font-mono text-text-subtle mt-1.5 pt-1.5 border-t border-border/60">
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