# ARCHITECTURAL DECISION RECORDS (ADR)

**Product:** VerifyLingua — Enterprise Document Translation Platform  
**Status:** Active / Accepted  
**Last Updated:** September 11, 2026  

---

## ADR-001: Preservation of Existing Working Features & Non-Destructive Extension

### Context
VerifyLingua has a functioning baseline: 28 test suites (167 tests) passing, OpenXML DOCX parser/reconstructor, PDF-lib vector engine, Jimp image processor, Gemini/DeepL translation fallback, and Tailwind v4 design system. The client requirements explicitly forbid full rewrites from scratch.

### Decision
All future enhancements must follow a strict 4-tier hierarchy:
1. **Repair existing implementation:** Fix bugs in place without altering contracts.
2. **Refactor the affected module:** Restructure internals while maintaining external API compatibility.
3. **Replace only the broken subsystem:** Swap out individual broken adapters or components with explicit migration bridges.
4. **Full rebuild prohibited:** Rewriting working subsystems without written justification and explicit authorization is strictly banned.

Existing routes such as `/dashboard` and `/admin/orders` will remain accessible or aliased to prevent breaking legacy bookmarks and existing test harnesses.

---

## ADR-002: Strict Separation of Client (`/app/*`) and Admin (`/admin/*`) Surfaces

### Context
In previous prototypes, client and administrative functionalities shared store methods and lacked strict boundary enforcement. Enterprise security requires that client users never see administrative affordances, operational queues, translator assignments, or system metrics.

### Decision
We partition the application into distinct root layouts and route namespaces:
- **Public Marketing Surface (`/`, `/pricing`, `/how-it-works`, `/compare/*`, `/verify/*`):** Publicly indexed, zero auth required, optimized for Core Web Vitals and conversions.
- **Client Workspace Surface (`/app/*`):** High-density authenticated interface for customers, legal teams, and enterprise clients.
  - `/app` (Dashboard & Primary Action)
  - `/app/new-translation` (Progressive intake wizard)
  - `/app/projects` & `/app/projects/:id` (Project management & inspection)
  - `/app/projects/:id/revisions` (Revision tracking)
  - `/app/files` (Vault & file preview)
  - `/app/usage` (Usage telemetry)
  - `/app/billing` (Invoices & subscriptions)
  - `/app/settings` (Tenant preferences & retention)
  - `/app/support` (Dedicated client help desk)
- **Admin Console Surface (`/admin/*`):** Restricted operational console with multi-role RBAC:
  - `/admin` (Executive operational control)
  - `/admin/jobs` & `/admin/jobs/:id` (Job pipeline telemetry & reprocess triggers)
  - `/admin/users` (User lifecycle management)
  - `/admin/organizations` (Enterprise tenant oversight)
  - `/admin/reviews` (Linguist QA workbench)
  - `/admin/languages` (Routing & model governance)
  - `/admin/glossaries` (Enterprise terminology management)
  - `/admin/billing` (Revenue analytics & financial records)
  - `/admin/system-health` (Infrastructure, API uptime, circuit breakers)
  - `/admin/audit-log` (Immutable security audit trail)
  - `/admin/settings` (Global platform configurations)

No admin navigation or administrative API endpoints may be imported into or rendered by client surface components.

---

## ADR-003: Edge-Level Authentication and Server-Side Role-Based Access Control (RBAC)

### Context
Forensic analysis revealed that `middleware.ts` previously only protected `/dashboard`, `/settings`, `/history`, and `/counsel`, leaving `/admin` exposed to unauthenticated visitors. Additionally, role verification was not enforced at the route boundary.

### Decision
We establish a defense-in-depth authorization model:
1. **Edge Middleware (`middleware.ts`):**
   - Intercepts all requests matching `/app/:path*` and `/admin/:path*`.
   - Requires valid `vl_session` or `__session` token. Unauthenticated requests are immediately redirected to `/login` with a sanitized `returnUrl`.
   - For `/admin/:path*`, inspects user session role. Non-admin roles (e.g., `CUSTOMER`, `INDIVIDUAL`) are denied with HTTP 403 Forbidden or redirected to `/app`.
2. **Server-Side Authorization in Handlers:**
   - Every admin API route (`/api/admin/*`) must call `requireAdminSession(req)` or `requireRole(req, allowedRoles)` before reading or mutating data.
   - Client API routes must scope queries strictly to the authenticated `session.user.id`.

### Supported Roles:
- `SUPER_ADMIN`: Unrestricted platform access.
- `OPERATIONS_MANAGER`: Job queue triage, translator assignments, reprocess triggers.
- `TRANSLATOR_REVIEWER`: QA workbench, segment editing, certification sign-off.
- `CUSTOMER_SUPPORT`: Client lookup, ticket resolution, order inspection.
- `BILLING_MANAGER`: Invoices, refunds, subscription adjustments.
- `READ_ONLY_ANALYST`: Observability, reports, aggregate metrics without mutation rights.
- `CLIENT_USER`: Standard customer/organization member scoped solely to their tenant.

---

## ADR-004: Unified Domain Adapter Strategy for Relational & In-Memory Stores

### Context
The repository currently has a dual database schema: Prisma (`prisma/schema.prisma`) and Drizzle (`lib/db/schema.ts`), accompanied by in-memory caching layers (`lib/dashboard/store.ts` and `lib/translation/persistent-store.ts`).

### Decision
Rather than executing a risky drop-and-replace migration that would destabilize 28 passing test suites, we adopt a **Unified Domain Adapter Pattern**:
1. **Authoritative Relational Schema:** Prisma remains the primary relational persistence mechanism for PostgreSQL.
2. **Multi-Tenant Isolation Layer:** `lib/db/data-isolation.ts` continues to enforce tenant-scoped isolation rules and R2 key conventions.
3. **Repository Bridge:** Domain services (`TranslationJobService`, `ProjectService`, `BillingService`) abstract the data layer. In production environments with a configured `DATABASE_URL`, operations persist to PostgreSQL. In test or offline environments, the repository falls back gracefully to deterministic memory stores without code branching in UI components.

---

## ADR-005: Multi-Tenant R2 Storage Isolation

### Context
Document-translation platforms process highly sensitive legal, medical, and corporate data (USCIS petitions, birth certificates, trade agreements). Cross-tenant file leaks constitute catastrophic regulatory and security breaches.

### Decision
1. **Deterministic Object Key Structure:**
   All Cloudflare R2 storage keys must follow the strictly scoped template:
   ```
   ${sanitizedUserId}/${sanitizedDocumentOrJobId}/${sanitizedFilename}
   ```
2. **Enforcement:**
   Key generation is centralized in `generateR2ObjectKey()` in `lib/db/data-isolation.ts` and `lib/storage/index.ts`. Direct string concatenation of storage keys outside these audited helpers is forbidden.
3. **Pre-signed Access:**
   Raw R2 bucket URLs are never public. File downloads are brokered through short-lived (max 15-minute) pre-signed URLs or streaming proxy endpoints with cryptographic token verification (`/api/translate/download/:id?token=...`).

---

## ADR-006: Layout-Preserving Translation Engine & Anti-Pattern Prohibition

### Context
Common document translation failures include:
- Stacking translated text on top of original text (banned overlay anti-pattern).
- Dropping or resizing embedded seals, signatures, and images.
- Distorting multi-column layouts and table cells due to target language expansion (e.g., German expands ~25%, Spanish ~20%).
- Corrupting RTL scripts (Arabic, Hebrew) by reversing strings without bidirectional text shaping or flipping layout grids.

### Decision
1. **DOCX Processing:** OpenXML run preservation via `jszip`. Text nodes (`<w:t>`) are translated while retaining parent run properties (`<w:rPr>`), styles, table formatting (`<w:tbl>`), headers, and footers.
2. **PDF Processing:** Vector text extraction via `pdfjs-dist`/`pdf-lib`. Coordinates and bounding boxes are extracted. The source text region is inpainted with matching background color, and translated text is drawn with dynamic font scaling to fit the bounding box.
3. **Image & Scanned Document Processing:** Scanned files undergo Tesseract OCR with coordinate extraction. Original text blocks are masked and replaced with rendered bitmap text matching the original dimensions.
4. **Banned Pattern Guard:** Compositing translated text as an overlay on top of original legible text without background inpainting is strictly prohibited.
5. **RTL First-Class Support:** Arabic translations must set `dir="rtl"`, apply right-alignment to paragraph blocks, correctly reflow table columns right-to-left, and preserve Latin numerals and proper nouns in LTR runs.

---

## ADR-007: Categorical Separation: Machine vs. Certified Human Translation

### Context
Presenting machine translation as certified human translation exposes the business to legal liability and causes rejection by government agencies (USCIS 8 CFR 103.2, universities, courts).

### Decision
The platform explicitly bifurcates translation modes into distinct product tiers:
1. **Automated Layout Translation (Machine Mode):**
   - Instant or near-instant (minutes).
   - Powered by Gemini 3.1 Pro / DeepL.
   - Includes automated translation disclaimer banner.
   - Targeted at internal review, comprehension, business drafting.
2. **Certified Legal Translation (Human-in-the-Loop Mode):**
   - Undergoes ATA-accredited or professional human linguist review and sign-off.
   - Generates a notarized USCIS 8 CFR 103.2 Certificate of Translation Accuracy.
   - Includes cryptographic QR verification seal, unique verification code, and translator credentials.
   - Required for official government, court, immigration, and academic submissions.

UI copy, pricing tables, and output headers must never conflate these two tiers.

---

## ADR-008: Observable Asynchronous Pipeline & Zero-Fake-Completion Rule

### Context
A recurring failure mode in AI document products is "fake completion," where the frontend shows a green checkmark before processing finishes, or returns a stock placeholder file when extraction fails.

### Decision
1. **Discrete State Transitions:**
   Every translation job must progress through explicit, auditable states:
   `CREATED` -> `UPLOAD_PENDING` -> `UPLOADED` -> `VALIDATING` -> `OCR_PROCESSING` -> `CONTENT_EXTRACTED` -> `TRANSLATING` -> `LAYOUT_RECONSTRUCTION` -> `QUALITY_CHECK` -> `HUMAN_REVIEW_REQUIRED` (if certified) -> `READY_FOR_DOWNLOAD` (or `FAILED`, `CANCELLED`).
2. **Programmatic Quality Gate:**
   A job cannot reach `READY_FOR_DOWNLOAD` unless verified by `TranslationQualityGate`:
   - Output buffer is valid and non-empty.
   - Output checksum does not match any stock placeholder or source file.
   - Layout fidelity score meets threshold (>80%).
   - If quality checks fail, the job enters `FAILED` or `COMPLETED_WITH_WARNINGS` with specific diagnostic details. Fake success states are strictly prohibited.

---

## ADR-009: Design System Discipline (Anti-Slop & UI/UX Pro Max)

### Context
Generic AI templates suffer from purple/cyan gradients, floating background blur orbs, default rounded-2xl cards, and visually noisy decorative animations.

### Decision
VerifyLingua adheres to an editorial, high-density Swiss typographic design system:
- **Palette:** Deep Obsidian (`#090A0C` / `var(--color-obsidian)`), Crisp Paper (`#FFFFFF`), Neutral Slate borders (`#E2E8F0` / `#1E293B`), and purposeful accent colors (Cobalt `#2563EB`, Emerald `#059669`, Amber `#D97706`).
- **Zero Raw Hex Colors:** All components must reference semantic Tailwind tokens or CSS variables. Verified via `scripts/check-raw-hex.js`.
- **Typography:** High-contrast pairing — Editorial Display / Sans for hierarchy and Monospace (`JetBrains Mono`) for all hashes, coordinates, file sizes, and status badges.
- **Motion:** Calm, physical spring transitions (e.g., stiffness 400, damping 30) for interactive states; zero decorative looping animations.
- **Dividers & Density:** Crisp 1px borders, high information density, clear visual structure.
