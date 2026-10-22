"""
Document Inpainting Service for Scanned Documents.
Provides fast Telea inpainting (<15-20ms on CPU) as the high-speed default,
alongside a pluggable LaMa ONNX backend for complex stamps, seals, and guilloche textures,
with graceful automatic fallback.
"""

import os
from abc import ABC, abstractmethod
from typing import List, Tuple, Optional, Any, Union
import numpy as np
import cv2

from api.reconstruction.stroke_segmentation import StrokeSegmenter


class InpaintingBackend(ABC):
    """Abstract base class for document inpainting backends."""

    @abstractmethod
    def inpaint(self, image_bgr: np.ndarray, mask_binary: np.ndarray) -> np.ndarray:
        """
        Inpaints regions where mask_binary == 255.

        Args:
            image_bgr: Source image in BGR format (uint8, shape [H, W, 3]).
            mask_binary: Inpainting mask (uint8, shape [H, W], values 0 or 255).

        Returns:
            Inpainted BGR image (uint8, shape [H, W, 3]).
        """
        pass


class TeleaInpaintingBackend(InpaintingBackend):
    """
    Fast Marching Method inpainting using cv2.INPAINT_TELEA.
    Extremely fast (<15-20ms on CPU), zero GPU requirement.
    Perfect for paper grain, text stroke erasure, and standard document backgrounds.
    """

    def __init__(self, inpaint_radius: int = 2):
        """
        Initialize Telea inpainting backend.

        Args:
            inpaint_radius: Radius of circular neighborhood considered around each point (default 2px).
        """
        self.radius = max(1, int(inpaint_radius))

    def inpaint(self, image_bgr: np.ndarray, mask_binary: np.ndarray) -> np.ndarray:
        """
        Performs Fast Marching Method inpainting on character strokes.
        Uses localized cluster inpainting on sparse document masks for <15-20ms CPU execution.
        """
        if mask_binary is None or np.count_nonzero(mask_binary) == 0:
            return image_bgr.copy()

        # Ensure mask is single channel uint8
        if len(mask_binary.shape) == 3:
            mask = cv2.cvtColor(mask_binary, cv2.COLOR_BGR2GRAY)
        else:
            mask = mask_binary

        mask = (mask > 0).astype(np.uint8) * 255
        h, w = image_bgr.shape[:2]

        # For smaller crops (e.g. <= 250x250), run directly
        if h <= 250 and w <= 250:
            return cv2.inpaint(image_bgr, mask, inpaintRadius=self.radius, flags=cv2.INPAINT_TELEA)

        # For full document images with sparse stroke masks, localize inpainting to bounding clusters
        down_w = max(1, w // 8)
        down_h = max(1, h // 8)
        small_mask = cv2.resize(mask, (down_w, down_h), interpolation=cv2.INTER_NEAREST)
        small_dilated = cv2.dilate(small_mask, np.ones((3, 3), np.uint8), iterations=2)
        contours, _ = cv2.findContours(small_dilated, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        if not contours or len(contours) > 50:
            # Fall back to standard global inpainting
            return cv2.inpaint(image_bgr, mask, inpaintRadius=self.radius, flags=cv2.INPAINT_TELEA)

        out = image_bgr.copy()
        for c in contours:
            rx, ry, rw, rh = cv2.boundingRect(c)
            # Map back to full-resolution coordinates with 4px safety border
            x0 = max(0, rx * 8 - 4)
            y0 = max(0, ry * 8 - 4)
            x1 = min(w, (rx + rw) * 8 + 4)
            y1 = min(h, (ry + rh) * 8 + 4)

            sub_mask = mask[y0:y1, x0:x1]
            if np.count_nonzero(sub_mask) > 0:
                sub_img = out[y0:y1, x0:x1]
                out[y0:y1, x0:x1] = cv2.inpaint(sub_img, sub_mask, inpaintRadius=self.radius, flags=cv2.INPAINT_TELEA)

        return out


class LamaOnnxBackend(InpaintingBackend):
    """
    Pluggable Large Mask Inpainting (LaMa) using ONNX Runtime.
    Synthesizes complex periodic patterns (guilloche, stamps, official seals) using
    Fast Fourier Convolutions (FFCs). Gracefully falls back to Telea if model is not present.
    """

    def __init__(self, model_path: str = "models/lama_fp32.onnx", fallback_radius: int = 3):
        """
        Initialize LaMa ONNX backend.

        Args:
            model_path: Path to lama ONNX model file.
            fallback_radius: Inpaint radius if falling back to Telea.
        """
        self.model_path = model_path
        self.fallback_radius = fallback_radius
        self.session = None
        self._input_names = []
        self._output_names = []

        if os.path.exists(model_path):
            try:
                import onnxruntime as ort
                # Use CPUExecutionProvider for universal compatibility
                self.session = ort.InferenceSession(
                    model_path,
                    providers=['CPUExecutionProvider']
                )
                self._input_names = [inp.name for inp in self.session.get_inputs()]
                self._output_names = [out.name for out in self.session.get_outputs()]
            except Exception:
                self.session = None

    @property
    def is_available(self) -> bool:
        """Returns True if the ONNX model is loaded and ready for inference."""
        return self.session is not None

    def inpaint(self, image_bgr: np.ndarray, mask_binary: np.ndarray) -> np.ndarray:
        """
        Runs LaMa neural inpainting or falls back to Telea.
        """
        if mask_binary is None or np.count_nonzero(mask_binary) == 0:
            return image_bgr.copy()

        # Ensure single channel uint8 mask
        if len(mask_binary.shape) == 3:
            mask = cv2.cvtColor(mask_binary, cv2.COLOR_BGR2GRAY)
        else:
            mask = mask_binary
        mask_binary = (mask > 0).astype(np.uint8) * 255

        # If model is unavailable, gracefully fall back to Telea
        if self.session is None:
            return cv2.inpaint(
                image_bgr, mask_binary,
                inpaintRadius=self.fallback_radius,
                flags=cv2.INPAINT_TELEA
            )

        try:
            h, w = image_bgr.shape[:2]
            img_rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB).astype(np.float32) / 255.0
            mask_f = (mask_binary > 0).astype(np.float32)

            # Pad dimensions to multiples of 8 (required by UNet/LaMa downsampling)
            pad_h = (8 - h % 8) % 8
            pad_w = (8 - w % 8) % 8
            img_padded = np.pad(img_rgb, ((0, pad_h), (0, pad_w), (0, 0)), mode='reflect')
            mask_padded = np.pad(mask_f, ((0, pad_h), (0, pad_w)), mode='constant', constant_values=0)

            # Format tensors: NCHW
            img_tensor = np.transpose(img_padded, (2, 0, 1))[np.newaxis, ...].astype(np.float32)
            mask_tensor = mask_padded[np.newaxis, np.newaxis, ...].astype(np.float32)

            inputs = {
                self._input_names[0]: img_tensor,
                self._input_names[1]: mask_tensor
            }
            outputs = self.session.run(self._output_names, inputs)
            out_tensor = outputs[0][0]  # CHW

            result_rgb = np.transpose(out_tensor, (1, 2, 0))[:h, :w]
            result_rgb = np.clip(result_rgb * 255.0, 0, 255).astype(np.uint8)
            return cv2.cvtColor(result_rgb, cv2.COLOR_RGB2BGR)

        except Exception:
            # On any runtime inference exception, fallback to Telea safely
            return cv2.inpaint(
                image_bgr, mask_binary,
                inpaintRadius=self.fallback_radius,
                flags=cv2.INPAINT_TELEA
            )


class DocumentInpaintingService:
    """
    High-level document inpainting service.
    Orchestrates stroke-level masking, preserves non-text regions (stamps, seals, signatures),
    and routes inpainting through Telea or LaMa.
    """

    def __init__(
        self,
        default_backend: Optional[InpaintingBackend] = None,
        lama_backend: Optional[InpaintingBackend] = None,
        segmenter: Optional[StrokeSegmenter] = None
    ):
        """
        Initialize the inpainting service.

        Args:
            default_backend: Default fast backend (defaults to TeleaInpaintingBackend).
            lama_backend: Pluggable LaMa backend for complex textures.
            segmenter: StrokeSegmenter instance.
        """
        self.telea = default_backend or TeleaInpaintingBackend(inpaint_radius=3)
        self.lama = lama_backend or LamaOnnxBackend()
        self.segmenter = segmenter or StrokeSegmenter()

    def inpaint_document(
        self,
        image_bgr: np.ndarray,
        boxes: List[Tuple[float, float, float, float]],
        non_text_regions: Optional[List[Any]] = None,
        prefer_lama: bool = False
    ) -> Tuple[np.ndarray, np.ndarray]:
        """
        Generates stroke masks for all text boxes, protects non-text regions,
        and inpaints the document background.

        Args:
            image_bgr: Full document image (BGR uint8).
            boxes: Bounding boxes of text to remove [(x0, y0, x1, y1), ...].
            non_text_regions: Regions to strictly preserve (stamps, seals, signatures).
                             Can be tuple (x0, y0, x1, y1) or object with .bbox attribute.
            prefer_lama: Whether to prefer LaMa when available.

        Returns:
            Tuple of (inpainted_bgr, full_stroke_mask).
        """
        h, w = image_bgr.shape[:2]
        if len(boxes) == 0:
            return image_bgr.copy(), np.zeros((h, w), dtype=np.uint8)

        # 1. Segment stroke pixels across all text boxes
        _, full_mask, _ = self.segmenter.segment_document(image_bgr, boxes)

        # 2. Protect non-text regions (stamps, seals, signatures)
        if non_text_regions:
            for ntr in non_text_regions:
                if hasattr(ntr, 'bbox'):
                    raw_bbox = ntr.bbox
                elif isinstance(ntr, (list, tuple)) and len(ntr) == 4:
                    raw_bbox = ntr
                else:
                    continue

                nx0 = max(0, int(np.floor(raw_bbox[0])))
                ny0 = max(0, int(np.floor(raw_bbox[1])))
                nx1 = min(w, int(np.ceil(raw_bbox[2])))
                ny1 = min(h, int(np.ceil(raw_bbox[3])))

                if nx1 > nx0 and ny1 > ny0:
                    # Clear mask inside non-text regions to prevent erasing stamps/seals
                    full_mask[ny0:ny1, nx0:nx1] = 0

        # 3. Select backend: LaMa if requested & available, else Telea
        backend = self.telea
        if prefer_lama and isinstance(self.lama, LamaOnnxBackend) and self.lama.is_available:
            backend = self.lama

        # 4. Execute inpainting
        inpainted_bgr = backend.inpaint(image_bgr, full_mask)
        return inpainted_bgr, full_mask
