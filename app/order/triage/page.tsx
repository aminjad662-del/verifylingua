"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "motion/react";
import { calculatePricing } from "@/lib/pricing";
import {
  UploadCloud,
  Camera,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  RefreshCw,
  Info,
  Download,
  Sparkles,
  ArrowRight,
  Layers,
  ChevronRight,
  ChevronLeft
} from "lucide-react";
import { cn } from "@/lib/utils";

const SPRING_CONFIG = { type: "spring", stiffness: 350, damping: 28, mass: 1 } as const;

interface Finding {
  id: string;
  kind: "LOW_RES" | "CROPPED" | "ILLEGIBLE" | "MISSING_PAGE" | "GLARE";
  severity: "WARN" | "BLOCK";
  title: string;
  message: string;
  reshootTip: string;
  pageNumber: number;
}

export default function TriagePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    size: number;
    pages: number;
    words: number;
  } | null>(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [activePageIdx, setActivePageIdx] = useState(0);

  useEffect(() => {
    try {
      const pending = sessionStorage.getItem("pending_upload");
      if (pending) {
        const data = JSON.parse(pending);
        handleFileAnalysis(data.fileName, data.fileSize, data.fileBase64);
      }
    } catch {}
  }, []);

  const handleFileAnalysis = async (
    fileName: string,
    fileSize: number,
    fileBase64?: string,
    fileBlob?: File
  ) => {
    setIsAnalyzing(true);
    setFindings([]);

    setTimeout(() => {
      setUploadedFile({
        name: fileName,
        size: fileSize,
        pages: 3,
        words: 780,
      });

      const mockFindings: Finding[] = [
        {
          id: "f-1",
          kind: "CROPPED",
          severity: "WARN",
          title: "Notarial Seal Cropped",
          message: "The bottom edge of the apostille stamp on page 3 appears cut off.",
          reshootTip: "Ensure all 4 corners of the document are visible in the frame.",
          pageNumber: 3,
        },
        {
          id: "f-2",
          kind: "GLARE",
          severity: "WARN",
          title: "Flash Glare Detected",
          message: "A bright spot is obscuring text in the middle of page 1.",
          reshootTip: "Turn off your camera flash and shoot in indirect natural light.",
          pageNumber: 1,
        },
      ];
      setFindings(mockFindings);
      setIsAnalyzing(false);
      setActivePageIdx(0);
    }, 2800);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        handleFileAnalysis(acceptedFiles[0].name, acceptedFiles[0].size, undefined, acceptedFiles[0]);
      }
    },
    accept: {
      "application/pdf": [".pdf"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
    },
    maxSize: 50 * 1024 * 1024,
  });

  const handleCameraChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileAnalysis(e.target.files[0].name || "camera-scan.jpg", e.target.files[0].size, undefined, e.target.files[0]);
    }
  };

  const pageCount = uploadedFile?.pages || 1;
  const wordCount = uploadedFile?.words || 250;
  
  const pricing = React.useMemo(() => calculatePricing({ 
    serviceType: "CERTIFIED", 
    pageCount, 
    wordCount 
  }), [pageCount, wordCount]);

  const hasBlockingFindings = findings.some((f) => f.severity === "BLOCK");

  const handleContinue = () => {
    router.push(`/order/precheck?pages=${pageCount}&words=${wordCount}`);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4 max-w-3xl">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
            Step 1 of 4
          </span>
          <span className="text-xs font-mono text-slate-500 font-bold uppercase tracking-wider">
            Document Intake & Vision Quality Inspection
          </span>
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
          Upload & Inspect
        </h1>
        <p className="text-base md:text-lg text-slate-600 leading-relaxed font-medium">
          Before taking payment, our proprietary engine performs a high-fidelity scan to detect illegible handwriting, cropped seals, or missing pages. We prevent rejections before they happen.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Triage Studio Workspace */}
        <div className="lg:col-span-8 flex flex-col">
          
          <div className="p-8 rounded-[32px] bg-white border border-slate-200 shadow-sm relative overflow-hidden flex flex-col">
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/5 blur-[100px] rounded-full pointer-events-none" />
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6 relative z-10">
               <div className="flex items-center gap-2">
                 <ShieldCheck className="w-5 h-5 text-blue-600" />
                 <h3 className="text-xl font-bold text-slate-900">
                   Document Workspace
                 </h3>
               </div>
            </div>
            
            <div className="relative flex flex-col min-h-[480px] z-10">
              {/* State 1: Upload Zone */}
              {!uploadedFile && !isAnalyzing && (
                <div 
                  {...getRootProps()}
                  className={cn(
                    "flex-1 flex flex-col items-center justify-center border-2 border-dashed rounded-2xl transition-all p-12 text-center cursor-pointer",
                    isDragActive ? "border-blue-600 bg-blue-50/50 scale-[0.98]" : "border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300"
                  )}
                >
                  <input {...getInputProps()} />
                  <div className="w-20 h-20 rounded-3xl bg-white shadow-sm flex items-center justify-center mb-6 text-blue-600 border border-slate-100">
                    <UploadCloud className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Drag & Drop Documents</h3>
                  <p className="text-slate-500 font-medium max-w-sm mx-auto mb-8">
                    Supports secure, 256-bit encrypted upload of PDF, JPG, PNG, WEBP files up to 50MB.
                  </p>
                  
                  <div className="flex items-center gap-4">
                    <button className="h-12 px-6 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors shadow-md">
                      Browse Files
                    </button>
                    <div className="relative">
                      <input 
                        type="file" 
                        accept="image/*" 
                        capture="environment"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={handleCameraChange}
                        ref={fileInputRef}
                      />
                      <button className="h-12 px-6 rounded-xl bg-white text-slate-700 border border-slate-200 font-bold hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm">
                        <Camera className="w-4 h-4" />
                        Take Photo
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* State 2: Analysis Loading */}
              {isAnalyzing && (
                <div className="flex-1 flex flex-col items-center justify-center rounded-2xl border-2 border-slate-100 bg-slate-50 p-12 text-center">
                  <div className="relative mb-8">
                    <div className="w-24 h-24 rounded-3xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-blue-600 relative overflow-hidden">
                       <FileText className="w-12 h-12" />
                       <motion.div 
                         className="absolute inset-0 bg-blue-600/10"
                         animate={{ y: ["100%", "-100%"] }}
                         transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                       />
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white shadow-md">
                      <Sparkles className="w-4 h-4 animate-pulse" />
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Scanning Document Geometry...</h3>
                  <p className="text-slate-500 font-medium max-w-sm mx-auto">
                    Our AI is checking for cropped edges, glare, and legibility to guarantee USCIS acceptance.
                  </p>
                </div>
              )}

              {/* State 3: Triage Complete Studio */}
              {uploadedFile && !isAnalyzing && (
                <div className="flex-1 flex flex-col bg-slate-50 rounded-2xl overflow-hidden border-2 border-slate-100">
                  
                  {/* Studio Header: File Info */}
                  <div className="bg-white border-b border-slate-100 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 truncate max-w-[200px] sm:max-w-[300px]">
                          {uploadedFile.name}
                        </div>
                        <div className="text-xs text-slate-500 font-medium flex items-center gap-2">
                          <span>{uploadedFile.pages} Pages</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                          <span>{(uploadedFile.size / 1024 / 1024).toFixed(1)} MB</span>
                        </div>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => setUploadedFile(null)}
                      className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold transition-colors flex items-center gap-2 shrink-0"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Replace
                    </button>
                  </div>

                  <div className="flex-1 flex flex-col md:flex-row relative">
                    {/* Left: Document Viewer */}
                    <div className="flex-1 bg-slate-100/50 flex flex-col justify-center items-center p-6 relative overflow-hidden min-h-[300px] border-r border-slate-100">
                      
                      {/* The Page Render (Mock) */}
                      <AnimatePresence mode="popLayout">
                        <motion.div
                          key={activePageIdx}
                          initial={{ opacity: 0, scale: 0.96 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 1.04 }}
                          transition={SPRING_CONFIG}
                          className="w-full max-w-sm aspect-[1/1.414] bg-white rounded-xl shadow-md border border-slate-200 relative p-8 flex flex-col"
                        >
                          {/* Skeleton Text */}
                          <div className="space-y-4 opacity-30">
                            <div className="w-3/4 h-6 bg-slate-300 rounded" />
                            <div className="space-y-2">
                              <div className="w-full h-3 bg-slate-300 rounded" />
                              <div className="w-full h-3 bg-slate-300 rounded" />
                              <div className="w-5/6 h-3 bg-slate-300 rounded" />
                            </div>
                            <div className="w-1/2 h-20 bg-slate-300 rounded mt-8" />
                            <div className="space-y-2 mt-8">
                              <div className="w-full h-3 bg-slate-300 rounded" />
                              <div className="w-4/5 h-3 bg-slate-300 rounded" />
                            </div>
                          </div>
                          <div className="absolute inset-0 flex flex-col items-center justify-center font-bold text-slate-400 text-sm">
                            <Layers className="w-8 h-8 mb-2 opacity-50" />
                            Page {activePageIdx + 1} of {uploadedFile.pages}
                          </div>
                        </motion.div>
                      </AnimatePresence>

                      {/* Pagination Controls */}
                      {uploadedFile.pages > 1 && (
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-slate-900/90 text-white rounded-full px-4 py-2 shadow-lg backdrop-blur-md">
                          <button 
                            className="p-1 hover:bg-white/20 rounded-full disabled:opacity-30 transition-colors"
                            disabled={activePageIdx === 0}
                            onClick={() => setActivePageIdx(p => Math.max(0, p - 1))}
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <span className="text-xs font-bold font-mono tracking-widest px-2">
                            {activePageIdx + 1} / {uploadedFile.pages}
                          </span>
                          <button 
                            className="p-1 hover:bg-white/20 rounded-full disabled:opacity-30 transition-colors"
                            disabled={activePageIdx === uploadedFile.pages - 1}
                            onClick={() => setActivePageIdx(p => Math.min(uploadedFile.pages - 1, p + 1))}
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Right: Inspection Tags & Findings */}
                    <div className="w-full md:w-72 bg-white flex flex-col relative z-10 shrink-0">
                       <div className="p-4 border-b border-slate-100 bg-slate-50 shrink-0">
                         <h4 className="text-sm font-bold text-slate-900">Inspection Telemetry</h4>
                       </div>
                       
                       <div className="flex-1 overflow-y-auto p-4 space-y-4">
                         
                         {/* Global Tag */}
                         <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm space-y-2">
                           <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                             <CheckCircle2 className="w-4 h-4 text-green-600" />
                             Format Accepted
                           </div>
                           <p className="text-xs text-slate-500 font-medium">
                             The document resolution is sufficient for certified reproduction.
                           </p>
                         </div>

                         {/* Issues on Current Page */}
                         {findings.filter(f => f.pageNumber === activePageIdx + 1).map((finding) => (
                           <div 
                             key={finding.id} 
                             className={cn(
                               "p-4 rounded-xl border space-y-2",
                               finding.severity === "BLOCK" 
                                 ? "border-red-200 bg-red-50" 
                                 : "border-orange-200 bg-orange-50"
                             )}
                           >
                             <div className={cn(
                               "flex items-center gap-2 font-bold text-sm",
                               finding.severity === "BLOCK" ? "text-red-800" : "text-orange-800"
                             )}>
                               {finding.severity === "BLOCK" ? (
                                 <XCircle className="w-4 h-4" />
                               ) : (
                                 <AlertTriangle className="w-4 h-4" />
                               )}
                               {finding.title}
                             </div>
                             <p className={cn(
                               "text-xs font-medium",
                               finding.severity === "BLOCK" ? "text-red-700" : "text-orange-700"
                             )}>
                               {finding.message}
                             </p>
                             <div className="pt-2 border-t border-black/10 mt-2">
                               <span className="text-[10px] uppercase font-bold tracking-wider opacity-60 block mb-1">
                                 Tip
                               </span>
                               <p className={cn(
                                 "text-xs font-medium",
                                 finding.severity === "BLOCK" ? "text-red-700" : "text-orange-700"
                               )}>
                                 {finding.reshootTip}
                               </p>
                             </div>
                           </div>
                         ))}

                         {findings.filter(f => f.pageNumber === activePageIdx + 1).length === 0 && (
                           <div className="p-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 flex items-center justify-center text-center">
                             <span className="text-xs font-bold text-slate-400">No issues detected on this page.</span>
                           </div>
                         )}
                       </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sticky Rail */}
        <div className="lg:col-span-4 sticky top-24">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col relative overflow-hidden">
             
             {/* If blocked, show blocker overlay */}
             {uploadedFile && hasBlockingFindings && (
               <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-6 text-center">
                 <XCircle className="w-12 h-12 text-red-500 mb-4" />
                 <h3 className="text-xl font-bold text-slate-900 mb-2">Upload Rejected</h3>
                 <p className="text-sm text-slate-600 font-medium mb-6">
                   Please resolve the critical issues flagged in the inspector before continuing.
                 </p>
                 <button 
                   onClick={() => setUploadedFile(null)}
                   className="h-12 px-6 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors shadow-md"
                 >
                   Upload New File
                 </button>
               </div>
             )}
             
             <h3 className="text-lg font-bold text-slate-900 mb-6">Order Summary</h3>
             
             <div className="space-y-4 mb-8">
               <div className="flex justify-between items-center text-sm">
                 <span className="text-slate-500 font-medium">Pages Extracted</span>
                 <span className="font-bold text-slate-900 tabular-nums">{pricing.pageCount}</span>
               </div>
               <div className="flex justify-between items-center text-sm">
                 <span className="text-slate-500 font-medium">Est. Word Count</span>
                 <span className="font-bold text-slate-900 tabular-nums">{pricing.wordCount}</span>
               </div>
               <div className="flex justify-between items-center text-sm">
                 <span className="text-slate-500 font-medium">Format Verification</span>
                 <span className="font-bold text-green-600 flex items-center gap-1">
                   <CheckCircle2 className="w-3.5 h-3.5" /> Pass
                 </span>
               </div>
             </div>

             <div className="border-t border-slate-100 pt-6 flex justify-between items-end mb-8">
               <span className="text-sm font-bold text-slate-500">Subtotal</span>
               <div className="flex items-start gap-1">
                 <span className="text-lg font-bold text-slate-900 mt-1">$</span>
                 <span className="text-4xl font-black text-slate-900 tabular-nums tracking-tight">{pricing.basePrice.toFixed(2)}</span>
               </div>
             </div>

             <button
               onClick={handleContinue}
               disabled={!uploadedFile || isAnalyzing || hasBlockingFindings}
               className="w-full py-4 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors shadow-lg active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
             >
               {isAnalyzing ? "Scanning..." : "Continue Configuration"}
               {!isAnalyzing && <ArrowRight className="w-5 h-5" />}
             </button>
             
             <p className="text-[11px] text-slate-400 font-medium text-center mt-4 px-2">
               Your document is end-to-end encrypted and will never be shared without your explicit consent.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
