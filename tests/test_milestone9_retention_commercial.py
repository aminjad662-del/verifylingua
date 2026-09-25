"""
tests/test_milestone9_retention_commercial.py - Quality Gates for Milestone 9
1. Immediate user deletion (DELETE /api/jobs/{id}) purges binaries & scrubs text
2. Retention lifecycle engine (Stage S10) cleans up expired jobs (>24h Instant, >30d Certified)
3. Retention status endpoint (GET /api/jobs/{id}/retention)
4. Commercial plans & deterministic pricing calculation (GET /api/pricing/plans, POST /api/pricing/calculate)
5. Stripe checkout session creation & idempotent webhook fulfillment
6. Account balance & usage telemetry (GET /api/accounts/{id}/balance)
7. Verification of 'automated document processing' across marketing pages & legal drafts
"""

import os
import uuid
import pytest
from datetime import datetime, timezone, timedelta
from fastapi.testclient import TestClient

from api.main import app
from api.store import job_store
from api.models import JobStatus, ServiceTier
from api.retention import (
    RetentionPolicyManager,
    INSTANT_TTL_SECONDS,
    CERTIFIED_TTL_SECONDS
)
from api.commercial import CommercialBillingService

client = TestClient(app)


def test_gate1_immediate_deletion_purges_binaries_and_scrubs_text():
    """Gate 1: DELETE /api/jobs/{id} immediately purges binaries, scrubs text segments to [PURGED], and records audit tombstone."""
    # Create test job
    job_res = client.post("/api/jobs", json={
        "sourceFilename": "confidential_legal_brief.pdf",
        "sourceFormat": "pdf",
        "sourceLanguage": "es",
        "targetLanguage": "en",
        "serviceTier": "instant",
        "userId": "usr_test_priv_01"
    })
    assert job_res.status_code == 200
    job_id = job_res.json()["id"]

    # Seed mock payloads and rendered outputs
    raw_dummy = b"%PDF-1.4 mock raw secret content 12345"
    sanitized_dummy = b"%PDF-1.4 mock sanitized secret content 12345"
    rendered_dummy = b"%PDF-1.4 mock rendered output"
    preview_dummy = b"\x89PNG\r\n\x1a\n mock preview image"

    job_store.set_job_payload(job_id, raw_bytes=raw_dummy, sanitized_bytes=sanitized_dummy)
    job_store.set_rendered_output(job_id, rendered_dummy)
    job_store.set_preview_output(job_id, preview_dummy)

    # Seed segments with sensitive personal information
    segments = [
        {
            "id": f"{job_id}_p1_s1",
            "page_number": 1,
            "block_id": "b1",
            "order_index": 0,
            "source_text": "El ciudadano Juan Perez con pasaporte P98765432.",
            "source_markup": "El ciudadano Juan Perez con pasaporte P98765432.",
            "translated_text": "The citizen Juan Perez with passport P98765432.",
            "translated_markup": "The citizen Juan Perez with passport P98765432.",
            "protected_tokens": {"⟦P1⟧": "P98765432"},
            "confidence": 0.99
        }
    ]
    job_store.set_segments(job_id, segments)

    # Calculate expected freed bytes
    expected_freed = len(raw_dummy) + len(sanitized_dummy) + len(rendered_dummy) + len(preview_dummy)

    # Issue DELETE /api/jobs/{job_id}
    del_res = client.delete(f"/api/jobs/{job_id}")
    assert del_res.status_code == 200
    del_data = del_res.json()
    assert del_data["purged"] is True
    assert del_data["freed_bytes"] == expected_freed
    assert "tombstone" in del_data["message"].lower() or "purged" in del_data["message"].lower()

    # Verify payloads are erased
    assert job_store.get_job_payload(job_id) is None
    assert job_store.get_rendered_output(job_id) is None
    assert job_store.get_preview_output(job_id) is None

    # Verify segments text is scrubbed
    stored_segments = job_store.get_segments(job_id)
    assert len(stored_segments) == 1
    assert stored_segments[0]["source_text"] == "[PURGED]"
    assert stored_segments[0]["translated_text"] == "[PURGED]"
    assert stored_segments[0]["protected_tokens"] == {}

    # Verify job record is in PURGED tombstone state
    job_after = client.get(f"/api/jobs/{job_id}").json()
    assert job_after["status"] == "purged"
    assert job_after["isPurged"] is True
    assert job_after["purgedAt"] is not None
    assert job_after["downloadUrl"] is None
    assert job_after["previewUrl"] is None

    # Verify audit log recorded without sensitive text
    audit_trail = job_store.get_audit_trail(job_id)
    purged_events = [e for e in audit_trail if e["action"] == "job_purged"]
    assert len(purged_events) >= 1
    assert "Juan Perez" not in str(purged_events[0]["details"])
    assert "P98765432" not in str(purged_events[0]["details"])


def test_gate2_retention_lifecycle_engine_expired_jobs():
    """Gate 2: Lifecycle engine purges Instant jobs >24h and Certified jobs >30d, while sparing non-expired jobs."""
    now = datetime.now(timezone.utc)

    # 1. Instant job completed 26 hours ago (EXPIRED)
    job1_res = client.post("/api/jobs", json={
        "sourceFilename": "old_instant_receipt.pdf",
        "sourceFormat": "pdf",
        "serviceTier": "instant"
    })
    job1_id = job1_res.json()["id"]
    job_store.set_job_payload(job1_id, raw_bytes=b"instant old payload 100 bytes" * 4)
    job_store.update_job_stage(job1_id, JobStatus.READY, "ready", 100, page_count=1)
    # Manually backdate completion to 26 hours ago
    job1 = job_store._jobs[job1_id]
    job1["updatedAt"] = now - timedelta(hours=26)
    job1["retentionExpiresAt"] = job1["updatedAt"] + timedelta(seconds=INSTANT_TTL_SECONDS)

    # 2. Certified job completed 5 days ago (NOT EXPIRED: 30-day policy)
    job2_res = client.post("/api/jobs", json={
        "sourceFilename": "active_certified_diploma.pdf",
        "sourceFormat": "pdf",
        "serviceTier": "certified"
    })
    job2_id = job2_res.json()["id"]
    job_store.set_job_payload(job2_id, raw_bytes=b"certified active diploma payload")
    job_store.update_job_stage(job2_id, JobStatus.READY, "ready", 100, page_count=1)
    job2 = job_store._jobs[job2_id]
    job2["updatedAt"] = now - timedelta(days=5)
    job2["retentionExpiresAt"] = job2["updatedAt"] + timedelta(seconds=CERTIFIED_TTL_SECONDS)

    # 3. Certified job completed 32 days ago (EXPIRED)
    job3_res = client.post("/api/jobs", json={
        "sourceFilename": "expired_certified_deed.pdf",
        "sourceFormat": "pdf",
        "serviceTier": "certified"
    })
    job3_id = job3_res.json()["id"]
    job_store.set_job_payload(job3_id, raw_bytes=b"certified expired deed payload" * 2)
    job_store.update_job_stage(job3_id, JobStatus.READY, "ready", 100, page_count=1)
    job3 = job_store._jobs[job3_id]
    job3["updatedAt"] = now - timedelta(days=32)
    job3["retentionExpiresAt"] = job3["updatedAt"] + timedelta(seconds=CERTIFIED_TTL_SECONDS)

    # Test Dry Run
    dry_res = client.post("/api/admin/retention/cleanup?dry_run=true")
    assert dry_res.status_code == 200
    dry_data = dry_res.json()
    assert dry_data["dry_run"] is True
    assert job1_id in dry_data["purged_job_ids"]
    assert job3_id in dry_data["purged_job_ids"]
    assert job2_id not in dry_data["purged_job_ids"]
    # Payloads should still exist after dry run
    assert job_store.get_job_payload(job1_id) is not None

    # Test Actual Live Cleanup Sweep
    live_res = client.post("/api/admin/retention/cleanup?dry_run=false")
    assert live_res.status_code == 200
    live_data = live_res.json()
    assert live_data["dry_run"] is False
    assert job1_id in live_data["purged_job_ids"]
    assert job3_id in live_data["purged_job_ids"]
    assert job2_id not in live_data["purged_job_ids"]

    # Verify job1 and job3 were purged, job2 was preserved intact
    assert job_store.get_job(job1_id).status == JobStatus.PURGED
    assert job_store.get_job_payload(job1_id) is None
    assert job_store.get_job(job3_id).status == JobStatus.PURGED
    assert job_store.get_job_payload(job3_id) is None
    assert job_store.get_job(job2_id).status == JobStatus.READY
    assert job_store.get_job_payload(job2_id) is not None


def test_gate3_retention_status_transparency():
    """Gate 3: GET /api/jobs/{id}/retention returns policy TTL and seconds remaining."""
    job_res = client.post("/api/jobs", json={
        "sourceFilename": "tax_return.pdf",
        "sourceFormat": "pdf",
        "serviceTier": "instant"
    })
    job_id = job_res.json()["id"]
    job_store.update_job_stage(job_id, JobStatus.READY, "ready", 100, page_count=2)

    ret_res = client.get(f"/api/jobs/{job_id}/retention")
    assert ret_res.status_code == 200
    ret_data = ret_res.json()
    assert ret_data["job_id"] == job_id
    assert ret_data["service_tier"] == "instant"
    assert ret_data["policy_ttl_seconds"] == 86400
    assert ret_data["is_purged"] is False
    assert ret_data["seconds_remaining"] is not None
    assert 86300 <= ret_data["seconds_remaining"] <= 86400


def test_gate4_commercial_pricing_catalog_and_calculator():
    """Gate 4: Commercial plans catalog and deterministic quote calculator."""
    # 1. Catalog plans
    plans_res = client.get("/api/pricing/plans")
    assert plans_res.status_code == 200
    plans = plans_res.json()
    assert len(plans) == 3
    plan_ids = [p["id"] for p in plans]
    assert "pack_small_25" in plan_ids
    assert "pack_large_100" in plan_ids
    assert "agency_monthly_500" in plan_ids

    # 2. Instant calculation: 10 pages @ Starter pack rate ($0.40/page) = $4.00
    inst_calc = client.post("/api/pricing/calculate", json={
        "service_tier": "instant",
        "page_count": 10
    }).json()
    assert inst_calc["service_tier"] == "instant"
    assert inst_calc["page_count"] == 10
    assert inst_calc["base_price_usd"] == 4.00
    assert inst_calc["total_price_usd"] == 4.00
    assert inst_calc["price_per_page_usd"] == 0.40

    # 3. Certified calculation: 3 pages @ $24.95 + expedited ($14.95) + notarization ($19.00) = $108.80
    cert_calc = client.post("/api/pricing/calculate", json={
        "service_tier": "certified",
        "page_count": 3,
        "is_expedited": True,
        "needs_notarization": True
    }).json()
    assert cert_calc["service_tier"] == "certified"
    assert cert_calc["page_count"] == 3
    assert cert_calc["base_price_usd"] == 74.85
    assert cert_calc["expedited_fee_usd"] == 14.95
    assert cert_calc["notarization_fee_usd"] == 19.00
    assert cert_calc["total_price_usd"] == 108.80
    assert cert_calc["estimated_turnaround_hours"] == 12


def test_gate5_stripe_checkout_and_idempotent_webhook():
    """Gate 5: Checkout session creation and idempotent Stripe webhook credit fulfillment."""
    user_id = f"usr_{uuid.uuid4().hex[:8]}"

    # Initial balance check (defaults to 10 welcome trial credits)
    bal_initial = client.get(f"/api/accounts/{user_id}/balance").json()
    assert bal_initial["credits_available"] == 10

    # 1. Create checkout session for Professional Pack (100 pages / $29.99)
    checkout_res = client.post("/api/billing/checkout", json={
        "plan_id": "pack_large_100",
        "user_id": user_id
    })
    assert checkout_res.status_code == 200
    co_data = checkout_res.json()
    assert "cs_test_" in co_data["session_id"]
    assert co_data["amount_cents"] == 2999
    assert co_data["pages_granted"] == 100

    # 2. Simulate Stripe checkout.session.completed event
    stripe_event_id = f"evt_{uuid.uuid4().hex[:12]}"
    stripe_payload = {
        "id": stripe_event_id,
        "type": "checkout.session.completed",
        "data": {
            "object": {
                "id": co_data["session_id"],
                "client_reference_id": user_id,
                "amount_total": 2999,
                "metadata": {
                    "plan_id": "pack_large_100"
                }
            }
        }
    }

    wh_res1 = client.post("/api/webhooks/stripe", json=stripe_payload)
    assert wh_res1.status_code == 200
    assert wh_res1.json()["status"] == "PROCESSED"
    assert wh_res1.json()["result"]["pages_granted"] == 100

    # Verify balance was credited: 10 + 100 = 110
    bal_after = client.get(f"/api/accounts/{user_id}/balance").json()
    assert bal_after["credits_available"] == 110

    # 3. Replay duplicate webhook event -> must return DUPLICATE_IGNORED and not add credits
    wh_res2 = client.post("/api/webhooks/stripe", json=stripe_payload)
    assert wh_res2.status_code == 200
    assert wh_res2.json()["status"] == "DUPLICATE_IGNORED"

    bal_replay = client.get(f"/api/accounts/{user_id}/balance").json()
    assert bal_replay["credits_available"] == 110  # Unchanged!


def test_gate6_marketing_copy_and_legal_documents():
    """Gate 6: Verify 'automated document processing' presence and legal documents integrity."""
    # 1. Verify docs/PRIVACY.md and docs/TERMS.md exist
    assert os.path.exists("docs/PRIVACY.md"), "docs/PRIVACY.md missing"
    assert os.path.exists("docs/TERMS.md"), "docs/TERMS.md missing"

    with open("docs/PRIVACY.md", "r", encoding="utf-8") as f:
        privacy_text = f.read()
    assert "24 Hours" in privacy_text
    assert "30 Days" in privacy_text
    assert "Zero Model Training" in privacy_text
    assert "Cloudflare R2" in privacy_text
    assert "Gemini" in privacy_text

    with open("docs/TERMS.md", "r", encoding="utf-8") as f:
        terms_text = f.read()
    assert "8 CFR § 103.2" in terms_text
    assert "100% USCIS Acceptance Guarantee" in terms_text
    assert "automated document processing" in terms_text.lower()

    # 2. Verify Next.js marketing and legal pages contain 'automated document processing'
    target_files = [
        "app/layout.tsx",
        "app/pricing/page.tsx",
        "app/how-it-works/page.tsx",
        "app/privacy/page.tsx",
        "app/terms/page.tsx",
        "components/marketing/SpyglassHero.tsx"
    ]
    for path in target_files:
        assert os.path.exists(path), f"File {path} missing"
        with open(path, "r", encoding="utf-8") as f:
            content = f.read().lower()
        assert "automated document processing" in content, (
            f"Expected 'automated document processing' in {path}"
        )
