"""
Scanned Documents & Images Layout Reconstruction Pipeline.
Integrates StrokeSegmenter, DocumentInpaintingService (Telea & LaMa),
InkSampler, TypographicFitter, and PaperTextureCompositor into an end-to-end
dual-pipeline reconstruction service.
"""

import time
from typing import NamedTuple, Tuple, List, Dict, Any, Optional, Union
import numpy as np
import cv2
from PIL import Image, ImageDraw, ImageFont

from api.reconstruction.stroke_segmentation import StrokeSegmenter, StrokeSegmentationResult
from api.reconstruction.inpainting import DocumentInpaintingService, TeleaInpaintingBackend, LamaOnnxBackend
from api.reconstruction.ink_sampler import InkSampler
from api.reconstruction.typography_engine import FontResolver, TypographicFitter, TextShaper, TypographicFitResult
from api.reconstruction.paper_compositor import PaperTextureCompositor


class ScannedReconstructionResult(NamedTuple):
    reconstructed_bgr: np.ndarray             # Final composite image with Multiply blend
    inpainted_background_bgr: np.ndarray      # Inpainted background (text removed)
    full_stroke_mask: np.ndarray              # Dilated stroke mask used for inpainting
    sampled_colors: Dict[str, Tuple[int, int, int]]  # Map of block_id -> (R, G, B)
    fitted_blocks: List[Dict[str, Any]]       # Fitted typographic details per block
    execution_stats: Dict[str, float]         # Execution latencies in milliseconds


class ScannedDocumentPipeline:
    """
    End-to-end reconstruction pipeline for scanned documents and bitmap images.
    Eradicates white rectangular box artifacts by isolating character strokes (<25% area),
    inpainting via fast Telea (<15-20ms) or LaMa, sampling true ink colors,
    auto-fitting translated text (down to 70% scale, -0.5px tracking),
    and compositing with Gaussian blur (sigma in [0.4, 0.6]) and Multiply blend mode.
    """

    def __init__(
        self,
        inpainting_service: Optional[DocumentInpaintingService] = None,
        segmenter: Optional[StrokeSegmenter] = None,
        blur_sigma: float = 0.5
    ):
        """
        Initialize the scanned document pipeline.

        Args:
            inpainting_service: DocumentInpaintingService instance (defaults to Telea + LaMa).
            segmenter: StrokeSegmenter instance.
            blur_sigma: Optical Gaussian blur sigma for paper compositing (default 0.5).
        """
        self.segmenter = segmenter or StrokeSegmenter()
        self.inpainting_service = inpainting_service or DocumentInpaintingService(segmenter=self.segmenter)
        self.blur_sigma = float(blur_sigma)

    @staticmethod
    def _extract_box(block: Any, image_height: int) -> Tuple[float, float, float, float]:
        """Extracts pixel bounding box (x0, y0, x1, y1) in top-left pixel coordinates."""
        # 1. Check for pixel_bbox
        if hasattr(block, 'pixel_bbox') and block.pixel_bbox and len(block.pixel_bbox) == 4:
            return (
                float(block.pixel_bbox[0]),
                float(block.pixel_bbox[1]),
                float(block.pixel_bbox[2]),
                float(block.pixel_bbox[3])
            )
        elif isinstance(block, dict) and 'pixel_bbox' in block and len(block['pixel_bbox']) == 4:
            return (
                float(block['pixel_bbox'][0]),
                float(block['pixel_bbox'][1]),
                float(block['pixel_bbox'][2]),
                float(block['pixel_bbox'][3])
            )

        # 2. Check for bbox
        raw_box = None
        if hasattr(block, 'bbox') and block.bbox and len(block.bbox) == 4:
            raw_box = block.bbox
        elif isinstance(block, dict) and 'bbox' in block and len(block['bbox']) == 4:
            raw_box = block['bbox']

        if raw_box:
            return (float(raw_box[0]), float(raw_box[1]), float(raw_box[2]), float(raw_box[3]))

        return (0.0, 0.0, 0.0, 0.0)

    @staticmethod
    def _extract_block_id(block: Any, default_idx: int) -> str:
        if hasattr(block, 'id') and block.id:
            return str(block.id)
        if isinstance(block, dict) and 'id' in block:
            return str(block['id'])
        return f"block_{default_idx}"

    @staticmethod
    def _extract_text(block: Any) -> str:
        if hasattr(block, 'text') and block.text:
            return str(block.text)
        if isinstance(block, dict) and 'text' in block:
            return str(block['text'])
        return ""

    @staticmethod
    def _extract_font_size(block: Any) -> float:
        if hasattr(block, 'font_size') and block.font_size:
            return float(block.font_size)
        if isinstance(block, dict) and 'font_size' in block:
            return float(block['font_size'])
        return 14.0

    @staticmethod
    def _extract_topology(block: Any) -> str:
        role = ""
        if hasattr(block, 'role') and block.role:
            role = str(block.role).lower()
        elif isinstance(block, dict) and 'role' in block:
            role = str(block['role']).lower()

        if "mono" in role:
            return "mono"
        if "title" in role or "heading" in role or "serif" in role:
            return "serif"
        return "sans"

    def process_document(
        self,
        image_bgr: np.ndarray,
        text_blocks: List[Any],
        target_lang: str = "en",
        translations: Optional[Dict[str, str]] = None,
        non_text_regions: Optional[List[Any]] = None,
        default_topology: str = "sans",
        prefer_lama: bool = False
    ) -> ScannedReconstructionResult:
        """
        Executes complete reconstruction pipeline on a scanned document page:
        1. Localized stroke segmentation (<25% bbox area).
        2. Un-dilated core stroke median ink color sampling.
        3. Background inpainting (Telea default <15-20ms, non-text stamps/seals preserved).
        4. Typographic auto-fitting (auto-scaling down to 70%, tracking condensation -0.5px).
        5. Optical Gaussian blur (sigma=0.4-0.6) and Multiply blend mode compositing.

        Args:
            image_bgr: Source scanned document image in BGR format (uint8).
            text_blocks: List of TextBlock objects or dicts describing OCR detected regions.
            target_lang: Target language code ("en", "ar", "fr", "es", "de", etc.).
            translations: Optional mapping from block_id to translated text string.
            non_text_regions: Optional list of stamps, seals, or signatures to strictly preserve.
            default_topology: Default font topology ("serif", "sans", "mono").
            prefer_lama: Whether to prefer LaMa neural inpainting if available.

        Returns:
            ScannedReconstructionResult with final image, inpainted background, and stats.
        """
        h, w = image_bgr.shape[:2]
        stats: Dict[str, float] = {}
        translations = translations or {}

        # -------------------------------------------------------------
        # Step 1 & 2: Stroke Segmentation & Ink Color Sampling
        # -------------------------------------------------------------
        t0 = time.perf_counter()
        boxes: List[Tuple[float, float, float, float]] = []
        valid_blocks: List[Any] = []
        sampled_colors: Dict[str, Tuple[int, int, int]] = {}
        segmentation_results: List[StrokeSegmentationResult] = []

        for idx, block in enumerate(text_blocks):
            box = self._extract_box(block, h)
            x0, y0, x1, y1 = box
            if x1 <= x0 or y1 <= y0:
                continue

            boxes.append(box)
            valid_blocks.append(block)
            block_id = self._extract_block_id(block, idx)

            # Segment character strokes
            seg_res = self.segmenter.segment_box(image_bgr, box)
            segmentation_results.append(seg_res)

            # Sample ink color strictly across un-dilated core stroke pixels
            ink_rgb = InkSampler.sample_stroke_ink_color(
                image_bgr,
                seg_res.crop_bbox,
                seg_res.core_mask
            )
            sampled_colors[block_id] = ink_rgb

        stats["segmentation_and_sampling_ms"] = (time.perf_counter() - t0) * 1000.0

        # -------------------------------------------------------------
        # Step 3: Fast Background Inpainting (Telea / LaMa)
        # -------------------------------------------------------------
        t1 = time.perf_counter()
        inpainted_bgr, full_stroke_mask = self.inpainting_service.inpaint_document(
            image_bgr=image_bgr,
            boxes=boxes,
            non_text_regions=non_text_regions,
            prefer_lama=prefer_lama
        )
        stats["inpainting_ms"] = (time.perf_counter() - t1) * 1000.0

        # -------------------------------------------------------------
        # Step 4: Typography Topology Mapping & Auto-Fitting
        # -------------------------------------------------------------
        t2 = time.perf_counter()
        fitted_blocks: List[Dict[str, Any]] = []
        is_rtl_target = target_lang.lower().startswith("ar") or target_lang.lower().startswith("he")

        # Create transparent RGBA canvas for text layer
        text_rgba = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        draw = ImageDraw.Draw(text_rgba)

        for idx, block in enumerate(valid_blocks):
            block_id = self._extract_block_id(block, idx)
            box = boxes[idx]
            x0, y0, x1, y1 = box
            box_w = float(x1 - x0)
            box_h = float(y1 - y0)

            # Determine text content: translation if provided, else source text
            orig_text = self._extract_text(block)
            target_text = translations.get(block_id, getattr(block, 'translated_text', None) or orig_text)
            if not target_text:
                continue

            # Determine font topology
            topology = self._extract_topology(block) or default_topology
            font_path = FontResolver.resolve_font(topology=topology, target_lang=target_lang)
            initial_font_size = self._extract_font_size(block)

            # Auto-fit text to original bounding box clearance
            fit_res = TypographicFitter.fit_text_to_bbox(
                text=target_text,
                target_width=box_w,
                target_height=box_h,
                font_path=font_path,
                initial_font_size=initial_font_size,
                min_font_scale=0.70,
                is_rtl=is_rtl_target
            )

            # Load fitted PIL font
            try:
                pil_font = ImageFont.truetype(fit_res.font_path, int(round(fit_res.font_size))) if fit_res.font_path else ImageFont.load_default()
            except Exception:
                pil_font = ImageFont.load_default()

            ink_color = sampled_colors.get(block_id, InkSampler.DEFAULT_DARK_INK)

            # Render text block onto transparent layer
            PaperTextureCompositor.render_text_block(
                draw=draw,
                x0=x0,
                y0=y0,
                lines=fit_res.lines,
                font=pil_font,
                color_rgb=ink_color,
                line_height=fit_res.line_height,
                letter_spacing=fit_res.letter_spacing,
                is_rtl=is_rtl_target,
                box_width=box_w
            )

            fitted_blocks.append({
                "block_id": block_id,
                "bbox": box,
                "lines": fit_res.lines,
                "font_size": fit_res.font_size,
                "letter_spacing": fit_res.letter_spacing,
                "ink_color": ink_color,
                "font_path": fit_res.font_path
            })

        stats["typography_fitting_ms"] = (time.perf_counter() - t2) * 1000.0

        # -------------------------------------------------------------
        # Step 5: Paper Texture Realism & Multiply Blend Compositing
        # -------------------------------------------------------------
        t3 = time.perf_counter()
        reconstructed_bgr = PaperTextureCompositor.composite_text_layer(
            background_bgr=inpainted_bgr,
            text_rgba=text_rgba,
            sigma=self.blur_sigma
        )
        stats["compositing_ms"] = (time.perf_counter() - t3) * 1000.0
        stats["total_pipeline_ms"] = (time.perf_counter() - t0) * 1000.0

        return ScannedReconstructionResult(
            reconstructed_bgr=reconstructed_bgr,
            inpainted_background_bgr=inpainted_bgr,
            full_stroke_mask=full_stroke_mask,
            sampled_colors=sampled_colors,
            fitted_blocks=fitted_blocks,
            execution_stats=stats
        )
