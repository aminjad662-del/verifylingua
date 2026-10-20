"""
Typography Engine for Scanned Documents and Layout Reconstruction.
Provides font topology mapping (Serif -> Amiri, Sans -> Cairo/Noto, Mono -> Courier),
fast direct font resolution, HarfBuzz/BiDi text shaping, and TypographicFitter
with dynamic auto-scaling down to 70% and tracking condensation (-0.5px).
"""

import os
from typing import NamedTuple, Tuple, List, Optional, Dict, Any
from PIL import ImageFont, ImageDraw, Image
import uharfbuzz as hb
import arabic_reshaper
from bidi.algorithm import get_display


class TypographicFitResult(NamedTuple):
    lines: List[str]            # Formatted and shaped lines ready for rendering
    font_size: float            # Final adjusted font size (auto-scaled down to 70%)
    letter_spacing: float       # Tracking condensation in pixels (0.0 down to -0.5px)
    total_height: float         # Calculated total text block height
    max_width: float            # Maximum line width in pixels
    line_height: float          # Per-line height in pixels
    font_path: str              # Path to resolved TrueType/OpenType font file


# Candidate search directories for fast direct resolution (no recursive os.walk)
FONT_DIRECTORIES = [
    os.path.join(os.path.dirname(__file__), "..", "..", "public", "fonts", "unicode"),
    os.path.join(os.path.dirname(__file__), "..", "..", "dist", "fonts", "unicode"),
    os.path.join(os.path.dirname(__file__), "..", "..", "out", "fonts", "unicode"),
    os.path.join(os.path.dirname(__file__), "..", "fonts"),
    "C:/Windows/Fonts",
    "/usr/share/fonts/truetype",
    "/usr/share/fonts",
    "/usr/local/share/fonts"
]

FONT_TOPOLOGY_MAP = {
    "serif": {
        "ar": ["Amiri-Regular.ttf", "Amiri-Bold.ttf", "times.ttf", "NotoSansArabic-Regular.ttf", "arial.ttf"],
        "latin": ["times.ttf", "timesbd.ttf", "georgia.ttf", "arial.ttf"],
        "cjk": ["simsun.ttc", "msyh.ttc"]
    },
    "sans": {
        "ar": ["Cairo-Regular.ttf", "NotoSansArabic-Regular.ttf", "arial.ttf", "segoeui.ttf", "tahoma.ttf"],
        "latin": ["arial.ttf", "arialbd.ttf", "segoeui.ttf", "calibri.ttf"],
        "cjk": ["msyh.ttc", "simsun.ttc"]
    },
    "mono": {
        "ar": ["DejaVuSansMono.ttf", "cour.ttf", "consola.ttf", "NotoSansArabic-Regular.ttf"],
        "latin": ["cour.ttf", "courbd.ttf", "consola.ttf", "arial.ttf"],
        "cjk": ["simsun.ttc"]
    }
}


class FontResolver:
    """Fast font resolver with direct lookup and in-memory path caching."""

    _PATH_CACHE: Dict[str, Optional[str]] = {}

    @classmethod
    def find_font_file(cls, filename: str) -> Optional[str]:
        """
        Directly looks up font file across candidate directories.
        Guarantees instant startup with 0 recursive walks.
        """
        filename_clean = filename.strip()
        if not filename_clean:
            return None

        if filename_clean in cls._PATH_CACHE:
            return cls._PATH_CACHE[filename_clean]

        # Check if already absolute or valid relative path
        if os.path.isabs(filename_clean) and os.path.exists(filename_clean):
            cls._PATH_CACHE[filename_clean] = filename_clean
            return filename_clean

        # Check in search directories
        for directory in FONT_DIRECTORIES:
            candidate = os.path.normpath(os.path.join(directory, filename_clean))
            if os.path.exists(candidate):
                cls._PATH_CACHE[filename_clean] = candidate
                return candidate

        cls._PATH_CACHE[filename_clean] = None
        return None

    @classmethod
    def resolve_font(
        cls,
        topology: str = "sans",
        target_lang: str = "latin",
        bold: bool = False,
        italic: bool = False
    ) -> str:
        """
        Resolves best matching font path based on topology mapping.
        Serif -> Amiri (ar) / Times (latin)
        Sans -> Cairo/Noto (ar) / Arial (latin)
        Mono -> Courier
        """
        top_key = topology.lower().strip()
        if "serif" in top_key:
            top_key = "serif"
        elif "mono" in top_key:
            top_key = "mono"
        else:
            top_key = "sans"

        lang_key = target_lang.lower().strip()
        if lang_key.startswith("ar"):
            script_key = "ar"
        elif any(lang_key.startswith(c) for c in ["zh", "ja", "ko"]):
            script_key = "cjk"
        else:
            script_key = "latin"

        candidates = FONT_TOPOLOGY_MAP.get(top_key, {}).get(script_key, ["arial.ttf"])

        for cand in candidates:
            path = cls.find_font_file(cand)
            if path:
                return path

        # Universal system fallbacks
        for fallback in ["arial.ttf", "times.ttf", "segoeui.ttf", "cour.ttf"]:
            path = cls.find_font_file(fallback)
            if path:
                return path

        # Return default font if no true-type font found
        return ""


class TextShaper:
    """Handles Unicode BiDi reordering and HarfBuzz OpenType shaping."""

    @staticmethod
    def is_rtl(text: str) -> bool:
        """Checks if text contains Arabic or Hebrew RTL characters."""
        for ch in text:
            code = ord(ch)
            # Arabic: U+0600 - U+06FF, Hebrew: U+0590 - U+05FF, Arabic Supplement / Presentation: U+0750 - U+08FF, U+FB50 - U+FDFF, U+FE70 - U+FEFF
            if (0x0590 <= code <= 0x08FF) or (0xFB50 <= code <= 0xFDFF) or (0xFE70 <= code <= 0xFEFF):
                return True
        return False

    @staticmethod
    def shape_text(text: str, is_rtl_mode: Optional[bool] = None) -> str:
        """
        Applies Arabic reshaping and BiDi visual ordering for correct rendering in Pillow.
        """
        if not text:
            return ""

        rtl = is_rtl_mode if is_rtl_mode is not None else TextShaper.is_rtl(text)
        if rtl:
            try:
                reshaped = arabic_reshaper.reshape(text)
                return get_display(reshaped)
            except Exception:
                return text
        return text


class TypographicFitter:
    """
    Dynamically auto-scales font size down to 70% and tracking condensation down to -0.5px
    to fit translated text strictly within original bounding box clearance.
    """

    @staticmethod
    def measure_text_width(text: str, font: ImageFont.ImageFont, letter_spacing: float = 0.0) -> float:
        """Measures rendered width of text line with letter spacing."""
        if not text:
            return 0.0
        try:
            length = font.getlength(text)
        except AttributeError:
            bbox = font.getbbox(text)
            length = float(bbox[2] - bbox[0])

        if letter_spacing != 0.0 and len(text) > 1:
            length += letter_spacing * (len(text) - 1)
        return float(max(0.0, length))

    @staticmethod
    def wrap_text(
        text: str,
        target_width: float,
        font: ImageFont.ImageFont,
        letter_spacing: float = 0.0
    ) -> List[str]:
        """
        Wraps text into lines that do not exceed target_width.
        Preserves natural word boundaries where possible.
        """
        if not text:
            return [""]

        words = text.split(" ")
        lines: List[str] = []
        current_line: List[str] = []

        for word in words:
            candidate = " ".join(current_line + [word]) if current_line else word
            width = TypographicFitter.measure_text_width(candidate, font, letter_spacing)
            if width <= target_width or not current_line:
                current_line.append(word)
            else:
                lines.append(" ".join(current_line))
                current_line = [word]

        if current_line:
            lines.append(" ".join(current_line))

        return lines if lines else [text]

    @staticmethod
    def fit_text_to_bbox(
        text: str,
        target_width: float,
        target_height: float,
        font_path: str,
        initial_font_size: float = 14.0,
        min_font_scale: float = 0.70,
        is_rtl: Optional[bool] = None
    ) -> TypographicFitResult:
        """
        Fits text to bounding box clearance using dynamic auto-scaling down to 70%
        and tracking condensation (-0.5px).

        Args:
            text: Text string to fit.
            target_width: Available bounding box width.
            target_height: Available bounding box height.
            font_path: Path to font file.
            initial_font_size: Starting font size in points/pixels.
            min_font_scale: Minimum scale factor (default 0.70 for 70% clearance guarantee).
            is_rtl: Whether text is RTL (auto-detected if None).

        Returns:
            TypographicFitResult with lines, font_size, letter_spacing, total_height, max_width, line_height.
        """
        rtl = is_rtl if is_rtl is not None else TextShaper.is_rtl(text)
        min_font_size = max(5.0, initial_font_size * min_font_scale)
        font_size = float(initial_font_size)
        letter_spacing = 0.0

        # Load initial font
        try:
            font = ImageFont.truetype(font_path, int(font_size)) if font_path else ImageFont.load_default()
        except Exception:
            font = ImageFont.load_default()

        # Step 1: Iteratively down-scale font size down to 70% to satisfy box constraints
        lines: List[str] = []
        line_height = font_size * 1.25

        for step in range(12):
            try:
                font = ImageFont.truetype(font_path, int(round(font_size))) if font_path else ImageFont.load_default()
            except Exception:
                font = ImageFont.load_default()

            raw_lines = TypographicFitter.wrap_text(text, target_width, font, letter_spacing)
            line_height = font_size * 1.25
            total_h = len(raw_lines) * line_height

            # Check if all lines fit within target_width and total height fits target_height
            max_w = max([TypographicFitter.measure_text_width(l, font, letter_spacing) for l in raw_lines]) if raw_lines else 0.0

            if (total_h <= target_height + 2.0 and max_w <= target_width + 2.0) or font_size <= min_font_size:
                lines = raw_lines
                break

            # Scale down progressively
            font_size = max(min_font_size, font_size * 0.92)

        # Step 2: If still tight at 70% scale, apply tracking condensation (-0.5px)
        max_w = max([TypographicFitter.measure_text_width(l, font, letter_spacing) for l in lines]) if lines else 0.0
        if max_w > target_width:
            letter_spacing = -0.5
            lines = TypographicFitter.wrap_text(text, target_width, font, letter_spacing)
            max_w = max([TypographicFitter.measure_text_width(l, font, letter_spacing) for l in lines]) if lines else 0.0

        # Step 3: Shape lines for BiDi/Arabic display if applicable
        shaped_lines = [TextShaper.shape_text(l, is_rtl_mode=rtl) for l in lines]
        total_height = float(len(shaped_lines) * line_height)

        return TypographicFitResult(
            lines=shaped_lines,
            font_size=round(font_size, 1),
            letter_spacing=letter_spacing,
            total_height=total_height,
            max_width=max_w,
            line_height=line_height,
            font_path=font_path
        )
