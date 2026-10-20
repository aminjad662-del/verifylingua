"""
VerifyLingua High-Fidelity Document Layout Reconstruction Package.
Provides dual-pipeline architecture for native vector PDFs and scanned documents/images:
- FontCache: Fast direct font resolution (<1ms, 0 recursive directory walks).
- DocumentReconstructionFacade: Unified dispatcher and automatic dual-pipeline routing.
- NativeVectorPipeline: 100% vector geometry preservation, AST span extraction,
  zero-white-patch redaction, and BiDi Arabic spatial re-insertion.
- ScannedDocumentPipeline: Stroke-level segmentation (<25% area), fast Telea inpainting,
  un-dilated core stroke median ink color extraction, typographic auto-fitting,
  optical Gaussian blur sigma=0.5, and paper grain Multiply blend compositing.
"""

from __future__ import annotations

# Python 3.14 Windows dynamic library preload guard
import sys
if "pymupdf.layout" not in sys.modules:
    sys.modules["pymupdf.layout"] = None
if "onnxruntime" not in sys.modules:
    sys.modules["onnxruntime"] = None

from api.reconstruction.font_cache import (
    FontCache,
    resolve_font,
    find_font_file,
    get_font_cache,
    clear_cache,
)

from api.reconstruction.stroke_segmentation import (
    StrokeSegmenter,
    StrokeSegmentationResult,
)

from api.reconstruction.inpainting import (
    DocumentInpaintingService,
    InpaintingBackend,
    TeleaInpaintingBackend,
    LamaOnnxBackend,
)

from api.reconstruction.ink_sampler import (
    InkSampler,
)

from api.reconstruction.typography_engine import (
    FontResolver,
    TypographicFitter,
    TextShaper,
    TypographicFitResult,
)

from api.reconstruction.paper_compositor import (
    PaperTextureCompositor,
)

from api.reconstruction.scanned_pipeline import (
    ScannedDocumentPipeline,
    ScannedReconstructionResult,
)

from api.reconstruction.vector_pdf_pipeline import (
    NativeVectorPipeline,
    VectorFontMeta,
    VectorSpan,
    VectorLine,
    VectorBlock,
    VectorPageSpans,
)

from api.reconstruction.facade import (
    DocumentReconstructionFacade,
    reconstruct_document,
    render_translated_document,
    generate_watermarked_preview,
    get_reconstruction_facade,
)

__all__ = [
    # Font Cache
    "FontCache",
    "resolve_font",
    "find_font_file",
    "get_font_cache",
    "clear_cache",
    # Facade & Unified Dispatcher
    "DocumentReconstructionFacade",
    "reconstruct_document",
    "render_translated_document",
    "generate_watermarked_preview",
    "get_reconstruction_facade",
    # Scanned Pipeline Components
    "StrokeSegmenter",
    "StrokeSegmentationResult",
    "DocumentInpaintingService",
    "InpaintingBackend",
    "TeleaInpaintingBackend",
    "LamaOnnxBackend",
    "InkSampler",
    "FontResolver",
    "TypographicFitter",
    "TextShaper",
    "TypographicFitResult",
    "PaperTextureCompositor",
    "ScannedDocumentPipeline",
    "ScannedReconstructionResult",
    # Native Vector Pipeline Components
    "NativeVectorPipeline",
    "VectorFontMeta",
    "VectorSpan",
    "VectorLine",
    "VectorBlock",
    "VectorPageSpans",
]
