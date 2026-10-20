"""
Services Vector Pipeline Wrapper
Exposes service interfaces and singleton access for NativeVectorPipeline (R4, R5).
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional, Tuple, Union

from api.reconstruction.vector_pdf_pipeline import (
    NativeVectorPipeline,
    VectorFontMeta,
    VectorSpan,
    VectorLine,
    VectorBlock,
    VectorPageSpans,
    find_font_file_direct,
    resolve_topology_font,
)

__all__ = [
    "NativeVectorPipeline",
    "VectorFontMeta",
    "VectorSpan",
    "VectorLine",
    "VectorBlock",
    "VectorPageSpans",
    "get_vector_pipeline",
    "extract_page_spans",
    "remove_text_lossless",
    "insert_translated_text",
    "shape_bidi_text",
    "verify_vector_preservation",
    "find_font_file_direct",
    "resolve_topology_font",
]

_pipeline_instance: Optional[NativeVectorPipeline] = None


def get_vector_pipeline(fonts_dir: Optional[str] = None) -> NativeVectorPipeline:
    """Returns or initializes the singleton NativeVectorPipeline instance."""
    global _pipeline_instance
    if _pipeline_instance is None or fonts_dir is not None:
        _pipeline_instance = NativeVectorPipeline(fonts_dir=fonts_dir)
    return _pipeline_instance


def extract_page_spans(
    pdf_bytes: bytes,
    page_index: int = 0
) -> Dict[str, Any]:
    """Convenience service function for extracting span hierarchy from a PDF page."""
    return get_vector_pipeline().extract_page_spans(pdf_bytes, page_index=page_index)


def remove_text_lossless(
    pdf_bytes: bytes,
    page_index: Optional[int] = 0,
    bbox_list: Optional[List[List[float]]] = None,
    engine: str = "auto",
) -> bytes:
    """Convenience service function for zero-white-patch text eradication."""
    return get_vector_pipeline().remove_text_lossless(
        pdf_bytes=pdf_bytes,
        page_index=page_index,
        bbox_list=bbox_list,
        engine=engine,
    )


def insert_translated_text(
    sanitized_pdf_bytes: bytes,
    page_index: int,
    translations: List[Dict[str, Any]],
    target_lang: str = "en",
) -> bytes:
    """Convenience service function for non-destructive coordinate re-insertion."""
    return get_vector_pipeline().insert_translated_text(
        sanitized_pdf_bytes=sanitized_pdf_bytes,
        page_index=page_index,
        translations=translations,
        target_lang=target_lang,
    )


def shape_bidi_text(text: str, target_lang: str = "ar") -> str:
    """Convenience service function for BiDi Arabic reshaping."""
    return get_vector_pipeline().shape_bidi_text(text, target_lang=target_lang)


def verify_vector_preservation(
    original_bytes: bytes,
    processed_bytes: bytes,
    page_index: int = 0
) -> bool:
    """Convenience service function for validating 100% vector preservation."""
    return NativeVectorPipeline.verify_vector_preservation(
        original_bytes=original_bytes,
        processed_bytes=processed_bytes,
        page_index=page_index,
    )
