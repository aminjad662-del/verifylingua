"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DashboardNav } from "@/components/layout/DashboardNav";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle2,
  UploadCloud,
  FileText,
  ShieldCheck,
  Zap,
  Clock,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  AlertCircle,
  HelpCircle,
  Lock,
  Trash2,
  RefreshCw,
  Scale,
  Stethoscope,
  Cpu,
  Globe,
  Award,
} from "lucide-react";

const SERVICES = [
  {
    id: "CERTIFIED",
    name: "Certified Translation (USCIS 8 CFR 103.2)",
    pricePerPage: 24.95,
    turnaround: "24-48 hrs",
    icon: Award,
    popular: true,
    desc: "ATA-certified linguist, signed affidavit of accuracy, seal, and 100% USCIS acceptance guarantee.",
  },
  {
    id: "NOTARIZED",
    name: "Notarized Translation",
    pricePerPage: 44.90,
    turnaround: "36 hrs",
    icon: ShieldCheck,
    desc: "Certified translation sworn before a licensed Notary Public with cryptographic seal and e-apostille readiness.",
  },
  {
    id: "STANDARD",
    name: "Standard Translation",
    pricePerPage: 19.95,
    turnaround: "48 hrs",
    icon: FileText,
    desc: "Accurate human translation for general business documents, personal communications, and non-court filings.",
  },
  {
    id: "LEGAL",
    name: "Legal & Court Translation",
    pricePerPage: 29.95,
    turnaround: "48 hrs",
    icon: Scale,
    desc: "Specialized legal linguist for court exhibits, affidavits, contracts, and civil proceedings.",
  },
  {
    id: "MEDICAL",
    name: "Medical & Clinical Translation",
    pricePerPage: 34.95,
    turnaround: "48 hrs",
    icon: Stethoscope,
    desc: "HIPAA and MedDRA compliant translation for patient records, clinical protocols, and pharmacy dossiers.",
  },
  {
    id: "TECHNICAL",
    name: "Technical & Engineering",
    pricePerPage: 29.95,
    turnaround: "72 hrs",
    icon: Cpu,
    desc: "Engineering specifications, patents, industrial manuals, and schematic diagrams.",
  },
  {
    id: "LOCALIZATION",
    name: "Software & Web Localization",
    pricePerPage: 24.95,
    turnaround: "48 hrs",
    icon: Globe,
    desc: "Contextual UI localization, app strings, terminology management, and responsive layouts.",
  },
  {
    id: "PROOFREADING",
    name: "Bilingual Proofreading & QA",
    pricePerPage: 12.95,
    turnaround: "24 hrs",
    icon: CheckCircle2,
    desc: "Rigorous linguistic verification and editing of previously translated documents.",
  },
];

const LANGUAGES = [
  "Spanish", "English", "French", "German", "Arabic", "Japanese", "Chinese (Simplified)",
  "Russian", "Portuguese", "Italian", "Ukrainian", "Korean", "Hindi", "Vietnamese", "Polish"
];

const DOCUMENT_TYPES = [
  "Birth Certificate / Acta de Nacimiento",
  "Marriage Certificate / Certificado de Matrimonio",
  "Academic Diploma & University Transcript",
  "Police Clearance / Antecedentes No Penales",
  "Corporate Articles & Registration",
  "Court Exhibit / Legal Pleading",
  "Medical History & Hospital Record",
  "Passport / National Identification Card",
  "Financial Bank Statement",
  "Other Official Document",
];

const RECEIVING_PARTIES = [
  "USCIS (Immigration)",
  "State Department / US Embassy",
  "Court / Legal Proceedings",
  "WES / Academic Credential Evaluator",
  "Medical Board / FDA",
  "Employer / Corporate HR",
  "Foreign Consulate",
  "Other",
];

export default function NewTranslationRequestWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = React.useState(1);

  // Form State
  const [selectedService, setSelectedService] = React.useState("CERTIFIED");
  const [isRush, setIsRush] = React.useState(false);
  const [uploadedFiles, setUploadedFiles] = React.useState<any[]>([
    {
      name: "Birth_Certificate_Scan.pdf",
      size: 1420000,
      type: "application/pdf",
      pages: 2,
      status: "CLEAN",
    },
  ]);
  const [sourceLang, setSourceLang] = React.useState("Spanish");
  const [targetLang, setTargetLang] = React.useState("English");
  const [docType, setDocType] = React.useState("Birth Certificate / Acta de Nacimiento");
  const [receivingParty, setReceivingParty] = React.useState("USCIS (Immigration)");
  const [clientName, setClientName] = React.useState("Alejandro Hernandez");
  const [clientEmail, setClientEmail] = React.useState("alejandro.hernandez@lawdesk.org");
  const [glossaryNotes, setGlossaryNotes] = React.useState("Please ensure applicant maternal surname 'Valenzuela' matches passport exactly.");
  const [termsAccepted, setTermsAccepted] = React.useState(true);

  // Submission State
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submittedOrder, setSubmittedOrder] = React.useState<any | null>(null);

  // Calculations
  const totalPages = uploadedFiles.reduce((acc, f) => acc + (f.pages || 1), 0) || 1;
  const wordCount = totalPages * 250;
  const currentServiceObj = SERVICES.find((s) => s.id === selectedService) || SERVICES[0];
  const basePrice = totalPages * currentServiceObj.pricePerPage;
  const rushFee = isRush ? basePrice * 0.5 : 0;
  const notarizationFee = selectedService === "NOTARIZED" ? 0 : 0;
  const totalPrice = basePrice + rushFee + notarizationFee;

  const handleFileUploadMock = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArr = Array.from(e.target.files);
      const newFiles = filesArr.map((f) => ({
        name: f.name,
        size: f.size,
        type: f.type,
        pages: f.size > 2000000 ? 3 : 1,
        status: "CLEAN",
      }));
      setUploadedFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmitRequest = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/dashboard/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceType: selectedService,
          sourceLang,
          targetLangs: [targetLang],
          clientName,
          clientEmail,
          receivingParty,
          notes: glossaryNotes,
          isRush,
          pageCount: totalPages,
          wordCount,
          uploadedFiles: uploadedFiles.map((f) => ({
            name: f.name,
            size: f.size,
            type: f.type,
          })),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSubmittedOrder(data.order);
        setCurrentStep(5);
      }
    } catch (err) {
      console.error("Submission failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-text">
      <DashboardNav />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Wizard Stepper Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Link
              href="/dashboard"
              className="text-xs font-mono text-text-muted hover:text-brand-ink flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Dashboard
            </Link>
            <span className="text-xs font-mono text-text-muted">
              Step {currentStep} of 5
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-ink tracking-tight">
                {currentStep === 1 && "Step 1: Select Translation Service"}
                {currentStep === 2 && "Step 2: Upload Documents"}
                {currentStep === 3 && "Step 3: Language & Formatting Details"}
                {currentStep === 4 && "Step 4: Review Quote & Delivery Estimate"}
                {currentStep === 5 && "Step 5: Order Confirmed"}
              </h1>
              <p className="text-xs sm:text-sm text-text-muted mt-0.5">
                {currentStep === 1 && "Choose the compliance level required by your receiving institution."}
                {currentStep === 2 && "Upload your document scans (PDF, DOCX, JPG, PNG up to 50MB per file)."}
                {currentStep === 3 && "Specify language pairs, legal intended use, and applicant spelling."}
                {currentStep === 4 && "Transparent per-page pricing with guaranteed delivery timeframe."}
                {currentStep === 5 && "Your translation request is registered and in active processing."}
              </p>
            </div>
          </div>

          {/* Stepper Dots */}
          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map((stepNum) => (
              <div
                key={stepNum}
                className={`h-1.5 rounded-full transition-all ${
                  stepNum < currentStep
                    ? "bg-status-success"
                    : stepNum === currentStep
                    ? "bg-brand-500"
                    : "bg-border"
                }`}
              />
            ))}
          </div>
        </div>

        {/* STEP 1: SERVICE SELECTION */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SERVICES.map((srv) => {
                const Icon = srv.icon;
                const isSelected = selectedService === srv.id;
                return (
                  <div
                    key={srv.id}
                    onClick={() => setSelectedService(srv.id)}
                    className={`cursor-pointer p-5 rounded-2xl border transition-all relative flex flex-col justify-between ${
                      isSelected
                        ? "border-brand-500 bg-brand-50/20 ring-2 ring-brand-500/20 shadow-sm"
                        : "border-border bg-surface-raised hover:border-border-strong hover:bg-surface"
                    }`}
                  >
                    {srv.popular && (
                      <span className="absolute top-4 right-4 text-[10px] font-mono px-2 py-0.5 rounded-full bg-brand-50 text-brand-600 font-bold border border-brand-100">
                        MOST POPULAR
                      </span>
                    )}

                    <div className="space-y-2.5">
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl ${isSelected ? "bg-brand-500 text-white" : "bg-surface text-brand-ink"}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-brand-ink">{srv.name}</h3>
                          <span className="text-xs font-mono text-text-muted">Turnaround: {srv.turnaround}</span>
                        </div>
                      </div>
                      <p className="text-xs text-text-muted leading-relaxed">{srv.desc}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between">
                      <span className="text-xs font-mono text-text-muted">Starting from</span>
                      <span className="font-mono font-black text-sm text-brand-ink">
                        ${srv.pricePerPage.toFixed(2)} <span className="text-[10px] font-normal text-text-muted">/ page</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Rush Delivery Toggle */}
            <div className="p-4 rounded-2xl border border-border bg-surface flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-200/50">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-brand-ink font-mono">Rush Delivery (12-18 Hour Expedited Turnaround)</h4>
                  <p className="text-[11px] text-text-muted">Prioritize your document at top of ATA linguist workbench queue (+50% base fee).</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsRush(!isRush)}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                  isRush ? "bg-brand-500 justify-end" : "bg-border justify-start"
                }`}
              >
                <div className="bg-white w-4 h-4 rounded-full shadow-md" />
              </button>
            </div>

            {/* Nav Controls */}
            <div className="flex items-center justify-end gap-3 pt-4">
              <Button
                size="lg"
                onClick={() => setCurrentStep(2)}
                className="rounded-xl font-bold bg-brand-500 hover:bg-brand-600 text-white gap-2"
              >
                Next: Upload Documents
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: DOCUMENT UPLOAD */}
        {currentStep === 2 && (
          <div className="space-y-6">
            {/* Drag and Drop Zone */}
            <div className="border-2 border-dashed border-border-strong rounded-3xl p-8 text-center bg-surface-raised space-y-4 hover:border-brand-500/60 transition-colors">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-brand-50 text-brand-500 flex items-center justify-center">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-brand-ink">
                  Drag and drop document files here
                </h3>
                <p className="text-xs text-text-muted mt-1">
                  Supports PDF, DOCX, JPG, PNG, TIFF up to 50MB. Multi-page scanning enabled.
                </p>
              </div>

              <div className="flex items-center justify-center">
                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-surface border border-border hover:bg-surface-raised transition-colors text-brand-ink shadow-sm">
                  <span>Browse Local Files</span>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.docx,.jpg,.jpeg,.png,.tiff"
                    onChange={handleFileUploadMock}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="flex items-center justify-center gap-4 text-[11px] font-mono text-text-muted pt-2">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-status-success" />
                  AES-256 Client-Side Encryption
                </span>
                <span>?</span>
                <span className="flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-brand-500" />
                  Zero Public Indexing
                </span>
              </div>
            </div>

            {/* Uploaded Files Roster */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-text-muted">
                Attached Documents ({uploadedFiles.length})
              </h4>

              {uploadedFiles.map((f, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-border bg-surface flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-surface-raised border border-border text-brand-500">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-brand-ink">{f.name}</p>
                      <p className="text-[11px] font-mono text-text-muted">
                        {(f.size / 1024 / 1024).toFixed(2)} MB ? {f.pages || 1} page(s)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge variant="success" className="text-[10px] font-mono">
                      CLEAN / SCANNED
                    </Badge>
                    <button
                      onClick={() => handleRemoveFile(idx)}
                      className="text-text-muted hover:text-status-danger p-1 transition-colors"
                      title="Remove file"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Nav Controls */}
            <div className="flex items-center justify-between gap-3 pt-4">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setCurrentStep(1)}
                className="rounded-xl font-bold"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
              <Button
                size="lg"
                onClick={() => setCurrentStep(3)}
                className="rounded-xl font-bold bg-brand-500 hover:bg-brand-600 text-white gap-2"
              >
                Next: Language &amp; Details
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: TRANSLATION DETAILS */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Source Language */}
              <div className="space-y-1.5">
                <Label htmlFor="sourceLang">Source Language</Label>
                <select
                  id="sourceLang"
                  value={sourceLang}
                  onChange={(e) => setSourceLang(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-border bg-surface text-sm text-text focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>

              {/* Target Language */}
              <div className="space-y-1.5">
                <Label htmlFor="targetLang">Target Language</Label>
                <select
                  id="targetLang"
                  value={targetLang}
                  onChange={(e) => setTargetLang(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-border bg-surface text-sm text-text focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>

              {/* Document Type */}
              <div className="space-y-1.5">
                <Label htmlFor="docType">Document Category</Label>
                <select
                  id="docType"
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-border bg-surface text-sm text-text focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                >
                  {DOCUMENT_TYPES.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Intended Use */}
              <div className="space-y-1.5">
                <Label htmlFor="receivingParty">Receiving Authority / Intended Use</Label>
                <select
                  id="receivingParty"
                  value={receivingParty}
                  onChange={(e) => setReceivingParty(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-border bg-surface text-sm text-text focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                >
                  {RECEIVING_PARTIES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Special Terminology / Passport Spelling Notes */}
            <div className="space-y-1.5">
              <Label htmlFor="notes">
                Special Terminology, Proper Names &amp; Passport Spellings (Crucial for USCIS)
              </Label>
              <Textarea
                id="notes"
                value={glossaryNotes}
                onChange={(e) => setGlossaryNotes(e.target.value)}
                placeholder="Example: The applicant's name on Colombian passport is spelled 'Valenzuela', please do not transliterate differently..."
                className="h-24 text-xs font-mono"
              />
              <p className="text-[11px] text-text-muted">
                Our linguists cross-verify all proper nouns against this instruction before notarization.
              </p>
            </div>

            {/* Nav Controls */}
            <div className="flex items-center justify-between gap-3 pt-4">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setCurrentStep(2)}
                className="rounded-xl font-bold"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
              <Button
                size="lg"
                onClick={() => setCurrentStep(4)}
                className="rounded-xl font-bold bg-brand-500 hover:bg-brand-600 text-white gap-2"
              >
                Next: Quote &amp; Review
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 4: QUOTE & REVIEW */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Order Summary Spec */}
              <div className="md:col-span-2 space-y-4">
                <Card className="p-6 rounded-2xl border border-border bg-surface-raised space-y-4">
                  <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-brand-ink border-b border-border pb-3">
                    Dossier Configuration Summary
                  </h3>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-text-muted">Service Tier:</span>
                      <p className="font-bold text-brand-ink mt-0.5">{currentServiceObj.name}</p>
                    </div>
                    <div>
                      <span className="text-text-muted">Language Pair:</span>
                      <p className="font-bold text-brand-ink mt-0.5">{sourceLang} ? {targetLang}</p>
                    </div>
                    <div>
                      <span className="text-text-muted">Document Type:</span>
                      <p className="font-bold text-brand-ink mt-0.5">{docType}</p>
                    </div>
                    <div>
                      <span className="text-text-muted">Receiving Authority:</span>
                      <p className="font-bold text-brand-ink mt-0.5">{receivingParty}</p>
                    </div>
                    <div>
                      <span className="text-text-muted">Estimated Word Count:</span>
                      <p className="font-bold font-mono text-brand-ink mt-0.5">{wordCount} words</p>
                    </div>
                    <div>
                      <span className="text-text-muted">Delivery Speed:</span>
                      <p className="font-bold text-brand-ink mt-0.5">
                        {isRush ? "Rush (12-18 hrs)" : "Standard (24-48 hrs)"}
                      </p>
                    </div>
                  </div>

                  {glossaryNotes && (
                    <div className="pt-3 border-t border-border">
                      <span className="text-xs text-text-muted">Terminology Instructions:</span>
                      <p className="text-xs font-mono bg-surface p-2.5 rounded-xl border border-border mt-1 text-text">
                        {glossaryNotes}
                      </p>
                    </div>
                  )}
                </Card>

                {/* Terms Acceptance */}
                <div className="p-4 rounded-xl border border-border bg-surface flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-brand-500 rounded border-border"
                  />
                  <label htmlFor="terms" className="text-xs text-text-muted leading-relaxed cursor-pointer">
                    I confirm that the uploaded documents are accurate and complete. I authorize VerifyLingua&apos;s certified linguists to process and translate these records under ATA Member compliance standards.
                  </label>
                </div>
              </div>

              {/* Price Breakdown Sidebar */}
              <div className="space-y-4">
                <Card className="p-6 rounded-2xl border border-border bg-surface-raised space-y-4 shadow-sm">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-text-muted border-b border-border pb-2">
                    Itemized Quote Breakdown
                  </h3>

                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-text-muted">{totalPages} page(s) ? ${currentServiceObj.pricePerPage.toFixed(2)}</span>
                      <span className="font-mono font-semibold">${basePrice.toFixed(2)}</span>
                    </div>

                    {isRush && (
                      <div className="flex items-center justify-between text-amber-600">
                        <span>Rush Priority Surcharge</span>
                        <span className="font-mono font-semibold">+${rushFee.toFixed(2)}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-text-muted">
                      <span>Certification &amp; 8 CFR Affidavit</span>
                      <span className="font-mono text-status-success font-semibold">INCLUDED</span>
                    </div>

                    <div className="flex items-center justify-between text-text-muted">
                      <span>Digital Cryptographic QR Seal</span>
                      <span className="font-mono text-status-success font-semibold">INCLUDED</span>
                    </div>

                    <div className="flex items-center justify-between text-text-muted">
                      <span>Estimated Taxes</span>
                      <span className="font-mono">$0.00</span>
                    </div>

                    <div className="pt-3 border-t border-border flex items-center justify-between">
                      <span className="font-bold text-sm text-brand-ink">Total Investment</span>
                      <span className="font-mono font-black text-xl text-brand-500">
                        ${totalPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border space-y-2 text-[11px] font-mono text-text-muted">
                    <div className="flex items-center justify-between">
                      <span>Quote Validity:</span>
                      <span className="text-brand-ink font-semibold">7 Days</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Delivery Guarantee:</span>
                      <span className="text-brand-ink font-semibold">
                        {isRush ? "Tomorrow by 12:00 PM" : "In 48 Hours"}
                      </span>
                    </div>
                  </div>

                  <Button
                    size="lg"
                    disabled={!termsAccepted || isSubmitting}
                    onClick={handleSubmitRequest}
                    className="w-full rounded-xl font-bold bg-brand-500 hover:bg-brand-600 text-white gap-2 shadow-md h-12 text-sm"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Generating Dossier...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        Submit Request Now
                      </>
                    )}
                  </Button>
                </Card>
              </div>
            </div>

            {/* Nav Controls */}
            <div className="flex items-center justify-start pt-2">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setCurrentStep(3)}
                className="rounded-xl font-bold"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Details
              </Button>
            </div>
          </div>
        )}

        {/* STEP 5: SUBMISSION CONFIRMATION */}
        {currentStep === 5 && submittedOrder && (
          <div className="max-w-2xl mx-auto space-y-6 text-center py-6">
            <div className="w-16 h-16 rounded-3xl bg-status-success/10 text-status-success flex items-center justify-center mx-auto border border-status-success/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-brand-50 text-brand-500 font-bold border border-brand-100">
                ORDER REGISTERED
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-brand-ink tracking-tight">
                Translation Request Successfully Submitted!
              </h2>
              <p className="text-xs sm:text-sm text-text-muted">
                Reference Code: <strong className="font-mono text-brand-ink">{submittedOrder.publicCode}</strong>
              </p>
            </div>

            <Card className="p-6 rounded-2xl border border-border bg-surface-raised text-left space-y-3">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-text-muted border-b border-border pb-2">
                What Happens Next?
              </h3>
              <div className="space-y-2.5 text-xs text-text leading-relaxed">
                <p className="flex items-start gap-2">
                  <span className="font-mono font-bold text-brand-500 shrink-0">1.</span>
                  <span><strong>Intake &amp; OCR Triage:</strong> Project Manager Marcus Vance conducts spatial fidelity checks on your attached files.</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="font-mono font-bold text-brand-500 shrink-0">2.</span>
                  <span><strong>Linguist Assignment:</strong> A qualified ATA-certified translator is assigned to translate and lock proper nouns.</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="font-mono font-bold text-brand-500 shrink-0">3.</span>
                  <span><strong>QA &amp; Certification:</strong> The sworn 8 CFR 103.2 affidavit and cryptographic seal are attached for client inspection.</span>
                </p>
              </div>
            </Card>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Button asChild size="lg" className="w-full sm:w-auto rounded-xl font-bold bg-brand-500 hover:bg-brand-600 text-white gap-2">
                <Link href={`/dashboard/orders/${submittedOrder.publicCode}`}>
                  Track Live Order
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto rounded-xl font-bold">
                <Link href="/dashboard">
                  Return to Dashboard
                </Link>
              </Button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
