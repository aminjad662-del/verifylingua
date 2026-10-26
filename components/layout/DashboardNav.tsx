"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldCheck,
  LayoutDashboard,
  PlusCircle,
  FolderLock,
  CreditCard,
  Bell,
  Settings,
  ArrowUpRight,
  LogOut,
  Sun,
  Moon,
} from "lucide-react";

export function DashboardNav() {
  const pathname = usePathname();
  const [isDark, setIsDark] = React.useState(false);
  const [user, setUser] = React.useState<{ name: string | null; email: string; role?: string } | null>(null);
  const [signingOut, setSigningOut] = React.useState(false);

  React.useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));

    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.authenticated && data.user) {
          setUser(data.user);
        }
      })
      .catch(() => {});
  }, []);

  const handleSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    document.cookie = "vl_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "vl_role=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "sso_google=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "sso_apple=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT";
    window.location.href = "/";
  };

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
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/request", label: "New Request", icon: PlusCircle },
    { href: "/dashboard/documents", label: "Document Vault", icon: FolderLock },
    { href: "/dashboard/billing", label: "Billing & Quotes", icon: CreditCard },
    { href: "/dashboard/notifications", label: "Alerts", icon: Bell },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ];

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : user?.email ? user.email.charAt(0).toUpperCase() : "A";

  return (
    <header className="sticky top-0 z-40 border-b border-black/[0.06] dark:border-white/[0.08] bg-white/80 dark:bg-[#0C0D11]/85 backdrop-blur-2xl backdrop-saturate-150 px-6 py-3 shadow-[0_2px_8px_rgba(0,0,0,0.02),inset_0_1px_0_0_rgba(255,255,255,0.8)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.3),inset_0_1px_0_0_rgba(255,255,255,0.06)] font-sans">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo & Apple Squircle */}
        <div className="flex items-center gap-6 lg:gap-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex items-center justify-center w-8.5 h-8.5 rounded-[12px] bg-gradient-to-b from-brand-500 to-brand-600 text-white shadow-[0_2px_8px_rgba(37,99,235,0.25),inset_0_1px_0_rgba(255,255,255,0.4)] ring-1 ring-inset ring-white/20 transition-transform duration-150 group-hover:scale-105 active:scale-95">
              <ShieldCheck className="w-4.5 h-4.5 text-white" strokeWidth={2.2} />
            </div>
            <span className="text-[17px] font-bold tracking-tight text-slate-900 dark:text-white">
              Verify<span className="text-brand-600 dark:text-brand-400">Lingua</span>
            </span>
          </Link>

          {/* Navigation Links - Apple Style Frosted Pills */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-all duration-150 ${
                    isActive
                      ? "bg-brand-500/10 text-brand-700 dark:text-brand-300 font-semibold border border-brand-500/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-brand-600 dark:text-brand-400" : "text-slate-500 dark:text-slate-400"}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center gap-2.5">
          {user?.role === "ADMIN" && (
            <Link
              href="/admin"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-black/[0.08] dark:border-white/[0.1] bg-white/60 dark:bg-white/[0.05] hover:bg-black/[0.03] dark:hover:bg-white/[0.08] transition-colors text-slate-700 dark:text-slate-200"
            >
              <span>Admin Portal</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>
          )}

          <button
            onClick={toggleDarkMode}
            className="w-8.5 h-8.5 rounded-full border border-black/[0.08] dark:border-white/[0.1] bg-white/60 dark:bg-white/[0.05] flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.08] transition-all cursor-pointer active:scale-95"
            title="Toggle theme"
            aria-label="Toggle light or dark theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4" />}
          </button>

          <div className="flex items-center gap-2 pl-2 border-l border-black/[0.08] dark:border-white/[0.08]">
            <div
              className="w-8 h-8 rounded-full bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-xs font-semibold text-brand-700 dark:text-brand-300"
              title={user ? (user.name || user.email) : "Client Account"}
            >
              {userInitial}
            </div>
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              title="Sign out"
              aria-label="Sign out"
              className="w-8.5 h-8.5 rounded-full border border-black/[0.08] dark:border-white/[0.1] bg-white/60 dark:bg-white/[0.05] flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer disabled:opacity-50 active:scale-95"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}