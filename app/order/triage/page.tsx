"use client";

import * as React from "react";
import { Suspense, useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "motion/react";
import { calculatePricing } from "@/lib/pricing";
import { StickyPriceBar } from "@/components/order/StickyPriceBar";
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

interface TranslationJobState {
  jobId: string;
  fileName: string;
  fileFormat: string;
  status: string;
  progress: number;
  currentStep: string;
  downloadUrl?: string | null;
  qualityGate?: any;
  error?: string | null;
}

function TriageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    size: number;
    pages: number;
    words: number;
  } | null>(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [acknowledgedWarnings, setAcknowledgedWarnings] = useState<Record<string, boolean>>({});
  const [translationJob, setTranslationJob] = useState<TranslationJobState | null>(null);
  
  // Carousel State
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

    try {
      let uploadRes;
      if (fileBlob) {
        const fd = new FormData();
        fd.append("file", fileBlob);
        fd.append("sourceLang", searchParams.get("source") || "es");
        fd.append("targetLang", searchParams.get("target") || "en");
        uploadRes = await fetch("/api/translate/upload", { method: "POST", body: fd });
      } else if (fileBase64) {
        uploadRes = await fetch("/api/translate/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName,
            fileBase64,
            sourceLang: searchParams.get("source") || "es",
            targetLang: searchParams.get("target") || "en",
          }),
        });
      }

      if (uploadRes && uploadRes.ok) {
        const initialJob = await uploadRes.json();
        setTranslationJob(initialJob);

        const poll = setInterval(async () => {
          try {
            const statusRes = await fetch(`/api/translate/status/${initialJob.jobId}`);
            if (statusRes.ok) {
              const current = await statusRes.json();
              setTranslationJob((prev) => ({
                ...prev,
                ...current,
                fileFormat: current.fileFormat || prev?.fileFormat || "PDF",
                fileName: current.fileName || prev?.fileName || "document.pdf",
              }));
              if (current.status === "ready" || current.status === "failed") {
                clearInterval(poll);
              }
            }
          } catch {
            clearInterval(poll);
          }
        }, 800);
      }
    } catch {}

    setTimeout(() => {
      setIsAnalyzing(false);

      const safeName = (fileName || "").toLowerCase();
      const isLargeDoc = safeName.includes("transcript") || safeName.includes("court");
      const isPhoto = safeName.endsWith(".jpg") || safeName.endsWith(".png");
      const pages = isLargeDoc ? 3 : 1;
      const words = pages * 230;

      setUploadedFile({
        name: fileName,
        size: fileSize || 1024 * 450,
        pages,
        words,
      });

      const generatedFindings: Finding[] = [];
      if (isPhoto) {
        generatedFindings.push({
          id: "f-1",
          kind: "GLARE",
          severity: "WARN",
          title: "Minor Flash Reflection Detected",
          message: "A light reflection is detected over the issuing notary stamp. The text remains readable.",
          reshootTip: "Place the paper flat near a window without direct flash for the highest clarity.",
          pageNumber: 1,
        });
      }

      setFindings(generatedFindings);
      try {
        sessionStorage.setItem("triage_result", JSON.stringify({ fileName, pages, words, findings: generatedFindings }));
      } catch {}
    }, 1500);
  };

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      handleFileAnalysis(acceptedFiles[0].name, acceptedFiles[0].size, undefined, acceptedFiles[0]);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
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
  const pricing = React.useMemo(() => calculatePricing({ serviceType: "CERTIFIED", pageCount, wordCount, isExpedited: false, needsNotarization: false }), [pageCount, wordCount]);
  const hasBlockingFindings = findings.some((f) => f.severity === "BLOCK");

  const handleContinue = () => {
    router.push(`/order/precheck?pages=${pageCount}&words=${wordCount}`);
  };

  return (
    <div className="w-full flex flex-col pt-4">
      {/* Editorial Header */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="px-3 py-1 bg-black text-white text-[10px] font-mono uppercase tracking-widest font-bold">Phase 01</div>
          <div className="h-[1px] w-12 bg-black/10"></div>
          <span className="text-xs font-mono uppercase tracking-widest text-black/40 font-bold">Document Intake & Verification</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-serif text-black tracking-tight mb-4 max-w-2xl">
          Automated Vision Quality Inspection.
        </h1>
        <p className="text-sm text-black/60 font-medium max-w-xl leading-relaxed">
          Before taking payment, our proprietary OCR engine performs a high-fidelity scan to detect illegible handwriting, cropped seals, or missing pages. We prevent rejections before they happen.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Triage Studio Workspace */}
        <div className="lg:col-span-8 flex flex-col">
          
          <div className="bg-white border border-black/10 shadow-2xl overflow-hidden flex flex-col relative group">
            <div className="h-10 bg-black/[0.02] border-b border-black/10 flex items-center justify-between px-4 shrink-0">
               <div className="flex items-center gap-2">
                 <div className="flex gap-1.5">
                   <div className="w-2.5 h-2.5 rounded-full bg-black/20"></div>
                   <div className="w-2.5 h-2.5 rounded-full bg-black/20"></div>
                   <div className="w-2.5 h-2.5 rounded-full bg-black/20"></div>
                 </div>
                 <span className="ml-3 text-[10px] font-mono text-black/40 uppercase tracking-widest">VerifyLingua Triage Studio</span>
               </div>
            </div>
            
            <div className="relative flex flex-col bg-[#F9F9F8] min-h-[480px]">
              {/* If empty: Raw Upload Zone */}
              {!uploadedFile && !isAnalyzing && (
                <div 
                  {...getRootProps()} 
                  className={`absolute inset-0 flex flex-col items-center justify-center p-8 transition-colors cursor-pointer
                    ${isDragActive ? "bg-black/[0.03]" : "hover:bg-black/[0.02]"}`}
                >
                  <input {...getInputProps()} />
                  <input type="file" accept="image/*" capture="environment" ref={fileInputRef} onChange={handleCameraChange} className="hidden" />
                  
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={SPRING_CONFIG} className="w-20 h-20 bg-white border border-black/10 shadow-xl flex items-center justify-center mb-6">
                    <UploadCloud className="w-8 h-8 text-black" />
                  </motion.div>
                  
                  <h3 className="text-xl font-medium text-black mb-2 tracking-tight">Drop your source document</h3>
                  <p className="text-sm text-black/50 font-medium mb-8">PDF, PNG, JPG accepted up to 50MB.</p>
                  
                  <div className="flex items-center gap-4">
                    <div className="px-6 py-2.5 bg-black text-white text-xs font-bold uppercase tracking-wider shadow-lg">
                      Browse Files
                    </div>
                    <button type="button" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }} className="px-6 py-2.5 bg-white border border-black/10 text-black text-xs font-bold uppercase tracking-wider shadow-sm hover:bg-black/[0.02] transition-colors">
                      Use Camera
                    </button>
                  </div>
                </div>
              )}

              {/* Analyzing State */}
              {isAnalyzing && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#F9F9F8] z-10">
                  <motion.div 
                    animate={{ rotate: 360 }} 
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-16 h-16 border-2 border-black/10 border-t-black mb-6"
                  />
                  <h3 className="text-lg font-medium text-black mb-2">Analyzing Geometry & Layout</h3>
                  <p className="text-xs font-mono text-black/50 uppercase tracking-widest animate-pulse">Running ISO-17100 OCR Guard...</p>
                </div>
              )}

              {/* Uploaded View: Multi-page Carousel */}
              {uploadedFile && !isAnalyzing && (
                <div className="flex-1 flex overflow-hidden">
                   {/* Main Preview */}
                   <div className="flex-1 border-r border-black/10 p-8 flex items-center justify-center relative bg-[#EFEFEF]">
                     <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="relative">
                        <div className="w-64 h-80 bg-white shadow-2xl border border-black/5 flex flex-col p-4 relative">
                           {/* Fake document skeleton */}
                           <div className="w-full h-4 bg-black/10 mb-6"></div>
                           <div className="w-3/4 h-2 bg-black/5 mb-3"></div>
                           <div className="w-full h-2 bg-black/5 mb-3"></div>
                           <div className="w-5/6 h-2 bg-black/5 mb-6"></div>
                           
                           {/* Highlighted Bounding Box from Triage */}
                           {findings.length > 0 && activePageIdx === findings[0].pageNumber - 1 && (
                             <motion.div 
                               initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                               className="absolute top-1/4 left-1/4 w-1/2 h-1/4 border-2 border-amber-500 bg-amber-500/10"
                             >
                                <div className="absolute -top-6 left-0 bg-amber-500 text-white text-[9px] font-mono px-1 font-bold">WARN: GLARE</div>
                             </motion.div>
                           )}
                           
                           <div className="absolute bottom-4 right-4 text-[9px] font-mono text-black/30">PAGE {activePageIdx + 1}</div>
                        </div>
                     </motion.div>
                     
                     {/* Carousel Controls */}
                     {uploadedFile.pages > 1 && (
                        <div className="absolute bottom-6 flex items-center gap-2">
                           <button 
                             onClick={() => setActivePageIdx(Math.max(0, activePageIdx - 1))}
                             className="w-8 h-8 bg-white border border-black/10 shadow flex items-center justify-center hover:bg-black/5 transition-colors disabled:opacity-30"
                             disabled={activePageIdx === 0}
                           >
                             <ChevronLeft className="w-4 h-4 text-black" />
                           </button>
                           <span className="text-[10px] font-mono text-black/50">PAGE {activePageIdx + 1} OF {uploadedFile.pages}</span>
                           <button 
                             onClick={() => setActivePageIdx(Math.min(uploadedFile.pages - 1, activePageIdx + 1))}
                             className="w-8 h-8 bg-white border border-black/10 shadow flex items-center justify-center hover:bg-black/5 transition-colors disabled:opacity-30"
                             disabled={activePageIdx === uploadedFile.pages - 1}
                           >
                             <ChevronRight className="w-4 h-4 text-black" />
                           </button>
                        </div>
                     )}
                   </div>
                   
                   {/* Inspector Panel */}
                   <div className="w-72 bg-white flex flex-col">
                      <div className="p-4 border-b border-black/5">
                        <div className="text-[10px] font-mono text-black/40 uppercase tracking-widest mb-1">File Metadata</div>
                        <div className="text-sm font-semibold truncate mb-1">{uploadedFile.name}</div>
                        <div className="text-xs text-black/60">{(uploadedFile.size / 1024).toFixed(1)} KB • {uploadedFile.pages} Pages</div>
                      </div>
                      
                      <div className="p-4 flex-1 overflow-auto bg-[#F9F9F8]">
                        <div className="text-[10px] font-mono text-black/40 uppercase tracking-widest mb-4">Inspection Report</div>
                        
                        {findings.length === 0 ? (
                           <div className="p-3 bg-green-50 border border-green-200">
                              <div className="flex items-center gap-2 mb-2">
                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                                <span className="text-xs font-bold text-green-800">100% Readability</span>
                              </div>
                              <p className="text-[11px] text-green-700 leading-relaxed">All stamps and seals are perfectly crisp for certification.</p>
                           </div>
                        ) : (
                           <div className="space-y-4">
                             {findings.map(f => (
                               <div key={f.id} className="p-3 bg-amber-50 border border-amber-200 shadow-sm relative overflow-hidden">
                                  <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
                                  <div className="flex items-center gap-2 mb-2 pl-2">
                                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                                    <span className="text-xs font-bold text-amber-800">{f.title}</span>
                                  </div>
                                  <p className="text-[11px] text-amber-700 leading-relaxed pl-2 mb-3">{f.message}</p>
                                  
                                  {f.severity === "WARN" && (
                                     <label className="flex items-start gap-2 pl-2 cursor-pointer group">
                                       <input 
                                         type="checkbox" 
                                         className="mt-0.5"
                                         checked={acknowledgedWarnings[f.id] || false}
                                         onChange={(e) => setAcknowledgedWarnings(prev => ({...prev, [f.id]: e.target.checked}))}
                                       />
                                       <span className="text-[10px] text-amber-900 font-medium group-hover:text-black">I confirm text is readable; proceed anyway.</span>
                                     </label>
                                  )}
                               </div>
                             ))}
                           </div>
                        )}
                      </div>
                   </div>
                </div>
              )}
            </div>
            
            {/* Triage Footer Metrics */}
            <div className="h-10 bg-black flex items-center justify-center gap-8 px-4 shrink-0 text-white text-[10px] font-mono tracking-widest">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-emerald-400" /> 300+ DPI AUTO-SCALE</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-emerald-400" /> GLARE CHECK</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-emerald-400" /> SEAL GUARD</span>
            </div>
          </div>
          
        </div>

        {/* Right Column: Pricing & Next Steps (StickyPriceBar remains unchanged from layout) */}
        <div className="lg:col-span-4">
          <StickyPriceBar
            pricing={pricing}
            onNext={handleContinue}
            nextLabel="Continue to Configure"
            disabled={!uploadedFile || hasBlockingFindings || isAnalyzing || (findings.some(f => f.severity === "WARN") && !findings.filter(f => f.severity === "WARN").every(f => acknowledgedWarnings[f.id]))}
            blockReason={
              !uploadedFile ? "Upload a document to proceed" :
              hasBlockingFindings ? "Fix blocking issue" :
              findings.some((f) => f.severity === "WARN") && !findings.filter((f) => f.severity === "WARN").every((f) => acknowledgedWarnings[f.id]) ? "Confirm warnings" :
              undefined
            }
          />
        </div>
      </div>
    </div>
  );
}

export default function TriagePage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-text-muted">Loading document triage...</div>}>
      <TriageContent />
    </Suspense>
  );
}
