"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ShieldCheck, Lock, ArrowRight, ShieldAlert, ArrowLeft } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [authState, setAuthState] = useState<"loading" | "authenticated" | "unauthenticated">("loading");
  const [user, setUser] = useState<{ id: string; email: string; name?: string | null; role?: string } | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (!res.ok) {
          if (isMounted) setAuthState("unauthenticated");
          return;
        }
        const data = await res.json();
        if (isMounted) {
          if (data && data.authenticated && data.user) {
            setUser(data.user);
            setAuthState("authenticated");
          } else {
            setAuthState("unauthenticated");
          }
        }
      } catch {
        if (isMounted) setAuthState("unauthenticated");
      }
    }

    checkAuth();
    return () => {
      isMounted = false;
    };
  }, []);

  if (authState === "loading") {
    return (
      <div className="min-h-screen bg-canvas flex flex-col items-center justify-center p-6 text-slate-800">
        <div className="flex flex-col items-center gap-4 max-w-sm text-center">
          <div className="w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-600 animate-pulse">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <p className="text-xs font-mono uppercase tracking-widest text-text-muted">
            Verifying Session Authority...
          </p>
        </div>
      </div>
    );
  }

  if (authState === "unauthenticated") {
    return (
      <div className="min-h-screen bg-canvas text-slate-900 flex flex-col justify-between p-6 md:p-12">
        <header className="max-w-5xl w-full mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="font-bold tracking-tight text-lg text-brand-ink">VerifyLingua</span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-medium text-text-muted hover:text-brand-ink transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Public Site</span>
          </Link>
        </header>

        <main className="max-w-md w-full mx-auto my-auto py-12">
          <div className="p-8 rounded-2xl bg-surface-raised border border-border shadow-sm text-center space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center mx-auto">
              <Lock className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                Institutional Access Gate
              </span>
              <h1 className="text-2xl font-bold tracking-tight text-brand-ink pt-2">
                Authentication Required
              </h1>
              <p className="text-sm text-text-muted leading-relaxed">
                The VerifyLingua workspace contains protected legal records and sworn affidavits subject to 8 CFR § 103.2 confidentiality protocols.
              </p>
            </div>

            <div className="pt-2 space-y-3">
              <Link
                href="/login?callbackUrl=/dashboard"
                className="w-full h-11 px-5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <span>Sign In to Access Matters</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/register"
                className="w-full h-11 px-5 rounded-xl border border-border bg-surface hover:bg-surface-raised text-text text-sm font-semibold flex items-center justify-center transition-colors"
              >
                <span>Create Institutional Account</span>
              </Link>
            </div>

            <div className="pt-4 border-t border-border flex items-center justify-center gap-2 text-[11px] text-text-subtle font-mono">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
              <span>Zero-knowledge session isolation active</span>
            </div>
          </div>
        </main>

        <footer className="max-w-5xl w-full mx-auto text-center text-xs text-text-subtle">
          VerifyLingua Legal Technologies · Cryptographic Document Vault
        </footer>
      </div>
    );
  }

  return <>{children}</>;
}
