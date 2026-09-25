# Milestone 9 Completion Report
## Commercial Pricing, Accounts, S10 Retention & Deletion Lifecycle, Marketing Pages & Legal Drafts

---

### Executive Summary
Milestone 9 establishes VerifyLingua's commercial foundation, stage S10 data retention lifecycle, account credit architecture, institutional legal terms, and marketing alignment with the core phrase **"automated document processing"**.

All 6 quality gates passed with zero regressions across the entire test suite (69 / 69 tests passed).

---

### Deliverables & Architecture Built

#### 1. Stage S10 Retention & Deletion Lifecycle Engine (`api/retention.py`, `api/store.py`, `api/main.py`)
- **Deterministic Retention Schedules**:
  - **Instant Tier**: 24 hours (86,400 seconds) post-completion automatic hard purge.
  - **Certified Tier**: 30 days (2,592,000 seconds) post-completion automatic hard purge.
  - **Presigned Download TTL**: 900 seconds (15 minutes).
- **Immediate User-Initiated Deletion (`DELETE /api/jobs/{id}`)**:
  - Permanently purges raw file payloads, sanitized buffers, rendered outputs, and preview image cache.
  - Scrubs all database text segments (`source_text`, `translated_text`, markup) to `"[PURGED]"`.
  - Maintains minimal immutable tombstone record (ID, page count, deletion timestamp) without personal data.
  - Logs audit event (`job_purged`) with freed byte count and actor, zero text logged.
- **Scheduled Retention Lifecycle Daemon (`POST /api/admin/retention/cleanup`)**:
  - Periodic automated sweep identifying expired jobs.
  - Supports `dry_run=True` simulation mode.
  - Transparent status reporting via `GET /api/jobs/{id}/retention`.

#### 2. Commercial Pricing Catalog & Stripe Webhooks (`api/commercial.py`, `lib/pricing.ts`)
- **Instant Credit Packs**:
  - **Starter Pack**: 25 pages @ $9.99 ($0.40/page).
  - **Professional Pack**: 100 pages @ $29.99 ($0.30/page).
  - **Agency Monthly**: 500 pages @ $119.00/mo ($0.24/page).
- **Certified Translation Pricing**:
  - Base: $24.95 per page (standard 250 words/page).
  - Expedited Turnaround: +$14.95.
  - Notarization: +$19.00.
  - Apostille Coordination: +$49.00.
- **Stripe Checkout & Idempotency**:
  - `POST /api/billing/checkout` creates cryptographically tracked checkout sessions.
  - `POST /api/webhooks/stripe` handles `checkout.session.completed` and `invoice.payment_succeeded` with atomic user credit allocation.
  - Replay defense: duplicate webhook event IDs return `DUPLICATE_IGNORED` and prevent double-granting credits.
- **Account Telemetry**:
  - `GET /api/accounts/{id}/balance` returns available credits, reserved credits, lifetime pages used, and active job count.

#### 3. Legal Documents & Zero-Training Compliance (`docs/PRIVACY.md`, `docs/TERMS.md`)
- Detailed data retention schedules (24 hours Instant, 30 days Certified, immediate self-serve deletion).
- Named subprocessors: Cloudflare R2 / AWS S3, Google Cloud Platform (Gemini Enterprise), DeepL SE, Stripe.
- Strict No-Training Commitment: zero customer data retention for model training.
- USCIS 8 CFR § 103.2 and § 204.2 institutional acceptance guarantee (24h re-certification or 100% refund).

#### 4. Marketing Pages Copy Alignment ("Automated Document Processing")
- Seamless integration of the phrase **"automated document processing"** across:
  - `app/layout.tsx` (title and meta description)
  - `app/pricing/page.tsx` (header subtitle and service description)
  - `app/how-it-works/page.tsx` (hero copy and architecture walkthrough)
  - `app/privacy/page.tsx` (hero and compliance sections)
  - `app/terms/page.tsx` (service scope and tiers)
  - `components/marketing/SpyglassHero.tsx` (flagship hero description)

---

### Test Evidence
- `tests/test_milestone9_retention_commercial.py`: 6 / 6 passed.
- Full regression suite (`tests/`): 69 / 69 passed (100% green).
