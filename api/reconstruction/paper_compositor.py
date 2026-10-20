"""
Paper Texture Realism & Blend Compositor for Scanned Documents.
Applies optical Gaussian blur (sigma in [0.4, 0.6]) to simulate scanner MTF and physical ink bleed,
and composites rendered text layers onto inpainted background using the Multiply blend mode,
ensuring physical paper grain and fibers modulate translated ink characters.
"""

from typing import Tuple, List, Dict, Any, Optional
import numpy as np
import cv2
from PIL import Image, ImageFilter, ImageDraw, ImageFont


class PaperTextureCompositor:
    """
    Composites rendered text layers onto document backgrounds using optical Gaussian blur
    and Multiply blend mode: C_final = (1 - alpha) * C_bg + alpha * (C_bg * C_text / 255).
    """

    @staticmethod
    def composite_text_layer(
        background_bgr: np.ndarray,
        text_rgba: Image.Image,
        sigma: float = 0.5
    ) -> np.ndarray:
        """
        Applies optical blur to text layer, then performs Multiply blend:
        Subtractive ink model: C_mult = (C_bg * C_text) / 255.0 modulated by alpha.

        Args:
            background_bgr: Inpainted document background (BGR uint8, shape [H, W, 3]).
            text_rgba: Transparent PIL RGBA image of rendered text (size [W, H]).
            sigma: Optical Gaussian blur radius simulating scanner point-spread function
                   and paper absorption (default 0.5, typically in range [0.4, 0.6]).

        Returns:
            Final composited document image (BGR uint8, shape [H, W, 3]).
        """
        bg_h, bg_w = background_bgr.shape[:2]

        # Ensure text_rgba matches background dimensions
        if text_rgba.size != (bg_w, bg_h):
            text_rgba = text_rgba.resize((bg_w, bg_h), resample=Image.Resampling.BILINEAR)

        # 1. Apply Gaussian blur to simulate scanner MTF and ink bleed
        if sigma > 0.0:
            blurred_text = text_rgba.filter(ImageFilter.GaussianBlur(radius=float(sigma)))
        else:
            blurred_text = text_rgba

        text_np = np.array(blurred_text, dtype=np.float32)

        # Extract text RGB and alpha channel [0..1]
        t_rgb = text_np[:, :, :3]
        alpha = text_np[:, :, 3:4] / 255.0

        # Background RGB in float32
        bg_rgb = cv2.cvtColor(background_bgr, cv2.COLOR_BGR2RGB).astype(np.float32)

        # 2. Multiply Blend Mode calculation (subtractive ink physical model)
        # C_multiply = (C_bg * C_text) / 255.0
        multiply_rgb = (bg_rgb * t_rgb) / 255.0

        # 3. Alpha compositing: blend between pure paper background and multiplied ink
        final_rgb = (1.0 - alpha) * bg_rgb + alpha * multiply_rgb
        final_rgb = np.clip(final_rgb, 0.0, 255.0).astype(np.uint8)

        # Convert back to BGR for OpenCV compatibility
        return cv2.cvtColor(final_rgb, cv2.COLOR_RGB2BGR)

    @staticmethod
    def render_text_block(
        draw: ImageDraw.ImageDraw,
        x0: float,
        y0: float,
        lines: List[str],
        font: ImageFont.ImageFont,
        color_rgb: Tuple[int, int, int],
        line_height: float,
        letter_spacing: float = 0.0,
        is_rtl: bool = False,
        box_width: Optional[float] = None
    ) -> None:
        """
        Renders multi-line text onto an ImageDraw canvas with support for letter spacing and alignment.
        """
        cur_y = float(y0)
        rgba_color = (int(color_rgb[0]), int(color_rgb[1]), int(color_rgb[2]), 255)

        for line in lines:
            if not line:
                cur_y += line_height
                continue

            # Determine x coordinate
            line_x = float(x0)
            if is_rtl and box_width is not None:
                # Right-aligned for RTL
                try:
                    lw = font.getlength(line)
                except AttributeError:
                    b = font.getbbox(line)
                    lw = float(b[2] - b[0])
                if letter_spacing != 0.0 and len(line) > 1:
                    lw += letter_spacing * (len(line) - 1)
                line_x = max(float(x0), float(x0) + float(box_width) - lw)

            if letter_spacing == 0.0 or len(line) <= 1:
                draw.text((line_x, cur_y), line, font=font, fill=rgba_color)
            else:
                # Render character by character with tracking condensation
                cur_x = line_x
                for ch in line:
                    draw.text((cur_x, cur_y), ch, font=font, fill=rgba_color)
                    try:
                        ch_w = font.getlength(ch)
                    except AttributeError:
                        b = font.getbbox(ch)
                        ch_w = float(b[2] - b[0])
                    cur_x += ch_w + letter_spacing

            cur_y += line_height
