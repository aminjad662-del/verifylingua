"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { ShieldCheck, Menu, X, ArrowRight, Globe2 } from "lucide-react";
import { PRODUCT_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/pricing", label: "Pricing" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/documents", label: "Documents" },
  { href: "/languages", label: "Languages" },
  { href: "/help", label: "Help" },
];

const LOCALES = [
  { code: "en", label: "EN • English" },
  { code: "es", label: "ES • Español" },
  { code: "ar", label: "AR • العربية" },
  { code: "zh", label: "ZH • 简体中文" },
  { code: "fr", label: "FR • Français" },
  { code: "pt", label: "PT • Português" },
];

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [locale, setLocale] = React.useState("en");
  const [currentUser, setCurrentUser] = React.useState<{ name: string | null; email: string } | null>(null);

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
  }, [pathname]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setCurrentUser(null);
    window.location.href = "/";
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-surface-raised/90 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-brand-500 text-white shadow-sm transition-transform group-hover:scale-105">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-extrabold tracking-tight text-brand-ink font-display">
              Verify<span className="text-brand-500">Lingua</span>
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-text-muted">
              Certified Translations
            </span>
          </div>
        </Link>

        {/* Desktop Navigation - Max 5 Links (§5.1) */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-semibold transition-colors duration-150 hover:text-brand-500",
                  isActive ? "text-brand-500 font-bold" : "text-text-muted"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* CTA & Language Selector */}
        <div className="flex items-center gap-3">
          {/* Quick Locale Selector */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-border bg-surface text-xs font-semibold text-brand-ink">
            <Globe2 className="w-3.5 h-3.5 text-brand-500" />
            <select
              value={locale}
              onChange={(e) => setLocale(e.target.value)}
              className="bg-transparent text-xs font-semibold text-brand-ink focus:outline-none cursor-pointer"
              aria-label="Select interface language"
            >
              {LOCALES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>

          {/* Auth State Links */}
          {currentUser ? (
            <div className="hidden sm:flex items-center gap-2">
              <Button asChild variant="outline" className="rounded-xl h-10 px-3.5 text-xs font-bold border-border">
                <Link href="/dashboard">
                  Dashboard
                </Link>
              </Button>
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="rounded-xl h-10 px-3 text-xs font-semibold text-text-muted hover:text-brand-ink"
              >
                Sign out
              </Button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Button asChild variant="ghost" className="rounded-xl h-10 px-3.5 text-xs font-bold text-brand-ink hover:text-brand-500">
                <Link href="/login">Sign in</Link>
              </Button>
            </div>
          )}

          <MagneticButton>
            <Button
              asChild
              className="hidden sm:inline-flex gap-2 rounded-xl h-11 px-5 text-sm font-bold shadow-sm active:scale-[0.97] transition-all duration-200"
            >
              <Link href="/order/triage">
                Start translation
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </MagneticButton>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl border border-border text-brand-ink hover:bg-surface focus:outline-none focus:ring-2 focus:ring-brand-500"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-surface-raised px-6 py-6 space-y-4 animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-3">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "text-base font-semibold py-2 px-3 rounded-lg transition-colors",
                    isActive ? "bg-brand-50 text-brand-500 font-bold" : "text-brand-ink hover:bg-surface"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="pt-4 border-t border-border flex flex-col gap-3">
            {currentUser ? (
              <div className="flex flex-col gap-2">
                <Button asChild variant="outline" className="w-full h-11 rounded-xl font-bold">
                  <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                    Go to Dashboard
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full h-11 rounded-xl text-text-muted"
                >
                  Sign out ({currentUser.name || currentUser.email})
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Button asChild variant="outline" className="w-full h-11 rounded-xl font-bold">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    Sign in
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full h-11 rounded-xl font-bold border-brand-500 text-brand-500 bg-brand-50/40">
                  <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                    Register
                  </Link>
                </Button>
              </div>
            )}

            <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-surface text-xs font-semibold">
              <Globe2 className="w-4 h-4 text-brand-500" />
              <select
                value={locale}
                onChange={(e) => setLocale(e.target.value)}
                className="bg-transparent text-xs font-semibold text-brand-ink w-full focus:outline-none"
              >
                {LOCALES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>

            <Button asChild className="w-full gap-2 rounded-xl h-12 text-sm font-bold">
              <Link href="/order/triage" onClick={() => setMobileMenuOpen(false)}>
                Start translation
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
