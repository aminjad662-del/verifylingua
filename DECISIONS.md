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
