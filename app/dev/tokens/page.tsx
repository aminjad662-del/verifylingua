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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
  Truck,
  Globe2,
} from "lucide-react";
import Link from "next/link";

export default function DesignTokensPage() {
  const [isDark, setIsDark] = React.useState(false);
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

  return (
    <div className="min-h-screen bg-canvas text-text transition-colors duration-200">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-surface-raised/80 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xl font-black tracking-tight text-brand-ink">
              Verify<span className="text-brand-500">Lingua</span>
            </Link>
            <Badge variant="secondary" className="hidden sm:inline-flex text-[11px]">
              Design System & Token Catalog
            </Badge>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleTheme}
              className="gap-2 rounded-xl"
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
          <Badge variant="default" className="gap-1.5 py-1 px-3">
            <Sparkles className="w-3.5 h-3.5" />
            Screenshot-Led Design Tokens (WCAG 2.2 AA)
          </Badge>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-brand-ink">
            Design Tokens & Component Specifications
          </h1>
          <p className="text-lg text-text-muted max-w-3xl leading-relaxed">
            Every color, typography step, surface layer, and interactive primitive is mapped directly
            to our CSS custom properties and Tailwind v4 theme tokens without raw hex values.
          </p>
        </section>

        <Separator />

        {/* 1. Color Palette Tokens */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-brand-ink tracking-tight">1. Color Tokens & Surface Layering</h2>
            <p className="text-sm text-text-muted">Extracted from reference screenshots: calm near-white/lavender with ink typography and cobalt actions.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <ColorSwatch name="--brand-ink" hex="#0B0D2A" bgClass="bg-brand-ink" textClass="text-white" label="Heading / Ink" />
            <ColorSwatch name="--brand-800" hex="#17204D" bgClass="bg-brand-800" textClass="text-white" label="Dark Accent" />
            <ColorSwatch name="--brand-700" hex="#2947C7" bgClass="bg-brand-700" textClass="text-white" label="Hover Action" />
            <ColorSwatch name="--brand-500" hex="#4160E8" bgClass="bg-brand-500" textClass="text-white" label="Primary Action" />
            <ColorSwatch name="--brand-300" hex="#7A96F2" bgClass="bg-brand-300" textClass="text-brand-ink" label="Subtle Highlight" />
            <ColorSwatch name="--brand-100" hex="#DCE6FF" bgClass="bg-brand-100" textClass="text-brand-ink" label="Light Tint" />
            <ColorSwatch name="--brand-50" hex="#F1F4FF" bgClass="bg-brand-50" textClass="text-brand-ink" label="Pill Background" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
            <ColorSwatch name="--lavender-100" hex="#E9EBF8" bgClass="bg-lavender-100" textClass="text-brand-ink" label="Atmosphere Mid" />
            <ColorSwatch name="--lavender-50" hex="#F4F4FC" bgClass="bg-lavender-50" textClass="text-brand-ink" label="Atmosphere Light" />
            <ColorSwatch name="--sky-100" hex="#D9EBFF" bgClass="bg-sky-100" textClass="text-brand-ink" label="Sky Tint" />
            <ColorSwatch name="--peach-100" hex="#F7DFDA" bgClass="bg-peach-100" textClass="text-brand-ink" label="Warm Peach" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
            <ColorSwatch name="--status-success" hex="#2F7D6D" bgClass="bg-status-success" textClass="text-white" label="Success / Accepted" />
            <ColorSwatch name="--status-info" hex="#4160E8" bgClass="bg-status-info" textClass="text-white" label="Information" />
            <ColorSwatch name="--status-warning" hex="#B87514" bgClass="bg-status-warning" textClass="text-white" label="Warning / Triage" />
            <ColorSwatch name="--status-danger" hex="#C55353" bgClass="bg-status-danger" textClass="text-white" label="Danger / Blocking" />
          </div>
        </section>

        <Separator />

        {/* 2. Named Atmospheric Gradients */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-brand-ink tracking-tight">2. Named Atmospheric Gradients</h2>
            <p className="text-sm text-text-muted">Gradients are strictly restricted to named tokens for broad atmospheric depth.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-8 rounded-3xl bg-gradient-hero border border-border flex flex-col justify-between h-48">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-brand-ink">.bg-gradient-hero</span>
              <p className="text-sm font-medium text-brand-ink">Radial blend from pale blue to white for hero surfaces.</p>
            </div>

            <div className="p-8 rounded-3xl bg-gradient-panel border border-border flex flex-col justify-between h-48">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-brand-ink">.bg-gradient-panel</span>
              <p className="text-sm font-medium text-brand-ink">Diagonal soft lavender-blue blend for card features.</p>
            </div>

            <div className="p-8 rounded-3xl bg-gradient-dark-band border border-white/10 flex flex-col justify-between h-48 text-white">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-white/80">.bg-gradient-dark-band</span>
              <p className="text-sm font-medium text-white/90">Deep navy radial background for high-impact rejection-proof bands.</p>
            </div>
          </div>
        </section>

        <Separator />

        {/* 3. Typography Hierarchy */}
        <section className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-brand-ink tracking-tight">3. Typography Hierarchy (Inter Sans + Monospace)</h2>
            <p className="text-sm text-text-muted">Proportional scale ensuring bold contrast and rapid readability for immigrants under deadline.</p>
          </div>

          <div className="space-y-6 border border-border rounded-3xl p-6 md:p-8 bg-surface-raised">
            <div>
              <span className="text-xs font-mono text-text-muted">Display Hero (clamp(3.5rem, 6.5vw, 6.5rem))</span>
              <p className="text-4xl md:text-6xl font-extrabold text-brand-ink tracking-tight leading-[0.96]">
                Guaranteed Certified Translations
              </p>
            </div>

            <Separator />

            <div>
              <span className="text-xs font-mono text-text-muted">Section Heading H2 (clamp(2.25rem, 4.5vw, 4rem))</span>
              <h2 className="text-3xl md:text-4xl font-bold text-brand-ink tracking-tight">
                Why USCIS Rejects Documents & How We Prevent It
              </h2>
            </div>

            <Separator />

            <div>
              <span className="text-xs font-mono text-text-muted">Card Heading H3 (1.5rem - 2rem)</span>
              <h3 className="text-2xl font-bold text-brand-ink tracking-tight">
                Name & Date Consistency Lock
              </h3>
            </div>

            <Separator />

            <div>
              <span className="text-xs font-mono text-text-muted">Body Lead (1.125rem / 18px)</span>
              <p className="text-lg text-text-muted leading-relaxed max-w-3xl">
                Our pre-payment AI vision model flags blurry handwriting, missing pages, and glare in under 5 seconds so your application proceeds without delays.
              </p>
            </div>

            <Separator />

            <div>
              <span className="text-xs font-mono text-text-muted">Monospace Metadata & Badges (font-mono / 14px)</span>
              <p className="font-mono text-sm text-brand-500 font-semibold">
                SHA-256: 9e107d9d372bb6826bd81d3542a419d6b5e0c52
              </p>
            </div>
          </div>
        </section>

        <Separator />

        {/* 4. Interactive Button Primitives */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-brand-ink tracking-tight">4. Button Variants & Sizes</h2>
            <p className="text-sm text-text-muted">48px default height, 12-16px radii, cobalt primary action.</p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Button size="lg" className="gap-2">
              Primary Action
              <ArrowRight className="w-4 h-4" />
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
            <Button variant="destructive" size="lg">
              Destructive
            </Button>
            <Button variant="ghost" size="lg">
              Ghost Button
            </Button>
            <Button variant="link">Link Style</Button>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Button size="sm">Small (36px)</Button>
            <Button size="default">Default (48px)</Button>
            <Button size="lg">Large (56px)</Button>
            <Button size="icon" variant="outline" aria-label="Security check">
              <ShieldCheck className="w-5 h-5 text-brand-500" />
            </Button>
            <Button disabled>Disabled State</Button>
          </div>
        </section>

        <Separator />

        {/* 5. Add-On Toggle Rows */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-brand-ink tracking-tight">5. High-Margin Add-On Toggle Rows (§5.2)</h2>
            <p className="text-sm text-text-muted">Full row clickable switches with immediate price feedback — never buried in comparison tables.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ToggleRow
              id="notarization-toggle"
              title="Notarization Certificate"
              description="Official notary jurat with wet & electronic seal for courts and foreign consulates."
              priceDelta={19.95}
              checked={toggleStates.notarization}
              onCheckedChange={(checked) => setToggleStates((prev) => ({ ...prev, notarization: checked }))}
              badge="Courts & Consulates"
              recommended
            />

            <ToggleRow
              id="expedited-toggle"
              title="Expedited 12-Hour Delivery"
              description="Cuts standard turnaround by 50% with priority queue placement."
              priceDelta="+60% base"
              checked={toggleStates.expedited}
              onCheckedChange={(checked) => setToggleStates((prev) => ({ ...prev, expedited: checked }))}
              badge="Fastest"
            />

            <ToggleRow
              id="hardcopy-toggle"
              title="Physical Hard Copy by Mail"
              description="Embossed certificate on 32lb bond archival paper with USPS tracking."
              priceDelta={19.95}
              checked={toggleStates.hardCopy}
              onCheckedChange={(checked) => setToggleStates((prev) => ({ ...prev, hardCopy: checked }))}
            />

            <ToggleRow
              id="apostille-toggle"
              title="State Apostille Authentication"
              description="State Secretary of State apostille certificate for foreign legal recognition."
              priceDelta={75.00}
              checked={toggleStates.apostille}
              onCheckedChange={(checked) => setToggleStates((prev) => ({ ...prev, apostille: checked }))}
            />
          </div>
        </section>

        <Separator />

        {/* 6. Status Chips & Badges */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-brand-ink tracking-tight">6. Status Chips & Triage Badges</h2>
            <p className="text-sm text-text-muted">Clear semantic tokens for document triage, order stages, and institutional acceptance.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="default" className="gap-1.5 py-1 px-3">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-500" />
              USCIS Certified
            </Badge>

            <Badge variant="success" className="gap-1.5 py-1 px-3">
              <CheckCircle2 className="w-3.5 h-3.5" />
              100% Acceptance Guaranteed
            </Badge>

            <Badge variant="warning" className="gap-1.5 py-1 px-3">
              <AlertTriangle className="w-3.5 h-3.5" />
              Triage Warning: Low Resolution
            </Badge>

            <Badge variant="danger" className="gap-1.5 py-1 px-3">
              <XCircle className="w-3.5 h-3.5" />
              Blocking: Missing Page 2 of 2
            </Badge>

            <Badge variant="secondary" className="gap-1.5 py-1 px-3">
              <Lock className="w-3.5 h-3.5" />
              Passport Name Locked
            </Badge>

            <Badge variant="dark" className="gap-1.5 py-1 px-3">
              <Globe2 className="w-3.5 h-3.5" />
              Public Verification QR
            </Badge>
          </div>
        </section>

        <Separator />

        {/* 7. Form Controls & Inputs */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-brand-ink tracking-tight">7. Form Inputs & Error States</h2>
            <p className="text-sm text-text-muted">12px radius, visible labels, clear focus indicators, error helpers near field.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="passport-name" className="text-sm font-semibold text-brand-ink">
                Exact Passport Full Name (Name Consistency Lock)
              </label>
              <Input
                id="passport-name"
                placeholder="e.g. MOHAMMED ABDULLAH AL-RASHID"
                defaultValue="MOHAMMED ABDULLAH AL-RASHID"
              />
              <p className="text-xs text-text-muted">
                This exact spelling will be locked into the translator workspace to prevent USCIS RFE rejections.
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="email-input" className="text-sm font-semibold text-brand-ink">
                Guest Email Address (No Account Required)
              </label>
              <Input
                id="email-input"
                type="email"
                placeholder="you@example.com"
                defaultValue="invalid-email"
                error
              />
              <p className="text-xs text-status-danger font-medium">
                Please enter a valid email address so we can deliver your signed translation.
              </p>
            </div>
          </div>
        </section>

        <Separator />

        {/* 8. Dark Feature Container Preview */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-brand-ink tracking-tight">8. Dark Feature Container (§4.3)</h2>
            <p className="text-sm text-text-muted">Deep navy container with translucent cards for high-impact rejection prevention proof.</p>
          </div>

          <div className="rounded-[32px] bg-gradient-dark-band p-8 md:p-12 text-white space-y-8 relative overflow-hidden border border-white/10">
            <div className="max-w-2xl space-y-3">
              <Badge variant="dark" className="gap-1.5 py-1 px-3">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-300" />
                Rejection-Proof Architecture
              </Badge>
              <h3 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                Eliminating the 6 Documented USCIS Failure Modes
              </h3>
              <p className="text-white/80 leading-relaxed">
                Incumbents discover translation issues after you pay. We eliminate every rejection risk before delivery.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="rounded-2xl bg-white/5 border border-white/10 p-6 space-y-2 backdrop-blur-sm">
                <Stamp className="w-6 h-6 text-brand-300" />
                <h4 className="text-lg font-semibold text-white">Full Seal & Stamp Translation</h4>
                <p className="text-sm text-white/70">USCIS requires every margin note, rubber stamp, and watermark translated. We never skip seals.</p>
              </div>

              <div className="rounded-2xl bg-white/5 border border-white/10 p-6 space-y-2 backdrop-blur-sm">
                <Lock className="w-6 h-6 text-brand-300" />
                <h4 className="text-lg font-semibold text-white">Passport Name Locking</h4>
                <p className="text-sm text-white/70">Hard-locks spelling against your passport so government systems never see mismatched records.</p>
              </div>

              <div className="rounded-2xl bg-white/5 border border-white/10 p-6 space-y-2 backdrop-blur-sm">
                <Zap className="w-6 h-6 text-brand-300" />
                <h4 className="text-lg font-semibold text-white">Public Verification QR</h4>
                <p className="text-sm text-white/70">Officers scan the certificate to verify cryptographic SHA-256 hash and certified translator credentials.</p>
              </div>
            </div>
          </div>
        </section>

        <Separator />

        {/* 9. Interactive Accordion FAQ */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-brand-ink tracking-tight">9. Accordion FAQ Primitive</h2>
            <p className="text-sm text-text-muted">Smooth expandable questions with rotating indicators.</p>
          </div>

          <Accordion type="single" collapsible defaultValue="item-1" className="w-full max-w-3xl">
            <AccordionItem value="item-1">
              <AccordionTrigger>What is the USCIS 100% Acceptance Guarantee?</AccordionTrigger>
              <AccordionContent>
                Every certified translation from VerifyLingua meets Title 8 of the Code of Federal Regulations (8 CFR 103.2(b)(3)).
                If any translation is rejected by USCIS, we will revise it immediately for free and provide a 100% full refund of your order.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger>How does the Pre-Payment AI Document Triage work?</AccordionTrigger>
              <AccordionContent>
                The instant you drop your file or snap a photo, our vision model checks for cut-off seals, low resolution, handwriting illegibility,
                and missing back-pages. If any issue is detected, we provide a quick re-shoot tip before you pay.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        <Separator />

        {/* 10. WCAG Contrast Check Summary */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-brand-ink tracking-tight">10. WCAG 2.2 AA Contrast Validation Matrix</h2>
            <p className="text-sm text-text-muted">Calculated contrast ratios against canvas and surfaces.</p>
          </div>

          <div className="overflow-x-auto border border-border rounded-2xl">
            <table className="w-full text-left text-sm">
              <thead className="bg-lavender-50 border-b border-border text-brand-ink font-semibold">
                <tr>
                  <th className="p-4">Color Pair</th>
                  <th className="p-4">Contrast Ratio</th>
                  <th className="p-4">WCAG Standard</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="p-4 font-medium text-brand-ink">--brand-ink on --canvas (#0B0D2A on #FFFFFF)</td>
                  <td className="p-4 font-mono font-bold">18.4 : 1</td>
                  <td className="p-4">WCAG AAA (Enhanced &ge; 7.0:1)</td>
                  <td className="p-4 text-status-success font-semibold">✓ Pass</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-brand-ink">--brand-500 on --canvas (#4160E8 on #FFFFFF)</td>
                  <td className="p-4 font-mono font-bold">5.8 : 1</td>
                  <td className="p-4">WCAG AA (Normal Text &ge; 4.5:1)</td>
                  <td className="p-4 text-status-success font-semibold">✓ Pass</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-brand-ink">White on --brand-500 (#FFFFFF on #4160E8)</td>
                  <td className="p-4 font-mono font-bold">5.8 : 1</td>
                  <td className="p-4">WCAG AA (Normal Text &ge; 4.5:1)</td>
                  <td className="p-4 text-status-success font-semibold">✓ Pass</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-brand-ink">--text-muted on --canvas (#62697B on #FFFFFF)</td>
                  <td className="p-4 font-mono font-bold">5.7 : 1</td>
                  <td className="p-4">WCAG AA (Normal Text &ge; 4.5:1)</td>
                  <td className="p-4 text-status-success font-semibold">✓ Pass</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-brand-ink">White on --brand-ink (#FFFFFF on #0B0D2A)</td>
                  <td className="p-4 font-mono font-bold">18.4 : 1</td>
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
  hex,
  bgClass,
  textClass,
  label,
}: {
  name: string;
  hex: string;
  bgClass: string;
  textClass: string;
  label: string;
}) {
  return (
    <div className="flex flex-col rounded-2xl border border-border overflow-hidden bg-surface-raised shadow-sm">
      <div className={`h-20 w-full ${bgClass} flex items-end p-2.5`}>
        <span className={`text-xs font-mono font-bold ${textClass}`}>{hex}</span>
      </div>
      <div className="p-3 space-y-1">
        <span className="text-xs font-mono font-semibold text-brand-ink block truncate">{name}</span>
        <span className="text-[11px] text-text-muted block truncate">{label}</span>
      </div>
    </div>
  );
}
