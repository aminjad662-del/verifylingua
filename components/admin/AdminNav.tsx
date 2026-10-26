"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldCheck,
  LayoutDashboard,
  Layers,
  Users,
  Building,
  CheckCheck,
  Languages,
  BookOpen,
  CreditCard,
  Activity,
  FileSearch,
  Settings,
  ArrowUpRight,
  Sun,
  Moon,
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
    { href: "/admin", label: "Executive", icon: LayoutDashboard, exact: true },
    { href: "/admin/jobs", label: "Jobs Queue", icon: Layers },
    { href: "/admin/reviews", label: "QA & Reviews", icon: CheckCheck },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/organizations", label: "Organizations", icon: Building },
    { href: "/admin/languages", label: "Languages", icon: Languages },
    { href: "/admin/glossaries", label: "Glossaries", icon: BookOpen },
    { href: "/admin/billing", label: "Billing", icon: CreditCard },
    { href: "/admin/system-health", label: "Health", icon: Activity },
    { href: "/admin/audit-log", label: "Audit Log", icon: FileSearch },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-black/[0.06] dark:border-white/[0.08] bg-white/80 dark:bg-[#0C0D11]/85 backdrop-blur-2xl backdrop-saturate-150 px-6 py-2.5 shadow-[0_2px_8px_rgba(0,0,0,0.02),inset_0_1px_0_0_rgba(255,255,255,0.8)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.3),inset_0_1px_0_0_rgba(255,255,255,0.06)] font-sans">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand & Section Indicator */}
        <div className="flex items-center gap-6">
          <Link href="/admin" className="flex items-center gap-2.5 group">
            <div className="flex items-center justify-center w-8 h-8 rounded-[11px] bg-slate-900 text-white ring-1 ring-inset ring-white/20 shadow-[0_2px_6px_rgba(0,0,0,0.2)] transition-transform group-hover:scale-105 active:scale-95">
              <ShieldCheck className="w-4 h-4 text-brand-400" strokeWidth={2.2} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
                Verify<span className="text-brand-600 dark:text-brand-400">Lingua</span>
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-700 dark:text-brand-300 uppercase tracking-wider border border-brand-500/20">
                Admin Console
              </span>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden xl:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = link.exact
                ? pathname === link.href
                : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150 ${
                    isActive
                      ? "bg-brand-500/10 text-brand-700 dark:text-brand-300 font-semibold border border-brand-500/20"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-brand-600 dark:text-brand-400" : "text-slate-500 dark:text-slate-400"}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Tools */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/app"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-black/[0.08] dark:border-white/[0.1] bg-white/60 dark:bg-white/[0.05] hover:bg-black/[0.03] dark:hover:bg-white/[0.08] transition-colors text-slate-700 dark:text-slate-200"
          >
            <span>Client Workspace</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
          </Link>

          <button
            onClick={toggleDarkMode}
            className="w-8 h-8 rounded-full border border-black/[0.08] dark:border-white/[0.1] bg-white/60 dark:bg-white/[0.05] flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.08] transition-all cursor-pointer active:scale-95"
            title="Toggle theme"
            aria-label="Toggle light or dark theme"
          >
            {isDark ? <Sun className="w-3.5 h-3.5 text-amber-500" /> : <Moon className="w-3.5 h-3.5" />}
          </button>

          <div className="flex items-center gap-2 pl-2 border-l border-black/[0.08] dark:border-white/[0.08]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 hidden sm:inline">Admin Ops</span>
          </div>
        </div>
      </div>
    </header>
  );
}