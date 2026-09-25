# Milestone 10 Defect Log & Systematic Root Cause Fixes

### Defect 1: Image Format Routing in Translation, Rendering, and QA Endpoints
- **Symptom**: `PdfiumError: Failed to load document (PDFium: Data format error)` during Gate 5 execution of golden test file #15 (`user_test_case_15.jpg`).
- **Root Cause**: In `api/main.py`, the endpoints `translate_job_content`, `render_job_document`, and `run_job_qa_stage` only checked `if job.sourceFormat.lower() == "docx":`, falling through to `analyze_pdf_document(bytes_to_translate)` for all other file types. When processing image formats (`jpg`, `jpeg`, `png`), attempting to parse JPEG/PNG raw bytes with `pypdfium2.PdfDocument` threw a fatal format error.
- **Systematic Fix**:
  1. Implemented `analyze_image_document` in `api/analyze.py` to extract image geometry, build single-page `DocumentAnalysis` with `kind="image_only"`, and create spatial layout text blocks.
  2. Updated `api/main.py` in `analyze_job_layout`, `translate_job_content`, `render_job_document`, and `run_job_qa_stage` to branch on `elif job.sourceFormat.lower() in ("jpg", "jpeg", "png"): analysis = analyze_image_document(...)`.
  3. Added civil registry translations to `_offline_translate` in `api/translate.py` for English, French, and Arabic (BiDi RTL) with strict protected token preservation (`⟦X1⟧`, `⟦D1⟧`, `⟦P1⟧`).
  4. Verified with `pytest tests/test_milestone10_production_hardening.py -k test_gate5` (100% pass).

### Defect 2: Corpus Manifest Structure Mismatch in Compliance Audit
- **Symptom**: `KeyError: 'corpus_files'` during Gate 6 full corpus manifest audit.
- **Root Cause**: `tests/corpus/manifest.json` defines a root object with the key `"corpus"` (dictionary with keys `"01"` through `"15"`), rather than an array under `"corpus_files"`.
- **Systematic Fix**: Updated Gate 6 in `tests/test_milestone10_production_hardening.py` to parse `data["corpus"].values()` with expected file naming and schema validation. Verified 15/15 files present and compliant.
