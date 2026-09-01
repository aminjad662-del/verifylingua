# VerifyLingua - Security & Compliance Architecture

## Overview
VerifyLingua processes sensitive legal and identity documents (birth certificates, passports, marriage records, diplomas). Security, privacy, and compliance are core architectural constraints. This document details the technical implementation of our security posture.

---

## 1. Storage & Encryption Architecture

### 1.1 Private S3 Buckets & Presigned Uploads
- **Zero Public Access**: All S3 storage buckets are configured with public access blocks (`BlockPublicAcls`, `IgnorePublicAcls`, `BlockPublicPolicy`, `RestrictPublicBuckets`).
- **Presigned Upload URLs**: Documents are never proxied through application web servers. The client requests a presigned `PUT` URL with a 5-minute time-to-live (TTL) and uploads directly to AWS S3.
- **Short-TTL Download Links**: Translated deliverables and original source files are accessed exclusively via HMAC-SHA256 signed presigned URLs expiring in 15 minutes.

### 1.2 Server-Side Encryption (SSE-KMS)
- All uploaded objects are encrypted at rest using **AWS KMS Key Management Service** with 256-bit Advanced Encryption Standard (AES-256-GCM).
- Decryption keys are managed via AWS IAM policies restricted exclusively to verified translation workspace worker roles.

---

## 2. Document Retention & 90-Day Auto-Purge Policy (§11)

- **Default Lifecycle Policy**: S3 lifecycle rules automatically transition original source documents to permanent deletion **90 days** after the order status reaches `DELIVERED`.
- **Customer Vault Opt-In**: Customers who opt into the personal vault retain encrypted copies with visible countdown timers and one-tap manual deletion triggers from `/dashboard/documents` and `/dashboard/settings`.
- **Certificates of Accuracy**: Issued certificates and public verification short codes (`/verify/{code}`) retain only document cryptographic hashes (SHA-256), translator credentials, and issuance dates—never unencrypted PII.

---

## 3. Upload Validation & Anti-Tampering

### 3.1 Server-Side Magic Byte Validation
File types are validated server-side by inspecting the first bytes of the binary header rather than trusting client-provided MIME types or extensions:
- **PDF**: `%PDF-` (`0x25 0x50 0x44 0x46`)
- **JPEG**: `\xFF\xD8\xFF`
- **PNG**: `\x89PNG\r\n\x1a\n`

### 3.2 Metadata & EXIF Stripping
All client-side camera photos and uploads undergo automated metadata scrubbing to strip EXIF location data, camera serial numbers, and device fingerprints prior to S3 upload.

---

## 4. PII Protection & Telemetry Privacy

- **Zero PII in Analytics**: PostHog and logging pipelines capture only pseudonymous entity IDs (e.g., `user_id`, `order_id`). Customer names, passport transliterations, phone numbers, and OCR text extracts are strictly excluded from all telemetry payloads.
- **Audit Event Trail**: Every status change, assignment, and certificate download emits an immutable `OrderEvent` record with timestamp, action type, and actor identifier.

---

## 5. Application Hardening & Input Sanitization

- **SQL Injection Prevention**: All database access is parameterized via Prisma ORM.
- **Cross-Site Scripting (XSS)**: Untrusted user text is rendered exclusively through React JSX text nodes; `dangerouslySetInnerHTML` is prohibited across all user input surfaces.
- **Rate Limiting**: Quote calculation, OCR triage, and auth endpoints are protected by IP-based token bucket rate limiters.
- **Cryptographic Document Hashing**: Every translated file receives a canonical SHA-256 hash printed directly on the Certificate of Accuracy and verified on `/verify/[code]`.
