import asyncio
from typing import Dict, Optional, List, Any
from datetime import datetime, timezone
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
            updatedAt=d["updatedAt"]
        )

job_store = JobStore()
