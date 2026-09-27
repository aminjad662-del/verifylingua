"use client";

import React from "react";
import { Check } from "lucide-react";
import Link from "next/link";

export function PricingSection() {
  return (
    <section className="w-full bg-slate-50 py-32 px-6">
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        
        <div className="text-center mb-16 max-w-2xl">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-6">
            Simple pricing. Scale as you grow.
          </h2>
          <p className="text-lg text-slate-600 font-medium">
            Pick the plan that fits your team. Upgrade or downgrade anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
          
          {/* Plan 1 */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Pro</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-extrabold text-slate-900">$20</span>
              <span className="text-slate-500 font-medium">/mo</span>
            </div>
            <p className="text-sm text-slate-500 mb-8 pb-8 border-b border-slate-100">
              For solo operators or small teams
            </p>
            <Link href="/order/triage">
              <button className="w-full py-4 rounded-xl bg-slate-900 text-white font-bold mb-8 hover:bg-slate-800 transition-colors">
                Get 50% off
              </button>
            </Link>
            <ul className="space-y-4 flex-1">
              <li className="flex items-start gap-3 text-sm text-slate-600">
                <Check className="w-5 h-5 text-slate-900 shrink-0" />
                <span>AI-powered search across all your documents</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-600">
                <Check className="w-5 h-5 text-slate-900 shrink-0" />
                <span>20,000 translation credits</span>
              </li>
            </ul>
          </div>

          {/* Plan 2 */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] flex flex-col relative transform md:-translate-y-4">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              Most Popular
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Ultra</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-extrabold text-slate-900">$40</span>
              <span className="text-slate-500 font-medium">/mo</span>
            </div>
            <p className="text-sm text-slate-500 mb-8 pb-8 border-b border-slate-100">
              For medium teams or smaller agencies
            </p>
            <Link href="/order/triage">
              <button className="w-full py-4 rounded-xl bg-blue-600 text-white font-bold mb-8 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">
                Get 50% off
              </button>
            </Link>
            <ul className="space-y-4 flex-1">
              <li className="flex items-start gap-3 text-sm text-slate-600">
                <Check className="w-5 h-5 text-blue-600 shrink-0" />
                <span className="font-semibold text-slate-900">Everything in Pro</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-600">
                <Check className="w-5 h-5 text-slate-900 shrink-0" />
                <span>50,000 translation credits (2.5x Pro)</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-600">
                <Check className="w-5 h-5 text-slate-900 shrink-0" />
                <span>Priority Support — Slack and email</span>
              </li>
            </ul>
          </div>

          {/* Plan 3 */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Max</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-extrabold text-slate-900">$100</span>
              <span className="text-slate-500 font-medium">/mo</span>
            </div>
            <p className="text-sm text-slate-500 mb-8 pb-8 border-b border-slate-100">
              For larger teams and agencies
            </p>
            <Link href="/order/triage">
              <button className="w-full py-4 rounded-xl bg-slate-900 text-white font-bold mb-8 hover:bg-slate-800 transition-colors">
                Get 50% off
              </button>
            </Link>
            <ul className="space-y-4 flex-1">
              <li className="flex items-start gap-3 text-sm text-slate-600">
                <Check className="w-5 h-5 text-slate-900 shrink-0" />
                <span className="font-semibold text-slate-900">Everything in Ultra</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-600">
                <Check className="w-5 h-5 text-slate-900 shrink-0" />
                <span>Unlimited translation credits</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-600">
                <Check className="w-5 h-5 text-slate-900 shrink-0" />
                <span>Premium Support — Slack, email, and phone number</span>
              </li>
            </ul>
          </div>

        </div>
      </div>
    </section>
  );
}
