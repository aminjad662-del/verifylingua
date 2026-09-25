import os
import io
import time
import pytest
from fastapi.testclient import TestClient
import pypdfium2 as pdfium
import pikepdf

from api.main import app
from api.models import (
    JobStatus,
    ServiceTier,
    CertifiedOrderRequest,
    NameCaptureItem,
    CertifiedApprovalRequest
)
from api.certified import CertificationPageGenerator, CertifiedWorkflowManager
from api.store import job_store

CORPUS_DIR = os.path.join(os.path.dirname(__file__), "corpus")
REPORTS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "reports", "milestone-8")
VISUAL_DIR = os.path.join(REPORTS_DIR, "visual")

os.makedirs(VISUAL_DIR, exist_ok=True)


@pytest.fixture
def client():
    return TestClient(app)


def test_gate_8_1_name_capture_and_passport_glossary_locking(client):
    """Gate 8.1: Name spelling capture locks proper nouns in glossary to eliminate transliteration mismatch."""
    file_path = os.path.join(CORPUS_DIR, "12_arabic_bidi_record.pdf")
    with open(file_path, "rb") as f:
        file_bytes = f.read()

    # 1. Create Job
    job_res = client.post("/api/jobs", json={
        "sourceFilename": "12_arabic_bidi_record.pdf",
        "sourceFormat": "pdf",
        "sourceLanguage": "ar",
        "targetLanguage": "en"
    })
    assert job_res.status_code == 200
    job_id = job_res.json()["id"]

    # 2. Intake
    client.post(f"/api/jobs/{job_id}/intake", files={"file": ("12_arabic_bidi_record.pdf", file_bytes, "application/pdf")})
    client.post(f"/api/jobs/{job_id}/analyze")

    # 3. Create Certified Order with Passport Name Spelling Locks
    order_req = {
        "names": [
            {
                "source_name": "محمد بن عبد الله",
                "passport_spelling": "MOHAMMED BIN ABDULLAH",
                "role": "Principal Applicant"
            },
            {
                "source_name": "فاطمة الزهراء",
                "passport_spelling": "FATIMA AL-ZAHRAA",
                "role": "Spouse"
            }
        ],
        "purpose": "USCIS Form I-130 Petition",
        "client_notes": "Names must strictly match the Latin passports provided.",
        "notarization_required": True,
        "expedited": True
    }

    cert_res = client.post(f"/api/jobs/{job_id}/certified/order", json=order_req)
    assert cert_res.status_code == 200
    order_data = cert_res.json()["order"]
    assert order_data["job_id"] == job_id
    assert len(order_data["names"]) == 2
    assert order_data["status"] == "pending_review"

    # Verify that names were injected into the glossary with forced case-sensitivity
    glossary = client.get(f"/api/jobs/{job_id}/glossary").json()["terms"]
    glossary_targets = [t["target"] for t in glossary]
    assert "MOHAMMED BIN ABDULLAH" in glossary_targets
    assert "FATIMA AL-ZAHRAA" in glossary_targets

    # Check job service tier is now certified
    job_state = client.get(f"/api/jobs/{job_id}").json()
    assert job_state["serviceTier"] == "certified"


def test_gate_8_2_reviewer_queue_management(client):
    """Gate 8.2: Certified reviewer queue properly lists, prioritizes, and reflects pending orders."""
    # List current queue
    queue_res = client.get("/api/certified/queue")
    assert queue_res.status_code == 200
    queue = queue_res.json()
    assert isinstance(queue, list)
    assert len(queue) >= 1

    # Check queue item fields
    item = queue[-1]
    assert "job_id" in item
    assert "source_filename" in item
    assert "source_language" in item
    assert "target_language" in item
    assert "purpose" in item
    assert item["status"] in ("pending_review", "in_review", "approved")
    assert item["names_count"] >= 1


def test_gate_8_3_reviewer_workbench_and_segment_flags(client):
    """Gate 8.3: Reviewer workbench provides side-by-side segment review with flagged issues."""
    file_path = os.path.join(CORPUS_DIR, "12_arabic_bidi_record.pdf")
    with open(file_path, "rb") as f:
        file_bytes = f.read()

    job_res = client.post("/api/jobs", json={
        "sourceFilename": "12_arabic_bidi_record.pdf",
        "sourceFormat": "pdf",
        "sourceLanguage": "ar",
        "targetLanguage": "en"
    })
    job_id = job_res.json()["id"]

    client.post(f"/api/jobs/{job_id}/intake", files={"file": ("12_arabic_bidi_record.pdf", file_bytes, "application/pdf")})
    client.post(f"/api/jobs/{job_id}/analyze")
    client.post(f"/api/jobs/{job_id}/translate", json={})
    client.post(f"/api/jobs/{job_id}/render")
    client.post(f"/api/jobs/{job_id}/qa")

    # Place certified order
    client.post(f"/api/jobs/{job_id}/certified/order", json={
        "names": [{"source_name": "أحمد", "passport_spelling": "AHMED", "role": "Applicant"}],
        "purpose": "EOIR Immigration Court"
    })

    # Fetch reviewer workbench
    wb_res = client.get(f"/api/jobs/{job_id}/certified/review")
    assert wb_res.status_code == 200
    workbench = wb_res.json()

    assert "job" in workbench
    assert "certified_order" in workbench
    assert "segments" in workbench
    assert "glossary" in workbench
    assert "audit_trail" in workbench

    # Check segment flags
    segments = workbench["segments"]
    assert len(segments) > 0
    first_seg = segments[0]
    assert "flags" in first_seg
    assert isinstance(first_seg["flags"], list)


def test_gate_8_4_official_8_cfr_103_2_certification_page_generator():
    """Gate 8.4: Generate official 8 CFR § 103.2 Certificate of Accuracy and append to PDF."""
    cert_pdf_bytes = CertificationPageGenerator.generate_certificate_pdf(
        certificate_id="CERT-VL-TEST99",
        job_id="job_test_gate_8_4",
        source_filename="12_arabic_bidi_record.pdf",
        source_language_name="Arabic",
        target_language_name="English",
        page_count=1,
        reviewer_name="Elena Rostova, ATA Certified Translator",
        reviewer_credentials="ATA Member #278190 • Certified Court Linguist",
        names_lock=[
            {"role": "Beneficiary", "source_name": "علي حسن", "passport_spelling": "ALI HASSAN"}
        ],
        purpose="USCIS N-400 Naturalization Application"
    )

    assert len(cert_pdf_bytes) > 1000
    
    # Inspect generated certification page with pypdfium2
    cert_doc = pdfium.PdfDocument(cert_pdf_bytes)
    assert len(cert_doc) == 1
    tp = cert_doc[0].get_textpage()
    cert_text = tp.get_text_range(0, tp.count_chars())

    # Legal Assertions for USCIS 8 CFR § 103.2 compliance
    assert "VERIFYLINGUA" in cert_text
    assert "CERTIFICATE OF TRANSLATOR'S COMPETENCE" in cert_text
    assert "8 CFR § 103.2" in cert_text or "103.2(b)(3)" in cert_text
    assert "Elena Rostova" in cert_text
    assert "ATA Member #278190" in cert_text
    assert "ALI HASSAN" in cert_text
    assert "CERT-VL-TEST99" in cert_text

    # Save visual rendering of the certification page
    cert_img = cert_doc[0].render(scale=150.0/72.0).to_pil()
    cert_img_path = os.path.join(VISUAL_DIR, "certified_affidavit_page_sample.png")
    cert_img.save(cert_img_path)
    assert os.path.exists(cert_img_path)

    # Test appending to an existing document
    file_path = os.path.join(CORPUS_DIR, "12_arabic_bidi_record.pdf")
    with open(file_path, "rb") as f:
        orig_doc_bytes = f.read()

    combined_pdf = CertificationPageGenerator.append_certificate_to_pdf(orig_doc_bytes, cert_pdf_bytes)
    assert len(combined_pdf) > len(orig_doc_bytes)

    with pikepdf.open(io.BytesIO(combined_pdf)) as p_combined:
        assert len(p_combined.pages) == 2  # 1 original + 1 certification page


def test_gate_8_5_immutable_audit_trail_logging(client):
    """Gate 8.5: Every reviewer action is permanently recorded in the audit trail with timestamps and details."""
    file_path = os.path.join(CORPUS_DIR, "12_arabic_bidi_record.pdf")
    with open(file_path, "rb") as f:
        file_bytes = f.read()

    job_res = client.post("/api/jobs", json={
        "sourceFilename": "12_arabic_bidi_record.pdf",
        "sourceFormat": "pdf",
        "sourceLanguage": "ar",
        "targetLanguage": "en"
    })
    job_id = job_res.json()["id"]

    client.post(f"/api/jobs/{job_id}/intake", files={"file": ("12_arabic_bidi_record.pdf", file_bytes, "application/pdf")})
    client.post(f"/api/jobs/{job_id}/analyze")
    client.post(f"/api/jobs/{job_id}/translate", json={})
    client.post(f"/api/jobs/{job_id}/render")
    client.post(f"/api/jobs/{job_id}/qa")

    # 1. Certified Order Created -> Generates first audit entry
    client.post(f"/api/jobs/{job_id}/certified/order", json={
        "names": [{"source_name": "طارق", "passport_spelling": "TAREK", "role": "Applicant"}],
        "purpose": "USCIS Affirmative Asylum Application"
    })

    # 2. Add Reviewer Segment Edit Audit Entry
    job_store.add_audit_entry(
        job_id=job_id,
        reviewer_id="rev_elena_278",
        reviewer_name="Elena Rostova",
        action="segment_edit",
        details={"segment_id": "seg_1", "old_text": "Old text", "new_text": "Corrected legal phrase"}
    )

    # 3. Reviewer Approves and Certifies
    approval_res = client.post(f"/api/jobs/{job_id}/certified/approve", json={
        "reviewer_id": "rev_elena_278",
        "reviewer_name": "Elena Rostova, ATA Certified Translator",
        "reviewer_credentials": "ATA Member #278190 • Certified Court Linguist",
        "statement_of_competence": "I certify under 8 CFR § 103.2 that I am fluent in Arabic and English.",
        "reviewer_notes": "All stamps, handwritten dates, and names verified."
    })
    assert approval_res.status_code == 200
    approval_data = approval_res.json()
    assert approval_data["status"] == "certified_ready"
    assert "certificate_id" in approval_data

    # 4. Verify Immutable Audit Trail Retrieval
    audit_res = client.get(f"/api/jobs/{job_id}/certified/audit")
    assert audit_res.status_code == 200
    trail = audit_res.json()["audit_trail"]
    assert len(trail) >= 3

    actions = [e["action"] for e in trail]
    assert "order_created" in actions
    assert "segment_edit" in actions
    assert "approved_and_certified" in actions

    for entry in trail:
        assert "timestamp" in entry
        assert "reviewer_name" in entry
        assert "details" in entry


def test_gate_8_6_full_certified_workflow_end_to_end(client):
    """Gate 8.6: End-to-end integration of full Certified Translation Pipeline."""
    file_path = os.path.join(CORPUS_DIR, "12_arabic_bidi_record.pdf")
    with open(file_path, "rb") as f:
        file_bytes = f.read()

    # Step 1: Client Upload & Automated Processing
    job = client.post("/api/jobs", json={
        "sourceFilename": "12_arabic_bidi_record.pdf",
        "sourceFormat": "pdf",
        "sourceLanguage": "ar",
        "targetLanguage": "en"
    }).json()
    job_id = job["id"]

    client.post(f"/api/jobs/{job_id}/intake", files={"file": ("12_arabic_bidi_record.pdf", file_bytes, "application/pdf")})
    client.post(f"/api/jobs/{job_id}/analyze")
    client.post(f"/api/jobs/{job_id}/translate", json={})
    client.post(f"/api/jobs/{job_id}/render")
    client.post(f"/api/jobs/{job_id}/qa")

    # Step 2: Client upgrades to Certified Mode with Name Capture
    order_res = client.post(f"/api/jobs/{job_id}/certified/order", json={
        "names": [{"source_name": "سعيد المنصوري", "passport_spelling": "SAEED AL-MANSOORI", "role": "Principal"}],
        "purpose": "USCIS N-400",
        "notarization_required": False
    })
    assert order_res.status_code == 200

    # Step 3: Linguist picks job from queue
    queue = client.get("/api/certified/queue").json()
    assert any(q["job_id"] == job_id for q in queue)

    # Step 4: Linguist opens workbench
    workbench = client.get(f"/api/jobs/{job_id}/certified/review").json()
    assert len(workbench["segments"]) > 0

    # Step 5: Linguist modifies a segment and re-renders that page
    first_seg_id = workbench["segments"][0]["id"]
    client.patch(f"/api/jobs/{job_id}/segments/{first_seg_id}", json={
        "translated_text": "CERTIFIED AND AUDITED OFFICIAL ENTRY 2026",
        "reviewer_edit": "Linguist verified terminology"
    })
    rerender = client.post(f"/api/jobs/{job_id}/pages/1/re-render")
    assert rerender.status_code == 200

    # Step 6: Linguist signs and approves the certified translation
    approve_res = client.post(f"/api/jobs/{job_id}/certified/approve", json={
        "reviewer_id": "rev_001",
        "reviewer_name": "Elena Rostova, ATA Certified Translator",
        "reviewer_credentials": "ATA Member #278190"
    })
    assert approve_res.status_code == 200
    approval_info = approve_res.json()
    assert approval_info["status"] == "certified_ready"

    # Step 7: Final Download - Must be a valid PDF containing the translated page PLUS the certification page
    dl_res = client.get(f"/api/jobs/{job_id}/download")
    assert dl_res.status_code == 200
    assert dl_res.headers["content-type"] == "application/pdf"

    final_doc = pdfium.PdfDocument(dl_res.content)
    # Original document had 1 page; certified output has 2 pages (original + certification page)
    assert len(final_doc) == 2

    # Check page 1 has edited text
    p1_text = final_doc[0].get_textpage().get_text_range(0, 1000)
    assert "CERTIFIED AND AUDITED OFFICIAL ENTRY 2026" in p1_text

    # Check page 2 is the certification page
    p2_text = final_doc[1].get_textpage().get_text_range(0, 1000)
    assert "CERTIFICATE OF TRANSLATOR'S COMPETENCE" in p2_text
    assert "8 CFR § 103.2" in p2_text or "103.2(b)(3)" in p2_text
    assert "SAEED AL-MANSOORI" in p2_text
