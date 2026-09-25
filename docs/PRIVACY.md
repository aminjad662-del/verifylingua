# VerifyLingua Privacy Policy & Data Retention Schedule
**Effective Date:** September 24, 2026  
**Compliance Framework:** GDPR (Regulation EU 2016/679), CCPA/CPRA, USCIS 8 CFR § 103.2

---

## 1. Overview and Core Privacy Commitment
VerifyLingua ("we", "us", or "our") provides layout-preserving automated document processing and certified translation services. We process sensitive legal documents, including passports, birth certificates, marriage certificates, contracts, and immigration filings. 

We operate on a **Zero Document Retention** and **Strict Confidentiality** architecture:
1. **Zero Model Training:** Your uploaded documents, extracted texts, and translated outputs are **never** used to train, tune, or evaluate any artificial intelligence or machine learning models.
2. **Deterministic Lifecycle Purging:** All document binary payloads and extracted text segments are automatically destroyed pursuant to hard time-to-live (TTL) policies.
3. **Immediate Self-Serve Erasure:** You maintain the absolute right to purge your documents and extracted text at any second with a single click or API call.

---

## 2. Retention Schedules (Stage S10 Lifecycle)

| Service Tier | Document Retention Window | Data Subject to Hard Purge | Post-Purge Tombstone |
|---|---|---|---|
| **Instant Translation** | **24 Hours** from job completion | Raw files, sanitized buffers, rendered outputs, and segment text | Anonymized job ID, page count, and timestamp (zero text) |
| **Certified Human Review** | **30 Days** from linguist certification | Raw files, sanitized buffers, rendered outputs, and segment text | Cryptographic certificate hash, verification code, and ATA audit log |
| **User-Initiated Deletion** | **Immediate (0 seconds)** upon clicking "Delete Job" | All binary files, preview cache, and text segments scrubbed to `[PURGED]` | Minimal tombstone audit entry for system integrity |

### Technical Purge Mechanics
Upon expiration of the retention window or receipt of an immediate deletion request (`DELETE /api/jobs/{id}`):
- Storage objects in S3/R2 are permanently deleted with zero recovery capability.
- In-memory raster and vector cache buffers are overwritten and deallocated.
- Database records for document segments (`source_text`, `translated_text`, `source_markup`, `translated_markup`) are permanently scrubbed and overwritten with `"[PURGED]"`.
- Document names and numbers are purged from active memory.

---

## 3. Named Subprocessors
VerifyLingua maintains strict Data Processing Agreements (DPAs) with standard contractual clauses (SCCs) and enterprise zero-data-retention agreements with all third-party infrastructure providers:

| Subprocessor | Corporate Entity | Purpose & Activity | Data Residency & Security |
|---|---|---|---|
| **Cloudflare, Inc.** | Cloudflare R2 | Ephemeral encrypted storage for uploaded and rendered documents | US / EU encrypted at rest (AES-256) |
| **Google Cloud Platform** | Google LLC | Translation and high-precision OCR correction via Gemini Enterprise API | Zero data retention; excluded from training |
| **DeepL SE** | DeepL SE (Germany) | Translation engine failover and consistency verification | ISO 27001 certified; zero data retention |
| **Stripe, Inc.** | Stripe, Inc. | Credit card processing and billing ledger | PCI-DSS Level 1 Service Provider |

---

## 4. Security Architecture
- **In-Transit Encryption:** All network communication is enforced via TLS 1.3 with HSTS.
- **At-Rest Encryption:** Storage buckets and database volumes utilize hardware-accelerated AES-256 encryption.
- **Sandboxed Execution:** Document intake, sanitization, and rendering workers run in isolated, unprivileged containers with disabled network egress and strict memory/CPU quotas.
- **Presigned Temporary Access:** Download URLs are short-lived (maximum 900 seconds / 15 minutes TTL) and cryptographically signed.

---

## 5. Your Rights Under GDPR and CCPA
You possess the right to:
- **Right to Erasure (Article 17 GDPR):** Triggered immediately via the `/api/jobs/{id}` endpoint or the "Delete Document" button in the Result Viewer.
- **Right to Access & Rectification:** Review and edit translated segments in the interactive Segment Editor prior to final download or certification.
- **Right to Restrict Processing:** Prevent certified reviewer queue assignment by retaining automated Instant mode.

For legal inquiries or data protection officer inquiries, contact `privacy@verifylingua.com`.
