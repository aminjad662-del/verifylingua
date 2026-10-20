# Dual-Pipeline Document Translation & Layout Reconstruction: Test Infrastructure & E2E Methodology

**Document:** `TEST_INFRA.md`  
**Target System:** VerifyLingua S8 Dual-Pipeline Reconstruction System  
**Author:** `teamwork_preview_test_writer_e2e` (Quality Assurance & Systems Specialist)  
**Status:** Canonical E2E Test Specification  

---

## 1. Architectural Testing Philosophy

The VerifyLingua certified document translation platform replaces legacy rectangular bounding-box masking with a decoupled **Dual-Pipeline Layout Reconstruction System**:

```
                              [Incoming Document]
                                       |
                   +-------------------+-------------------+
                   |                                       |
                   v                                       v
      [Scanned Document / Bitmap]               [Native Vector PDF]
                   |                                       |
       ScannedDocumentPipeline                   NativeVectorPipeline
  (api/reconstruction/scanned_pipeline.py)   (services/vector_pipeline.py)
                   |                                       |
  ├── StrokeSegmenter (Adaptive/Otsu)        ├── Hierarchical Span Extraction (MuPDF AST)
  ├── DocumentInpaintingService (Telea/LaMa)  ├── Zero-White-Patch Redaction (Stream / fill=None)
  ├── InkSampler (Median Core RGB)           ├── Arabic BiDi Shaping (HarfBuzz / UAX #9)
  ├── TypographicFitter (Scale / Condense)   ├── Non-Destructive Coordinate Re-insertion
  └── PaperTextureCompositor (Multiply)      └── 100% Vector Geometry & Table Line Integrity
```

### The "Zero White Patch" Imperative
Legacy document translation software erases source text by drawing opaque white rectangular boxes (`c.rect(..., fill=True)` or `draw.rectangle(...)`) across bounding boxes. This causes catastrophic visual degradation:
1. On **scanned documents**: Obliterates organic paper grain, parchment textures, guilloche security patterns, watermarks, stamps, and signatures.
2. On **native vector PDFs**: Obliterates vector gridlines, cell borders, shaded background bands, and column dividers.

The test infrastructure enforces strict **opaque-box testing** verifying that both pipelines eliminate white-patch artifacts while maintaining mathematical and typographic fidelity.

---

## 2. 4-Tier E2E Testing Methodology

The test suite in `tests/test_e2e_dual_pipeline.py` implements a hierarchical 4-tier verification matrix:

```
+-----------------------------------------------------------------------------------+
| Tier 4: Real-World Scenarios                                                      |
| - Civil Birth Certificate (Bilingual AR/EN/ES, Stamps, Official Seal)             |
| - Academic Transcript (Two-Column Layout, Course Grids, Vertical Divider Line)    |
| - Corporate Financial Balance Sheet (Dense Multi-Row Table, Precision Gridlines)  |
+-----------------------------------------------------------------------------------+
                                         ^
                                         |
+-----------------------------------------------------------------------------------+
| Tier 3: Cross-Feature Interactions                                                |
| - Vector Table Line Preservation with Arabic BiDi Cell Re-insertion               |
| - Scanned Certificate with Intersecting Red Stamps & Translated Signature Blocks  |
| - Multi-Page Hybrid Document Handling (Vector Pages + Scanned Pages in Single PDF)|
+-----------------------------------------------------------------------------------+
                                         ^
                                         |
+-----------------------------------------------------------------------------------+
| Tier 2: Boundary & Corner Cases                                                   |
| - Empty Mask / Zero-Text Document Handling                                        |
| - Inverted Polarity Text (Light Text on Dark / Inverted Backgrounds)              |
| - Zero-Width and Collapsed Spans (Degenerate Bounding Boxes)                      |
| - Single-Character Isolated Text Blocks                                           |
| - Extreme Text Expansion (>50% character growth, German/French/Arabic)            |
| - Mixed BiDi Latin-Arabic Script with Embedded Numbers & Punctuation              |
+-----------------------------------------------------------------------------------+
                                         ^
                                         |
+-----------------------------------------------------------------------------------+
| Tier 1: Feature Coverage                                                          |
| - Scanned Stroke Segmentation Mask (<25% Bounding Box Area)                       |
| - Fast Telea Inpainting (<20ms CPU execution)                                     |
| - Pluggable LaMa Neural Inpainting Architecture                                   |
| - Median Ink Sampling Across Core Stroke Pixels with Contrast Clamping            |
| - Typographic Auto-Scaling & Letter-Spacing Condensation                         |
| - Optical Gaussian Blur & Multiply Blend Compositing                              |
| - Native Vector PDF Stream Redaction & Zero White Patch Verification              |
| - PyMuPDF Hierarchical Span Extraction (Coordinates, Fonts, Flags, sRGB Color)    |
| - Arabic BiDi Shaping & Glyph Normalization                                       |
+-----------------------------------------------------------------------------------+
```

---

### Tier 1: Isolated Feature Coverage

Validates that every modular component satisfies its contract in isolation:

| Feature Under Test | Component / Interface | Verification Criteria | Expected Outcome |
| :--- | :--- | :--- | :--- |
| **Stroke Segmentation Mask** | `StrokeSegmenter.segment_box()` | Dilated stroke mask vs rectangular bounding box | `mask_area / bbox_area < 0.25` (>75% background spared) |
| **Fast Telea Inpainting** | `TeleaInpaintingBackend.inpaint()` | CPU reconstruction on standard paper noise | Execution latency `< 25ms`; no rectangular boundaries |
| **Pluggable LaMa Inpainter** | `LamaOnnxBackend.inpaint()` | Graceful fallback when model uninitialized | Returns valid BGR array without unhandled crash |
| **Median Ink Sampling** | `InkSampler.sample_stroke_ink_color()`| Sampled RGB from un-dilated core stroke pixels | Preserves pen hue (e.g., $B > R$ for blue ballpoint ink); clamps contrast |
| **Typographic Auto-Scaling** | `TypographicFitter.fit_text_to_bbox()` | Text scaling down to 70% and tracking condensation (-0.5px) | Rendered height $\le$ target height; 0 overflow |
| **Multiply Blend Compositing** | `PaperTextureCompositor.composite_text_layer()` | Subtractive ink model: $C = \frac{C_{\text{bg}} \times C_{\text{text}}}{255}$ | Paper texture variance ($\sigma^2 > 0$) modulates ink characters |
| **Vector Stream Redaction** | `NativeVectorPipeline.remove_text_lossless()` | Strips `Tj`/`TJ`/`BT...ET` without adding `/Image` | 0 text operators in content stream; 0 white `re f` patches |
| **PyMuPDF Span Extraction** | `NativeVectorPipeline.extract_page_spans()` | Hierarchical extraction via `page.get_text("dict")` | Returns blocks, lines, spans, bboxes, flags, font name, and sRGB color |
| **Arabic BiDi Shaping** | `TextShaper.shape_bidi_text()` | `arabic_reshaper` + `python-bidi` | Reorders cursive forms, handles RTL context, 0 replacement glyphs (`\ufffd`) |

---

### Tier 2: Boundary & Corner Cases

Validates system robustness against malformed, degenerate, or extreme inputs:

1. **Empty Mask / Zero-Text Document:**
   - Input: Image or PDF page containing zero detected text blocks (`boxes = []`).
   - Expected Output: Identity pass-through; background remains pixel-identical; no crashes, zero divide-by-zero exceptions.
2. **Inverted Polarity Text:**
   - Input: White or light-colored text printed on a dark header band or solid banner.
   - Expected Output: Polarized stroke segmentation correctly detects `center_median > bg_median` and segments foreground glyph strokes instead of inverting the entire block.
3. **Zero-Width and Collapsed Spans:**
   - Input: Text bounding boxes where $x_1 \le x_0$ or $y_1 \le y_0$ (OCR artifacts).
   - Expected Output: Gracefully bypassed or clamped without matrix singularities or negative dimension errors in Pillow / OpenCV.
4. **Single-Character Isolated Blocks:**
   - Input: 1-character bounding boxes (e.g. section markers "§", footnote numbers "1", bullet points "•").
   - Expected Output: Minimal stroke segmentation and ink sampling succeed without index-out-of-bounds or statistical failure.
5. **Extreme Text Expansion (>50% Growth):**
   - Input: Source English text translated into verbose German or legal French where length increases by $>50\%$.
   - Expected Output: `TypographicFitter` cascades from font scale down to $0.70$, then applies negative letter-spacing ($-0.5\text{px}$) to prevent horizontal/vertical bounding box violation.
6. **Mixed BiDi Latin-Arabic Script with Embedded Numbers:**
   - Input: Mixed text `"Passport ⟦P1⟧ for Tariq Al-Mansoor رقم 2026-WL صادر في دمشق"`.
   - Expected Output: Bidirectional algorithm UAX #9 correctly sequences RTL Arabic characters, maintains LTR numeric order for dates/IDs, and renders without broken bracket directionality.

---

### Tier 3: Cross-Feature Interactions

Validates system behavior when multiple subsystems interact within the same page:

1. **Vector Table Lines with Arabic BiDi Cell Re-insertion:**
   - Input: Table with gridlines (`re S`) where cells are translated into Arabic.
   - Interaction: PyMuPDF redaction must strip English cell text while keeping `0.5 w ... re S` table paths 100% intact, followed by RTL text insertion inside tight table cell coordinates.
   - Gate: `SSIM == 1.0` on table gridlines; zero text collisions with cell boundaries.
2. **Scanned Certificate with Overlapping Red Stamp and Translated Signature:**
   - Input: Scanned document where printed body text intersects an official red ink circular seal (`tests/corpus/04_scanned_certificate.png`).
   - Interaction: Stroke segmentation must isolate character strokes without masking the underlying red stamp curves; inpainting must bridge only character strokes, leaving the circular seal continuous.
   - Gate: Non-text stamp region maintains $\text{SSIM} \ge 0.98$; ink sampling distinguishes black body text from red stamp ink.
3. **Multi-Page Hybrid Document:**
   - Input: Multi-page document containing both digital vector pages and scanned bitmap pages (`tests/corpus/06_hybrid_multipage.pdf`).
   - Interaction: Pipeline must dynamically route digital pages to `NativeVectorPipeline` (zero rasterization) and scanned pages to `ScannedDocumentPipeline` (stroke inpainting).
   - Gate: Digital pages remain 100% vector; scanned pages preserve paper grain; output PDF compiles into a unified document.

---

### Tier 4: Real-World Scenarios

Validates end-to-end translation fidelity on authenticated legal, academic, and financial documents:

1. **Civil Birth Certificate (`test_sample_civil_record.pdf` / `corpus/04_scanned_certificate.png`):**
   - High-consequence legal document with state seals, registrar signatures, and metadata fields.
   - Verification: 100% vector retention or texture preservation, certified metadata accuracy, zero font tofu (`\ufffd`).
2. **Academic Transcript (`tests/corpus/01_academic_two_column.pdf`):**
   - Multi-column document with vertical separation rule and tabular course credits.
   - Verification: Vertical divider rule remains intact; two-column reading order preserved; translation does not cross column gutters.
3. **Financial Balance Sheet (`tests/corpus/03_table_heavy_multipage.pdf`):**
   - Dense financial statement with multi-row gridlines and tabular numeric alignments.
   - Verification: Full-page table perimeter (`50 510 510 170 re S`) and interior rows remain completely unbroken.

---

## 3. Quantitative Verification Gates

| Gate # | Name | Metric / Formula | Target Threshold | Validation Tool |
| :---: | :--- | :--- | :---: | :--- |
| **G1** | Stroke Mask Efficiency | $\frac{\sum \text{Mask Pixels}}{\sum \text{BBox Area}}$ | $< 0.25$ | NumPy array sum |
| **G2** | Telea Inpainting Latency | Execution time on 800x600 image | $< 35\text{ ms}$ on CPU | `time.perf_counter()` |
| **G3** | Non-Text Preservation | Masked Structural Similarity Index | $\text{SSIM} \ge 0.98$ | OpenCV / NumPy SSIM |
| **G4** | Vector Gridline Preservation | Content stream vector operators | $100\%$ preserved (`re S`) | `pikepdf.parse_content_stream` |
| **G5** | Zero Rasterization | Additional `/Image` XObjects on vector pages | $0$ added | `page.Resources.XObject` count |
| **G6** | Glyph & BiDi Integrity | Unmapped glyphs / replacement characters | $0\text{ tofu, } 0\text{ '?', } 0\text{ U+FFFD}$ | String analysis |
| **G7** | Bounding Box Clearance | Rendered text boundary vs target bounding box | $0\text{ overflow}$ | Geometric box clipping |

---

## 4. Test Harness Execution Matrix

The tests are organized in `tests/test_e2e_dual_pipeline.py` and executed via pytest:

```bash
# Execute entire E2E test suite
pytest tests/test_e2e_dual_pipeline.py -v

# Execute specific tier
pytest tests/test_e2e_dual_pipeline.py -k "tier1" -v
pytest tests/test_e2e_dual_pipeline.py -k "tier2" -v
pytest tests/test_e2e_dual_pipeline.py -k "tier3" -v
pytest tests/test_e2e_dual_pipeline.py -k "tier4" -v

# Execute performance benchmark only
pytest tests/test_e2e_dual_pipeline.py -k "benchmark" -v
```

---

## 5. Artifact & File Responsibility Matrix

| File Path | Role | Description |
| :--- | :--- | :--- |
| `TEST_INFRA.md` | Documentation | Canonical testing infrastructure and 4-tier methodology definition (This file). |
| `tests/test_e2e_dual_pipeline.py` | Test Implementation | Comprehensive automated test suite implementing all 4 tiers for the dual-pipeline system. |
| `api/reconstruction/scanned_pipeline.py` | Implementation (M1) | Scanned document stroke segmentation, inpainting, and Multiply blend compositor. |
| `services/vector_pipeline.py` | Implementation (M2) | Native vector PDF span extraction, zero-patch redaction, and BiDi re-insertion. |
| `tests/corpus/` | Test Assets | Corpus of certified legal documents, tables, certificates, and multi-page records. |
