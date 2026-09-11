# ROUTE & ROLE PERMISSIONS MATRIX

**Product:** VerifyLingua Enterprise Platform  
**Version:** 1.0.0  
**Status:** Active Specification  
**Enforcement:** Edge Middleware (`middleware.ts`) & Server Route Handlers  

---

## 1. System Roles Definition

The platform models distinct authorization roles across client and administrative boundaries:

### Administrative Roles (Internal Operators)
1. **SUPER_ADMIN:** Complete system authority across all tenants, workers, financial transactions, and configuration settings.
2. **OPERATIONS_MANAGER:** Manages translation queues, worker workloads, reprocess triggers, provider failovers, and translator assignments.
3. **TRANSLATOR_REVIEWER:** Access to the translation QA workbench, side-by-side comparison tools, segment translation editors, and certificate sign-offs.
4. **CUSTOMER_SUPPORT:** Customer lookups, project status triage, refund requests, and support messaging.
5. **BILLING_MANAGER:** Direct access to Stripe billing records, invoices, enterprise contracts, and quota adjustments.
6. **READ_ONLY_ANALYST:** Operational metrics, conversion telemetry, and audit log inspection with all mutation capabilities revoked.

### Client Roles (External Customers)
7. **CLIENT_OWNER:** Enterprise organization owner with full control over organization members, billing, retention policies, and all organization projects.
8. **CLIENT_MEMBER:** Organization team member capable of uploading files, initiating translations, downloading files, and requesting revisions within their organization.
9. **INDIVIDUAL_CLIENT:** Self-service individual user owning their own scoped projects, files, and subscription.
10. **UNAUTHENTICATED_VISITOR:** Anonymous user restricted to public landing pages, sample visualizers, documentation, and public certificate verification.

---

## 2. Comprehensive Route Matrix

### Surface A: Public Marketing & Verification Site (Zero Auth Required)

| Route Path | Description | Access Control | Middleware Action |
|---|---|---|---|
| `/` | Landing page, interactive document visualizer, certified samples | Public | Allow |
| `/pricing` | Tiered pricing calculator (Automated vs Certified) | Public | Allow |
| `/how-it-works` | Pipeline visual breakdown, OCR, layout reconstruction | Public | Allow |
| `/compare/[competitor]` | Competitive breakdowns (vs ImmiTranslate, RushTranslate) | Public | Allow |
| `/use-cases` & `/use-cases/[slug]` | Industry landing pages (Legal, Immigration, Academic, Healthcare) | Public | Allow |
| `/languages` & `/languages/[slug]` | Supported language pairs and dialect capabilities | Public | Allow |
| `/guides` & `/guides/[slug]` | Document prep guides (USCIS 8 CFR 103.2, certified translations) | Public | Allow |
| `/documents` & `/documents/[slug]` | Document type specifications (Birth cert, transcript, contract) | Public | Allow |
| `/acceptance-guarantee` | 100% USCIS Acceptance Guarantee policy | Public | Allow |
| `/verify` & `/verify/[code]` | Cryptographic certificate verification & QR scan destination | Public | Allow |
| `/help` | Knowledge base, FAQs, and contact forms | Public | Allow |
| `/login` | Secure customer and operator authentication portal | Public (Redirect if auth) | Redirect to `/app` or `/admin` if already logged in |
| `/register` | User onboarding and account creation | Public (Redirect if auth) | Redirect to `/app` if already logged in |

---

### Surface B: Authenticated Client Workspace (`/app/*`)

*All `/app/*` routes require an active session (`vl_session`). Unauthenticated requests are redirected to `/login?returnUrl=...`.*

| Client Route | Description | Minimum Client Role | Admin Access |
|---|---|---|---|
| `/app` | Executive Client Hub, primary CTA, active translations, usage summary | INDIVIDUAL_CLIENT / CLIENT_MEMBER | Allowed (impersonation/audit) |
| `/app/new-translation` | Progressive 6-stage intake flow: Upload -> Configure -> Estimate -> Confirm -> Process -> Review | INDIVIDUAL_CLIENT / CLIENT_MEMBER | Allowed |
| `/app/projects` | All translation projects, filtering by status, date, language pair | INDIVIDUAL_CLIENT / CLIENT_MEMBER | Scoped to client |
| `/app/projects/:id` | Project detail, live pipeline timeline, side-by-side preview, QA report | INDIVIDUAL_CLIENT / CLIENT_MEMBER (Owner/Org) | Scoped to client |
| `/app/projects/:id/revisions` | Formal revision request center with reason codes and segment markers | INDIVIDUAL_CLIENT / CLIENT_MEMBER (Owner/Org) | Scoped to client |
| `/app/files` | Secure document vault, original and translated files, SHA-256 signatures | INDIVIDUAL_CLIENT / CLIENT_MEMBER | Scoped to client |
| `/app/usage` | Monthly page quota, OCR page consumption, team telemetry | INDIVIDUAL_CLIENT / CLIENT_MEMBER | Scoped to client |
| `/app/billing` | Stripe customer portal, invoice history, payment method, plan change | CLIENT_OWNER / INDIVIDUAL_CLIENT | Scoped to client |
| `/app/settings` | Profile, security, notification channels, data retention policies | INDIVIDUAL_CLIENT / CLIENT_MEMBER | Scoped to client |
| `/app/support` | Client help desk, live ticket thread, priority contact | INDIVIDUAL_CLIENT / CLIENT_MEMBER | Scoped to client |

*Legacy Route Compatibility:* Existing `/dashboard/*` paths are transparently aliased/redirected to their respective `/app/*` equivalents to prevent breaking legacy bookmarks or existing test suites.

---

### Surface C: Authenticated Admin Console (`/admin/*`)

*All `/admin/*` routes strictly require an active session **with an administrative role**. Regular client users are blocked with HTTP 403 Forbidden or redirected to `/app`.*

| Admin Route | Description | Permitted Roles | Read | Write | Execute |
|---|---|---|:---:|:---:|:---:|
| `/admin` | Executive operational telemetry, throughput, system health | All Admin Roles | ✓ | Limited | Limited |
| `/admin/jobs` | Complete translation queue, provider statuses, pipeline metrics | SUPER_ADMIN, OPS_MGR, SUPPORT, ANALYST | ✓ | ✓ | ✓ |
| `/admin/jobs/:id` | Low-level job inspection, layout graph viewer, retry triggers | SUPER_ADMIN, OPS_MGR, SUPPORT | ✓ | ✓ | ✓ |
| `/admin/users` | Platform user directory, roles, account verification, login logs | SUPER_ADMIN, OPS_MGR, SUPPORT | ✓ | ✓ | — |
| `/admin/organizations` | Multi-tenant organization accounts, seat management, quotas | SUPER_ADMIN, OPS_MGR, BILLING_MGR | ✓ | ✓ | — |
| `/admin/reviews` | Human-in-the-loop review queue, linguist assignment, QA sign-off | SUPER_ADMIN, OPS_MGR, TRANSLATOR_REVIEWER | ✓ | ✓ | ✓ |
| `/admin/languages` | Active language pairs, provider routing rules, RTL parameters | SUPER_ADMIN, OPS_MGR | ✓ | ✓ | — |
| `/admin/glossaries` | Global & enterprise terminology banks, locked passport terms | SUPER_ADMIN, OPS_MGR, TRANSLATOR_REVIEWER | ✓ | ✓ | — |
| `/admin/billing` | Platform financial telemetry, revenue, Stripe subscriptions, refunds | SUPER_ADMIN, BILLING_MGR, ANALYST (Read) | ✓ | ✓ | ✓ |
| `/admin/system-health` | Real-time provider latency (Gemini, DeepL, Azure), circuit breakers | SUPER_ADMIN, OPS_MGR | ✓ | — | ✓ |
| `/admin/audit-log` | Immutable platform audit log, authentication events, data exports | SUPER_ADMIN, OPS_MGR, ANALYST | ✓ | — | — |
| `/admin/settings` | Global system configurations, rate limits, default retention | SUPER_ADMIN | ✓ | ✓ | ✓ |

---

### Surface D: API Endpoints Authorization

| Endpoint | Method | Role Requirement | Data Scoping |
|---|---|---|---|
| `/api/translate/upload` | POST | Authenticated (Any) | Scoped to `session.user.id` |
| `/api/translate/status/:id` | GET | Authenticated (Job Owner or Admin) | Scoped to `session.user.id` |
| `/api/translate/download/:id` | GET | Authenticated (Job Owner or Admin) + Token | Scoped to `session.user.id` |
| `/api/translate/jobs` | GET | Authenticated (Any) | Scoped to `session.user.id` |
| `/api/order/create` | POST | Authenticated / Guest Checkout | Scoped to User or Guest Email |
| `/api/order/:id/revisions` | POST | Authenticated (Order Owner) | Scoped to `session.user.id` |
| `/api/order/:id/proof` | GET | Authenticated (Order Owner or Admin) | Scoped to `session.user.id` |
| `/api/order/:id/receipt` | GET | Authenticated (Order Owner or Admin) | Scoped to `session.user.id` |
| `/api/order/:id/approve` | POST | Authenticated (Order Owner) | Scoped to `session.user.id` |
| `/api/admin/quotes` | GET/POST | Admin Role Required | Platform-wide |
| `/api/admin/translators` | GET/POST | Admin Role Required | Platform-wide |
| `/api/admin/orders` | GET/POST | Admin Role Required | Platform-wide |
| `/api/admin/system` | GET/POST | SUPER_ADMIN / OPS_MGR | Platform-wide |
| `/api/webhooks/stripe` | POST | Stripe Signature Verified | System-level |
| `/api/verify/:code` | GET | Public | Public certificate metadata only |

---

## 3. Middleware Enforcement Architecture

The edge routing policy in `middleware.ts` enforces the following logical flow:

```
Incoming Request (req.nextUrl.pathname)
│
├── Matcher Check: Is static asset / favicon / _next?
│   └── YES: Skip middleware (NextResponse.next())
│
├── Surface 1: Public Marketing & Verification (/ , /pricing, /verify/*, /login, etc.)
│   └── ALLOW. If visiting /login or /register with valid session -> Redirect to /app
│
├── Surface 2: Client Workspace (/app/* or /dashboard/*)
│   ├── Check `vl_session` or `__session`
│   ├── NO TOKEN: Redirect to `/login?returnUrl=${pathname}`
│   └── HAS TOKEN: Allow to proceed
│
└── Surface 3: Admin Console (/admin/*)
    ├── Check `vl_session` or `__session`
    ├── NO TOKEN: Redirect to `/login?returnUrl=${pathname}`
    ├── HAS TOKEN: Validate user role from session
    │   ├── Role in [SUPER_ADMIN, OPS_MGR, TRANSLATOR_REVIEWER, SUPPORT, BILLING_MGR, ANALYST]
    │   │   └── ALLOW to proceed
    │   └── Role is CUSTOMER / CLIENT_USER / INDIVIDUAL
    │       └── DENY (Redirect to `/app` with security notice or return 403)
```

This ensures that administrative surfaces are physically unreachable by unauthorized users even if URLs are guessed.
