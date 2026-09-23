# Open Source & Model Licensing Audit (LICENSES.md)

This document audits all dependencies, libraries, and machine learning models planned or used in the VerifyLingua Document Translation Service to ensure strict compliance for a closed-source, commercially distributed SaaS platform.

---

## 1. Commercial SaaS Licensing Policy
- **Permissive Licenses Allowed**: MIT, Apache 2.0, BSD-2-Clause, BSD-3-Clause, ISC, SIL Open Font License (OFL) 1.1, Python Software Foundation (PSF), Unlicense.
- **Copyleft / Viral Licenses Prohibited in Application Core**:
  - **AGPL-3.0**: Strictly banned from direct library linking or inclusion in closed-source proprietary codebases (e.g. PyMuPDF / MuPDF without a commercial Artifex license, Ghostscript without commercial license).
  - **GPL-2.0 / GPL-3.0**: Prohibited from direct static/dynamic linking in application services unless operating as independent command-line subprocesses over standard OS pipes.
- **LGPL-2.1 / LGPL-3.0**: Allowed for dynamically linked shared libraries (e.g. HarfBuzz, FreeType, libraqm) provided no modifications to the library are statically compiled into proprietary binaries.
- **Model Weights & Datasets**: Must permit commercial use without revenue caps or non-commercial (NC) restrictions (e.g. CC-BY 4.0, Apache 2.0, OpenRAIL-M with commercial rights).

---

## 2. Dependency Audit Matrix

| Component / Library | Version / Scope | Stated License | Closed-Source SaaS Status | Alternative / Isolation Strategy |
| :--- | :--- | :--- | :--- | :--- |
| **pypdfium2 / PDFium** | 4.x / Python PDF engine | Apache 2.0 / BSD 3-Clause | **OK for SaaS** | Replaces AGPL PyMuPDF for fast, permissive PDF rendering and page geometry. |
| **pikepdf / qpdf** | 8.x / Low-level PDF repair & security | MPL-2.0 / Apache 2.0 | **OK for SaaS** | File structure repair, encryption removal, metadata stripping. Weak copyleft MPL-2.0 permits SaaS use without opening proprietary code. |
| **pdf-lib** | 1.17.x / TypeScript PDF builder | MIT | **OK for SaaS** | Node.js / TypeScript PDF generation, form field handling, vector overlay. |
| **pdfjs-dist** | 4.x / Mozilla PDF extraction | Apache 2.0 | **OK for SaaS** | Ingestion text layer extraction and bounding box coordinate geometry. |
| **python-docx** | 1.1.x / DOCX manipulation | MIT | **OK for SaaS** | Native OpenXML parsing and run-level reconstruction. |
| **defusedxml / lxml** | 0.7.x / XML parsing | Python (PSF) / BSD | **OK for SaaS** | Hardened XML parser guarding against XXE and entity expansion attacks. |
| **Pillow (PIL)** | 10.x / Image processing | HPND (MIT-like) | **OK for SaaS** | Image decoding, DPI preservation, EXIF orientation handling. |
| **uharfbuzz / HarfBuzz** | 0.40.x / Font shaping engine | MIT / Old MIT | **OK for SaaS** | HarfBuzz text shaping for complex scripts, Arabic BiDi, ligatures, and diacritics. |
| **fontTools** | 4.x / Font inspection & subsetting | MIT | **OK for SaaS** | `cmap` character coverage verification, font subsetting for minimal payload. |
| **Google Noto Fonts** | Full script suite (Noto Sans/Serif, Noto Arabic, Noto CJK) | SIL Open Font License 1.1 | **OK for SaaS** | Universal open-licensed fallback fonts across Latin, Arabic, Cyrillic, and CJK. |
| **IBM Plex Fonts** | IBM Plex Sans / Sans Arabic | SIL Open Font License 1.1 | **OK for SaaS** | High-readability technical and corporate font families. |
| **Tesseract OCR (tesseract-ocr)** | 5.x / OCR engine | Apache 2.0 | **OK for SaaS** | Traditional OCR baseline for scanned documents. |
| **PaddleOCR (PP-OCRv4)** | Detection & Recognition | Apache 2.0 | **OK for SaaS** | Lightweight, high-accuracy multilingual line-level OCR. |
| **FastAPI / Starlette / Uvicorn** | Web framework & ASGI server | MIT / BSD | **OK for SaaS** | High-throughput asynchronous REST API and worker endpoints. |
| **Celery / Redis** | Distributed task queue | BSD 3-Clause / BSD 3-Clause | **OK for SaaS** | Decoupled background task dispatch and rate limiting. |
| **Prisma / PostgreSQL** | ORM & Relational DB | Apache 2.0 / PostgreSQL License | **OK for SaaS** | Transactional ledger, job state, and audit logs. |
| **Next.js / React** | Frontend framework | MIT | **OK for SaaS** | Web application and studio interface. |
| **Framer Motion / GSAP** | Animation engines | MIT / Free Standard Commercial (GSAP 3) | **OK for SaaS** | Tactile micro-interactions and scroll orchestration. |

---

## 3. Prohibited Packages & Approved Replacements

1. **PyMuPDF (fitz)**:
   - *License*: GNU AGPL v3.0 / Commercial.
   - *Verdict*: **REJECTED** for direct closed-source linking.
   - *Replacement*: `pypdfium2` (Apache-2.0 / BSD-3-Clause) for PDF rasterization and rendering; `pikepdf` (MPL-2.0) for structural manipulation and PDF sanitization.
2. **Ghostscript**:
   - *License*: GNU AGPL v3.0.
   - *Verdict*: **REJECTED**.
   - *Replacement*: Native LibreOffice headless CLI via sandboxed worker container for DOCX->PDF verification; `qpdf` via `pikepdf` for PDF linearization and repairs.
3. **BabelDOC / PDFMathTranslate**:
   - *License*: AGPL v3.0.
   - *Verdict*: **REJECTED** from direct codebase inclusion. Concepts used only as high-level architectural references.

---

## 4. Verification Checkpoint
All dependencies selected for Milestone 1 through Milestone 10 have been verified against commercial SaaS distribution criteria. No AGPL-licensed code or non-commercial model weights are bundled into the proprietary distribution.
