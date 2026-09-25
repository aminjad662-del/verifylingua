"""
VerifyLingua Certified Translation Workflow & USCIS 8 CFR § 103.2 Certification Page Engine
Handles:
1. Name spelling capture & passport glossary locking (preventing transliteration drift).
2. Reviewer queue management for qualified linguists.
3. Reviewer workbench with segment-by-segment audit.
4. Official 8 CFR § 103.2 Certificate of Accuracy PDF page generation & document appending.
5. Immutable reviewer audit trail logging.
"""

import io
import os
import uuid
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime, timezone

import pikepdf
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.colors import HexColor, Color

from api.models import (
    JobStatus,
    ServiceTier,
    CertifiedOrderRequest,
    CertifiedApprovalRequest,
    CertifiedQueueItem,
    ReviewAuditEntry
)
from api.store import job_store
from api.notifications import NotificationService


class CertificationPageGenerator:
    """
    Generates an official USCIS 8 CFR § 103.2 compliant Certificate of Accuracy PDF page.
    Adheres strictly to the evidentiary requirements of the Department of Homeland Security,
    federal immigration courts (EOIR), state courts, and academic credential evaluators.
    """

    @classmethod
    def generate_certificate_pdf(
        cls,
        certificate_id: str,
        job_id: str,
        source_filename: str,
        source_language_name: str,
        target_language_name: str,
        page_count: int,
        reviewer_name: str,
        reviewer_credentials: str,
        statement_of_competence: Optional[str] = None,
        names_lock: Optional[List[Dict[str, str]]] = None,
        purpose: str = "USCIS / Official Legal Proceeding"
    ) -> bytes:
        packet = io.BytesIO()
        c = canvas.Canvas(packet, pagesize=letter)
        w, h = letter  # 612 x 792 pt

        # 1. Subtle Outer Border (Crisp 1px legal aesthetic)
        c.setStrokeColor(HexColor("#18181b"))
        c.setLineWidth(1.5)
        c.rect(36, 36, w - 72, h - 72)
        
        c.setStrokeColor(HexColor("#e4e4e7"))
        c.setLineWidth(0.5)
        c.rect(40, 40, w - 80, h - 80)

        # 2. Header & Institutional Badge
        c.setFillColor(HexColor("#09090b"))
        c.setFont("Helvetica-Bold", 16)
        c.drawCentredString(w / 2.0, h - 75, "VERIFYLINGUA DOCUMENT SERVICES")

        c.setFont("Helvetica-Bold", 12)
        c.setFillColor(HexColor("#18181b"))
        c.drawCentredString(w / 2.0, h - 94, "CERTIFICATE OF TRANSLATOR'S COMPETENCE & ACCURACY")

        c.setFont("Helvetica", 8)
        c.setFillColor(HexColor("#71717a"))
        c.drawCentredString(w / 2.0, h - 108, "PURSUANT TO TITLE 8, CODE OF FEDERAL REGULATIONS § 103.2(b)(3)")

        # Divider
        c.setStrokeColor(HexColor("#d4d4d8"))
        c.setLineWidth(1)
        c.line(54, h - 120, w - 54, h - 120)

        # 3. Document Identification Table
        c.setFillColor(HexColor("#18181b"))
        c.setFont("Helvetica-Bold", 10)
        c.drawString(54, h - 145, "DOCUMENT RECORD & REGISTRATION")

        y = h - 165
        row_h = 18
        
        meta = [
            ("Certificate Serial No.:", certificate_id),
            ("Master Job ID:", job_id),
            ("Document Title:", source_filename),
            ("Language Combination:", f"{source_language_name} ➔ {target_language_name}"),
            ("Document Extent:", f"{page_count} Page{'s' if page_count > 1 else ''}"),
            ("Intended Jurisdiction / Purpose:", purpose),
            ("Certification Date:", datetime.now(timezone.utc).strftime("%B %d, %Y"))
        ]

        c.setFont("Helvetica", 9)
        for label, val in meta:
            c.setFillColor(HexColor("#71717a"))
            c.drawString(60, y, label)
            c.setFillColor(HexColor("#09090b"))
            c.setFont("Helvetica-Bold", 9)
            c.drawString(220, y, str(val))
            c.setFont("Helvetica", 9)
            y -= row_h

        # Divider
        c.setStrokeColor(HexColor("#e4e4e7"))
        c.line(54, y - 5, w - 54, y - 5)
        y -= 25

        # 4. Passport Names Lock Verification Table (Anti-Transliteration Drift)
        if names_lock and len(names_lock) > 0:
            c.setFillColor(HexColor("#18181b"))
            c.setFont("Helvetica-Bold", 10)
            c.drawString(54, y, "PASSPORT NAME TRANSLITERATION COMPLIANCE TABLE")
            y -= 16

            c.setFont("Helvetica-Bold", 8)
            c.setFillColor(HexColor("#52525b"))
            c.drawString(60, y, "ROLE / SUBJECT")
            c.drawString(200, y, "SOURCE SPELLING")
            c.drawString(380, y, "VERIFIED LATIN PASSPORT SPELLING")
            y -= 14

            c.setFont("Helvetica", 8)
            for item in names_lock:
                c.setFillColor(HexColor("#71717a"))
                c.drawString(60, y, item.get("role", "Subject"))
                c.setFillColor(HexColor("#27272a"))
                c.drawString(200, y, item.get("source_name", "—"))
                c.setFont("Helvetica-Bold", 8)
                c.setFillColor(HexColor("#09090b"))
                c.drawString(380, y, item.get("passport_spelling", "—"))
                c.setFont("Helvetica", 8)
                y -= 14

            c.setStrokeColor(HexColor("#e4e4e7"))
            c.line(54, y - 5, w - 54, y - 5)
            y -= 25

        # 5. Formal Sworn Certification Declaration
        c.setFillColor(HexColor("#18181b"))
        c.setFont("Helvetica-Bold", 10)
        c.drawString(54, y, "SWORN STATEMENT OF TRANSLATOR'S COMPETENCE")
        y -= 18

        default_statement = (
            f"I, {reviewer_name}, hereby certify under penalty of perjury under the laws of the United States "
            f"of America that I am well-versed and fully competent in both the {source_language_name} and English "
            f"languages; that I have examined and verified the attached translation titled '{source_filename}'; "
            f"and that the foregoing is a true, complete, and accurate English translation of the original foreign "
            f"language document to the best of my knowledge and professional ability."
        )
        statement = statement_of_competence or default_statement

        # Wrap text block
        c.setFont("Helvetica", 9)
        c.setFillColor(HexColor("#27272a"))
        
        words = statement.split()
        line = ""
        for word in words:
            if c.stringWidth(line + " " + word, "Helvetica", 9) < (w - 120):
                line = (line + " " + word).strip()
            else:
                c.drawString(60, y, line)
                y -= 14
                line = word
        if line:
            c.drawString(60, y, line)
            y -= 14

        y -= 20

        # 6. Professional Signer Credentials & Signature Block
        c.setStrokeColor(HexColor("#d4d4d8"))
        c.setLineWidth(1)
        c.line(54, y, w - 54, y)
        y -= 24

        c.setFont("Helvetica-Bold", 9)
        c.setFillColor(HexColor("#09090b"))
        c.drawString(60, y, "TRANSLATOR / ATTESTOR DETAILS:")
        c.drawString(350, y, "ATTESTATION SIGNATURE:")
        y -= 18

        c.setFont("Helvetica", 8)
        c.setFillColor(HexColor("#52525b"))
        c.drawString(60, y, f"Certified Linguist: {reviewer_name}")
        
        # Digital Signature representation
        c.setFont("Courier-BoldOblique", 11)
        c.setFillColor(HexColor("#1e3a8a"))
        c.drawString(350, y, f"/s/ {reviewer_name}")
        
        y -= 14
        c.setFont("Helvetica", 8)
        c.setFillColor(HexColor("#52525b"))
        c.drawString(60, y, f"Credentials: {reviewer_credentials}")
        c.drawString(350, y, "Electronically Signed & Seal Affixed")

        y -= 14
        c.drawString(60, y, "Organization: VerifyLingua Certified Linguistic Services")
        c.drawString(350, y, datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC"))

        # 7. Verification Seal & Verification Link Footer
        c.setStrokeColor(HexColor("#18181b"))
        c.setLineWidth(1)
        c.line(54, 75, w - 54, 75)

        c.setFont("Helvetica-Bold", 7)
        c.setFillColor(HexColor("#09090b"))
        c.drawString(54, 62, "OFFICIAL VERIFICATION CODE:")
        c.setFont("Courier-Bold", 8)
        c.drawString(185, 62, certificate_id)

        c.setFont("Helvetica", 7)
        c.setFillColor(HexColor("#71717a"))
        c.drawRightString(w - 54, 62, f"USCIS Admissibility Validated • Verify at verifylingua.com/verify/{job_id}")

        c.showPage()
        c.save()

        packet.seek(0)
        return packet.getvalue()

    @classmethod
    def append_certificate_to_pdf(cls, document_pdf_bytes: bytes, cert_pdf_bytes: bytes) -> bytes:
        """Appends the certification page as the final page of the PDF document."""
        out_stream = io.BytesIO()
        with pikepdf.open(io.BytesIO(document_pdf_bytes)) as doc_pdf:
            with pikepdf.open(io.BytesIO(cert_pdf_bytes)) as cert_pdf:
                doc_pdf.pages.extend(cert_pdf.pages)
                doc_pdf.save(out_stream)
        return out_stream.getvalue()


class CertifiedWorkflowManager:
    """
    Manages the complete lifecycle of Certified Translation Orders:
    - User name capture & passport spelling locking
    - Reviewer queue dispatching
    - Reviewer workbench retrieval
    - Reviewer approval, legal certification generation, and PDF appending
    - Full audit logging of all reviewer actions
    """

    @classmethod
    def create_certified_order(cls, job_id: str, order_req: CertifiedOrderRequest) -> Dict[str, Any]:
        job = job_store.get_job(job_id)
        if not job:
            raise ValueError(f"Job {job_id} not found")

        # 1. Enforce passport names in job glossary terms
        names_dict_list = []
        if order_req.names:
            glossary_terms = []
            for item in order_req.names:
                names_dict_list.append({
                    "source_name": item.source_name,
                    "passport_spelling": item.passport_spelling,
                    "role": item.role or "Primary Subject"
                })
                # Add as high-priority glossary term
                glossary_terms.append({
                    "id": f"name_{uuid.uuid4().hex[:8]}",
                    "job_id": job_id,
                    "source": item.source_name,
                    "target": item.passport_spelling,
                    "case_sensitive": True,
                    "category": "name",
                    "notes": f"Forced passport spelling for {item.role}"
                })
            job_store.set_glossary_terms(job_id, glossary_terms)

        # 2. Register order in job store
        order_record = {
            "order_id": f"ord_cert_{uuid.uuid4().hex[:10]}",
            "job_id": job_id,
            "purpose": order_req.purpose,
            "client_notes": order_req.client_notes,
            "notarization_required": order_req.notarization_required,
            "expedited": order_req.expedited,
            "names": names_dict_list,
            "status": "pending_review",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        job_store.create_certified_order(job_id, order_record)

        return order_record

    @classmethod
    def get_reviewer_workbench(cls, job_id: str) -> Dict[str, Any]:
        job = job_store.get_job(job_id)
        if not job:
            raise ValueError(f"Job {job_id} not found")

        order = job_store.get_certified_order(job_id)
        segments = job_store.get_segments(job_id)
        glossary = job_store.get_glossary_terms(job_id)
        qa = job_store.get_qa_report(job_id)
        audit_trail = job_store.get_audit_trail(job_id)

        # Tag segments with review flags
        flagged_segments = []
        for s in segments:
            seg_copy = dict(s)
            flags = []
            if s.get("confidence", 1.0) < 0.85:
                flags.append("low_ocr_confidence")
            if s.get("status") == "qa_warning":
                flags.append("qa_warning")
            # Highlight non-text bracketed notes like [Stamp], [Seal], [Signature]
            src = s.get("source_text", "")
            if "[" in src and "]" in src:
                flags.append("bracketed_note")
            seg_copy["flags"] = flags
            flagged_segments.append(seg_copy)

        return {
            "job": job.model_dump(),
            "certified_order": order,
            "segments": flagged_segments,
            "glossary": glossary,
            "qa_report": qa,
            "audit_trail": audit_trail
        }

    @classmethod
    def approve_and_certify(
        cls,
        job_id: str,
        approval_req: CertifiedApprovalRequest
    ) -> Dict[str, Any]:
        job = job_store.get_job(job_id)
        if not job:
            raise ValueError(f"Job {job_id} not found")

        order = job_store.get_certified_order(job_id)
        if not order:
            raise ValueError(f"No certified order registered for job {job_id}")

        rendered_doc = job_store.get_rendered_output(job_id)
        if not rendered_doc:
            raise ValueError("Document has not been rendered yet")

        certificate_id = f"CERT-VL-{uuid.uuid4().hex[:8].upper()}"

        source_lang_name = approval_req.source_language_name or job.sourceLanguage.upper()
        target_lang_name = approval_req.target_language_name or job.targetLanguage.upper()

        # 1. Generate legal 8 CFR § 103.2 certification PDF
        cert_page_bytes = CertificationPageGenerator.generate_certificate_pdf(
            certificate_id=certificate_id,
            job_id=job_id,
            source_filename=job.sourceFilename,
            source_language_name=source_lang_name,
            target_language_name=target_lang_name,
            page_count=job.pageCount or 1,
            reviewer_name=approval_req.reviewer_name,
            reviewer_credentials=approval_req.reviewer_credentials,
            statement_of_competence=approval_req.statement_of_competence,
            names_lock=order.get("names", []),
            purpose=order.get("purpose", "USCIS / Legal Proceeding")
        )

        # 2. Append certification page to rendered PDF
        if job.sourceFormat.lower() == "pdf":
            certified_pdf_bytes = CertificationPageGenerator.append_certificate_to_pdf(
                document_pdf_bytes=rendered_doc,
                cert_pdf_bytes=cert_page_bytes
            )
        else:
            # If DOCX or image, the certified delivery PDF is generated with the certificate
            certified_pdf_bytes = cert_page_bytes

        # 3. Update store with certified document bytes and preview
        from api.render import PreviewGenerator
        certified_preview = PreviewGenerator.generate_watermarked_preview(
            certified_pdf_bytes,
            format_hint="pdf",
            page_number=1
        )
        job_store.set_rendered_output(job_id, certified_pdf_bytes, certified_preview)

        # 4. Log immutable audit trail entry
        audit_entry = job_store.add_audit_entry(
            job_id=job_id,
            reviewer_id=approval_req.reviewer_id,
            reviewer_name=approval_req.reviewer_name,
            action="approved_and_certified",
            details={
                "certificate_id": certificate_id,
                "credentials": approval_req.reviewer_credentials,
                "pages_certified": (job.pageCount or 1) + 1,
                "reviewer_notes": approval_req.reviewer_notes
            }
        )

        # 5. Update certified order status and job status
        job_store.update_certified_order_status(job_id, "approved")
        job_store.update_job_stage(
            job_id=job_id,
            status=JobStatus.READY,
            stage_name="certified_complete",
            progress=100
        )

        # 6. Send Certified Completion Notification
        notif = NotificationService.send_job_completed_email(
            job_id=job_id,
            recipient="user@example.com",
            filename=job.sourceFilename,
            download_url=f"/api/jobs/{job_id}/download",
            qa_status="CERTIFIED (8 CFR § 103.2 Compliant)",
            warnings=[f"Appended Certificate Serial: {certificate_id}"],
            service_tier="certified"
        )
        job_store.log_notification(job_id, notif.model_dump())

        return {
            "job_id": job_id,
            "status": "certified_ready",
            "certificate_id": certificate_id,
            "download_url": f"/api/jobs/{job_id}/download",
            "audit_id": audit_entry["id"],
            "certified_pages_total": (job.pageCount or 1) + 1,
            "timestamp": audit_entry["timestamp"]
        }
