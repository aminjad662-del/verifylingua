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
    badge: "Cryptographic Seal",
  },
  {
    title: "USCIS RFE Defense Shield",
    description: "Guaranteed acceptance warranty with free instant legal response packets if queried.",
    href: "/defense/rfe",
    icon: ShieldAlert,
    badge: "RFE Warranty",
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
    let isMounted = true;
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isMounted) return;
        if (data && data.authenticated && data.user) {
          setCurrentUser(data.user);
          // Only fetch balance for verified authenticated accounts
          fetch("/api/billing/balance")
            .then((res) => (res.ok ? res.json() : null))
            .then((bData) => {
              if (!isMounted) return;
              if (bData && bData.authenticated && typeof bData.available === "number") {
                setCredits(bData.available);
              } else {
                setCredits(null);
              }
            })
            .catch(() => {
              if (isMounted) setCredits(null);
            });
        } else {
          setCurrentUser(null);
          setCredits(null);
        }
      })
      .catch(() => {
        if (isMounted) {
          setCurrentUser(null);
          setCredits(null);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    // Client-side cookie purge fallback
    document.cookie = "vl_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    document.cookie = "vl_role=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    document.cookie = "sso_google=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    document.cookie = "sso_apple=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    setCurrentUser(null);
    setCredits(null);
    window.location.href = "/";
  };

  return (
    <header 
      className={cn(
        "sticky top-0 z-50 w-full transition-[background-color,border-color,box-shadow,padding] duration-200 ease-out",
        scrolled 
          ? "bg-canvas/90 backdrop-blur-md border-b border-border shadow-[0_1px_3px_rgba(12,13,16,0.04)] py-2.5" 
          : "bg-canvas/80 backdrop-blur-md border-b border-border/80 py-3 sm:py-3.5"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12 sm:h-14">
          
          {/* Left: Brand Identity */}
          <div className="flex items-center gap-4 xl:gap-8">
            <Link href="/" className="flex items-center gap-2.5 group shrink-0 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-500 rounded-lg active:scale-[0.98] transition-transform">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-surface-raised border border-border text-brand-ink shadow-2xs transition-transform duration-150 group-hover:border-brand-500/50 active:scale-[0.98]">
                <ShieldCheck className="w-5 h-5 text-brand-ink" />
              </div>
              <div className="flex flex-col text-left">
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="text-lg sm:text-xl font-bold tracking-tight text-brand-ink font-sans">
                    Verify<span className="text-brand-500">Lingua</span>
                  </span>
                </div>
                <span className="text-[10px] font-sans uppercase tracking-wider text-text-muted font-medium mt-0.5">
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
                    "flex items-center gap-1 px-3.5 py-2 rounded-lg text-xs font-semibold tracking-tight transition-all duration-150 cursor-pointer min-h-[38px] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-500 active:scale-[0.98]",
                    activeDropdown === "solutions"
                      ? "text-brand-500 bg-brand-500/10"
                      : "text-text-muted hover:text-brand-ink hover:bg-canvas-subtle"
                  )}
                  aria-expanded={activeDropdown === "solutions"}
                >
                  <span>Features</span>
                  <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-200 text-text-muted", activeDropdown === "solutions" && "rotate-180 text-brand-500")} />
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
                      <div className="p-3 bg-surface-raised rounded-2xl border border-border shadow-xl ring-1 ring-border/50 overflow-hidden">
                        <div className="px-3 py-2 border-b border-border/80 flex items-center justify-between mb-1.5">
                          <span className="text-[11px] font-sans uppercase tracking-wider text-text-muted font-semibold">
                            Core Translation Technology
                          </span>
                          <span className="text-[10px] font-sans font-semibold text-court-emerald bg-court-emerald/10 border border-court-emerald/20 px-2 py-0.5 rounded-md">
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
                                className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-canvas-subtle transition-colors group text-left focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-500 active:scale-[0.98]"
                              >
                                <div className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center shrink-0 mt-0.5 text-brand-ink group-hover:bg-brand-500 group-hover:text-white transition-colors">
                                  <Icon className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <h4 className="text-xs font-semibold text-brand-ink group-hover:text-brand-500 transition-colors">
                                      {item.title}
                                    </h4>
                                    <span className="text-[10px] font-sans font-medium text-text-muted bg-surface-sunken px-1.5 py-0.5 rounded">
                                      {item.badge}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-text-muted leading-snug mt-0.5 line-clamp-1">
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
                    "flex items-center gap-1 px-3.5 py-2 rounded-lg text-xs font-semibold tracking-tight transition-all duration-150 cursor-pointer min-h-[38px] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-500 active:scale-[0.98]",
                    activeDropdown === "documents"
                      ? "text-brand-500 bg-brand-500/10"
                      : "text-text-muted hover:text-brand-ink hover:bg-canvas-subtle"
                  )}
                  aria-expanded={activeDropdown === "documents"}
                >
                  <span>Documents</span>
                  <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-200 text-text-muted", activeDropdown === "documents" && "rotate-180 text-brand-500")} />
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
                      <div className="p-3 bg-surface-raised rounded-2xl border border-border shadow-xl ring-1 ring-border/50 overflow-hidden">
                        <div className="px-3 py-2 border-b border-border/80 flex items-center justify-between mb-1.5">
                          <span className="text-[11px] font-sans uppercase tracking-wider text-text-muted font-semibold">
                            Supported Civil Formats
                          </span>
                          <Link 
                            href="/documents" 
                            onClick={() => setActiveDropdown(null)}
                            className="text-[10px] font-medium text-brand-500 hover:underline"
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
                                className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-canvas-subtle transition-colors group text-left focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-500 active:scale-[0.98]"
                              >
                                <div className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center shrink-0 mt-0.5 text-brand-ink group-hover:bg-brand-500 group-hover:text-white transition-colors">
                                  <Icon className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-xs font-semibold text-brand-ink group-hover:text-brand-500 transition-colors">
                                    {item.title}
                                  </h4>
                                  <p className="text-[11px] text-text-muted leading-snug mt-0.5 line-clamp-1">
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
                  "px-3 py-2 rounded-lg text-xs font-semibold tracking-tight transition-all duration-150 whitespace-nowrap min-h-[38px] flex items-center focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-500 active:scale-[0.98]",
                  pathname === "/how-it-works"
                    ? "text-brand-500 bg-brand-500/10"
                    : "text-text-muted hover:text-brand-ink hover:bg-canvas-subtle"
                )}
              >
                How It Works
              </Link>

              <Link
                href="/pricing"
                className={cn(
                  "px-3 py-2 rounded-lg text-xs font-semibold tracking-tight transition-all duration-150 whitespace-nowrap min-h-[38px] flex items-center focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-500 active:scale-[0.98]",
                  pathname === "/pricing"
                    ? "text-brand-500 bg-brand-500/10"
                    : "text-text-muted hover:text-brand-ink hover:bg-canvas-subtle"
                )}
              >
                Pricing
              </Link>

              <Link
                href="/counsel"
                className={cn(
                  "hidden xl:flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold tracking-tight transition-all duration-150 whitespace-nowrap min-h-[38px] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-500 active:scale-[0.98]",
                  pathname === "/counsel"
                    ? "text-brand-500 bg-brand-500/10"
                    : "text-text-muted hover:text-brand-ink hover:bg-canvas-subtle"
                )}
              >
                <span>CounselDesk™</span>
                <span className="text-[9px] font-sans px-1.5 py-0.5 rounded-md bg-brand-500/10 text-brand-500 font-bold uppercase tracking-wider">
                  Firms
                </span>
              </Link>

            </nav>
          </div>

          {/* Right: Actions & User State */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            
            {/* Authenticated vs Unauthenticated User State (Strict Separation) */}
            {currentUser ? (
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Credit Balance Badge (Only visible when authenticated) */}
                {credits !== null && (
                  <Link
                    href="/order/triage"
                    className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-amber-statutory/30 bg-amber-statutory/10 text-amber-statutory text-xs font-semibold hover:bg-amber-statutory/20 transition-all active:scale-[0.98] shrink-0"
                    title="Available translation credits"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-statutory fill-amber-statutory" />
                    <span><strong className="font-mono">{credits}</strong> Pages</span>
                  </Link>
                )}

                {/* Dashboard Link (Only visible when authenticated) */}
                <Link
                  href="/dashboard"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-text-muted hover:text-brand-ink hover:bg-canvas-subtle transition-all active:scale-[0.98] shrink-0"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-text-muted" />
                  <span>Dashboard</span>
                </Link>

                {/* Profile Pill & Sign Out Action */}
                <div className="flex items-center gap-2 pl-2 border-l border-border">
                  <div
                    className="w-7 h-7 rounded-full bg-surface-raised border border-border text-brand-ink font-bold text-xs flex items-center justify-center font-mono shrink-0"
                    title={currentUser.email}
                  >
                    {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : currentUser.email.charAt(0).toUpperCase()}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-text-muted hover:text-status-danger hover:bg-status-danger/10 transition-all active:scale-[0.98] shrink-0 cursor-pointer"
                    title="Sign out of account"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                {/* Quick Public Verification Shortcut */}
                <Link
                  href="/verify"
                  className="hidden xl:inline-flex items-center gap-1.5 text-xs font-medium text-text-muted hover:text-brand-ink px-2.5 py-1.5 transition-all active:scale-[0.98] shrink-0 rounded-lg hover:bg-canvas-subtle"
                >
                  <QrCode className="w-3.5 h-3.5 text-text-muted" />
                  <span>Verify Seal</span>
                </Link>

                <Link
                  href="/login"
                  className="hidden sm:inline-block px-3 py-1.5 rounded-lg text-xs font-semibold text-text-muted hover:text-brand-ink hover:bg-canvas-subtle transition-all active:scale-[0.98] shrink-0"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="hidden md:inline-block px-3 py-1.5 rounded-lg text-xs font-semibold text-brand-500 hover:text-brand-600 hover:bg-brand-500/10 transition-all active:scale-[0.98] shrink-0"
                >
                  Create Account
                </Link>
              </div>
            )}

            {/* Primary Action Button */}
            <Link
              href="/order/triage"
              className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs sm:text-sm font-semibold shadow-[0_2px_10px_rgba(255,85,0,0.22)] transition-all duration-150 ease-out active:scale-[0.98] group cursor-pointer whitespace-nowrap shrink-0 min-h-[40px] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
            >
              <span>Start translation</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-150 group-hover:translate-x-0.5 shrink-0" />
            </Link>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg border border-border text-brand-ink hover:bg-canvas-subtle focus:outline-hidden cursor-pointer shrink-0 min-w-[40px] min-h-[40px] flex items-center justify-center active:scale-[0.98] transition-transform"
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
            className="lg:hidden border-t border-border bg-surface-raised shadow-xl overflow-hidden px-4 py-5"
          >
            <div className="space-y-4 text-left">
              <div className="space-y-1">
                <div className="px-3 py-1 text-[11px] font-sans uppercase tracking-wider text-text-muted font-semibold">
                  Navigation
                </div>
                <Link
                  href="/order/triage"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-canvas-subtle text-sm font-semibold text-brand-ink active:scale-[0.98] transition-transform"
                >
                  <span>Studio & Translation Intake</span>
                  <ArrowRight className="w-4 h-4 text-text-muted" />
                </Link>
                <Link
                  href="/how-it-works"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-canvas-subtle text-sm font-medium text-text-muted hover:text-brand-ink active:scale-[0.98] transition-transform"
                >
                  <span>How It Works</span>
                  <ArrowRight className="w-4 h-4 text-text-muted" />
                </Link>
                <Link
                  href="/pricing"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-canvas-subtle text-sm font-medium text-text-muted hover:text-brand-ink active:scale-[0.98] transition-transform"
                >
                  <span>Transparent Pricing</span>
                  <ArrowRight className="w-4 h-4 text-text-muted" />
                </Link>
                <Link
                  href="/counsel"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-canvas-subtle text-sm font-medium text-text-muted hover:text-brand-ink active:scale-[0.98] transition-transform"
                >
                  <span>CounselDesk™ (Law Firms)</span>
                  <span className="text-[10px] font-sans px-2 py-0.5 rounded bg-brand-500/10 text-brand-500 font-bold">FIRMS</span>
                </Link>
                <Link
                  href="/verify"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-canvas-subtle text-sm font-medium text-text-muted hover:text-brand-ink active:scale-[0.98] transition-transform"
                >
                  <span>Public QR Verification Portal</span>
                  <QrCode className="w-4 h-4 text-text-muted" />
                </Link>
              </div>

              <div className="pt-4 border-t border-border flex flex-col gap-2">
                {currentUser ? (
                  <>
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full h-11 rounded-xl bg-surface border border-border text-brand-ink font-semibold flex items-center justify-center gap-2 text-sm hover:bg-canvas-subtle active:scale-[0.98] transition-all"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span>Go to Client Dashboard</span>
                    </Link>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleLogout();
                      }}
                      className="w-full h-10 rounded-xl text-xs font-semibold text-status-danger hover:bg-status-danger/10 active:scale-[0.98] transition-all cursor-pointer"
                    >
                      Sign out ({currentUser.name || currentUser.email})
                    </button>
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full h-10 rounded-xl border border-border text-brand-ink font-medium text-xs flex items-center justify-center hover:bg-canvas-subtle active:scale-[0.98] transition-all"
                    >
                      Sign in
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full h-10 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-xs flex items-center justify-center shadow-xs active:scale-[0.98] transition-all"
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

export default Header;
