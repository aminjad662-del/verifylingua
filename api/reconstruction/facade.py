"""
Unified Document Reconstruction Facade (Milestone M3).
Provides automatic dual-pipeline routing:
1. Native Vector PDFs -> NativeVectorPipeline (PyMuPDF AST span extraction,
   pikepdf/MuPDF zero-white-patch text removal preserving 100% vector tables/lines,
   Arabic BiDi text shaping, and non-destructive spatial re-insertion with auto-fit).
2. Scanned Documents & Raster Images -> ScannedDocumentPipeline (stroke-level
   segmentation mask <25% area, fast Telea inpainting <20ms / pluggable LaMa,
   un-dilated core stroke median ink color extraction, typographic auto-fitting,
   optical Gaussian blur sigma=0.5, and paper grain Multiply blend mode compositing).
3. DOCX Documents -> DocxPipeline.
"""

from __future__ import annotations

import io
import os
import sys
from typing import Any, Dict, List, Optional, Tuple, Union

# Windows Python 3.14 compatibility guard against onnxruntime preload stall
if "pymupdf.layout" not in sys.modules:
    sys.modules["pymupdf.layout"] = None
if "onnxruntime" not in sys.modules:
    sys.modules["onnxruntime"] = None

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

try:
    import fitz  # PyMuPDF
    PYMUPDF_AVAILABLE = True
except Exception:
    fitz = None
    PYMUPDF_AVAILABLE = False

import pikepdf

from api.analyze import DocumentAnalysis, PageAnalysis, TextBlock
from api.reconstruction.font_cache import FontCache
from api.reconstruction.scanned_pipeline import (
    ScannedDocumentPipeline,
    ScannedReconstructionResult,
)
from services.vector_pipeline import (
    NativeVectorPipeline,
    get_vector_pipeline,
)


def generate_watermarked_preview(
    document_bytes: bytes,
    format_hint: str = "pdf",
    page_number: int = 1,
) -> bytes:
    """
    Renders watermarked Page 1 preview with diagonal official watermark.
    Sub-millisecond font resolution without recursive os.walk.
    """
    fmt = (format_hint or "pdf").lower()
    if fmt in ("jpg", "jpeg", "png", "bmp", "webp", "tiff", "tif"):
        base_img = Image.open(io.BytesIO(document_bytes)).convert("RGBA")
    else:
        # Render PDF page at 150 DPI
        rendered = False
        base_img = None
        try:
            import pypdfium2 as pdfium
            doc = pdfium.PdfDocument(document_bytes)
            idx = max(0, min(len(doc) - 1, page_number - 1))
            page = doc[idx]
            bitmap = page.render(scale=150.0 / 72.0)
            base_img = bitmap.to_pil().convert("RGBA")
            rendered = True
        except Exception:
            pass

        if not rendered:
            if PYMUPDF_AVAILABLE:
                try:
                    doc = fitz.open(stream=document_bytes, filetype="pdf")
                    idx = max(0, min(len(doc) - 1, page_number - 1))
                    page = doc[idx]
                    pix = page.get_pixmap(dpi=150)
                    base_img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples).convert("RGBA")
                    doc.close()
                    rendered = True
                except Exception:
                    pass

        if base_img is None:
            base_img = Image.new("RGBA", (800, 1000), (255, 255, 255, 255))

    # Watermark overlay
    overlay = Image.new("RGBA", base_img.size, (255, 255, 255, 0))
    draw = ImageDraw.Draw(overlay)

    font_size = max(24, int(base_img.width / 20))
    font_path = FontCache.find_font_file("arial.ttf") or FontCache.resolve_font("sans", "en")
    try:
        wm_font = ImageFont.truetype(font_path, font_size)
    except Exception:
        wm_font = ImageFont.load_default()

    watermark_text = "PREVIEW — VERIFYLINGUA — OFFICIAL"
    w, h = base_img.size
    for y_offset in range(-h, h * 2, int(font_size * 4)):
        draw.text(
            (w * 0.15, y_offset + w * 0.2),
            watermark_text,
            font=wm_font,
            fill=(180, 20, 20, 55),
        )

    watermarked = Image.alpha_composite(base_img, overlay).convert("RGB")
    out_stream = io.BytesIO()
    watermarked.save(out_stream, format="JPEG", quality=85)
    return out_stream.getvalue()


class DocumentReconstructionFacade:
    """
    Unified Document Reconstruction Facade.
    Automatically identifies document topology (Vector PDF vs Scanned Raster vs DOCX)
    and routes execution to the specialized reconstruction pipeline.
    """

    def __init__(
        self,
        vector_pipeline: Optional[NativeVectorPipeline] = None,
        scanned_pipeline: Optional[ScannedDocumentPipeline] = None,
        fonts_dir: Optional[str] = None,
    ):
        self.vector_pipeline = vector_pipeline or get_vector_pipeline(fonts_dir=fonts_dir)
        self.scanned_pipeline = scanned_pipeline or ScannedDocumentPipeline(blur_sigma=0.5)

    def is_native_vector_pdf(
        self,
        pdf_bytes: bytes,
        analysis: Optional[DocumentAnalysis] = None,
    ) -> bool:
        """
        Determines whether a PDF document contains native digital vector content
        or is purely scanned bitmap imagery.
        """
        # 1. Check explicit analysis classification if available
        if analysis and analysis.pages:
            all_scanned = all(
                p.kind in ("scanned", "image_only") for p in analysis.pages
            )
            has_digital = any(
                p.kind in ("digital_text", "hybrid", "vector_graphic")
                for p in analysis.pages
            )
            if all_scanned and not has_digital:
                return False
            if has_digital:
                return True

        # 2. Inspect PDF structure directly
        if PYMUPDF_AVAILABLE:
            try:
                doc = fitz.open(stream=pdf_bytes, filetype="pdf")
                total_text = sum(len(page.get_text().strip()) for page in doc)
                has_drawings = any(len(page.get_drawings()) > 0 for page in doc)
                has_images = any(len(page.get_images()) > 0 for page in doc)
                doc.close()

                # If text exists or vector drawings exist without being exclusively a scanned image wrapper
                if total_text > 0 or (has_drawings and not has_images):
                    return True
                if total_text == 0 and has_images:
                    return False
            except Exception:
                pass

        # 3. Fallback: inspect content streams via pikepdf
        try:
            with pikepdf.open(io.BytesIO(pdf_bytes)) as pdf:
                if len(pdf.pages) > 0:
                    stream_bytes = pdf.pages[0].Contents.read_bytes()
                    # Check for text or vector path operators
                    has_text_ops = b"BT" in stream_bytes or b"Tj" in stream_bytes or b"TJ" in stream_bytes
                    has_vector_ops = b" re " in stream_bytes or b" m " in stream_bytes or b" l " in stream_bytes
                    if has_text_ops or has_vector_ops:
                        return True
        except Exception:
            pass

        return True

    def reconstruct(
        self,
        original_bytes: bytes,
        file_format: str,
        analysis: Optional[DocumentAnalysis] = None,
        translated_segments: Optional[List[Dict[str, Any]]] = None,
        target_lang: str = "en",
        prefer_lama: bool = False,
    ) -> Tuple[bytes, bytes, List[Dict[str, Any]]]:
        """
        Main entry point for unified document reconstruction:
        Returns (rendered_document_bytes, preview_image_bytes, qa_page_records).
        """
        fmt = (file_format or "pdf").lower().strip()
        segments = translated_segments or []

        # -------------------------------------------------------------------
        # 1. Raster Image Pipeline (PNG, JPG, TIFF, etc.)
        # -------------------------------------------------------------------
        if fmt in ("jpg", "jpeg", "png", "bmp", "webp", "tiff", "tif"):
            return self._reconstruct_image(
                original_bytes=original_bytes,
                file_format=fmt,
                analysis=analysis,
                translated_segments=segments,
                target_lang=target_lang,
                prefer_lama=prefer_lama,
            )

        # -------------------------------------------------------------------
        # 2. DOCX Pipeline
        # -------------------------------------------------------------------
        if fmt == "docx":
            return self._reconstruct_docx(
                original_bytes=original_bytes,
                translated_segments=segments,
                target_lang=target_lang,
            )

        # -------------------------------------------------------------------
        # 3. PDF Pipeline (Native Vector vs Scanned Raster Routing)
        # -------------------------------------------------------------------
        is_vector = self.is_native_vector_pdf(original_bytes, analysis)

        if is_vector:
            return self._reconstruct_vector_pdf(
                original_bytes=original_bytes,
                analysis=analysis,
                translated_segments=segments,
                target_lang=target_lang,
            )
        else:
            return self._reconstruct_scanned_pdf(
                original_bytes=original_bytes,
                analysis=analysis,
                translated_segments=segments,
                target_lang=target_lang,
                prefer_lama=prefer_lama,
            )

    def _reconstruct_image(
        self,
        original_bytes: bytes,
        file_format: str,
        analysis: Optional[DocumentAnalysis],
        translated_segments: List[Dict[str, Any]],
        target_lang: str,
        prefer_lama: bool = False,
    ) -> Tuple[bytes, bytes, List[Dict[str, Any]]]:
        """Reconstructs raster image documents using ScannedDocumentPipeline."""
        # Decode image to BGR numpy array
        np_arr = np.frombuffer(original_bytes, np.uint8)
        img_bgr = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        if img_bgr is None:
            pil_img = Image.open(io.BytesIO(original_bytes)).convert("RGB")
            img_bgr = cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)

        h, w = img_bgr.shape[:2]

        # Extract blocks from analysis or build from translated segments
        blocks: List[Any] = []
        non_text_regions: List[Any] = []
        if analysis and analysis.pages:
            p0 = analysis.pages[0]
            blocks = list(p0.blocks)
            non_text_regions = list(p0.non_text_regions)

        # Build translation map
        trans_dict: Dict[str, str] = {}
        for s in translated_segments:
            bid = s.get("block_id") or s.get("id") or ""
            ttext = s.get("translated_text") or s.get("text") or ""
            if bid:
                trans_dict[str(bid)] = ttext

            # If no analysis blocks were provided, synthesize block from segment
            if not blocks and ttext:
                raw_bbox = s.get("bbox") or [40.0, 40.0, float(w - 40), 100.0]
                blocks.append({
                    "id": bid or f"b_{len(blocks)}",
                    "bbox": raw_bbox,
                    "text": s.get("source_text") or ttext,
                    "font_size": s.get("font_size", 14.0),
                    "role": s.get("role", "paragraph"),
                })

        # Process via ScannedDocumentPipeline
        scanned_res = self.scanned_pipeline.process_document(
            image_bgr=img_bgr,
            text_blocks=blocks,
            target_lang=target_lang,
            translations=trans_dict,
            non_text_regions=non_text_regions,
            prefer_lama=prefer_lama,
        )

        # Encode reconstructed image
        ext = ".jpg" if file_format in ("jpg", "jpeg") else ".png"
        success, enc_buf = cv2.imencode(ext, scanned_res.reconstructed_bgr)
        if not success:
            pil_res = Image.fromarray(cv2.cvtColor(scanned_res.reconstructed_bgr, cv2.COLOR_BGR2RGB))
            buf = io.BytesIO()
            pil_res.save(buf, format="PNG" if ext == ".png" else "JPEG")
            rendered_bytes = buf.getvalue()
        else:
            rendered_bytes = enc_buf.tobytes()

        preview_bytes = generate_watermarked_preview(rendered_bytes, format_hint=file_format)

        qa_records = [{
            "page_number": 1,
            "overflow_mitigated": False,
            "segments_count": len(translated_segments),
            "width": float(w),
            "height": float(h),
            "pipeline": "scanned_pipeline",
            "sampled_colors_count": len(scanned_res.sampled_colors),
            "execution_stats": scanned_res.execution_stats,
        }]

        return rendered_bytes, preview_bytes, qa_records

    def _reconstruct_docx(
        self,
        original_bytes: bytes,
        translated_segments: List[Dict[str, Any]],
        target_lang: str,
    ) -> Tuple[bytes, bytes, List[Dict[str, Any]]]:
        """Reconstructs DOCX files via DocxPipeline."""
        from api.docx_pipeline import DocxPipeline

        rendered_bytes = DocxPipeline.reconstruct_docx(
            original_bytes=original_bytes,
            translated_segments=translated_segments,
            target_lang=target_lang,
        )
        preview_bytes = DocxPipeline.generate_docx_preview(
            docx_bytes=rendered_bytes,
            target_lang=target_lang,
        )
        qa_val = DocxPipeline.validate_docx_structure(
            original_bytes=original_bytes,
            reconstructed_bytes=rendered_bytes,
            target_lang=target_lang,
        )
        qa_records = [{
            "page_number": 1,
            "overflow_mitigated": False,
            "segments_count": len(translated_segments),
            "width": 612.0,
            "height": 792.0,
            "validation": qa_val,
            "pipeline": "docx_pipeline",
        }]
        return rendered_bytes, preview_bytes, qa_records

    def _reconstruct_vector_pdf(
        self,
        original_bytes: bytes,
        analysis: Optional[DocumentAnalysis],
        translated_segments: List[Dict[str, Any]],
        target_lang: str,
    ) -> Tuple[bytes, bytes, List[Dict[str, Any]]]:
        """
        Reconstructs native vector PDF documents:
        1. PyMuPDF AST + pikepdf token filter eradicating text with zero white patches.
        2. Preserves 100% vector geometry, tables, and gridlines.
        3. BiDi Arabic reshaping and auto-fitted spatial re-insertion.
        """
        # Determine total page count
        page_count = 1
        page_dims: List[Tuple[float, float]] = []
        if PYMUPDF_AVAILABLE:
            try:
                doc = fitz.open(stream=original_bytes, filetype="pdf")
                page_count = len(doc)
                for p in doc:
                    page_dims.append((p.rect.width, p.rect.height))
                doc.close()
            except Exception:
                page_count = 1
        else:
            with pikepdf.open(io.BytesIO(original_bytes)) as pdf:
                page_count = len(pdf.pages)
                for p in pdf.pages:
                    mb = [float(v) for v in p.MediaBox]
                    page_dims.append((mb[2] - mb[0], mb[3] - mb[1]))

        # Remove text losslessly across all pages with zero white patches
        sanitized_pdf = self.vector_pipeline.remove_text_lossless(
            pdf_bytes=original_bytes,
            page_index=None,
            engine="auto",
        )

        # Build block lookup from analysis if available
        analysis_blocks_by_id: Dict[str, TextBlock] = {}
        if analysis and analysis.pages:
            for p in analysis.pages:
                for b in p.blocks:
                    analysis_blocks_by_id[b.id] = b

        # Group translated segments by page number (1-indexed)
        segs_by_page: Dict[int, List[Dict[str, Any]]] = {}
        for s in translated_segments:
            p_no = int(s.get("page_number", 1))
            segs_by_page.setdefault(p_no, []).append(s)

        # Re-insert translated text page-by-page
        qa_records: List[Dict[str, Any]] = []

        for page_idx in range(page_count):
            page_no = page_idx + 1
            page_w, page_h = page_dims[page_idx] if page_idx < len(page_dims) else (612.0, 792.0)
            page_segs = segs_by_page.get(page_no, [])

            # Prepare translations list formatted for vector_pipeline
            page_translations: List[Dict[str, Any]] = []

            for s in page_segs:
                ttext = s.get("translated_text") or s.get("text") or ""
                if not ttext.strip():
                    continue

                bid = s.get("block_id") or s.get("id") or ""
                matching_block = analysis_blocks_by_id.get(bid)

                # Determine bounding box
                raw_bbox = s.get("bbox")
                if not raw_bbox and matching_block:
                    if matching_block.pixel_bbox and len(matching_block.pixel_bbox) == 4:
                        raw_bbox = matching_block.pixel_bbox
                    else:
                        # Convert bottom-up bbox to top-down coordinates
                        bx0, by0, bx1, by1 = matching_block.bbox
                        raw_bbox = [bx0, page_h - by1, bx1, page_h - by0]

                if not raw_bbox:
                    # Fallback coordinate
                    raw_bbox = [50.0, 50.0 + len(page_translations) * 30.0, page_w - 50.0, 75.0 + len(page_translations) * 30.0]

                # Ensure coordinates are top-down [x0, y0, x1, y1] with x0 < x1, y0 < y1
                x0, y0, x1, y1 = [float(v) for v in raw_bbox]
                if y0 > y1:
                    y0, y1 = y1, y0
                if x0 > x1:
                    x0, x1 = x1, x0

                font_size = float(s.get("font_size") or (matching_block.font_size if matching_block else 11.0))
                role = str(s.get("role") or (matching_block.role if matching_block else "paragraph")).lower()
                is_serif = bool(s.get("is_serif", "serif" in role or "heading" in role or "title" in role))
                is_bold = bool(s.get("is_bold", "heading" in role or "title" in role))
                is_italic = bool(s.get("is_italic", False))
                color = s.get("rgb", (0.0, 0.0, 0.0))

                page_translations.append({
                    "bbox": [x0, y0, x1, y1],
                    "translated_text": ttext,
                    "font_size": font_size,
                    "is_serif": is_serif,
                    "is_bold": is_bold,
                    "is_italic": is_italic,
                    "rgb": color,
                    "hex_color": s.get("hex_color", "#000000"),
                })

            if page_translations:
                sanitized_pdf = self.vector_pipeline.insert_translated_text(
                    sanitized_pdf_bytes=sanitized_pdf,
                    page_index=page_idx,
                    translations=page_translations,
                    target_lang=target_lang,
                )

            qa_records.append({
                "page_number": page_no,
                "overflow_mitigated": False,
                "segments_count": len(page_translations),
                "width": page_w,
                "height": page_h,
                "pipeline": "vector_pipeline",
            })

        preview_bytes = generate_watermarked_preview(sanitized_pdf, format_hint="pdf")
        return sanitized_pdf, preview_bytes, qa_records

    def _reconstruct_scanned_pdf(
        self,
        original_bytes: bytes,
        analysis: Optional[DocumentAnalysis],
        translated_segments: List[Dict[str, Any]],
        target_lang: str,
        prefer_lama: bool = False,
    ) -> Tuple[bytes, bytes, List[Dict[str, Any]]]:
        """Reconstructs scanned raster PDFs via ScannedDocumentPipeline per page."""
        import pypdfium2 as pdfium

        doc = pdfium.PdfDocument(original_bytes)
        page_count = len(doc)
        rendered_pages: List[Image.Image] = []
        qa_records: List[Dict[str, Any]] = []

        # Group translated segments by page number
        segs_by_page: Dict[int, List[Dict[str, Any]]] = {}
        for s in translated_segments:
            p_no = int(s.get("page_number", 1))
            segs_by_page.setdefault(p_no, []).append(s)

        for page_idx in range(page_count):
            page_no = page_idx + 1
            pdf_page = doc[page_idx]
            # Render page at 150 DPI
            scale = 150.0 / 72.0
            bitmap = pdf_page.render(scale=scale)
            pil_page = bitmap.to_pil().convert("RGB")
            img_bgr = cv2.cvtColor(np.array(pil_page), cv2.COLOR_RGB2BGR)
            h, w = img_bgr.shape[:2]

            # Get blocks for this page
            blocks: List[Any] = []
            non_text: List[Any] = []
            if analysis and page_idx < len(analysis.pages):
                ap = analysis.pages[page_idx]
                blocks = list(ap.blocks)
                non_text = list(ap.non_text_regions)

            page_segs = segs_by_page.get(page_no, [])
            trans_dict = {
                str(s.get("block_id") or s.get("id")): str(s.get("translated_text") or s.get("text", ""))
                for s in page_segs
                if (s.get("block_id") or s.get("id"))
            }

            scanned_res = self.scanned_pipeline.process_document(
                image_bgr=img_bgr,
                text_blocks=blocks,
                target_lang=target_lang,
                translations=trans_dict,
                non_text_regions=non_text,
                prefer_lama=prefer_lama,
            )

            rec_pil = Image.fromarray(cv2.cvtColor(scanned_res.reconstructed_bgr, cv2.COLOR_BGR2RGB))
            rendered_pages.append(rec_pil)

            qa_records.append({
                "page_number": page_no,
                "overflow_mitigated": False,
                "segments_count": len(page_segs),
                "width": float(w),
                "height": float(h),
                "pipeline": "scanned_pipeline",
                "sampled_colors_count": len(scanned_res.sampled_colors),
                "execution_stats": scanned_res.execution_stats,
            })

        # Assemble PDF from rendered pages
        out_stream = io.BytesIO()
        if rendered_pages:
            rendered_pages[0].save(
                out_stream,
                format="PDF",
                save_all=True,
                append_images=rendered_pages[1:],
                resolution=150.0,
            )
        pdf_bytes = out_stream.getvalue()
        preview_bytes = generate_watermarked_preview(pdf_bytes, format_hint="pdf")
        return pdf_bytes, preview_bytes, qa_records


# Global facade instance and module-level functions
_facade_instance: Optional[DocumentReconstructionFacade] = None


def get_reconstruction_facade() -> DocumentReconstructionFacade:
    """Returns singleton DocumentReconstructionFacade instance."""
    global _facade_instance
    if _facade_instance is None:
        _facade_instance = DocumentReconstructionFacade()
    return _facade_instance


def reconstruct_document(
    original_bytes: bytes,
    file_format: str,
    analysis: Optional[DocumentAnalysis] = None,
    translated_segments: Optional[List[Dict[str, Any]]] = None,
    target_lang: str = "en",
    prefer_lama: bool = False,
) -> Tuple[bytes, bytes, List[Dict[str, Any]]]:
    """
    Unified public dispatcher for document layout reconstruction.
    Delegates to NativeVectorPipeline, ScannedDocumentPipeline, or DocxPipeline.
    """
    return get_reconstruction_facade().reconstruct(
        original_bytes=original_bytes,
        file_format=file_format,
        analysis=analysis,
        translated_segments=translated_segments or [],
        target_lang=target_lang,
        prefer_lama=prefer_lama,
    )


def render_translated_document(
    original_bytes: bytes,
    file_format: str,
    analysis: Optional[DocumentAnalysis] = None,
    translated_segments: Optional[List[Dict[str, Any]]] = None,
    target_lang: str = "en",
    prefer_lama: bool = False,
) -> Tuple[bytes, bytes, List[Dict[str, Any]]]:
    """Alias for reconstruct_document for API compatibility."""
    return reconstruct_document(
        original_bytes=original_bytes,
        file_format=file_format,
        analysis=analysis,
        translated_segments=translated_segments,
        target_lang=target_lang,
        prefer_lama=prefer_lama,
    )
