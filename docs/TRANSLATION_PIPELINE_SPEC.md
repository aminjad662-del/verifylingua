# TRANSLATION PIPELINE TECHNICAL SPECIFICATION

**Product:** VerifyLingua — Autonomous Layout-Preserving Document Translation Engine  
**Document Status:** Approved Specification  
**Version:** 2.0.0  
**Authors:** AI/Computer-Vision Engineer & Staff Systems Architect  

---

## 1. Pipeline Architecture Overview

The VerifyLingua translation engine is architected as an **observable, deterministic 16-stage asynchronous pipeline**. Each stage is an independent, stateful operation with explicit inputs, outputs, timeout budgets, failure handlers, and audit logging.

```
[1. Upload] ──> [2. File Validation] ──> [3. Metadata & MIME] ──> [4. Language Detect]
      │
      ▼
[5. OCR / Text Extraction] ──> [6. Structural Graph] ──> [7. Segmentation]
      │
      ▼
[8. Contextual Translation] ──> [9. Glossary Application] ──> [10. Layout Reconstruction]
      │
      ▼
[11. Visual Rendering] ──> [12. Structural Diff] ──> [13. Quality Gate Verification]
      │
      ▼
[14. Human Review (Optional)] ──> [15. Packaging & Seals] ──> [16. Secure Delivery]
```

---

## 2. The 16 Pipeline Stages Specification

### Stage 1: Secure Ingestion & Upload
- **Input:** Raw multipart file stream or Base64 payload.
- **Output:** Encrypted temporary disk buffer, initial job metadata.
- **Timeout:** 30 seconds.
- **Idempotency Key:** SHA-256 hash of original file buffer.
- **Audit Event:** `JOB_INGESTION_STARTED`
- **User-Facing Status:** "Receiving encrypted file stream into private storage vault..."

### Stage 2: File-Type & Malware Validation
- **Input:** Raw binary buffer.
- **Output:** Verified MIME type, magic byte verification, clean malware status.
- **Supported Magic Bytes:**
  - PDF: `%PDF-` (`0x25 0x50 0x44 0x46`)
  - DOCX: `PK\x03\x04` (`0x50 0x4b 0x03 0x04`)
  - PNG: `\x89PNG\r\n\x1a\n` (`0x89 0x50 0x4e 0x47`)
  - JPG: `\xff\xd8\xff` (`0xff 0xd8 0xff`)
- **Constraints:** Max file size 50MB. Zero-byte files rejected immediately with actionable error.
- **Audit Event:** `VALIDATION_PASSED` / `VALIDATION_REJECTED`
- **User-Facing Status:** "Verifying document binary integrity and security scan..."

### Stage 3: Metadata & Dimension Extraction
- **Input:** Validated binary buffer.
- **Output:** Page count, dimensions (points or pixels), orientation, embedded fonts, image manifest.
- **Audit Event:** `METADATA_EXTRACTED`
- **User-Facing Status:** "Extracting document geometry, page count, and embedded elements..."

### Stage 4: Source-Language Auto-Detection
- **Input:** Extracted preliminary text sample (first 1,000 characters).
- **Output:** ISO-639-1 code (e.g., `es`, `fr`, `ar`, `de`, `zh`), detection confidence score (0–100%).
- **Policy:** If user pre-selected source language, verify agreement; if mismatch confidence > 95%, prompt confirmation.
- **Audit Event:** `LANGUAGE_DETECTED`
- **User-Facing Status:** "Detecting source dialect and typography script..."

### Stage 5: OCR Processing (Scanned PDFs & Raster Images)
- **Input:** Raster page images.
- **Output:** Bounding boxes, word coordinates, character-level confidence scores.
- **Engine:** Tesseract.js with preloaded `eng.traineddata` + cloud Azure Document Intelligence fallback.
- **Confidence Gate:** Average OCR confidence < 40% flags document as degraded/illegible.
- **Audit Event:** `OCR_COMPLETED`
- **User-Facing Status:** "Running neural OCR on scanned document layers..."

### Stage 6: Structural Document Parsing (Layout Graph)
- **Input:** Coordinate blocks from PDF text layer or OCR.
- **Output:** Structured Layout Graph:
  - Header / Footer regions
  - Multi-column reading orders
  - Tables: grid rows, column bounds, cell spans
  - Embedded image anchors (bounding boxes, untouched original data)
  - Signature & Official Seal anchors
- **Audit Event:** `LAYOUT_GRAPH_COMPILED`
- **User-Facing Status:** "Compiling spatial layout graph and reading order..."

### Stage 7: Text Segmentation & Entity Isolation
- **Input:** Layout graph nodes.
- **Output:** Translation segments with surrounding context references.
- **Isolation:** Passport names, USCIS Alien Numbers, case numbers, dates, and addresses isolated for entity protection.
- **Audit Event:** `SEGMENTS_PREPARED`
- **User-Facing Status:** "Segmenting paragraphs and isolating protected legal entities..."

### Stage 8: Context-Preserving Translation
- **Input:** Segment batch with document-level context (industry, document category, tone).
- **Primary Engine:** Google Gemini 3.1 Pro via `@google/genai`.
- **Failover Engine:** DeepL Free/Pro API. Triggered automatically on HTTP 429 (Rate Limit) or 5xx provider errors.
- **RTL Script Handling (Arabic):**
  - Text direction explicitly set to `dir="rtl"`.
  - Proper nouns and numerals preserved in correct bidirectional runs (BiDi).
  - Arabic punctuation marks correctly oriented.
- **Audit Event:** `TRANSLATION_COMPLETED`
- **User-Facing Status:** "Executing context-aware neural translation with zero content drift..."

### Stage 9: Terminology & Glossary Injection
- **Input:** Translated segments + Client/Order Glossary Terms.
- **Output:** Harmonized target text with exact entity locking (e.g., names matching passport romanization).
- **Audit Event:** `GLOSSARY_ENFORCED`
- **User-Facing Status:** "Enforcing locked legal terminology and passport spellings..."

### Stage 10: Layout Reconstruction
- **Input:** Translated text + Original layout graph + Untouched embedded assets.
- **Format-Specific Reassembly:**
  - **DOCX:** OpenXML `<w:t>` replacement, `<w:rPr>` run formatting preserved, `<w:tbl>` cell widths retained, `<w:headerReference>` intact.
  - **PDF:** Bounding box inpainting (removing source text cleanly without overlapping layers), dynamic font size scaling (shrinking font up to 25% if text expansion exceeds box), and vector text drawing.
  - **Images:** Localized background patching + sub-pixel text rendering matching target coordinates.
- **Banned Pattern:** Never overlay translated text on top of unmasked source text.
- **Audit Event:** `RECONSTRUCTION_COMPLETED`
- **User-Facing Status:** "Reconstructing 1:1 visual layout, typography, and tables..."

### Stage 11: Visual Rendering
- **Input:** Reconstructed document model.
- **Output:** Final rendered document binary in identical file format (PDF -> PDF, DOCX -> DOCX, PNG -> PNG, JPG -> JPG).
- **Audit Event:** `RENDERING_COMPLETED`
- **User-Facing Status:** "Rendering high-resolution vector output..."

### Stage 12: Structural Comparison & Drift Scoring
- **Input:** Original layout graph vs. Reconstructed layout graph.
- **Evaluation Criteria:**
  - Page count parity (must equal original unless target language expansion physically mandates a clean page break).
  - Table column alignment drift (deviation in points).
  - Embedded image count and resolution parity (must be 100% identical).
- **Drift Score:** 0 (Zero Drift) to 100 (Severe Drift).
- **Audit Event:** `STRUCTURAL_QA_SCORED`
- **User-Facing Status:** "Performing sub-pixel visual comparison against original..."

### Stage 13: Quality Gate Verification (Zero Fake Completion)
- **Checks:**
  1. Output buffer length > 100 bytes and valid format header.
  2. Output SHA-256 hash differs from source hash (document was actually modified).
  3. Output SHA-256 hash does not match known stock/placeholder assets.
  4. Content signature check: target text contains translated vocabulary, not raw source tokens.
- **Failure Behavior:** If any check fails, status transitions to `FAILED` with explicit error diagnostic.
- **Audit Event:** `QUALITY_GATE_PASSED` / `QUALITY_GATE_FAILED`
- **User-Facing Status:** "Validating automated quality criteria and certification rules..."

### Stage 14: Optional Human Review (Certified Legal Mode)
- **Applies When:** `serviceTier === "CERTIFIED"` or `HUMAN_REVIEW_REQUIRED`.
- **Workflow:**
  1. Job enters `HUMAN_REVIEW_REQUIRED` queue.
  2. Assigned to ATA-accredited or professional linguist in `/admin/reviews`.
  3. Side-by-side verification in Translator Workbench (`/translator/workbench/:id`).
  4. Linguist approves or edits segments.
  5. Cryptographic signature and USCIS Certificate of Translation issued.
- **Audit Event:** `HUMAN_REVIEW_APPROVED`
- **User-Facing Status:** "Under final review by accredited legal linguist..."

### Stage 15: Output Packaging & Security Sealing
- **Input:** Validated translated document + Certification documents (if certified).
- **Output:** Final download package, cryptographic QR code seal, tamper-evident SHA-256 signature.
- **Audit Event:** `PACKAGE_SEALED`
- **User-Facing Status:** "Affixing cryptographic verification seals and packaging..."

### Stage 16: Secure Delivery & Retention Scheduling
- **Input:** Final packaged document.
- **Output:** Short-lived pre-signed download token, automated client notification.
- **Retention:** Logged to user vault. Auto-delete timer scheduled based on client retention policy (e.g., 14 days, 30 days, or indefinite).
- **Audit Event:** `READY_FOR_DOWNLOAD`
- **User-Facing Status:** "Translation complete and verified. Ready for instant download."

---

## 3. Format-Specific Handling Matrix

| Dimension | PDF Documents | DOCX Word Files | Scanned Images (PNG/JPG) |
|---|---|---|---|
| **Extraction Tool** | `pdf-lib` + `pdfjs-dist` | `jszip` + OpenXML DOM | `tesseract.js` + `jimp` |
| **OCR Required?** | Only if text layer is empty (<50 chars) | Never | Always |
| **Image Handling** | Stream copied without recompression | Media folder (`word/media/*`) untouched | Background texture masked; geometry locked |
| **Table Preservation** | Coordinate bounding box containment | Native OpenXML `<w:tbl>` XML elements | Grid coordinate detection & cell patching |
| **Typography Scaling** | Dynamic pt scale: `Math.min(origPt, origWidth / textWidth)` | Proportional font point size in `<w:sz>` | Pixel scale matching box height/width |
| **Output Format** | High-fidelity Vector PDF | Native `.docx` archive | Preserved original format (`.png` / `.jpg`) |
| **Known Limits** | Heavily compressed rasterized fonts | Third-party custom macro XML plugins | Glare / extreme photographic distortion |

---

## 4. Document-Quality Report Schema

Every processed job produces a machine-readable and user-inspectable `DocumentQualityReport`:

```typescript
export interface DocumentQualityReport {
  jobId: string;
  overallStatus: "PASSED" | "PASSED_WITH_WARNINGS" | "FAILED";
  fidelityScore: number; // 0 - 100
  metrics: {
    textExtractionCompleteness: number; // 0 - 100%
    missingOrUntranslatedSegments: number;
    overflowDetected: boolean;
    overflowCount: number;
    clippingDetected: boolean;
    pageCountOriginal: number;
    pageCountTranslated: number;
    pageCountChanged: boolean;
    fontSubstitutions: { original: string; substituted: string }[];
    tableDeformationDetected: boolean;
    tableDriftPoints: number;
    ocrConfidenceAvg: number; // 0 - 100%
    translationConfidenceAvg: number; // 0 - 100%
  };
  humanReviewRequired: boolean;
  humanReviewReason?: string;
  notes: string[];
  generatedAt: string;
}
```
