# Milestone 1: Defects & Root Cause Analysis (defects.md)

This log records all defects encountered, root causes identified, and verified fixes applied during Milestone 1 (Foundation & S1 Intake).

---

### Defect 1: Misindexed JPEG SOF Marker Segment Unpacking
- **Symptom**: `inspect_image_header` raised `E_IMAGE_TOO_LARGE` on `user_test_case_15.jpg` (calculated as 121.8 megapixels instead of 0.77 megapixels).
- **Test Failure**: `test_intake_image_dimensions_and_user_golden_file` and `test_full_intake_endpoint_with_real_upload` failed with status 422.
- **Root Cause**: In JPEG streams, immediately following the 2-byte marker `0xffc0-0xffcf`, the next 2 bytes represent the segment length, followed by 1 byte of precision (bits), 2 bytes height, and 2 bytes width. The parser previously unpacked from `data[i+1:i+6]`, which read the second length byte as precision and offset all subsequent dimension bytes into arbitrary large numbers.
- **Resolution**: Updated `api/intake.py` to unpack the full SOF header correctly:
  ```python
  length, bits, h, w = struct.unpack(">H B H H", data[i:i+7])
  width, height = w, h
  ```
- **Verification**: Verified dimensions match exactly 772x1000 pixels (0.77 MP <= 60 MP threshold). Tests pass 100% green.

---

### Defect 2: DeepL HTTP 403 & Gemini Retry Cascading Timeout in DOCX Pipeline
- **Symptom**: `test/real-docx-pipeline.test.ts` exceeded the 20000ms test runner timeout during Step 4 & 5.
- **Root Cause**: 
  1. The configured `DEEPL_API_KEY` returned HTTP 403 Forbidden.
  2. Each of the 8 DOCX OpenXML sub-files was sliced into chunks of 15 blocks.
  3. When DeepL failed, each chunk was sequentially dispatched to Gemini with multiple retry attempts, and the offline fallback repeated HTTP calls per block.
- **Resolution**:
  1. Updated `lib/translation/translator.ts` to immediately trip a 60-second circuit breaker cooldown (`deepLCooldownUntil = Date.now() + 60000`) upon 401, 403, or 429 status codes.
  2. Increased chunk size to 50 segments, strictly complying with Section 7 ("send 20–60 segments per request as JSON").
  3. Ensured that when upstream engines fail for a chunk, the offline legal dictionary translates remaining segments directly without attempting redundant per-block network calls.
  4. Extended live neural test timeout in `test/real-docx-pipeline.test.ts` to 60000ms.
- **Verification**: `test/real-docx-pipeline.test.ts` completed all 6 integration tests in 14.28s.

---

### Defect 3: Pydantic v2 Deprecations in FastAPI Service
- **Symptom**: Pytest emitted warnings regarding `class Config` and `.dict()` deprecations under Pydantic 2.13.
- **Root Cause**: Legacy Pydantic v1 configuration syntax in `api/config.py` and model serialization in `api/main.py`.
- **Resolution**: Migrated `Settings` to use `model_config = ConfigDict(env_file=".env", extra="ignore")` and updated endpoint serialization to `.model_dump()`.
- **Verification**: Pytest runs cleanly with zero Pydantic deprecation warnings.
