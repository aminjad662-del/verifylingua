# LOCAL DESIGN CONTEXT (Ingested from `C:\Users\aminj\Downloads\skills\.agents\skills`)

**Ingested:** 2026-09-02  
**Authority:** Binding constraints, equal in authority to Phase 2 Brief. All UI work must adhere to these extracted principles.

---

## 1. Directory Ingestion Audit

- **Source Directory:** `C:\Users\aminj\Downloads\skills\.agents\skills`
- **Skills Detected & Analyzed (41 total):**
  - `animate`, `animate-expo`, `animation-vocabulary`, `apple-design`, `ask-sonner`, `banner-design`, `brand`, `brandkit`, `design`, `design-system`, `design-taste-frontend`, `design-taste-frontend-v1`, `emil-design-eng`, `find-animation-opportunities`, `full-output-enforcement`, `gpt-taste`, `gsap-core`, `gsap-frameworks`, `gsap-performance`, `gsap-plugins`, `gsap-react`, `gsap-scrolltrigger`, `gsap-timeline`, `gsap-utils`, `high-end-visual-design`, `image-to-code`, `imagegen-frontend-mobile`, `imagegen-frontend-web`, `impeccable`, `improve-animations`, `industrial-brutalist-ui`, `minimalist-ui`, `pick-ui-library`, `prototype`, `redesign-existing-projects`, `review-animations`, `slides`, `stitch-design-taste`, `ui-styling`, `ui-ux-pro-max`, `write-swift`.

---

## 2. Core Philosophy & Design Engineering Principles

### 2.1 The Craft Sensibility (Emil Kowalski Philosophy)
1. **Taste is trained, not innate:** Reverse-engineer animations, inspect interactions, study why the best interfaces feel effortless.
2. **Unseen details compound:** "All those unseen details combine to produce something that's just stunning, like a thousand barely audible voices all singing in tune." (Paul Graham).
3. **Beauty is leverage:** In a world where software is functional enough, taste, tactile defaults, and micro-physics are the real differentiators.

### 2.2 Apple Fluid Interfaces (WWDC Philosophy)
1. **Immediate Response:** Respond on pointer-down (touch-down/press), never on release. Latency kills the illusion of direct manipulation.
2. **Direct Manipulation:** Track 1:1 with pointer, respect the grab offset. Use pointer capture (`setPointerCapture`) so dragging continues if the cursor leaves bounds.
3. **Interruptibility:** Animate from the *presentation* (current live) value, never the target value. Never lock out user input during transitions.
4. **Behavior over Scripted Animation:** Use springs instead of fixed-duration ease curves for touch/gesture interactions.
5. **Momentum Projection:** Animate to where the gesture is *going* using exponential momentum decay (`project(velocity) = (v/1000) * d / (1-d)` with `d ≈ 0.998`).
6. **Spatial Consistency:** Elements must enter and exit along the same path. Popovers scale from their trigger, not the screen center.

---

## 3. Strict Anti-Patterns & Absolute Bans ("Absolute Zero")

The following patterns represent the typical generic "AI SaaS" look and are **strictly prohibited**:
1. **Banned Body Fonts:** Inter, Roboto, Arial, Open Sans, Helvetica for body copy. (Body text must use the native OS `system-ui` stack).
2. **Banned Heading Serifs as Defaults:** `Fraunces` and `Instrument Serif` (the two default LLM display serifs) are banned unless specifically mandated by brand identity.
3. **Banned Colors & Gradients:**
   - No generic purple/cyan/blue "AI glow" or neon gradient blobs.
   - No raw hex values in `.tsx` files (enforced by `check-raw-hex.js`).
   - No pure-black drop shadows (`rgba(0,0,0,0.3)`); shadows must be soft, warm-tinted, low-opacity (<0.05).
   - No primary colored full-width backgrounds (no saturated solid red/blue/green hero banners).
4. **Banned Motion Patterns:**
   - **NO `transition: all`:** Always name exact properties (e.g., `transition: transform 160ms ease-out, opacity 160ms ease-out`).
   - **NO `transform: scale(0)` on entry:** Nothing disappears to nothing in physical reality. Always start from `scale(0.95)` with `opacity: 0`.
   - **NO `ease-in` on UI elements:** Starts too slow; always use `ease-out` or custom spring/cubic-bezier curves.
   - **NO animation on keyboard-initiated actions:** Actions repeated 100+ times/day (command palette, hotkeys) must open instantly with 0ms delay.
   - **NO animating layout-triggering properties:** Never animate `width`, `height`, `top`, `left`, `margin`, or `padding`. Animate exclusively via GPU-accelerated `transform` and `opacity`.
   - **NO `window.addEventListener('scroll')`:** Causes continuous reflows; use `IntersectionObserver` or Framer Motion `whileInView({ once: true })`.
5. **Banned Layout Patterns:**
   - No 4+ line wrapped hero headlines. Containers must be wide (`max-w-5xl` or `max-w-6xl`).
   - No dead/empty cells in bento grids (`grid-flow-dense` required).
   - No cheap meta-labels ("SECTION 01", "QUESTION 05").
   - Max 1 eyebrow label per 3 sections (banning the AI cliché of uppercase tracking tags on every single block).
   - No duplicate CTA intent across the same view (e.g., do not mix "Get Started" and "Start Now" and "Contact Us" on the same screen).

---

## 4. Typography Identity & Hierarchy

### 4.1 Headings (`h1`–`h6`, Display, Buttons, Navigation)
- **Primary Specification:** `Basier Square` (Commercial font).
- **Temporary Free Licensed Fallback:** `General Sans` (Fontshare / Indian Type Foundry) — chosen for its closed apertures, geometric proportions, and identical metric width to Basier Square. Marked clearly as `TEMP FALLBACK — replace with Basier Square when licensed files are provided`.
- **Display / Hero Scale:** `clamp(3rem, 6vw, 6.5rem)`, Bold/SemiBold, tracking `-0.02em` to `-0.04em`, line-height `0.95–1.05`.
- **Section Headline Scale:** `clamp(2.25rem, 4vw, 4rem)`, SemiBold, tracking `-0.025em`.
- **Card / Subsection Headline Scale:** `1.5–2rem`, Medium/SemiBold.

### 4.2 Body Text & UI Copy
- **Native OS System Stack:**
  ```css
  --font-body: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  ```
- **RTL / Arabic Fallback:** `-apple-system, "Geeza Pro", "Arabic Typesetting", "Amiri", "Segoe UI", Tahoma, sans-serif`.
- **CJK Fallback:** `-apple-system, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif`.
- **Body Scale:** 16–18px, line-height 1.6–1.7, never below 15px. Text color soft charcoal/ink (`--ink-soft`), never pure `#000000`.
- **Tabular Numerals:** All prices, counts, timestamps, and statistics MUST enforce `tabular-nums` / `font-mono`.

---

## 5. Motion Tokens & Physics Presets

### 5.1 Custom Easing Curves
```css
/* Emil Kowalski / Apple standard curves */
--ease-out: cubic-bezier(0.23, 1, 0.32, 1);       /* Strong snappy ease-out for UI feedback */
--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);   /* Natural acceleration/deceleration for movement */
--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);    /* High-end fluid sheet/drawer curve */
```

### 5.2 Spring Configurations
- **Default UI Spring (Critically Damped, Zero Overshoot):**
  `{ type: "spring", duration: 0.4, bounce: 0 }` (or `damping: 1.0, stiffness: 100`)
- **Momentum / Flick Spring (Gentle Bounce):**
  `{ type: "spring", duration: 0.4, bounce: 0.15 }` (or `damping: 0.8, response: 0.35`)
- **Magnetic Button Pull:**
  `useSpring(mouseOffset, { stiffness: 150, damping: 15, mass: 0.1 })`

### 5.3 Duration Scale
- Button press / active feedback: `100–160ms`
- Tooltips / popovers: `125–200ms`
- Dropdowns / selects: `150–250ms`
- Modals / drawers / sheets: `200–350ms`
- Scroll reveal: `400–600ms`

### 5.4 Mandatory Accessibility Guardrails
- Every animation MUST check `prefers-reduced-motion`. In reduced motion mode, drop all `transform` translates/scales and keep subtle opacity cross-fades only.
- Gated hover states: `@media (hover: hover) and (pointer: fine)` to prevent stuck hover states on touch screens.

---

## 6. Component Architecture (Patterns over Generic Markup)

### 6.1 `<MagneticButton>` Primitive
- Wraps primary interactive CTAs.
- Uses Framer Motion's `useMotionValue` and `useSpring` completely outside the React render loop (never `useState`).
- Pulls 6–10px toward the pointer within its hover radius, resetting smoothly on mouse leave.
- Has an active pressed state: `scale(0.97)` on `:active`.

### 6.2 The "Double-Bezel" (Doppelrand) Card Architecture
- Avoids flat cards on flat backgrounds.
- **Outer Shell:** Subtle wrapper with border/ring (`p-1.5` to `p-2`, `rounded-[28px]`, `bg-surface-raised/60`, `border border-border/80`).
- **Inner Core:** Concentric inner container (`rounded-[calc(28px-0.375rem)]`, `bg-surface`, `shadow-sm`).

### 6.3 Refined Glassmorphism (Translucent Chrome)
- Reserved strictly for sticky navigation bar, floating quote/price-lock cards, and modals.
- Formula: `backdrop-blur-xl bg-surface/80 border-b border-border/60` with a subtle top hairline highlight `shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]`.
- Never stack multiple translucent layers on top of each other.

### 6.4 Spacing Scale & Macro-Whitespace
- Base 8px scale (`8px, 16px, 24px, 32px, 48px, 64px, 96px, 128px`).
- Section vertical rhythm:
  - Desktop: `py-24` to `py-36` (`96px` to `144px`).
  - Mobile: `py-16` to `py-20` (`64px` to `80px`).
- Maximum layout container: `max-w-7xl mx-auto px-6`.

---

## 7. New Reference Structural Patterns (from `media_1788371571487.jpg`)

1. **Competitor Comparison Matrix (`/compare/[competitor]`):**
   - Data-driven comparison table comparing VerifyLingua against ImmiTranslate, RushTranslate, and Translayte.
   - Grouped into capability categories: Core Certification & Legal Compliance, Quality & AI Triage, Turnaround & Speed, Pricing & Guarantees.
   - Status indicators: Checkmark (green), Cross (red), Partial/Warning (amber).
2. **Dark "How It Works" Band with Embedded Product-UI Mockup:**
   - High-contrast dark navy container (`bg-brand-ink`), radial subtle glow.
   - Embedded real interactive product-UI mockup card (Triage, Word Count verification, Live Translation Preview).
3. **Three-Stat Proof Band:**
   - Large numbers, clear labels, colored trend arrows, no fake statistics.
4. **Institutional Category Leader & Badges:**
   - Genuine ATA Corporate Member, USCIS 8 CFR Compliance, 256-Bit Cryptographic Vault, Court/University acceptance badges.
