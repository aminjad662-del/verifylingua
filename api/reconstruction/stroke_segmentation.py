"""
Stroke Segmentation Engine for Scanned Documents.
Isolates character strokes within localized bounding boxes using Adaptive Gaussian
Thresholding, Otsu's binarization, and morphological dilation.
Eradicates rectangular bounding box erasure artifacts.
"""

from typing import NamedTuple, Tuple, List, Optional
import numpy as np
import cv2


class StrokeSegmentationResult(NamedTuple):
    core_mask: np.ndarray       # Binary uint8 mask (0 or 255) of un-dilated stroke pixels
    dilated_mask: np.ndarray    # Binary uint8 mask (0 or 255) with 2-3px dilation
    crop_bbox: Tuple[int, int, int, int] # (x0, y0, x1, y1) in image pixel coordinates


class StrokeSegmenter:
    """
    Isolates character stroke pixels within localized bounding boxes.
    Applies Adaptive Thresholding and Otsu binarization to extract thin stroke masks,
    followed by 2-3px elliptical dilation covering character edges and anti-aliasing.
    Guarantees the dilated stroke mask area is strictly < 25% of the bounding box area.
    """

    def __init__(
        self,
        dilation_radius: int = 2,
        adaptive_block_size: int = 15,
        adaptive_c: int = 7,
        max_coverage_ratio: float = 0.249
    ):
        """
        Initialize the stroke segmenter.

        Args:
            dilation_radius: Radius for morphological dilation (default 2px).
            adaptive_block_size: Block size for Adaptive Gaussian Thresholding (must be odd).
            adaptive_c: Constant subtracted from weighted mean in adaptive thresholding.
            max_coverage_ratio: Upper bound for stroke mask coverage relative to crop area.
        """
        self.dilation_radius = max(1, int(dilation_radius))
        self.adaptive_block_size = adaptive_block_size if adaptive_block_size % 2 == 1 else adaptive_block_size + 1
        self.adaptive_c = int(adaptive_c)
        self.max_coverage_ratio = float(max_coverage_ratio)

        # Elliptical structuring element for natural stroke dilation
        k_size = self.dilation_radius * 2 + 1
        self.kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (k_size, k_size))
        # Small fallback kernel for high-density areas
        self.small_kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))

    def segment_box(
        self,
        image_bgr: np.ndarray,
        bbox: Tuple[float, float, float, float],
        padding: int = 4
    ) -> StrokeSegmentationResult:
        """
        Segments character strokes within a single bounding box crop.

        Args:
            image_bgr: Input BGR image (uint8, shape [H, W, 3]).
            bbox: Bounding box coordinates (x0, y0, x1, y1).
            padding: Pixel padding around the bounding box to capture edge strokes.

        Returns:
            StrokeSegmentationResult with core_mask, dilated_mask, and crop_bbox.
        """
        h, w = image_bgr.shape[:2]
        x0 = max(0, int(np.floor(bbox[0])) - padding)
        y0 = max(0, int(np.floor(bbox[1])) - padding)
        x1 = min(w, int(np.ceil(bbox[2])) + padding)
        y1 = min(h, int(np.ceil(bbox[3])) + padding)

        # Handle degenerate bounding boxes
        if x1 <= x0 or y1 <= y0:
            empty = np.zeros((1, 1), dtype=np.uint8)
            return StrokeSegmentationResult(empty, empty, (x0, y0, max(x0 + 1, x1), max(y0 + 1, y1)))

        crop = image_bgr[y0:y1, x0:x1]
        crop_h, crop_w = crop.shape[:2]
        total_pixels = crop_h * crop_w

        if total_pixels == 0:
            empty = np.zeros((1, 1), dtype=np.uint8)
            return StrokeSegmentationResult(empty, empty, (x0, y0, x1, y1))

        # Convert to grayscale
        if len(crop.shape) == 3 and crop.shape[2] == 3:
            gray = cv2.cvtColor(crop, cv2.COLOR_BGR2GRAY)
        else:
            gray = crop.copy()

        # Polarity detection: evaluate whether text is dark-on-light or light-on-dark
        # Sample border pixels (paper background) vs interior pixels
        border_top = gray[0, :]
        border_bottom = gray[-1, :]
        border_left = gray[:, 0]
        border_right = gray[:, -1]
        border_pixels = np.concatenate([border_top, border_bottom, border_left, border_right])

        bg_median = float(np.median(border_pixels))
        if crop_h > 2 and crop_w > 2:
            interior_median = float(np.median(gray[1:-1, 1:-1]))
        else:
            interior_median = bg_median

        is_dark_text = interior_median <= bg_median

        # 1. Adaptive Thresholding with Gaussian weights
        block_size = min(self.adaptive_block_size, (min(crop_h, crop_w) // 2) * 2 + 1)
        if block_size < 3:
            block_size = 3

        if is_dark_text:
            adaptive_mask = cv2.adaptiveThreshold(
                gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY_INV,
                block_size, self.adaptive_c
            )
            # 2. Otsu's binarization for global foreground/background separation
            _, otsu_mask = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
        else:
            adaptive_mask = cv2.adaptiveThreshold(
                gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY,
                block_size, self.adaptive_c
            )
            _, otsu_mask = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

        # 3. Fuse Adaptive Thresholding and Otsu's Binarization
        # Intersection removes local background gradient noise while keeping solid strokes
        core_mask = cv2.bitwise_and(adaptive_mask, otsu_mask)

        # If intersection is too sparse (faint pencil/pen strokes), fall back to adaptive mask
        core_pixel_count = np.count_nonzero(core_mask)
        if core_pixel_count < 4 and np.count_nonzero(adaptive_mask) >= 4:
            core_mask = adaptive_mask

        # 4. Morphological Dilation covering character edges and anti-aliasing
        dilated_mask = cv2.dilate(core_mask, self.kernel, iterations=1)

        # 5. Strict Guarantee: stroke mask area must be strictly < 25% of the bounding box area
        max_allowed_pixels = int(total_pixels * self.max_coverage_ratio)
        current_stroke_pixels = np.count_nonzero(dilated_mask)

        if current_stroke_pixels > max_allowed_pixels:
            # First try smaller 3x3 dilation
            dilated_mask = cv2.dilate(core_mask, self.small_kernel, iterations=1)
            current_stroke_pixels = np.count_nonzero(dilated_mask)

        if current_stroke_pixels > max_allowed_pixels:
            # Fall back to un-dilated core mask
            dilated_mask = core_mask.copy()
            current_stroke_pixels = np.count_nonzero(dilated_mask)

        if current_stroke_pixels > max_allowed_pixels:
            # Filter connected components to prune oversized background blobs
            num_labels, labels, stats, _ = cv2.connectedComponentsWithStats(dilated_mask, connectivity=8)
            # stats: [x, y, width, height, area]
            areas = stats[1:, cv2.CC_STAT_AREA] # Exclude background component 0
            if len(areas) > 0:
                # Retain components with area below median or reasonable stroke size
                refined_mask = np.zeros_like(dilated_mask)
                sorted_indices = np.argsort(areas) # Smallest to largest
                accumulated = 0
                for idx in sorted_indices:
                    comp_id = idx + 1
                    comp_area = stats[comp_id, cv2.CC_STAT_AREA]
                    if accumulated + comp_area <= max_allowed_pixels:
                        refined_mask[labels == comp_id] = 255
                        accumulated += comp_area
                    else:
                        break
                dilated_mask = refined_mask
                core_mask = cv2.bitwise_and(core_mask, dilated_mask)

        # Final safety assertion clamp: ensure strictly < 25%
        final_count = np.count_nonzero(dilated_mask)
        if final_count >= total_pixels * 0.25:
            # Subsample mask pixels by strongest contrast
            diff = np.abs(gray.astype(np.float32) - bg_median)
            mask_indices = np.where(dilated_mask == 255)
            if len(mask_indices[0]) > 0:
                stroke_diffs = diff[mask_indices]
                cutoff_k = int(total_pixels * 0.20)
                if cutoff_k > 0 and len(stroke_diffs) > cutoff_k:
                    threshold_val = np.partition(stroke_diffs, -cutoff_k)[-cutoff_k]
                    keep = (diff >= threshold_val) & (dilated_mask == 255)
                    dilated_mask = np.zeros_like(dilated_mask)
                    dilated_mask[keep] = 255
                    core_mask = cv2.bitwise_and(core_mask, dilated_mask)

        return StrokeSegmentationResult(
            core_mask=core_mask,
            dilated_mask=dilated_mask,
            crop_bbox=(x0, y0, x1, y1)
        )

    def segment_document(
        self,
        image_bgr: np.ndarray,
        boxes: List[Tuple[float, float, float, float]],
        padding: int = 4
    ) -> Tuple[np.ndarray, np.ndarray, List[StrokeSegmentationResult]]:
        """
        Segments character strokes for all bounding boxes across an entire document image.

        Args:
            image_bgr: Full document BGR image (uint8).
            boxes: List of bounding boxes [(x0, y0, x1, y1), ...].
            padding: Padding around each bounding box.

        Returns:
            Tuple of:
            - full_core_mask: Full-image binary mask of core un-dilated strokes (0 or 255).
            - full_dilated_mask: Full-image binary mask of dilated strokes (0 or 255).
            - results: List of individual StrokeSegmentationResult namedtuples.
        """
        h, w = image_bgr.shape[:2]
        full_core_mask = np.zeros((h, w), dtype=np.uint8)
        full_dilated_mask = np.zeros((h, w), dtype=np.uint8)
        results: List[StrokeSegmentationResult] = []

        for box in boxes:
            res = self.segment_box(image_bgr, box, padding=padding)
            x0, y0, x1, y1 = res.crop_bbox
            full_core_mask[y0:y1, x0:x1] = cv2.bitwise_or(full_core_mask[y0:y1, x0:x1], res.core_mask)
            full_dilated_mask[y0:y1, x0:x1] = cv2.bitwise_or(full_dilated_mask[y0:y1, x0:x1], res.dilated_mask)
            results.append(res)

        return full_core_mask, full_dilated_mask, results
