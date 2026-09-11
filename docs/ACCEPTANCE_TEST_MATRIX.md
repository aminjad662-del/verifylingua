# ACCEPTANCE TEST MATRIX & VERIFICATION PROTOCOL

**Product:** VerifyLingua Enterprise Document Translation Platform  
**Version:** 1.0.0  
**Verification Standard:** Strict Evidence-Based Quality Gate  

---

## 1. Acceptance Criteria & Verification Matrix

| Category | Requirement / Test Case | Target Behavior | Verification Method | Automated Test File |
|---|---|---|---|---|
| **Security & Auth** | Edge Protection on `/app/*` | Unauthenticated requests redirected to `/login?returnUrl=...` | HTTP GET test verifying 307 redirect | `test/edge-routes.test.ts`, `test/auth.test.ts` |
| **Security & Auth** | Edge Protection on `/admin/*` | Unauthenticated requests redirected to `/login`; client users denied access | HTTP GET test verifying 307 redirect / 403 status | `test/admin-rbac-routes.test.ts` |
| **Security & Auth** | Password Security | scrypt hashing with 16-byte random salt, constant-time comparison | Unit test with valid and corrupted hashes | `test/auth.test.ts` |
| **Tenant Isolation** | Cloudflare R2 Key Generation | Keys strictly adhere to `${userId}/${documentId}/${filename}` | Unit test testing cross-tenant path attempts | `test/phase1-data-isolation.test.ts` |
| **Tenant Isolation** | Multi-Tenant Data Isolation | User A cannot query or list User B's documents or jobs | Integration test asserting zero leaked records | `test/phase1-data-isolation.test.ts`, `test/phase9-e2e.test.ts` |
| **Client Experience** | Client Workspace Shell (`/app`) | Executive hub renders recent projects, metrics, and new translation CTA | Route test verifying status 200 and component tree | `test/client-app-routes.test.ts` |
| **Client Experience** | Progressive Intake (`/app/new-translation`) | 6-stage progressive intake flow: Upload -> Configure -> Estimate -> Confirm -> Process -> Review | Component test verifying stage progression | `test/client-app-routes.test.ts` |
| **Client Experience** | Project Detail & Quality Report (`/app/projects/:id`) | Live timeline, side-by-side preview, download button, and quality scorecard | Integration test verifying job state and scorecard | `test/client-app-routes.test.ts` |
| **Client Experience** | Revision Request (`/app/projects/:id/revisions`) | Client can submit formal revision request with reason code and notes | Integration test asserting order revision state | `test/client-app-routes.test.ts` |
| **Client Experience** | Document Vault (`/app/files`) | Shows SHA-256 hashes, format badges, and secure download triggers | Route test verifying file listing | `test/client-app-routes.test.ts` |
| **Client Experience** | Usage & Telemetry (`/app/usage`) | Displays page quota, consumed pages, and percentage breakdown | Route test verifying quota meters | `test/client-app-routes.test.ts` |
| **Client Experience** | Billing & Subscription (`/app/billing`) | Shows current plan, invoices, and payment status | Route test verifying plan cards | `test/client-app-routes.test.ts` |
| **Admin Operations** | Job Queue Telemetry (`/admin/jobs`) | Operational queue shows all platform jobs, providers, and filters | Route test verifying job grid | `test/admin-rbac-routes.test.ts` |
| **Admin Operations** | Job Inspector (`/admin/jobs/:id`) | Displays detailed layout graph, provider latency, retry controls | Route test verifying job inspection | `test/admin-rbac-routes.test.ts` |
| **Admin Operations** | User Directory (`/admin/users`) | Lists platform users with role assignment capabilities | Route test verifying user management | `test/admin-rbac-routes.test.ts` |
| **Admin Operations** | Organizations (`/admin/organizations`) | Manages multi-tenant organization seats and quotas | Route test verifying organization view | `test/admin-rbac-routes.test.ts` |
| **Admin Operations** | Human Review Queue (`/admin/reviews`) | Linguist QA workbench with segment verification and sign-off | Route test verifying review queue | `test/admin-rbac-routes.test.ts` |
| **Admin Operations** | Language Governance (`/admin/languages`) | Configures active language pairs and RTL parameters | Route test verifying language table | `test/admin-rbac-routes.test.ts` |
| **Admin Operations** | Glossary Management (`/admin/glossaries`) | Configures enterprise terminology and locked passport terms | Route test verifying glossary management | `test/admin-rbac-routes.test.ts` |
| **Admin Operations** | Financial Telemetry (`/admin/billing`) | Displays revenue, subscription metrics, and Stripe invoices | Route test verifying financial stats | `test/admin-rbac-routes.test.ts` |
| **Admin Operations** | System Health (`/admin/system-health`) | Real-time latency for Gemini, DeepL, Azure, and circuit breakers | Route test verifying uptime monitors | `test/admin-rbac-routes.test.ts` |
| **Admin Operations** | Security Audit Log (`/admin/audit-log`) | Immutable audit trail filterable by actor, action, and resource | Route test verifying audit event log | `test/admin-rbac-routes.test.ts` |
| **Translation Engine** | Multi-page Text PDF Translation | Reconstructs pages, preserves tables, scales typography, and suppresses overlay | End-to-end binary test comparing page count & format | `test/phase5-layout-reconstruction.test.ts`, `test/translation.test.ts` |
| **Translation Engine** | Native DOCX Translation | Preserves OpenXML runs, tables, headers, and footers | Binary round-trip ZIP XML inspection | `test/translation.test.ts` |
| **Translation Engine** | Scanned PDF with OCR | Ingests raster PDF, runs OCR, reconstructs vector text without overlay | Bounding box OCR verification | `test/phase3-ingestion-extraction.test.ts`, `test/phase5-layout-reconstruction.test.ts` |
| **Translation Engine** | Photographed Image (PNG/JPG) | Inpaints background, renders bitmap text, preserves dimensions | Jimp image comparison asserting dimensions & bytes | `test/phase5-layout-reconstruction.test.ts`, `test/translation.test.ts` |
| **Translation Engine** | RTL (Arabic) Handling | Sets `dir="rtl"`, reflows table columns, preserves LTR proper nouns | RTL text extraction and alignment check | `test/phase4-translation-engine.test.ts`, `test/phase5-layout-reconstruction.test.ts` |
| **Translation Engine** | 429 Rate-Limit Failover | Gemini 429 immediately caught and routed to DeepL without error | Mock error interception test | `test/phase4-translation-engine.test.ts` |
| **Quality & Assurance** | Zero Fake Completion | Verifies output byte size, non-placeholder hash, and translated tokens | Programmatic quality gate verification | `test/phase6-realtime-job-ui.test.ts`, `test/document-quality-report.test.ts` |
| **Quality & Assurance** | Document Quality Report | Generates scorecard with overflow, clipping, drift, and OCR metrics | Scorecard evaluation test | `test/document-quality-report.test.ts` |
| **Design System** | Zero Raw Hex Violations | All UI elements reference semantic design tokens or CSS variables | Automated static analysis script | `scripts/check-raw-hex.js` |
| **Design System** | Type Safety & Lint | Zero TypeScript compile errors, zero ESLint errors | Automated build gates | `npx tsc --noEmit`, `npm run lint` |

---

## 2. Test Fixture Requirements

The testing framework utilizes real binary fixtures:
- `fixtures/sample_birth_cert.pdf` (Scanned Colombian birth certificate with stamps and signatures)
- `fixtures/sample_transcript.docx` (Multi-table academic transcript with headers and footers)
- `fixtures/sample_id_card.png` (National identification card with photo, barcodes, and micro-text)
- `fixtures/sample_diploma.jpg` (High-resolution photographed university diploma)
- `fixtures/corrupted_empty.pdf` (0-byte file for negative testing)
- `fixtures/oversized_payload.bin` (55MB file exceeding maximum processing threshold)

---

## 3. Strict Verification Protocol (Evidence Before Assertion)

Before any milestone or phase can be declared COMPLETE:
1. The implementation must physically exist in the repository.
2. All relevant tests must execute and pass in the terminal.
3. Raw output of the test runs must be captured and reported verbatim.
4. No test may be commented out, skipped, or deleted to force a green build.
5. All affected routes must be reachable with verified HTTP status codes.
6. The terminal must prove 0 TypeScript errors and 0 lint errors.
