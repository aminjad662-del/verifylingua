"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Menu, X, ArrowRight, Globe2, LayoutDashboard, Zap, Sparkles } from "lucide-react";
import { PRODUCT_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

const PRIMARY_NAV_LINKS = [
  { href: "/translate", label: "Studio" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/counsel", label: "CounselDesk™" },
];

const NAV_LINKS = [
  { href: "/translate", label: "Studio" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/pricing", label: "Pricing" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/counsel", label: "CounselDesk™ (Law Firms)" },
  { href: "/documents", label: "Documents" },
  { href: "/languages", label: "Languages" },
  { href: "/help", label: "Help" },
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
  const [locale, setLocale] = React.useState("en");
  const [currentUser, setCurrentUser] = React.useState<{ name: string | null; email: string } | null>(null);
  const [credits, setCredits] = React.useState<number | null>(null);

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
      .catch(() => {
        setCurrentUser(null);
      });

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
    await fetch("/api/auth/logout", { method: "POST" });
    setCurrentUser(null);
    window.location.href = "/";
  };

  return (
    <header className="sticky top-0 z-50 w-full pt-3 sm:pt-4 pb-2 px-3 sm:px-6 pointer-events-none transition-all">
      <div className="max-w-6xl mx-auto flex h-14 sm:h-15 items-center justify-between px-3.5 sm:px-6 rounded-full border border-white/[0.08] bg-obsidian-900/80 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_0_rgba(255,255,255,0.08)] pointer-events-auto transition-all">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="flex items-center justify-center w-8 sm:w-8.5 h-8 sm:h-8.5 rounded-full bg-obsidian-800 text-white border border-white/[0.08] shadow-xs transition-transform group-hover:scale-105">
            <ShieldCheck className="w-4 sm:w-4.5 h-4 sm:h-4.5 text-amber-statutory" />
          </div>
          <div className="flex flex-col">
            <span className="text-base sm:text-lg font-bold tracking-tight text-white font-sans leading-none">
              Verify<span className="text-amber-statutory">Lingua</span>
            </span>
            <span className="hidden sm:inline-block text-[9px] uppercase font-mono font-semibold tracking-[0.2em] text-neutral-400 mt-0.5">
              Certified Legal
            </span>
          </div>
        </Link>

        {/* Center Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {PRIMARY_NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-150",
                  isActive
                    ? "bg-white/10 text-white font-semibold border border-white/10 shadow-xs"
                    : "text-neutral-300 hover:text-white hover:bg-white/[0.06]"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Action Cluster */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Credit Balance Badge */}
          {credits !== null && (
            <Link
              href="/translate"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-amber-500/20 bg-amber-500/[0.08] text-amber-900 dark:text-amber-300 text-xs font-mono font-medium hover:bg-amber-500/15 transition-colors"
              title="Available certified page translation credits"
            >
              <Zap className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
              <span>
                <strong>{credits}</strong> Pages
              </span>
            </Link>
          )}

          {/* Quick Locale Picker */}
          <div className="hidden xl:flex items-center gap-1 px-2.5 py-1 rounded-full border border-black/[0.07] bg-black/[0.02] text-xs font-medium text-neutral-700 dark:text-neutral-300">
            <Globe2 className="w-3.5 h-3.5 text-neutral-500" />
            <select
              value={locale}
              onChange={(e) => setLocale(e.target.value)}
              className="bg-transparent text-xs font-medium text-neutral-700 dark:text-neutral-300 focus:outline-none cursor-pointer"
              aria-label="Select interface language"
            >
              {LOCALES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>

          {/* Dashboard Quick Access */}
          <Link
            href="/dashboard"
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border border-black/[0.07] hover:border-black/[0.15] bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 hover:text-neutral-950 transition-all shadow-2xs"
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-neutral-500" />
            <span>Dashboard</span>
          </Link>

          {/* Auth State Button */}
          {currentUser ? (
            <button
              onClick={handleLogout}
              className="hidden sm:inline-block px-3 py-1.5 rounded-full text-xs font-medium text-neutral-500 hover:text-neutral-950 transition-colors"
            >
              Sign out
            </button>
          ) : (
            <Link
              href="/login"
              className="hidden sm:inline-block px-3 py-1.5 rounded-full text-xs font-medium text-neutral-600 hover:text-neutral-950 transition-colors"
            >
              Sign in
            </Link>
          )}

          {/* Primary Nested CTA Pill (Button-in-Button) */}
          <Link
            href="/order/triage"
            className="inline-flex items-center gap-2 pl-3.5 sm:pl-4 pr-1.5 py-1 rounded-full bg-white hover:bg-neutral-100 text-obsidian-950 text-xs sm:text-sm font-semibold shadow-xs active:scale-[0.98] transition-all group"
          >
            <span>Start translation</span>
            <div className="w-6 sm:w-6.5 h-6 sm:h-6.5 rounded-full bg-black/10 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
              <ArrowRight className="w-3.5 h-3.5 text-obsidian-950" />
            </div>
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden h-8 w-8 flex items-center justify-center rounded-full border border-white/10 text-neutral-300 hover:text-white hover:bg-white/5 focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer (Floating Card Architecture) */}
      {mobileMenuOpen && (
        <div className="max-w-6xl mx-auto mt-2 pointer-events-auto">
          <div className="rounded-3xl border border-white/10 bg-obsidian-900/95 backdrop-blur-2xl p-5 shadow-2xl space-y-4 animate-in fade-in-50 slide-in-from-top-2 duration-200 text-left">
            <nav className="flex flex-col space-y-1">
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "text-sm font-medium py-2 px-3 rounded-xl transition-colors",
                      isActive
                        ? "bg-white/10 text-white font-semibold"
                        : "text-neutral-300 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <div className="pt-3 border-t border-white/10 flex flex-col gap-2.5">
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full h-10 rounded-xl font-semibold bg-white text-obsidian-950 flex items-center justify-center gap-2 text-xs shadow-xs"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Go to Client Dashboard</span>
              </Link>

              {currentUser ? (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full h-9 rounded-xl text-xs font-medium text-neutral-400 hover:text-white hover:bg-white/5"
                >
                  Sign out ({currentUser.name || currentUser.email})
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full h-9 rounded-xl border border-white/10 text-neutral-300 text-xs font-medium flex items-center justify-center hover:bg-white/5 hover:text-white"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full h-9 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs font-semibold flex items-center justify-center"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
