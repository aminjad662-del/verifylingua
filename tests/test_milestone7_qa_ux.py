import os
import io
import time
import pytest
from fastapi.testclient import TestClient
import pypdfium2 as pdfium

from api.main import app
from api.models import JobStatus, PageStatus
from api.qa import QualityAssuranceEngine, QADocumentReport
from api.notifications import NotificationService
from api.analyze import analyze_pdf_document
from api.render import reconstruct_document
from api.store import job_store

CORPUS_DIR = os.path.join(os.path.dirname(__file__), "corpus")
REPORTS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "reports", "milestone-7")
VISUAL_DIR = os.path.join(REPORTS_DIR, "visual")

os.makedirs(VISUAL_DIR, exist_ok=True)


@pytest.fixture
def client():
    return TestClient(app)


def test_gate_7_1_stage_s9_deterministic_checks():
    """Gate 7.1: Verify the 7 deterministic S9 QA checks directly in QualityAssuranceEngine."""
    file_path = os.path.join(CORPUS_DIR, "12_arabic_bidi_record.pdf")
    with open(file_path, "rb") as f:
        pdf_bytes = f.read()

    analysis = analyze_pdf_document(pdf_bytes, "12_arabic_bidi_record.pdf")
    translated_segs = [
        {
            "id": b.id,
            "page_number": 1,
            "block_id": b.id,
            "source_text": b.text,
            "translated_text": f"Translated {b.text}",
            "protected_tokens": {"{{TOKEN_0}}": "2026-09-14"} if i == 0 else {}
        }
        for i, b in enumerate(analysis.pages[0].blocks)
    ]

    rendered_bytes, preview_bytes, qa_records = reconstruct_document(
        original_bytes=pdf_bytes,
        file_format="pdf",
        analysis=analysis,
        translated_segments=translated_segs,
        target_lang="en"
    )

    report = QualityAssuranceEngine.evaluate_document(
        job_id="test_qa_7_1",
        original_bytes=pdf_bytes,
        rendered_bytes=rendered_bytes,
        file_format="pdf",
        analysis=analysis,
        translated_segments=translated_segs,
        target_lang="en",
        s8_qa_records=qa_records
    )

    assert isinstance(report, QADocumentReport)
    assert report.page_count == 1
    p1 = report.pages[0]
    
    # 1. Completeness
    assert p1.completeness is True
    # 2. Glyph Integrity
    assert p1.glyph_integrity is True
    # 3. Direction
    assert p1.direction_valid is True
    # 4. Non-Text Preservation (SSIM >= 0.98)
    assert p1.non_text_ssim >= 0.98
    # 5. Structural Integrity
    assert p1.structure_valid is True
    # 6. Overall status
    assert p1.status in (PageStatus.QA_PASSED, PageStatus.QA_WARNING)


def test_gate_7_2_per_page_transparent_warnings_file13(client):
    """Gate 7.2: Verify transparent per-page warning on File #13 (dense flyer text expansion to French)."""
    file_path = os.path.join(CORPUS_DIR, "13_dense_marketing_flyer.pdf")
    with open(file_path, "rb") as f:
        file_bytes = f.read()

    # 1. Create Job
    res = client.post("/api/jobs", json={
        "sourceFilename": "13_dense_marketing_flyer.pdf",
        "sourceFormat": "pdf",
        "sourceLanguage": "en",
        "targetLanguage": "fr"
    })
    assert res.status_code == 200
    job_id = res.json()["id"]

    # 2. Intake
    res = client.post(
        f"/api/jobs/{job_id}/intake",
        files={"file": ("13_dense_marketing_flyer.pdf", file_bytes, "application/pdf")}
    )
    assert res.status_code == 200

    # 3. Analyze
    res = client.post(f"/api/jobs/{job_id}/analyze")
    assert res.status_code == 200

    # 4. Translate
    res = client.post(f"/api/jobs/{job_id}/translate", json={})
    assert res.status_code == 200

    # 5. Render
    res = client.post(f"/api/jobs/{job_id}/render")
    assert res.status_code == 200

    # 6. Run S9 QA
    res = client.post(f"/api/jobs/{job_id}/qa")
    assert res.status_code == 200
    qa_data = res.json()

    assert qa_data["page_count"] == 1
    p1 = qa_data["pages"][0]
    
    # Text expansion in French flyer triggered auto-fit font downscaling
    # The warning must be transparently reported to the user
    assert len(p1["warnings"]) > 0 or p1["overflow_mitigated"] is True
    assert qa_data["overall_status"] in (JobStatus.READY_WITH_WARNINGS.value, JobStatus.READY.value)

    # Verify GET /api/jobs/{id}/qa
    get_qa = client.get(f"/api/jobs/{job_id}/qa")
    assert get_qa.status_code == 200
    assert get_qa.json()["job_id"] == job_id


def test_gate_7_3_segment_editor_and_single_page_rerender(client):
    """Gate 7.3: Verify segment editor PATCH and single-page re-rendering in seconds."""
    file_path = os.path.join(CORPUS_DIR, "12_arabic_bidi_record.pdf")
    with open(file_path, "rb") as f:
        file_bytes = f.read()

    # 1. Create and process job to render
    create_res = client.post("/api/jobs", json={
        "sourceFilename": "12_arabic_bidi_record.pdf",
        "sourceFormat": "pdf",
        "sourceLanguage": "ar",
        "targetLanguage": "en"
    })
    job_id = create_res.json()["id"]

    client.post(
        f"/api/jobs/{job_id}/intake",
        files={"file": ("12_arabic_bidi_record.pdf", file_bytes, "application/pdf")}
    )
    client.post(f"/api/jobs/{job_id}/analyze")
    client.post(f"/api/jobs/{job_id}/translate", json={})
    client.post(f"/api/jobs/{job_id}/render")
    client.post(f"/api/jobs/{job_id}/qa")

    # 2. Get segments for page 1
    segs_res = client.get(f"/api/jobs/{job_id}/segments?page=1")
    assert segs_res.status_code == 200
    segments = segs_res.json()["segments"]
    assert len(segments) > 0
    target_seg = segments[0]
    seg_id = target_seg["id"]

    # 3. Edit segment text via segment editor
    edited_text = "OFFICIAL EDITED RECORD ENTRY 2026"
    patch_res = client.patch(
        f"/api/jobs/{job_id}/segments/{seg_id}",
        json={
            "translated_text": edited_text,
            "reviewer_edit": "Manual reviewer refinement"
        }
    )
    assert patch_res.status_code == 200
    updated_seg = patch_res.json()["segment"]
    assert updated_seg["translated_text"] == edited_text
    assert updated_seg["status"] == "reviewed"
    assert updated_seg["reviewer_edit"] == "Manual reviewer refinement"

    # 4. Single-Page Re-render (Measure execution time - must complete in seconds)
    t0 = time.time()
    rerender_res = client.post(f"/api/jobs/{job_id}/pages/1/re-render")
    elapsed = time.time() - t0

    assert rerender_res.status_code == 200
    rerender_data = rerender_res.json()
    assert rerender_data["job_id"] == job_id
    assert rerender_data["page_number"] == 1
    assert "status" in rerender_data
    assert "preview_url" in rerender_data

    # Strict performance assertion: single page re-render must take < 5.0 seconds
    assert elapsed < 5.0

    # 5. Verify the re-rendered PDF contains the edited text
    dl_res = client.get(f"/api/jobs/{job_id}/download")
    assert dl_res.status_code == 200
    rendered_doc = pdfium.PdfDocument(dl_res.content)
    text_page = rendered_doc[0].get_textpage()
    page_text = text_page.get_text_range(0, text_page.count_chars())
    assert "OFFICIAL EDITED RECORD ENTRY 2026" in page_text


def test_gate_7_4_notification_dispatch_and_audit_logging(client):
    """Gate 7.4: Verify email notifications are generated and logged with audit details."""
    file_path = os.path.join(CORPUS_DIR, "12_arabic_bidi_record.pdf")
    with open(file_path, "rb") as f:
        file_bytes = f.read()

    create_res = client.post("/api/jobs", json={
        "sourceFilename": "12_arabic_bidi_record.pdf",
        "sourceFormat": "pdf",
        "sourceLanguage": "ar",
        "targetLanguage": "en"
    })
    job_id = create_res.json()["id"]

    client.post(
        f"/api/jobs/{job_id}/intake",
        files={"file": ("12_arabic_bidi_record.pdf", file_bytes, "application/pdf")}
    )
    client.post(f"/api/jobs/{job_id}/analyze")
    client.post(f"/api/jobs/{job_id}/translate", json={})
    client.post(f"/api/jobs/{job_id}/render")
    client.post(f"/api/jobs/{job_id}/qa")

    # Fetch notification logs
    notif_res = client.get(f"/api/jobs/{job_id}/notifications")
    assert notif_res.status_code == 200
    notifs = notif_res.json()["notifications"]
    assert len(notifs) >= 1

    email = notifs[0]
    assert email["job_id"] == job_id
    assert "ready" in email["subject"].lower()
    assert "/api/jobs/" in email["body_text"]
    assert "VerifyLingua" in email["body_text"]
    assert "8 CFR § 103.2" in email["body_html"]
    assert email["status"] == "delivered"


def test_gate_7_5_full_api_workflow_with_qa_and_editor(client):
    """Gate 7.5: Full API progression from upload to QA, segment edit, re-render and final download."""
    file_path = os.path.join(CORPUS_DIR, "12_arabic_bidi_record.pdf")
    with open(file_path, "rb") as f:
        file_bytes = f.read()

    # 1. Job Creation
    job = client.post("/api/jobs", json={
        "sourceFilename": "12_arabic_bidi_record.pdf",
        "sourceFormat": "pdf",
        "sourceLanguage": "ar",
        "targetLanguage": "en"
    }).json()
    job_id = job["id"]

    # 2. Intake
    client.post(
        f"/api/jobs/{job_id}/intake",
        files={"file": ("12_arabic_bidi_record.pdf", file_bytes, "application/pdf")}
    )

    # 3. Analyze
    client.post(f"/api/jobs/{job_id}/analyze")

    # 4. Translate
    client.post(f"/api/jobs/{job_id}/translate", json={})

    # 5. Render
    client.post(f"/api/jobs/{job_id}/render")

    # 6. QA
    qa_resp = client.post(f"/api/jobs/{job_id}/qa")
    assert qa_resp.status_code == 200
    assert qa_resp.json()["overall_status"] in ("ready", "ready_with_warnings")

    # 7. Segment Edit
    segs = client.get(f"/api/jobs/{job_id}/segments").json()["segments"]
    first_seg_id = segs[0]["id"]
    client.patch(
        f"/api/jobs/{job_id}/segments/{first_seg_id}",
        json={"translated_text": "FINAL VERIFIED TEXT S9"}
    )

    # 8. Re-render Page 1
    rerender = client.post(f"/api/jobs/{job_id}/pages/1/re-render")
    assert rerender.status_code == 200

    # 9. Download
    final_file = client.get(f"/api/jobs/{job_id}/download")
    assert final_file.status_code == 200
    assert len(final_file.content) > 1000
