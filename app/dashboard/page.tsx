"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck, ArrowRight, Download, Search, CheckCircle2,
  Clock, AlertTriangle, Filter, ChevronDown, Lock, Shield, FileText, Plus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DashboardNav } from "@/components/layout/DashboardNav";

const matters = [
  { id: "VL-8492-X", matter: "Estate of J. Doe", lang: "ES → EN", pages: 12, status: "COMPLETED", date: "Today, 14:22", hash: "a8f9c2...b71", cert: "ATA-278190" },
  { id: "VL-8491-Y", matter: "USCIS I-130 Evidence", lang: "FR → EN", pages: 4, status: "PROCESSING", date: "Today, 11:05", hash: "Pending", cert: "Pending" },
  { id: "VL-8488-Z", matter: "Corporate Articles", lang: "DE → EN", pages: 45, status: "IN_REVIEW", date: "Yesterday", hash: "Pending", cert: "QC Hold" },
  { id: "VL-8472-A", matter: "Birth Certificate (MX)", lang: "ES → EN", pages: 1, status: "COMPLETED", date: "Sep 22", hash: "e2c1a8...99f", cert: "ATA-278190" },
  { id: "VL-8470-B", matter: "Medical Records", lang: "ES → EN", pages: 8, status: "COMPLETED", date: "Sep 21", hash: "f7d3b1...4c2", cert: "ATA-278190" },
];

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredMatters = matters.filter((m) => {
    if (activeTab === "COMPLETED" && m.status !== "COMPLETED") return false;
    if (activeTab === "PENDING" && m.status === "COMPLETED") return false;
    if (searchQuery && !m.matter.toLowerCase().includes(searchQuery.toLowerCase()) && !m.id.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-canvas text-text font-sans selection:bg-brand-500/20 flex flex-col">
      {/* 1. Standard Dashboard Header with Profile & Clean Sign Out */}
      <DashboardNav />

      {/* 2. Main Content Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 flex flex-col gap-6">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-600" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-text-muted">
                Secure Document Vault
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-brand-ink">
              Active Matters & Records
            </h1>
          </div>
          
          <Link 
            href="/order/triage" 
            className="h-10 px-5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs flex items-center gap-2 shadow-xs transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>New Translation Order</span>
          </Link>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-xl bg-surface-raised border border-border shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1">Total Orders</p>
              <h4 className="text-2xl font-black text-brand-ink tabular-nums">142</h4>
            </div>
            <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center border border-border text-text-muted">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="p-5 rounded-xl bg-surface-raised border border-border shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1">Processing</p>
              <h4 className="text-2xl font-black text-brand-600 tabular-nums">2</h4>
            </div>
            <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center border border-brand-100 text-brand-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="p-5 rounded-xl bg-surface-raised border border-border shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1">Acceptance Rate</p>
              <h4 className="text-2xl font-black text-status-success tabular-nums">100%</h4>
            </div>
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center border border-green-100 text-status-success">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Dense Data Table Container */}
        <div className="bg-surface-raised rounded-xl border border-border shadow-xs flex flex-col flex-1 overflow-hidden">
          
          {/* Toolbar */}
          <div className="h-14 px-4 border-b border-border flex items-center justify-between bg-surface/50">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Search matter or ID..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 pl-8 pr-3 w-56 rounded-lg bg-surface border border-border text-xs font-medium focus:outline-none focus:ring-1 focus:ring-brand-500 transition-shadow placeholder:text-text-subtle"
                />
              </div>
            </div>
            
            <div className="flex items-center p-1 bg-surface rounded-lg border border-border">
              {["ALL", "PENDING", "COMPLETED"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "px-3 h-6 rounded-md text-[11px] font-semibold transition-all",
                    activeTab === tab
                      ? "bg-surface-raised text-brand-ink shadow-xs"
                      : "text-text-muted hover:text-brand-ink"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-5 py-2.5 border-b border-border bg-surface text-[10px] font-mono font-bold uppercase tracking-wider text-text-muted">
            <div className="col-span-3">Order / Matter</div>
            <div className="col-span-2">Pair & Scope</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-3">Certification & Hash</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          {/* Table Body */}
          <div className="flex-1 overflow-y-auto divide-y divide-border">
            {filteredMatters.length === 0 ? (
              <div className="p-12 text-center text-text-muted text-xs">No matters found.</div>
            ) : (
              filteredMatters.map((matter) => (
                <div 
                  key={matter.id}
                  className="grid grid-cols-12 gap-4 px-5 py-3.5 hover:bg-surface/60 transition-colors items-center group cursor-pointer"
                >
                  {/* Order / Matter */}
                  <div className="col-span-3 min-w-0 pr-4">
                    <div className="font-semibold text-brand-ink text-xs truncate">{matter.matter}</div>
                    <div className="text-[11px] font-mono text-text-subtle mt-0.5">{matter.id}</div>
                  </div>
                  
                  {/* Pair & Scope */}
                  <div className="col-span-2">
                    <div className="text-[11px] font-semibold text-text bg-surface inline-flex px-1.5 py-0.5 rounded border border-border mb-0.5">
                      {matter.lang}
                    </div>
                    <div className="text-[11px] text-text-muted">
                      {matter.pages} {matter.pages === 1 ? 'page' : 'pages'}
                    </div>
                  </div>
                  
                  {/* Status */}
                  <div className="col-span-2">
                    {matter.status === "COMPLETED" && (
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-green-50/80 border border-green-200 text-status-success text-[11px] font-semibold">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Delivered</span>
                      </div>
                    )}
                    {matter.status === "PROCESSING" && (
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-brand-50 border border-brand-100 text-brand-600 text-[11px] font-semibold">
                        <Clock className="w-3 h-3" />
                        <span>Translating</span>
                      </div>
                    )}
                    {matter.status === "IN_REVIEW" && (
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-status-warning text-[11px] font-semibold">
                        <AlertTriangle className="w-3 h-3" />
                        <span>QA Review</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Certification Hash */}
                  <div className="col-span-3">
                    <div className="flex items-center gap-1.5 text-xs">
                      <Lock className="w-3 h-3 text-text-subtle" />
                      <span className="font-mono text-[11px] text-text-muted">{matter.hash}</span>
                    </div>
                    <div className="text-[10px] font-mono text-text-subtle mt-0.5">
                      {matter.cert}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="col-span-2 flex justify-end gap-2">
                    {matter.status === "COMPLETED" ? (
                      <button className="h-7 px-2.5 rounded-lg bg-brand-ink text-white text-xs font-medium hover:bg-slate-800 transition-colors flex items-center gap-1.5 shadow-xs">
                        <Download className="w-3 h-3" />
                        <span>PDF</span>
                      </button>
                    ) : (
                      <button className="h-7 px-2.5 rounded-lg bg-surface border border-border text-text text-xs font-medium hover:bg-surface-raised transition-colors shadow-xs">
                        Track
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          
        </div>
      </main>
    </div>
  );
}
