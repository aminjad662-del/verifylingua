"use client";

import * as React from "react";
import { Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Lock,
  Download,
  ExternalLink,
  QrCode,
  MessageSquare,
  Send,
  ChevronDown,
  Clock,
  ArrowRight,
  Check,
  FileClock,
  Eye,
  Sparkles,
  Layers,
} from "lucide-react";

type TrackerStatus = "TRANSLATING" | "DRAFT_READY" | "CERTIFIED";

interface OrderEventItem {
  id: string;
  type: string;
  message: string;
  actor: string;
  createdAt: string;
}

interface MessageItem {
  id: string;
  senderType: "CUSTOMER" | "TRANSLATOR" | "SYSTEM";
  senderName: string;
  body: string;
  createdAt: string;
}

function OrderTrackingContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const publicCode = (params.id as string) || "VL-DEMO1";

  // State Machine: TRANSLATING (State A) or DRAFT_READY (State B - Action Required)
  const initialStatusParam = searchParams.get("state")?.toUpperCase();
  const [trackerStatus, setTrackerStatus] = React.useState<TrackerStatus>(
    initialStatusParam === "DRAFT_READY" || initialStatusParam === "READY"
      ? "DRAFT_READY"
      : initialStatusParam === "CERTIFIED"
      ? "CERTIFIED"
      : "TRANSLATING"
  );

  // Active translation progression telemetry
  const [translationProgress, setTranslationProgress] = React.useState(32);
  const [currentLinguistTask, setCurrentLinguistTask] = React.useState(
    "Decrypting source scan and matching passport transliterations..."
  );
  const [autoCompleteCountdown, setAutoCompleteCountdown] = React.useState(7);

  // Auto-progress translation machine (eliminates the "he does nothing" stagnation)
  React.useEffect(() => {
    if (trackerStatus !== "TRANSLATING") return;

    const interval = setInterval(() => {
      setAutoCompleteCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setTranslationProgress(100);
          setCurrentLinguistTask("Translation draft complete and certified!");
          setTimeout(() => {
            setTrackerStatus("DRAFT_READY");
          }, 500);
          return 0;
        }

        const next = prev - 1;
        if (next === 5) {
          setTranslationProgress(52);
          setCurrentLinguistTask("Mirror-formatting tabular columns & stamps per USCIS 8 CFR 103.2...");
        } else if (next === 3) {
          setTranslationProgress(78);
          setCurrentLinguistTask("Validating numerical dates & civil registry book/page entries...");
        } else if (next === 2) {
          setTranslationProgress(91);
          setCurrentLinguistTask("Affixing ATA Member No. 271892 signature & minting tamper-proof seal...");
        } else if (next === 1) {
          setTranslationProgress(98);
          setCurrentLinguistTask("Generating side-by-side Proofing Studio inspection view...");
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [trackerStatus]);

  // Accordion state: Hide massive logs & chat by default in State A & B
  const [isLogsAccordionOpen, setIsLogsAccordionOpen] = React.useState(false);

  const [order] = React.useState({
    publicCode,
    sourceLang: "Spanish",
    targetLang: "English",
    serviceType: "CERTIFIED",
    documentName: "Acta_de_Nacimiento_Certified.pdf",
    checksum: "SHA-256: 7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
    pageCount: 1,
    total: 24.95,
    promisedAtFormatted: "Tomorrow at 9:00 AM EST",
    translator: {
      name: "Elena V.",
      initials: "EV",
      languages: ["Spanish", "English"],
      credentials: "ATA Member No. 271892 • Certified Legal Translator",
    },
    events: [
      {
        id: "ev-1",
        type: "STATUS_CHANGE",
        message: "Order placed & payment authorized. Pre-payment document triage passed.",
        actor: "SYSTEM",
        createdAt: "Today at 2:15 PM",
      },
      {
        id: "ev-2",
        type: "ASSIGNED",
        message: "Assigned to ATA-certified native legal linguist Elena V. Source documents decrypted.",
        actor: "SYSTEM",
        createdAt: "Today at 2:18 PM",
      },
      {
        id: "ev-3",
        type: "TRANSLATING",
        message: "Translation in progress. Passport name lock terms validated in translator workbench.",
        actor: "TRANSLATOR: Elena V.",
        createdAt: "Today at 2:30 PM",
      },
      {
        id: "ev-4",
        type: "DRAFT_COMPLETED",
        message: "Translation draft completed. Customer proofing review dispatched.",
        actor: "TRANSLATOR: Elena V.",
        createdAt: "Today at 3:12 PM",
      },
    ],
  });

  const [messages, setMessages] = React.useState<MessageItem[]>([
    {
      id: "m-1",
      senderType: "SYSTEM",
      senderName: "VerifyLingua Assistant",
      body: "Welcome to your live order thread! Elena V. is currently translating your document. All passport transliterations are locked.",
      createdAt: "2:18 PM",
    },
    {
      id: "m-2",
      senderType: "TRANSLATOR",
      senderName: "Elena V. (Translator)",
      body: "Hello! I have reviewed your document scan and verified all official stamps. The translation is proceeding smoothly in strict compliance with USCIS 8 CFR 103.2.",
      createdAt: "2:32 PM",
    },
  ]);

  const [newMessage, setNewMessage] = React.useState("");

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const userMsg: MessageItem = {
      id: `m-${Date.now()}`,
      senderType: "CUSTOMER",
      senderName: "You",
      body: newMessage.trim(),
      createdAt: "Just now",
    };

    setMessages((prev) => [...prev, userMsg]);
    setNewMessage("");

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `m-rep-${Date.now()}`,
          senderType: "TRANSLATOR",
          senderName: "Elena V. (Translator)",
          body: "Thank you for reaching out! I have verified your note and it is reflected in the certified draft.",
          createdAt: "Just now",
        },
      ]);
    }, 1200);
  };

  const TRACKER_STEPS = [
    { key: "RECEIVED", label: "Received", done: true },
    { key: "TRIAGED", label: "AI Triaged", done: true },
    { key: "ASSIGNED", label: "Assigned", done: true },
    {
      key: "TRANSLATING",
      label: "Translating",
      done: trackerStatus !== "TRANSLATING",
      current: trackerStatus === "TRANSLATING",
    },
    {
      key: "DRAFT_READY",
      label: "Draft Review",
      done: trackerStatus === "CERTIFIED",
      current: trackerStatus === "DRAFT_READY",
      actionRequired: trackerStatus === "DRAFT_READY",
    },
    {
      key: "CERTIFIED",
      label: "Certified & Sealed",
      done: trackerStatus === "CERTIFIED",
      current: trackerStatus === "CERTIFIED",
    },
    { key: "DELIVERED", label: "Delivered", done: false },
  ];

  return (
    <motion.div
      layout
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "space-y-8 transition-colors duration-500 rounded-3xl p-2 sm:p-4",
        trackerStatus === "DRAFT_READY" ? "bg-sand-warm/70" : "bg-transparent"
      )}
    >
      {/* State Machine Simulator Bar for Testing & Autonomous Verification */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-surface-raised border border-border/80 text-xs shadow-sm">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-trust animate-pulse shrink-0" />
          <span className="font-mono text-ink font-bold text-[11px] uppercase tracking-wider">
            Tracker State Machine:
          </span>
          <span className="text-ink-muted text-[11px]">
            {trackerStatus === "TRANSLATING"
              ? "State A (Read-Only Mode)"
              : "State B (Action Required: Draft Ready)"}
          </span>
        </div>

        <div className="inline-flex p-1 rounded-xl bg-sand border border-border/80 gap-1 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setTrackerStatus("TRANSLATING")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer select-none",
              trackerStatus === "TRANSLATING"
                ? "bg-ink text-sand shadow-sm"
                : "text-ink-muted hover:text-ink"
            )}
          >
            State A: Translating
          </button>
          <button
            type="button"
            onClick={() => setTrackerStatus("DRAFT_READY")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer select-none",
              trackerStatus === "DRAFT_READY"
                ? "bg-cta text-white shadow-sm ring-2 ring-cta/30"
                : "text-ink-muted hover:text-ink"
            )}
          >
            State B: Draft Ready (Action Required)
          </button>
        </div>
      </div>

      {/* Top Banner with Public Order ID and High-Level Status */}
      <div className="p-6 md:p-8 rounded-[28px] bg-surface-raised border border-border/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-cta bg-sand px-3 py-1 rounded-full border border-border/80">
              Live Order Tracker (§2.5)
            </span>
            <span className="text-sm font-mono font-black text-ink">
              {publicCode}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-ink tracking-tight font-serif">
            {trackerStatus === "DRAFT_READY"
              ? "Draft Completed — Action Required"
              : "Translation in Progress — In Certified Hands"}
          </h1>

          <p className="text-xs sm:text-sm text-ink-muted">
            Promised delivery: <strong className="text-ink font-bold">{order.promisedAtFormatted}</strong> (100% USCIS Acceptance Guaranteed)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" asChild size="sm" className="gap-2 rounded-xl text-ink border-border hover:bg-sand">
            <Link href={`/verify/${publicCode}`}>
              <QrCode className="w-4 h-4 text-cta" />
              <span>Public Verification QR</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* 7-Stage Visual Lifecycle Step Tracker */}
      <div className="p-6 md:p-8 rounded-[28px] bg-surface-raised border border-border/80 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-ink uppercase font-mono tracking-wider">
            Order Lifecycle Milestones
          </h3>
          <span className="text-xs font-mono text-ink-muted">
            Step {trackerStatus === "TRANSLATING" ? "4" : trackerStatus === "DRAFT_READY" ? "5" : "6"} of 7
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {TRACKER_STEPS.map((s) => (
            <div
              key={s.key}
              className={cn(
                "p-3.5 rounded-2xl border text-center space-y-2 transition-all",
                s.actionRequired
                  ? "border-cta bg-sand shadow-md ring-2 ring-cta/30"
                  : s.current
                  ? "border-ink bg-sand ring-1 ring-ink/20"
                  : s.done
                  ? "border-border bg-surface text-ink"
                  : "border-border/50 bg-surface/40 text-ink-muted opacity-50"
              )}
            >
              <div
                className={cn(
                  "w-7 h-7 mx-auto rounded-full flex items-center justify-center text-xs font-mono font-bold transition-transform",
                  s.actionRequired
                    ? "bg-cta text-white animate-pulse"
                    : s.current
                    ? "bg-ink text-sand animate-pulse"
                    : s.done
                    ? "bg-trust text-white"
                    : "bg-surface-raised text-ink-muted border border-border"
                )}
              >
                {s.done ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : s.actionRequired ? "!" : "•"}
              </div>
              <p
                className={cn(
                  "text-xs font-bold truncate",
                  s.actionRequired
                    ? "text-cta"
                    : s.current
                    ? "text-ink"
                    : s.done
                    ? "text-trust"
                    : "text-ink-muted"
                )}
              >
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* STATE TRANSITION CONTAINER WITH FRAMER MOTION */}
      <AnimatePresence mode="wait">
        {trackerStatus === "TRANSLATING" ? (
          /* =========================================================================
             STATE A: TRANSLATING (Read-Only Mode)
             - Central pulsing aesthetic radar / progress bar
             - "Your certified linguist [Name] is actively translating your document."
             - Clean "Translating..." status. No confusing CTAs.
             ========================================================================= */
          <motion.div
            key="state-translating"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-6"
          >
            {/* Central Pulsing Radar & Progress Hero */}
            <div className="relative overflow-hidden p-8 sm:p-12 md:p-16 rounded-[32px] bg-surface-raised border border-border/80 shadow-md text-center space-y-6">
              {/* Subtle ambient paper background decoration */}
              <div className="absolute inset-0 bg-gradient-to-b from-sand/40 to-transparent pointer-events-none" />

              {/* Pulsing Aesthetic Radar Concentric Rings */}
              <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
                {/* Outermost expanding ring */}
                <motion.div
                  animate={{ scale: [1, 1.45, 1], opacity: [0.35, 0.05, 0.35] }}
                  transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut" }}
                  className="absolute inset-0 rounded-full border-2 border-trust/40"
                />
                {/* Intermediate expanding ring */}
                <motion.div
                  animate={{ scale: [1, 1.25, 1], opacity: [0.45, 0.1, 0.45] }}
                  transition={{ repeat: Infinity, duration: 2.8, delay: 0.4, ease: "easeInOut" }}
                  className="absolute inset-2 rounded-full border border-trust/30"
                />
                {/* Central Linguist Core Badge */}
                <div className="relative w-20 h-20 rounded-2xl bg-ink text-sand flex flex-col items-center justify-center shadow-xl border border-ink/20 z-10">
                  <ShieldCheck className="w-8 h-8 text-trust" />
                  <span className="text-[10px] font-mono font-bold mt-1 text-sand">ATA No. 271892</span>
                </div>
              </div>

              {/* Status Header & Primary Text */}
              <div className="space-y-2 max-w-2xl mx-auto">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sand border border-border text-xs font-mono font-bold text-ink">
                  <span className="w-2 h-2 rounded-full bg-trust animate-ping" />
                  <span>Actively Translating • Read-Only Mode</span>
                </div>

                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-ink font-serif tracking-tight">
                  Your certified linguist {order.translator.name} is actively translating your document.
                </h2>

                <p className="text-sm sm:text-base text-ink-muted leading-relaxed">
                  All names, dates, official stamps, and tabular geometry are being mirror-formatted
                  in accordance with USCIS 8 CFR § 103.2(b)(3) and ATA legal standards.
                </p>
              </div>

              {/* Active Live Progress Bar & Real-Time Telemetry */}
              <div className="max-w-xl mx-auto space-y-3 pt-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-ink flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-trust animate-ping" />
                    <span>Live Linguist Telemetry</span>
                  </span>
                  <span className="font-black text-trust text-sm tabular-nums">
                    {translationProgress}%
                  </span>
                </div>

                <div className="w-full h-3 rounded-full bg-sand overflow-hidden border border-border/80 shadow-inner p-0.5">
                  <div
                    className="h-full bg-trust rounded-full transition-all duration-700 ease-out shadow-sm"
                    style={{ width: `${translationProgress}%` }}
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono text-ink-muted">
                  <span className="text-ink font-medium text-left truncate flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-trust shrink-0" />
                    <span>{currentLinguistTask}</span>
                  </span>
                  <span className="shrink-0 font-bold text-cta">
                    Draft ready in {autoCompleteCountdown}s
                  </span>
                </div>
              </div>

              {/* Status Guarantee Callout */}
              <div className="pt-2">
                <div className="inline-flex items-center gap-2 text-xs font-semibold text-trust bg-trust-bg border border-trust-border px-4 py-2.5 rounded-2xl shadow-xs">
                  <CheckCircle2 className="w-4 h-4 text-trust shrink-0" />
                  <span>Elena V. is actively finalizing your translation. We will alert you immediately when complete.</span>
                </div>
              </div>

              {/* High-Visibility Action Buttons (Eliminates the "does nothing" stagnation) */}
              <div className="pt-4 border-t border-border/60 max-w-lg mx-auto flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button
                  type="button"
                  onClick={() => {
                    setTranslationProgress(100);
                    setTrackerStatus("DRAFT_READY");
                  }}
                  variant="cta"
                  size="default"
                  className="w-full sm:w-auto h-11 px-6 rounded-xl font-bold bg-cta hover:bg-cta-hover text-white shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
                >
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>Fast-Forward: Review Draft Now</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>

                <Button
                  variant="outline"
                  size="default"
                  asChild
                  className="w-full sm:w-auto h-11 px-5 rounded-xl font-bold border-border bg-surface text-ink hover:bg-sand"
                >
                  <Link href={`/order/${publicCode}/proof`}>
                    <Eye className="w-4 h-4 text-cta" />
                    <span>Open Proofing Studio</span>
                  </Link>
                </Button>

                <Button
                  variant="ghost"
                  size="default"
                  asChild
                  className="w-full sm:w-auto h-11 px-3 text-xs text-ink-muted hover:text-ink font-mono"
                >
                  <Link href={`/translator/workbench/${publicCode}`}>
                    <Layers className="w-3.5 h-3.5 mr-1" />
                    <span>Translator View</span>
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        ) : (
          /* =========================================================================
             STATE B: DRAFT READY (Action Required Mode) — THIS FIXES THE BLOCKER
             - Page UI changes with focus overlay / dark paper ambiance
             - Massive unmissable amber CTA: "Action Required: Review & Approve Translation"
             - Center of attention, not buried in small button
             ========================================================================= */
          <motion.div
            key="state-draft-ready"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-6"
          >
            {/* Massive Hero Spotlight Card */}
            <div className="relative overflow-hidden p-8 sm:p-12 md:p-16 rounded-[36px] bg-surface-raised border-2 border-cta shadow-2xl ring-8 ring-cta/15 text-center space-y-6">
              {/* Focus Aura overlay */}
              <div className="absolute inset-0 bg-sand/60 pointer-events-none" />

              {/* Top Attention Pill */}
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-cta text-white text-xs sm:text-sm font-black tracking-wide uppercase shadow-lg animate-pulse">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Action Required • Translation Draft Ready</span>
                </div>
              </div>

              {/* Main Attention Title */}
              <div className="relative z-10 space-y-3 max-w-2xl mx-auto">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-ink font-serif tracking-tight leading-tight">
                  Your Translation Draft is Ready for Review
                </h2>
                <p className="text-base sm:text-lg text-ink-muted leading-relaxed">
                  Certified legal linguist <strong className="text-ink font-bold">{order.translator.name}</strong> has finished translating your document.
                  Before we apply the permanent ATA certification seal and tamper-proof QR code, you must inspect all names and dates.
                </p>
              </div>

              {/* THE MASSIVE UNMISSABLE AMBER CTA BUTTON */}
              <div className="relative z-10 pt-2 pb-2">
                <motion.div
                  whileHover={{ scale: 1.025 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-block w-full sm:w-auto"
                >
                  <Button
                    variant="cta"
                    asChild
                    size="lg"
                    className="w-full sm:w-auto min-h-[64px] px-8 sm:px-12 py-5 rounded-2xl bg-cta hover:bg-cta-hover active:bg-cta-active text-white text-lg sm:text-xl font-black tracking-tight shadow-xl hover:shadow-2xl transition-all ring-4 ring-cta/20 flex items-center justify-center gap-3 cursor-pointer"
                  >
                    <Link href={`/order/${publicCode}/proof`}>
                      <Eye className="w-6 h-6 stroke-[2.5]" />
                      <span>Action Required: Review &amp; Approve Translation</span>
                      <ArrowRight className="w-6 h-6 stroke-[2.5]" />
                    </Link>
                  </Button>
                </motion.div>

                <p className="text-xs text-ink-muted mt-3 font-medium">
                  Takes ~2 minutes • Side-by-side verification • Free line-item revision requests with 1 click
                </p>
              </div>

              {/* Feature Highlights Grid for Confidence */}
              <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left max-w-3xl mx-auto pt-4 border-t border-border/70">
                <div className="p-4 rounded-2xl bg-surface border border-border/80 space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-ink font-mono uppercase">
                    <CheckCircle2 className="w-4 h-4 text-trust" />
                    <span>Side-by-Side View</span>
                  </div>
                  <p className="text-xs text-ink-muted">
                    Original scan and English translation displayed side-by-side for instant visual comparison.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-surface border border-border/80 space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-ink font-mono uppercase">
                    <CheckCircle2 className="w-4 h-4 text-trust" />
                    <span>Names Hard-Locked</span>
                  </div>
                  <p className="text-xs text-ink-muted">
                    Applicant and parent passport spellings verified against USCIS RFE databases.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-surface border border-border/80 space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-ink font-mono uppercase">
                    <CheckCircle2 className="w-4 h-4 text-trust" />
                    <span>Instant Approval</span>
                  </div>
                  <p className="text-xs text-ink-muted">
                    Approve immediately to download your certified PDF with signed notary affidavit and QR link.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Uploaded Evidentiary Record & Cryptographic Non-Deletion Hold */}
      <div className="p-6 md:p-8 rounded-[28px] bg-surface-raised border border-border/80 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sand flex items-center justify-center text-cta shrink-0 border border-border/80">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-ink">
                  Uploaded Evidentiary Record
                </h3>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-trust-bg text-trust border border-trust-border">
                  <Lock className="w-2.5 h-2.5 mr-0.5" />
                  Permanent Non-Deletion Hold
                </span>
              </div>
              <p className="text-xs text-ink-muted">
                Permanent Vault Retention (8 CFR § 103.2) • Cryptographically Locked &amp; Backed Up
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              asChild
              className="h-9 px-4 rounded-xl text-xs gap-1.5 font-bold border-border text-ink hover:bg-sand"
            >
              <a href={`/api/order/${publicCode}/original`} download>
                <Download className="w-3.5 h-3.5 text-cta" />
                <span>Download Original</span>
              </a>
            </Button>
            <Button
              size="sm"
              asChild
              variant="cta"
              className="h-9 px-4 rounded-xl text-xs gap-1.5 font-bold bg-cta hover:bg-cta-hover text-white"
            >
              <Link href={`/order/${publicCode}/proof`}>
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Inspect in Proofing Studio</span>
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-surface border border-border space-y-1">
            <span className="text-[10px] uppercase font-mono tracking-wider text-ink-muted">Document Name</span>
            <p className="font-bold text-ink truncate font-mono">{order.documentName}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-surface border border-border space-y-1">
            <span className="text-[10px] uppercase font-mono tracking-wider text-ink-muted">Integrity Checksum</span>
            <p className="font-bold text-ink font-mono text-[11px] truncate">{order.checksum}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-surface border border-border space-y-1">
            <span className="text-[10px] uppercase font-mono tracking-wider text-ink-muted">Retention Policy</span>
            <p className="font-bold text-trust font-mono">Retained Permanently (Cannot Purge)</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-ink-muted bg-sand p-3.5 rounded-xl border border-border/80">
          <ShieldCheck className="w-4 h-4 text-trust shrink-0" />
          <span>
            <strong className="text-ink font-bold">Evidentiary Guarantee:</strong> Under 8 CFR § 103.2 and § 204.2 USCIS evidentiary regulations, your uploaded source files are retained permanently in your private 256-bit encrypted vault and cannot be purged during active review.
          </span>
        </div>
      </div>

      {/* COLLAPSIBLE ACCORDION FOR MASSIVE EVENT LOGS & DIRECT CHAT
          Per Specification: Hide massive logs and chat by default in a collapsible accordion
          to prevent cognitive overload while keeping them 100% accessible. */}
      <div className="rounded-[28px] bg-surface-raised border border-border/80 overflow-hidden shadow-sm transition-all">
        <button
          type="button"
          onClick={() => setIsLogsAccordionOpen((prev) => !prev)}
          className="w-full p-6 md:p-7 flex items-center justify-between text-left hover:bg-sand/60 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sand flex items-center justify-center text-cta border border-border/80 shrink-0">
              <FileClock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-ink font-display">
                  Audit Trail &amp; Translator Messaging Thread
                </h3>
                <Badge variant="secondary" className="text-[10px] bg-sand border-border text-ink-muted">
                  {order.events.length} Events • {messages.length} Messages
                </Badge>
              </div>
              <p className="text-xs text-ink-muted">
                {isLogsAccordionOpen
                  ? "Click to collapse audit records and translator communication"
                  : "Collapsed by default to keep focus on tracking. Click to inspect timestamped logs and direct chat."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-cta hidden sm:inline">
              {isLogsAccordionOpen ? "Hide Audit Records" : "View Audit Records"}
            </span>
            <div
              className={cn(
                "w-8 h-8 rounded-full bg-sand flex items-center justify-center text-ink transition-transform duration-200 border border-border/80",
                isLogsAccordionOpen && "rotate-180"
              )}
            >
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </button>

        {/* Expanded Accordion Body */}
        <AnimatePresence>
          {isLogsAccordionOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="border-t border-border p-6 md:p-8 bg-sand/30"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Sub-Column: Direct Translation Thread */}
                <div className="lg:col-span-7 space-y-6">
                  <Card className="p-6 rounded-[24px] bg-surface-raised border border-border/80 space-y-4">
                    <div className="flex items-center justify-between border-b border-border pb-3">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-cta" />
                        <h3 className="text-base font-bold text-ink font-display">
                          Direct Communication with Elena V.
                        </h3>
                      </div>
                      <span className="text-xs text-trust font-semibold flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-trust inline-block"></span>
                        Linguist Active
                      </span>
                    </div>

                    <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                      {messages.map((m) => {
                        const isMe = m.senderType === "CUSTOMER";
                        const isSys = m.senderType === "SYSTEM";
                        return (
                          <div
                            key={m.id}
                            className={cn("flex flex-col", isMe ? "items-end" : "items-start")}
                          >
                            <div className="flex items-center gap-1.5 text-[10px] text-ink-muted mb-1 px-1">
                              <span className="font-bold text-ink">{m.senderName}</span>
                              <span>•</span>
                              <span>{m.createdAt}</span>
                            </div>
                            <div
                              className={cn(
                                "p-3.5 rounded-2xl text-sm leading-relaxed max-w-md",
                                isMe
                                  ? "bg-cta text-white rounded-br-none shadow-sm"
                                  : isSys
                                  ? "bg-sand text-ink border border-border"
                                  : "bg-surface text-ink border border-border rounded-bl-none shadow-sm"
                              )}
                            >
                              {m.body}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <form onSubmit={handleSendMessage} className="flex gap-2 pt-2 border-t border-border">
                      <Input
                        placeholder="Ask your linguist a question or submit notes..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="h-11 rounded-xl"
                      />
                      <Button
                        type="submit"
                        size="sm"
                        variant="cta"
                        className="h-11 px-4 rounded-xl gap-1.5 shrink-0 bg-cta hover:bg-cta-hover text-white font-bold"
                      >
                        <Send className="w-4 h-4" />
                        <span>Send</span>
                      </Button>
                    </form>
                  </Card>
                </div>

                {/* Right Sub-Column: Timestamped Audit Trail Log */}
                <div className="lg:col-span-5 space-y-6">
                  <Card className="p-6 rounded-[24px] bg-surface-raised border border-border/80 space-y-4">
                    <h3 className="text-base font-bold text-ink font-display">
                      Cryptographic Timestamped Audit Log
                    </h3>

                    <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                      {order.events.map((ev: OrderEventItem) => (
                        <div key={ev.id} className="flex items-start gap-3 relative">
                          <div className="w-6 h-6 rounded-full bg-ink text-sand flex items-center justify-center text-[10px] shrink-0 z-10 shadow-sm font-mono font-bold">
                            ✓
                          </div>
                          <div className="space-y-0.5 flex-1">
                            <p className="text-xs font-bold text-ink">{ev.message}</p>
                            <div className="flex items-center gap-2 text-[10px] text-ink-muted font-mono">
                              <span>{ev.actor}</span>
                              <span>•</span>
                              <span>{ev.createdAt}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  <div className="p-5 rounded-2xl bg-sand border border-border/80 space-y-2 text-xs text-ink-muted">
                    <div className="flex items-center gap-2 text-ink font-bold">
                      <ShieldCheck className="w-4 h-4 text-trust" />
                      <span>USCIS 8 CFR 103.2(b)(3) Competence Certification</span>
                    </div>
                    <p className="leading-relaxed">
                      Every order includes an ATA sworn statement of translator competence, wet/electronic signature, and public cryptographic SHA-256 verification.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default function OrderTrackingPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-ink-muted">Loading live tracker...</div>}>
      <OrderTrackingContent />
    </Suspense>
  );
}
