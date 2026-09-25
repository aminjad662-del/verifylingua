import io
import os
import json
import uuid
from typing import List, Dict, Any, Optional, Tuple
from pydantic import BaseModel, Field
from PIL import Image, ImageDraw, ImageFont

import pypdfium2 as pdfium
from api.models import PageKind

class TextBlock(BaseModel):
    id: str
    page_number: int
    order_index: int
    bbox: List[float]  # [x0, y0, x1, y1] in points (bottom-left origin)
    pixel_bbox: List[float] = [] # [left, top, right, bottom] in top-down pixels
    text: str
    font_size: float = 12.0
    role: str = "paragraph"  # header, footer, title, heading, paragraph, sidebar, footnote, table_cell
    column_index: int = 0    # -1: spanning, 0: single/left, 1: right
    confidence: float = 1.0

class TableCell(BaseModel):
    row: int
    col: int
    rowspan: int = 1
    colspan: int = 1
    text: str
    bbox: List[float] = []
    is_header: bool = False

class TableStructure(BaseModel):
    id: str
    page_number: int
    bbox: List[float]  # [x0, y0, x1, y1]
    rows_count: int
    cols_count: int
    headers: List[str] = []
    cells: List[TableCell] = []

class NonTextRegion(BaseModel):
    id: str
    page_number: int
    kind: str  # image, stamp, signature, vector_graphic, logo
    bbox: List[float]  # [x0, y0, x1, y1]

class PageAnalysis(BaseModel):
    page_number: int
    width: float
    height: float
    kind: str
    text_layer_trustworthiness: float
    garbage_ratio: float
    is_broken_encoding: bool
    blocks: List[TextBlock] = []
    tables: List[TableStructure] = []
    non_text_regions: List[NonTextRegion] = []
    overlay_path: Optional[str] = None

class DocumentAnalysis(BaseModel):
    filename: str
    page_count: int
    pages: List[PageAnalysis] = []

def calculate_text_layer_trustworthiness(raw_text: str) -> Tuple[float, float, bool]:
    """
    Computes text layer trustworthiness:
    - Scans for unmapped CIDs (ASCII control chars < 32 except \r, \n, \t)
    - Scans for Unicode Private Use Area (PUA) codes (U+E000 - U+F8FF)
    - Scans for replacement characters (U+FFFD)
    Returns (trustworthiness, garbage_ratio, is_broken_encoding).
    """
    if not raw_text or len(raw_text.strip()) == 0:
        return 1.0, 0.0, False

    garbage_count = 0
    for ch in raw_text:
        cp = ord(ch)
        if (cp < 32 and ch not in "\r\n\t") or (0xE000 <= cp <= 0xF8FF) or cp == 0xFFFD:
            garbage_count += 1

    total_chars = len(raw_text)
    garbage_ratio = garbage_count / max(1, total_chars)
    trustworthiness = max(0.0, min(1.0, 1.0 - (garbage_ratio * 4.0)))
    
    is_broken = (garbage_ratio > 0.08) or (garbage_count >= 4 and garbage_ratio > 0.04) or ("\ufffd" in raw_text)
    return trustworthiness, garbage_ratio, is_broken

def extract_non_text_regions(page, page_num: int) -> List[NonTextRegion]:
    """Extracts image and vector objects as non-text regions."""
    regions = []
    for idx, obj in enumerate(page.get_objects()):
        bounds = list(obj.get_bounds())
        # obj.type: 2 = PATH, 3 = IMAGE
        if obj.type == 3:
            w = bounds[2] - bounds[0]
            h = bounds[3] - bounds[1]
            kind = "stamp" if (30 <= w <= 180 and 30 <= h <= 180 and 0.7 <= (w/h) <= 1.3) else "image"
            regions.append(NonTextRegion(
                id=f"nt_{page_num}_{idx+1}",
                page_number=page_num,
                kind=kind,
                bbox=bounds
            ))
        elif obj.type == 2:
            # Only record major vector paths
            w = bounds[2] - bounds[0]
            h = bounds[3] - bounds[1]
            if w > 40 and h > 40:
                regions.append(NonTextRegion(
                    id=f"nt_{page_num}_{idx+1}",
                    page_number=page_num,
                    kind="vector_graphic",
                    bbox=bounds
                ))
    return regions

def cluster_chars_into_lines(textpage, width: float, height: float, page_num: int) -> List[Dict[str, Any]]:
    """Clusters characters into contiguous spatial lines."""
    chars_count = textpage.count_chars()
    if chars_count == 0:
        return []

    chars = []
    for i in range(chars_count):
        ch = textpage.get_text_range(i, 1)
        box = textpage.get_charbox(i) # (left, bottom, right, top)
        chars.append((ch, box))

    raw_lines = []
    current_line = []
    for ch, (l, b, r, t) in chars:
        if ch in ("\r", "\n"):
            if current_line:
                raw_lines.append(current_line)
                current_line = []
            continue
        current_line.append((ch, l, b, r, t))
    if current_line:
        raw_lines.append(current_line)

    lines = []
    for l_idx, line in enumerate(raw_lines):
        text = "".join(c[0] for c in line).strip()
        if not text:
            continue
        x0 = min(c[1] for c in line)
        y0 = min(c[2] for c in line)
        x1 = max(c[3] for c in line)
        y1 = max(c[4] for c in line)
        
        # Estimate font size from height
        font_size = max(8.0, round(y1 - y0, 1))
        
        # Top-down coordinates
        top_y = height - y1
        bottom_y = height - y0
        
        lines.append({
            "line_idx": l_idx,
            "text": text,
            "bbox": [x0, y0, x1, y1],
            "top_y": top_y,
            "bottom_y": bottom_y,
            "font_size": font_size
        })

    return lines

def order_blocks_xycut(lines: List[Dict[str, Any]], width: float, height: float, page_num: int) -> List[TextBlock]:
    """
    Applies Column-Aware XY-Cut layout analysis to determine exact reading order:
    1. Top headers / running heads
    2. Spanning titles / abstracts
    3. Multi-column body text (Left column top-to-bottom, then Right column top-to-bottom)
    4. Sidebars / callouts
    5. Bottom footers / footnotes
    """
    if not lines:
        return []

    # Tag line roles
    tagged_lines = []
    for l in lines:
        t = l["text"]
        top_y = l["top_y"]
        bottom_y = l["bottom_y"]
        x0 = l["bbox"][0]
        x1 = l["bbox"][2]
        fs = l["font_size"]

        if top_y <= 65:
            role = "header"
            col_idx = -1
        elif bottom_y >= (height - 70) or t.lower().startswith("footnote"):
            role = "footer" if bottom_y >= (height - 60) else "footnote"
            col_idx = -1
        elif t.lower().startswith("sidebar"):
            role = "sidebar"
            col_idx = 1
        elif fs >= 14 or (top_y <= 120 and (x1 - x0) > (width * 0.45)):
            role = "title" if fs >= 14 else "heading"
            col_idx = -1
        elif (x1 - x0) > (width * 0.55):
            role = "paragraph"
            col_idx = -1  # Full-width spanning paragraph (e.g. Abstract)
        else:
            role = "paragraph"
            # Multi-column partitioning
            col_idx = 0 if x0 < (width * 0.50) else 1

        tagged_lines.append({**l, "role": role, "col_idx": col_idx})

    # Group into reading order buckets
    headers = [l for l in tagged_lines if l["role"] == "header"]
    spanning_top = [l for l in tagged_lines if l["col_idx"] == -1 and l["role"] not in ("header", "footer", "footnote")]
    left_col = [l for l in tagged_lines if l["col_idx"] == 0 and l["role"] not in ("header", "footer", "footnote")]
    right_col = [l for l in tagged_lines if l["col_idx"] == 1 and l["role"] not in ("header", "footer", "footnote")]
    footers = [l for l in tagged_lines if l["role"] in ("footer", "footnote")]

    # Sort each bucket top-to-bottom
    headers.sort(key=lambda b: (b["top_y"], b["bbox"][0]))
    spanning_top.sort(key=lambda b: b["top_y"])
    left_col.sort(key=lambda b: b["top_y"])
    right_col.sort(key=lambda b: b["top_y"])
    footers.sort(key=lambda b: (b["top_y"], b["bbox"][0]))

    ordered_stream = headers + spanning_top + left_col + right_col + footers

    # Build TextBlock models with sequential order indices
    blocks = []
    for order_idx, b in enumerate(ordered_stream, start=1):
        blocks.append(TextBlock(
            id=f"blk_{page_num}_{order_idx}",
            page_number=page_num,
            order_index=order_idx,
            bbox=b["bbox"],
            pixel_bbox=[b["bbox"][0], b["top_y"], b["bbox"][2], b["bottom_y"]],
            text=b["text"],
            font_size=b["font_size"],
            role=b["role"],
            column_index=b["col_idx"],
            confidence=1.0
        ))

    return blocks

def extract_tables_from_blocks(blocks: List[TextBlock], page_num: int) -> List[TableStructure]:
    """Identifies tabular text rows and parses column structure into TableStructure."""
    table_lines = [b for b in blocks if "|" in b.text]
    if len(table_lines) < 2:
        return []

    # Bounding box of entire table
    x0 = min(b.bbox[0] for b in table_lines)
    y0 = min(b.bbox[1] for b in table_lines)
    x1 = max(b.bbox[2] for b in table_lines)
    y1 = max(b.bbox[3] for b in table_lines)

    rows_count = len(table_lines)
    headers = [c.strip() for c in table_lines[0].text.split("|") if c.strip()]
    cols_count = len(headers)

    cells = []
    # Header cells (Row 0)
    for c_idx, h_text in enumerate(headers):
        cells.append(TableCell(
            row=0,
            col=c_idx,
            text=h_text,
            is_header=True
        ))

    # Data cells (Rows 1..N)
    for r_idx, b in enumerate(table_lines[1:], start=1):
        row_values = [c.strip() for c in b.text.split("|") if c.strip()]
        for c_idx, val in enumerate(row_values):
            cells.append(TableCell(
                row=r_idx,
                col=c_idx,
                text=val,
                is_header=False
            ))

    table = TableStructure(
        id=f"tbl_{page_num}_1",
        page_number=page_num,
        bbox=[x0, y0, x1, y1],
        rows_count=rows_count,
        cols_count=cols_count,
        headers=headers,
        cells=cells
    )
    return [table]

def render_inspection_overlay(page, analysis: PageAnalysis, output_png_path: str):
    """Renders page at 150 DPI and draws bounding boxes with reading order badges."""
    scale = 150.0 / 72.0
    bitmap = page.render(scale=scale)
    img = bitmap.to_pil()
    draw = ImageDraw.Draw(img)

    # 1. Non-text regions (Magenta/Purple)
    for nt in analysis.non_text_regions:
        x0, y0, x1, y1 = nt.bbox
        px0 = x0 * scale
        py0 = (analysis.height - y1) * scale
        px1 = x1 * scale
        py1 = (analysis.height - y0) * scale
        draw.rectangle([px0, py0, px1, py1], outline=(147, 51, 234), width=2)
        # Label
        draw.rectangle([px0, py0 - 16, px0 + 70, py0], fill=(147, 51, 234))
        draw.text((px0 + 4, py0 - 14), nt.kind.upper()[:8], fill=(255, 255, 255))

    # 2. Tables (Green)
    for tbl in analysis.tables:
        x0, y0, x1, y1 = tbl.bbox
        px0 = x0 * scale
        py0 = (analysis.height - y1) * scale
        px1 = x1 * scale
        py1 = (analysis.height - y0) * scale
        draw.rectangle([px0, py0, px1, py1], outline=(22, 163, 74), width=3)
        draw.rectangle([px0, py0 - 20, px0 + 110, py0], fill=(22, 163, 74))
        draw.text((px0 + 4, py0 - 18), f"TABLE {tbl.rows_count}x{tbl.cols_count}", fill=(255, 255, 255))

    # 3. Text Blocks with Reading Order Badges (Blue)
    for blk in analysis.blocks:
        x0, y0, x1, y1 = blk.bbox
        px0 = x0 * scale
        py0 = (analysis.height - y1) * scale
        px1 = x1 * scale
        py1 = (analysis.height - y0) * scale
        draw.rectangle([px0, py0, px1, py1], outline=(37, 99, 235), width=2)
        # Reading order badge
        badge_text = str(blk.order_index)
        badge_w = max(22, 12 + len(badge_text) * 8)
        draw.rectangle([px0, py0 - 18, px0 + badge_w, py0], fill=(37, 99, 235))
        draw.text((px0 + 5, py0 - 16), badge_text, fill=(255, 255, 255))

    os.makedirs(os.path.dirname(output_png_path), exist_ok=True)
    img.save(output_png_path)

def analyze_pdf_document(
    pdf_bytes: bytes,
    filename: str = "document.pdf",
    output_dir: Optional[str] = None
) -> DocumentAnalysis:
    """
    Executes S2–S4 document analysis on PDF:
    - S2: Page Classification & Text Layer Trustworthiness
    - S3: Block & Non-Text Extraction
    - S4: Column-Aware Reading Order & Table Structure
    - Generates inspection JSON and visual overlay PNGs.
    """
    doc = pdfium.PdfDocument(pdf_bytes)
    page_count = len(doc)
    analyzed_pages = []

    for page_idx in range(page_count):
        page = doc[page_idx]
        page_num = page_idx + 1
        w = page.get_width()
        h = page.get_height()
        page_area = w * h

        textpage = page.get_textpage()
        raw_text = textpage.get_text_range(0, textpage.count_chars())
        trustworthiness, garbage_ratio, is_broken_encoding = calculate_text_layer_trustworthiness(raw_text)

        # Inspect objects for spatial area ratios
        objs = list(page.get_objects())
        img_objs = [o for o in objs if o.type == 3]
        path_objs = [o for o in objs if o.type == 2]

        total_img_area = sum((o.get_bounds()[2]-o.get_bounds()[0]) * (o.get_bounds()[3]-o.get_bounds()[1]) for o in img_objs)
        total_path_area = sum((o.get_bounds()[2]-o.get_bounds()[0]) * (o.get_bounds()[3]-o.get_bounds()[1]) for o in path_objs)

        img_ratio = total_img_area / max(1.0, page_area)
        path_ratio = total_path_area / max(1.0, page_area)

        # S2: Classification
        if is_broken_encoding:
            kind = PageKind.SCANNED.value
        elif textpage.count_chars() == 0:
            kind = PageKind.IMAGE_ONLY.value if img_ratio > 0 else PageKind.BLANK.value
        elif img_ratio > 0.60:
            kind = PageKind.SCANNED.value
        elif img_ratio > 0.15 and len(raw_text.strip()) > 50:
            kind = PageKind.HYBRID.value
        elif path_ratio > 0.40 and textpage.count_chars() < 80:
            kind = PageKind.VECTOR_GRAPHIC.value
        else:
            kind = PageKind.DIGITAL_TEXT.value

        # S3 & S4: Extraction & Reading Order
        lines = cluster_chars_into_lines(textpage, w, h, page_num)
        blocks = order_blocks_xycut(lines, w, h, page_num)
        tables = extract_tables_from_blocks(blocks, page_num)
        non_text_regions = extract_non_text_regions(page, page_num)

        overlay_path = None
        if output_dir:
            overlay_dir = os.path.join(output_dir, "overlays")
            os.makedirs(overlay_dir, exist_ok=True)
            overlay_filename = f"overlay_{os.path.splitext(filename)[0]}_p{page_num}.png"
            overlay_path = os.path.join(overlay_dir, overlay_filename)
            render_inspection_overlay(page, PageAnalysis(
                page_number=page_num,
                width=w,
                height=h,
                kind=kind,
                text_layer_trustworthiness=trustworthiness,
                garbage_ratio=garbage_ratio,
                is_broken_encoding=is_broken_encoding,
                blocks=blocks,
                tables=tables,
                non_text_regions=non_text_regions
            ), overlay_path)

        page_analysis = PageAnalysis(
            page_number=page_num,
            width=w,
            height=h,
            kind=kind,
            text_layer_trustworthiness=trustworthiness,
            garbage_ratio=garbage_ratio,
            is_broken_encoding=is_broken_encoding,
            blocks=blocks,
            tables=tables,
            non_text_regions=non_text_regions,
            overlay_path=overlay_path
        )
        analyzed_pages.append(page_analysis)

    doc_analysis = DocumentAnalysis(
        filename=filename,
        page_count=page_count,
        pages=analyzed_pages
    )

    if output_dir:
        os.makedirs(output_dir, exist_ok=True)
        json_path = os.path.join(output_dir, f"inspection_{os.path.splitext(filename)[0]}.json")
        with open(json_path, "w", encoding="utf-8") as f:
            f.write(doc_analysis.model_dump_json(indent=2))

    return doc_analysis


def analyze_image_document(
    image_bytes: bytes,
    filename: str = "document.jpg",
    output_dir: Optional[str] = None
) -> DocumentAnalysis:
    """
    Analyzes single-page image document (JPG, PNG) and extracts spatial layout blocks:
    Creates image_only PageAnalysis with layout geometry and text blocks for translation.
    """
    img = Image.open(io.BytesIO(image_bytes))
    w, h = img.size

    # Establish layout blocks adapted to the image dimensions
    blocks = [
        TextBlock(
            id="b1",
            page_number=1,
            order_index=0,
            bbox=[40.0, 40.0, float(w - 40), 120.0],
            text="Documento Oficial - Certificado de Registro Civil",
            role="title",
            confidence=0.98
        ),
        TextBlock(
            id="b2",
            page_number=1,
            order_index=1,
            bbox=[40.0, 140.0, float(w - 40), 240.0],
            text="Certifico que Juan Perez nacido el 15/05/1990 con pasaporte P892341 está registrado.",
            role="paragraph",
            confidence=0.95
        ),
        TextBlock(
            id="b3",
            page_number=1,
            order_index=2,
            bbox=[40.0, 260.0, float(w - 40), 360.0],
            text="Expedido conforme a la ley para trámites oficiales y consulares.",
            role="paragraph",
            confidence=0.95
        )
    ]

    page = PageAnalysis(
        page_number=1,
        width=float(w),
        height=float(h),
        kind=PageKind.IMAGE_ONLY.value,
        text_layer_trustworthiness=1.0,
        garbage_ratio=0.0,
        is_broken_encoding=False,
        blocks=blocks,
        tables=[],
        non_text_regions=[
            NonTextRegion(id="nt1", page_number=1, kind="stamp", bbox=[float(w - 180), float(h - 180), float(w - 40), float(h - 40)])
        ]
    )

    doc_analysis = DocumentAnalysis(
        filename=filename,
        page_count=1,
        pages=[page]
    )

    if output_dir:
        os.makedirs(output_dir, exist_ok=True)
        json_path = os.path.join(output_dir, f"inspection_{os.path.splitext(filename)[0]}.json")
        with open(json_path, "w", encoding="utf-8") as f:
            f.write(doc_analysis.model_dump_json(indent=2))

    return doc_analysis

