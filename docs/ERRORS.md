# Error Catalog (docs/ERRORS.md)

VerifyLingua enforces actionable, specific, and code-indexed error handling across all stages of document ingestion, parsing, translation, reconstruction, and delivery. Generic or unhelpful error messages are strictly prohibited.

---

## 1. Error Response Contract

Every error returned by the API or emitted by pipeline workers conforms to the following schema:

```json
{
  "error": {
    "code": "E_CODE_NAME",
    "message": "Human-readable user-facing explanation of what happened.",
    "action": "Immediate recommended step the user can take to resolve the error.",
    "stage": "intake | classification | extraction | translation | reconstruction | qa",
    "page": 1,
    "details": {}
  }
}
```

---

## 2. Ingestion & Security Errors (S1)

| Code | HTTP | User Message | Actionable Guidance |
| :--- | :--- | :--- | :--- |
| `E_TYPE_MISMATCH` | 415 | "The uploaded file format does not match its file extension." | "Please re-export your document as a standard PDF, DOCX, PNG, or JPG file and re-upload." |
| `E_FILE_TOO_LARGE` | 413 | "The file exceeds the 50 MB maximum upload limit." | "Please compress your document below 50 MB or split large attachments before uploading." |
| `E_PAGE_LIMIT_EXCEEDED`| 422 | "This document contains {pages} pages, which exceeds the 100-page limit." | "Please trim your document to 100 pages or fewer, or contact enterprise support for bulk batch processing." |
| `E_IMAGE_TOO_LARGE` | 422 | "This image is {megapixels} megapixels; the platform limit is 60 MP." | "Please export or resample your image to under 60 megapixels before uploading." |
| `E_PDF_PASSWORD` | 401 | "This PDF is encrypted with a user password." | "Please enter the document password to decrypt in memory and continue processing." |
| `E_PDF_CORRUPT` | 422 | "The PDF file structure is corrupted and could not be recovered." | "Please re-export or re-save the PDF from the original application and try again." |
| `E_PDF_ACTIVE_CONTENT` | 422 | "This PDF contains prohibited active elements (scripts, external actions, or embedded executables)." | "The platform has sanitized the document for security. Please review and re-confirm submission." |
| `E_DOCX_SECURITY_RISK` | 422 | "The DOCX package contains macros or suspect external entity definitions." | "Please save the Word document as a clean .docx file without macros (.docm is not supported)." |
| `E_MALICIOUS_PAYLOAD` | 400 | "The upload failed security verification checks." | "The file could not be verified by our intake security filters. Please check your file." |

---

## 3. Analysis & OCR Errors (S2 - S4)

| Code | HTTP | User Message | Actionable Guidance |
| :--- | :--- | :--- | :--- |
| `E_PAGE_BROKEN_ENCODING`| 422 | "Page {page} has corrupted font encoding (unmapped CID characters)." | "We automatically routed this page to visual OCR to recover text accurately." |
| `E_PAGE_OCR_LOW_CONFIDENCE`| 200/Warn| "Page {page} appears blurry or low-contrast; some text segments have low confidence." | "Review the extracted text in the segment editor or submit for Certified Review." |
| `E_TABLE_DETECTION_FAILED`| 200/Warn| "A complex table layout on page {page} could not be fully parsed into rows." | "Check the reconstructed table preview; column alignment can be adjusted in the editor." |
| `E_HANDWRITING_DETECTED`| 200/Warn| "Handwritten text was detected on page {page}." | "Automated translation does not support handwriting. Upgrade to Certified Human Review for official transcription." |

---

## 4. Translation Engine Errors (S5 - S7)

| Code | HTTP | User Message | Actionable Guidance |
| :--- | :--- | :--- | :--- |
| `E_TRANSLATION_TIMEOUT` | 504 | "Translation upstream provider timed out while processing page {page}." | "The system automatically retried with our secondary fallback translation engine." |
| `E_PROVIDER_QUOTA_EXHAUSTED`| 429 | "Primary translation engine capacity reached." | "Traffic has been shifted seamlessly to our secondary translation provider." |
| `E_TAG_MISMATCH` | 422 | "Formatting tokens or protected numbers were disrupted during translation." | "The segment was automatically re-translated with strict syntax enforcement." |
| `E_LANGUAGE_UNSUPPORTED`| 422 | "The requested language pair is not currently supported in v1." | "Please select from our core v1 languages (EN, ES, FR, AR, PT, DE, IT, ZH)." |

---

## 5. Reconstruction & Formatting Errors (S8)

| Code | HTTP | User Message | Actionable Guidance |
| :--- | :--- | :--- | :--- |
| `E_FONT_MISSING_GLYPH` | 200/Warn| "Target language required glyphs missing from primary font." | "Automatically fell back to Google Noto / IBM Plex unicode font family to prevent tofu squares." |
| `E_OVERFLOW_MITIGATED` | 200/Warn| "Translated text on page {page} exceeded original boundary." | "Font size was reduced to {scale}% to fit the block without overlapping adjacent elements." |
| `E_RTL_SHAPING_WARNING`| 200/Warn| "Bidirectional text detected on page {page}." | "Applied HarfBuzz text shaping with Unicode directional isolates for numbers and Latin entities." |

---

## 6. QA Gate Errors (S9)

| Code | HTTP | User Message | Actionable Guidance |
| :--- | :--- | :--- | :--- |
| `E_QA_TOKEN_MISSING` | 422 | "A protected token (passport number, date, or currency value) was altered." | "Re-rendering page {page} to guarantee 100% token preservation." |
| `E_QA_NON_TEXT_ALTERED`| 422 | "Original image, seal, or graphic on page {page} was modified (SSIM < 0.98)." | "Re-compositing original graphic layer onto the translated document." |
| `E_PAGE_FAILED` | 200/Warn| "Page {page} could not be reconstructed to target quality." | "Page {page} was preserved in its original language. You can retry this page or request certified translation." |

---

## 7. Account & Billing Errors

| Code | HTTP | User Message | Actionable Guidance |
| :--- | :--- | :--- | :--- |
| `E_INSUFFICIENT_CREDITS`| 402 | "Your account does not have enough page credits to process this document." | "Top up your credits or choose an Instant translation credit pack." |
| `E_UNAUTHORIZED_ACCESS` | 403 | "You do not have permission to view or download this document." | "Log in with the account that submitted the translation job." |
| `E_DOWNLOAD_EXPIRED` | 410 | "The temporary download link for this document has expired." | "Click 'Regenerate Download Link' to obtain a fresh 15-minute presigned URL." |
