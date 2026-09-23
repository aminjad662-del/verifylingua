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
    ErrorDetail
)
from api.intake import run_intake_security_check, IntakeError
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
