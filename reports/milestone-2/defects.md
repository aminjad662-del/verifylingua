# Milestone 2 Defect Log & Root-Cause Resolutions

### Defect 1: Encrypted PDF Test Assumption Mismatch
- **Symptoms**: `test_corpus_08a_encrypted_pdf_detection` in `test_milestone1_foundation.py` failed with `IntakeError: E_PDF_PASSWORD`.
- **Root Cause**: In Milestone 1, `08a_password_protected_user.pdf` was a simulated PDF with an `/Encrypt` token that returned `{"is_encrypted": True}`. In Milestone 2, we generated real standard encryption via `pikepdf` with password `userpass123`. Opening it without a password triggered `pikepdf.PasswordError`, which correctly raised `IntakeError(code="E_PDF_PASSWORD")` instead of returning metadata.
- **Resolution**: Updated `test_corpus_08a_encrypted_pdf_detection` to assert the authentic security behavior: (1) raising `E_PDF_PASSWORD` when no password is provided, and (2) successfully unlocking and verifying `is_encrypted: True` and `page_count: 1` when `password="userpass123"` is provided.

### Defect 2: Pillow RGBA to JPEG Conversion During Sanitization
- **Symptoms**: Testing sanitization on PNGs or images with transparency converting to JPEG threw `OSError: cannot write mode RGBA as JPEG`.
- **Root Cause**: Pillow requires RGB or CMYK mode to encode standard JPEG files; passing RGBA or Palette with transparency fails during `save(format="JPEG")`.
- **Resolution**: Added mode check in `inspect_and_sanitize_image`: `transposed.convert("RGB") if transposed.mode in ("RGBA", "P") else transposed`, ensuring clean JPEG encoding without exceptions.

### Defect 3: DOCX XML Entities Attack Surface
- **Symptoms**: Default Python `xml.etree.ElementTree` is vulnerable to XML entity expansion and external entity retrieval (XXE).
- **Root Cause**: Malicious DOCX archives can contain custom DTDs in `word/document.xml` that probe local system files or cause denial of service.
- **Resolution**: Integrated `defusedxml.ElementTree` across all XML and `.rels` parsing passes in `inspect_and_sanitize_docx`. External entities now raise `EntitiesForbidden` and are rejected with `E_DOCX_SECURITY_RISK`.
