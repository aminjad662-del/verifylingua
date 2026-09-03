# Architecture & Design Decisions

## 1. Typography Identity (Enforced: Basier Square & San Francisco)
- **Headings (`--font-heading`, `--font-display`):** Bound to `var(--font-basier-square), "Basier Square", "BasierSquare", sans-serif`.
  - Installed genuine **Basier Square** OpenType font binaries directly into `public/fonts/basier-square/`:
    - `BasierSquare-Regular.otf` (400)
    - `BasierSquare-Medium.otf` (500)
    - `BasierSquare-SemiBold.otf` (600)
    - `BasierSquare-Bold.otf` (700)
  - Loaded natively via Next.js `localFont` in `app/layout.tsx` (`--font-basier-square`) and declared via `@font-face` blocks so that all `h1`–`h6`, `.font-display`, and `.font-heading` elements strictly render Basier Square on all devices and OS environments (Windows, macOS, Linux, iOS, Android).
- **Body & UI Font Stack (`--font-body`, `--font-sans`):** Bound to `var(--font-san-francisco), "San Francisco", -apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "SF Pro", "Segoe UI", Roboto, sans-serif`.
  - Authentic Apple SF Pro (San Francisco) WOFF2 font files installed in `public/fonts/san-francisco/`:
    - `SFProDisplay-Regular.woff2` (400)
    - `SFProDisplay-Medium.woff2` (500)
    - `SFProDisplay-Semibold.woff2` (600)
    - `SFProDisplay-Bold.woff2` (700)
  - Loaded natively via Next.js `localFont` in `app/layout.tsx` (`--font-san-francisco`) and declared via `@font-face` blocks.
  - Applied directly to `html`, `body`, `p`, `span`, `li`, `a`, `button`, and input elements.
  - Arabic & CJK fallbacks preserved for internationalization.

## 2. Motion Architecture
- **Primitive:** Created `<MagneticButton>` leveraging Framer Motion's `useMotionValue` and `useSpring` outside the React render loop to pull primary CTAs toward pointer coords with physically springy return-to-rest.
- **Micro-Interactions:** Added `scale(0.97)` on `:active` with `160ms ease-out` for all buttons; cards lift `translateY(-4px)` with shadow deepening on hover.
- **Scroll Reveals:** Staggered viewport entrance via `whileInView` (`once: true`) with `translateY(24px) -> 0` and opacity fade over `500ms ease-out`.

## 3. Hydration & Runtime
- Added `suppressHydrationWarning` to Hero turnaround time (`components/marketing/Hero.tsx`) to fix SSR timestamp mismatch caused by client/server minute tick and timezone resolution differences.
- Fixed `MagneticButton` and motion primitive hydration mismatch (`style={{}}` vs `style={{transform: 'none'}}`) by deferring spring motion attachment to post-mount via `isMounted` check and adding `suppressHydrationWarning`.

## 4. Font Binding & Token Resolution
- **Root Cause:** In `app/globals.css`, a second token block within `@theme` was inadvertently overriding `--font-body` and `--font-sans` with `system-ui, -apple-system...`, omitting `var(--font-san-francisco)` and the `@font-face` definitions for `"San Francisco"`.
- **Resolution:** Re-anchored `--font-body` and `--font-sans` directly to `var(--font-san-francisco), "San Francisco", ...` and declared complete `@font-face` rules for `"San Francisco"` pointing to local `public/fonts/san-francisco/*.woff2` assets. Verified in headless Chrome with `loaded` status across 4 weights.

## 5. Node.js Heap Allocation During Next.js Compilation
- **Root Cause:** When running concurrent Next.js page compilation across 88 App Router routes on Windows, Node.js exceeded its default 1.5GB 32-bit heap limit, triggering `ERR_MEMORY_ALLOCATION_FAILED`.
- **Resolution:** Allocated `--max-old-space-size=4096` in `NODE_OPTIONS`, allowing all 88 static and dynamic routes to compile cleanly with 0 errors.

## 6. Next.js Image Responsive Sizing
- **Root Cause:** Next.js `<Image fill>` without explicit `sizes` triggered browser console warnings and sub-optimal image resource selection.
- **Resolution:** Added precise responsive `sizes` properties to all `<Image fill>` tags across `Hero.tsx`, `CertifiedSampleShowcase.tsx`, `DocumentTypes.tsx`, and `RejectionMoatSection.tsx`. Verified 0 console warnings in Chrome.
