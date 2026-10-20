# Project: Dual-Pipeline Document Translation & Layout Reconstruction

## Architecture
The system establishes a clean, decoupled dual-pipeline architecture for document translation and visual layout reconstruction:
1. **Scanned Documents & Bitmap Images Pipeline (`api/reconstruction/scanned_pipeline.py`)**:
   - Isolates character strokes via local Adaptive Gaussian Thresholding and Otsu binarization with 2–3px elliptical morphological dilation (`cv2.dilate`), reducing masked area by >85%.
   - Inpaints background using fast `cv2.inpaint(..., INPAINT_TELEA)` (<15ms on CPU) for standard paper grain, with a pluggable LaMa ONNX backend for complex stamps, seals, and guilloche textures.
   - Extracts true ink color by calculating median RGB strictly across un-dilated core stroke pixels with contrast clamping.
   - Matches font topology (Serif -> Amiri, Sans -> Cairo/Noto) with dynamic auto-scaling down to 70% and tracking condensation (-0.5px) via HarfBuzz/Pillow.
   - Composites rendered text using optical Gaussian blur ($\sigma \in [0.4, 0.6]$) and Multiply blend mode ($C = \frac{C_{bg} \times C_{text}}{255}$) so underlying paper grain modulates translated ink strokes.
2. **Native Vector PDF Pipeline (`api/reconstruction/vector_pdf_pipeline.py` / `services/vector_pipeline.py`)**:
   - Preserves 100% vector geometry, strictly prohibiting bitmap rasterization.
   - Extracts complete span hierarchy via PyMuPDF (`page.get_text("dict")`): text, bbox coordinates, font name, font size, bitmask flags (bold, italic, serif, mono), and integer sRGB color decoding.
   - Eradicates original text with zero white patches via `page.apply_redactions(graphics=0, images=0)` with `fill=None`, backed by a robust tokenized `pikepdf.parse_content_stream()` text operator (`BT...ET`, `Tj`, `TJ`) stripper that preserves all vector lines, tables, borders, and fills.
   - Re-inserts translated text at exact coordinates using `page.insert_htmlbox()` (for RTL/BiDi paragraphs) and `page.insert_textbox()` (for single-cell spans), complete with full BiDi shaping (`arabic-reshaper`, `python-bidi`, `uharfbuzz`).
3. **Unified Reconstruction Facade (`api/reconstruction/facade.py`)**:
   - Replaces the legacy monolithic `api/render.py` drawing white and tinted boxes.
   - Fixes Windows font discovery startup hang by using direct path resolution instead of recursive `os.walk("C:/Windows/Fonts")`.
   - Exposes clean `reconstruct_document(...)` dispatcher to FastAPI endpoints and background queues.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Stroke Segmentation Mask | Crop bounding box, Adaptive Thresholding/Otsu, 2-3px dilation to isolate character strokes | M1 | Survey (R1) |
| 2 | Fast Telea Inpainting | `cv2.inpaint` with `INPAINT_TELEA` (<15ms on CPU) on dilated stroke mask | M1 | Survey (R1) |
| 3 | Pluggable LaMa ONNX Pipeline | Large Mask Inpainting ONNX architecture for complex stamps, seals, and guilloche rosettes | M1 | Survey (R1) |
| 4 | True Ink Color Extraction | Median RGB calculation strictly across core stroke pixels (capturing authentic ink tints) | M1 | Survey (R2) |
| 5 | Font Topology Matching & Auto-Scaling | Topology classifier (Serif, Sans, Mono) and auto-fitter for bounding box clearance | M1 | Survey (R2, R3) |
| 6 | Paper Texture Realism & Blend | Gaussian blur ($\sigma \in [0.4, 0.6]$) + Multiply blend mode compositing | M1 | Survey (R3) |
| 7 | Native Vector Preservation | 100% vector preservation without bitmap rasterization for digital PDFs | M2 | Survey (R4) |
| 8 | PyMuPDF Span Extraction | Extract hierarchical AST (`page.get_text("dict")`) with bbox, font, size, flags, sRGB color | M2 | Survey (R4) |
| 9 | Zero White Patch Text Removal | PyMuPDF `apply_redactions(graphics=0, images=0)` with `fill=None` & pikepdf token filter | M2 | Survey (R4) |
| 10 | Coordinate Re-insertion & Auto-Fit | `page.insert_htmlbox` / `page.insert_textbox` at exact spatial coordinates with auto-fit | M2 | Survey (R5) |
| 11 | Arabic BiDi Text Shaping | `arabic-reshaper` + `python-bidi` + `uharfbuzz` for complex script and RTL layout | M2 | Survey (R5) |
| 12 | Font Resolution Optimization | Direct font path resolution replacing recursive `os.walk` in `FontManager._init_defaults` | M3 | Survey |
| 13 | Modular Reconstruction Facade | Refactor `api/render.py` into `api/reconstruction/` modular package | M3 | Survey |
| 14 | Scanned Document Service Integration | Connect OCR bounding box extraction with `ScannedDocumentPipeline` in `api/analyze.py` | M3 | Survey |
| 15 | Vector PDF Service Integration | Connect `NativeVectorPipeline` into document reconstruction workflow in `api/main.py` | M3 | Survey |
| 16 | Scanned Inpainting Regression Tests | Automated unit & regression tests for stroke mask ratio, inpainting latency, ink sampling | M4 | Survey & Request |
| 17 | Vector PDF Preservation Tests | Automated unit & regression tests for table line preservation, zero white patch, BiDi | M4 | Survey & Request |
| 18 | Dual-Pipeline Integration Test Suite | Full end-to-end integration test suite verifying scanned and vector workflows | M4 | Survey & Request |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | M1: Scanned Documents & Images Pipeline | Features 1–6: StrokeSegmenter, Telea & LaMa Inpainter, InkSampler, TypographicFitter, PaperTextureCompositor | none | DONE (14/14 tests pass) |
| 2 | M2: Native Vector PDF Pipeline | Features 7–11: NativeVectorPipeline, Span Extraction, Zero White Patch Redaction, BiDi Re-insertion | none | DONE (12/12 tests pass) |
| 3 | M3: Service Layer Integration & Facade | Features 12–15: Font resolution fix, `api/reconstruction/` facade, API endpoints | M1, M2 | IN_PROGRESS |
| 4 | M4: Comprehensive E2E Verification & Audit | Features 16–18: Automated test suite, adversarial tests, forensic integrity audit | M1, M2, M3 | PLANNED |

## Interface Contracts

### `api.reconstruction.stroke_segmentation`
```python
class StrokeSegmentationResult(NamedTuple):
    core_mask: np.ndarray       # Binary uint8 mask (0 or 255) of un-dilated stroke pixels
    dilated_mask: np.ndarray    # Binary uint8 mask (0 or 255) with 2-3px dilation
    crop_bbox: Tuple[int, int, int, int] # (x0, y0, x1, y1) in image pixel coordinates

class StrokeSegmenter:
    def __init__(self, dilation_radius: int = 2, adaptive_block_size: int = 15, adaptive_c: int = 7): ...
    def segment_box(self, image_bgr: np.ndarray, bbox: Tuple[float, float, float, float], padding: int = 4) -> StrokeSegmentationResult: ...
```

### `api.reconstruction.inpainting`
```python
class InpaintingBackend(ABC):
    @abstractmethod
    def inpaint(self, image_bgr: np.ndarray, mask_binary: np.ndarray) -> np.ndarray: ...

class TeleaInpaintingBackend(InpaintingBackend):
    def __init__(self, inpaint_radius: int = 3): ...
    def inpaint(self, image_bgr: np.ndarray, mask_binary: np.ndarray) -> np.ndarray: ...

class LamaOnnxBackend(InpaintingBackend):
    def __init__(self, model_path: str = "models/lama_fp32.onnx"): ...
    def inpaint(self, image_bgr: np.ndarray, mask_binary: np.ndarray) -> np.ndarray: ...

class DocumentInpaintingService:
    def inpaint_document(
        self,
        image_bgr: np.ndarray,
        boxes: List[Tuple[float, float, float, float]],
        non_text_regions: Optional[List[Any]] = None
    ) -> Tuple[np.ndarray, np.ndarray]: ...
```

### `api.reconstruction.ink_sampler`
```python
class InkSampler:
    @staticmethod
    def sample_stroke_ink_color(
        image_bgr: np.ndarray,
        crop_bbox: Tuple[int, int, int, int],
        core_stroke_mask: np.ndarray
    ) -> Tuple[int, int, int]: ...
```

### `api.reconstruction.paper_compositor`
```python
class PaperTextureCompositor:
    @staticmethod
    def composite_text_layer(
        background_bgr: np.ndarray,
        text_rgba: Image.Image,
        sigma: float = 0.5
    ) -> np.ndarray: ...
```

### `api.reconstruction.vector_pdf_pipeline`
```python
class NativeVectorPipeline:
    def __init__(self, fonts_dir: Optional[str] = None): ...
    def extract_page_spans(self, pdf_bytes: bytes, page_index: int = 0) -> Dict[str, Any]: ...
    def remove_text_lossless(self, pdf_bytes: bytes, page_index: int = 0, bbox_list: Optional[List[List[float]]] = None) -> bytes: ...
    def insert_translated_text(self, sanitized_pdf_bytes: bytes, page_index: int, translations: List[Dict[str, Any]], target_lang: str) -> bytes: ...
```

### `api.reconstruction.facade`
```python
def reconstruct_document(
    original_bytes: bytes,
    file_format: str,
    analysis: DocumentAnalysis,
    translated_segments: List[Dict[str, Any]],
    target_lang: str
) -> Tuple[bytes, bytes, List[Dict[str, Any]]]: ...
```

## Code Layout
```
api/
├── reconstruction/
│   ├── __init__.py
│   ├── facade.py
│   ├── scanned_pipeline.py
│   ├── vector_pdf_pipeline.py
│   ├── stroke_segmentation.py
│   ├── inpainting.py
│   ├── ink_sampler.py
│   ├── paper_compositor.py
│   ├── typography_engine.py
│   └── font_cache.py
├── render.py                         # Updated to delegate to api.reconstruction
services/
└── vector_pipeline.py                # Service wrapper for NativeVectorPipeline
tests/
├── test_scanned_pipeline.py          # R1, R2, R3 automated tests
├── test_vector_pipeline.py           # R4, R5 automated tests
└── test_milestone5_reconstruction.py # Updated regression suite
```
