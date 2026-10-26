"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  ShieldCheck, 
  Menu, 
  X, 
  ArrowRight, 
  Globe2, 
  LayoutDashboard, 
  Zap, 
  ChevronDown,
  FileCheck2,
  Scale,
  Building2,
  FileText,
  GraduationCap,
  FileCheck,
  Sparkles,
  QrCode,
  ShieldAlert
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

const LOCALES = [
  { code: "en", label: "EN • English" },
  { code: "es", label: "ES • Español" },
  { code: "fr", label: "FR • Français" },
  { code: "de", label: "DE • Deutsch" },
  { code: "ar", label: "AR • العربية" },
  { code: "zh", label: "ZH • 简体中文" },
];

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [activeDropdown, setActiveDropdown] = React.useState<"solutions" | "documents" | null>(null);
  const [scrolled, setScrolled] = React.useState(false);
  const [locale, setLocale] = React.useState("en");
  const [currentUser, setCurrentUser] = React.useState<UserProfile | null>(null);
  const [credits, setCredits] = React.useState<number | null>(null);

  const dropdownTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = (type: "solutions" | "documents") => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    setActiveDropdown(type);
  };

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  };

  // Scroll detection for dynamic border and frosted glass depth
  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
      className={cn(
        "sticky top-0 z-50 w-full transition-[background-color,border-color,box-shadow,padding] duration-200 ease-out",
        scrolled 
          ? "bg-white/85 backdrop-blur-xl border-b border-slate-900/[0.08] shadow-[0_2px_12px_rgba(0,0,0,0.04)] py-2 sm:py-2.5" 
          : "bg-white/60 backdrop-blur-md border-b border-slate-900/[0.04] py-3 sm:py-4"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12 sm:h-14">
          
          {/* Left: Brand Identity */}
          <div className="flex items-center gap-4 xl:gap-8">
            <Link href="/" className="flex items-center gap-2.5 group shrink-0 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-500 rounded-lg">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-brand-600 text-white shadow-[0_4px_12px_rgba(37,99,235,0.25)] transition-transform duration-200 group-hover:scale-105 active:scale-95">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col text-left">
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 font-sans">
                    Verify<span className="text-brand-600">Lingua</span>
                  </span>
                </div>
                <span className="text-[10px] font-sans uppercase tracking-wider text-slate-500 font-medium mt-0.5">
                  USCIS CERTIFIED
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links with Flyouts */}
            <nav className="hidden lg:flex items-center gap-1">
              
              {/* 1. Solutions Dropdown */}
              <div 
                className="relative"
                onMouseEnter={() => handleMouseEnter("solutions")}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  className={cn(
                    "flex items-center gap-1 px-3.5 py-2 rounded-lg text-xs font-semibold tracking-tight transition-colors cursor-pointer min-h-[38px] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-500",
                    activeDropdown === "solutions"
                      ? "text-brand-600 bg-brand-50"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                  )}
                  aria-expanded={activeDropdown === "solutions"}
                >
                  <span>Features</span>
                  <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-200 text-slate-600", activeDropdown === "solutions" && "rotate-180 text-brand-600")} />
                </button>

                <AnimatePresence>
                  {activeDropdown === "solutions" && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.98 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="absolute left-0 top-full pt-2 w-[440px] pointer-events-auto"
                    >
                      <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-xl ring-1 ring-black/5 overflow-hidden">
                        <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between mb-1.5">
                          <span className="text-[11px] font-sans uppercase tracking-wider text-slate-500 font-semibold">
                            Core Translation Technology
                          </span>
                          <span className="text-[10px] font-sans font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/50 px-2 py-0.5 rounded-md">
                            USCIS 8 CFR § 103.2
                          </span>
                        </div>

                        <div className="space-y-1">
                          {SOLUTIONS_ITEMS.map((item) => {
                            const Icon = item.icon;
                            return (
                              <Link
                                key={item.title}
                                href={item.href}
                                onClick={() => setActiveDropdown(null)}
                                className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors group text-left focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-500"
                              >
                                <div className="w-8 h-8 rounded-lg bg-brand-50 border border-brand-100 flex items-center justify-center shrink-0 mt-0.5 text-brand-600 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                                  <Icon className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <h4 className="text-xs font-semibold text-slate-900 group-hover:text-brand-600 transition-colors">
                                      {item.title}
                                    </h4>
                                    <span className="text-[10px] font-sans font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                      {item.badge}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-slate-500 leading-snug mt-0.5 line-clamp-1">
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

              {/* 2. Documents Dropdown */}
              <div 
                className="relative"
                onMouseEnter={() => handleMouseEnter("documents")}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  className={cn(
                    "flex items-center gap-1 px-3.5 py-2 rounded-lg text-xs font-semibold tracking-tight transition-colors cursor-pointer min-h-[38px] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-500",
                    activeDropdown === "documents"
                      ? "text-brand-600 bg-brand-50"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                  )}
                  aria-expanded={activeDropdown === "documents"}
                >
                  <span>Documents</span>
                  <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-200 text-slate-600", activeDropdown === "documents" && "rotate-180 text-brand-600")} />
                </button>

                <AnimatePresence>
                  {activeDropdown === "documents" && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.98 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="absolute left-0 top-full pt-2 w-[380px] pointer-events-auto"
                    >
                      <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-xl ring-1 ring-black/5 overflow-hidden">
                        <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between mb-1.5">
                          <span className="text-[11px] font-sans uppercase tracking-wider text-slate-500 font-semibold">
                            Supported Civil Formats
                          </span>
                          <Link 
                            href="/documents" 
                            onClick={() => setActiveDropdown(null)}
                            className="text-[10px] font-medium text-brand-600 hover:underline"
                          >
                            View all 25+ →
                          </Link>
                        </div>

                        <div className="space-y-1">
                          {DOCUMENT_ITEMS.map((item) => {
                            const Icon = item.icon;
                            return (
                              <Link
                                key={item.title}
                                href={item.href}
                                onClick={() => setActiveDropdown(null)}
                                className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors group text-left focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-500"
                              >
                                <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 mt-0.5 text-slate-700 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                                  <Icon className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-xs font-semibold text-slate-900 group-hover:text-brand-600 transition-colors">
                                    {item.title}
                                  </h4>
                                  <p className="text-[11px] text-slate-500 leading-snug mt-0.5 line-clamp-1">
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

              {/* 3. Direct Links */}
              <Link
                href="/how-it-works"
                className={cn(
                  "px-3 py-2 rounded-lg text-xs font-semibold tracking-tight transition-colors whitespace-nowrap min-h-[38px] flex items-center focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-500",
                  pathname === "/how-it-works"
                    ? "text-brand-600 bg-brand-50"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                )}
              >
                How It Works
              </Link>

              <Link
                href="/pricing"
                className={cn(
                  "px-3 py-2 rounded-lg text-xs font-semibold tracking-tight transition-colors whitespace-nowrap min-h-[38px] flex items-center focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-500",
                  pathname === "/pricing"
                    ? "text-brand-600 bg-brand-50"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                )}
              >
                Pricing
              </Link>

              <Link
                href="/counsel"
                className={cn(
                  "hidden xl:flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold tracking-tight transition-colors whitespace-nowrap min-h-[38px] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-500",
                  pathname === "/counsel"
                    ? "text-brand-600 bg-brand-50"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                )}
              >
                <span>CounselDesk™</span>
                <span className="text-[9px] font-sans px-1.5 py-0.5 rounded-md bg-brand-100 text-brand-700 font-bold uppercase tracking-wider">
                  Firms
                </span>
              </Link>

            </nav>
          </div>

          {/* Right: Actions & User State */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            
            {/* Credit Balance Badge (If authenticated) */}
            {credits !== null && (
              <Link
                href="/translate"
                className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-amber-500/30 bg-amber-50 text-amber-900 text-xs font-medium hover:bg-amber-100 transition-colors shrink-0"
                title="Available translation credits"
              >
                <Zap className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                <span><strong className="font-mono">{credits}</strong> Pages</span>
              </Link>
            )}

            {/* Quick Public Verification Shortcut */}
            <Link
              href="/verify"
              className="hidden 2xl:inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 px-2.5 py-1.5 transition-colors shrink-0 rounded-lg hover:bg-slate-100/70"
            >
              <QrCode className="w-3.5 h-3.5 text-slate-600" />
              <span>Verify Seal</span>
            </Link>

            {/* Dashboard Link */}
            <Link
              href="/dashboard"
              className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100/70 transition-colors shrink-0"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-slate-600" />
              <span>Dashboard</span>
            </Link>

            {/* Auth Link */}
            {currentUser ? (
              <button
                onClick={handleLogout}
                className="hidden sm:inline-block px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors shrink-0 cursor-pointer"
              >
                Sign out
              </button>
            ) : (
              <Link
                href="/login"
                className="hidden sm:inline-block px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors shrink-0"
              >
                Sign in
              </Link>
            )}

            {/* Primary Royal Blue CTA Button (Matching Screenshot) */}
            <Link
              href="/translate"
              className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs sm:text-sm font-semibold shadow-[0_2px_12px_rgba(37,99,235,0.3)] transition-transform duration-150 ease-out active:scale-[0.97] group cursor-pointer whitespace-nowrap shrink-0 min-h-[40px] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
            >
              <span>Start translation</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-150 group-hover:translate-x-0.5 shrink-0" />
            </Link>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 focus:outline-hidden cursor-pointer shrink-0 min-w-[40px] min-h-[40px] flex items-center justify-center active:scale-[0.97] transition-transform"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer (Clean Full Drawer) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="lg:hidden border-t border-slate-200 bg-white shadow-xl overflow-hidden px-4 py-5"
          >
            <div className="space-y-4 text-left">
              <div className="space-y-1">
                <div className="px-3 py-1 text-[11px] font-sans uppercase tracking-wider text-slate-500 font-semibold">
                  Navigation
                </div>
                <Link
                  href="/translate"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 text-sm font-semibold text-slate-900 active:scale-[0.98] transition-transform"
                >
                  <span>Studio & Translation Intake</span>
                  <ArrowRight className="w-4 h-4 text-slate-600" />
                </Link>
                <Link
                  href="/how-it-works"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 text-sm font-medium text-slate-700 active:scale-[0.98] transition-transform"
                >
                  <span>How It Works</span>
                  <ArrowRight className="w-4 h-4 text-slate-600" />
                </Link>
                <Link
                  href="/pricing"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 text-sm font-medium text-slate-700 active:scale-[0.98] transition-transform"
                >
                  <span>Transparent Pricing</span>
                  <ArrowRight className="w-4 h-4 text-slate-600" />
                </Link>
                <Link
                  href="/counsel"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 text-sm font-medium text-slate-700 active:scale-[0.98] transition-transform"
                >
                  <span>CounselDesk™ (Law Firms)</span>
                  <span className="text-[10px] font-sans px-2 py-0.5 rounded bg-brand-50 text-brand-700 font-bold">FIRMS</span>
                </Link>
                <Link
                  href="/verify"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 text-sm font-medium text-slate-700 active:scale-[0.98] transition-transform"
                >
                  <span>Public QR Verification Portal</span>
                  <QrCode className="w-4 h-4 text-slate-600" />
                </Link>
              </div>

              <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full h-11 rounded-xl bg-slate-100 text-slate-900 font-semibold flex items-center justify-center gap-2 text-sm hover:bg-slate-200 active:scale-[0.98] transition-all"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Go to Client Dashboard</span>
                </Link>

                {currentUser ? (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full h-10 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 active:scale-[0.98] transition-all cursor-pointer"
                  >
                    Sign out ({currentUser.name || currentUser.email})
                  </button>
                ) : (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full h-10 rounded-xl border border-slate-200 text-slate-700 font-medium text-xs flex items-center justify-center hover:bg-slate-50 active:scale-[0.98] transition-all"
                    >
                      Sign in
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full h-10 rounded-xl bg-brand-600 text-white font-semibold text-xs flex items-center justify-center hover:bg-brand-500 shadow-sm active:scale-[0.98] transition-all"
                    >
                      Register
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
