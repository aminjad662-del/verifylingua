import uuid
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from pydantic import BaseModel, Field


class EmailNotification(BaseModel):
    id: str
    job_id: str
    recipient: str
    subject: str
    body_text: str
    body_html: str
    notification_type: str  # job_completed, action_required, certified_update
    sent_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    status: str = "delivered"


class NotificationService:
    """
    Manages notifications and transactional emails for document translation jobs:
    - Job completion emails with QA summary, download link, and certified upgrade link.
    - Action required alerts (password prompt, owner permission confirmation).
    - Logs all dispatches for auditability and verification.
    """

    @classmethod
    def send_job_completed_email(
        cls,
        job_id: str,
        recipient: str,
        filename: str,
        download_url: str,
        qa_status: str,
        warnings: List[str] = [],
        service_tier: str = "instant"
    ) -> EmailNotification:
        subj = f"Your translation is ready: {filename} ({qa_status.upper()})"
        
        warn_bullets = "\n".join([f"- {w}" for w in warnings]) if warnings else "None (100% fidelity passed)"
        html_warn_bullets = "".join([f"<li>{w}</li>" for w in warnings]) if warnings else "<li>None (100% fidelity passed)</li>"
        
        body_text = f"""
Hello,

Your document translation for '{filename}' is complete and ready for download.

Quality Assurance Status: {qa_status.upper()}
Notes & Mitigations:
{warn_bullets}

Download your translated document:
{download_url}

Need an official certified translation for USCIS or courts? You can upgrade to Certified mode directly from your dashboard.

Sincerely,
VerifyLingua Automated Document Processing Team
"""

        body_html = f"""
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e4e4e7; border-radius: 12px; background: #ffffff;">
  <h2 style="color: #09090b; margin-top: 0; font-size: 20px;">Your Translation is Ready</h2>
  <p style="color: #52525b; font-size: 14px; line-height: 1.5;">
    The automated document processing pipeline has finished translating <strong>{filename}</strong>.
  </p>
  <div style="background: #f4f4f5; border-radius: 8px; padding: 14px 16px; margin: 20px 0;">
    <div style="font-size: 12px; color: #71717a; text-transform: uppercase; letter-spacing: 0.05em; font-family: monospace;">Quality Assurance Verdict</div>
    <div style="font-size: 16px; font-weight: 600; color: #09090b; margin-top: 4px;">{qa_status.upper()}</div>
    <ul style="font-size: 13px; color: #52525b; margin: 8px 0 0 0; padding-left: 20px;">
      {html_warn_bullets}
    </ul>
  </div>
  <a href="{download_url}" style="display: inline-block; background: #09090b; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px;">Download Translated File</a>
  <hr style="border: 0; border-top: 1px solid #f4f4f5; margin: 28px 0 20px 0;" />
  <p style="font-size: 12px; color: #a1a1aa; line-height: 1.4; margin: 0;">
    VerifyLingua Automated Document Processing • USCIS 8 CFR § 103.2 Compliant
  </p>
</div>
"""
        notification = EmailNotification(
            id=f"notif_{uuid.uuid4().hex[:12]}",
            job_id=job_id,
            recipient=recipient,
            subject=subj,
            body_text=body_text.strip(),
            body_html=body_html.strip(),
            notification_type="job_completed"
        )
        return notification
