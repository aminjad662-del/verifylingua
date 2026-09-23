import os
import json
import pytest
from fastapi.testclient import TestClient

from api.main import app
from api.analyze import analyze_pdf_document, calculate_text_layer_trustworthiness
from api.models import JobStatus, PageKind, PageStatus

client = TestClient(app)
CORPUS_DIR = os.path.join(os.path.dirname(__file__), "corpus")
REPORTS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "reports", "milestone-3")

def test_gate_reading_order_two_column_01():
    """Gate 3.1: Reading order is correct on #01 (Left column completely precedes Right column)."""
    path = os.path.join(CORPUS_DIR, "01_academic_two_column.pdf")
    with open(path, "rb") as f:
        doc_analysis = analyze_pdf_document(f.read(), "01_academic_two_column.pdf", REPORTS_DIR)

    assert doc_analysis.page_count == 1
    p1 = doc_analysis.pages[0]
    assert p1.kind == PageKind.DIGITAL_TEXT.value
    assert len(p1.blocks) >= 8

    # Verify sequential order indices 1..N
    indices = [b.order_index for b in p1.blocks]
    assert indices == list(range(1, len(p1.blocks) + 1))

    # Verify semantic sequence:
    # 1: Title
    assert "RESEARCH ARTICLE" in p1.blocks[0].text
    assert p1.blocks[0].role == "header"

    # 2: Abstract
    assert "Abstract:" in p1.blocks[1].text

    # 3 & 4: Left Column lines
    assert "Column 1:" in p1.blocks[2].text
    assert p1.blocks[2].column_index == 0
    assert "Column 1 Section B:" in p1.blocks[3].text
    assert p1.blocks[3].column_index == 0

    # 5 & 6: Right Column lines (MUST come AFTER left column lines)
    assert "Column 2:" in p1.blocks[4].text
    assert p1.blocks[4].column_index == 1
    assert "Column 2 Section B:" in p1.blocks[5].text
    assert p1.blocks[5].column_index == 1

    # 7: Sidebar
    assert "Sidebar:" in p1.blocks[6].text
    assert p1.blocks[6].role == "sidebar"

    # 8: Footnote at bottom
    assert "Footnote 1:" in p1.blocks[7].text
    assert p1.blocks[7].role in ("footer", "footnote")

def test_gate_table_structure_03():
    """Gate 3.2: Table structure extracted accurately on #03 (multi-page financial statement)."""
    path = os.path.join(CORPUS_DIR, "03_table_heavy_multipage.pdf")
    with open(path, "rb") as f:
        doc_analysis = analyze_pdf_document(f.read(), "03_table_heavy_multipage.pdf", REPORTS_DIR)

    assert doc_analysis.page_count == 2

    # Page 1 Balance Sheet Table (4 rows x 4 cols = 16 cells)
    p1 = doc_analysis.pages[0]
    assert len(p1.tables) == 1
    t1 = p1.tables[0]
    assert t1.rows_count == 4
    assert t1.cols_count == 4
    assert t1.headers == ["Asset Category", "Q1 2026", "Q2 2026", "Growth"]
    assert len(t1.cells) == 16
    # Header cells
    header_cells = [c for c in t1.cells if c.is_header]
    assert len(header_cells) == 4
    assert header_cells[0].text == "Asset Category"
    assert header_cells[3].text == "Growth"
    # Data cells
    data_cells = [c for c in t1.cells if not c.is_header]
    assert any("Cash and Cash Equiv" in c.text for c in data_cells)
    assert any("$1,250,000" in c.text for c in data_cells)

    # Page 2 Liabilities & Equity Table (3 rows x 4 cols = 12 cells)
    p2 = doc_analysis.pages[1]
    assert len(p2.tables) == 1
    t2 = p2.tables[0]
    assert t2.rows_count == 3
    assert t2.cols_count == 4
    assert t2.headers == ["Liability & Equity", "Q1 2026", "Q2 2026", "Variance"]
    assert len(t2.cells) == 12

def test_gate_hybrid_classification_06():
    """Gate 3.3: Per-page classification on #06 (digital, scanned, hybrid, vector graphic)."""
    path = os.path.join(CORPUS_DIR, "06_hybrid_multipage.pdf")
    with open(path, "rb") as f:
        doc_analysis = analyze_pdf_document(f.read(), "06_hybrid_multipage.pdf", REPORTS_DIR)

    assert doc_analysis.page_count == 4

    # Page 1: Pure Digital Text
    assert doc_analysis.pages[0].kind == PageKind.DIGITAL_TEXT.value
    # Page 2: Scanned Document Page (full-page raster background)
    assert doc_analysis.pages[1].kind == PageKind.SCANNED.value
    # Page 3: Hybrid Document Page (digital header + graphic chart image)
    assert doc_analysis.pages[2].kind == PageKind.HYBRID.value
    # Page 4: Vector CAD Schematic (architectural vector blueprint)
    assert doc_analysis.pages[3].kind == PageKind.VECTOR_GRAPHIC.value

def test_gate_broken_cid_detection_07():
    """Gate 3.4: Broken CID font encoding on #07 detected, routing page to visual OCR."""
    path = os.path.join(CORPUS_DIR, "07_broken_cid_encoding.pdf")
    with open(path, "rb") as f:
        doc_analysis = analyze_pdf_document(f.read(), "07_broken_cid_encoding.pdf", REPORTS_DIR)

    p1 = doc_analysis.pages[0]
    assert p1.is_broken_encoding is True
    assert p1.garbage_ratio > 0.08
    assert p1.text_layer_trustworthiness < 0.75
    # Must be classified as SCANNED so downstream stages route to visual OCR
    assert p1.kind == PageKind.SCANNED.value

def test_gate_overlay_png_and_json_artifacts():
    """Gate 3.5: Inspection JSON and visual overlay PNGs are written to reports/milestone-3/."""
    # Check overlays directory
    overlay_dir = os.path.join(REPORTS_DIR, "overlays")
    assert os.path.exists(overlay_dir)
    overlays = os.listdir(overlay_dir)
    assert any("01_academic_two_column" in f for f in overlays)
    assert any("03_table_heavy_multipage" in f for f in overlays)
    assert any("06_hybrid_multipage" in f for f in overlays)

    # Check inspection JSON files
    json_path = os.path.join(REPORTS_DIR, "inspection_01_academic_two_column.json")
    assert os.path.exists(json_path)
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    assert data["filename"] == "01_academic_two_column.pdf"
    assert len(data["pages"][0]["blocks"]) >= 8

def test_api_analyze_endpoint_flow():
    """Full API Flow: Create Job -> Upload Intake -> Analyze Layout -> Verify Stage Progression."""
    # 1. Create job
    create_res = client.post("/api/jobs", json={
        "sourceFilename": "01_academic_two_column.pdf",
        "sourceFormat": "pdf",
        "sourceLanguage": "en",
        "targetLanguage": "es"
    })
    assert create_res.status_code == 200
    job_id = create_res.json()["id"]

    # 2. Intake
    path = os.path.join(CORPUS_DIR, "01_academic_two_column.pdf")
    with open(path, "rb") as f:
        file_bytes = f.read()

    intake_res = client.post(
        f"/api/jobs/{job_id}/intake",
        files={"file": ("01_academic_two_column.pdf", file_bytes, "application/pdf")},
        data={"declared_format": "pdf"}
    )
    assert intake_res.status_code == 200

    # 3. Analyze layout
    analyze_res = client.post(f"/api/jobs/{job_id}/analyze")
    assert analyze_res.status_code == 200
    job_data = analyze_res.json()
    assert job_data["status"] == JobStatus.TRANSLATING.value
    assert job_data["progress"] == 45
    assert len(job_data["pages"]) == 1
    p1 = job_data["pages"][0]
    assert p1["kind"] == PageKind.DIGITAL_TEXT.value
    assert p1["status"] == PageStatus.ANALYZED.value
    assert p1["width"] == 612.0
    assert p1["height"] == 792.0
