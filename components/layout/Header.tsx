"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Menu, X, ArrowRight } from "lucide-react";
import { PRODUCT_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/pricing", label: "Pricing" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/documents", label: "Documents" },
  { href: "/languages", label: "Languages" },
  { href: "/help", label: "Help" },
];

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-surface-raised/85 backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto flex h-20 items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-brand-500 text-white shadow-sm transition-transform group-hover:scale-105">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-extrabold tracking-tight text-brand-ink">
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

        {/* CTA & Mobile Toggle */}
        <div className="flex items-center gap-3">
          <Button
            asChild
            className="hidden sm:inline-flex gap-2 rounded-xl h-11 px-5 text-sm font-bold shadow-sm"
          >
            <Link href="/order/triage">
              Start translation
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>

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

          <div className="pt-2">
            <Button asChild className="w-full h-12 rounded-xl text-base font-bold shadow-sm">
              <Link href="/order/triage" onClick={() => setMobileMenuOpen(false)}>
                Start translation
              </Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
