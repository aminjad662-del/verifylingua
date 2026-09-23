import json
import asyncio
from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from typing import Optional

from api.config import settings
from api.models import (
    JobStatus,
    PageStatus,
    PageKind,
    CreateJobRequest,
    JobResponse,
    PresignUploadRequest,
    PresignUploadResponse,
    PasswordSubmitRequest,
    OwnerConfirmRequest,
    ErrorDetail
)
from api.intake import run_intake_security_check, unlock_and_sanitize_pdf, IntakeError
from api.analyze import analyze_pdf_document
from api.store import job_store

app = FastAPI(
    title="VerifyLingua Document Processing API",
    description="High-fidelity layout-preserving document translation service API",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "service": "verifylingua-api",
        "environment": settings.ENV,
        "limits": {
            "maxFileSizeBytes": settings.MAX_FILE_SIZE_BYTES,
            "maxPages": settings.MAX_PAGES,
            "maxImageMegapixels": settings.MAX_IMAGE_MEGAPIXELS
        }
    }

@app.post("/api/upload/presign", response_model=PresignUploadResponse)
async def presign_upload(req: PresignUploadRequest):
    if req.fileSizeBytes > settings.MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=413,
            detail={
                "error": {
                    "code": "E_FILE_TOO_LARGE",
                    "message": f"File exceeds {settings.MAX_FILE_SIZE_BYTES // (1024*1024)} MB limit.",
                    "action": "Compress document before uploading.",
                    "stage": "intake"
                }
            }
        )
    # Generate direct or S3-compatible key
    s3_key = f"uploads/{req.filename}"
    upload_url = f"/api/upload/direct?key={s3_key}"
    return PresignUploadResponse(
        uploadUrl=upload_url,
        s3Key=s3_key,
        expiresInSeconds=900
    )

@app.post("/api/jobs", response_model=JobResponse)
async def create_job(req: CreateJobRequest):
    job = job_store.create_job(
        source_filename=req.sourceFilename,
        source_format=req.sourceFormat,
        source_lang=req.sourceLanguage,
        target_lang=req.targetLanguage,
        service_tier=req.serviceTier,
        user_id=req.userId,
        s3_key=req.s3Key,
        file_size_bytes=req.fileSizeBytes or 0
    )
    return job

@app.post("/api/jobs/{job_id}/intake", response_model=JobResponse)
async def process_job_intake(
    job_id: str,
    file: UploadFile = File(...),
    declared_format: Optional[str] = Form(None)
):
    job = job_store.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    file_bytes = await file.read()
    fmt = declared_format or job.sourceFormat

    job_store.update_job_stage(
        job_id=job_id,
        status=JobStatus.VALIDATING,
        stage_name="validating",
        progress=15
    )

    try:
        meta = run_intake_security_check(file_bytes, file.filename or job.sourceFilename, fmt)
        page_count = meta.get("page_count", 1)
        
        # Save raw and sanitized bytes
        job_store.set_job_payload(
            job_id,
            raw_bytes=file_bytes,
            sanitized_bytes=meta.get("sanitized_bytes"),
            is_encrypted=meta.get("is_encrypted", False),
            owner_restricted=meta.get("owner_restricted", False)
        )

        if meta.get("owner_restricted"):
            job_store.update_job_stage(
                job_id=job_id,
                status=JobStatus.NEEDS_OWNER_CONFIRMATION,
                stage_name="intake",
                progress=20,
                page_count=page_count
            )
            return job_store.get_job(job_id)

        job_store.update_job_stage(
            job_id=job_id,
            status=JobStatus.ANALYZING,
            stage_name="analyzing",
            progress=30,
            page_count=page_count
        )

        # Mark initial pages analyzed
        for i in range(page_count):
            kind = PageKind.IMAGE_ONLY if meta["format"] in ("jpg", "png") else PageKind.DIGITAL_TEXT
            job_store.update_page_status(job_id, i + 1, PageStatus.ANALYZED, kind=kind)

        updated_job = job_store.get_job(job_id)
        return updated_job

    except IntakeError as err:
        error_detail = ErrorDetail(
            code=err.code,
            message=err.message,
            action=err.action,
            stage="intake",
            details={}
        )
        if err.code == "E_PDF_PASSWORD":
            job_store.set_job_payload(
                job_id,
                raw_bytes=file_bytes,
                is_encrypted=True,
                owner_restricted=False
            )
            job_store.update_job_stage(
                job_id=job_id,
                status=JobStatus.NEEDS_PASSWORD,
                stage_name="intake",
                progress=20,
                error=error_detail
            )
            return JSONResponse(
                status_code=401,
                content={"error": error_detail.model_dump()}
            )

        job_store.update_job_stage(
            job_id=job_id,
            status=JobStatus.FAILED,
            stage_name="intake",
            progress=0,
            error=error_detail
        )
        return JSONResponse(
            status_code=err.http_status,
            content={"error": error_detail.model_dump()}
        )

@app.post("/api/jobs/{job_id}/password", response_model=JobResponse)
async def submit_job_password(job_id: str, req: PasswordSubmitRequest):
    job = job_store.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    payload = job_store.get_job_payload(job_id)
    if not payload or not payload.get("raw_bytes"):
        raise HTTPException(status_code=400, detail="No document payload cached for this job")

    try:
        meta = unlock_and_sanitize_pdf(payload["raw_bytes"], password=req.password)
        unlocked = job_store.unlock_job(job_id, meta["sanitized_bytes"], meta["page_count"])
        return unlocked
    except IntakeError as err:
        error_detail = ErrorDetail(
            code=err.code,
            message=err.message,
            action=err.action,
            stage="intake"
        )
        return JSONResponse(
            status_code=401 if err.code == "E_PDF_PASSWORD" else err.http_status,
            content={"error": error_detail.model_dump()}
        )

@app.post("/api/jobs/{job_id}/confirm-owner-rights", response_model=JobResponse)
async def confirm_owner_rights(job_id: str, req: OwnerConfirmRequest):
    job = job_store.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if not req.confirmed:
        raise HTTPException(status_code=400, detail="Owner confirmation must be affirmative")
    confirmed_job = job_store.confirm_owner_rights(job_id)
    return confirmed_job

@app.post("/api/jobs/{job_id}/analyze", response_model=JobResponse)
async def analyze_job_layout(job_id: str):
    job = job_store.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    payload = job_store.get_job_payload(job_id)
    if not payload:
        raise HTTPException(status_code=400, detail="No document payload cached for this job")

    bytes_to_analyze = payload.get("sanitized_bytes") or payload.get("raw_bytes")
    if not bytes_to_analyze:
        raise HTTPException(status_code=400, detail="Empty document payload")

    if job.sourceFormat.lower() == "pdf":
        analysis = analyze_pdf_document(bytes_to_analyze, filename=job.sourceFilename)
        for page_data in analysis.pages:
            job_store.update_page_details(
                job_id=job_id,
                page_number=page_data.page_number,
                kind=PageKind(page_data.kind),
                status=PageStatus.ANALYZED,
                text_layer_confidence=page_data.text_layer_trustworthiness,
                is_broken_encoding=page_data.is_broken_encoding,
                non_text_regions_count=len(page_data.non_text_regions),
                width=page_data.width,
                height=page_data.height
            )
    else:
        # Single-page image or DOCX
        kind = PageKind.IMAGE_ONLY if job.sourceFormat.lower() in ("jpg", "png") else PageKind.DIGITAL_TEXT
        job_store.update_page_status(
            job_id=job_id,
            page_number=1,
            status=PageStatus.ANALYZED,
            kind=kind
        )

    job_store.update_job_stage(
        job_id=job_id,
        status=JobStatus.TRANSLATING,
        stage_name="translating",
        progress=45
    )
    return job_store.get_job(job_id)

@app.get("/api/jobs/{job_id}", response_model=JobResponse)
async def get_job_status(job_id: str):
    job = job_store.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

@app.get("/api/jobs/{job_id}/events")
async def stream_job_events(job_id: str, request: Request):
    job = job_store.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    async def event_generator():
        queue = job_store.subscribe(job_id)
        try:
            # Yield initial state
            initial_data = json.dumps({"type": "INIT", "job": job.dict()}, default=str)
            yield f"data: {initial_data}\n\n"

            while True:
                if await request.is_disconnected():
                    break
                try:
                    event = await asyncio.wait_for(queue.get(), timeout=15.0)
                    yield f"data: {json.dumps(event, default=str)}\n\n"
                except asyncio.TimeoutError:
                    # Keep-alive heartbeat
                    yield ": heartbeat\n\n"
        finally:
            job_store.unsubscribe(job_id, queue)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )
