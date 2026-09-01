# Phase 9 Implementation Plan: i18n/RTL, a11y & Security Hardening, Database Seeding, and Deployment Guide

## Objectives
1. Implement **Database Seeding** (`prisma/seed.ts`):
   - Seed accredited translators (Elena V., Tariq A., Carlos M., Mei L.) with ATA credentials and active language pairs.
   - Seed sample demo orders across multiple statuses (`TRANSLATING`, `DELIVERED`, `QA_READY`) with real `OrderEvent` event logs and `Certificate` records.
   - Add `"prisma": { "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts" }` in `package.json`.
2. Write **Security & Compliance Architecture Document** (`docs/SECURITY.md`):
   - Presigned S3 uploads with AES-256 Server-Side Encryption (SSE-KMS).
   - Short-TTL signed URLs for document access.
   - 90-day automatic document retention purge lifecycle.
   - PII protection (PostHog gets anonymous IDs only).
   - Server-side magic byte validation & EXIF metadata stripping.
   - Strict Content Security Policy (CSP) headers and input sanitization.
3. Write Comprehensive **Production README.md**:
   - Quickstart guide: clone, fill `.env`, run `pnpm db:seed && pnpm dev`.
   - Complete architectural walkthrough and moat map.
   - Testing guide: `pnpm test`, `pnpm build`.
   - Stripe test card reference for guest checkout walkthrough.
4. Run Full Verification:
   - `node scripts/check-raw-hex.js`
   - `npx vitest run`
   - `npx next build`
