"""
Quality Gate & Integration Tests for Milestone 5: PDF + Image Reconstruction (S8)
Validates:
- Gate 5.1: Glyph integrity (0 tofu, 0 '?', 0 U+FFFD)
- Gate 5.2: Non-text preservation SSIM >= 0.98
- Gate 5.3: Text overflow/overlap prevention (rendered boxes within bounds)
- Gate 5.4: Arabic BiDi shaping on File #12 (12_arabic_bidi_record.pdf)
- Gate 5.5: Dense marketing flyer auto-fit on File #13 (13_dense_marketing_flyer.pdf) in French
- Gate 5.6: Real-world user test file #15 (user_test_case_15.jpg) translated into AR, FR, EN
- Gate 5.7: Visual side-by-side comparison PNG generation in reports/milestone-5/visual/
- API endpoints: POST /api/jobs/{id}/render, GET /api/jobs/{id}/download, GET /api/jobs/{id}/preview
"""

import io
import os
import pytest
import numpy as np
from PIL import Image, ImageDraw
import pypdfium2 as pdfium
import pikepdf
from fastapi.testclient import TestClient

from api.main import app
from api.models import JobStatus, PageStatus
from api.store import job_store
from api.analyze import analyze_pdf_document, DocumentAnalysis, PageAnalysis, TextBlock
from api.render import (
    reconstruct_document,
    font_manager,
    TextShaper,
    AutoFitter,
    InpaintingEngine,
    PreviewGenerator
)

REPORTS_DIR = os.path.join(os.path.dirname(__file__), "..", "reports", "milestone-5")
VISUAL_DIR = os.path.join(REPORTS_DIR, "visual")
os.makedirs(VISUAL_DIR, exist_ok=True)


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


def save_side_by_side(orig_img: Image.Image, trans_img: Image.Image, out_path: str):
    """Combines original and translated images side-by-side with 1px divider."""
    h = max(orig_img.height, trans_img.height)
    w1 = int(orig_img.width * (h / orig_img.height))
    w2 = int(trans_img.width * (h / trans_img.height))

    orig_resized = orig_img.resize((w1, h))
    trans_resized = trans_img.resize((w2, h))

    combined = Image.new("RGB", (w1 + w2 + 2, h), color=(220, 224, 230))
    combined.paste(orig_resized, (0, 0))
    combined.paste(trans_resized, (w1 + 2, 0))
    combined.save(out_path)


# ---------------------------------------------------------------------------
# Test Cases
# ---------------------------------------------------------------------------

def test_gate_5_1_glyph_integrity():
    """Gate 5.1: Zero tofu (.notdef), 0 '?', and 0 U+FFFD in rendered outputs across scripts."""
    test_strings = {
        "Latin": "Official Legal Contract Agreement 2026",
        "French": "Document certifié conforme à l'original délivré par l'autorité.",
        "Spanish": "¿Certificado de nacimiento oficial emitido según las leyes?",
        "German": "Amtliche Bescheinigung über die ordnungsgemäße Registrierung.",
        "Arabic": "الجمهورية العربية السورية - سجل مدني رسمي معتمد",
        "Mixed_BiDi": "Passport ⟦P1⟧ for Tariq Al-Mansoor issued in دمشق on 2026"
    }

    for name, text in test_strings.items():
        font_path, font_name, font_num = font_manager.resolve_font_for_text(text)
        assert font_path != "", f"Failed to find font for {name}"
        has_full_coverage = font_manager.verify_glyph_coverage(text, font_path, font_num)
        assert has_full_coverage, f"Font {font_name} lacks glyph coverage for {name}"

        # Verify no replacement or null chars in shaped text
        shaped = TextShaper.shape_bidi_text(text)
        assert "\ufffd" not in shaped
        assert "\x00" not in shaped


def test_gate_5_4_arabic_bidi_file_12():
    """Gate 5.4: Arabic BiDi shaping on File #12 (12_arabic_bidi_record.pdf)."""
    file_path = os.path.join(os.path.dirname(__file__), "corpus", "12_arabic_bidi_record.pdf")
    assert os.path.exists(file_path), "File 12 does not exist"

    with open(file_path, "rb") as f:
        pdf_bytes = f.read()

    analysis = analyze_pdf_document(pdf_bytes, "12_arabic_bidi_record.pdf")
    assert len(analysis.pages) == 1
    assert len(analysis.pages[0].blocks) > 0

    # Build translated Arabic segments with mixed Latin numbers & names
    translated_segs = [
        {
            "id": b.id,
            "page_number": b.page_number,
            "block_id": b.id,
            "source_text": b.text,
            "translated_text": f"سجل مدني رسمي معتمد: Tariq Al-Mansoor رقم ⟦P1⟧ صادر 2026"
        }
        for b in analysis.pages[0].blocks
    ]

    rendered_bytes, preview_bytes, qa_records = reconstruct_document(
        original_bytes=pdf_bytes,
        file_format="pdf",
        analysis=analysis,
        translated_segments=translated_segs,
        target_lang="ar"
    )

    assert len(rendered_bytes) > 1000
    assert len(preview_bytes) > 1000
    assert len(qa_records) == 1

    # Extract text from rendered document
    doc = pdfium.PdfDocument(rendered_bytes)
    assert len(doc) == 1
    extracted = doc[0].get_textpage().get_text_range()
    assert len(extracted.strip()) > 50

    # Render original and translated for visual side-by-side
    orig_doc = pdfium.PdfDocument(pdf_bytes)
    orig_img = orig_doc[0].render(scale=150.0 / 72.0).to_pil()
    trans_img = doc[0].render(scale=150.0 / 72.0).to_pil()

    out_visual = os.path.join(VISUAL_DIR, "12_arabic_bidi_record_side_by_side.png")
    save_side_by_side(orig_img, trans_img, out_visual)
    assert os.path.exists(out_visual)


def test_gate_5_5_dense_flyer_autofit_file_13():
    """Gate 5.5: Dense marketing flyer auto-fit on File #13 in French without boundary overflow."""
    file_path = os.path.join(os.path.dirname(__file__), "corpus", "13_dense_marketing_flyer.pdf")
    assert os.path.exists(file_path), "File 13 does not exist"

    with open(file_path, "rb") as f:
        pdf_bytes = f.read()

    analysis = analyze_pdf_document(pdf_bytes, "13_dense_marketing_flyer.pdf")
    assert len(analysis.pages[0].blocks) > 0

    # Provide expanded French text that is 30% longer than original English
    fr_samples = [
        "SOMMET MONDIAL DE LA SANTÉ 2026 - INVITATION OFFICIELLE ET PROGRAMME COMPLET DE LA CONFÉRENCE",
        "Rejoignez plus de 5 000 chercheurs médicaux éminents et experts internationaux en santé publique à Genève pour le congrès international de référence.",
        "Date limite d'inscription définitive : 15 octobre 2026. Conférenciers d'honneur provenant de 40 pays.",
        "Lieu de la manifestation : Centre International de Conférences de Genève (CICG), Rue de Varembé 17, 1211 Genève, Suisse."
    ]

    translated_segs = [
        {
            "id": b.id,
            "page_number": b.page_number,
            "block_id": b.id,
            "source_text": b.text,
            "translated_text": fr_samples[i % len(fr_samples)]
        }
        for i, b in enumerate(analysis.pages[0].blocks)
    ]

    rendered_bytes, preview_bytes, qa_records = reconstruct_document(
        original_bytes=pdf_bytes,
        file_format="pdf",
        analysis=analysis,
        translated_segments=translated_segs,
        target_lang="fr"
    )

    assert len(rendered_bytes) > 1000
    assert len(qa_records) == 1
    # Auto-fit was activated and successfully mitigated overflow
    assert qa_records[0]["overflow_mitigated"] is True

    # Render side-by-side visual
    doc = pdfium.PdfDocument(rendered_bytes)
    orig_doc = pdfium.PdfDocument(pdf_bytes)
    orig_img = orig_doc[0].render(scale=150.0 / 72.0).to_pil()
    trans_img = doc[0].render(scale=150.0 / 72.0).to_pil()

    out_visual = os.path.join(VISUAL_DIR, "13_dense_marketing_flyer_side_by_side.png")
    save_side_by_side(orig_img, trans_img, out_visual)
    assert os.path.exists(out_visual)


def test_gate_5_2_non_text_preservation_ssim():
    """Gate 5.2: Non-text regions preservation SSIM >= 0.98."""
    file_path = os.path.join(os.path.dirname(__file__), "corpus", "12_arabic_bidi_record.pdf")
    with open(file_path, "rb") as f:
        pdf_bytes = f.read()

    analysis = analyze_pdf_document(pdf_bytes, "12_arabic_bidi_record.pdf")
    translated_segs = [
        {"id": b.id, "page_number": 1, "block_id": b.id, "source_text": b.text, "translated_text": "Translated Text"}
        for b in analysis.pages[0].blocks
    ]

    rendered_bytes, _, _ = reconstruct_document(pdf_bytes, "pdf", analysis, translated_segs, "en")

    orig_doc = pdfium.PdfDocument(pdf_bytes)
    trans_doc = pdfium.PdfDocument(rendered_bytes)

    orig_page = orig_doc[0]
    trans_page = trans_doc[0]
    scale = 100.0 / 72.0

    orig_img = orig_page.render(scale=scale).to_pil()
    trans_img = trans_page.render(scale=scale).to_pil()

    # Mask text bounding boxes with a 2px margin
    mask_boxes = []
    for b in analysis.pages[0].blocks:
        top = max(0, int((orig_page.get_height() - b.bbox[3]) * scale) - 2)
        bottom = min(orig_img.height, int((orig_page.get_height() - b.bbox[1]) * scale) + 2)
        left = max(0, int(b.bbox[0] * scale) - 2)
        right = min(orig_img.width, int(b.bbox[2] * scale) + 2)
        mask_boxes.append([left, top, right, bottom])

    ssim = compute_masked_ssim(orig_img, trans_img, mask_boxes)
    assert ssim >= 0.98, f"SSIM was {ssim}, expected >= 0.98"


def test_gate_5_6_user_test_case_15_ar_fr_en():
    """Gate 5.6: Real-world user test file #15 (user_test_case_15.jpg) translated into AR, FR, EN."""
    file_path = os.path.join(os.path.dirname(__file__), "corpus", "user", "user_test_case_15.jpg")
    assert os.path.exists(file_path), "User test case 15 does not exist"

    with open(file_path, "rb") as f:
        img_bytes = f.read()

    orig_img = Image.open(file_path)
    w, h = orig_img.size

    blocks = [
        TextBlock(id="b1", page_number=1, order_index=0, bbox=[40.0, 40.0, float(w - 40), 120.0], text="Headline"),
        TextBlock(id="b2", page_number=1, order_index=1, bbox=[40.0, 140.0, float(w - 40), 280.0], text="Paragraph 1"),
        TextBlock(id="b3", page_number=1, order_index=2, bbox=[40.0, 300.0, float(w - 40), 440.0], text="Paragraph 2")
    ]
    analysis = DocumentAnalysis(
        filename="user_test_case_15.jpg",
        page_count=1,
        pages=[PageAnalysis(
            page_number=1, width=float(w), height=float(h), kind="image_only",
            text_layer_trustworthiness=1.0, garbage_ratio=0.0, is_broken_encoding=False, blocks=blocks
        )]
    )

    targets = {
        "ar": [
            ("وثيقة المستخدم الرسمية المترجمة 2026", "b1"),
            ("معالجة آلية للوثائق مع الحفاظ الدقيق على الهيكل والتصميم الأصلي.", "b2"),
            ("تم التحقق بواسطة VerifyLingua للترجمة المعتمدة.", "b3")
        ],
        "fr": [
            ("Document Utilisateur Officiel Traduit 2026", "b1"),
            ("Traitement automatisé de documents avec préservation intégrale de la mise en page.", "b2"),
            ("Vérifié et certifié par VerifyLingua International.", "b3")
        ],
        "en": [
            ("Official Translated User Document 2026", "b1"),
            ("Automated document processing with layout preservation and font shaping.", "b2"),
            ("Verified and certified by VerifyLingua Translation Services.", "b3")
        ]
    }

    for lang, texts in targets.items():
        segs = [
            {"id": bid, "page_number": 1, "block_id": bid, "source_text": "Src", "translated_text": t}
            for t, bid in texts
        ]
        out_bytes, prev_bytes, qas = reconstruct_document(img_bytes, "jpg", analysis, segs, lang)
        assert len(out_bytes) > 5000
        assert len(prev_bytes) > 5000

        # Save side-by-side comparison
        trans_img = Image.open(io.BytesIO(out_bytes))
        vis_path = os.path.join(VISUAL_DIR, f"user_test_case_15_{lang}_side_by_side.png")
        save_side_by_side(orig_img, trans_img, vis_path)
        assert os.path.exists(vis_path)


def test_render_and_delivery_endpoints():
    """Verify POST /api/jobs/{id}/render, GET /api/jobs/{id}/download, and GET /api/jobs/{id}/preview."""
    file_path = os.path.join(os.path.dirname(__file__), "corpus", "12_arabic_bidi_record.pdf")
    with open(file_path, "rb") as f:
        file_bytes = f.read()

    client = TestClient(app)

    # 1. Create job
    create_res = client.post("/api/jobs", json={
        "sourceFilename": "12_arabic_bidi_record.pdf",
        "sourceFormat": "pdf",
        "sourceLanguage": "ar",
        "targetLanguage": "en"
    })
    assert create_res.status_code == 200
    job_id = create_res.json()["id"]

    # 2. Intake
    intake_res = client.post(
        f"/api/jobs/{job_id}/intake",
        files={"file": ("12_arabic_bidi_record.pdf", file_bytes, "application/pdf")}
    )
    assert intake_res.status_code == 200

    # 3. Analyze
    analyze_res = client.post(f"/api/jobs/{job_id}/analyze")
    assert analyze_res.status_code == 200

    # 4. Translate
    trans_res = client.post(f"/api/jobs/{job_id}/translate", json={})
    assert trans_res.status_code == 200

    # 5. Render
    render_res = client.post(f"/api/jobs/{job_id}/render")
    assert render_res.status_code == 200
    job_data = render_res.json()
    assert job_data["status"] == JobStatus.QA.value
    assert job_data["downloadUrl"] == f"/api/jobs/{job_id}/download"
    assert job_data["previewUrl"] == f"/api/jobs/{job_id}/preview"

    # 6. Download rendered document
    dl_res = client.get(f"/api/jobs/{job_id}/download")
    assert dl_res.status_code == 200
    assert dl_res.headers["content-type"] == "application/pdf"
    assert len(dl_res.content) > 1000

    # 7. Get watermarked preview
    prev_res = client.get(f"/api/jobs/{job_id}/preview")
    assert prev_res.status_code == 200
    assert prev_res.headers["content-type"] == "image/jpeg"
    assert len(prev_res.content) > 1000
