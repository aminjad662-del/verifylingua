"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck, ArrowRight, Download, Search, CheckCircle2,
  Clock, AlertTriangle, Filter, ChevronDown, Lock, Shield, FileText, Plus, Bell, Settings, User
} from "lucide-react";
import { cn } from "@/lib/utils";

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
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 flex flex-col">
      {/* SaaS Workspace Header */}
      <header className="h-16 border-b border-slate-200 bg-white px-6 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-[0_2px_10px_rgba(37,99,235,0.2)] group-hover:bg-blue-700 transition-colors">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="font-bold tracking-tight text-lg">VerifyLingua</span>
            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider ml-2 hidden sm:block">
              Client Portal
            </span>
          </Link>
          
          <div className="h-6 w-[1px] bg-slate-200 hidden md:block"></div>
          
          <nav className="hidden md:flex items-center gap-1">
            <button className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-900 text-sm font-semibold">Active Orders</button>
            <button className="px-3 py-1.5 rounded-lg hover:bg-slate-50 text-slate-600 text-sm font-medium transition-colors">Organization</button>
            <button className="px-3 py-1.5 rounded-lg hover:bg-slate-50 text-slate-600 text-sm font-medium transition-colors">Billing</button>
          </nav>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 transition-colors">
            <Bell className="w-4 h-4" />
          </button>
          <button className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-200 text-slate-700 font-bold text-sm border border-slate-300">
            JD
          </button>
        </div>
      </header>

      {/* Main Content Workspace */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto p-4 md:p-8 flex flex-col gap-8">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
                Secure Document Vault
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
              Active Matters & Records
            </h1>
          </div>
          
          <Link 
            href="/order/triage" 
            className="h-12 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-2 shadow-[0_8px_20px_rgba(37,99,235,0.25)] transition-all hover:-translate-y-0.5 active:scale-95 whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            New Translation Order
          </Link>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Orders</p>
              <h4 className="text-3xl font-black text-slate-900 tabular-nums">142</h4>
            </div>
            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 text-slate-400">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Processing</p>
              <h4 className="text-3xl font-black text-blue-600 tabular-nums">2</h4>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100 text-blue-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 blur-3xl rounded-full pointer-events-none" />
            <div className="relative z-10">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Acceptance Rate</p>
              <h4 className="text-3xl font-black text-slate-900 tabular-nums">100%</h4>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center border border-green-100 text-green-600 relative z-10">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Dense Data Table Container */}
        <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm flex flex-col flex-1 overflow-hidden relative">
          
          {/* Toolbar */}
          <div className="h-16 px-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Search matter or ID..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-10 pl-9 pr-4 w-64 rounded-lg bg-white border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-shadow placeholder:text-slate-400"
                />
              </div>
            </div>
            
            <div className="flex items-center p-1 bg-slate-100 rounded-lg">
              {["ALL", "PENDING", "COMPLETED"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "px-4 h-8 rounded-md text-xs font-bold transition-all",
                    activeTab === tab
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/50"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-slate-100 bg-slate-50/80 text-[10px] font-bold uppercase tracking-wider text-slate-500 sticky top-0 z-10">
            <div className="col-span-3">Order / Matter</div>
            <div className="col-span-2">Pair & Scope</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-3">Certification & Hash</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          {/* Table Body */}
          <div className="flex-1 overflow-y-auto">
            {filteredMatters.length === 0 ? (
              <div className="p-12 text-center text-slate-500 font-medium">No matters found.</div>
            ) : (
              filteredMatters.map((matter, idx) => (
                <div 
                  key={matter.id}
                  className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-slate-100 hover:bg-slate-50 transition-colors items-center group cursor-pointer"
                >
                  {/* Order / Matter */}
                  <div className="col-span-3 min-w-0 pr-4">
                    <div className="font-bold text-slate-900 text-sm truncate">{matter.matter}</div>
                    <div className="text-xs font-mono text-slate-400 mt-0.5">{matter.id}</div>
                  </div>
                  
                  {/* Pair & Scope */}
                  <div className="col-span-2">
                    <div className="text-xs font-bold text-slate-700 bg-slate-100 inline-flex px-2 py-0.5 rounded mb-0.5">
                      {matter.lang}
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium">
                      {matter.pages} {matter.pages === 1 ? 'page' : 'pages'}
                    </div>
                  </div>
                  
                  {/* Status */}
                  <div className="col-span-2">
                    {matter.status === "COMPLETED" && (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 border border-green-100 text-green-700 text-xs font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Delivered
                      </div>
                    )}
                    {matter.status === "PROCESSING" && (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold">
                        <Clock className="w-3.5 h-3.5" />
                        Translating
                      </div>
                    )}
                    {matter.status === "IN_REVIEW" && (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-50 border border-orange-100 text-orange-700 text-xs font-bold">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        QA Review
                      </div>
                    )}
                  </div>
                  
                  {/* Certification Hash */}
                  <div className="col-span-3">
                    <div className="flex items-center gap-1.5 text-xs">
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-mono text-slate-600">{matter.hash}</span>
                    </div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 mt-1">
                      {matter.cert}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="col-span-2 flex justify-end gap-2">
                    {matter.status === "COMPLETED" ? (
                      <button className="h-8 px-3 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors flex items-center gap-1.5 shadow-sm">
                        <Download className="w-3.5 h-3.5" />
                        PDF
                      </button>
                    ) : (
                      <button className="h-8 px-3 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors shadow-sm">
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
