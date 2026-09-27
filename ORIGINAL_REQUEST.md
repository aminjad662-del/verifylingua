# Original User Request

## Initial Request — 2026-09-25T19:23:06Z

Redesign the VerifyLingua certified translation web platform into an Awwwards-caliber, high-density legal-tech application, synthesizing the precision layout and 1px borders of Raycast with the fluid typography, spring physics, and interactive canvas previews of Framer, grounded in reference designs from C:\Users\aminj\Downloads\UI and Refero.design.

Working directory: C:\Users\aminj\Downloads\SAAS 7
Integrity mode: development

References:
- Local design references: C:\Users\aminj\Downloads\UI (refero.design raycast.com.jpg, refero.design framer.com.jpg, refero.design arcade.software.jpg, refero.design spyglass.so.jpg, refero.design programa.design.jpg)
- Refero design patterns: https://refero.design/

## Requirements

### R1. Visual Identity & Landing Page Transformation
- Establish a refined, bespoke design language combining editorial display serif headlines, clean geometric sans body typography, and tabular monospace metadata.
- Implement high-density workspace architecture with crisp 1px borders, subtle tactile surface elevations, and zero generic AI clichés (no purple/cyan gradient mesh, no floating blur orbs, no generic rounded cards).
- Build a hero section featuring an interactive document inspection stage with before/after translation toggle, dynamic magnification loupe, and real-time certification metadata.
- Construct a bento grid architecture spotlighting USCIS 8 CFR § 103.2 compliance, ATA seal integrity, instant court acceptance guarantee, and turnaround timelines.

### R2. End-to-End Funnel & Workbench Modernization
- Intake & Triage (/order/triage): Transform the document intake interface into a professional intake studio with multi-page preview carousels, automated DPI/glare inspection tags, and real-time page count extraction, ensuring zero client-side exceptions.
- Document Translation Studio (/translate): Build a dual-pane split inspection workbench with synchronized smooth-scrolling, OCR segment highlight mapping, font matching indicators, and side-by-side comparison tools.
- Client & Counsel Workspace (/dashboard, /counsel): Provide dense filing tables with live status badges, matter grouping, batch download actions, and real-time processing indicators.

### R3. Micro-Interactions, Spring Physics & Accessibility
- Implement physics-based spring transitions (using Framer Motion and Emil Kowalski motion principles) on interactive dialogs, drawers, and tab switches.
- Provide subtle tactile button press dampening and cursor hover interactions.
- Strictly adhere to WCAG AA contrast standards, visible keyboard focus indicators, and full prefers-reduced-motion compliance.

## Acceptance Criteria

### Design System & Visual Quality
- [ ] Visual styling conforms to the Raycast + Framer fusion: high-density layout, crisp 1px borders, calibrated typography contrast, and subtle tactile states.
- [ ] No generic AI design patterns (no purple/cyan gradients, no ambient blur orbs, no oversized rounded-3xl cards).
- [ ] Fully responsive layouts from 360px mobile viewports to 2560px ultra-wide displays without horizontal overflow or clipping.

### Functional Integrity & Verification
- [ ] Zero client-side exceptions on /order/triage and throughout all funnel stages.
- [ ] The full translation workflow (document upload -> language selection -> translation -> preview -> download) functions seamlessly.
- [ ] All 52 Vitest test files and 325 existing automated tests pass with 100% green.
- [ ] npx tsc --noEmit compiles with 0 errors.
- [ ] Production build succeeds and deploys cleanly to Cloudflare Pages (verifylingua.pages.dev).
