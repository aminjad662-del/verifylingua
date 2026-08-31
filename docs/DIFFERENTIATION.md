# VerifyLingua - The Six Differentiation Moats

This document outlines the six core differentiation moats of VerifyLingua built to eliminate the documented failure modes of incumbent certified translation agencies (ImmiTranslate, RushTranslate, Translayte) and prevent USCIS Request for Evidence (RFE) rejections.

---

## Moat 1: Acceptance Pre-Check Wizard (§2.1)
- **Problem Solved**: Immigrants and students often do not know whether their specific receiving institution requires standard certification, county notary jurats, apostille stamps, or physical embossed hard copies. Incumbents offer confusing checkboxes without context.
- **Implementation**: `app/order/precheck/page.tsx`, `lib/constants.ts` (`RECEIVING_PARTIES`)
- **How It Works**: The user selects their receiving party (USCIS, university/WES, court, state DMV, foreign consulate, employer). The wizard generates a plain-language compliance specification sheet and automatically pre-configures the required order add-ons before payment.

---

## Moat 2: Pre-Payment Document Quality Triage (§2.2)
- **Problem Solved**: Incumbent agencies accept customer payment first, only for translators to reject or delay the document days later due to glare, cropped notary seals, low resolution, or missing pages.
- **Implementation**: `app/order/triage/page.tsx`, `components/marketing/Hero.tsx`
- **How It Works**: Before taking payment, the AI vision engine analyzes the scan for:
  - Low resolution / illegible text
  - Cropped margins and missing seals
  - Flash glare over signatures or timestamps
  - Missing page sequences
  It categorizes findings into `WARN` (with actionable daylight reshoot tips) or `BLOCK` (preventing payment until a legible file is provided).

---

## Moat 3: Passport Name & Date Consistency Lock (§2.3)
- **Problem Solved**: The #1 silent cause of USCIS RFEs is a single-letter spelling difference between the translated certificate and the applicant's official passport (e.g., transliteration differences in Arabic, Cyrillic, or Chinese names).
- **Implementation**: `app/order/configure/page.tsx`, `prisma/schema.prisma` (`GlossaryTerm`), `app/admin/orders/[id]/page.tsx`
- **How It Works**: The applicant enters their exact machine-readable passport spelling during configuration. These names are converted into hard-locked glossary terms in the database (`locked: true`), blocking translator submission if the translated PDF contains any variation.

---

## Moat 4: Instant Deterministic Quote & Delivery Datetime (§2.4)
- **Problem Solved**: Incumbents quote vague "24-hour turnaround", yet fail to meet deadlines when notary batch schedules or weekend cutoffs are missed.
- **Implementation**: `lib/pricing.ts`, `components/order/StickyPriceBar.tsx`, `test/pricing.test.ts`
- **How It Works**: Calculates page count (< 250 words/page) in < 5s and outputs an absolute datetime in the user's timezone (e.g., "Ready Tue, Sep 2, 9:00 AM EST"). It factors in twice-daily notary batch windows and business hours directly into the promised timestamp.

---

## Moat 5: Live Order Tracker + Named Translator Thread (§2.5)
- **Problem Solved**: Customers experience severe anxiety with opaque "In Progress" statuses and lack direct communication channels with the person translating their sensitive legal records.
- **Implementation**: `app/order/[id]/page.tsx`, `prisma/schema.prisma` (`OrderEvent`, `Message`)
- **How It Works**: Provides a 7-milestone live tracker powered strictly by timestamped database `OrderEvent` records (`Received → Triaged → Assigned → Translating → QA → Certified → Delivered`), displays the assigned linguist's first name and ATA credentials, and provides an in-thread two-way messaging console.

---

## Moat 6: Public Verification Portal & QR Code (§2.6)
- **Problem Solved**: Receiving officers (USCIS adjudicators, university registrars, court clerks) previously had no digital way to verify the authenticity of a printed or PDF translation certificate.
- **Implementation**: `app/verify/[code]/page.tsx`, `app/verify/page.tsx`, `app/api/verify/[code]/route.ts`, `lib/certificate.ts`
- **How It Works**: Every Certificate of Accuracy PDF contains an official QR code and alphanumeric verification ID linking to a public, unauthenticated portal where officials can verify:
  - Tamper-evident SHA-256 cryptographic document hash
  - Accredited translator credentials (ATA Member No.)
  - 8 CFR 103.2(b)(3) translator competence statement
  - Active validity status (VALID vs REVOKED)
  - Printable official verification sheet
