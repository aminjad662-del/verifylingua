"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, FileText, FolderLock, Settings, Plus, LogOut, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function DashboardNav() {
  const pathname = usePathname();
  const [isDark, setIsDark] = React.useState(false);
  const [user, setUser] = React.useState<{ name: string | null; email: string } | null>(null);

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

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
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
    { href: "/dashboard", label: "My Orders", icon: FileText },
    { href: "/dashboard/documents", label: "Document Vault", icon: FolderLock },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ];

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : user?.email ? user.email.charAt(0).toUpperCase() : "U";

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface-raised/95 backdrop-blur-md px-6 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo & Section */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-brand-500 text-white">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="text-lg font-extrabold tracking-tight text-brand-ink">
              Verify<span className="text-brand-500">Lingua</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
                    isActive
                      ? "bg-brand-50 text-brand-500 font-extrabold"
                      : "text-text-muted hover:text-brand-ink hover:bg-surface"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleDarkMode}
            className="w-9 h-9 rounded-xl border border-border bg-surface flex items-center justify-center text-text-muted hover:text-brand-ink hover:bg-surface-raised transition-colors"
            title="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-status-warning" /> : <Moon className="w-4 h-4" />}
          </button>

          <Button asChild size="sm" className="gap-1.5 rounded-xl font-bold">
            <Link href="/order/triage">
              <Plus className="w-4 h-4" />
              <span>Start Translation</span>
            </Link>
          </Button>

          <div className="flex items-center gap-2 pl-2 border-l border-border">
            <div
              className="w-8 h-8 rounded-full bg-brand-50 border border-brand-100 flex items-center justify-center text-xs font-bold font-mono text-brand-500"
              title={user ? (user.name || user.email) : "User profile"}
            >
              {userInitial}
            </div>
            <button
              onClick={handleLogout}
              className="text-text-muted hover:text-brand-ink p-1 rounded-lg transition-colors"
              title="Sign out"
              aria-label="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
