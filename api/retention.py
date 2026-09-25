"""
api/retention.py - Retention & Deletion Lifecycle Engine (Stage S10)
USCIS 8 CFR § 103.2 and GDPR/CCPA Zero Data Retention Compliance

Default Policies:
- Instant Tier: 24 hours (86,400 seconds) post-completion.
- Certified Tier: 30 days (2,592,000 seconds) post-completion.
- Presigned Download URLs: 15 minutes (900 seconds) TTL.
- Immediate Deletion: User-initiated immediate purging of all binary payloads
  and text content (segments scrubbed to [PURGED]), preserving an immutable
  tombstone audit record without storing any personal document text.
"""

from typing import Dict, List, Any, Optional
from datetime import datetime, timezone, timedelta
from api.models import (
    JobStatus,
    ServiceTier,
    RetentionInfoResponse,
    RetentionCleanupResponse,
    ImmediateDeletionResponse
)
from api.store import job_store

INSTANT_TTL_SECONDS = 24 * 3600       # 24 Hours
CERTIFIED_TTL_SECONDS = 30 * 24 * 3600 # 30 Days
PRESIGNED_DOWNLOAD_TTL_SECONDS = 900   # 15 Minutes


class RetentionPolicyManager:
    @staticmethod
    def get_policy_ttl_seconds(tier: ServiceTier) -> int:
        if tier == ServiceTier.CERTIFIED:
            return CERTIFIED_TTL_SECONDS
        return INSTANT_TTL_SECONDS

    @classmethod
    def get_retention_info(cls, job_id: str) -> Optional[RetentionInfoResponse]:
        raw_info = job_store.get_retention_info(job_id)
        if not raw_info:
            return None
        return RetentionInfoResponse(**raw_info)

    @classmethod
    def immediate_purge(
        cls,
        job_id: str,
        actor: str = "user",
        reason: str = "User requested immediate deletion"
    ) -> ImmediateDeletionResponse:
        res = job_store.purge_job(job_id=job_id, actor=actor, reason=reason)
        return ImmediateDeletionResponse(
            job_id=job_id,
            purged=True,
            freed_bytes=res.get("freed_bytes", 0),
            purged_at=res.get("purged_at", datetime.now(timezone.utc)),
            message="Document binary payloads and segment text purged successfully. Tombstone audit retained."
        )

    @classmethod
    def cleanup_expired_jobs(
        cls,
        dry_run: bool = False,
        custom_now: Optional[datetime] = None
    ) -> RetentionCleanupResponse:
        now = custom_now or datetime.now(timezone.utc)
        all_jobs = job_store.get_all_jobs()

        scanned = 0
        purged_ids: List[str] = []
        total_freed_bytes = 0

        terminal_statuses = {
            JobStatus.READY,
            JobStatus.READY_WITH_WARNINGS,
            JobStatus.FAILED
        }

        for job in all_jobs:
            scanned += 1
            job_id = job.get("id")
            if not job_id:
                continue

            # Skip if already purged
            if job.get("isPurged", False) or job.get("status") == JobStatus.PURGED:
                continue

            # Only purge completed / terminal jobs
            status = job.get("status")
            if status not in terminal_statuses:
                continue

            tier = job.get("serviceTier", ServiceTier.INSTANT)
            ttl_seconds = cls.get_policy_ttl_seconds(tier)

            expires_at = job.get("retentionExpiresAt")
            if not expires_at:
                updated_at = job.get("updatedAt", job.get("createdAt", now))
                expires_at = updated_at + timedelta(seconds=ttl_seconds)

            # Check expiration
            if now >= expires_at:
                if not dry_run:
                    result = job_store.purge_job(
                        job_id=job_id,
                        actor="retention_daemon",
                        reason=f"Automated retention TTL expired ({ttl_seconds}s limit for {tier} tier)"
                    )
                    total_freed_bytes += result.get("freed_bytes", 0)
                else:
                    # Estimate freed bytes from payload
                    payload = job_store.get_job_payload(job_id) or {}
                    est = len(payload.get("raw_bytes") or b"") + len(payload.get("sanitized_bytes") or b"")
                    total_freed_bytes += est

                purged_ids.append(job_id)

        return RetentionCleanupResponse(
            scanned_jobs=scanned,
            purged_jobs=len(purged_ids),
            freed_bytes=total_freed_bytes,
            purged_job_ids=purged_ids,
            dry_run=dry_run,
            timestamp=now
        )
