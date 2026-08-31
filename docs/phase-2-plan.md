# Phase 2 Implementation Plan: Marketing Shell & High-Conversion Homepage

## Objectives
1. Implement the global layout shell:
   - **Header (`components/layout/Header.tsx`)**: Strict 5-link navigation (Pricing, How it works, Documents, Languages, Help), responsive mobile drawer with backdrop blur, primary action button "Start translation".
   - **Footer (`components/layout/Footer.tsx`)**: Deep navy `#0A0C2B` background, categorized navigation links, institutional compliance seals (USCIS, ATA, WES, 256-bit encryption), verification portal link.
2. Build the Homepage (`app/page.tsx`):
   - **Hero with Live Dropzone & Instant Quote (`components/marketing/Hero.tsx`)**: Real interactive dropzone (drag & drop, file picker, and direct "Take a photo" camera capture button), real-time pricing estimate, and "Start translation" primary CTA.
   - **How It Works Flow (`components/marketing/HowItWorks.tsx`)**: 4-step process mapped to Ref A with step numbering, icons, and clear micro-copy.
   - **Document Types Bento (`components/marketing/DocumentTypes.tsx`)**: 12 document categories with typical turnaround, receiving agency, and direct start CTA.
   - **Comparison Matrix (`components/marketing/ComparisonTable.tsx`)**: Side-by-side feature and pricing comparison vs RushTranslate, ImmiTranslate, Translayte.
   - **Rejection-Proof Dark Band (`components/marketing/RejectionMoatSection.tsx`)**: Navy `#0B0D2A` container highlighting our 6 rejection-prevention moats.
   - **Trust Metrics & Proof Stats (`components/marketing/TrustStats.tsx`)**: 3-column high-impact stats.
   - **Accordion FAQ (`components/marketing/FAQSection.tsx`)**: Common questions regarding certification, notarization, and USCIS acceptance guarantee.
   - **Full-Width Bottom CTA Panel (`components/marketing/BottomCTA.tsx`)**: Ref B style wide CTA with dropzone trigger.
3. Build the 5 Marketing Pillar Hubs:
   - `/pricing`: Interactive pricing calculator, transparent breakdown, competitor comparison table, add-on pricing.
   - `/how-it-works`: Deep-dive visual walkthrough of the 6 rejection-prevention moats with interactive mockups.
   - `/documents`: Catalog of 12 document types with search, turnaround, and direct translation triggers.
   - `/languages`: 20+ language pairs with script orientation indicators, sample certificates, and turnaround times.
   - `/help`: Support center with FAQ, USCIS compliance guide, and contact options.
4. Verify:
   - Check raw hex (0 errors).
   - Vitest suite green.
   - Next.js build clean with all static pages generated.
