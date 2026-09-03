# VerifyLingua - Shipped Design System & Specification

> **Audience**: Human designers, design engineers, and developers extending VerifyLingua without needing to inspect source code.
> **Standard**: Bespoke, agency-level visual design; WCAG 2.2 AA accessibility; 0 raw hex values in components; 0 default framework styling.

---

## 1. Visual Identity & Brand Voice

VerifyLingua is a specialized certified translation platform for legal, immigration (USCIS), academic, and corporate documents.
Its visual language communicates **archival authority, absolute procedural precision, and calm assurance under high-stakes deadlines**.

### Design Principles
1. **Archival Dignity Over Startup Tech**: Deep navy ink (`#080A1F`) with faint green undertones replaces corporate SaaS blue (`#2563EB`). It evokes legal deeds, archival paper, and official consulates.
2. **Surgical Accent Discipline**: Warm brass gold (`#A87A2C`) is restricted to a strict **maximum 2% pixel budget** per screen, reserved exclusively for notary stamps, certified verification seals, and acceptance guarantees.
3. **Intentional Density Contrast**: Marketing landing surfaces are spacious and editorial (96–176px padding); once inside the translation workspace, the layout shifts to high-density, functional clarity with crisp 1px borders.
4. **Authentic Asymmetry**: Rather than monotonous 3-column cards or 50/50 splits, layouts use asymmetrical column splits (7/5, 5/7) and off-center reading wells to convey bespoke human editorial craft.
5. **No AI Clichés**: Zero purple/cyan gradients, zero floating blurred orbs, zero generic stock photos of smiling suits, and zero default rounded-3xl bubble cards.

---

## 2. Color System & Semantic Tokens

All colors are declared once in `app/globals.css` and consumed via semantic CSS variables.

### 2.1 Color Tokens

| Token Name | Hex Value | Semantic Purpose & Usage Rationale |
|---|---|---|
| `--brand-ink` | `#080A1F` | Foundation ink for primary headings, dark bands, and footer. Archival authority. |
| `--brand-900` | `#0D1130` | Deep container background in dark mode; rich dark border accent. |
| `--brand-800` | `#151B44` | Radial center of dark gradient bands. |
| `--brand-700` | `#24307F` | High-contrast interactive hover state for navy elements. |
| `--brand-600` | `#3145B8` | Primary button hover background. |
| `--brand-500` | `#3D57DB` | Primary action color. Solid fill on primary CTAs. High contrast (>5.8:1 against white). |
| `--brand-400` | `#6480EE` | Subtle active borders, scrollbar thumbs. |
| `--brand-300` | `#93A8F5` | Dark mode muted text and focus halos. |
| `--brand-200` | `#C2CFFA` | Soft decorative borders and selection highlight. |
| `--brand-100` | `#DCE6FF` | Custom text-selection background (`::selection`). |
| `--brand-50` | `#F1F4FF` | Subtle cool tint for pill tags and notification strips. |

### 2.2 Signature Accent: Warm Brass Seal (Max ~2% Screen Pixels)

| Token Name | Hex Value | Semantic Purpose |
|---|---|---|
| `--seal-600` | `#8A6220` | Dark border for notary and authenticity seals. |
| `--seal-500` | `#A87A2C` | Official certified seal icon fill and premium badge text. |
| `--seal-400` | `#C99A47` | Gold highlight in certification gradient sweeps. |
| `--seal-100` | `#F3E4C6` | Warm parchment background for seal badges and notary stamps. |

### 2.3 Atmosphere & Reading Surfaces

| Token Name | Hex Value | Semantic Purpose |
|---|---|---|
| `--parchment-50` | `#FBF9F5` | Warm document paper background for long-form reading wells and document previews. |
| `--lavender-100` | `#E9EBF8` | Secondary atmospheric container fill. |
| `--lavender-50` | `#F4F4FC` | Clean background for marketing section transitions. |
| `--sky-100` | `#D9EBFF` | Low-contrast sky tint for info badges. |
| `--peach-100` | `#F7DFDA` | Warm accent tint for urgency or expedited notices. |

### 2.4 Functional Status Tokens

| Token Name | Foreground | Background | Usage Guidelines |
|---|---|---|---|
| Success | `--status-success: #1F6B5C` | `--status-success-bg: #E7F2EF` | Verified documents, 100% acceptance confirmation. |
| Info | `--status-info: #3D57DB` | `--brand-50: #F1F4FF` | Informational callouts and procedural tips. |
| Warning | `--status-warning: #9A6410` | `--status-warning-bg: #FBF0DC` | Triage alerts (cut-off seal, low res scan). |
| Danger | `--status-danger: #B04343` | `--status-danger-bg: #F9E9E9` | Blocking rejections, invalid file format, failed payment. |

*Rule*: Never indicate status by color alone. Every status element must pair an explicit icon with clear descriptive text.

### 2.5 Named Gradients & Textures
Gradients are declared as named variables and used exclusively for broad atmospheric depth, never on button labels:
- `--gradient-hero`: `radial-gradient(120% 90% at 50% 0%, #F1F4FF 0%, #FBF9F5 55%, #FFFFFF 100%)`
- `--gradient-panel`: `linear-gradient(168deg, #F4F4FC 0%, #FFFFFF 60%)`
- `--gradient-dark-band`: `radial-gradient(90% 140% at 50% -20%, #151B44 0%, #080A1F 70%)`
- `--gradient-seal`: `linear-gradient(135deg, #C99A47 0%, #8A6220 100%)`
- `--grain`: `url("/textures/grain.svg")` (1–3% SVG noise texture overlay on dark bands and hero)

---

## 3. Typography Hierarchy & Micro-Typesetting

### 3.1 Typeface Assignment
- **Display & Headings**: `Basier Square` (licensed OTF files in `/public/fonts/basier-square/`) with fallback to `General Sans` and `system-ui`.
- **Body & Controls**: Native `system-ui` (`-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `Noto Sans`). 0 KB webfont load for instant mobile rendering.
- **Monospace & Clocks**: `Basier Square Mono`, `ui-monospace`, `SF Mono`.
- **Prohibited**: **Inter is strictly banned** across the entire project.

### 3.2 7-Step Fluid Typography Scale

| Step Name | Size Definition | Line Height | Tracking | Purpose |
|---|---|---|---|---|
| `--type-display` | `clamp(3.25rem, 6.5vw, 7rem)` | 0.92 | `-0.035em` | Hero display headline |
| `--type-h1` | `clamp(2.75rem, 5vw, 5rem)` | 0.98 | `-0.03em` | Primary page headings |
| `--type-h2` | `clamp(2.1rem, 3.6vw, 3.5rem)` | 1.06 | `-0.022em` | Section anchors & differentiators |
| `--type-h3` | `clamp(1.6rem, 2.2vw, 2.25rem)` | 1.18 | `-0.015em` | Card titles, accordion questions |
| `--type-lead` | `clamp(1.15rem, 1.5vw, 1.45rem)` | 1.55 | `-0.005em` | Editorial lead copy (max 56ch) |
| `--type-body` | `1.0625rem` (17px) | 1.65 | `normal` | Standard body copy (max 68ch) |
| `--type-small` | `0.9375rem` (15px) | 1.50 | `normal` | Secondary meta, helper hints |
| `--type-caption` | `0.8125rem` (13px) | 1.40 | `+0.06em` | Uppercase eyebrows, table headers |

### 3.3 Typesetting Rules
- **Negative Tracking**: Display and H1 headings must feature tight negative letter-spacing (`-0.035em` to `-0.03em`) to eliminate amateur loose typesetting.
- **Tabular Numerals**: `font-variant-numeric: tabular-nums` on all prices, timestamps, word counts, and order IDs to prevent jitter.
- **Widow & Orphan Elimination**: `text-wrap: balance` on all headings (`h1`–`h6`); `text-wrap: pretty` on lead paragraphs.

---

## 4. Spacing Scale, Grid & Responsive Layouts

### 4.1 Spacing Tokens
- Base unit: `4px` (`--space-unit: 4px`).
- Layout boundaries:
  - Global container: `min(100% - 48px, 1440px)`
  - Reading text well: `min(100% - 48px, 760px)`
  - Mobile gutters: Strict minimum `20px` padding on small viewports.

### 4.2 Controlled Vertical Rhythm
- Desktop section padding alternates across 4 deliberate values: `96px / 128px / 160px / 176px`.
- **Rule**: Two consecutive sections must never share the same vertical padding. Uniform spacing reads as machine-generated; controlled variation reads as deliberate art direction.
- Mobile section padding alternates between `64px / 80px / 96px`.

---

## 5. Border Radius & Layered Brand Elevation

### 5.1 Radius Scale
| Token | Value | Target Elements |
|---|---|---|
| `--r-xs` | `6px` | Chips, tags, micro-badges, status pills |
| `--r-sm` | `10px` | Form inputs, segmented controls, small buttons |
| `--r-md` | `14px` | Standard buttons, toggle switches, dropdowns |
| `--r-lg` | `20px` | Application workspace cards, modal dialogs |
| `--r-xl` | `28px` | Marketing feature cards, hero media frames |
| `--r-2xl` | `40px` | Outer dark container bands, hero wells |

### 5.2 Layered Brand-Tinted Shadows
Every shadow is tinted with the archival ink color (`rgba(8,10,31, ...)`), never neutral muddy grey:
- `--shadow-sm`: `0 1px 2px rgba(8,10,31,.04), 0 1px 3px rgba(8,10,31,.03)`
- `--shadow-md`: `0 2px 4px rgba(8,10,31,.04), 0 6px 16px rgba(8,10,31,.06)`
- `--shadow-lg`: `0 4px 8px rgba(8,10,31,.05), 0 16px 40px rgba(8,10,31,.09)`
- `--shadow-seal`: `0 2px 12px rgba(168,122,44,.18)`

---

## 6. Motion System & Physics

### 6.1 Library & Guardrails
- Implemented using **`motion`** (`motion/react`) v13.1.1.
- **Hard Ceiling**: 420ms maximum animation duration. Motion never gates access to content.
- **Compositor Only**: Animate `transform` and `opacity` exclusively. Never animate layout-triggering properties (`width`, `height`, `top`, `left`, `margin`, `padding`).
- **Cumulative Layout Shift (CLS)**: Strictly < 0.1 sitewide. Final layout space is always reserved up front.
- **Reduced Motion**: Under `prefers-reduced-motion: reduce`, all motion is disabled (allowing only instant state changes or <=120ms opacity fades).

### 6.2 Easing Tokens
- Soft entrance: `--ease-out-soft: cubic-bezier(0.22, 1, 0.36, 1)` (150–250ms)
- Quart surface: `--ease-out-quart: cubic-bezier(0.25, 1, 0.5, 1)` (340–420ms)
- Move / Transition: `--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1)`
- Spring: `--ease-spring: linear(0, .38 8%, .84 20%, 1.04 32%, .99 46%, 1)`

### 6.3 Signature Interactions
1. **Magnetic Buttons**: Applied to primary hero CTAs. Tracks cursor proximity within ~80px, capped at 9px displacement with 0.4x label parallax. Automatically disabled on `@media (pointer: coarse)`.
2. **Scroll Reveals**: Handled via `IntersectionObserver` / `whileInView({ once: true })` with 16px vertical translation and 340ms soft fade.
3. **Stagger Sequences**: 60ms between children, capped at a maximum of 8 items. First paint only.
4. **App Router Page Transitions**: Coordinated in `app/template.tsx` with 420ms enter (`y: 10px -> 0`) and 150ms exit (`y: 0 -> -8px`).
5. **The Signature Celebration Moment**: Sequenced celebratory verification state: morphing progress surface (220ms) -> count-up numeral with tabular-nums (500ms) -> spring settling -> delayed confirming details (150ms) -> single seal gradient sweep (600ms).

---

## 7. Component Language & Specifications

### 7.1 Buttons
- Height: Minimum 44px for touch accessibility.
- Radius: `--r-md` (14px).
- Primary variant: Solid `--brand-500` with white text. Magnetic interaction on desktop. Arrow icon shifts 3px on hover.
- Secondary variant: Solid `--canvas` with 1px `--border-strong` border.
- Loading state: Replaces label with a pulse at identical width (no button resizing during async calls).

### 7.2 Cards
- **Marketing Cards**: `--r-xl` (28px), 1px `--border`, `--shadow-md`, 32–40px padding, subtle 2px hover lift.
- **Workspace Cards**: `--r-lg` (20px), flat, `--shadow-sm`, 24px padding, **no hover lift**.

### 7.3 Forms & Inputs
- Persistent labels positioned above every field. **Placeholder-as-label is strictly prohibited**.
- Radius: `--r-sm` (10px).
- 2px `--focus-ring` (`#3D57DB`) with 2px offset.
- Errors: Rendered with `--status-danger` border + warning icon + explanatory text. Never color alone.
- Mobile kindness: Explicit `inputmode` and `autocomplete` tokens on all form controls.

### 7.4 Permitted Glassmorphism
Glass is strictly restricted to three locations:
1. Sticky site header once scrolled past the hero.
2. Persistent mobile action bar.
3. Caption overlays on marketing imagery.
- *Constraint*: Blur &le; 20px, base opacity &ge; 72%, verified for 4.5:1 text contrast across all scroll positions with an opaque fallback.

---

## 8. Craft Details Checklist

1. **Custom text-selection**: Background `--brand-100`, text `--brand-ink`.
2. **Scrollbars**: Styled on desktop (`--border-strong` thumb, `--surface` track); native on mobile.
3. **Typography**: `text-wrap: balance` on all headings; `text-wrap: pretty` on lead copy.
4. **Anchor links**: `scroll-margin-top: 5.5rem` prevents headings hiding beneath the sticky navigation.
5. **Theme meta**: System `theme-color` specified for both light (`#FFFFFF`) and dark (`#080A1F`) modes.
6. **Focus states**: `:focus-visible` only appears on keyboard navigation, never on mouse click.
7. **Print stylesheet**: Clean print formatting hiding navigation and interactive chrome.
8. **Live Tokens & Motion Lab**: Fully demonstrable on `/dev/tokens`.
