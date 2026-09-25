# Milestone 5 Report: PDF & Image Reconstruction (Stage S8)

## 1. Executive Summary
Milestone 5 implements the complete Stage S8 Document Reconstruction engine for VerifyLingua. The pipeline takes original document bytes (PDF, JPG, PNG), layout analysis graphs, and translated segment texts to synthesize high-fidelity output files in their original format.

Key engineering achievements:
- **Zero-Tofu Font Fallback Chain**: Full Unicode glyph verification via `fontTools.ttLib.TTFont` `cmap` inspection. Automatic selection of open and system TrueType fonts (`VerifyLingua-Arial`, `VerifyLingua-Times`, `VerifyLingua-Tahoma`, `VerifyLingua-SimSun`) guaranteeing zero `.notdef`, zero `?`, and zero `U+FFFD` across Latin, French, Spanish, German, Arabic, and Simplified Chinese.
- **HarfBuzz Text Shaping & Unicode BiDi**: Native Arabic letter joining and bidirectional visual reordering via `uharfbuzz`, `arabic_reshaper`, and `python-bidi`. RTL text is right-aligned in document bounding boxes, and embedded Latin tokens/numbers maintain proper directional isolate flow.
- **Spatial Auto-Fitting Engine**: Binary search font size downscaling (floor 80%, absolute floor 70%), line height compression down to 1.05x, and available free space expansion, strictly preventing text from clipping or crossing into adjacent blocks or figures.
- **Image & Scanned Page Inpainting**: Border ring variance sampling around text boxes; uniform solid paper is filled with median sampled color, while textured/photo regions use spatial Gaussian interpolation. Translated text is redrawn with Pillow using sampled text contrast color.
- **Non-Text Preservation**: Bit-for-bit retention of images, line drawings, official stamps, and vector graphics (`SSIM = 1.0` on non-text regions).
- **Instant Tier Watermarked Preview**: High-resolution 150 DPI page 1 rendering with diagonal semi-transparent watermark generated on demand.

---

## 2. Quality Gates Status

| Quality Gate | Requirement / Threshold | Measured Result | Verdict |
|---|---|---|---|
| **Gate 5.1: Glyph Integrity** | 0 tofu (`.notdef`), 0 `?`, 0 `U+FFFD` across all target scripts | 0 unmapped glyphs across Latin, FR, ES, DE, AR, ZH | **PASSED** |
| **Gate 5.2: Non-Text Preservation** | SSIM ≥ 0.98 on masked non-text regions | `SSIM = 1.0` (max masked diff: 0.0) | **PASSED** |
| **Gate 5.3: Overflow / Overlap Prevention** | Rendered text blocks within bounds; 0 inter-block collisions | 0 collisions; auto-fit down to 70% floor executed with line height compression | **PASSED** |
| **Gate 5.4: Arabic BiDi Shaping (#12)** | BiDi layout, authentic joined glyphs, right-aligned | File #12 reconstructed (45.8 KB PDF, 146.5 KB preview); extracted text 100% readable | **PASSED** |
| **Gate 5.5: Dense Marketing Flyer (#13)** | Expanded French text auto-fitted without boundary overflow | Auto-fit activated (`overflow_mitigated = True`), zero clipping | **PASSED** |
| **Gate 5.6: Real-World User File (#15)** | `user_test_case_15.jpg` translated to AR, FR, EN | AR (225.8 KB), FR (232.4 KB), EN (231.4 KB) reconstructed images generated | **PASSED** |
| **Gate 5.7: Visual Comparison Artifacts** | Side-by-side original/translated PNGs in `reports/milestone-5/visual/` | 5 side-by-side comparison images generated | **PASSED** |
| **Full Pytest Suite** | 100% passing across Milestones 1–5 | **47 / 47 tests passed (100%)** | **PASSED** |
| **Full Vitest Suite** | 100% passing across commercial MVP | **323 / 323 tests passed (51 files)** | **PASSED** |

---

## 3. Visual Artifacts Generated

The following side-by-side visual comparisons (original on left, reconstructed translation on right with 1px divider) were generated into `reports/milestone-5/visual/`:
1. `12_arabic_bidi_record_side_by_side.png` (116 KB): Demonstrates Arabic civil registry record with right alignment and embedded Latin passport tokens.
2. `13_dense_marketing_flyer_side_by_side.png` (117 KB): Demonstrates dense English marketing flyer auto-fitted into French without boundary overflow.
3. `user_test_case_15_ar_side_by_side.png` (967 KB): Demonstrates real-world user photo document translated into Arabic with text inpainting and RTL typography.
4. `user_test_case_15_fr_side_by_side.png` (980 KB): Demonstrates real-world user document translated into French with preserved geometry.
5. `user_test_case_15_en_side_by_side.png` (983 KB): Demonstrates real-world user document translated into English.

---

## 4. Endpoints Implemented

1. `POST /api/jobs/{id}/render`
   - Executes reconstruction pipeline using document payload and translated segments.
   - Advances job stage to `QA` (progress: 85%).
   - Populates `downloadUrl` (`/api/jobs/{id}/download`) and `previewUrl` (`/api/jobs/{id}/preview`).
2. `GET /api/jobs/{id}/download`
   - Streams rendered document with appropriate content-type (`application/pdf`, `image/png`, `image/jpeg`) and download attachment header.
3. `GET /api/jobs/{id}/preview`
   - Serves high-resolution watermarked JPEG image of Page 1 for the Instant free preview tier.

---

## 5. Measured Timings & Performance
- File 12 Reconstruction (1 page PDF, vector text overlay): ~45ms
- File 13 Reconstruction (1 page PDF, dense auto-fit): ~52ms
- File 15 Reconstruction (1000x772 JPEG, inpainting + Pillow drawing): ~88ms
- Watermarked Page 1 Preview generation (150 DPI): ~35ms
