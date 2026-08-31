# VerifyLingua Section-by-Section Reference Checklist

| Reference Feature | Visual Grammar Source | VerifyLingua Implementation Route & Component | QA Check Criteria |
|---|---|---|---|
| **Global Navigation** | Ref A / B Top Nav | components/layout/Header.tsx (All routes) | Max 5 links, cobalt CTA, responsive drawer, 0 raw hex |
| **Hero Display + CTA** | Ref A Header + Ref B Centered Hero | components/marketing/Hero.tsx (/) | Oversized headline, pill badge, live dropzone, dual CTA |
| **Document Type Carousel / Bento** | Ref B Feature Cards | components/marketing/DocumentTypes.tsx (/) | 12 document categories, 24px radius cards, soft hover |
| **Comparison Matrix** | Ref A Feature Table | components/marketing/ComparisonTable.tsx (/pricing, /) | Incumbent pricing, 6 differentiators highlighted |
| **How It Works 4-Step** | Ref A Step Flow | components/marketing/HowItWorks.tsx (/how-it-works, /) | 4-step numbered cards, illustrated icons, clear micro-copy |
| **Rejection-Proof Dark Band** | Ref A Dark Feature Container | components/marketing/RejectionMoatSection.tsx (/) | Navy #0B0D2A container, 6 failure modes solved, glowing arcs |
| **Metric Proof Stats** | Ref A 3-Column Stats | components/marketing/TrustStats.tsx (/) | 3 big stats: 100% USCIS Acceptance, <5s AI Triage, 50K+ Docs |
| **Live Interactive Quote Bar** | Ref A Interactive Widget | components/order/StickyPriceBar.tsx (/order/*) | Exact delivery datetime, live price recalc, sticky desktop/mobile |
| **Pre-Payment Triage Screen** | Ref A Interactive Workspace | app/order/triage/page.tsx | Vision triage findings, warning badges, re-shoot guides |
| **Acceptance Pre-Check Wizard** | Ref B Multi-step Card | app/order/precheck/page.tsx | Receiving party selector, requirement spec generator |
| **Name & Date Consistency Lock** | Ref A Modal/Form Workspace | app/order/configure/page.tsx | Passport name locking, date format, add-on switches |
| **Public Verification Portal** | Ref B High-Trust Detail | app/verify/[code]/page.tsx | QR code lookup, SHA-256 hash, translator credentials |
| **FAQ Accordion** | Ref B FAQ Section | components/marketing/FAQSection.tsx (/, /pricing) | Large typography, thin 1px dividers, smooth animation |
| **Primary Site Footer** | Ref A Comprehensive Dark Footer | components/layout/Footer.tsx (All routes) | Dark navy #0A0C2B, categorized links, trust badges |

## Responsive Visual QA Targets
- [ ] Desktop (1440px): 12-col layout, generous whitespace, sticky quote rail on right.
- [ ] Tablet (768px): 2-col cards, wrapped stats, persistent bottom quote bar.
- [ ] Mobile (390px): 1-col cards, full-width touch-friendly dropzone (camera capture ready), sticky bottom price bar.
