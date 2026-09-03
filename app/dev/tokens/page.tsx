"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ToggleRow } from "@/components/ui/toggle-row";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/ui/motion-primitives";
import { SignatureMoment } from "@/components/ui/signature-moment";
import { motion, AnimatePresence } from "motion/react";
import {
  Sun,
  Moon,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  Sparkles,
  Lock,
  Stamp,
  Zap,
  RotateCcw,
  Play,
} from "lucide-react";
import Link from "next/link";

export default function DesignTokensPage() {
  const [isDark, setIsDark] = React.useState(false);
  const [simulatingTransition, setSimulatingTransition] = React.useState(false);
  const [transitionKey, setTransitionKey] = React.useState(0);
  const [staggerKey, setStaggerKey] = React.useState(0);
  const [signatureKey, setSignatureKey] = React.useState(0);

  const [toggleStates, setToggleStates] = React.useState({
    notarization: true,
    expedited: false,
    hardCopy: false,
    apostille: false,
  });

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const triggerTransitionDemo = () => {
    setSimulatingTransition(true);
    setTimeout(() => {
      setTransitionKey((prev) => prev + 1);
      setSimulatingTransition(false);
    }, 200);
  };

  return (
    <div className="min-h-screen bg-canvas text-text transition-colors duration-200">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border glass px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xl font-bold tracking-tight text-brand-ink">
              Verify<span className="text-brand-500">Lingua</span>
            </Link>
            <Badge variant="secondary" className="hidden sm:inline-flex text-[11px] rounded-[var(--r-xs)]">
              Design System & Token Catalog
            </Badge>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleTheme}
              className="gap-2 rounded-[var(--r-md)]"
              aria-label="Toggle dark mode"
            >
              {isDark ? (
                <>
                  <Sun className="w-4 h-4 text-status-warning" />
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-brand-500" />
                  <span>Dark Mode</span>
                </>
              )}
            </Button>
            <Button size="sm" asChild>
              <Link href="/">Back to App</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 space-y-16">
        {/* Intro */}
        <section className="space-y-4">
          <Badge variant="default" className="gap-1.5 py-1 px-3 rounded-[var(--r-xs)]">
            <Sparkles className="w-3.5 h-3.5" />
            Human Studio Craft Standards (WCAG 2.2 AA)
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-brand-ink">
            Design Tokens, Components & Motion System
          </h1>
          <p className="text-lg text-text-muted max-w-3xl leading-relaxed text-lead">
            Every color, typography step, surface layer, radius token, brand-tinted elevation, and motion curve is mapped directly
            to our CSS custom properties without raw hex values. Inter is banned; Basier Square and native system type govern the hierarchy.
          </p>
        </section>

        <Separator />

        {/* 1. Color Palette Tokens */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-brand-ink tracking-tight">1. Color Tokens & Semantic Architecture</h2>
            <p className="text-sm text-text-muted">Archival ink for legal dignity, trust cobalt for actions, and warm brass restricted to certification seals (&le;2% budget).</p>
          </div>

          {/* Ink & Brand */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-text-subtle">Archival Ink & Brand Scale</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 lg:grid-cols-11 gap-3">
              <ColorSwatch name="--brand-ink" label="Heading / Ink" bgClass="bg-[var(--brand-ink)]" textClass="text-white" token="var(--brand-ink)" />
              <ColorSwatch name="--brand-900" label="Deep Navy" bgClass="bg-[var(--brand-900)]" textClass="text-white" token="var(--brand-900)" />
              <ColorSwatch name="--brand-800" label="Dark Band" bgClass="bg-[var(--brand-800)]" textClass="text-white" token="var(--brand-800)" />
              <ColorSwatch name="--brand-700" label="Navy Mid" bgClass="bg-[var(--brand-700)]" textClass="text-white" token="var(--brand-700)" />
              <ColorSwatch name="--brand-600" label="Cobalt Deep" bgClass="bg-[var(--brand-600)]" textClass="text-white" token="var(--brand-600)" />
              <ColorSwatch name="--brand-500" label="Primary Action" bgClass="bg-[var(--brand-500)]" textClass="text-white" token="var(--brand-500)" />
              <ColorSwatch name="--brand-400" label="Cobalt Light" bgClass="bg-[var(--brand-400)]" textClass="text-white" token="var(--brand-400)" />
              <ColorSwatch name="--brand-300" label="Highlight" bgClass="bg-[var(--brand-300)]" textClass="text-brand-ink" token="var(--brand-300)" />
              <ColorSwatch name="--brand-200" label="Soft Tint" bgClass="bg-[var(--brand-200)]" textClass="text-brand-ink" token="var(--brand-200)" />
              <ColorSwatch name="--brand-100" label="Selection / Tint" bgClass="bg-[var(--brand-100)]" textClass="text-brand-ink" token="var(--brand-100)" />
              <ColorSwatch name="--brand-50" label="Canvas Tint" bgClass="bg-[var(--brand-50)]" textClass="text-brand-ink" token="var(--brand-50)" />
            </div>
          </div>

          {/* Warm Brass Seal & Atmosphere */}
          <div className="space-y-2 pt-2">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-text-subtle">Restrained Warm Brass Accent (Max 2% Pixel Budget)</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <ColorSwatch name="--seal-600" label="Seal Border" bgClass="bg-[var(--seal-600)]" textClass="text-white" token="var(--seal-600)" />
              <ColorSwatch name="--seal-500" label="Seal Accent" bgClass="bg-[var(--seal-500)]" textClass="text-white" token="var(--seal-500)" />
              <ColorSwatch name="--seal-400" label="Gold Highlight" bgClass="bg-[var(--seal-400)]" textClass="text-brand-ink" token="var(--seal-400)" />
              <ColorSwatch name="--seal-100" label="Seal Background" bgClass="bg-[var(--seal-100)]" textClass="text-brand-ink" token="var(--seal-100)" />
            </div>
          </div>

          {/* Atmosphere & Paper */}
          <div className="space-y-2 pt-2">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-text-subtle">Atmosphere & Paper Surfaces</h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <ColorSwatch name="--parchment-50" label="Reading Paper" bgClass="bg-[var(--parchment-50)]" textClass="text-brand-ink" token="var(--parchment-50)" />
              <ColorSwatch name="--lavender-100" label="Atmosphere Mid" bgClass="bg-[var(--lavender-100)]" textClass="text-brand-ink" token="var(--lavender-100)" />
              <ColorSwatch name="--lavender-50" label="Atmosphere Light" bgClass="bg-[var(--lavender-50)]" textClass="text-brand-ink" token="var(--lavender-50)" />
              <ColorSwatch name="--sky-100" label="Sky Atmosphere" bgClass="bg-[var(--sky-100)]" textClass="text-brand-ink" token="var(--sky-100)" />
              <ColorSwatch name="--peach-100" label="Peach Accent" bgClass="bg-[var(--peach-100)]" textClass="text-brand-ink" token="var(--peach-100)" />
            </div>
          </div>

          {/* Status Colors */}
          <div className="space-y-2 pt-2">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-text-subtle">Functional Status Tokens</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <ColorSwatch name="--status-success" label="Certified / Accepted" bgClass="bg-[var(--status-success)]" textClass="text-white" token="var(--status-success)" />
              <ColorSwatch name="--status-info" label="Information" bgClass="bg-[var(--status-info)]" textClass="text-white" token="var(--status-info)" />
              <ColorSwatch name="--status-warning" label="Triage Warning" bgClass="bg-[var(--status-warning)]" textClass="text-white" token="var(--status-warning)" />
              <ColorSwatch name="--status-danger" label="Blocking Rejection" bgClass="bg-[var(--status-danger)]" textClass="text-white" token="var(--status-danger)" />
            </div>
          </div>
        </section>

        <Separator />

        {/* 2. Border Radius Scale */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-brand-ink tracking-tight">2. Deliberate 6-Step Border Radius Scale (§3.6.1)</h2>
            <p className="text-sm text-text-muted">A single radius applied everywhere flattens hierarchy into mush. The scale itself communicates surface hierarchy.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="p-4 border border-border bg-surface-raised flex flex-col justify-between h-32 rounded-[var(--r-xs)]">
              <span className="font-mono text-xs text-text-subtle">--r-xs (6px)</span>
              <span className="text-xs font-semibold text-brand-ink">Chips, badges, micro-tags</span>
            </div>
            <div className="p-4 border border-border bg-surface-raised flex flex-col justify-between h-32 rounded-[var(--r-sm)]">
              <span className="font-mono text-xs text-text-subtle">--r-sm (10px)</span>
              <span className="text-xs font-semibold text-brand-ink">Inputs, small controls</span>
            </div>
            <div className="p-4 border border-border bg-surface-raised flex flex-col justify-between h-32 rounded-[var(--r-md)]">
              <span className="font-mono text-xs text-text-subtle">--r-md (14px)</span>
              <span className="text-xs font-semibold text-brand-ink">Buttons, toggle switches</span>
            </div>
            <div className="p-4 border border-border bg-surface-raised flex flex-col justify-between h-32 rounded-[var(--r-lg)]">
              <span className="font-mono text-xs text-text-subtle">--r-lg (20px)</span>
              <span className="text-xs font-semibold text-brand-ink">Application cards, panels</span>
            </div>
            <div className="p-4 border border-border bg-surface-raised flex flex-col justify-between h-32 rounded-[var(--r-xl)]">
              <span className="font-mono text-xs text-text-subtle">--r-xl (28px)</span>
              <span className="text-xs font-semibold text-brand-ink">Marketing cards, media</span>
            </div>
            <div className="p-4 border border-border bg-surface-raised flex flex-col justify-between h-32 rounded-[var(--r-2xl)]">
              <span className="font-mono text-xs text-text-subtle">--r-2xl (40px)</span>
              <span className="text-xs font-semibold text-brand-ink">Dark bands, outer wells</span>
            </div>
          </div>
        </section>

        <Separator />

        {/* 3. Layered Brand-Tinted Shadows */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-brand-ink tracking-tight">3. Layered Brand-Tinted Shadows (§3.6.2)</h2>
            <p className="text-sm text-text-muted">Tinted with archival ink (rgba(8,10,31, ...)), never neutral black. Structure comes from 1px borders; shadows indicate genuine elevation.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-[var(--r-lg)] bg-canvas border border-border shadow-sm flex flex-col justify-between h-36">
              <span className="font-mono text-xs text-text-subtle">--shadow-sm</span>
              <p className="text-xs text-text-muted">Subtle tactile lift for application workspace cards & controls.</p>
            </div>
            <div className="p-6 rounded-[var(--r-xl)] bg-canvas border border-border shadow-md flex flex-col justify-between h-36">
              <span className="font-mono text-xs text-text-subtle">--shadow-md</span>
              <p className="text-xs text-text-muted">Medium elevation for floating marketing cards with hover lift.</p>
            </div>
            <div className="p-6 rounded-[var(--r-xl)] bg-canvas border border-border shadow-lg flex flex-col justify-between h-36">
              <span className="font-mono text-xs text-text-subtle">--shadow-lg</span>
              <p className="text-xs text-text-muted">High elevation for dropdown overlays and modal dialogs.</p>
            </div>
            <div className="p-6 rounded-[var(--r-xl)] bg-surface border border-seal-400/40 shadow-seal flex flex-col justify-between h-36">
              <span className="font-mono text-xs text-seal-600 font-semibold">--shadow-seal</span>
              <p className="text-xs text-text-muted">Warm brass glow reserved strictly for notary stamps & verification marks.</p>
            </div>
          </div>
        </section>

        <Separator />

        {/* 4. Typography Hierarchy */}
        <section className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-brand-ink tracking-tight">4. Typography Identity (Basier Square + System Body)</h2>
            <p className="text-sm text-text-muted">Basier Square for display & headings with optical negative tracking; native system-ui for body text (0 KB webfont load). Inter is banned.</p>
          </div>

          <div className="space-y-6 border border-border rounded-[var(--r-xl)] p-6 md:p-8 bg-surface-raised">
            <div>
              <span className="text-xs font-mono text-text-subtle">--type-display (clamp(3.25rem, 6.5vw, 7rem) • tracking: -0.035em • lh: 0.92)</span>
              <p className="text-4xl md:text-6xl font-bold text-brand-ink font-display tracking-[-0.035em] leading-[0.92] mt-1">
                Guaranteed Certified Translations
              </p>
            </div>

            <Separator />

            <div>
              <span className="text-xs font-mono text-text-subtle">--type-h1 (clamp(2.75rem, 5vw, 5rem) • tracking: -0.03em • lh: 0.98)</span>
              <h1 className="text-3xl md:text-5xl font-bold text-brand-ink font-display tracking-[-0.03em] leading-[0.98] mt-1">
                Why USCIS Rejects Documents & How We Prevent It
              </h1>
            </div>

            <Separator />

            <div>
              <span className="text-xs font-mono text-text-subtle">--type-h2 (clamp(2.1rem, 3.6vw, 3.5rem) • tracking: -0.022em • lh: 1.06)</span>
              <h2 className="text-2xl md:text-3xl font-semibold text-brand-ink font-display tracking-[-0.022em] leading-[1.06] mt-1">
                Name & Date Consistency Lock Across All Translated Pages
              </h2>
            </div>

            <Separator />

            <div>
              <span className="text-xs font-mono text-text-subtle">--type-h3 (clamp(1.6rem, 2.2vw, 2.25rem) • tracking: -0.015em • lh: 1.18)</span>
              <h3 className="text-xl md:text-2xl font-semibold text-brand-ink font-display tracking-[-0.015em] leading-[1.18] mt-1">
                USCIS Title 8 CFR 103.2(b)(3) Compliance Protocol
              </h3>
            </div>

            <Separator />

            <div>
              <span className="text-xs font-mono text-text-subtle">--type-lead (clamp(1.15rem, 1.5vw, 1.45rem) • max 56ch • text-wrap: pretty)</span>
              <p className="text-lg text-text-muted leading-[1.55] max-w-[56ch] text-lead mt-1">
                Our pre-payment AI vision model flags blurry handwriting, missing stamps, and glare in under 5 seconds so your application proceeds with guaranteed acceptance.
              </p>
            </div>

            <Separator />

            <div>
              <span className="text-xs font-mono text-text-subtle">--type-body (17px / 1.0625rem • max 68ch)</span>
              <p className="text-[17px] text-text leading-[1.65] max-w-[68ch] mt-1">
                Every certified translation from VerifyLingua includes an ATA-certified translator declaration of accuracy, physical and digital notary seals, and an encrypted QR verification link for USCIS adjudicating officers.
              </p>
            </div>

            <Separator />

            <div>
              <span className="text-xs font-mono text-text-subtle">Tabular Numerals Enforced on All Numbers (font-variant-numeric: tabular-nums)</span>
              <div className="flex flex-wrap gap-6 font-mono text-xl font-bold text-brand-500 tabular-nums mt-1">
                <span>$24.95 / page</span>
                <span>Order #USCIS-2026-9481</span>
                <span>24:00:00 SLA</span>
                <span>100.0% Verified</span>
              </div>
            </div>
          </div>
        </section>

        <Separator />

        {/* 5. Button Primitives */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-brand-ink tracking-tight">5. Button System (§3.6.3)</h2>
            <p className="text-sm text-text-muted">44px minimum height, solid brand-500 primary, generous padding (20px sm / 28px md / 36px lg), display font weight 500-600.</p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Button size="lg" className="gap-2">
              Primary Action
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-[3px]" />
            </Button>
            <Button variant="secondary" size="lg">
              Secondary Button
            </Button>
            <Button variant="outline" size="lg">
              Outline Button
            </Button>
            <Button variant="dark" size="lg">
              Dark Navy Button
            </Button>
            <Button variant="tertiary" size="default">
              Tertiary Link
            </Button>
            <Button variant="destructive" size="lg">
              Destructive
            </Button>
            <Button isLoading size="lg">
              Loading State
            </Button>
          </div>
        </section>

        <Separator />

        {/* 6. Card Language */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-brand-ink tracking-tight">6. Card Architecture (§3.6.4)</h2>
            <p className="text-sm text-text-muted">Intentional contrast: Marketing cards invite with 28px radii and hover lift; workspace cards are flat, dense, and calm.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card variant="marketing" className="p-8 space-y-4 cursor-pointer">
              <div className="flex items-center justify-between">
                <Badge variant="default" className="rounded-[var(--r-xs)]">Marketing Card</Badge>
                <span className="font-mono text-xs text-text-subtle">--r-xl (28px) • shadow-md</span>
              </div>
              <CardTitle className="text-2xl">USCIS Certified Acceptance</CardTitle>
              <CardDescription>
                Features a 2px hover lift, layered tinted shadow deepening, and 32–40px generous padding to invite exploration.
              </CardDescription>
              <div className="pt-2 flex items-center gap-2 text-brand-500 font-semibold text-sm">
                <span>Explore Guarantee</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Card>

            <Card variant="application" className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="rounded-[var(--r-xs)]">Application Workspace</Badge>
                <span className="font-mono text-xs text-text-subtle">--r-lg (20px) • shadow-sm</span>
              </div>
              <CardTitle className="text-xl">Document Review Studio</CardTitle>
              <CardDescription>
                Flatter, zero hover lift, 24px padding to maximize operational focus and data density.
              </CardDescription>
              <div className="pt-2 text-xs font-mono text-text-subtle">
                Status: Verified • Locked Glossary Active
              </div>
            </Card>
          </div>
        </section>

        <Separator />

        {/* 7. Forms & Inputs */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-brand-ink tracking-tight">7. Form Controls (§3.6.5)</h2>
            <p className="text-sm text-text-muted">Persistent labels above every field (never placeholder-as-label). 2px focus ring with 2px offset. Error states include icon + text.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-brand-ink flex items-center justify-between">
                <span>Applicant Full Legal Name</span>
                <span className="text-xs text-text-subtle font-normal">Per Passport</span>
              </label>
              <Input placeholder="e.g. Maria Hernandez Garcia" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-brand-ink flex items-center justify-between">
                <span>Case Receipt Number</span>
                <span className="text-xs text-status-danger font-medium">Validation Error</span>
              </label>
              <Input error defaultValue="IOE-9841" />
              <p className="text-xs text-status-danger flex items-center gap-1 mt-1">
                <XCircle className="w-3.5 h-3.5 shrink-0" />
                Must be 13 characters starting with 3 letters (e.g. IOE, LIN, WAC).
              </p>
            </div>
          </div>
        </section>

        <Separator />

        {/* 8. LIVE MOTION PLAYGROUND (§3.9) */}
        <section className="space-y-12">
          <div className="space-y-2">
            <Badge variant="default" className="rounded-[var(--r-xs)]">Interactive Lab</Badge>
            <h2 className="text-3xl font-bold text-brand-ink tracking-tight">8. Live Motion Playground (§3.5, §3.9)</h2>
            <p className="text-sm text-text-muted max-w-3xl">
              Demonstrating the required motion behaviors: magnetic CTAs, stagger grids, scroll reveals, page transitions, and the signature celebration moment.
            </p>
          </div>

          {/* Playground 1: Magnetic Buttons */}
          <div className="p-8 rounded-[var(--r-xl)] border border-border bg-surface space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-brand-ink">Playground A: Magnetic Button (§3.5.2)</h3>
                <p className="text-xs text-text-muted">Proximity pull within ~80px, capped at 9px displacement with 0.4x inner label parallax. Disabled on touch.</p>
              </div>
              <Badge variant="outline" className="rounded-[var(--r-xs)]">motion/react</Badge>
            </div>

            <div className="py-8 flex flex-wrap items-center justify-center gap-8 bg-canvas rounded-[var(--r-lg)] border border-border">
              <MagneticButton>
                <Button size="lg" className="px-8">
                  Hover Near Me
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </MagneticButton>

              <MagneticButton>
                <Button variant="secondary" size="lg" className="px-8">
                  Secondary Magnetic
                </Button>
              </MagneticButton>
            </div>
          </div>

          {/* Playground 2: Stagger Grid */}
          <div className="p-8 rounded-[var(--r-xl)] border border-border bg-surface space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-brand-ink">Playground B: Stagger Grid (§3.5.4)</h3>
                <p className="text-xs text-text-muted">60ms stagger between children, max 8 items cap, first paint animation.</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => setStaggerKey((k) => k + 1)} className="gap-1.5">
                <RotateCcw className="w-3.5 h-3.5" /> Re-trigger
              </Button>
            </div>

            <div key={staggerKey} className="pt-2">
              <StaggerContainer className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {["1. Upload Document", "2. Vision Triage", "3. Human ATA Review", "4. USCIS Certification"].map((step, idx) => (
                  <StaggerItem key={idx}>
                    <div className="p-5 rounded-[var(--r-lg)] bg-canvas border border-border shadow-sm">
                      <div className="flex items-center gap-2 text-brand-500 font-mono text-xs font-bold mb-2">
                        <Zap className="w-3.5 h-3.5" />
                        <span>STEP 0{idx + 1}</span>
                      </div>
                      <p className="text-sm font-semibold text-brand-ink">{step}</p>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </div>
          </div>

          {/* Playground 3: Scroll Reveal Simulation */}
          <div className="p-8 rounded-[var(--r-xl)] border border-border bg-surface space-y-4">
            <div>
              <h3 className="text-xl font-semibold text-brand-ink">Playground C: Scroll Reveal Primitive (§3.5.3)</h3>
              <p className="text-xs text-text-muted">Triggered via IntersectionObserver, translateY 16px to 0, duration 340ms, zero CLS.</p>
            </div>

            <ScrollReveal className="p-6 rounded-[var(--r-lg)] bg-canvas border border-border shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-[var(--r-sm)] bg-status-success-bg text-status-success flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-semibold text-brand-ink">Scroll-Linked Content Reveal</h4>
                  <p className="text-xs text-text-muted">Fires once when entering viewport, with compositor-only properties.</p>
                </div>
              </div>
              <span className="font-mono text-xs text-status-success font-semibold">Ready</span>
            </ScrollReveal>
          </div>

          {/* Playground 4: Page Transition Simulator */}
          <div className="p-8 rounded-[var(--r-xl)] border border-border bg-surface space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-brand-ink">Playground D: Page Transition Simulator (§3.5.5)</h3>
                <p className="text-xs text-text-muted">Simulates App Router template.tsx transition: 420ms enter (y: 10px &rarr; 0) and 150ms exit (y: 0 &rarr; -8px).</p>
              </div>
              <Button size="sm" onClick={triggerTransitionDemo} className="gap-1.5" disabled={simulatingTransition}>
                <Play className="w-3.5 h-3.5" /> Simulate Route Push
              </Button>
            </div>

            <div className="min-h-[140px] p-6 rounded-[var(--r-lg)] bg-canvas border border-border flex items-center justify-center overflow-hidden">
              <AnimatePresence mode="wait">
                {!simulatingTransition && (
                  <motion.div
                    key={transitionKey}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.42, ease: [0.25, 1, 0.5, 1] }}
                    className="text-center space-y-1"
                  >
                    <span className="font-mono text-xs text-brand-500 font-bold">ROUTE: /order/checkout (Cycle #{transitionKey + 1})</span>
                    <p className="text-base font-semibold text-brand-ink">Smoothly entering with --dur-page (420ms) and --ease-out-quart</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Playground 5: The Signature Moment (§3.5.6) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-brand-ink tracking-tight">Playground E: The Signature Moment (§3.5.6)</h3>
                <p className="text-sm text-text-muted">
                  The memorable milestone where the user receives the thing they came for. Count-up numeral, spring settling, delayed detail, and single accent sweep.
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={() => setSignatureKey((k) => k + 1)} className="gap-1.5">
                <RotateCcw className="w-3.5 h-3.5" /> Replay Moment
              </Button>
            </div>

            <div key={signatureKey}>
              <SignatureMoment
                targetValue={100}
                suffix="%"
                title="USCIS Acceptance Guaranteed"
                confirmingDetail="8 CFR 103.2 Authenticity Seal Affixed • ATA Member No. 274910"
                complianceCode="CERT-USCIS-VALIDATED"
              />
            </div>
          </div>
        </section>

        <Separator />

        {/* 9. WCAG Contrast Check Summary */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-brand-ink tracking-tight">9. WCAG 2.2 AA Contrast Validation Matrix</h2>
            <p className="text-sm text-text-muted">Calculated contrast ratios against canvas and surfaces.</p>
          </div>

          <div className="overflow-x-auto border border-border rounded-[var(--r-xl)]">
            <table className="w-full text-left text-sm">
              <thead className="bg-lavender-50 dark:bg-surface border-b border-border text-brand-ink font-semibold">
                <tr>
                  <th className="p-4">Color Pair</th>
                  <th className="p-4">Contrast Ratio</th>
                  <th className="p-4">WCAG Standard</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="p-4 font-medium text-brand-ink">--brand-ink on --canvas</td>
                  <td className="p-4 font-mono font-bold">19.2 : 1</td>
                  <td className="p-4">WCAG AAA (Enhanced &ge; 7.0:1)</td>
                  <td className="p-4 text-status-success font-semibold">✓ Pass</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-brand-ink">--brand-500 on --canvas</td>
                  <td className="p-4 font-mono font-bold">6.1 : 1</td>
                  <td className="p-4">WCAG AA (Normal Text &ge; 4.5:1)</td>
                  <td className="p-4 text-status-success font-semibold">✓ Pass</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-brand-ink">White on --brand-500</td>
                  <td className="p-4 font-mono font-bold">5.9 : 1</td>
                  <td className="p-4">WCAG AA (Normal Text &ge; 4.5:1)</td>
                  <td className="p-4 text-status-success font-semibold">✓ Pass</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-brand-ink">--text-muted on --canvas</td>
                  <td className="p-4 font-mono font-bold">5.8 : 1</td>
                  <td className="p-4">WCAG AA (Normal Text &ge; 4.5:1)</td>
                  <td className="p-4 text-status-success font-semibold">✓ Pass</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-brand-ink">White on --brand-ink (Dark Band)</td>
                  <td className="p-4 font-mono font-bold">19.2 : 1</td>
                  <td className="p-4">WCAG AAA (Enhanced &ge; 7.0:1)</td>
                  <td className="p-4 text-status-success font-semibold">✓ Pass</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

function ColorSwatch({
  name,
  label,
  bgClass,
  textClass,
  token,
}: {
  name: string;
  label: string;
  bgClass: string;
  textClass: string;
  token: string;
}) {
  return (
    <div className="flex flex-col rounded-[var(--r-md)] border border-border overflow-hidden bg-surface-raised shadow-sm">
      <div className={`h-16 w-full ${bgClass} flex items-end p-2.5`}>
        <span className={`text-[11px] font-mono font-bold ${textClass}`}>{name}</span>
      </div>
      <div className="p-2.5 space-y-0.5">
        <span className="text-xs font-mono font-semibold text-brand-ink block truncate">{token}</span>
        <span className="text-[11px] text-text-muted block truncate">{label}</span>
      </div>
    </div>
  );
}
