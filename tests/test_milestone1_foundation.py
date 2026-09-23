import os
import io
import json
import pytest
from fastapi.testclient import TestClient

from api.main import app
from api.intake import run_intake_security_check, IntakeError
from api.models import JobStatus, PageKind, PageStatus

client = TestClient(app)
CORPUS_DIR = os.path.join("tests", "corpus")

def test_health_check():
    """Milestone 1 Gate: API service is operational with configured limits."""
    resp = client.get("/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "ok"
    assert data["limits"]["maxFileSizeBytes"] == 50 * 1024 * 1024
    assert data["limits"]["maxPages"] == 100
    assert data["limits"]["maxImageMegapixels"] == 60

def test_job_state_machine_lifecycle():
    """Milestone 1 Gate: Job creation, status retrieval, and page model initialization."""
    create_resp = client.post("/api/jobs", json={
        "sourceFilename": "contract_es.pdf",
        "sourceFormat": "pdf",
        "sourceLanguage": "es",
        "targetLanguage": "en",
        "serviceTier": "instant"
    })
    assert create_resp.status_code == 200
    job = create_resp.json()
    assert job["id"].startswith("vl_")
    assert job["status"] == JobStatus.UPLOADED.value
    assert job["progress"] == 0

    get_resp = client.get(f"/api/jobs/{job['id']}")
    assert get_resp.status_code == 200
    assert get_resp.json()["id"] == job["id"]

def test_intake_magic_bytes_detection_and_mismatch():
    """Milestone 1 Gate: S1 Intake rejects file extension spoofing with E_TYPE_MISMATCH."""
    fake_jpg = b"%PDF-1.7 header content here..."
    with pytest.raises(IntakeError) as exc_info:
        run_intake_security_check(fake_jpg, "spoofed.jpg", "jpg")
    assert exc_info.value.code == "E_TYPE_MISMATCH"
    assert exc_info.value.http_status == 415

def test_corpus_01_academic_two_column():
    """Corpus #1: Two-column academic PDF verification."""
    path = os.path.join(CORPUS_DIR, "01_academic_two_column.pdf")
    with open(path, "rb") as f:
        meta = run_intake_security_check(f.read(), "01_academic_two_column.pdf", "pdf")
    assert meta["format"] == "pdf"
    assert meta["page_count"] == 1

def test_corpus_02_contract_20page():
    """Corpus #2: 20-page contract verification."""
    path = os.path.join(CORPUS_DIR, "02_contract_20page_consistency.pdf")
    with open(path, "rb") as f:
        meta = run_intake_security_check(f.read(), "02_contract_20page_consistency.pdf", "pdf")
    assert meta["format"] == "pdf"
    assert meta["page_count"] == 20

def test_corpus_03_table_heavy():
    """Corpus #3: Multi-page financial table PDF verification."""
    path = os.path.join(CORPUS_DIR, "03_table_heavy_multipage.pdf")
    with open(path, "rb") as f:
        meta = run_intake_security_check(f.read(), "03_table_heavy_multipage.pdf", "pdf")
    assert meta["format"] == "pdf"
    assert meta["page_count"] == 2

def test_corpus_04_scanned_certificate():
    """Corpus #4: 300 DPI simulated certificate verification."""
    path = os.path.join(CORPUS_DIR, "04_scanned_certificate.png")
    with open(path, "rb") as f:
        meta = run_intake_security_check(f.read(), "04_scanned_certificate.png", "png")
    assert meta["format"] == "png"
    assert meta["width"] == 1200
    assert meta["height"] == 800

def test_corpus_08a_encrypted_pdf_detection():
    """Corpus #8a: Password-protected PDF detection."""
    path = os.path.join(CORPUS_DIR, "08a_password_protected_user.pdf")
    with open(path, "rb") as f:
        data = f.read()
    with pytest.raises(IntakeError) as exc:
        run_intake_security_check(data, "08a_password_protected_user.pdf", "pdf")
    assert exc.value.code == "E_PDF_PASSWORD"
    # Unlocks with password
    meta = run_intake_security_check(data, "08a_password_protected_user.pdf", "pdf", password="userpass123")
    assert meta["is_encrypted"] is True
    assert meta["page_count"] == 1

def test_corpus_10b_malicious_zipbomb_blocked():
    """Corpus #10b: Malicious zip bomb with > 10,000 entries blocked."""
    path = os.path.join(CORPUS_DIR, "10b_malicious_zipbomb.docx")
    with open(path, "rb") as f:
        with pytest.raises(IntakeError) as exc:
            run_intake_security_check(f.read(), "10b_malicious_zipbomb.docx", "docx")
    assert exc.value.code == "E_DOCX_SECURITY_RISK"

def test_corpus_10c_malicious_900mp_header_blocked():
    """Corpus #10c: Malicious 900 MP decompression bomb header blocked."""
    path = os.path.join(CORPUS_DIR, "10c_malicious_huge_header.png")
    with open(path, "rb") as f:
        with pytest.raises(IntakeError) as exc:
            run_intake_security_check(f.read(), "10c_malicious_huge_header.png", "png")
    assert exc.value.code == "E_IMAGE_TOO_LARGE"

def test_corpus_11_complex_docx():
    """Corpus #11: Complex DOCX verification."""
    path = os.path.join(CORPUS_DIR, "11_complex_elements.docx")
    with open(path, "rb") as f:
        meta = run_intake_security_check(f.read(), "11_complex_elements.docx", "docx")
    assert meta["format"] == "docx"
    assert meta["entry_count"] >= 3

def test_corpus_14a_100_page_load_test_allowed():
    """Corpus #14a: 100-page document within platform limit."""
    path = os.path.join(CORPUS_DIR, "14a_100_page_load_test.pdf")
    with open(path, "rb") as f:
        meta = run_intake_security_check(f.read(), "14a_100_page_load_test.pdf", "pdf")
    assert meta["page_count"] == 100

def test_corpus_14b_101_page_limit_test_blocked():
    """Corpus #14b: 101-page document exceeding 100-page limit blocked."""
    path = os.path.join(CORPUS_DIR, "14b_101_page_limit_test.pdf")
    with open(path, "rb") as f:
        with pytest.raises(IntakeError) as exc:
            run_intake_security_check(f.read(), "14b_101_page_limit_test.pdf", "pdf")
    assert exc.value.code == "E_PAGE_LIMIT_EXCEEDED"

def test_corpus_15_user_golden_case():
    """Corpus #15: Real-world user golden file from C:\\Users\\aminj\\Downloads\\testtrans."""
    path = os.path.join(CORPUS_DIR, "user", "user_test_case_15.jpg")
    with open(path, "rb") as f:
        meta = run_intake_security_check(f.read(), "user_test_case_15.jpg", "jpg")
    assert meta["format"] == "jpg"
    assert meta["width"] == 772
    assert meta["height"] == 1000

def test_full_intake_endpoint_with_user_file():
    """Milestone 1 Gate: End-to-end HTTP intake execution on user test case #15."""
    create_resp = client.post("/api/jobs", json={
        "sourceFilename": "DocuMatch_ES_user15.jpg",
        "sourceFormat": "jpg",
        "sourceLanguage": "es",
        "targetLanguage": "en"
    })
    assert create_resp.status_code == 200
    job_id = create_resp.json()["id"]

    user_file_path = os.path.join(CORPUS_DIR, "user", "user_test_case_15.jpg")
    with open(user_file_path, "rb") as f:
        files = {"file": ("user_test_case_15.jpg", f, "image/jpeg")}
        data = {"declared_format": "jpg"}
        intake_resp = client.post(f"/api/jobs/{job_id}/intake", files=files, data=data)

    assert intake_resp.status_code == 200
    updated_job = intake_resp.json()
    assert updated_job["status"] == JobStatus.ANALYZING.value
    assert updated_job["progress"] == 30
    assert updated_job["pageCount"] == 1
    assert len(updated_job["pages"]) == 1
    assert updated_job["pages"][0]["kind"] == PageKind.IMAGE_ONLY.value
    assert updated_job["pages"][0]["status"] == PageStatus.ANALYZED.value
