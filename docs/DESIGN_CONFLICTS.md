# VerifyLingua - Design Conflicts & Resolutions

> **Precedence Order Hierarchy**:
> 1. Security, legal, accessibility, privacy requirements (WCAG 2.2 AA)
> 2. Product and functional requirements (USCIS / certified document translation)
> 3. The local `.md` design system files (`C:\Users\aminj\Downloads\skills\.agents\skills`)
> 4. Section 3 Design Contract
> 5. Visual reference screenshots
> 6. Agent / LLM defaults (lowest — strictly never permitted to override)

---

## Summary of Conflicts Found: 7

| # | Domain | Local Skills Position | Section 3 Position | Precedence Applied | Resolution & Implementation Notes |
|---|---|---|---|---|---|
| 1 | **Motion Library** | Uses `gsap` (8 skills) and `motion` | Mandates `motion` (`motion/react`), bans `framer-motion` | **Local Skills + Section 3 (§3.5.0)** | Replaced legacy `framer-motion` with `motion` v13.1.1. GSAP is reserved for complex timeline choreography / ScrollTrigger; `motion` handles React component springs, magnetic CTAs, and exit transitions. |
| 2 | **Typography Selection** | Recommends diverse fonts (Satoshi, General Sans, Instrument Serif, Cormorant) | Mandates `Basier Square` for Display/H1-H3 and native `system-ui` for Body; bans Inter | **Product Domain (#2) + Section 3 (#4)** | VerifyLingua is a certified legal translation platform requiring authoritative, sober typographic presentation. Basier Square is licensed and present in `/public/fonts/basier-square/` (`BasierSquare-Bold.otf`, `Medium`, `Regular`, `SemiBold`) with `General Sans` metric fallback. Inter is completely banned. |
| 3 | **Color Palette & Accents** | Mentions neon accents (`stitch-design-taste`), brutalist stark mono (`industrial-brutalist-ui`), or neutral palettes (`design-system`) | Specifies Archival Ink (`#080A1F`), Trust Cobalt (`#3D57DB`), and Warm Brass Seal (`#A87A2C` <=2% pixel budget) | **Product Domain (#2) + Section 3 (#4)** | Legal certification demands archival dignity. Applied Section 3 palette: Archival Ink for legal authority, Trust Cobalt for verified CTAs, and Warm Brass Seal for notarized seals and USCIS compliance badges. |
| 4 | **Border Radius Scale** | `industrial-brutalist-ui` demands 0px (`rounded-none`); `high-end-visual-design` bans `rounded-2xl` and `rounded-3xl` cards | Mandates 6-step radius scale: `--r-xs: 6px` to `--r-2xl: 40px` | **Local Skills (#3) + Section 3 (#4)** | Harmonized scale: cards use `--r-lg` (20px) for application cards and `--r-xl` (28px) for marketing cards. `--r-2xl` (40px) is reserved exclusively for outer dark bands and hero containers, preventing card bubble distortion while satisfying the 6-step hierarchy. |
| 5 | **Card Hover & Elevation** | `high-end-visual-design` and `gpt-taste` recommend 4px-8px card lift with deep shadows on all interactive cards | Limits hover lift (2px) exclusively to marketing cards; strictly forbids hover lift on application/workspace cards | **Section 3 (#4) + Impeccable (#3)** | Applied the density & intent distinction: Marketing cards invite exploration with subtle 2px lift + tinted shadow deepen; transactional application workspace cards remain flat and stable (`--shadow-sm`, 0px lift) to maximize data clarity. |
| 6 | **Glassmorphism Scope** | `ui-styling` and `banner-design` allow broad glass cards and backdrop filters | Permits glassmorphism in exactly 3 locations (sticky header after scroll, persistent sticky bar, marketing caption overlays) | **Accessibility (#1) + Section 3 (#4)** | Glass is strictly restricted to the 3 permitted surfaces. Base opacity >= 0.72, blur <= 20px, with mandatory opaque fallback. Contrast measured at worst-case scroll points to guarantee WCAG 4.5:1 text readability. |
| 7 | **Spring Animation vs Duration Caps** | Apple Design and Emil Kowalski encourage unconstrained natural spring settling | Imposes a strict hard ceiling of 420ms for all animations | **Section 3 (#4) + WCAG Accessibility (#1)** | Tuned all springs (`stiffness: 400, damping: 30`) to settle completely within 340ms-400ms, strictly below the 420ms ceiling. Immediate jump to final state on user scroll/tap or when `prefers-reduced-motion` is active. |

---

### Detailed Conflict Analysis & Audit Trails

#### Conflict 1: Motion Library (`motion` vs `framer-motion` vs `gsap`)
- **Local Sources**: `.agents/skills/animate/SKILL.md`, `.agents/skills/emil-design-eng/SKILL.md`, `.agents/skills/gsap/SKILL.md`.
- **Section 3 Mandate**: §3.5.0 explicitly instructs: `The brief says "Framer Motion." That package name is legacy. Framer Motion became independent and is now published as motion (motion.dev). Install and import accordingly: npm i motion. Do not install framer-motion.`
- **Resolution**: `framer-motion` removed from `package.json`. `motion` v13.1.1 installed. Imports updated to `import { motion, useSpring, useTransform, AnimatePresence } from "motion/react"`. GSAP 3.14+ remains available for complex multi-stage timeline sequencing.

#### Conflict 2: Typography Selection & Fallbacks
- **Local Sources**: `.agents/skills/design-taste-frontend/SKILL.md`, `.agents/skills/high-end-visual-design/SKILL.md`.
- **Section 3 Mandate**: §3.3.1 - Basier Square for display, native `system-ui` for body, zero Inter anywhere.
- **Resolution**: Basier Square OTF font files verified in `/public/fonts/basier-square/` (`BasierSquare-Bold.otf`, `BasierSquare-Medium.otf`, `BasierSquare-Regular.otf`, `BasierSquare-SemiBold.otf`). Metric fallback defined as `General Sans` (also present in `/public/fonts/general-sans/`) and `system-ui`. Inter is banned sitewide.

#### Conflict 3: Restrained Palette for Document Certification
- **Local Sources**: `.agents/skills/stitch-design-taste/DESIGN.md`, `.agents/skills/brandkit/SKILL.md`.
- **Section 3 Mandate**: §3.2.1 - Archival Ink `#080A1F`, Trust Cobalt `#3D57DB`, Warm Brass Seal `#A87A2C` (<=2% budget).
- **Resolution**: Legal and immigration certification requires archival trust. The warm brass seal accent is restricted to certification badges, notary stamps, and acceptance guarantees.

#### Conflict 4: Radius Scale Nuance
- **Local Sources**: `.agents/skills/high-end-visual-design/SKILL.md` (bans rounded-2xl cards), `.agents/skills/industrial-brutalist-ui/SKILL.md` (demands rounded-none).
- **Section 3 Mandate**: §3.6.1 - 6-step radius scale (`--r-xs: 6px` to `--r-2xl: 40px`).
- **Resolution**: Retained the 6-step scale while respecting the anti-pill card principle: cards use 20px (application) and 28px (marketing); 40px is reserved strictly for full-width container bands.

#### Conflict 5: Transactional vs Marketing Card Elevation
- **Local Sources**: `.agents/skills/emil-design-eng/SKILL.md`, `.agents/skills/impeccable/reference/clarify.md`.
- **Section 3 Mandate**: §3.6.4 - Marketing cards get hover lift and shadow deepen; application cards have zero hover lift.
- **Resolution**: In order triage, translation studio, and customer vault, cards are static and architectural. In marketing sections, cards feature interactive 2px lift.

#### Conflict 6: Glassmorphism Bounds & Accessibility
- **Local Sources**: `.agents/skills/banner-design/SKILL.md`, `.agents/skills/ui-styling/references/tailwind-customization.md`.
- **Section 3 Mandate**: §3.7 - Permitted in 3 locations only; text contrast must pass 4.5:1 across all scroll positions.
- **Resolution**: Applied strict glassmorphism rules. Opaque fallback via `@supports not (backdrop-filter: blur(1px))`. Base opacity >= 0.72, blur <= 20px.

#### Conflict 7: Hard Duration Cap on Spring Animations
- **Local Sources**: `.agents/skills/apple-design/SKILL.md`, `.agents/skills/animate/RECIPES.md`.
- **Section 3 Mandate**: §3.5.1 - Hard ceiling of 420ms.
- **Resolution**: All spring animations calibrated with high damping (`damping: 30`) to settle under 380ms. Full bypass under `prefers-reduced-motion: reduce`.