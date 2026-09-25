import json
import asyncio
import os
from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Depends, Request, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse, Response
from typing import Optional, List, Dict, Any

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
    ErrorDetail,
    GlossaryTermModel,
    SegmentModel,
    CostLedgerEntryModel,
    CostSummaryResponse,
    TranslateJobRequest,
    UpdateSegmentRequest,
    ReRenderPageRequest,
    QAPageResultModel,
    QADocumentReportResponse,
    CertifiedOrderRequest,
    CertifiedApprovalRequest,
    CertifiedQueueItem,
    ReviewAuditEntry,
    RetentionInfoResponse,
    RetentionCleanupResponse,
    ImmediateDeletionResponse,
    CommercialPlanModel,
    PricingCalculateRequest,
    PricingCalculateResponse,
    CheckoutSessionRequest,
    CheckoutSessionResponse,
    AccountBalanceResponse
)
from api.intake import run_intake_security_check, unlock_and_sanitize_pdf, IntakeError
from api.analyze import analyze_pdf_document, analyze_image_document
from api.translate import translate_document_pipeline, TranslationRouter
from api.render import reconstruct_document
from api.qa import QualityAssuranceEngine
from api.certified import CertifiedWorkflowManager
from api.notifications import NotificationService
from api.retention import RetentionPolicyManager
from api.commercial import CommercialBillingService
from api.monitoring import SystemMonitor
from api.backup import BackupManager
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
    elif job.sourceFormat.lower() == "docx":
        from api.docx_pipeline import DocxPipeline
        analysis = DocxPipeline.extract_docx_analysis(bytes_to_analyze, filename=job.sourceFilename)
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
    elif job.sourceFormat.lower() in ("jpg", "jpeg", "png"):
        analysis = analyze_image_document(bytes_to_analyze, filename=job.sourceFilename)
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
        # Generic fallback
        job_store.update_page_status(
            job_id=job_id,
            page_number=1,
            status=PageStatus.ANALYZED,
            kind=PageKind.DIGITAL_TEXT
        )

    job_store.update_job_stage(
        job_id=job_id,
        status=JobStatus.TRANSLATING,
        stage_name="translating",
        progress=45
    )
    return job_store.get_job(job_id)

@app.post("/api/jobs/{job_id}/translate", response_model=JobResponse)
async def translate_job_content(job_id: str, req: Optional[TranslateJobRequest] = None):
    job = job_store.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    payload = job_store.get_job_payload(job_id)
    if not payload:
        raise HTTPException(status_code=400, detail="No document payload cached for this job")

    bytes_to_translate = payload.get("sanitized_bytes") or payload.get("raw_bytes")
    if not bytes_to_translate:
        raise HTTPException(status_code=400, detail="Empty document payload")

    # Analyze if not already analyzed
    if job.sourceFormat.lower() == "docx":
        from api.docx_pipeline import DocxPipeline
        analysis = DocxPipeline.extract_docx_analysis(bytes_to_translate, filename=job.sourceFilename)
    elif job.sourceFormat.lower() in ("jpg", "jpeg", "png"):
        analysis = analyze_image_document(bytes_to_translate, filename=job.sourceFilename)
    else:
        analysis = analyze_pdf_document(bytes_to_translate, filename=job.sourceFilename)

    user_names = req.user_names if req else None
    user_glossary = req.user_glossary if req else None

    # Run translation pipeline
    await translate_document_pipeline(
        job_id=job_id,
        analysis=analysis,
        source_lang=job.sourceLanguage,
        target_lang=job.targetLanguage,
        user_names=user_names,
        user_glossary=user_glossary
    )

    return job_store.get_job(job_id)

@app.post("/api/jobs/{job_id}/render", response_model=JobResponse)
async def render_job_document(job_id: str, auto_qa: bool = False):
    job = job_store.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    payload = job_store.get_job_payload(job_id)
    if not payload:
        raise HTTPException(status_code=400, detail="No document payload cached for this job")

    bytes_to_render = payload.get("sanitized_bytes") or payload.get("raw_bytes")
    if not bytes_to_render:
        raise HTTPException(status_code=400, detail="Empty document payload")

    # Update to rendering stage
    job_store.update_job_stage(
        job_id=job_id,
        status=JobStatus.RENDERING,
        stage_name="rendering",
        progress=70
    )

    # Perform analysis if not present
    if job.sourceFormat.lower() == "docx":
        from api.docx_pipeline import DocxPipeline
        analysis = DocxPipeline.extract_docx_analysis(bytes_to_render, filename=job.sourceFilename)
    elif job.sourceFormat.lower() in ("jpg", "jpeg", "png"):
        analysis = analyze_image_document(bytes_to_render, filename=job.sourceFilename)
    else:
        analysis = analyze_pdf_document(bytes_to_render, filename=job.sourceFilename)
    translated_segments = job_store.get_segments(job_id)

    rendered_bytes, preview_bytes, qa_records = reconstruct_document(
        original_bytes=bytes_to_render,
        file_format=job.sourceFormat,
        analysis=analysis,
        translated_segments=translated_segments,
        target_lang=job.targetLanguage
    )

    # Store outputs
    job_store.set_rendered_output(job_id, rendered_bytes, preview_bytes, qa_records=qa_records)

    # Update pages to rendered
    for rec in qa_records:
        p_no = rec.get("page_number", 1)
        job_store.update_page_status(
            job_id=job_id,
            page_number=p_no,
            status=PageStatus.RENDERED
        )

    # Advance to QA stage
    job_store.update_job_stage(
        job_id=job_id,
        status=JobStatus.QA,
        stage_name="qa",
        progress=85
    )

    if auto_qa:
        await run_job_qa_stage(job_id)

    return job_store.get_job(job_id)


async def run_job_qa_stage(job_id: str):
    job = job_store.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    payload = job_store.get_job_payload(job_id)
    if not payload:
        raise HTTPException(status_code=400, detail="No document payload cached for this job")

    bytes_to_render = payload.get("sanitized_bytes") or payload.get("raw_bytes")
    rendered_bytes = job_store.get_rendered_output(job_id)
    if not rendered_bytes:
        raise HTTPException(status_code=400, detail="Document must be rendered before running QA")

    if job.sourceFormat.lower() == "docx":
        from api.docx_pipeline import DocxPipeline
        analysis = DocxPipeline.extract_docx_analysis(bytes_to_render, filename=job.sourceFilename)
    elif job.sourceFormat.lower() in ("jpg", "jpeg", "png"):
        analysis = analyze_image_document(bytes_to_render, filename=job.sourceFilename)
    else:
        analysis = analyze_pdf_document(bytes_to_render, filename=job.sourceFilename)

    translated_segments = job_store.get_segments(job_id)
    s8_qa_records = job_store.get_s8_records(job_id)

    # Run Stage S9 Automated Quality Assurance Engine
    qa_report = QualityAssuranceEngine.evaluate_document(
        job_id=job_id,
        original_bytes=bytes_to_render,
        rendered_bytes=rendered_bytes,
        file_format=job.sourceFormat,
        analysis=analysis,
        translated_segments=translated_segments,
        target_lang=job.targetLanguage,
        s8_qa_records=s8_qa_records
    )
    job_store.set_qa_report(job_id, qa_report.model_dump())

    # Update per-page statuses according to QA verdict
    for p_res in qa_report.pages:
        job_store.update_page_status(
            job_id=job_id,
            page_number=p_res.page_number,
            status=p_res.status,
            error_code=p_res.error_code,
            error_message=p_res.error_message
        )

    # Finalize job status from QA report
    job_store.update_job_stage(
        job_id=job_id,
        status=qa_report.overall_status,
        stage_name="qa_complete",
        progress=100
    )

    # Trigger job completion notification
    all_warnings = qa_report.global_warnings + [
        w for p in qa_report.pages for w in p.warnings
    ]
    notif = NotificationService.send_job_completed_email(
        job_id=job_id,
        recipient="user@example.com",
        filename=job.sourceFilename,
        download_url=f"/api/jobs/{job_id}/download",
        qa_status=qa_report.overall_status.value,
        warnings=all_warnings[:5],
        service_tier=job.serviceTier.value
    )
    job_store.log_notification(job_id, notif.model_dump())
    job_store.emit_event(
        job_id=job_id,
        stage="qa",
        event_type="QA_COMPLETED",
        message=f"QA Stage complete: status is {qa_report.overall_status.value}",
        data={
            "overall_status": qa_report.overall_status.value,
            "passed": qa_report.passed_count,
            "warnings": qa_report.warning_count,
            "failed": qa_report.failed_count
        }
    )
    return qa_report

@app.post("/api/jobs/{job_id}/qa", response_model=QADocumentReportResponse)
async def execute_job_qa(job_id: str):
    qa_report = await run_job_qa_stage(job_id)
    return QADocumentReportResponse(**qa_report.model_dump())

@app.get("/api/jobs/{job_id}/qa", response_model=QADocumentReportResponse)
async def get_job_qa_report(job_id: str):
    job = job_store.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    qa_report = job_store.get_qa_report(job_id)
    if not qa_report:
        if job_store.get_rendered_output(job_id):
            qa_res = await run_job_qa_stage(job_id)
            return QADocumentReportResponse(**qa_res.model_dump())
        raise HTTPException(status_code=404, detail="QA report not yet generated for this job")
    return QADocumentReportResponse(**qa_report)

@app.get("/api/jobs/{job_id}/download")
async def download_rendered_document(job_id: str):
    job = job_store.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    rendered = job_store.get_rendered_output(job_id)
    if not rendered:
        raise HTTPException(status_code=404, detail="Rendered output not available for this job")

    fmt = job.sourceFormat.lower()
    media_types = {
        "pdf": "application/pdf",
        "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "png": "image/png",
        "jpg": "image/jpeg",
        "jpeg": "image/jpeg"
    }
    media_type = media_types.get(fmt, "application/octet-stream")
    ext = fmt if fmt != "jpeg" else "jpg"
    filename = f"translated_{os.path.splitext(job.sourceFilename)[0]}.{ext}"

    return Response(
        content=rendered,
        media_type=media_type,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )

@app.get("/api/jobs/{job_id}/preview")
async def get_rendered_preview(job_id: str, page: int = 1):
    job = job_store.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    rendered = job_store.get_rendered_output(job_id)
    if not rendered:
        preview = job_store.get_preview_output(job_id)
        if not preview:
            raise HTTPException(status_code=404, detail="Preview not available for this job")
        return Response(content=preview, media_type="image/jpeg")

    # If page > 1 and PDF, generate specific page preview
    if job.sourceFormat.lower() == "pdf" and page > 1:
        from api.render import PreviewGenerator
        page_preview = PreviewGenerator.generate_watermarked_preview(rendered, format_hint="pdf", page_number=page)
        return Response(content=page_preview, media_type="image/jpeg")

    preview = job_store.get_preview_output(job_id)
    if not preview:
        from api.render import PreviewGenerator
        preview = PreviewGenerator.generate_watermarked_preview(rendered, format_hint=job.sourceFormat.lower(), page_number=page)
    return Response(content=preview, media_type="image/jpeg")

@app.get("/api/jobs/{job_id}/qa", response_model=QADocumentReportResponse)
async def get_job_qa_report(job_id: str):
    job = job_store.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    qa_report = job_store.get_qa_report(job_id)
    if not qa_report:
        raise HTTPException(status_code=404, detail="QA report not yet generated for this job")
    return QADocumentReportResponse(**qa_report)

@app.patch("/api/jobs/{job_id}/segments/{segment_id}")
async def update_segment_text(job_id: str, segment_id: str, req: UpdateSegmentRequest):
    job = job_store.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    seg = job_store.update_segment(job_id, segment_id, req.translated_text, req.reviewer_edit)
    if not seg:
        raise HTTPException(status_code=404, detail="Segment not found")
    return {"job_id": job_id, "segment": seg}

@app.post("/api/jobs/{job_id}/pages/{page_no}/re-render")
async def rerender_single_page(job_id: str, page_no: int):
    job = job_store.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    payload = job_store.get_job_payload(job_id)
    if not payload:
        raise HTTPException(status_code=400, detail="No document payload cached for this job")

    bytes_to_render = payload.get("sanitized_bytes") or payload.get("raw_bytes")
    if not bytes_to_render:
        raise HTTPException(status_code=400, detail="Empty document payload")

    if job.sourceFormat.lower() == "docx":
        from api.docx_pipeline import DocxPipeline
        analysis = DocxPipeline.extract_docx_analysis(bytes_to_render, filename=job.sourceFilename)
    else:
        analysis = analyze_pdf_document(bytes_to_render, filename=job.sourceFilename)

    translated_segments = job_store.get_segments(job_id)

    # Reconstruct document with updated segments
    rendered_bytes, preview_bytes, qa_records = reconstruct_document(
        original_bytes=bytes_to_render,
        file_format=job.sourceFormat,
        analysis=analysis,
        translated_segments=translated_segments,
        target_lang=job.targetLanguage
    )

    job_store.set_rendered_output(job_id, rendered_bytes, preview_bytes)

    # Re-evaluate S9 QA
    qa_report = QualityAssuranceEngine.evaluate_document(
        job_id=job_id,
        original_bytes=bytes_to_render,
        rendered_bytes=rendered_bytes,
        file_format=job.sourceFormat,
        analysis=analysis,
        translated_segments=translated_segments,
        target_lang=job.targetLanguage,
        s8_qa_records=qa_records
    )
    job_store.set_qa_report(job_id, qa_report.model_dump())

    # Find the specific page QA result
    target_page_qa = next((p for p in qa_report.pages if p.page_number == page_no), None)
    if target_page_qa:
        job_store.update_page_status(
            job_id=job_id,
            page_number=page_no,
            status=target_page_qa.status,
            error_code=target_page_qa.error_code,
            error_message=target_page_qa.error_message
        )

    job_store.emit_event(
        job_id=job_id,
        stage="render",
        event_type="PAGE_RERENDERED",
        message=f"Page {page_no} successfully re-rendered in seconds",
        data={"page_number": page_no, "status": target_page_qa.status.value if target_page_qa else "unknown"}
    )

    return {
        "job_id": job_id,
        "page_number": page_no,
        "status": target_page_qa.status.value if target_page_qa else "qa_passed",
        "warnings": target_page_qa.warnings if target_page_qa else [],
        "preview_url": f"/api/jobs/{job_id}/preview?page={page_no}",
        "download_url": f"/api/jobs/{job_id}/download"
    }

@app.get("/api/jobs/{job_id}/notifications")
async def get_job_notifications(job_id: str):
    job = job_store.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    notifs = job_store.get_notifications(job_id)
    return {"job_id": job_id, "notifications": notifs}

@app.get("/api/jobs/{job_id}/glossary")
async def get_job_glossary(job_id: str):
    job = job_store.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return {"job_id": job_id, "terms": job_store.get_glossary_terms(job_id)}

@app.post("/api/jobs/{job_id}/glossary")
async def add_job_glossary(job_id: str, request: Request):
    job = job_store.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    data = await request.json()
    if isinstance(data, list):
        terms = [GlossaryTermModel(**item) for item in data]
    elif isinstance(data, dict) and "terms" in data:
        terms = [GlossaryTermModel(**item) for item in data["terms"]]
    else:
        raise HTTPException(status_code=422, detail="Invalid glossary payload format")
    job_store.set_glossary_terms(job_id, [t.model_dump() for t in terms])
    return {"job_id": job_id, "terms": job_store.get_glossary_terms(job_id)}

@app.get("/api/jobs/{job_id}/segments")
async def get_job_segments(job_id: str, page: Optional[int] = None):
    job = job_store.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    segments = job_store.get_segments(job_id, page_number=page)
    return {"job_id": job_id, "count": len(segments), "segments": segments}

@app.get("/api/jobs/{job_id}/costs", response_model=CostSummaryResponse)
async def get_job_costs(job_id: str):
    job = job_store.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    summary = job_store.get_cost_summary(job_id)
    return CostSummaryResponse(**summary)

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

# ---------------------------------------------------------------------------
# Certified Mode & Reviewer Workbench Endpoints (Milestone 8)
# ---------------------------------------------------------------------------

@app.post("/api/jobs/{job_id}/certified/order")
async def create_certified_translation_order(job_id: str, req: CertifiedOrderRequest):
    try:
        order = CertifiedWorkflowManager.create_certified_order(job_id, req)
        return {"job_id": job_id, "order": order}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/certified/queue", response_model=List[CertifiedQueueItem])
async def list_certified_reviewer_queue():
    items = job_store.list_certified_queue()
    return [CertifiedQueueItem(**i) for i in items]

@app.get("/api/jobs/{job_id}/certified/review")
async def get_certified_reviewer_workbench(job_id: str):
    try:
        workbench = CertifiedWorkflowManager.get_reviewer_workbench(job_id)
        return workbench
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/jobs/{job_id}/certified/approve")
async def approve_and_certify_document(job_id: str, req: CertifiedApprovalRequest):
    try:
        result = CertifiedWorkflowManager.approve_and_certify(job_id, req)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/jobs/{job_id}/certified/audit")
async def get_certified_audit_trail(job_id: str):
    job = job_store.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    audit_trail = job_store.get_audit_trail(job_id)
    return {"job_id": job_id, "audit_trail": audit_trail}

# ---------------------------------------------------------------------------
# Stage S10: Retention & Deletion Lifecycle Endpoints (Milestone 9)
# ---------------------------------------------------------------------------

@app.delete("/api/jobs/{job_id}", response_model=ImmediateDeletionResponse)
async def delete_job_immediate(job_id: str):
    job = job_store.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    try:
        res = RetentionPolicyManager.immediate_purge(job_id=job_id, actor="user", reason="User requested immediate deletion")
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/jobs/{job_id}/retention", response_model=RetentionInfoResponse)
async def get_job_retention_status(job_id: str):
    job = job_store.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    info = RetentionPolicyManager.get_retention_info(job_id)
    if not info:
        raise HTTPException(status_code=404, detail="Retention info not found")
    return info

@app.post("/api/admin/retention/cleanup", response_model=RetentionCleanupResponse)
async def run_retention_cleanup_sweep(dry_run: bool = False):
    try:
        report = RetentionPolicyManager.cleanup_expired_jobs(dry_run=dry_run)
        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ---------------------------------------------------------------------------
# Commercial Plans, Pricing, Checkout & Stripe Webhooks (Milestone 9)
# ---------------------------------------------------------------------------

@app.get("/api/pricing/plans", response_model=List[CommercialPlanModel])
async def list_commercial_pricing_plans():
    return CommercialBillingService.get_plans()

@app.post("/api/pricing/calculate", response_model=PricingCalculateResponse)
async def calculate_translation_pricing(req: PricingCalculateRequest):
    return CommercialBillingService.calculate_pricing(req)

@app.post("/api/billing/checkout", response_model=CheckoutSessionResponse)
async def create_checkout_session(req: CheckoutSessionRequest):
    try:
        session = CommercialBillingService.create_checkout_session(req)
        return session
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/webhooks/stripe")
async def handle_stripe_webhook_event(request: Request):
    try:
        payload = await request.json()
        result = CommercialBillingService.handle_stripe_webhook(payload)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/accounts/{user_id}/balance", response_model=AccountBalanceResponse)
async def get_user_account_balance(user_id: str):
    return CommercialBillingService.get_account_balance(user_id)

# ---------------------------------------------------------------------------
# Milestone 10: Production Hardening, Deep Telemetry & Snapshots
# ---------------------------------------------------------------------------

@app.get("/health/deep")
async def deep_health_check():
    return SystemMonitor.get_deep_health()

@app.post("/api/admin/backup/snapshot")
async def create_system_snapshot(tag: str = "manual"):
    try:
        res = BackupManager.create_snapshot(tag=tag)
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/admin/backup/list")
async def list_system_snapshots():
    return BackupManager.list_snapshots()

@app.post("/api/admin/backup/verify")
async def verify_system_snapshot(filename: str):
    try:
        return BackupManager.verify_snapshot_integrity(filename)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Snapshot not found")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


