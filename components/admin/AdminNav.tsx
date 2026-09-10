"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldCheck,
  LayoutDashboard,
  FileCheck2,
  Calculator,
  Users2,
  Building2,
  CheckCheck,
  CreditCard,
  MessageSquare,
  BarChart3,
  Settings,
  ArrowUpRight,
  Sun,
  Moon,
  LogOut,
} from "lucide-react";

export function AdminNav() {
  const pathname = usePathname();
  const [isDark, setIsDark] = React.useState(false);

  React.useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggleDarkMode = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const navLinks = [
    { href: "/admin", label: "Executive", icon: LayoutDashboard },
    { href: "/admin/orders", label: "Orders", icon: FileCheck2 },
    { href: "/admin/quotes", label: "Quotes & Pricing", icon: Calculator },
    { href: "/admin/translators", label: "Translators", icon: Users2 },
    { href: "/admin/clients", label: "Clients & Orgs", icon: Building2 },
    { href: "/admin/qa", label: "QA Gates", icon: CheckCheck },
    { href: "/admin/finance", label: "Finance", icon: CreditCard },
    { href: "/admin/support", label: "Support", icon: MessageSquare },
    { href: "/admin/reports", label: "Reports", icon: BarChart3 },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface-raised/95 backdrop-blur-md px-6 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand & Section Indicator */}
        <div className="flex items-center gap-6">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-brand-ink text-white">
              <ShieldCheck className="w-4 h-4 text-brand-400" />
            </div>
            <div>
              <span className="text-sm font-black tracking-tight text-brand-ink uppercase font-mono">
                Verify<span className="text-brand-500">Lingua</span>
              </span>
              <span className="ml-2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-brand-50 text-brand-500 font-bold border border-brand-100">
                ADMIN
              </span>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.href !== "/admin" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors ${
                    isActive
                      ? "bg-brand-50 text-brand-500 font-bold border border-brand-100"
                      : "text-text-muted hover:text-brand-ink hover:bg-surface"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Tools */}
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-medium border border-border bg-surface hover:bg-surface-raised transition-colors text-text"
          >
            <span>Client View</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-text-muted" />
          </Link>

          <button
            onClick={toggleDarkMode}
            className="w-8 h-8 rounded-lg border border-border bg-surface flex items-center justify-center text-text-muted hover:text-brand-ink hover:bg-surface-raised transition-colors"
            title="Toggle theme"
          >
            {isDark ? <Sun className="w-3.5 h-3.5 text-status-warning" /> : <Moon className="w-3.5 h-3.5" />}
          </button>

          <div className="flex items-center gap-2 pl-2 border-l border-border">
            <span className="w-2 h-2 rounded-full bg-status-success animate-pulse" />
            <span className="text-[11px] font-mono text-text-muted hidden sm:inline">Admin Ops</span>
          </div>
        </div>
      </div>
    </header>
  );
}
