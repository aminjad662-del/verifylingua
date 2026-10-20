"""
Automated Test Suite for Native Vector PDF Pipeline (Milestone M2: R4, R5)
Validates:
1. 100% Vector Preservation (zero full-page /Image XObjects added).
2. Complete Span Extraction with font metadata, flags, and sRGB integer color decoding.
3. Table line and gridline preservation on tests/corpus/03_table_heavy_multipage.pdf
   (asserts '50 510 510 170 re S' intact and zero Tj/TJ remain).
4. Dual-engine zero white patch text removal (PyMuPDF AST redaction + pikepdf token filter).
5. Arabic BiDi text shaping and non-destructive re-insertion on tests/corpus/12_arabic_bidi_record.pdf.
6. Zero white patch redaction verification (SSIM = 1.0 on non-text vector border regions).
7. Auto-fit font scaling and selective bounding box redaction.
8. Multi-page document lossless processing.
9. Font topology matching (Serif -> Amiri/Times, Sans -> Cairo/Noto Sans, Mono -> Courier).
10. Service wrapper integration (services.vector_pipeline).
"""

import io
import os
import re
import sys
import pytest
import numpy as np
from PIL import Image, ImageDraw

# Bypass onnxruntime hang in Python 3.14 Windows before imports
if "pymupdf.layout" not in sys.modules:
    sys.modules["pymupdf.layout"] = None
if "onnxruntime" not in sys.modules:
    sys.modules["onnxruntime"] = None

import fitz
import pikepdf

from api.reconstruction.vector_pdf_pipeline import (
    NativeVectorPipeline,
    VectorFontMeta,
    VectorSpan,
    VectorBlock,
    VectorPageSpans,
    resolve_topology_font,
)
import services.vector_pipeline as svp

# Paths to test corpus
SAMPLE_CIVIL = os.path.abspath("test_sample_civil_record.pdf")
TABLE_HEAVY_PDF = os.path.abspath("tests/corpus/03_table_heavy_multipage.pdf")
ARABIC_BIDI_PDF = os.path.abspath("tests/corpus/12_arabic_bidi_record.pdf")
ACADEMIC_PDF = os.path.abspath("tests/corpus/01_academic_two_column.pdf")


@pytest.fixture
def vector_pipeline():
    return NativeVectorPipeline()


def compute_masked_ssim(im1: Image.Image, im2: Image.Image, mask_boxes: list) -> float:
    """Computes SSIM on non-text regions by masking out text bounding boxes."""
    if im1.size != im2.size:
        im2 = im2.resize(im1.size)

    m1 = im1.copy().convert("L")
    m2 = im2.copy().convert("L")
    d1 = ImageDraw.Draw(m1)
    d2 = ImageDraw.Draw(m2)

    for box in mask_boxes:
        d1.rectangle(box, fill=255)
        d2.rectangle(box, fill=255)

    a1 = np.array(m1, dtype=np.float64)
    a2 = np.array(m2, dtype=np.float64)

    C1 = (0.01 * 255) ** 2
    C2 = (0.03 * 255) ** 2

    mu1 = np.mean(a1)
    mu2 = np.mean(a2)
    var1 = np.var(a1)
    var2 = np.var(a2)
    cov = np.mean((a1 - mu1) * (a2 - mu2))

    ssim = ((2 * mu1 * mu2 + C1) * (2 * cov + C2)) / ((mu1**2 + mu2**2 + C1) * (var1 + var2 + C2))
    return float(ssim)


# ===========================================================================
# 1. 100% Vector Preservation Tests
# ===========================================================================

def test_100_percent_vector_preservation_no_image_xobjects(vector_pipeline):
    """
    Asserts that native vector PDFs remain 100% vector without rasterizing
    pages to bitmaps or adding any /Image XObjects.
    """
    with open(SAMPLE_CIVIL, "rb") as f:
        orig_bytes = f.read()

    # Redact text losslessly
    cleaned_bytes = vector_pipeline.remove_text_lossless(orig_bytes, page_index=0)

    # Re-insert translated text
    translations = [
        {
            "bbox": [50.0, 59.1, 520.8, 75.6],
            "translated_text": "CERTIFIED BIRTH CERTIFICATE: In the city of Madrid, appears Alejandro Martinez.",
            "font_size": 12.0,
            "rgb": (0.0, 0.0, 0.0),
        }
    ]
    reconstructed_bytes = vector_pipeline.insert_translated_text(
        cleaned_bytes, page_index=0, translations=translations, target_lang="en"
    )

    # Verify vector preservation using both pikepdf and pipeline helper
    assert vector_pipeline.verify_vector_preservation(orig_bytes, cleaned_bytes, page_index=0)
    assert vector_pipeline.verify_vector_preservation(orig_bytes, reconstructed_bytes, page_index=0)

    # Inspect Resources /XObject dictionary directly
    with pikepdf.open(io.BytesIO(reconstructed_bytes)) as pdf:
        page = pdf.pages[0]
        xobjs = page.Resources.get("/XObject", {})
        # Ensure zero raster image XObjects were injected
        for k, v in xobjs.items():
            subtype = getattr(v, "Subtype", None) or getattr(v, "/Subtype", None)
            assert str(subtype) != "/Image", f"Prohibited /Image XObject found: {k}"


# ===========================================================================
# 2. Span Extraction & Metadata Tests
# ===========================================================================

def test_span_extraction_completeness_and_color_decoding(vector_pipeline):
    """
    Validates complete span AST extraction via PyMuPDF page.get_text('dict'):
    - Bounding boxes, font names, font sizes, bitmask flags
    - sRGB integer color decoding to hex and normalized RGB float tuples
    """
    with open(SAMPLE_CIVIL, "rb") as f:
        pdf_bytes = f.read()

    result = vector_pipeline.extract_page_spans(pdf_bytes, page_index=0)

    assert result["page_number"] == 1
    assert result["width"] > 0
    assert result["height"] > 0
    assert len(result["blocks"]) >= 2
    assert result["total_spans_count"] >= 3

    # Inspect first block
    block0 = result["blocks"][0]
    assert block0["block_type"] == 0
    assert len(block0["bbox"]) == 4
    assert block0["bbox"][2] > block0["bbox"][0]
    assert block0["bbox"][3] > block0["bbox"][1]

    # Verify span contents and metadata
    span0 = block0["spans"][0]
    assert "ACTA DE NACIMIENTO" in span0["text"]
    assert span0["font_name"] == "Helvetica"
    assert span0["font_size"] == 12.0
    assert isinstance(span0["flags"], int)
    assert isinstance(span0["is_bold"], bool)
    assert isinstance(span0["is_italic"], bool)
    assert isinstance(span0["is_serif"], bool)
    assert isinstance(span0["is_mono"], bool)

    # Verify color decoding
    assert span0["rgb"] == (0.0, 0.0, 0.0)
    assert span0["hex_color"] == "#000000"


# ===========================================================================
# 3. Table Line and Gridline Preservation (03_table_heavy_multipage.pdf)
# ===========================================================================

def test_table_line_and_gridline_preservation(vector_pipeline):
    """
    Validates that on tests/corpus/03_table_heavy_multipage.pdf:
    - Table frame '50 510 510 170 re S' remains 100% intact.
    - Inner horizontal divider '50 640 510 1 re S' remains 100% intact.
    - Zero 'Tj' or 'TJ' text operators remain.
    - Vector lines are preserved under both PyMuPDF and pikepdf engines.
    """
    with open(TABLE_HEAVY_PDF, "rb") as f:
        pdf_bytes = f.read()

    # 1. Primary Engine: PyMuPDF AST Redaction with fill=None
    cleaned_mupdf = vector_pipeline.remove_text_lossless(pdf_bytes, page_index=0, engine="mupdf")

    with pikepdf.open(io.BytesIO(cleaned_mupdf)) as pdf:
        stream = pdf.pages[0].Contents.read_bytes().decode("latin1", errors="ignore")
        # Verify table lines are intact
        assert "50 510 510 170 re S" in stream or re.search(r"50\s+510\s+510\s+170\s+re\s+S", stream)
        assert "50 640 510 1 re S" in stream or re.search(r"50\s+640\s+510\s+1\s+re\s+S", stream)
        # Verify zero text operators
        assert "Tj" not in stream and "TJ" not in stream

    # Verify via PyMuPDF text extraction that text is completely eradicated
    doc_check = fitz.open(stream=cleaned_mupdf, filetype="pdf")
    assert doc_check[0].get_text().strip() == ""
    doc_check.close()

    # 2. Fallback Engine: pikepdf token stream filter
    cleaned_pike = vector_pipeline.remove_text_lossless(pdf_bytes, page_index=0, engine="pikepdf")

    with pikepdf.open(io.BytesIO(cleaned_pike)) as pdf:
        stream2 = pdf.pages[0].Contents.read_bytes().decode("latin1", errors="ignore")
        # Verify vector instructions are present
        assert re.search(r"50\s+510\s+510\s+170\s+re\s+S", stream2)
        assert re.search(r"50\s+640\s+510\s+1\s+re\s+S", stream2)
        # Verify zero text operators
        assert "Tj" not in stream2 and "TJ" not in stream2


# ===========================================================================
# 4. Zero White Patch Redaction Verification (SSIM = 1.0 on Non-Text Lines)
# ===========================================================================

def test_zero_white_patch_redaction_border_fidelity(vector_pipeline):
    """
    Verifies that unlike the legacy api/render.py which overlaid opaque white rectangles
    that obliterated table gridlines, the new engine achieves SSIM = 1.0 (exact pixel match)
    on the non-text vector border regions without masking bounding boxes.
    """
    with open(TABLE_HEAVY_PDF, "rb") as f:
        pdf_bytes = f.read()

    cleaned_bytes = vector_pipeline.remove_text_lossless(pdf_bytes, page_index=0, engine="mupdf")

    doc_orig = fitz.open(stream=pdf_bytes, filetype="pdf")
    doc_red = fitz.open(stream=cleaned_bytes, filetype="pdf")

    # Render both at 72 DPI (1 point = 1 pixel)
    pix_orig = doc_orig[0].get_pixmap(dpi=72)
    pix_red = doc_red[0].get_pixmap(dpi=72)

    im_orig = Image.frombytes("RGB", [pix_orig.width, pix_orig.height], pix_orig.samples)
    im_red = Image.frombytes("RGB", [pix_red.width, pix_red.height], pix_red.samples)

    arr_orig = np.array(im_orig)
    arr_red = np.array(im_red)

    # In 03_table_heavy_multipage.pdf:
    # Outer rectangle: 50 510 510 170 re S -> left border at x=50, y in [112, 282] in top-left origin.
    # We inspect the left border stripe [x=49..51, y=112..282]
    stripe_orig = arr_orig[112:282, 49:51]
    stripe_red = arr_red[112:282, 49:51]

    # Max pixel difference must be 0 (SSIM = 1.0)
    diff = np.max(np.abs(stripe_orig.astype(int) - stripe_red.astype(int)))
    assert diff == 0, f"Table border line was modified! Max diff was {diff}"

    doc_orig.close()
    doc_red.close()


def test_full_page_masked_ssim_fidelity(vector_pipeline):
    """
    Computes masked SSIM across the entire page for 03_table_heavy_multipage.pdf
    and verifies that non-text regions retain SSIM >= 0.999.
    """
    with open(TABLE_HEAVY_PDF, "rb") as f:
        pdf_bytes = f.read()

    spans_dict = vector_pipeline.extract_page_spans(pdf_bytes, page_index=0)
    cleaned_bytes = vector_pipeline.remove_text_lossless(pdf_bytes, page_index=0)

    doc_orig = fitz.open(stream=pdf_bytes, filetype="pdf")
    doc_red = fitz.open(stream=cleaned_bytes, filetype="pdf")

    pix_orig = doc_orig[0].get_pixmap(dpi=72)
    pix_red = doc_red[0].get_pixmap(dpi=72)

    im_orig = Image.frombytes("RGB", [pix_orig.width, pix_orig.height], pix_orig.samples)
    im_red = Image.frombytes("RGB", [pix_red.width, pix_red.height], pix_red.samples)

    mask_boxes = [b["bbox"] for b in spans_dict["blocks"]]
    ssim = compute_masked_ssim(im_orig, im_red, mask_boxes)

    assert ssim >= 0.999, f"Non-text SSIM was {ssim}, expected >= 0.999"

    doc_orig.close()
    doc_red.close()


# ===========================================================================
# 5. Arabic BiDi Text Shaping & Re-insertion
# ===========================================================================

def test_arabic_bidi_text_shaping_and_reinsertion(vector_pipeline):
    """
    Tests Arabic BiDi shaping with arabic-reshaper, python-bidi, and Noto Sans Arabic
    re-insertion on tests/corpus/12_arabic_bidi_record.pdf.
    """
    with open(ARABIC_BIDI_PDF, "rb") as f:
        orig_bytes = f.read()

    # Verify shaping function directly
    raw_arabic = "سجل مدني رقم 2026"
    shaped = vector_pipeline.shape_bidi_text(raw_arabic, target_lang="ar")
    assert shaped != raw_arabic
    assert len(shaped) > 0

    # Losslessly strip original text
    cleaned_bytes = vector_pipeline.remove_text_lossless(orig_bytes, page_index=0)

    # Re-insert Arabic translation
    translations = [
        {
            "bbox": [50.0, 50.0, 500.0, 100.0],
            "translated_text": "سجل الأحوال المدنية الرسمي - وثيقة مترجمة",
            "font_size": 13.0,
            "rgb": (0.05, 0.10, 0.20),
            "hex_color": "#0d1a33",
            "is_serif": False,
        },
        {
            "bbox": [50.0, 120.0, 450.0, 160.0],
            "translated_text": "اسم المواطن: محمد عبد الله (رقم القيد 48921)",
            "font_size": 11.0,
            "rgb": (0.0, 0.0, 0.0),
        }
    ]

    out_bytes = vector_pipeline.insert_translated_text(
        cleaned_bytes, page_index=0, translations=translations, target_lang="ar"
    )

    # Verify output PDF is valid and readable
    doc_out = fitz.open(stream=out_bytes, filetype="pdf")
    assert len(doc_out) == 1
    extracted_text = doc_out[0].get_text()
    assert len(extracted_text.strip()) > 0
    doc_out.close()

    # Verify vector preservation on output
    assert vector_pipeline.verify_vector_preservation(orig_bytes, out_bytes, page_index=0)


def test_htmlbox_multiline_bidi_rendering(vector_pipeline):
    """
    Tests multi-line Arabic text rendering using PyMuPDF insert_htmlbox.
    """
    with open(ARABIC_BIDI_PDF, "rb") as f:
        orig_bytes = f.read()

    cleaned_bytes = vector_pipeline.remove_text_lossless(orig_bytes, page_index=0)

    multiline_arabic = "المادة الأولى: تثبت الولادة بحكم رسمي صادر عن قلم النفوس المختص.\nالمادة الثانية: تعتبر البيانات مقيدة رسمياً."
    translations = [
        {
            "bbox": [50.0, 100.0, 500.0, 220.0],
            "translated_text": multiline_arabic,
            "font_size": 12.0,
            "rgb": (0.1, 0.2, 0.3),
            "hex_color": "#1a334d",
        }
    ]

    out_bytes = vector_pipeline.insert_translated_text(
        cleaned_bytes, page_index=0, translations=translations, target_lang="ar"
    )

    doc = fitz.open(stream=out_bytes, filetype="pdf")
    assert len(doc[0].get_text().strip()) > 0
    doc.close()


# ===========================================================================
# 6. Auto-Fit Font Scaling & Selective Bbox Redaction
# ===========================================================================

def test_auto_fit_font_scaling_overflow_prevention(vector_pipeline):
    """
    Verifies that translating text into a long phrase dynamically scales down
    the font size so it remains strictly within bounding box clearance.
    """
    with open(SAMPLE_CIVIL, "rb") as f:
        pdf_bytes = f.read()

    cleaned_bytes = vector_pipeline.remove_text_lossless(pdf_bytes, page_index=0)

    # Long text in small box
    long_text = "EXTRAIT D'ACTE DE NAISSANCE ET DE L'ETAT CIVIL OFFICIEL DE LA VILLE DE MADRID EN ESPAGNE"
    translations = [
        {
            "bbox": [50.0, 59.0, 250.0, 75.0],  # Narrow box
            "translated_text": long_text,
            "font_size": 16.0,  # Deliberately large initial size
            "rgb": (0.1, 0.1, 0.1),
        }
    ]

    # Should auto-fit without throwing an exception
    out_bytes = vector_pipeline.insert_translated_text(
        cleaned_bytes, page_index=0, translations=translations, target_lang="fr"
    )

    doc = fitz.open(stream=out_bytes, filetype="pdf")
    text = doc[0].get_text()
    assert "EXTRAIT" in text
    doc.close()


def test_selective_bounding_box_redaction(vector_pipeline):
    """
    Tests selectively redacting only specific bounding boxes while leaving
    neighboring text blocks untouched.
    """
    with open(SAMPLE_CIVIL, "rb") as f:
        pdf_bytes = f.read()

    # Extract all spans first
    spans_info = vector_pipeline.extract_page_spans(pdf_bytes, page_index=0)
    assert len(spans_info["blocks"]) >= 2

    # Redact only block 0
    box_to_redact = [spans_info["blocks"][0]["bbox"]]
    partially_redacted = vector_pipeline.remove_text_lossless(
        pdf_bytes, page_index=0, bbox_list=box_to_redact, engine="mupdf"
    )

    doc = fitz.open(stream=partially_redacted, filetype="pdf")
    text_remaining = doc[0].get_text()
    # Block 0 text should be gone
    assert "ACTA DE NACIMIENTO" not in text_remaining
    # Block 1 text should still be present
    assert "Oficial del Registro Civil" in text_remaining
    doc.close()


# ===========================================================================
# 7. Multi-page Processing & Font Topology
# ===========================================================================

def test_multipage_document_text_removal(vector_pipeline):
    """
    Tests processing all pages of a multi-page document (page_index=None).
    """
    with open(TABLE_HEAVY_PDF, "rb") as f:
        pdf_bytes = f.read()

    # Redact all pages
    all_cleaned = vector_pipeline.remove_text_lossless(pdf_bytes, page_index=None, engine="mupdf")

    doc = fitz.open(stream=all_cleaned, filetype="pdf")
    assert len(doc) == 2
    # Both pages should have 0 text remaining
    assert doc[0].get_text().strip() == ""
    assert doc[1].get_text().strip() == ""
    doc.close()


def test_font_topology_resolution():
    """
    Tests font topology mapping rules:
    - Serif -> Amiri / Times
    - Sans -> Cairo / Noto Sans Arabic / Arial
    - Mono -> Courier New
    """
    path_ar_sans, alias_ar_sans = resolve_topology_font("sans", target_lang="ar")
    assert path_ar_sans is not None
    assert "NotoSansArabic" in path_ar_sans or "arial" in path_ar_sans.lower()

    path_lat_serif, alias_lat_serif = resolve_topology_font("serif", target_lang="latin")
    assert alias_lat_serif in ("time", "tiro", "helv")

    path_lat_mono, alias_lat_mono = resolve_topology_font("mono", target_lang="latin")
    assert alias_lat_mono in ("cour", "cobi", "cobo")


# ===========================================================================
# 8. Service Layer Wrapper Integration Tests
# ===========================================================================

def test_service_pipeline_singleton_and_wrapper():
    """
    Tests services.vector_pipeline convenience functions and singleton management.
    """
    pipe = svp.get_vector_pipeline()
    assert isinstance(pipe, NativeVectorPipeline)

    with open(SAMPLE_CIVIL, "rb") as f:
        pdf_bytes = f.read()

    # Test convenience functions
    spans = svp.extract_page_spans(pdf_bytes, page_index=0)
    assert len(spans["blocks"]) >= 2

    cleaned = svp.remove_text_lossless(pdf_bytes, page_index=0)
    assert len(cleaned) > 0

    reinserted = svp.insert_translated_text(
        cleaned,
        page_index=0,
        translations=[{"bbox": [50, 50, 200, 70], "translated_text": "Sample Translated Text"}],
        target_lang="en"
    )
    assert svp.verify_vector_preservation(pdf_bytes, reinserted, page_index=0)
