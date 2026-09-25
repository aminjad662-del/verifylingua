# Milestone 9 Defect Log & Systematic Root Cause Fixes

### Defect 1: Retention Policy Calculation Multiplied Seconds Instead of Hours
- **Symptom**: `test_gate3_retention_status_transparency` failed with `assert 2073600 == 86400`.
- **Root Cause**: In `api/store.py`, the Instant tier policy TTL was calculated using `24 * 86400` seconds. `86400` is already 24 hours in seconds (`24 * 3600`). Multiplying `24 * 86400` resulted in 24 days (2,073,600 seconds) instead of 24 hours (86,400 seconds).
- **Systematic Fix**: In `api/store.py` (both in `update_job_stage` and `get_retention_info`), corrected the calculation to `86400` seconds (24 hours) for `Instant` tier, and `30 * 86400` (2,592,000 seconds) for `Certified` tier. Verified with `test_gate2` and `test_gate3`.

### Defect 2: Missing `set_preview_output` Method on `JobStore`
- **Symptom**: `AttributeError: 'JobStore' object has no attribute 'set_preview_output'. Did you mean: 'get_preview_output'?`
- **Root Cause**: `set_rendered_output` accepted `preview_bytes` as an optional parameter and wrote to `self._preview_outputs[job_id]`, but no standalone `set_preview_output` setter existed.
- **Systematic Fix**: Added `def set_preview_output(self, job_id: str, preview_bytes: bytes):` to `JobStore` in `api/store.py`.

### Defect 3: Exact Terms Heading Mismatch in Gate 6 Test
- **Symptom**: `test_gate6_marketing_copy_and_legal_documents` assertion failed for `"100% USCIS Acceptance Guarantee" in terms_text`.
- **Root Cause**: In `docs/TERMS.md`, section 4 was originally titled `## 4. Institutional Acceptance Guarantee (Certified Mode)`, while the body copy stated "100% full refund".
- **Systematic Fix**: Updated heading in `docs/TERMS.md` to `## 4. 100% USCIS Acceptance Guarantee (Certified Mode)` to match exact institutional compliance guarantee language.
