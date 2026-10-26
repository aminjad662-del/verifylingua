"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  ShieldCheck, 
  Menu, 
  X, 
  ArrowRight, 
  LayoutDashboard, 
  Zap, 
  ChevronDown,
  FileCheck2,
  Scale,
  FileText,
  GraduationCap,
  FileCheck,
  QrCode,
  ShieldAlert,
  Sparkles,
  ExternalLink,
  LogOut,
  UserCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";

interface UserProfile {
  name: string | null;
  email: string;
}

const SOLUTIONS_ITEMS = [
  {
    title: "1:1 Format Preservation",
    description: "Autonomous coordinate typesetting that preserves stamps, tables, and seals.",
    href: "/how-it-works",
    icon: FileCheck2,
    badge: "8 CFR § 103.2",
  },
  {
    title: "Sworn Translator Certification",
    description: "Formal competence affidavit sealed by certified ATA corporate linguists.",
    href: "/how-it-works#certification",
    icon: Scale,
    badge: "Court Admissible",
  },
  {
    title: "Tamper-Evident SHA-256 Seal",
    description: "Immigration officers scan the embedded QR code to verify cryptographic authenticity.",
    href: "/verify",
    icon: QrCode,
    badge: "Zero-Fraud",
  },
  {
    title: "USCIS RFE Defense Shield",
    description: "100% money-back guarantee with free instant legal response packets if queried.",
    href: "/defense/rfe",
    icon: ShieldAlert,
    badge: "100% Guaranteed",
  },
];

const DOCUMENT_ITEMS = [
  {
    title: "Vital Civil Records",
    description: "Birth certificates, marriage licenses, death records, divorce decrees.",
    href: "/documents/birth-certificate",
    icon: FileText,
  },
  {
    title: "Academic Transcripts & Degrees",
    description: "University diplomas, mark sheets, and syllabus packets for WES & USCIS.",
    href: "/documents/academic-diploma",
    icon: GraduationCap,
  },
  {
    title: "Background & Police Clearances",
    description: "Federal criminal records, apostilled certificates, and consular packets.",
    href: "/documents/marriage-certificate",
    icon: FileCheck,
  },
];

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [activeDropdown, setActiveDropdown] = React.useState<"solutions" | "documents" | null>(null);
  const [scrolled, setScrolled] = React.useState(false);
  const [currentUser, setCurrentUser] = React.useState<UserProfile | null>(null);
  const [credits, setCredits] = React.useState<number | null>(null);

  const navContainerRef = React.useRef<HTMLDivElement | null>(null);
  const dropdownTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = (type: "solutions" | "documents") => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    setActiveDropdown(type);
  };

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 180);
  };

  // Scroll detection for Apple Liquid Glass translucency and specular depth
  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 16);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Dismiss dropdowns on outside click or Escape key
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navContainerRef.current && !navContainerRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveDropdown(null);
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Lock body scroll when mobile menu is open
  React.useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // Fetch session & credit balance
  React.useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.authenticated && data.user) {
          setCurrentUser(data.user);
        } else {
          setCurrentUser(null);
        }
      })
      .catch(() => setCurrentUser(null));

    fetch("/api/billing/balance")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && typeof data.available === "number") {
          setCredits(data.available);
        }
      })
      .catch(() => {});
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    document.cookie = "vl_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "vl_role=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "sso_google=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "sso_apple=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT";
    setCurrentUser(null);
    window.location.href = "/";
  };

  return (
    <header 
      ref={navContainerRef}
      role="banner"
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-200 ease-out font-sans select-none",
        "backdrop-blur-2xl backdrop-saturate-150",
        scrolled 
          ? "bg-white/85 dark:bg-[#0C0D11]/85 border-b border-black/[0.06] dark:border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.05),inset_0_1px_0_0_rgba(255,255,255,0.9)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.06)] py-2 sm:py-2.5" 
          : "bg-white/70 dark:bg-[#0C0D11]/70 border-b border-black/[0.04] dark:border-white/[0.05] shadow-[0_2px_8px_rgba(0,0,0,0.02),inset_0_1px_0_0_rgba(255,255,255,0.8)] py-3 sm:py-3.5"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-11 sm:h-12">
          
          {/* Left: Apple Brand Seal & Identity */}
          <div className="flex items-center gap-3 lg:gap-6 xl:gap-8">
            <Link 
              href="/" 
              className="flex items-center gap-2.5 group shrink-0 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-500 rounded-full pr-2"
              aria-label="VerifyLingua Homepage"
            >
              {/* Apple Squircle Icon Badge with Inset Specular Highlight */}
              <div className="relative flex items-center justify-center w-8.5 h-8.5 rounded-[12px] bg-gradient-to-b from-brand-500 to-brand-600 text-white shadow-[0_2px_10px_rgba(37,99,235,0.28),inset_0_1px_0_rgba(255,255,255,0.4)] ring-1 ring-inset ring-white/20 transition-transform duration-200 ease-out group-hover:scale-[1.04] active:scale-[0.96]">
                <ShieldCheck className="w-4.5 h-4.5 text-white" strokeWidth={2.2} />
              </div>
              <div className="flex flex-col text-left">
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="text-[17px] sm:text-[18px] font-bold tracking-tight text-slate-900 dark:text-white">
                    Verify<span className="text-brand-600 dark:text-brand-400">Lingua</span>
                  </span>
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-[9px] font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
                    USCIS Certified
                  </span>
                  <span className="w-1 h-1 rounded-full bg-emerald-500 inline-block" />
                </div>
              </div>
            </Link>

            {/* Desktop Navigation Links with Apple HIG Liquid Glass Popovers */}
            <nav className="hidden lg:flex items-center gap-0.5" role="navigation" aria-label="Main Navigation">
              
              {/* 1. Features Popover */}
              <div 
                className="relative"
                onMouseEnter={() => handleMouseEnter("solutions")}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  type="button"
                  onClick={() => setActiveDropdown(activeDropdown === "solutions" ? null : "solutions")}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-medium tracking-tight transition-all duration-150 cursor-pointer min-h-[36px] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-500",
                    activeDropdown === "solutions"
                      ? "text-slate-950 dark:text-white bg-black/[0.05] dark:bg-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
                  )}
                  aria-expanded={activeDropdown === "solutions"}
                  aria-haspopup="true"
                >
                  <span>Features</span>
                  <ChevronDown className={cn(
                    "w-3.5 h-3.5 transition-transform duration-200 text-slate-500 dark:text-slate-400", 
                    activeDropdown === "solutions" && "rotate-180 text-slate-900 dark:text-white"
                  )} />
                </button>

                <AnimatePresence>
                  {activeDropdown === "solutions" && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.98 }}
                      transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute left-0 top-full pt-2.5 w-[440px] pointer-events-auto z-50"
                    >
                      {/* Apple Liquid Glass Card Popover */}
                      <div className="relative p-2.5 rounded-[24px] bg-white/95 dark:bg-[#12141A]/95 backdrop-blur-3xl border border-white/80 dark:border-white/10 shadow-[0_24px_64px_-12px_rgba(0,0,0,0.18),0_2px_8px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.03] overflow-hidden">
                        
                        {/* Header Badge */}
                        <div className="px-3.5 py-2 flex items-center justify-between border-b border-black/[0.04] dark:border-white/[0.06] mb-1">
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Core Translation Architecture
                          </span>
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            8 CFR § 103.2
                          </span>
                        </div>

                        {/* List Items */}
                        <div className="space-y-0.5">
                          {SOLUTIONS_ITEMS.map((item) => {
                            const Icon = item.icon;
                            return (
                              <Link
                                key={item.title}
                                href={item.href}
                                onClick={() => setActiveDropdown(null)}
                                className="flex items-start gap-3 p-2.5 rounded-[16px] hover:bg-black/[0.03] dark:hover:bg-white/[0.05] transition-all duration-150 group text-left focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-500"
                              >
                                <div className="w-8.5 h-8.5 rounded-[12px] bg-slate-100/90 dark:bg-slate-800/80 border border-black/[0.04] dark:border-white/[0.06] flex items-center justify-center shrink-0 mt-0.5 text-slate-700 dark:text-slate-300 group-hover:scale-105 group-hover:bg-brand-600 group-hover:text-white group-hover:border-transparent transition-all duration-200">
                                  <Icon className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-2">
                                    <h4 className="text-[13px] font-semibold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                                      {item.title}
                                    </h4>
                                    <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 bg-black/[0.03] dark:bg-white/[0.06] px-2 py-0.5 rounded-full shrink-0">
                                      {item.badge}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mt-0.5 line-clamp-1">
                                    {item.description}
                                  </p>
                                </div>
                              </Link>
                            );
                          })}
                        </div>

                        {/* Bottom Footer Action */}
                        <div className="mt-1 pt-2 border-t border-black/[0.04] dark:border-white/[0.06] px-3 py-1 flex items-center justify-between">
                          <Link
                            href="/how-it-works"
                            onClick={() => setActiveDropdown(null)}
                            className="text-[11px] font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 flex items-center gap-1 group/foot"
                          >
                            <span>Learn about our USCIS legal compliance</span>
                            <ArrowRight className="w-3 h-3 group-hover/foot:translate-x-0.5 transition-transform" />
                          </Link>
                        </div>

                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 2. Documents Popover */}
              <div 
                className="relative"
                onMouseEnter={() => handleMouseEnter("documents")}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  type="button"
                  onClick={() => setActiveDropdown(activeDropdown === "documents" ? null : "documents")}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-medium tracking-tight transition-all duration-150 cursor-pointer min-h-[36px] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-500",
                    activeDropdown === "documents"
                      ? "text-slate-950 dark:text-white bg-black/[0.05] dark:bg-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
                  )}
                  aria-expanded={activeDropdown === "documents"}
                  aria-haspopup="true"
                >
                  <span>Documents</span>
                  <ChevronDown className={cn(
                    "w-3.5 h-3.5 transition-transform duration-200 text-slate-500 dark:text-slate-400", 
                    activeDropdown === "documents" && "rotate-180 text-slate-900 dark:text-white"
                  )} />
                </button>

                <AnimatePresence>
                  {activeDropdown === "documents" && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.98 }}
                      transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute left-0 top-full pt-2.5 w-[380px] pointer-events-auto z-50"
                    >
                      <div className="relative p-2.5 rounded-[24px] bg-white/95 dark:bg-[#12141A]/95 backdrop-blur-3xl border border-white/80 dark:border-white/10 shadow-[0_24px_64px_-12px_rgba(0,0,0,0.18),0_2px_8px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.03] overflow-hidden">
                        
                        <div className="px-3.5 py-2 flex items-center justify-between border-b border-black/[0.04] dark:border-white/[0.06] mb-1">
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Accepted Civil Categories
                          </span>
                          <Link 
                            href="/documents" 
                            onClick={() => setActiveDropdown(null)}
                            className="text-[10px] font-semibold text-brand-600 dark:text-brand-400 hover:underline"
                          >
                            View all 25+ →
                          </Link>
                        </div>

                        <div className="space-y-0.5">
                          {DOCUMENT_ITEMS.map((item) => {
                            const Icon = item.icon;
                            return (
                              <Link
                                key={item.title}
                                href={item.href}
                                onClick={() => setActiveDropdown(null)}
                                className="flex items-start gap-3 p-2.5 rounded-[16px] hover:bg-black/[0.03] dark:hover:bg-white/[0.05] transition-all duration-150 group text-left focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-500"
                              >
                                <div className="w-8.5 h-8.5 rounded-[12px] bg-slate-100/90 dark:bg-slate-800/80 border border-black/[0.04] dark:border-white/[0.06] flex items-center justify-center shrink-0 mt-0.5 text-slate-700 dark:text-slate-300 group-hover:scale-105 group-hover:bg-brand-600 group-hover:text-white group-hover:border-transparent transition-all duration-200">
                                  <Icon className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-[13px] font-semibold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                                    {item.title}
                                  </h4>
                                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mt-0.5 line-clamp-1">
                                    {item.description}
                                  </p>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 3. Direct Navigation Links */}
              <Link
                href="/how-it-works"
                className={cn(
                  "px-3 py-1.5 rounded-full text-[13px] font-medium tracking-tight transition-all duration-150 whitespace-nowrap min-h-[36px] flex items-center focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-500",
                  pathname === "/how-it-works"
                    ? "text-slate-950 dark:text-white bg-black/[0.05] dark:bg-white/[0.08]"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
                )}
              >
                How It Works
              </Link>

              <Link
                href="/pricing"
                className={cn(
                  "px-3 py-1.5 rounded-full text-[13px] font-medium tracking-tight transition-all duration-150 whitespace-nowrap min-h-[36px] flex items-center focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-500",
                  pathname === "/pricing"
                    ? "text-slate-950 dark:text-white bg-black/[0.05] dark:bg-white/[0.08]"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
                )}
              >
                Pricing
              </Link>

              <Link
                href="/counsel"
                className={cn(
                  "hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-medium tracking-tight transition-all duration-150 whitespace-nowrap min-h-[36px] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-500",
                  pathname === "/counsel"
                    ? "text-slate-950 dark:text-white bg-black/[0.05] dark:bg-white/[0.08]"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
                )}
              >
                <span>CounselDesk™</span>
                <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-brand-500/10 text-brand-700 dark:text-brand-300 uppercase tracking-wider border border-brand-500/20">
                  Firms
                </span>
              </Link>

            </nav>
          </div>

          {/* Right: Apple Actions & Micro State Cluster */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            
            {/* Credit Balance Badge (If authenticated) */}
            {credits !== null && (
              <Link
                href="/translate"
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-amber-500/20 bg-amber-500/10 text-amber-900 dark:text-amber-200 text-xs font-medium hover:bg-amber-500/15 transition-colors shrink-0"
                title="Available translation credits"
              >
                <Zap className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 fill-amber-500" />
                <span><strong className="font-semibold">{credits}</strong> Pages</span>
              </Link>
            )}

            {/* Quick Public Verification Shortcut */}
            <Link
              href="/verify"
              className="hidden 2xl:inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white px-3 py-1.5 transition-colors shrink-0 rounded-full hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
            >
              <QrCode className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>Verify Seal</span>
            </Link>

            {/* Dashboard Link */}
            <Link
              href="/dashboard"
              className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors shrink-0"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>Dashboard</span>
            </Link>

            {/* Auth Link (Apple Minimalist Pill) */}
            {currentUser ? (
              <button
                type="button"
                onClick={handleLogout}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign out</span>
              </button>
            ) : (
              <Link
                href="/login"
                className="hidden sm:inline-block px-3 py-1.5 rounded-full text-xs font-medium text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors shrink-0"
              >
                Sign in
              </Link>
            )}

            {/* Apple Tactile Glass CTA Button */}
            <Link
              href="/translate"
              className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-brand-600 hover:bg-brand-500 text-white text-xs sm:text-[13px] font-medium tracking-tight shadow-[0_2px_10px_rgba(37,99,235,0.3),inset_0_1px_0_rgba(255,255,255,0.35)] active:scale-[0.97] transition-all duration-150 ease-out group cursor-pointer whitespace-nowrap shrink-0 min-h-[38px] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
            >
              <span>Start translation</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-150 group-hover:translate-x-0.5 shrink-0" />
            </Link>

            {/* Apple-style Mobile Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-full border border-black/[0.08] dark:border-white/[0.1] bg-white/60 dark:bg-black/30 backdrop-blur-md text-slate-700 dark:text-slate-200 hover:bg-black/[0.05] dark:hover:bg-white/[0.08] focus:outline-hidden cursor-pointer shrink-0 min-w-[38px] min-h-[38px] flex items-center justify-center active:scale-[0.95] transition-transform"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>

        </div>
      </div>

      {/* Apple HIG Mobile Sheet Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop Dimming Layer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-0 top-[52px] sm:top-[56px] z-40 bg-black/25 backdrop-blur-xs lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Frosted Glass Sheet */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-50 lg:hidden border-b border-black/[0.08] dark:border-white/[0.08] bg-white/95 dark:bg-[#12141A]/95 backdrop-blur-3xl shadow-[0_24px_64px_rgba(0,0,0,0.18)] rounded-b-[28px] overflow-hidden px-4 sm:px-6 py-5 max-h-[calc(100vh-64px)] overflow-y-auto"
            >
              <div className="space-y-4 max-w-md mx-auto text-left">
                
                {/* Group 1: Navigation Inset Card */}
                <div className="rounded-[20px] bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.06] divide-y divide-black/[0.04] dark:divide-white/[0.06] overflow-hidden">
                  <div className="px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Services & Technology
                  </div>
                  <Link
                    href="/translate"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-4 py-3 hover:bg-black/[0.02] dark:hover:bg-white/[0.04] text-[14px] font-semibold text-slate-900 dark:text-white active:scale-[0.99] transition-transform min-h-[44px]"
                  >
                    <span>Translation Studio & Intake</span>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </Link>
                  <Link
                    href="/how-it-works"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-4 py-3 hover:bg-black/[0.02] dark:hover:bg-white/[0.04] text-[14px] font-medium text-slate-700 dark:text-slate-200 active:scale-[0.99] transition-transform min-h-[44px]"
                  >
                    <span>How It Works & Compliance</span>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </Link>
                  <Link
                    href="/pricing"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-4 py-3 hover:bg-black/[0.02] dark:hover:bg-white/[0.04] text-[14px] font-medium text-slate-700 dark:text-slate-200 active:scale-[0.99] transition-transform min-h-[44px]"
                  >
                    <span>Transparent Pricing</span>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </Link>
                  <Link
                    href="/documents"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-4 py-3 hover:bg-black/[0.02] dark:hover:bg-white/[0.04] text-[14px] font-medium text-slate-700 dark:text-slate-200 active:scale-[0.99] transition-transform min-h-[44px]"
                  >
                    <span>Accepted Document Catalog</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      25+ Types
                    </span>
                  </Link>
                  <Link
                    href="/counsel"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-4 py-3 hover:bg-black/[0.02] dark:hover:bg-white/[0.04] text-[14px] font-medium text-slate-700 dark:text-slate-200 active:scale-[0.99] transition-transform min-h-[44px]"
                  >
                    <span>CounselDesk™ for Law Firms</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-700 dark:text-brand-300">
                      FIRMS
                    </span>
                  </Link>
                  <Link
                    href="/verify"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-4 py-3 hover:bg-black/[0.02] dark:hover:bg-white/[0.04] text-[14px] font-medium text-slate-700 dark:text-slate-200 active:scale-[0.99] transition-transform min-h-[44px]"
                  >
                    <span>Public QR Verification Portal</span>
                    <QrCode className="w-4 h-4 text-slate-400" />
                  </Link>
                </div>

                {/* Group 2: Account & Action Inset Card */}
                <div className="pt-2 flex flex-col gap-2.5">
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full h-11 rounded-full bg-slate-100 dark:bg-white/[0.08] text-slate-900 dark:text-white font-semibold flex items-center justify-center gap-2 text-[13px] hover:bg-slate-200 dark:hover:bg-white/[0.12] active:scale-[0.98] transition-all min-h-[44px]"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Client Dashboard</span>
                  </Link>

                  {currentUser ? (
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleLogout();
                      }}
                      className="w-full h-11 rounded-full text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 active:scale-[0.98] transition-all cursor-pointer min-h-[44px] flex items-center justify-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign out ({currentUser.name || currentUser.email})</span>
                    </button>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <Link
                        href="/login"
                        onClick={() => setMobileMenuOpen(false)}
                        className="w-full h-11 rounded-full border border-black/[0.08] dark:border-white/[0.1] text-slate-700 dark:text-slate-200 font-medium text-xs flex items-center justify-center hover:bg-black/[0.03] dark:hover:bg-white/[0.05] active:scale-[0.98] transition-all min-h-[44px]"
                      >
                        Sign in
                      </Link>
                      <Link
                        href="/register"
                        onClick={() => setMobileMenuOpen(false)}
                        className="w-full h-11 rounded-full bg-brand-600 text-white font-semibold text-xs flex items-center justify-center hover:bg-brand-500 shadow-[0_2px_8px_rgba(37,99,235,0.25)] active:scale-[0.98] transition-all min-h-[44px]"
                      >
                        Register
                      </Link>
                    </div>
                  )}
                </div>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}