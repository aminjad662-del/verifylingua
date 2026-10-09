# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
- **Primary Consumers**: Immigration applicants, foreign students, and individuals submitting legal, civil, or academic documents (birth certificates, marriage licenses, academic transcripts, bank statements) to USCIS, universities, courts, or state DMVs. Their situation involves high anxiety over strict deadlines and rejection risks.
- **Enterprise & Legal Counsel**: Immigration attorneys, law firms, and university international student offices managing multiple ongoing client cases ("matters"), requiring bulk uploads, audit trails, and unified billing.
- **Accredited Translators & QA Reviewers**: Professional linguists certified by the American Translators Association (ATA) performing translation, validation, and certification under USCIS 8 CFR § 103.2(b)(3).

## Product Purpose
VerifyLingua is an autonomous and certified legal-tech document translation platform that eliminates USCIS Request for Evidence (RFE) rejections. It bridges the gap between mechanical machine translation tools (which corrupt tabular layouts, stamp coordinates, and typography) and slow, opaque traditional translation agencies. Success means 100% acceptance by receiving authorities, instantaneous turnaround, and complete peace of mind.

## Positioning
USCIS 8 CFR § 103.2 and ATA certified translation with mathematical isolation, layout-preserving precision rendering, automated pre-triage, hard-locked passport name/date consistency, and a tamper-evident public QR code verification portal.

## Operating Context
- **Workflows**:
  - Direct Customer Flow: Acceptance Pre-Check Wizard -> Pre-Payment Document Quality Triage -> Name/Date Lock Configuration -> Deterministic Quote -> Checkout -> Live 7-Milestone Order Tracker & Named Translator Thread -> Certified PDF Delivery.
  - Enterprise/Counsel Flow: Matter management, multi-document bulk translation, client dossier bundling, and consolidated invoicing.
  - Verification Flow: Public verification portal where government adjudicators and registrars scan QR codes or enter codes to inspect tamper-evident cryptographic hashes and translator credentials.
- **Environments**: Web browser across modern desktop and mobile viewports, high-density professional dashboards, and print/PDF output.
- **Documents & Formats**: Vital records, diplomas, court transcripts, bank records, and legal briefs across PDF, DOCX, PNG, and JPG formats.

## Capabilities and Constraints
- **Capabilities**:
  - Layout-preserving translation with dynamic font fitting, background inpainting/masking, and bounding-box collision detection.
  - Multi-script support including bi-directional RTL (Arabic/Hebrew) and CJK scripts.
  - Automated 5-stage verification gate: target language verification, block count invariance, untranslatable token invariance, geometric collision sweep, and non-text region integrity.
  - Cryptographic composite key addressing ensuring absolute isolation between language outputs.
  - Live 7-milestone order tracker with named ATA translator messaging thread.
  - Public verification portal at `/verify/[code]` with downloadable stamped certificates of accuracy.
- **Constraints**:
  - USCIS 8 CFR § 103.2 compliance and ATA certification rules.
  - Strict preservation of untranslatable regions: official seals, notary stamps, signatures, and barcodes must remain untampered.
  - High-density enterprise UX without generic AI visual clichés (no purple/cyan gradients, no floating blur orbs).

## Brand Commitments
- **Name**: VerifyLingua
- **Tone & Voice**: Authoritative, reassuring, legally rigorous, precision-engineered, transparent.
- **Visual Identity**: High-density workspace aesthetic, crisp 1px borders, subtle tactile interactions, sober professional color palette (navy/slate/emerald accents), clear typographic contrast (sans-serif body with monospace metadata).

## Evidence on Hand
- Working Next.js 15 App Router codebase with 28 passing test suites (167+ tests).
- Automated test suites for pricing, OCR parsing, session auth, and data isolation.
- Comprehensive technical documentation in `docs/` (`DIFFERENTIATION.md`, `PRODUCT_DIAGNOSIS.md`, `DESIGN_SYSTEM.md`, `TRANSLATION_PIPELINE_SPEC.md`).
- Certified translation samples and mock documents in `fixtures/`.

## Product Principles
1. **Zero-RFE Guarantee**: Every architectural and UX decision prioritizes preventing USCIS rejection, from pre-payment document triage to hard-locked passport transliterations.
2. **Deterministic Transparency**: Quotes give exact arrival datetimes (factoring in notary schedules); progress is tracked against real audit milestones, never vague loaders.
3. **Layout Fidelity**: The output translation must look visually identical to the source document, preserving every seal, signature, and table boundary.
4. **Verifiable Authenticity**: Every certified artifact is cryptographically hashed and publicly verifiable via QR code.
5. **No AI Clichés**: Deliver an enterprise-grade, human-crafted legal-tech interface with high density, clear contrast, and tactile responsiveness.

## Accessibility & Inclusion
- WCAG 2.1 AA compliance across all public and client-facing workflows.
- Full RTL layout support for right-to-left languages (Arabic, Hebrew) with appropriate text direction and alignment.
- High color contrast ratio (minimum 4.5:1 for body copy).
- Keyboard accessibility and screen reader support on all interactive modals, sliders, and form components.
