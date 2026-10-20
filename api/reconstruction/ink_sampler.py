"""
True Ink Color Extraction Engine for Scanned Documents.
Extracts authentic ink RGB values strictly within un-dilated core character strokes,
capturing real ballpoint pen, typewriter charcoal ribbon, or laser toner nuances,
with automatic background contrast clamping.
"""

from typing import Tuple, List, Optional
import numpy as np
import cv2


class InkSampler:
    """
    Extracts authentic ink colors by calculating median RGB strictly across
    un-dilated core stroke pixels. Clamps contrast against local paper background.
    """

    DEFAULT_DARK_INK = (26, 28, 30)   # Authentic dark charcoal toner
    DEFAULT_LIGHT_INK = (245, 245, 245) # White ink for dark backgrounds

    @staticmethod
    def sample_stroke_ink_color(
        image_bgr: np.ndarray,
        crop_bbox: Tuple[int, int, int, int],
        core_stroke_mask: np.ndarray,
        min_contrast: float = 30.0
    ) -> Tuple[int, int, int]:
        """
        Calculates median RGB across core stroke pixels (un-dilated).
        Captures authentic typewriter, fountain pen, or toner color tints.

        Args:
            image_bgr: Full or cropped source image in BGR format (uint8).
            crop_bbox: (x0, y0, x1, y1) in image_bgr pixel coordinates.
            core_stroke_mask: Binary uint8 mask (0 or 255) of un-dilated stroke pixels for crop.
            min_contrast: Minimum required luminance contrast between ink and background.

        Returns:
            Tuple of (R, G, B) integer color values in range [0, 255].
        """
        x0, y0, x1, y1 = crop_bbox
        h, w = image_bgr.shape[:2]

        # Clamp bounding box coordinates
        x0 = max(0, min(w, x0))
        y0 = max(0, min(h, y0))
        x1 = max(0, min(w, x1))
        y1 = max(0, min(h, y1))

        if x1 <= x0 or y1 <= y0:
            return InkSampler.DEFAULT_DARK_INK

        crop = image_bgr[y0:y1, x0:x1]
        if crop.size == 0:
            return InkSampler.DEFAULT_DARK_INK

        # Ensure mask matches crop shape
        if core_stroke_mask.shape[:2] != crop.shape[:2]:
            core_stroke_mask = cv2.resize(
                core_stroke_mask,
                (crop.shape[1], crop.shape[0]),
                interpolation=cv2.INTER_NEAREST
            )

        # Convert crop to RGB
        crop_rgb = cv2.cvtColor(crop, cv2.COLOR_BGR2RGB)

        # Extract pixels strictly on core strokes
        stroke_mask = (core_stroke_mask == 255)
        stroke_pixels = crop_rgb[stroke_mask]

        if len(stroke_pixels) < 4:
            # Fall back to dark ink
            return InkSampler.DEFAULT_DARK_INK

        # Compute median RGB across stroke pixels
        median_rgb = np.median(stroke_pixels, axis=0).astype(int)
        r, g, b = int(median_rgb[0]), int(median_rgb[1]), int(median_rgb[2])

        # Contrast safety check against local background paper pixels
        bg_mask = (core_stroke_mask == 0)
        bg_pixels = crop_rgb[bg_mask]

        if len(bg_pixels) > 0:
            bg_median = np.median(bg_pixels, axis=0)
            bg_lum = 0.2126 * bg_median[0] + 0.7152 * bg_median[1] + 0.0722 * bg_median[2]
            ink_lum = 0.2126 * r + 0.7152 * g + 0.0722 * b

            # Check if contrast difference is too low
            contrast_diff = abs(bg_lum - ink_lum)
            if contrast_diff < min_contrast:
                if bg_lum >= 128.0:
                    # Light background: pull ink darker to maintain legibility
                    r = max(0, r - 50)
                    g = max(0, g - 50)
                    b = max(0, b - 50)
                else:
                    # Dark background: pull ink lighter
                    r = min(255, r + 50)
                    g = min(255, g + 50)
                    b = min(255, b + 50)

        return (r, g, b)

    @staticmethod
    def sample_from_region(
        image_bgr: np.ndarray,
        bbox: Tuple[float, float, float, float]
    ) -> Tuple[int, int, int]:
        """
        Convenience method: Segments strokes and samples ink color directly from bbox.
        """
        from api.reconstruction.stroke_segmentation import StrokeSegmenter
        segmenter = StrokeSegmenter()
        seg_res = segmenter.segment_box(image_bgr, bbox)
        return InkSampler.sample_stroke_ink_color(
            image_bgr,
            seg_res.crop_bbox,
            seg_res.core_mask
        )
