# Visual Analysis & Design Reference Specification

## 1. Executive Summary
This document synthesizes the visual grammar, component architecture, spatial system, and aesthetic rules extracted from the primary design references:
- **Reference A (Product & Comparison)**: docs/references/reference-product.jpg
- **Reference B (Community & Editorial)**: docs/references/reference-community.jpg

These references define the visual language of **VerifyLingua**. We preserve the calm, authoritative, premium SaaS composition while pivoting all domain content to certified legal translation, USCIS acceptance guarantees, document triage, and public verification.

---

## 2. Spatial & Grid System
- **Maximum Container Width**: min(100% - 48px, 1440px) for desktop; min(100% - 32px, 390px) for mobile.
- **Vertical Rhythm / Section Spacing**: 
  - Desktop: 96px to 160px between primary marketing bands.
  - Mobile: 56px to 80px.
- **Grid Patterns**:
  - **12-Column Base Grid**: Used for complex responsive layouts.
  - **50/50 Split Feature Rows**: Left copy with eyebrow + large heading + bulleted spec items; right interactive preview card or live document triage mock.
  - **3-Column Proof Cards**: Stat metrics (100% Guaranteed, <5s Triage, 24h Delivery) on pale lavender surfaces.
  - **4-Column Feature/Trust Grid**: Compact cards with 1px border, soft hover lift, and icon/badge top alignment.
  - **Asymmetric Bento Grid**: Mixed spans (e.g., col-span-7 and col-span-5) for rich feature highlights.

---

## 3. Color & Gradient Architecture
- **Ink & Typography**: Deep blue-black (#0B0D2A) for all primary headings and heavy text elements. Ensures maximum contrast (WCAG AAA).
- **Primary Brand / Actions**: Vibrant cobalt (#4160E8) for primary CTAs, active toggles, and focus rings (focus-visible:ring-2 focus-visible:ring-[#4160E8]).
- **Surface Layering**:
  - Background Canvas: #FFFFFF
  - Secondary Section Surfaces: #F7F8FD and #F4F4FC
  - Elevated Cards: #FFFFFF with 1px #D9DDE8 border and subtle elevation.
- **Atmospheric Gradients (Named Tokens Only)**:
  - --gradient-hero: Soft radial blend from #DCE6FF (top-center) through #F4F4FC to #FFFFFF.
  - --gradient-panel: Subtle diagonal blend from #F1F4FF to #E9EBF8.
  - --gradient-dark-band: Deep navy #0B0D2A base with radial blue accent #17204D and subtle arc line decorations.
- **Strict Anti-Pattern Rule**: Zero raw hex codes in JSX files. All colors reference semantic tokens.

---

## 4. Typography Scale & Hierarchy
- **Font Family**: Inter (next/font/google), fallback -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif. Monospace metadata via JetBrains Mono / ui-monospace.
- **Display Hero Headings**: clamp(3.5rem, 6.5vw, 6.5rem) with leading-[0.96] and tracking-[-0.035em].
- **Section Headings (H2)**: clamp(2.25rem, 4.5vw, 4rem) with leading-[1.05] and tracking-[-0.025em].
- **Card Headings (H3)**: 1.5rem to 2.25rem (tracking-[-0.02em]).
- **Body Text**:
  - Marketing lead body: 1.125rem to 1.25rem (leading-relaxed, color: #62697B).
  - Standard body: 1rem (16px, leading-normal).
  - UI Labels / Metadata: 0.875rem (14px) and 0.75rem (12px, uppercase, tracking-wider).

---

## 5. Component Language & Radii
- **Card Radii**: 20px to 28px (rounded-3xl / rounded-[24px]).
- **Buttons**:
  - Radius: 12px to 16px (rounded-xl / rounded-2xl).
  - Min Height: 48px (Touch target >= 44px).
  - Primary: Solid cobalt #4160E8, hover #2947C7, text pure white.
  - Secondary: Solid white, 1px #D9DDE8 border, text #0B0D2A, hover #F7F8FD.
- **Eyebrow Badges**:
  - Pill shape (rounded-full), px-3.5 py-1, text-xs uppercase tracking-wider font-semibold, border 1px solid #DCE6FF, bg #F1F4FF, text #4160E8.
- **FAQ Accordion**:
  - Generous vertical padding (py-6), 1px #D9DDE8 bottom border, large clean question type (text-xl font-medium), smooth rotating chevron.
- **Dark Feature Container**:
  - Large rounded container (rounded-[32px]), background #0B0D2A, translucent interior cards (bg-white/5 border-white/10), crisp white copy.

---

## 6. Adaptations for VerifyLingua
1. **Hero Section**: In place of a generic video mock, embed the **Live Interactive Document Dropzone & Instant Quote Widget** directly into the hero.
2. **Comparison Matrix**: Detailed comparison table against ImmiTranslate, RushTranslate, and Translayte emphasizing:
   - Acceptance Pre-Check Wizard (Exclusive)
   - Pre-Payment OCR & Vision Triage (Exclusive)
   - Name & Date Consistency Lock (Exclusive)
   - Public Verification Portal & QR Code (Exclusive)
   - Acceptance Guarantee (.95/page price match + 100% refund & redo guarantee).
3. **How It Works (4-Step Flow)**:
   - 1. Instant Upload & AI Triage
   - 2. Acceptance Spec Pre-Check
   - 3. Certified Human Translation & Name-Lock
   - 4. Signed Certificate & Instant QR Verification
4. **Institutional Trust Badges**: USCIS acceptance compliance statement, ATA member seal reference, 256-bit encryption indicator, 100% acceptance guarantee badge.
