import asyncio
from typing import Dict, Optional, List, Any
from datetime import datetime, timezone, timedelta
import uuid
from api.models import (
    JobStatus,
    PageStatus,
    PageKind,
    JobResponse,
    PageModel,
    ServiceTier,
    ErrorDetail
)

class JobStore:
    def __init__(self):
        self._jobs: Dict[str, Dict[str, Any]] = {}
        self._events: Dict[str, List[Dict[str, Any]]] = {}
        self._subscribers: Dict[str, List[asyncio.Queue]] = {}
        self._payloads: Dict[str, Dict[str, Any]] = {}
        self._segments: Dict[str, List[Dict[str, Any]]] = {}
        self._glossaries: Dict[str, List[Dict[str, Any]]] = {}
        self._cost_ledgers: Dict[str, List[Dict[str, Any]]] = {}
        self._rendered_outputs: Dict[str, bytes] = {}
        self._preview_outputs: Dict[str, bytes] = {}
        self._qa_reports: Dict[str, Dict[str, Any]] = {}
        self._notifications: Dict[str, List[Dict[str, Any]]] = {}
        self._s8_records: Dict[str, List[Dict[str, Any]]] = {}
        self._certified_orders: Dict[str, Dict[str, Any]] = {}
        self._audit_logs: Dict[str, List[Dict[str, Any]]] = {}
        self._user_balances: Dict[str, Dict[str, Any]] = {}
        self._purged_records: Dict[str, Dict[str, Any]] = {}

    def set_job_payload(
        self,
        job_id: str,
        raw_bytes: bytes,
        sanitized_bytes: Optional[bytes] = None,
        is_encrypted: bool = False,
        owner_restricted: bool = False
    ):
        self._payloads[job_id] = {
            "raw_bytes": raw_bytes,
            "sanitized_bytes": sanitized_bytes,
            "is_encrypted": is_encrypted,
            "owner_restricted": owner_restricted,
            "owner_confirmed": False
        }

    def get_job_payload(self, job_id: str) -> Optional[Dict[str, Any]]:
        return self._payloads.get(job_id)

    def set_sanitized_bytes(self, job_id: str, sanitized_bytes: bytes):
        if job_id in self._payloads:
            self._payloads[job_id]["sanitized_bytes"] = sanitized_bytes

    def unlock_job(self, job_id: str, sanitized_bytes: bytes, page_count: int) -> Optional[JobResponse]:
        job_data = self._jobs.get(job_id)
        if not job_data:
            return None
        self.set_sanitized_bytes(job_id, sanitized_bytes)
        job_data["status"] = JobStatus.ANALYZING
        job_data["currentStage"] = "analyzing"
        job_data["progress"] = 25
        job_data["pageCount"] = page_count
        job_data["error"] = None
        job_data["updatedAt"] = datetime.now(timezone.utc)
        self.emit_event(job_id, "intake", "JOB_UNLOCKED", "Document unlocked successfully with valid credentials")
        return self._to_response(job_data)

    def confirm_owner_rights(self, job_id: str) -> Optional[JobResponse]:
        job_data = self._jobs.get(job_id)
        if not job_data:
            return None
        if job_id in self._payloads:
            self._payloads[job_id]["owner_confirmed"] = True
        job_data["status"] = JobStatus.ANALYZING
        job_data["currentStage"] = "analyzing"
        job_data["progress"] = 25
        job_data["error"] = None
        job_data["updatedAt"] = datetime.now(timezone.utc)
        self.emit_event(job_id, "intake", "OWNER_CONFIRMED", "Owner permissions confirmed by user. Proceeding with analysis.")
        return self._to_response(job_data)

    def create_job(
        self,
        source_filename: str,
        source_format: str,
        source_lang: str,
        target_lang: str,
        service_tier: ServiceTier = ServiceTier.INSTANT,
        user_id: Optional[str] = None,
        s3_key: Optional[str] = None,
        file_size_bytes: int = 0
    ) -> JobResponse:
        job_id = f"vl_{uuid.uuid4().hex[:12]}"
        now = datetime.now(timezone.utc)
        
        job_data = {
            "id": job_id,
            "status": JobStatus.UPLOADED,
            "currentStage": "uploaded",
            "progress": 0,
            "sourceFilename": source_filename,
            "sourceFormat": source_format,
            "sourceLanguage": source_lang,
            "targetLanguage": target_lang,
            "serviceTier": service_tier,
            "pageCount": 1,
            "pages": [],
            "error": None,
            "downloadUrl": None,
            "previewUrl": None,
            "userId": user_id,
            "s3Key": s3_key,
            "fileSizeBytes": file_size_bytes,
            "createdAt": now,
            "updatedAt": now,
            "stageAttempts": {}
        }
        self._jobs[job_id] = job_data
        self._events[job_id] = []
        self._subscribers[job_id] = []
        
        self.emit_event(job_id, "intake", "STAGE_START", f"Job created for {source_filename}")
        return self._to_response(job_data)

    def get_job(self, job_id: str) -> Optional[JobResponse]:
        job_data = self._jobs.get(job_id)
        if not job_data:
            return None
        return self._to_response(job_data)

    def update_job_stage(
        self,
        job_id: str,
        status: JobStatus,
        stage_name: str,
        progress: int,
        page_count: Optional[int] = None,
        error: Optional[ErrorDetail] = None
    ) -> Optional[JobResponse]:
        job_data = self._jobs.get(job_id)
        if not job_data:
            return None
            
        job_data["status"] = status
        job_data["currentStage"] = stage_name
        job_data["progress"] = progress
        job_data["updatedAt"] = datetime.now(timezone.utc)
        if status in (JobStatus.READY, JobStatus.READY_WITH_WARNINGS, JobStatus.FAILED):
            ttl_seconds = 30 * 86400 if job_data.get("serviceTier") == ServiceTier.CERTIFIED else 86400
            job_data["retentionExpiresAt"] = job_data["updatedAt"] + timedelta(seconds=ttl_seconds)
        if page_count is not None:
            job_data["pageCount"] = page_count
            # Initialize pages if empty
            if not job_data["pages"]:
                job_data["pages"] = [
                    {
                        "pageNumber": i + 1,
                        "kind": PageKind.DIGITAL_TEXT,
                        "status": PageStatus.PENDING,
                        "attempts": 0,
                        "errorCode": None,
                        "errorMessage": None
                    }
                    for i in range(page_count)
                ]
        if error:
            job_data["error"] = error
            
        self.emit_event(job_id, stage_name, "STAGE_PROGRESS", f"Progress: {progress}% - {stage_name}")
        return self._to_response(job_data)

    def update_page_status(
        self,
        job_id: str,
        page_number: int,
        status: PageStatus,
        kind: Optional[PageKind] = None,
        error_code: Optional[str] = None,
        error_message: Optional[str] = None
    ):
        job_data = self._jobs.get(job_id)
        if not job_data:
            return
            
        for p in job_data["pages"]:
            if p["pageNumber"] == page_number:
                p["status"] = status
                p["attempts"] += 1
                if kind:
                    p["kind"] = kind
                if error_code:
                    p["errorCode"] = error_code
                    p["errorMessage"] = error_message
                break
                
        self.emit_event(
            job_id,
            "page_update",
            "PAGE_PROGRESS",
            f"Page {page_number} status: {status.value}",
            {"pageNumber": page_number, "status": status.value}
        )

    def update_page_details(
        self,
        job_id: str,
        page_number: int,
        kind: PageKind,
        status: PageStatus,
        text_layer_confidence: Optional[float] = None,
        is_broken_encoding: bool = False,
        non_text_regions_count: int = 0,
        width: Optional[float] = None,
        height: Optional[float] = None
    ):
        job_data = self._jobs.get(job_id)
        if not job_data:
            return
        for p in job_data["pages"]:
            if p["pageNumber"] == page_number:
                p["status"] = status
                p["kind"] = kind
                p["textLayerConfidence"] = text_layer_confidence
                p["isBrokenEncoding"] = is_broken_encoding
                p["nonTextRegionsCount"] = non_text_regions_count
                p["width"] = width
                p["height"] = height
                break
        self.emit_event(
            job_id,
            "analysis",
            "PAGE_ANALYZED",
            f"Page {page_number} analyzed as {kind.value}",
            {"pageNumber": page_number, "kind": kind.value, "confidence": text_layer_confidence}
        )

    def emit_event(self, job_id: str, stage: str, event_type: str, message: str, data: Optional[Dict[str, Any]] = None):
        event = {
            "jobId": job_id,
            "stage": stage,
            "eventType": event_type,
            "message": message,
            "data": data or {},
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        if job_id in self._events:
            self._events[job_id].append(event)
            
        # Notify active SSE subscribers
        subscribers = self._subscribers.get(job_id, [])
        for queue in list(subscribers):
            try:
                queue.put_nowait(event)
            except Exception:
                pass

    def subscribe(self, job_id: str) -> asyncio.Queue:
        queue = asyncio.Queue()
        if job_id not in self._subscribers:
            self._subscribers[job_id] = []
        self._subscribers[job_id].append(queue)
        return queue

    def unsubscribe(self, job_id: str, queue: asyncio.Queue):
        if job_id in self._subscribers and queue in self._subscribers[job_id]:
            self._subscribers[job_id].remove(queue)

    def set_segments(self, job_id: str, segments: List[Dict[str, Any]]):
        self._segments[job_id] = segments

    def get_segments(self, job_id: str, page_number: Optional[int] = None) -> List[Dict[str, Any]]:
        segs = self._segments.get(job_id, [])
        if page_number is not None:
            return [s for s in segs if s.get("page_number") == page_number]
        return segs

    def update_segment_translation(self, job_id: str, segment_id: str, translated_text: str, engine: str, status: str = "translated"):
        if job_id in self._segments:
            for s in self._segments[job_id]:
                if s.get("id") == segment_id:
                    s["translated_text"] = translated_text
                    s["engine"] = engine
                    s["status"] = status
                    break

    def set_glossary_terms(self, job_id: str, terms: List[Dict[str, Any]]):
        if job_id not in self._glossaries:
            self._glossaries[job_id] = []
        # Add or update terms
        existing_sources = {t["source"].lower(): t for t in self._glossaries[job_id]}
        for term in terms:
            src_key = term["source"].lower()
            if src_key in existing_sources:
                existing_sources[src_key].update(term)
            else:
                self._glossaries[job_id].append(term)
                existing_sources[src_key] = term

    def get_glossary_terms(self, job_id: str) -> List[Dict[str, Any]]:
        return self._glossaries.get(job_id, [])

    def add_cost_entry(self, job_id: str, entry: Dict[str, Any]):
        if job_id not in self._cost_ledgers:
            self._cost_ledgers[job_id] = []
        self._cost_ledgers[job_id].append(entry)

    def get_cost_entries(self, job_id: str) -> List[Dict[str, Any]]:
        return self._cost_ledgers.get(job_id, [])

    def get_cost_summary(self, job_id: str) -> Dict[str, Any]:
        entries = self.get_cost_entries(job_id)
        total_cost = sum(e.get("cost_usd", 0.0) for e in entries)
        total_in = sum(e.get("input_tokens", 0) for e in entries)
        total_out = sum(e.get("output_tokens", 0) for e in entries)
        
        job = self.get_job(job_id)
        page_count = job.pageCount if job else 1
        avg_cost_per_page = total_cost / max(1, page_count)
        
        provider_breakdown: Dict[str, float] = {}
        for e in entries:
            prov = e.get("provider", "unknown")
            provider_breakdown[prov] = provider_breakdown.get(prov, 0.0) + e.get("cost_usd", 0.0)
            
        return {
            "job_id": job_id,
            "total_cost_usd": round(total_cost, 6),
            "total_input_tokens": total_in,
            "total_output_tokens": total_out,
            "average_cost_per_page": round(avg_cost_per_page, 6),
            "provider_breakdown": {k: round(v, 6) for k, v in provider_breakdown.items()}
        }

    def set_rendered_output(self, job_id: str, rendered_bytes: bytes, preview_bytes: Optional[bytes] = None, qa_records: Optional[List[Dict[str, Any]]] = None):
        self._rendered_outputs[job_id] = rendered_bytes
        if preview_bytes:
            self._preview_outputs[job_id] = preview_bytes
        if qa_records:
            self._s8_records[job_id] = qa_records
        job_data = self._jobs.get(job_id)
        if job_data:
            job_data["downloadUrl"] = f"/api/jobs/{job_id}/download"
            job_data["previewUrl"] = f"/api/jobs/{job_id}/preview"

    def get_rendered_output(self, job_id: str) -> Optional[bytes]:
        return self._rendered_outputs.get(job_id)

    def get_preview_output(self, job_id: str) -> Optional[bytes]:
        return self._preview_outputs.get(job_id)

    def set_preview_output(self, job_id: str, preview_bytes: bytes):
        self._preview_outputs[job_id] = preview_bytes

    def get_s8_records(self, job_id: str) -> List[Dict[str, Any]]:
        return self._s8_records.get(job_id, [])

    def update_segment(
        self,
        job_id: str,
        segment_id: str,
        translated_text: str,
        reviewer_edit: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        segments = self._segments.get(job_id, [])
        for seg in segments:
            if seg.get("id") == segment_id or seg.get("block_id") == segment_id:
                seg["translated_text"] = translated_text
                seg["translated_markup"] = translated_text
                seg["status"] = "reviewed"
                if reviewer_edit:
                    seg["reviewer_edit"] = reviewer_edit
                self.emit_event(job_id, "editor", "SEGMENT_UPDATED", f"Segment {segment_id} updated by editor")
                return seg
        return None

    def set_qa_report(self, job_id: str, report: Dict[str, Any]):
        self._qa_reports[job_id] = report

    def get_qa_report(self, job_id: str) -> Optional[Dict[str, Any]]:
        return self._qa_reports.get(job_id)

    def log_notification(self, job_id: str, notification: Dict[str, Any]):
        if job_id not in self._notifications:
            self._notifications[job_id] = []
        self._notifications[job_id].append(notification)

    def get_notifications(self, job_id: str) -> List[Dict[str, Any]]:
        return self._notifications.get(job_id, [])

    def create_certified_order(self, job_id: str, order_data: Dict[str, Any]):
        self._certified_orders[job_id] = order_data
        job = self._jobs.get(job_id)
        if job:
            job["serviceTier"] = ServiceTier.CERTIFIED
            job["updatedAt"] = datetime.now(timezone.utc)
        self.add_audit_entry(
            job_id=job_id,
            reviewer_id="system",
            reviewer_name="System",
            action="order_created",
            details={"purpose": order_data.get("purpose"), "names_count": len(order_data.get("names", []))}
        )
        self.emit_event(job_id, "certified", "ORDER_ENTERED_QUEUE", f"Certified order registered for {job_id}")

    def get_certified_order(self, job_id: str) -> Optional[Dict[str, Any]]:
        return self._certified_orders.get(job_id)

    def list_certified_queue(self) -> List[Dict[str, Any]]:
        queue = []
        for job_id, order in self._certified_orders.items():
            job = self._jobs.get(job_id)
            if not job:
                continue
            qa = self._qa_reports.get(job_id, {})
            queue.append({
                "job_id": job_id,
                "source_filename": job.get("sourceFilename"),
                "source_language": job.get("sourceLanguage"),
                "target_language": job.get("targetLanguage"),
                "page_count": job.get("pageCount", 1),
                "purpose": order.get("purpose", "USCIS"),
                "priority": "expedited" if order.get("expedited") else "standard",
                "qa_status": qa.get("overall_status", job.get("status", "pending")),
                "created_at": order.get("created_at", job.get("createdAt")),
                "status": order.get("status", "pending_review"),
                "names_count": len(order.get("names", []))
            })
        return queue

    def update_certified_order_status(self, job_id: str, status: str):
        if job_id in self._certified_orders:
            self._certified_orders[job_id]["status"] = status

    def add_audit_entry(
        self,
        job_id: str,
        reviewer_id: str,
        reviewer_name: str,
        action: str,
        details: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        if job_id not in self._audit_logs:
            self._audit_logs[job_id] = []
        entry = {
            "id": f"aud_{uuid.uuid4().hex[:12]}",
            "job_id": job_id,
            "reviewer_id": reviewer_id,
            "reviewer_name": reviewer_name,
            "action": action,
            "details": details or {},
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        self._audit_logs[job_id].append(entry)
        self.emit_event(job_id, "certified", "AUDIT_LOG_ENTRY", f"Reviewer {reviewer_name} performed {action}")
        return entry

    def get_audit_trail(self, job_id: str) -> List[Dict[str, Any]]:
        return self._audit_logs.get(job_id, [])

    def record_stage_failure(self, job_id: str, stage: str, error_message: str):
        job = self._jobs.get(job_id)
        if job:
            if "stageAttempts" not in job:
                job["stageAttempts"] = {}
            job["stageAttempts"][stage] = job["stageAttempts"].get(stage, 0) + 1
            self.emit_event(job_id, stage, "STAGE_FAILURE", f"Stage {stage} failed: {error_message}", {"attempt": job["stageAttempts"][stage]})

    def get_stage_attempts(self, job_id: str, stage: str) -> int:
        job = self._jobs.get(job_id)
        if job and "stageAttempts" in job:
            return job["stageAttempts"].get(stage, 0)
        return 0

    def purge_job(
        self,
        job_id: str,
        actor: str = "user",
        reason: str = "User requested immediate deletion"
    ) -> Dict[str, Any]:
        job = self._jobs.get(job_id)
        if not job:
            raise ValueError(f"Job {job_id} not found")

        freed_bytes = 0

        # 1. Purge raw payloads and sanitized buffers
        payload = self._payloads.pop(job_id, None)
        if payload:
            if payload.get("raw_bytes"):
                freed_bytes += len(payload["raw_bytes"])
            if payload.get("sanitized_bytes"):
                freed_bytes += len(payload["sanitized_bytes"])

        # 2. Purge rendered and preview binaries
        rendered = self._rendered_outputs.pop(job_id, None)
        if rendered:
            freed_bytes += len(rendered)
        preview = self._preview_outputs.pop(job_id, None)
        if preview:
            freed_bytes += len(preview)

        # 3. Scrub segment text content (document text is personal data)
        segments = self._segments.get(job_id, [])
        for seg in segments:
            seg["source_text"] = "[PURGED]"
            seg["source_markup"] = "[PURGED]"
            if seg.get("translated_text") is not None:
                seg["translated_text"] = "[PURGED]"
            if seg.get("translated_markup") is not None:
                seg["translated_markup"] = "[PURGED]"
            seg["protected_tokens"] = {}

        # 4. Update job metadata to tombstone status
        now = datetime.now(timezone.utc)
        job["isPurged"] = True
        job["purgedAt"] = now
        job["status"] = JobStatus.PURGED
        job["currentStage"] = "purged"
        job["downloadUrl"] = None
        job["previewUrl"] = None
        job["updatedAt"] = now

        # 5. Log audit trail entry without personal data
        self.add_audit_entry(
            job_id=job_id,
            reviewer_id=actor,
            reviewer_name=actor,
            action="job_purged",
            details={
                "freed_bytes": freed_bytes,
                "reason": reason,
                "page_count": job.get("pageCount", 1),
                "source_format": job.get("sourceFormat")
            }
        )

        self._purged_records[job_id] = {
            "job_id": job_id,
            "purged_at": now.isoformat(),
            "freed_bytes": freed_bytes,
            "actor": actor,
            "reason": reason
        }

        self.emit_event(job_id, "retention", "JOB_PURGED", f"Job {job_id} payloads and text scrubbed. {freed_bytes} bytes freed.")

        return {
            "job_id": job_id,
            "purged": True,
            "freed_bytes": freed_bytes,
            "purged_at": now
        }

    def get_retention_info(self, job_id: str) -> Optional[Dict[str, Any]]:
        job = self._jobs.get(job_id)
        if not job:
            return None

        tier = job.get("serviceTier", ServiceTier.INSTANT)
        policy_ttl = 30 * 86400 if tier == ServiceTier.CERTIFIED else 86400

        is_purged = job.get("isPurged", False)
        purged_at = job.get("purgedAt")
        expires_at = job.get("retentionExpiresAt")

        now = datetime.now(timezone.utc)
        seconds_remaining = None
        if expires_at and not is_purged:
            seconds_remaining = max(0, int((expires_at - now).total_seconds()))

        return {
            "job_id": job_id,
            "service_tier": tier,
            "status": job.get("status"),
            "is_purged": is_purged,
            "purged_at": purged_at,
            "retention_expires_at": expires_at,
            "seconds_remaining": seconds_remaining,
            "policy_ttl_seconds": policy_ttl
        }

    def get_all_jobs(self) -> List[Dict[str, Any]]:
        return list(self._jobs.values())

    def get_user_balance(self, user_id: str) -> Dict[str, Any]:
        if user_id not in self._user_balances:
            self._user_balances[user_id] = {
                "user_id": user_id,
                "credits_available": 10,
                "credits_reserved": 0,
                "lifetime_pages_used": 0
            }
        return self._user_balances[user_id]

    def add_user_credits(self, user_id: str, credits: int):
        bal = self.get_user_balance(user_id)
        bal["credits_available"] += credits

    def count_active_jobs_for_user(self, user_id: str) -> int:
        count = 0
        terminal = (JobStatus.READY, JobStatus.READY_WITH_WARNINGS, JobStatus.FAILED, JobStatus.PURGED)
        for job in self._jobs.values():
            if job.get("userId") == user_id and job.get("status") not in terminal:
                count += 1
        return count

    def _to_response(self, d: Dict[str, Any]) -> JobResponse:
        pages = [PageModel(**p) for p in d.get("pages", [])]
        return JobResponse(
            id=d["id"],
            status=d["status"],
            currentStage=d["currentStage"],
            progress=d["progress"],
            sourceFilename=d["sourceFilename"],
            sourceFormat=d["sourceFormat"],
            sourceLanguage=d["sourceLanguage"],
            targetLanguage=d["targetLanguage"],
            serviceTier=d["serviceTier"],
            pageCount=d["pageCount"],
            pages=pages,
            error=d.get("error"),
            downloadUrl=d.get("downloadUrl"),
            previewUrl=d.get("previewUrl"),
            createdAt=d["createdAt"],
            updatedAt=d["updatedAt"],
            isPurged=d.get("isPurged", False),
            purgedAt=d.get("purgedAt"),
            retentionExpiresAt=d.get("retentionExpiresAt")
        )

job_store = JobStore()
