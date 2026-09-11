# IMPLEMENTATION BACKLOG & EXECUTION ROADMAP

**Product:** VerifyLingua Enterprise Document Translation Platform  
**Tracking Period:** Q1 - Q3 Implementation  
**Methodology:** Incremental vertical slices with verification gates  

---

## 1. File Modification Impact Analysis

### Files to be Created:
1. **Client Workspace Routes:**
   - `app/app/layout.tsx` (Client layout, sidebar, user badge, tenant switcher)
   - `app/app/page.tsx` (Executive client dashboard, active projects, quick translation CTA)
   - `app/app/new-translation/page.tsx` (Progressive 6-stage intake flow)
   - `app/app/projects/page.tsx` (Project listing with filters, search, and status tags)
   - `app/app/projects/[id]/page.tsx` (Project details, live status timeline, quality report, download)
   - `app/app/projects/[id]/revisions/page.tsx` (Formal revision request submission and audit trail)
   - `app/app/files/page.tsx` (Document vault with SHA-256 signatures, format tags, size, dates)
   - `app/app/usage/page.tsx` (Monthly quota meter, page breakdown, consumption history)
   - `app/app/billing/page.tsx` (Subscription management, Stripe billing portal trigger, invoices)
   - `app/app/settings/page.tsx` (Account details, retention policies, notification settings)
   - `app/app/support/page.tsx` (Enterprise support portal, priority assistance, FAQs)
2. **Admin Console Routes:**
   - `app/admin/layout.tsx` (Dedicated admin layout, operational status bar, RBAC banner)
   - `app/admin/jobs/page.tsx` (Real-time job queue, worker allocations, filter by provider/status)
   - `app/admin/jobs/[id]/page.tsx` (Job inspector, segment viewer, reprocess/retry controls)
   - `app/admin/users/page.tsx` (Platform users, role assignments, status, activity logs)
   - `app/admin/organizations/page.tsx` (Enterprise organizations, seat quotas, contract tiers)
   - `app/admin/reviews/page.tsx` (Human linguist review queue, assignment modal, QA approval)
   - `app/admin/languages/page.tsx` (Language pair configurations, RTL rules, provider priority)
   - `app/admin/glossaries/page.tsx` (Global and organization glossaries, locked term banks)
   - `app/admin/billing/page.tsx` (Platform financial telemetry, revenue, Stripe subscriptions)
   - `app/admin/system-health/page.tsx` (Provider latency, error rates, circuit breaker states)
   - `app/admin/audit-log/page.tsx` (Immutable system audit trail, search by actor/action/resource)
3. **Core Services & Bridge Modules:**
   - `lib/services/project-service.ts` (Unified project lifecycle service bridging Prisma/stores)
   - `lib/services/quality-report.ts` (Automated document-quality analysis generator)
   - `lib/auth/rbac.ts` (Centralized role-based access control and session assertions)
4. **Verification & Test Suites:**
   - `test/client-app-routes.test.ts` (Client workspace routes and workflows)
   - `test/admin-rbac-routes.test.ts` (Admin console access control and role permissions)
   - `test/document-quality-report.test.ts` (Automated quality gate and drift detection)

### Files to be Modified:
1. `middleware.ts` — Add edge protection for `/app/*` and strict RBAC verification for `/admin/*`.
2. `lib/translation/pipeline.ts` — Wire comprehensive document-quality report generation.
3. `lib/translation/persistent-store.ts` — Integrate full 16-stage states and revision requests.
4. `components/marketing/Navbar.tsx` — Update client portal links to point to `/app`.

### Files NOT to be Modified (Preserved Core):
1. `lib/translation/docx.ts` — Working OpenXML run preservation (100% verified, do not alter).
2. `lib/translation/pdf.ts` — Working PDF-lib vector reconstruction (100% verified, do not alter).
3. `lib/translation/image.ts` — Working Jimp raster translation (100% verified, do not alter).
4. `lib/translation/spatial.ts` — Layout geometry and coordinate algorithms (verified, do not alter).
5. `lib/db/data-isolation.ts` — Tenant isolation R2 key logic (verified, do not alter).
6. Existing 28 test suites in `test/` — Kept intact as baseline regression guards.

---

## 2. Prioritized Implementation Slices

### Slice 1: Edge Security, Middleware RBAC & Role Verification
- **Goal:** Lock down `/admin/*` and `/app/*` at the network edge so unauthorized visitors cannot access sensitive pages.
- **Tasks:**
  - Create `lib/auth/rbac.ts` with typed role definitions and session role evaluators.
  - Update `middleware.ts` to inspect session tokens for `/app/*` and verify admin privileges for `/admin/*`.
  - Add unit and integration tests verifying redirection of unauthenticated users and blocking of non-admin accounts.

### Slice 2: Canonical Client Experience (`/app/*`)
- **Goal:** Deliver an editorial, high-density client workspace matching all product requirements.
- **Tasks:**
  - Build `app/app/layout.tsx` featuring high-density navigation, tenant switcher, and status indicators.
  - Implement `/app` (Executive Client Hub with recent projects, quick action, and status cards).
  - Implement `/app/new-translation` (Progressive 6-stage intake flow: Upload -> Configure -> Estimate -> Confirm -> Process -> Review).
  - Implement `/app/projects` and `/app/projects/[id]` (Lifecycle project tracking, side-by-side preview, QA scorecard).
  - Implement `/app/projects/[id]/revisions` (Audit-trailed revision request form).
  - Implement `/app/files` (Document vault with SHA-256 hashes, format badges, and download triggers).
  - Implement `/app/usage` (Interactive page quota and consumption telemetry).
  - Implement `/app/billing` (Stripe subscription portal link, plan tiers, and invoice history).
  - Implement `/app/settings` (Profile, security, auto-delete retention toggles).
  - Implement `/app/support` (Dedicated enterprise help desk).

### Slice 3: Canonical Admin Operations Console (`/admin/*`)
- **Goal:** Equip internal teams with complete operational control, queue monitoring, and quality management.
- **Tasks:**
  - Build `app/admin/layout.tsx` with operational status banner and role indicator.
  - Implement `/admin/jobs` and `/admin/jobs/[id]` (Queue telemetry, failure inspection, and retry triggers).
  - Implement `/admin/users` (Account lifecycle, role assignment modal, and activity history).
  - Implement `/admin/organizations` (Multi-tenant company accounts and seat allocations).
  - Implement `/admin/reviews` (Linguist QA workbench with segment verification and certificate issuance).
  - Implement `/admin/languages` (Routing rules, provider configuration, and RTL toggles).
  - Implement `/admin/glossaries` (Global and organization terminology banks).
  - Implement `/admin/billing` (Financial analytics, invoice log, and refund controls).
  - Implement `/admin/system-health` (Real-time latency metrics for Gemini, DeepL, Azure, and circuit breaker status).
  - Implement `/admin/audit-log` (Immutable security event stream).

### Slice 4: Document Quality Gate & Quality Report Integration
- **Goal:** Eliminate fake completion and deliver detailed document-quality scorecards.
- **Tasks:**
  - Implement `lib/services/quality-report.ts` calculating text completeness, overflow, clipping, and layout drift.
  - Wire quality reports into `/app/projects/[id]` and `/admin/jobs/[id]`.
  - Validate output with automated tests.

### Slice 5: Verification, Testing & Polish Pass
- **Goal:** Prove end-to-end reliability with zero regressions.
- **Tasks:**
  - Run full test suite (`npm test`).
  - Run typecheck (`npx tsc --noEmit`) and linting (`npm run lint`).
  - Verify raw hex color compliance (`npm run check:hex`).
  - Conduct full multi-format end-to-end journey verification.
