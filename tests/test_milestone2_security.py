import os
import io
import zipfile
import pytest
from fastapi.testclient import TestClient
import pikepdf
from PIL import Image

from api.main import app
from api.store import job_store
from api.intake import run_intake_security_check, IntakeError
from api.models import JobStatus

client = TestClient(app)
CORPUS_DIR = os.path.join(os.path.dirname(__file__), "corpus")

def test_security_pdf_javascript_sanitization():
    """Corpus #10a: Active /JavaScript and /OpenAction payloads stripped from PDF."""
    path = os.path.join(CORPUS_DIR, "10a_malicious_javascript.pdf")
    with open(path, "rb") as f:
        raw_bytes = f.read()
        
    meta = run_intake_security_check(raw_bytes, "10a_malicious_javascript.pdf", "pdf")
    assert meta["has_active_content"] is True
    assert meta["stripped_elements"]["open_action"] is True or meta["stripped_elements"]["javascript"] is True
    
    # Verify sanitized output has no active content
    sanitized_bytes = meta["sanitized_bytes"]
    with pikepdf.Pdf.open(io.BytesIO(sanitized_bytes)) as clean_doc:
        assert "/OpenAction" not in clean_doc.Root
        assert "/JavaScript" not in clean_doc.Root
        if "/Names" in clean_doc.Root:
            assert "/JavaScript" not in clean_doc.Root.Names
            assert "/EmbeddedFiles" not in clean_doc.Root.Names

def test_security_pdf_user_password_challenge_and_unlock():
    """Corpus #8a: Password-protected PDF pauses in needs_password, unlocks on valid password."""
    # 1. Create job
    create_res = client.post("/api/jobs", json={
        "sourceFilename": "08a_password_protected_user.pdf",
        "sourceFormat": "pdf",
        "sourceLanguage": "en",
        "targetLanguage": "es"
    })
    assert create_res.status_code == 200
    job_id = create_res.json()["id"]

    # 2. Intake without password -> pauses in needs_password with HTTP 401
    path = os.path.join(CORPUS_DIR, "08a_password_protected_user.pdf")
    with open(path, "rb") as f:
        file_bytes = f.read()

    intake_res = client.post(
        f"/api/jobs/{job_id}/intake",
        files={"file": ("08a_password_protected_user.pdf", file_bytes, "application/pdf")},
        data={"declared_format": "pdf"}
    )
    assert intake_res.status_code == 401
    err_json = intake_res.json()
    assert err_json["error"]["code"] == "E_PDF_PASSWORD"

    # Status check
    status_res = client.get(f"/api/jobs/{job_id}")
    assert status_res.status_code == 200
    assert status_res.json()["status"] == JobStatus.NEEDS_PASSWORD.value

    # 3. Submit wrong password -> rejected
    wrong_pwd_res = client.post(f"/api/jobs/{job_id}/password", json={"password": "wrong_password_999"})
    assert wrong_pwd_res.status_code == 401
    assert wrong_pwd_res.json()["error"]["code"] == "E_PDF_PASSWORD"

    # 4. Submit correct password -> unlocked and transitions to analyzing
    valid_pwd_res = client.post(f"/api/jobs/{job_id}/password", json={"password": "userpass123"})
    assert valid_pwd_res.status_code == 200
    unlocked_job = valid_pwd_res.json()
    assert unlocked_job["status"] == JobStatus.ANALYZING.value
    assert unlocked_job["pageCount"] == 1

def test_security_pdf_owner_restrictions():
    """Corpus #8b: Owner-restricted PDF requires confirmation and proceeds."""
    create_res = client.post("/api/jobs", json={
        "sourceFilename": "08b_owner_restricted.pdf",
        "sourceFormat": "pdf",
        "sourceLanguage": "en",
        "targetLanguage": "fr"
    })
    job_id = create_res.json()["id"]

    path = os.path.join(CORPUS_DIR, "08b_owner_restricted.pdf")
    with open(path, "rb") as f:
        file_bytes = f.read()

    intake_res = client.post(
        f"/api/jobs/{job_id}/intake",
        files={"file": ("08b_owner_restricted.pdf", file_bytes, "application/pdf")},
        data={"declared_format": "pdf"}
    )
    assert intake_res.status_code == 200
    assert intake_res.json()["status"] == JobStatus.NEEDS_OWNER_CONFIRMATION.value

    # User confirms owner translation rights
    confirm_res = client.post(f"/api/jobs/{job_id}/confirm-owner-rights", json={"confirmed": True})
    assert confirm_res.status_code == 200
    assert confirm_res.json()["status"] == JobStatus.ANALYZING.value

def test_security_pdf_truncated_xref_recovery():
    """Corpus #9: Truncated xref table is recovered by qpdf repair."""
    path = os.path.join(CORPUS_DIR, "09_corrupted_xref.pdf")
    with open(path, "rb") as f:
        file_bytes = f.read()
        
    meta = run_intake_security_check(file_bytes, "09_corrupted_xref.pdf", "pdf")
    assert meta["page_count"] >= 1
    assert len(meta["sanitized_bytes"]) > 0

def test_security_pdf_fatal_corruption_rejection():
    """Corrupted garbage PDF rejected with E_PDF_CORRUPT."""
    corrupt_bytes = b"%PDF-1.4\nCorrupted fatal junk data with no trailer dictionary"
    with pytest.raises(IntakeError) as exc:
        run_intake_security_check(corrupt_bytes, "fatal_corrupt.pdf", "pdf")
    assert exc.value.code == "E_PDF_CORRUPT"

def test_security_docx_zipbomb_defense():
    """Corpus #10b: DOCX with > 10,000 entries rejected with E_DOCX_SECURITY_RISK."""
    path = os.path.join(CORPUS_DIR, "10b_malicious_zipbomb.docx")
    with open(path, "rb") as f:
        file_bytes = f.read()
    with pytest.raises(IntakeError) as exc:
        run_intake_security_check(file_bytes, "10b_malicious_zipbomb.docx", "docx")
    assert exc.value.code == "E_DOCX_SECURITY_RISK"

def test_security_docx_xxe_external_entity_defense():
    """Corpus #10d: DOCX package containing XXE external entity injection blocked by defusedxml."""
    path = os.path.join(CORPUS_DIR, "10d_malicious_xxe.docx")
    with open(path, "rb") as f:
        file_bytes = f.read()
    with pytest.raises(IntakeError) as exc:
        run_intake_security_check(file_bytes, "10d_malicious_xxe.docx", "docx")
    assert exc.value.code == "E_DOCX_SECURITY_RISK"
    assert "XXE" in exc.value.message or "entity" in exc.value.message.lower()

def test_security_docx_macro_rejection():
    """DOCX containing macros (.docm features) rejected."""
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w") as zf:
        zf.writestr("[Content_Types].xml", "<Types></Types>")
        zf.writestr("word/document.xml", "<w:document></w:document>")
        zf.writestr("word/vbaProject.bin", b"fake macro binary payload")
    buf.seek(0)
    
    with pytest.raises(IntakeError) as exc:
        run_intake_security_check(buf.getvalue(), "macro_exploit.docx", "docx")
    assert exc.value.code == "E_DOCX_SECURITY_RISK"
    assert "macro" in exc.value.message.lower()

def test_security_docx_path_traversal_rejection():
    """DOCX archive containing path traversal entries rejected."""
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w") as zf:
        zf.writestr("[Content_Types].xml", "<Types></Types>")
        zf.writestr("word/document.xml", "<w:document></w:document>")
        zf.writestr("../../../etc/passwd", b"root:x:0:0:root:/root:/bin/bash")
    buf.seek(0)

    with pytest.raises(IntakeError) as exc:
        run_intake_security_check(buf.getvalue(), "traversal.docx", "docx")
    assert exc.value.code == "E_DOCX_SECURITY_RISK"
    assert "paths" in exc.value.message.lower()

def test_security_image_decompression_bomb_defense():
    """Corpus #10c: 900 MP image header decompression bomb blocked before allocation."""
    path = os.path.join(CORPUS_DIR, "10c_malicious_huge_header.png")
    with open(path, "rb") as f:
        file_bytes = f.read()
    with pytest.raises(IntakeError) as exc:
        run_intake_security_check(file_bytes, "10c_malicious_huge_header.png", "png")
    assert exc.value.code == "E_IMAGE_TOO_LARGE"

def test_security_image_exif_orientation_normalization_and_stripping():
    """Corpus #05b: EXIF orientation tag 6 (90 deg CW) normalized upright and metadata stripped."""
    path = os.path.join(CORPUS_DIR, "05b_photo_with_exif_rotation.jpg")
    with open(path, "rb") as f:
        file_bytes = f.read()
        
    meta = run_intake_security_check(file_bytes, "05b_photo_with_exif_rotation.jpg", "jpg")
    assert meta["orientation_transposed"] is True
    assert meta["exif_stripped"] is True
    
    # Verify sanitized image is transposed and has no EXIF
    sanitized_bytes = meta["sanitized_bytes"]
    with Image.open(io.BytesIO(sanitized_bytes)) as clean_img:
        assert clean_img.size == (400, 200) # rotated upright from (200, 400)
        exif = clean_img.getexif()
        assert len(exif.keys()) == 0

def test_security_malware_eicar_detection():
    """Malware signature detection triggers E_MALWARE."""
    eicar_data = b"%PDF-1.4\n" + b"X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*"
    with pytest.raises(IntakeError) as exc:
        run_intake_security_check(eicar_data, "infected.pdf", "pdf")
    assert exc.value.code == "E_MALWARE"
    assert exc.value.http_status == 422

def test_security_page_limit_101_pages_blocked():
    """Corpus #14b: 101-page PDF rejected with E_PAGE_LIMIT_EXCEEDED."""
    path = os.path.join(CORPUS_DIR, "14b_101_page_limit_test.pdf")
    with open(path, "rb") as f:
        file_bytes = f.read()
    with pytest.raises(IntakeError) as exc:
        run_intake_security_check(file_bytes, "14b_101_page_limit_test.pdf", "pdf")
    assert exc.value.code == "E_PAGE_LIMIT_EXCEEDED"

def test_security_page_limit_100_pages_accepted():
    """Corpus #14a: 100-page PDF passes platform intake ceiling."""
    path = os.path.join(CORPUS_DIR, "14a_100_page_load_test.pdf")
    with open(path, "rb") as f:
        file_bytes = f.read()
    meta = run_intake_security_check(file_bytes, "14a_100_page_load_test.pdf", "pdf")
    assert meta["page_count"] == 100
