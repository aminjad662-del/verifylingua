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
  Shield,
  Layers,
  LogOut,
  ChevronRight,
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

  return (
    <aside className="w-64 border-r border-border bg-surface flex flex-col justify-between shrink-0 h-screen sticky top-0 select-none">
      <div>
        {/* Workspace Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-border">
          <Link href="/app" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-brand-500 text-white flex items-center justify-center font-mono font-bold text-xs shadow-sm">
              VL
            </div>
            <span className="font-extrabold tracking-tight text-sm text-text font-mono">
              VERIFY<span className="text-brand-500">LINGUA</span>
            </span>
          </Link>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-brand-50 text-brand-600 border border-brand-200">
            Client
          </span>
        </div>

        {/* Primary CTA button */}
        <div className="p-4">
          <Link
            href="/app/new-translation"
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-all shadow-sm active:scale-[0.98]"
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
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-surface-raised text-brand-600 font-bold border border-border"
                    : "text-text-muted hover:text-text hover:bg-surface-raised"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? "text-brand-500" : "text-text-muted"}`} />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-brand-500" />}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Tenant / User Footer */}
      <div className="p-4 border-t border-border bg-surface-raised/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-600 font-mono font-bold text-xs flex items-center justify-center shrink-0">
              {userInitial}
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-text truncate">
                {user?.name || "Client Workspace"}
              </p>
              <p className="text-[11px] font-mono text-text-muted truncate">
                {user?.email || "enterprise-tenant"}
              </p>
            </div>
          </div>
          <Link
            href="/login"
            title="Sign out"
            className="p-1.5 rounded-lg text-text-muted hover:text-text hover:bg-surface transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
