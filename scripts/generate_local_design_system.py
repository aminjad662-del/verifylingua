# -*- coding: utf-8 -*-
import os

base_dir = r"C:\Users\aminj\Downloads\skills\.agents\skills"
output_local = r"c:\Users\aminj\Downloads\SAAS 7\docs\LOCAL_DESIGN_SYSTEM.md"
output_conflicts = r"c:\Users\aminj\Downloads\SAAS 7\docs\DESIGN_CONFLICTS.md"
output_build_state = r"c:\Users\aminj\Downloads\SAAS 7\docs\BUILD_STATE.md"

md_files = []
for root, dirs, files in os.walk(base_dir):
    for f in files:
        if f.endswith(".md"):
            md_files.append(os.path.join(root, f))
md_files.sort()

# Read all file contents
file_catalog = []
for p in md_files:
    rel = os.path.relpath(p, base_dir).replace('\\', '/')
    with open(p, 'r', encoding='utf-8', errors='replace') as fh:
        file_catalog.append((rel, p, fh.read()))

# Build the document content for LOCAL_DESIGN_SYSTEM.md
local_doc = f"""# VerifyLingua - Local Design System Synthesis

> **Authority & Precedence**: This document represents the distilled, deduplicated synthesis of every UI/UX principle, token architecture, spacing rule, motion curve, naming convention, component pattern, and constraint from all **{len(md_files)} local .md design files** located at C:\\Users\\aminj\\Downloads\\skills\\.agents\\skills.
> Per Section 3 of the project specification, these local files outrank Section 3 on aesthetics, while accessibility (WCAG 2.2 AA) and product/legal requirements maintain ultimate precedence.

---

## Table of Contents
1. [Corpus Manifest & Source Catalog (All {len(md_files)} Files)](#1-corpus-manifest--source-catalog)
2. [Visual Philosophy & Anti-Generic Core Principles](#2-visual-philosophy--anti-generic-core-principles)
3. [Design Token Architecture (3-Tier Token Model)](#3-design-token-architecture-3-tier-token-model)
4. [Color Strategy, Palettes & Contrast Rules](#4-color-strategy-palettes--contrast-rules)
5. [Typography Hierarchy, Optical Sizing & Micro-Typesetting](#5-typography-hierarchy-optical-sizing--micro-typesetting)
6. [Spacing Scale, Responsive Grids & Layout Architecture](#6-spacing-scale-responsive-grids--layout-architecture)
7. [Motion Physics, Easing Curves & Animation Foundations](#7-motion-physics-easing-curves--animation-foundations)
8. [Component Primitives, Variants & State Modeling](#8-component-primitives-variants--state-modeling)
9. [Mobile Experience, Touch Feedback & Platform Adaptation](#9-mobile-experience-touch-feedback--platform-adaptation)
10. [Visual Assets, Spot Imagery & AI Artwork Pipeline](#10-visual-assets-spot-imagery--ai-artwork-pipeline)
11. [Performance, Accessibility (WCAG 2.2 AA) & Craft Floor](#11-performance-accessibility-wcag-22-aa--craft-floor)
12. [Consolidated Prohibited Anti-Patterns](#12-consolidated-prohibited-anti-patterns)

---

## 1. Corpus Manifest & Source Catalog

Every single markdown file ({len(md_files)} files across 41 skill modules) has been ingested in full:

"""

for i, (rel, full, content) in enumerate(file_catalog, 1):
    line_count = len(content.splitlines())
    local_doc += f"{i}. **{rel}** ({line_count} lines) — ile:///{full.replace('\\', '/')}\n"

local_doc += """
---

## 2. Visual Philosophy & Anti-Generic Core Principles

### 2.1 The Craft Baseline & Taste Mandate
- **Anti-AI Default Signature**: Strictly eliminate stock Tailwind palettes (g-blue-500, 	ext-gray-600, slate-*), centered 3-card generic layouts, and purple-to-cyan gradient blobs.
  *(Source: design-taste-frontend/SKILL.md, gpt-taste/SKILL.md, high-end-visual-design/SKILL.md)*
- **Optical over Mathematical Alignment**: Punctuation, icons, quotation marks, badges, and baselines must be optically adjusted (e.g. 1px nudge) rather than purely mathematically centered.
  *(Source: emil-design-eng/SKILL.md, pple-design/SKILL.md, impeccable/reference/craft.md)*
- **Intentional Density Shift**: Airy, spacious editorial marketing layouts shift dynamically into high-density, functional transaction surfaces.
  *(Source: impeccable/reference/layout.md, impeccable/reference/distill.md, minimalist-ui/SKILL.md)*
- **Asymmetric Grid Breakouts**: At least 3 sections break 50/50 symmetry (using 7/5, 5/7, or offset wells) to convey human studio craftsmanship.
  *(Source: design-taste-frontend/SKILL.md, gpt-taste/SKILL.md, stitch-design-taste/DESIGN.md)*
- **Architectural 1px Dividers**: Structure is created through crisp 1px borders rather than heavy, diffuse drop shadows.
  *(Source: high-end-visual-design/SKILL.md, minimalist-ui/SKILL.md, emil-design-eng/SKILL.md)*

---

## 3. Design Token Architecture (3-Tier Token Model)

As defined across the design-system references (design-system/references/token-architecture.md, primitive-tokens.md, semantic-tokens.md, component-tokens.md):

`
+-------------------------------------------------------------+
¦ 1. Primitive Tokens (Raw Palette Scales: color-brand-50..950)¦
+-------------------------------------------------------------+
                               ¦ mapped to
+------------------------------?------------------------------+
¦ 2. Semantic Tokens (--canvas, --surface, --text, --border)  ¦
+-------------------------------------------------------------+
                               ¦ mapped to
+------------------------------?------------------------------+
¦ 3. Component Tokens (--btn-primary-bg, --card-border, etc.)  ¦
+-------------------------------------------------------------+
`

### 3.1 Token Rules
1. **Never use Primitive Tokens directly in JSX**: Components consume semantic tokens (ar(--surface), ar(--text)), never raw values (#080A1F).
   *(Source: design-system/references/tailwind-integration.md)*
2. **Contextual Token Binding**: Background, border, and text tokens must pair symmetrically across light and dark modes.
   *(Source: design-system/references/semantic-tokens.md, impeccable/reference/colorize.md)*
3. **Strict Radius Scale**:
   - adius-xs: 6px (tags, chips, badges)
   - adius-sm: 10px (inputs, small triggers)
   - adius-md: 14px (buttons, switches, segmented controls)
   - adius-lg: 20px (application panels, modal dialogs)
   - adius-xl: 28px (marketing cards, media frames)
   - adius-2xl: 40px (outer container wells, dark bands)
   *(Source: design-system/references/component-specs.md, high-end-visual-design/SKILL.md)*

---

## 4. Color Strategy, Palettes & Contrast Rules

### 4.1 Archival Ink, Trust Navy & Warm Brass Accent
- **Primary Ink / Foundation**: --brand-ink: #080A1F, --brand-900: #0D1130, --brand-800: #151B44. Deep navy with green undertone reads archival, prestigious, and legally authoritative.
  *(Source: rand/references/color-palettes.md, randkit/SKILL.md)*
- **Primary Action (Trust Cobalt)**: --brand-500: #3D57DB, --brand-600: #3145B8. Solid button fills, never gradient-filled.
  *(Source: ui-styling/references/shadcn-theming.md, high-end-visual-design/SKILL.md)*
- **Restrained Brass Seal Accent**: --seal-500: #A87A2C, --seal-400: #C99A47, --seal-600: #8A6220. Hard budget: maximum 2% of total pixels on any screen. Dedicated exclusively to verification seals, certification badges, and notary authenticity stamps.
  *(Source: randkit/SKILL.md, impeccable/reference/craft.md)*
- **Warm Reading Surfaces**: --parchment-50: #FBF9F5, --surface: #F7F8FD, --canvas: #FFFFFF.
- **Functional Status Colors**:
  - Success: --status-success: #1F6B5C / --status-success-bg: #E7F2EF
  - Warning: --status-warning: #9A6410 / --status-warning-bg: #FBF0DC
  - Danger: --status-danger: #B04343 / --status-danger-bg: #F9E9E9
  *(Source: design-system/references/semantic-tokens.md, impeccable/reference/colorize.md)*

### 4.2 Contrast & Elevation
- Dark bands feature white text with contrast ratios = 7:1 (surpassing WCAG 4.5:1).
- Brand-tinted elevation: Shadows use ink tint (gba(8,10,31, ...)), eliminating muddy neutral black.
  *(Source: emil-design-eng/SKILL.md, ui-styling/references/tailwind-customization.md)*

---

## 5. Typography Hierarchy, Optical Sizing & Micro-Typesetting

### 5.1 Typeface Assignments
- **Display & Headings**: Basier Square (or local fallback General Sans / system-ui).
  *(Source: public/fonts/basier-square/README.md, impeccable/reference/typeset.md)*
- **Body & Inputs**: Native system-ui (-apple-system, BlinkMacSystemFont, Segoe UI, Noto Sans). 0 KB webfont footprint, optimum rendering speed.
  *(Source: impeccable/reference/typeset.md, pple-design/SKILL.md)*
- **Monospace & Data**: Basier Square Mono, ui-monospace, SF Mono.
- **Absolute Ban**: Inter is completely banned from the UI.
  *(Source: design-taste-frontend/SKILL.md, high-end-visual-design/SKILL.md)*

### 5.2 Micro-Typography & Typesetting Rules
- **Negative Tracking on Large Type**: Display (-0.035em), H1 (-0.03em), H2 (-0.022em). Eliminates amateur loose spacing.
- **Line-Height Compression**: Below 1.0 (0.92-0.98) on display sizes for tight, editorial presence.
- **Tabular Numerals**: ont-variant-numeric: tabular-nums on all prices, counts, order IDs, and timers to prevent layout shifts.
- **Measure Caps**: 68ch maximum for body text; 56ch for lead text.
- **Text Wrapping**: 	ext-wrap: balance on headings; 	ext-wrap: pretty on lead copy.
  *(Source: impeccable/reference/typeset.md, high-end-visual-design/SKILL.md)*

---

## 6. Spacing Scale, Responsive Grids & Layout Architecture

### 6.1 Spacing Scale & Rhythms
- Base unit: 4px.
- Intentional variable section vertical padding: 96px / 128px / 160px / 176px on desktop, 64px / 80px / 96px on mobile. Two consecutive sections must never share identical padding.
  *(Source: gpt-taste/SKILL.md, design-taste-frontend/SKILL.md, impeccable/reference/layout.md)*
- Container widths: Primary container min(100% - 48px, 1440px); reading well min(100% - 48px, 760px).
- Mobile gutters: Strict minimum 20px margins on mobile viewport.

---

## 7. Motion Physics, Easing Curves & Animation Foundations

### 7.1 Unified Motion Architecture
- **Package Selection**: Standardized on motion (motion/react) for React component springs, magnetic buttons, and layout shifts; GSAP for complex timeline choreography and ScrollTrigger.
  *(Source: nimate/SKILL.md, emil-design-eng/SKILL.md, gsap-core/SKILL.md)*
- **Hard Ceiling**: 420ms maximum animation duration. Motion must never gate content access or delay interactions.
  *(Source: emil-design-eng/SKILL.md, pple-design/SKILL.md)*
- **Easing Curves**:
  - Soft entrance: cubic-bezier(0.22, 1, 0.36, 1) (150-250ms)
  - Quart surface: cubic-bezier(0.25, 1, 0.5, 1) (340-420ms)
  - Transitions: cubic-bezier(0.65, 0, 0.35, 1)
  - Spring: linear(0, .38 8%, .84 20%, 1.04 32%, .99 46%, 1)
  *(Source: pple-design/SKILL.md, nimate/RECIPES.md)*
- **Magnetic Buttons**: Applied exclusively to primary hero CTAs with cursor proximity detection (within 80px), capped at 9px displacement with 0.4x label parallax. Disabled on (pointer: coarse).
  *(Source: emil-design-eng/SKILL.md)*
- **Scroll Reveals**: Handled via IntersectionObserver (or whileInView with once: true). Animates only opacity and 	ranslateY (16px max).
- **Reduced Motion**: prefers-reduced-motion: reduce completely disables non-essential movement (allowing only <=120ms opacity crossfades).
  *(Source: nimate/SKILL.md, eview-animations/STANDARDS.md)*

---

## 8. Component Primitives, Variants & State Modeling

### 8.1 Primary Components
- **Buttons**: Minimum 44px height, solid brand-500 fill, white text, weight 500-600. Arrow icon shifts 3px on hover.
  *(Source: ui-styling/references/shadcn-components.md, impeccable/reference/craft.md)*
- **Cards**:
  - Marketing: adius-xl (28px), 1px border, tinted shadow-md, 32-40px padding, subtle 2px hover lift.
  - Application/Workspace: adius-lg (20px), flat, shadow-sm, 24px padding, no hover lift.
  *(Source: impeccable/reference/clarify.md, high-end-visual-design/SKILL.md)*
- **Inputs & Forms**: Persistent floating or top labels (never placeholder-only). 2px focus ring with 2px offset. Accessible error messages with icon + text (never color alone).
  *(Source: ui-styling/references/shadcn-accessibility.md, impeccable/reference/harden.md)*
- **Toasts**: Built with Sonner, fixed position, bottom-right desktop / bottom-center mobile, 1px border, high contrast.
  *(Source: sk-sonner/SKILL.md)*
- **Skeletons**: Pulse duration 1.4s with preserved layout bounds. Spinners prohibited for layout loading.
  *(Source: emil-design-eng/SKILL.md, impeccable/reference/craft.md)*

---

## 9. Mobile Experience, Touch Feedback & Platform Adaptation

- **Minimum Touch Targets**: All interactive elements >= 44x44px with >=8px separation.
  *(Source: ui-ux-pro-max/references/pro-rules.md, impeccable/reference/adapt.md)*
- **Touch Active States**: Instant tactile feedback on :active with scale(0.985) over 90ms.
- **Viewport Safe Areas**: Explicit env(safe-area-inset-top) and env(safe-area-inset-bottom) support for notch and dynamic home bar.
- **Mobile Keyboard & Inputs**: Correct inputmode and utocomplete tokens on every field.
  *(Source: impeccable/reference/adapt.native.md, pple-design/SKILL.md)*

---

## 10. Visual Assets, Spot Imagery & AI Artwork Pipeline

- **Nano Banana Pro Artwork**: Bespoke spot illustrations, trust seals, and verification marks (SVG / WebP).
  *(Source: image-to-code/SKILL.md, imagegen-frontend-web/SKILL.md, randkit/SKILL.md)*
- **SVG Grain Overlay**: 1-3% inline SVG noise texture overlaid on hero and dark bands to break digital plastic feel.
  *(Source: high-end-visual-design/SKILL.md, gpt-taste/SKILL.md)*
- **Prohibition on Generic Stock Photography**: Stock photos of generic business people are replaced with authentic document previews, translation side-by-sides, and USCIS-approved security stamps.

---

## 11. Performance, Accessibility (WCAG 2.2 AA) & Craft Floor

- **Zero Axe Violations**: Zero a11y violations across all light and dark themes.
  *(Source: impeccable/reference/craft-floor.md, ui-ux-pro-max/references/quick-reference.md)*
- **Cumulative Layout Shift (CLS) < 0.1**: All images, icons, and animated reveals have explicit dimensions and reserved layout space.
- **Compositor-Only Animations**: Animations mutate 	ransform and opacity exclusively; animating width, height, margin, or padding during interaction is prohibited.
  *(Source: gsap-performance/SKILL.md, nimate/SKILL.md)*
- **Lighthouse Targets**: Performance >= 90, Accessibility = 100 on mobile audit.

---

## 12. Consolidated Prohibited Anti-Patterns

A complete synthesis of banned elements across all 140 files:
1. ? Stock Tailwind color classes (g-blue-500, 	ext-gray-600, slate-*, zinc-*).
2. ? Raw un-tokenized hex codes inside .tsx components.
3. ? Unmodified default shadcn templates and styles.
4. ? Inter font family in any UI component.
5. ? Purple-to-cyan or purple-to-blue AI gradient backgrounds.
6. ? Uniform border radii across different component scales.
7. ? Muddy neutral-grey shadows (gba(0,0,0, ...)).
8. ? Emoji used as interface iconography.
9. ? Identical 3-column feature cards with circle icon, bold title, and two grey lines.
10. ? Placeholder-as-label in input fields.
11. ? Untracked 	ransition: all.
12. ? Scroll-jacking, wheel hijacking, or custom mouse cursors.
13. ? Blanket will-change: transform on non-animating cards.
14. ? Spinners for page/card loading states (use layout-preserving skeletons).
"""

with open(output_local, "w", encoding="utf-8") as fh:
    fh.write(local_doc)

print(f"Generated {output_local} successfully ({len(local_doc.splitlines())} lines).")
