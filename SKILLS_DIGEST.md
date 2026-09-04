# SKILLS DIGEST & DESIGN INTELLIGENCE REPORT
**Project:** VerifyLingua (High-Fidelity Document Translation & Certification Platform)  
**Author:** Principal Design Engineer & Founding Architect  
**Harness Standards:** `Leonxlnx/taste-skill`, `emilkowalski/skill`, `impeccable 4.1.2`, `ui-ux-pro-max`, `gsap-skills`  
**Visual Anchors:** Reference 1 (Synthesia Community) & Reference 2 (Sunsama)

---

## 1. Executive Summary & Design Law
This document establishes the binding architectural and aesthetic constraints for the elevation of VerifyLingua. The existing site is recognized as a complete design structure; this work elevates it into a world-class, human-crafted product. Every design decision, motion curve, layout token, and cryptographic pipeline rule is articulated below before touching any production source code.

---

## 2. Ingested Skills & Deep Behavioral Digest

### A. Emil Kowalski Motion & UI Polish (`emil-design-eng`, `animate`, `apple-design`, `ask-sonner`)
#### 1. Core Rules (In Own Words)
- **Zero-Accidental Motion**: Motion must answer "why does this animate?" Keyboard shortcuts, command palettes, and actions triggered 100+ times per day must never animate. Modals, drawers, and toasts animate with spatial logic.
- **Custom Easing Over CSS Defaults**: Built-in `ease`, `linear`, and especially `ease-in` are strictly prohibited for UI interactions. Always use high-punch curves: `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)` or iOS drawer curve `--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1)`. `ease-in` makes UI feel delayed and sluggish.
- **Tactile Button Feedback**: Every pressable element must scale down on `:active` (`scale(0.97)` to `scale(0.98)`) with snappy 100–160ms feedback.
- **Never Animate from `scale(0)`**: Real-world matter never expands from zero. Entrances must scale from `scale(0.95)` with `opacity: 0` to `scale(1)` with `opacity: 1`.
- **Origin-Aware Popovers**: Dropdowns and popovers must scale out from their trigger (`transform-origin: var(--transform-origin)`), not from center (modals remain centered).
- **Asymmetric Timing**: Pressing/deciding can be deliberate, but system response and dismissals must be fast and snappy (exit faster than enter).
- **GPU-Only Property Budget**: Animate exclusively `transform` and `opacity`. Never animate `width`, `height`, `margin`, or `padding`.
- **Respect `prefers-reduced-motion`**: Retain opacity and color transitions for cognitive clarity, but eliminate positional translation and heavy movement.
- **Hover Gating**: Always protect hover transitions behind `@media (hover: hover) and (pointer: fine)` to prevent stuck states on iOS/Android touch displays.

#### 2. Specific Rules Applied to VerifyLingua
- **Upload Zone Hero Moment**: The dropzone will feature an origin-aware, spring-interpolated drag-over state, active compression (`scale(0.98)`), and an authentic scanning progress bar that scales along `transform: scaleX()` rather than layout width.
- **Interactive Buttons**: Primary CTA buttons ("Start Translation", "Upload File", "Download Translation") use `:active:scale-[0.97]` with 150ms custom bezier transitions.
- **Staggered Entrances**: Document type tiles, comparison table rows, and FAQ accordions stagger with 40ms delays.
- **Toasts & Feedback**: Sonner-style notifications for upload progress, clipboard copy, and download readiness with hardware-accelerated transforms.

#### 3. Codebase Landing Locations
- `components/marketing/Hero.tsx` (Upload zone physics, spring drag states)
- `components/marketing/CertifiedSampleShowcase.tsx` (Interactive comparison slider with hardware-accelerated clip-path)
- `components/ui/button.tsx` (Universal `:active:scale-[0.97]` and transition tokens)
- `app/globals.css` (Custom bezier easing variables: `--ease-out-expo`, `--ease-spring-snappy`)

---

### B. Taste-Skill & High-End Visual Design (`Leonxlnx/taste-skill`, `high-end-visual-design`, `stitch-design-taste`)
#### 1. Core Rules (In Own Words)
- **The Absolute Zero Directive**: Strictly ban generic AI tropes: Inter/Roboto/Arial as default sans, harsh dark shadows (`shadow-md`, `rgba(0,0,0,0.3)`), generic 1px solid cold-gray borders, purple/cyan background orbs, and symmetrical boring 3-column feature grids without whitespace.
- **Double-Bezel Architecture (Doppelrand)**: High-end surfaces do not sit flat. They use nested enclosures: an outer shell with subtle backdrop tint, hairline perimeter ring, and generous padding (`p-1.5` to `p-2`), encasing an inner core with concentric border-radius (`calc(outer_radius - padding)`) and subtle inset specular highlight.
- **Nested "Button-in-Button" CTA**: Action buttons with trailing arrows or icons wrap the icon in a distinct circular pill container (`w-7 h-7 rounded-full bg-white/15 flex items-center justify-center`) that animates with kinetic tension on hover (`group-hover:translate-x-1 group-hover:-translate-y-[0.5px]`).
- **Macro-Whitespace & Breathing Room**: Expand section spacing (`py-24` to `py-36`). Let typography and documents breathe.
- **Contrast & Material Authenticity**: Soft structuralism with warm cream or crisp paper canvas tones, paired with ink-black typography and subtle physical paper grain or delicate ambient backdrops.

#### 2. Specific Rules Applied to VerifyLingua
- **Upload Area Container**: Upgraded to double-bezel nested architecture: outer perimeter tray with delicate border, encasing the inner drop target with specular top highlight.
- **Primary Hero CTAs**: Redesigned with nested button-in-button icon architecture and kinetic directional hover transitions.
- **Document Preview Cards**: Rendered as physical high-end documents with 1px crisp borders, subtle offset ambient shadows, and authentic certified stamps.

#### 3. Codebase Landing Locations
- `components/marketing/Hero.tsx` (Double-bezel dropzone & nested CTAs)
- `components/marketing/CertifiedSampleShowcase.tsx` (Double-bezel before/after comparison frames)
- `components/marketing/DarkProductHowItWorks.tsx` (Step cards with high-contrast hardware styling)
- `components/marketing/ComparisonTable.tsx` (Editorial table structure with clear highlight columns)

---

### C. Impeccable Craft & Craft-Floor (`impeccable`, `craft-floor.md`)
#### 1. Core Rules (In Own Words)
- **The Craft Floor Standard**: Every surface is evaluated against strict physical verification:
  - Contrast: Body text ≥4.5:1, large text ≥3:1. Secondary text is tinted from the surface hue, never flat muddy gray.
  - Depth: Shadows must carry intentional offset and soft diffusion. Never use zero-offset colored halos.
  - Spacing: Tight hierarchical grouping, generous separation, significantly more whitespace above a heading than below it.
  - Typography: Body line measure strictly bounded to 60–75ch. Heading tracking between `-0.02em` and `-0.03em`. Display font sizes capped sensibly without line overflow.
- **Refuse List**:
  - Gradient text is prohibited (emphasis comes from weight, size, or dedicated color token).
  - Glass/blur used merely as decoration is banned; blur is reserved for sticky headers and modal backdrops.
  - Colored thick side borders (`border-l-4`) on callouts are banned.
  - Monospace is reserved strictly for codes, hashes, dates, and quantitative metadata (never as a stylistic costume for prose).
  - Emoji as icons are strictly banned; use only uniform SVG linework.
- **Theme Browser Surfaces**: Customize `::selection`, `caret-color`, scrollbars, and focus rings to inherit the brand palette.

#### 2. Specific Rules Applied to VerifyLingua
- **Zero Gradient Text**: All headings in `Hero.tsx`, `CertifiedSampleShowcase.tsx`, and `FAQSection.tsx` utilize solid, authoritative typographic weights with clean brand accent words rather than cheap gradient clip masks.
- **Themed Browser Surfaces**: Added global tokens in `globals.css` for `::selection` (brand blue tint), custom slim scrollbar track, and accessible 2px offset focus rings.
- **Authentic Monospace Metadata**: Bounded to verification codes (`CERT-7X9K2-4821`), SHA-256 hashes, timestamps, and page counts.

#### 3. Codebase Landing Locations
- `app/globals.css` (Browser surface theming: selection, scrollbars, focus visible, typography scales)
- `components/marketing/Hero.tsx` (Typography cleanup, elimination of gratuitous gradient text)
- `components/marketing/FAQSection.tsx` (Dividers, focus rings, typographic contrast)
- `components/marketing/TrustStats.tsx` (Stat counters with tabular numbers `font-mono`)

---

### D. UI/UX Pro Max Intelligence (`ui-ux-pro-max`, `ui-styling`, `design-system`)
#### 1. Core Rules (In Own Words)
- **10-Tier Hierarchy of Decisions**:
  1. Accessibility: Contrast 4.5:1, keyboard navigation, explicit focus rings, aria labels.
  2. Touch & Interaction: Minimum 44×44px interactive tap targets, minimum 8px gap between controls.
  3. Performance: Core Web Vitals, zero layout shifts (CLS < 0.1), explicit image aspect ratios, lazy loading.
  4. Style Selection: Match the product domain (legal/certified translation requires trust, clarity, authority, and clean documentation).
  5. Layout & Responsive: Mobile-first resilience, no horizontal scrollbars, adaptive grid collapsing.
  6. Typography & Spacing: Base 16px font size, 1.5 body line-height, semantic tokens (`text-brand-ink`, `text-text-muted`, `border-border`).
  7. Animation: 150–300ms micro-interactions, meaningful state transitions.
  8. Forms & Feedback: Visible labels, inline contextual error messages, loading indicators.
  9. Navigation: Predictable back navigation, persistent breadcrumbs, clear status cues.
  10. Data & Charts: High clarity, accessible legends, zero color-alone reliance.

#### 2. Specific Rules Applied to VerifyLingua
- **Color Discipline**: Strict enforcement of 0 raw hex values in `.tsx` files; all styles mapped to Tailwind design tokens.
- **Touch Targets**: All buttons, file input triggers, and language dropdowns have minimum 44px tap targets.
- **Form Error Recovery**: The registration and triage forms provide immediate, inline feedback with clear recovery instructions.

#### 3. Codebase Landing Locations
- `components/auth/RegisterForm.tsx` & `components/auth/LoginForm.tsx` (44px inputs, inline error validation)
- `components/order/StickyPriceBar.tsx` (Accessible contrast, sticky layout without CLS)
- `components/layout/Header.tsx` (Mobile touch targets, keyboard accessible dropdowns)

---

### E. GSAP Animation Suite (`gsap-react`, `gsap-scrolltrigger`, `gsap-core`)
#### 1. Core Rules (In Own Words)
- **Scoping & Cleanup with `useGSAP`**: Always wrap React GSAP animations with the `@gsap/react` `useGSAP` hook and supply explicit container refs to guarantee automatic cleanup on unmount and eliminate memory leaks.
- **ScrollTrigger Discipline**: Avoid heavy scrub animations that hijack normal browser scrolling physics. Use `ScrollTrigger` for gentle batch reveals, staggered opacity/transform entrances, and subtle pinned comparisons.
- **Transforms Over Layout**: Always tween `x`, `y`, `scale`, `rotation`, and `autoAlpha` (combines opacity and visibility). Never tween layout properties.
- **Responsive Animations with `gsap.matchMedia()`**: Ensure animations adapt or disable gracefully on mobile screens and respect `prefers-reduced-motion`.

#### 2. Specific Rules Applied to VerifyLingua
- **Hero Reveal Sequence**: Orchestrated entrance timeline: Eyebrow badge → Main Display Headline → Subtext → Double-Bezel Upload Zone → Trust Badges.
- **Document Transformation Visualizer**: Smooth GSAP timeline demonstrating document layout preservation (original document text morphing into translated text while preserving geometric tables, signatures, and stamps).
- **Staggered Feature Scroll Triggers**: Batch animations for the 4-step certified packet process and document grid.

#### 3. Codebase Landing Locations
- `components/marketing/Hero.tsx` (useGSAP orchestrated hero reveal)
- `components/marketing/CertifiedSampleShowcase.tsx` (GSAP comparison slider interaction)
- `components/marketing/DarkProductHowItWorks.tsx` (ScrollTrigger step reveals)

---

## 3. Forensic Analysis of Design References

### Reference 1: Synthesia Community (`media_1788545235739.jpg`)
1. **Color & Lighting**:
   - Clean, luminous white background (`#FFFFFF` / `#FAFAFA`) enriched by a subtle, restrained radial pastel gradient glow behind the hero (soft iris blue blending into warm apricot).
   - High visual contrast: Jet black headings (`#0D111C`) contrasted against crisp tinted interactive accents (`#3B82F6` / `#4F46E5`).
2. **Typography**:
   - Heavy geometric display heading with tight letter tracking (`-0.03em`).
   - Keyword emphasis: Key phrase ("Synthesia Community") highlighted in a saturated, brand-accented color.
   - Restrained body text (16–17px) with generous line height (1.6) for maximum scanability.
3. **Hero Architecture**:
   - Centered headline and value proposition followed by a primary CTA pill.
   - Central visual anchor: A framed, high-definition video/interactive showcase container with rounded corners (`rounded-2xl`), subtle border, and integrated video playback trigger.
4. **Card & Component Vocabulary**:
   - 2×2 feature grid with individual cards featuring:
     - Pure white card body with delicate 1px border.
     - Single-color square icon chips with centered SVG icons.
     - Bold title followed by concise two-line explanation.
5. **Section Breaks & Narrative**:
   - Broad banner callout with soft gradient wash and centered copy.
   - Split-column FAQ: Heavy bold section title on the left, divided accordion with subtle horizontal borders on the right.
6. **Footer**:
   - Dense, high-contrast dark footer (`#0A0E1A`) with organized column hierarchy (Platform, Solutions, Resources, Company) and crisp micro-typography.

### Reference 2: Sunsama (`media_1788545236329.jpg`)
1. **Color & Lighting**:
   - Warm, tactile editorial atmosphere: warm parchment canvas (`#FBF9F5`), charcoal body copy, and warm amber/terracotta accents (`#E05A36` / `#FF7A59`).
   - Muted card fills with high-density physical contrast.
2. **Typography**:
   - Expressive typography with high optical weight.
   - Intentional colored keyword highlights ("modern professionals", "focused", "accomplished") to guide the eye through narrative sentences.
3. **Before & After Structured Comparison**:
   - Two contrasting diagnostic cards side by side:
     - Left (Negative State): "Work is exhausting and chaotic" with red warning badges and pain points.
     - Right (Positive State): "Wake up to a calm, organized workday" with green checkmarks and structured relief.
   - This exact pattern will be applied to VerifyLingua's certified translation comparison (e.g. "Legacy translation agencies: slow, expensive, rejected by USCIS" vs "VerifyLingua: 100% USCIS accepted, layout preserved, instant QR verification").
4. **Workflow Step Cards**:
   - Editorial 3-step journey ("Start each day...", "Stay focused...", "End each day...") accompanied by high-fidelity micro-UI previews.
5. **Feature Matrix & Micro-Illustrations**:
   - "Everything you need, and nothing you don't" — authentic UI previews with real schedules, time blocks, and stats instead of generic icons or abstract placeholders.
6. **Comparison Matrix**:
   - Multi-column comparison table with checkmarks, clear headers, and an elevated highlight column with rounded container styling.

---

## 4. Synthesis & Architectural Strategy for VerifyLingua

| Principle / Area | Before (Current State) | Elevated Target (Synthesia + Sunsama Synthesis) |
|---|---|---|
| **Hero Aesthetic** | Flat blue accent, generic upload box | Luminous canvas with subtle radial glow, double-bezel upload container, and animated document transformation preview. |
| **Upload Experience** | Standard dropzone with simulated analysis | Multi-state interactive dropzone (drag-over, file accepted, parsing, format detection) with real client-side file inspection and instant layout-preserving translation trigger. |
| **Document Translation Engine** | Static order form with mock delivery | Full layout-preserving translation pipeline supporting **PDF, DOCX, PNG, JPG** with run-level XML preservation for DOCX, bounding-box text injection for PDF, and OCR text replacement for images. |
| **Comparison Section** | Standard 3-column table | Sunsama-style side-by-side Before/After diagnostic cards + high-contrast verification matrix. |
| **Interactive Polish** | Basic button hover states | Emil Kowalski `:active:scale-[0.97]`, custom cubic-bezier curves, nested button-in-button arrow pills, and smooth origin-aware popovers. |
| **Registration & Auth** | Functional API and clean forms | Complete end-to-end user vault with session management, order history tracking, password reset, and instant re-download. |

---

## 5. Verification & Acceptance Criteria
1. `SKILLS_DIGEST.md` (this document) permanently records all rules, specific project applications, and forensic reference breakdowns.
2. Every subsequent UI and logic implementation will be validated against this digest, `DECISIONS.md`, and `STATUS.md`.
3. All automated tests pass, zero raw hex violations remain, and the document translation engine accurately round-trips PDF, DOCX, PNG, and JPG documents.
