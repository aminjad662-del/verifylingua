"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import {
  ShieldCheck, ArrowRight, Download, Search, CheckCircle2,
  Clock, AlertTriangle, Filter, ChevronDown, Lock, Shield
} from "lucide-react";
import { useRouter } from "next/navigation";

const SPRING_CONFIG = { type: "spring", stiffness: 350, damping: 28, mass: 1 } as const;

export default function DashboardPage() {
  const [activeTab, setActiveTab] = React.useState("ALL");
  
  // Fake data for the dense filing table to show high-density Awwwards UX
  const matters = [
    { id: "VL-8492-X", matter: "Estate of J. Doe", lang: "ES \u2192 EN", pages: 12, status: "COMPLETED", date: "Today, 14:22", hash: "a8f9c2...b71", cert: "ATA-278190" },
    { id: "VL-8491-Y", matter: "USCIS I-130 Evidence", lang: "FR \u2192 EN", pages: 4, status: "PROCESSING", date: "Today, 11:05", hash: "Pending", cert: "Pending" },
    { id: "VL-8488-Z", matter: "Corporate Articles", lang: "DE \u2192 EN", pages: 45, status: "IN_REVIEW", date: "Yesterday", hash: "Pending", cert: "QC Hold" },
    { id: "VL-8472-A", matter: "Birth Certificate (MX)", lang: "ES \u2192 EN", pages: 1, status: "COMPLETED", date: "Sep 22", hash: "e2c1a8...99f", cert: "ATA-278190" },
    { id: "VL-8470-B", matter: "Medical Records", lang: "ES \u2192 EN", pages: 8, status: "COMPLETED", date: "Sep 21", hash: "f7d3b1...4c2", cert: "ATA-278190" },
  ];

  return (
    <div className="min-h-screen bg-[#F9F9F8] text-black selection:bg-black/10 flex flex-col font-sans">
      {/* Workspace Header */}
      <header className="h-16 border-b border-black/10 bg-white px-6 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-6 h-6 bg-black text-white rounded flex items-center justify-center">
              <Shield className="w-3.5 h-3.5" />
            </div>
            <span className="font-semibold tracking-tight text-sm">Counsel Workspace</span>
          </Link>
          
          <div className="h-4 w-[1px] bg-black/10"></div>
          
          <nav className="flex items-center gap-4 text-sm font-medium text-black/50">
            <span className="text-black cursor-pointer">Matters</span>
            <span className="hover:text-black transition-colors cursor-pointer">Invoices</span>
            <span className="hover:text-black transition-colors cursor-pointer">Team Settings</span>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/translate">
             <motion.button 
               whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={SPRING_CONFIG}
               className="h-9 px-4 bg-black text-white text-xs font-bold uppercase tracking-wider rounded flex items-center gap-2 cursor-pointer shadow-lg"
             >
               New Translation
             </motion.button>
          </Link>
        </div>
      </header>

      {/* Main High-Density Workspace */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-6 md:p-10 flex flex-col gap-8">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif tracking-tight mb-2">Matter Filing & Evidentiary Vault</h1>
            <p className="text-sm text-black/60 font-medium">Manage active translation pipelines, download certified artifacts, and verify SHA-256 integrity.</p>
          </div>
          
          <div className="flex items-center gap-4 text-xs font-mono uppercase tracking-widest font-bold text-black/50">
            <div className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-green-600" /> USCIS § 103.2 Compliant</div>
            <div className="h-3 w-[1px] bg-black/20"></div>
            <div className="flex items-center gap-1.5"><Lock className="w-4 h-4 text-black" /> 256-Bit SSL</div>
          </div>
        </div>

        <div className="bg-white border border-black/10 shadow-2xl flex flex-col flex-1 min-h-[600px] relative overflow-hidden">
           
           {/* Table Controls */}
           <div className="h-14 border-b border-black/5 bg-black/[0.02] flex items-center justify-between px-4">
             <div className="flex items-center gap-2">
               {["ALL", "PROCESSING", "COMPLETED", "ACTION_REQUIRED"].map(tab => (
                 <button 
                   key={tab}
                   onClick={() => setActiveTab(tab)}
                   className={`h-8 px-3 text-[10px] font-mono font-bold uppercase tracking-widest rounded transition-colors cursor-pointer ${
                     activeTab === tab ? "bg-black text-white" : "text-black/50 hover:bg-black/5"
                   }`}
                 >
                   {tab.replace("_", " ")}
                 </button>
               ))}
             </div>
             
             <div className="flex items-center gap-3">
               <div className="relative">
                 <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-black/30" />
                 <input 
                   type="text" 
                   placeholder="Search matter, ID..." 
                   className="h-8 pl-9 pr-3 w-64 text-sm bg-white border border-black/10 rounded focus:border-black/30 outline-none transition-colors"
                 />
               </div>
               <button className="h-8 w-8 flex items-center justify-center border border-black/10 rounded hover:bg-black/5 transition-colors cursor-pointer">
                 <Filter className="w-4 h-4 text-black/70" />
               </button>
             </div>
           </div>

           {/* High-Density Data Table */}
           <div className="flex-1 overflow-auto">
             <table className="w-full text-left text-sm border-collapse">
               <thead>
                 <tr className="border-b border-black/10 text-[10px] font-mono uppercase tracking-widest text-black/40 bg-white sticky top-0 z-10">
                   <th className="font-bold py-3 px-4 w-12"><input type="checkbox" className="rounded-sm" /></th>
                   <th className="font-bold py-3 px-4">Job ID</th>
                   <th className="font-bold py-3 px-4">Client / Matter</th>
                   <th className="font-bold py-3 px-4">Vector</th>
                   <th className="font-bold py-3 px-4 text-right">Volume</th>
                   <th className="font-bold py-3 px-4">Status</th>
                   <th className="font-bold py-3 px-4">Timeline</th>
                   <th className="font-bold py-3 px-4">Cert / Integrity</th>
                   <th className="font-bold py-3 px-4 text-right">Actions</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-black/5">
                 {matters.filter(m => activeTab === "ALL" || m.status === activeTab).map((m, i) => (
                   <motion.tr 
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: i * 0.05, ...SPRING_CONFIG }}
                     key={m.id} 
                     className="group hover:bg-black/[0.02] transition-colors cursor-pointer"
                   >
                     <td className="py-4 px-4"><input type="checkbox" className="rounded-sm" /></td>
                     <td className="py-4 px-4 font-mono text-xs font-bold">{m.id}</td>
                     <td className="py-4 px-4 font-semibold">{m.matter}</td>
                     <td className="py-4 px-4 text-xs font-mono font-medium text-black/60">{m.lang}</td>
                     <td className="py-4 px-4 text-right">{m.pages} pg</td>
                     <td className="py-4 px-4">
                       <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-widest ${
                         m.status === "COMPLETED" ? "bg-green-100 text-green-800" :
                         m.status === "PROCESSING" ? "bg-blue-100 text-blue-800" :
                         "bg-amber-100 text-amber-800"
                       }`}>
                         {m.status === "COMPLETED" && <CheckCircle2 className="w-3 h-3" />}
                         {m.status === "PROCESSING" && <Clock className="w-3 h-3 animate-spin" />}
                         {m.status === "IN_REVIEW" && <AlertTriangle className="w-3 h-3" />}
                         {m.status.replace("_", " ")}
                       </div>
                     </td>
                     <td className="py-4 px-4 text-xs text-black/60">{m.date}</td>
                     <td className="py-4 px-4 text-xs font-mono text-black/40">
                       <div className="flex flex-col gap-0.5">
                         <span>CERT: {m.cert}</span>
                         <span>HASH: {m.hash}</span>
                       </div>
                     </td>
                     <td className="py-4 px-4 text-right">
                       {m.status === "COMPLETED" ? (
                         <button className="inline-flex items-center gap-2 px-3 py-1.5 bg-black text-white text-xs font-bold rounded hover:bg-black/80 transition-colors shadow-sm">
                           <Download className="w-3 h-3" /> Artifacts
                         </button>
                       ) : (
                         <button className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-black/10 text-black text-xs font-bold rounded hover:bg-black/5 transition-colors">
                           Track Live
                         </button>
                       )}
                     </td>
                   </motion.tr>
                 ))}
               </tbody>
             </table>
           </div>

           {/* Batch Actions Footer */}
           <div className="h-12 bg-black/[0.02] border-t border-black/5 flex items-center justify-between px-4 text-xs font-medium text-black/50">
             <span>Viewing 1-5 of 12 matters</span>
             <div className="flex items-center gap-4">
               <button className="hover:text-black transition-colors cursor-pointer flex items-center gap-1">Download CSV <Download className="w-3 h-3" /></button>
               <div className="w-[1px] h-3 bg-black/20"></div>
               <button className="hover:text-black transition-colors cursor-pointer flex items-center gap-1">Batch Export Certified PDFs <ChevronDown className="w-3 h-3" /></button>
             </div>
           </div>

        </div>

      </main>
    </div>
  );
}
