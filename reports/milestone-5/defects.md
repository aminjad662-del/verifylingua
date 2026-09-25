# Milestone 5 — Defect & Resolution Log (Fix-and-Retest Loop)

### Defect 1: Class Name Import Discrepancy with `api/analyze.py`
- **Symptom**: `ImportError: cannot import name 'DocumentAnalysisResult' from 'api.analyze'`.
- **Root Cause**: `api/analyze.py` exports `DocumentAnalysis`, `PageAnalysis`, and `TextBlock` (using `block.bbox` for coordinates and `block.id` for block identifier). `api/render.py` originally attempted to import hypothetical `DocumentAnalysisResult`.
- **Resolution**: Refactored `api/render.py` to import and consume `DocumentAnalysis`, `PageAnalysis`, and `TextBlock` directly, standardizing on `b.bbox` `[x0, y0, x1, y1]` and `b.id`.

### Defect 2: Vertical Coordinate Inversion in PDF Text Redaction and Overlay
- **Symptom**: Rendered text was placed 64 points from the bottom of the page instead of near the top, causing SSIM on non-text regions to measure 0.55 instead of >= 0.98.
- **Root Cause**: In `api/analyze.py`, `block.bbox` already uses the PDF standard bottom-left origin `[x0, y0, x1, y1]`. In `_redact_page_text_spans` and `_render_page_overlay`, code assumed top-down coordinates and applied `page_h - y1`, inverting the Y-axis.
- **Resolution**: Corrected coordinate arithmetic for bottom-left ReportLab canvas: `y0` and `y1` are used directly from `bbox` (`current_y = y1 - fit_res.font_size`). Non-text SSIM immediately improved from 0.55 to 1.0 (bit-for-bit exact).

### Defect 3: Mathematical White Bracket Characters in Font Coverage
- **Symptom**: `AssertionError: Font VerifyLingua-Arial lacks glyph coverage for Mixed_BiDi`.
- **Root Cause**: The test string contained raw mathematical bracket placeholders `⟦P1⟧` (`U+27E6` and `U+27E7`). Standard text fonts (such as Arial) do not include mathematical white square brackets, requiring mathematical symbol fonts (`seguisym.ttf`, `cambria.ttc`).
- **Resolution**: In `TextShaper.shape_bidi_text` and `font_manager.verify_glyph_coverage`, added normalization replacing `⟦` with `[` and `⟧` with `]`, ensuring universal glyph rendering across all target fonts without tofu.

### Defect 4: Async Def Signature in Pytest Suite
- **Symptom**: Pytest reported `async def functions are not natively supported. You need to install a suitable plugin for your async framework`.
- **Root Cause**: `pytest-asyncio` is not configured as default runner in pytest; `tests/test_milestone5_reconstruction.py` used `async def test_render_and_delivery_endpoints()`.
- **Resolution**: Replaced ASGI async client with synchronous `from fastapi.testclient import TestClient; client = TestClient(app)`, matching the working architecture in `test_milestone4_translation.py`.

### Defect 5: Missing Compound Legal Term in TypeScript Translation Engine
- **Symptom**: In vitest `test/certified-terminology.test.ts`, compound term `"El Oficial del Registro Civil"` translated to `"El Oficial del Civil Registry"` instead of `"Civil Registry Officer"`.
- **Root Cause**: `LEGAL_GLOSSARY_EN["es"]` contained `"registro civil"` but lacked `"oficial del registro civil"`. In addition, `translateStructuredBlocks` fallback previously used exact string matching rather than delegating to `translateText`.
- **Resolution**: Added `"oficial del registro civil": "Civil Registry Officer"` to `LEGAL_GLOSSARY_EN["es"]` and updated `translateStructuredBlocks` offline fallback to invoke `await translateText(b.text, options)`. All 323 vitest tests now pass green.
