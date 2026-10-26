"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  Plus,
  FolderLock,
  BarChart3,
  CreditCard,
  Settings,
  HelpCircle,
  Layers,
  LogOut,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

export function ClientAppNav() {
  const pathname = usePathname();
  const [user, setUser] = React.useState<{ name: string | null; email: string; role?: string } | null>(null);

  React.useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.authenticated && data.user) {
          setUser(data.user);
        }
      })
      .catch(() => {});
  }, []);

  const navItems = [
    { href: "/app", label: "Overview", icon: Layers, exact: true },
    { href: "/app/new-translation", label: "New Translation", icon: Plus, highlight: true },
    { href: "/app/projects", label: "Projects", icon: FileText },
    { href: "/app/files", label: "Document Vault", icon: FolderLock },
    { href: "/app/usage", label: "Usage & Quota", icon: BarChart3 },
    { href: "/app/billing", label: "Billing & Plans", icon: CreditCard },
    { href: "/app/settings", label: "Settings", icon: Settings },
    { href: "/app/support", label: "Support", icon: HelpCircle },
  ];

  const userInitial = user?.name
    ? user.name.charAt(0).toUpperCase()
    : user?.email
    ? user.email.charAt(0).toUpperCase()
    : "U";

  const [signingOut, setSigningOut] = React.useState(false);

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
    window.location.href = "/login";
  };

  return (
    <aside className="w-64 border-r border-black/[0.06] dark:border-white/[0.08] bg-white/80 dark:bg-[#0C0D11]/90 backdrop-blur-2xl backdrop-saturate-150 flex flex-col justify-between shrink-0 h-screen sticky top-0 select-none font-sans">
      <div>
        {/* Workspace Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-black/[0.06] dark:border-white/[0.08]">
          <Link href="/app" className="flex items-center gap-2.5 group">
            <div className="w-7.5 h-7.5 rounded-[10px] bg-gradient-to-b from-brand-500 to-brand-600 text-white flex items-center justify-center shadow-[0_2px_8px_rgba(37,99,235,0.25),inset_0_1px_0_rgba(255,255,255,0.4)] ring-1 ring-inset ring-white/20 transition-transform group-hover:scale-105 active:scale-95">
              <ShieldCheck className="w-4 h-4 text-white" strokeWidth={2.2} />
            </div>
            <span className="font-bold tracking-tight text-sm text-slate-900 dark:text-white">
              Verify<span className="text-brand-600 dark:text-brand-400">Lingua</span>
            </span>
          </Link>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-brand-500/10 text-brand-700 dark:text-brand-300 border border-brand-500/20">
            Client
          </span>
        </div>

        {/* Primary CTA button */}
        <div className="p-4">
          <Link
            href="/app/new-translation"
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-full bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold tracking-tight shadow-[0_2px_10px_rgba(37,99,235,0.3),inset_0_1px_0_rgba(255,255,255,0.35)] active:scale-[0.98] transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Translation</span>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2 rounded-full text-[13px] font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-brand-500/10 text-brand-700 dark:text-brand-300 font-semibold border border-brand-500/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? "text-brand-600 dark:text-brand-400" : "text-slate-500 dark:text-slate-400"}`} />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Tenant / User Footer */}
      <div className="p-4 border-t border-black/[0.06] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.02]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-brand-500/10 text-brand-700 dark:text-brand-300 border border-brand-500/20 font-semibold text-xs flex items-center justify-center shrink-0">
              {userInitial}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                {user?.name || "Client Workspace"}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {user?.email || "enterprise-tenant"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            title="Sign out"
            aria-label="Sign out of client workspace"
            className="w-8 h-8 rounded-full border border-black/[0.08] dark:border-white/[0.1] bg-white/60 dark:bg-white/[0.05] flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer disabled:opacity-50 active:scale-95"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}