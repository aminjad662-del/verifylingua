import os
import json
import pytest
import asyncio
from fastapi.testclient import TestClient

from api.main import app
from api.models import JobStatus, PageStatus, GlossaryTermModel
from api.store import job_store
from api.analyze import analyze_pdf_document
from api.translate import (
    mask_protected_tokens,
    unmask_protected_tokens,
    validate_tokens_and_tags,
    extract_document_context,
    GlossaryEngine,
    TokenBucketRateLimiter,
    CircuitBreaker,
    RateLimitExceeded,
    CircuitBreakerOpenException,
    GeminiTranslationProvider,
    DeepLTranslationProvider,
    TranslationRouter,
    translate_document_pipeline
)

client = TestClient(app)
CORPUS_DIR = os.path.join("tests", "corpus")

# =====================================================================
# Gate 4.1: S5 Token & Tag Integrity
# =====================================================================

def test_gate_s5_protected_tokens_and_tags():
    """
    Quality Gate 4.1: Verify 100% extraction, masking, validation, and unmasking
    of passport numbers, dates, currency, URLs, emails, case numbers, and user names.
    """
    raw_text = (
        "Applicant John Doe (Passport no. AB1234567) was born on September 23, 1990. "
        "Case ID: REF-98765-X. Paid fee: $1,250.00. "
        "Contact: john.doe@example.com or visit https://immigration.gov/portal. "
        "Click <b1>here</b1> for details."
    )
    user_names = ["John Doe"]
    masked, token_map = mask_protected_tokens(raw_text, user_names=user_names)

    # Assert all expected placeholder types were extracted
    assert "⟦X1⟧" in masked  # User name
    assert "⟦P1⟧" in masked  # Passport
    assert "⟦D1⟧" in masked  # Date
    assert "⟦N1⟧" in masked  # Case ID
    assert "⟦C1⟧" in masked  # Currency
    assert "⟦E1⟧" in masked  # Email
    assert "⟦U1⟧" in masked  # URL
    assert "<b1>here</b1>" in masked

    # Verify token map integrity
    assert token_map["⟦X1⟧"] == "John Doe"
    assert token_map["⟦P1⟧"] == "AB1234567"
    assert token_map["⟦D1⟧"] == "September 23, 1990"
    assert token_map["⟦N1⟧"] == "REF-98765-X"
    assert token_map["⟦C1⟧"] == "$1,250.00"
    assert token_map["⟦E1⟧"] == "john.doe@example.com"
    assert token_map["⟦U1⟧"] == "https://immigration.gov/portal"

    # Simulated French translation keeping all placeholders and tags
    translated_masked = (
        "Le demandeur ⟦X1⟧ (N° de passeport ⟦P1⟧) est né le ⟦D1⟧. "
        "Réf. dossier : ⟦N1⟧. Frais acquittés : ⟦C1⟧. "
        "Contact : ⟦E1⟧ ou visitez ⟦U1⟧. "
        "Cliquez <b1>ici</b1> pour plus de détails."
    )

    is_valid, err = validate_tokens_and_tags(masked, translated_masked, token_map)
    assert is_valid is True, f"Validation failed: {err}"

    # Unmasking restores 100% of tokens
    final_output = unmask_protected_tokens(translated_masked, token_map)
    assert "John Doe" in final_output
    assert "AB1234567" in final_output
    assert "September 23, 1990" in final_output
    assert "REF-98765-X" in final_output
    assert "$1,250.00" in final_output
    assert "john.doe@example.com" in final_output
    assert "https://immigration.gov/portal" in final_output
    assert "<b1>ici</b1>" in final_output

def test_gate_s5_validation_rejection_on_missing_or_corrupt_tokens():
    """Verify that dropped placeholders or mismatched tags are caught."""
    masked = "Your code is ⟦N1⟧ and fee is ⟦C1⟧. Visit <a1>site</a1>."
    token_map = {"⟦N1⟧": "SEC-99", "⟦C1⟧": "$50"}

    # Case 1: Missing token ⟦C1⟧
    invalid_translation_1 = "Votre code est ⟦N1⟧. Visitez <a1>site</a1>."
    valid, err = validate_tokens_and_tags(masked, invalid_translation_1, token_map)
    assert valid is False
    assert "Missing protected token ⟦C1⟧" in err

    # Case 2: Duplicate token ⟦N1⟧
    invalid_translation_2 = "Votre code est ⟦N1⟧ et encore ⟦N1⟧ avec ⟦C1⟧. Visitez <a1>site</a1>."
    valid, err = validate_tokens_and_tags(masked, invalid_translation_2, token_map)
    assert valid is False
    assert "Duplicate protected token ⟦N1⟧" in err

    # Case 3: Missing closing XML tag
    invalid_translation_3 = "Votre code est ⟦N1⟧ et frais ⟦C1⟧. Visitez <a1>site."
    valid, err = validate_tokens_and_tags(masked, invalid_translation_3, token_map)
    assert valid is False
    assert "Missing closing tag </a1>" in err


# =====================================================================
# Gate 4.2: S6 Glossary Consistency on File #02 (20-Page Contract)
# =====================================================================

@pytest.mark.anyio
async def test_gate_s6_glossary_consistency_file_02():
    """
    Quality Gate 4.2: File #02 contract consistency across all 20 pages.
    Ensures defined terms ("Board" -> "Conseil d'administration", "Agreement" -> "Contrat")
    are preserved across all 20 pages with 0 unresolved deviations.
    """
    f2_path = os.path.join(CORPUS_DIR, "02_contract_20page_consistency.pdf")
    assert os.path.exists(f2_path), f"File #02 missing at {f2_path}"

    with open(f2_path, "rb") as f:
        pdf_bytes = f.read()

    # 1. Analyze 20 pages
    analysis = analyze_pdf_document(pdf_bytes, filename="02_contract_20page_consistency.pdf")
    assert len(analysis.pages) == 20

    # 2. Create job in store
    job = job_store.create_job(
        source_filename="02_contract_20page_consistency.pdf",
        source_format="pdf",
        source_lang="en",
        target_lang="fr"
    )
    job_store.set_job_payload(job.id, raw_bytes=pdf_bytes, sanitized_bytes=pdf_bytes)

    # 3. Define mandatory glossary terms
    user_glossary = [
        GlossaryTermModel(source="Board", target="Conseil d'administration", domain="legal", is_user_forced=True),
        GlossaryTermModel(source="Agreement", target="Contrat", domain="legal", is_user_forced=True)
    ]

    # 4. Run translation pipeline
    result = await translate_document_pipeline(
        job_id=job.id,
        analysis=analysis,
        source_lang="en",
        target_lang="fr",
        user_glossary=user_glossary
    )

    assert result["status"] == "success"
    assert result["total_segments"] > 0

    # 5. Verify across all 20 pages that 0 glossary deviations exist
    all_segments = job_store.get_segments(job.id)
    glossary_engine = GlossaryEngine(user_glossary)

    total_deviations = 0
    pages_checked = set()

    for seg in all_segments:
        page_num = seg["page_number"]
        pages_checked.add(page_num)
        devs = glossary_engine.check_consistency(seg["source_text"], seg["translated_text"])
        total_deviations += len(devs)

    assert len(pages_checked) == 20, f"Expected 20 pages checked, got {len(pages_checked)}"
    assert total_deviations == 0, f"Quality gate failure: {total_deviations} unresolved deviations found in file #02"


# =====================================================================
# Gate 4.3: S7 Rate Limiting & Simulated 429 Storm Failover
# =====================================================================

@pytest.mark.anyio
async def test_gate_s7_rate_limiting_and_simulated_429_storm():
    """
    Quality Gate 4.3: Simulated 429 storm triggering exponential backoff
    and circuit breaker failover to fallback provider, ensuring the job completes.
    """
    primary = GeminiTranslationProvider()
    fallback = DeepLTranslationProvider()
    router = TranslationRouter(primary=primary, fallback=fallback)

    # Simulate 429 storm on primary provider
    primary.circuit_breaker.simulate_429_storm(enabled=True)

    batch = [
        {"id": "seg_1", "text": "Section 1. Definitions and Terminology", "role": "paragraph"},
        {"id": "seg_2", "text": "Neither Party may assign rights without prior written consent.", "role": "legal_clause"}
    ]
    context = extract_document_context("AGREEMENT definitions", filename="contract.pdf")
    glossary = [GlossaryTermModel(source="Party", target="Partie", is_user_forced=True)]

    # Execute translation through router
    results, metrics = await router.translate_batch_with_failover(
        batch=batch,
        source_lang="en",
        target_lang="fr",
        context=context,
        glossary=glossary
    )

    # Verify fallback provider stepped in and answered
    assert len(results) == 2
    assert results[0]["id"] == "seg_1"
    assert results[1]["id"] == "seg_2"
    assert metrics["provider"] == "deepl"
    assert primary.circuit_breaker.state == "OPEN"


# =====================================================================
# Gate 4.4: S7 Cost Ledger & Telemetry
# =====================================================================

@pytest.mark.anyio
async def test_gate_s7_cost_ledger_tracking():
    """
    Quality Gate 4.4: Cost ledger records per-page token metrics and USD pricing.
    """
    job = job_store.create_job(
        source_filename="test_cost.pdf",
        source_format="pdf",
        source_lang="en",
        target_lang="es"
    )

    # Simulate recording cost entries
    job_store.add_cost_entry(job.id, {
        "id": "cost_p1",
        "job_id": job.id,
        "page_number": 1,
        "provider": "gemini",
        "model": "gemini-2.5-flash",
        "input_tokens": 150,
        "output_tokens": 180,
        "cost_usd": 0.000065,
        "latency_ms": 120.5
    })
    job_store.add_cost_entry(job.id, {
        "id": "cost_p2",
        "job_id": job.id,
        "page_number": 2,
        "provider": "gemini",
        "model": "gemini-1.5-pro",
        "input_tokens": 400,
        "output_tokens": 450,
        "cost_usd": 0.002750,
        "latency_ms": 350.2
    })

    summary = job_store.get_cost_summary(job.id)
    assert summary["total_input_tokens"] == 550
    assert summary["total_output_tokens"] == 630
    assert summary["total_cost_usd"] > 0
    assert "gemini" in summary["provider_breakdown"]


# =====================================================================
# Gate 4.5: End-to-End API Translation Route
# =====================================================================

def test_api_translate_endpoint_flow():
    """
    Quality Gate 4.5: End-to-end API route execution of document translation.
    """
    f1_path = os.path.join(CORPUS_DIR, "01_academic_two_column.pdf")
    with open(f1_path, "rb") as f:
        file_bytes = f.read()

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
    intake_res = client.post(
        f"/api/jobs/{job_id}/intake",
        files={"file": ("01_academic_two_column.pdf", file_bytes, "application/pdf")},
        data={"declared_format": "pdf"}
    )
    assert intake_res.status_code == 200

    # 3. Analyze
    analyze_res = client.post(f"/api/jobs/{job_id}/analyze")
    assert analyze_res.status_code == 200

    # 4. Set custom glossary terms via API
    glossary_res = client.post(f"/api/jobs/{job_id}/glossary", json=[
        {"source": "Neural", "target": "Neuronal", "domain": "academic", "is_user_forced": True}
    ])
    assert glossary_res.status_code == 200
    assert len(glossary_res.json()["terms"]) >= 1

    # 5. Translate
    translate_res = client.post(f"/api/jobs/{job_id}/translate", json={
        "user_names": ["USCIS"],
        "user_glossary": [
            {"source": "Neural", "target": "Neuronal", "domain": "academic", "is_user_forced": True}
        ]
    })
    assert translate_res.status_code == 200
    job_data = translate_res.json()
    assert job_data["status"] == JobStatus.RENDERING.value

    # 6. Verify segments endpoint
    segs_res = client.get(f"/api/jobs/{job_id}/segments")
    assert segs_res.status_code == 200
    segments = segs_res.json()["segments"]
    assert len(segments) > 0
    assert all(s["status"] == "translated" for s in segments)

    # 7. Verify costs endpoint
    costs_res = client.get(f"/api/jobs/{job_id}/costs")
    assert costs_res.status_code == 200
    costs_data = costs_res.json()
    assert costs_data["total_cost_usd"] >= 0
    assert costs_data["total_input_tokens"] > 0
