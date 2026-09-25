from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from enum import Enum
from datetime import datetime

class JobStatus(str, Enum):
    UPLOADED = "uploaded"
    VALIDATING = "validating"
    NEEDS_PASSWORD = "needs_password"
    NEEDS_OWNER_CONFIRMATION = "needs_owner_confirmation"
    ANALYZING = "analyzing"
    TRANSLATING = "translating"
    RENDERING = "rendering"
    QA = "qa"
    READY = "ready"
    READY_WITH_WARNINGS = "ready_with_warnings"
    FAILED = "failed"
    PURGED = "purged"

class PageKind(str, Enum):
    DIGITAL_TEXT = "digital_text"
    SCANNED = "scanned"
    HYBRID = "hybrid"
    IMAGE_ONLY = "image_only"
    VECTOR_GRAPHIC = "vector_graphic"
    BLANK = "blank"

class PageStatus(str, Enum):
    PENDING = "pending"
    ANALYZED = "analyzed"
    TRANSLATED = "translated"
    RENDERED = "rendered"
    QA_PASSED = "qa_passed"
    QA_WARNING = "qa_warning"
    FAILED = "failed"

class ServiceTier(str, Enum):
    INSTANT = "instant"
    CERTIFIED = "certified"

class ErrorDetail(BaseModel):
    code: str
    message: str
    action: str
    stage: str
    page: Optional[int] = None
    details: Optional[Dict[str, Any]] = None

class CreateJobRequest(BaseModel):
    sourceFilename: str
    sourceFormat: str
    sourceLanguage: str = "es"
    targetLanguage: str = "en"
    serviceTier: ServiceTier = ServiceTier.INSTANT
    userId: Optional[str] = None
    s3Key: Optional[str] = None
    fileSizeBytes: Optional[int] = None

class PageModel(BaseModel):
    pageNumber: int
    kind: PageKind = PageKind.DIGITAL_TEXT
    status: PageStatus = PageStatus.PENDING
    attempts: int = 0
    errorCode: Optional[str] = None
    errorMessage: Optional[str] = None
    textLayerConfidence: Optional[float] = None
    isBrokenEncoding: bool = False
    nonTextRegionsCount: int = 0
    width: Optional[float] = None
    height: Optional[float] = None

class JobResponse(BaseModel):
    id: str
    status: JobStatus
    currentStage: str
    progress: int = 0
    sourceFilename: str
    sourceFormat: str
    sourceLanguage: str
    targetLanguage: str
    serviceTier: ServiceTier
    pageCount: int = 0
    pages: List[PageModel] = []
    error: Optional[ErrorDetail] = None
    downloadUrl: Optional[str] = None
    previewUrl: Optional[str] = None
    createdAt: datetime
    updatedAt: datetime
    isPurged: bool = False
    purgedAt: Optional[datetime] = None
    retentionExpiresAt: Optional[datetime] = None

class PresignUploadRequest(BaseModel):
    filename: str
    mimeType: str
    fileSizeBytes: int

class PresignUploadResponse(BaseModel):
    uploadUrl: str
    s3Key: str
    fields: Dict[str, str] = {}
    expiresInSeconds: int = 900

class PasswordSubmitRequest(BaseModel):
    password: str

class OwnerConfirmRequest(BaseModel):
    confirmed: bool = True

class GlossaryTermModel(BaseModel):
    source: str
    target: str
    domain: Optional[str] = None
    is_user_forced: bool = False

class SegmentModel(BaseModel):
    id: str
    page_number: int
    block_id: str
    order_index: int
    source_text: str
    source_markup: str
    translated_text: Optional[str] = None
    translated_markup: Optional[str] = None
    protected_tokens: Dict[str, str] = Field(default_factory=dict)
    engine: Optional[str] = None
    confidence: float = 1.0
    status: str = "pending"
    reviewer_edit: Optional[str] = None

class CostLedgerEntryModel(BaseModel):
    id: str
    job_id: str
    page_number: int
    provider: str
    model: str
    input_tokens: int
    output_tokens: int
    cost_usd: float
    latency_ms: float
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class CostSummaryResponse(BaseModel):
    job_id: str
    total_cost_usd: float
    total_input_tokens: int
    total_output_tokens: int
    average_cost_per_page: float
    provider_breakdown: Dict[str, float] = Field(default_factory=dict)

class TranslateJobRequest(BaseModel):
    user_names: Optional[List[str]] = None
    user_glossary: Optional[List[GlossaryTermModel]] = None

class UpdateSegmentRequest(BaseModel):
    translated_text: str
    reviewer_edit: Optional[str] = None

class ReRenderPageRequest(BaseModel):
    page_number: int

class QAPageResultModel(BaseModel):
    page_number: int
    status: PageStatus
    completeness: bool = True
    overflow_mitigated: bool = False
    glyph_integrity: bool = True
    direction_valid: bool = True
    non_text_ssim: float = 1.0
    structure_valid: bool = True
    protected_tokens_preserved: bool = True
    warnings: List[str] = Field(default_factory=list)
    error_code: Optional[str] = None
    error_message: Optional[str] = None

class QADocumentReportResponse(BaseModel):
    job_id: str
    overall_status: JobStatus
    page_count: int
    passed_count: int
    warning_count: int
    failed_count: int
    pages: List[QAPageResultModel] = Field(default_factory=list)
    global_warnings: List[str] = Field(default_factory=list)

class NameCaptureItem(BaseModel):
    source_name: str
    passport_spelling: str
    role: Optional[str] = "Primary Subject"

class CertifiedOrderRequest(BaseModel):
    names: List[NameCaptureItem] = Field(default_factory=list)
    purpose: str = "USCIS"  # USCIS, university, court, other
    client_notes: Optional[str] = None
    notarization_required: bool = False
    expedited: bool = False

class CertifiedApprovalRequest(BaseModel):
    reviewer_id: str = "rev_ata_278190"
    reviewer_name: str = "Elena Rostova, ATA Certified Translator"
    reviewer_credentials: str = "ATA Member #278190 • Certification #CT-8921"
    source_language_name: Optional[str] = None
    target_language_name: Optional[str] = None
    statement_of_competence: Optional[str] = None
    signature_image_base64: Optional[str] = None
    reviewer_notes: Optional[str] = None

class ReviewAuditEntry(BaseModel):
    id: str
    job_id: str
    reviewer_id: str
    reviewer_name: str
    action: str  # order_created, segment_edit, page_rerender, approved, rejected
    details: Dict[str, Any] = Field(default_factory=dict)
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CertifiedQueueItem(BaseModel):
    job_id: str
    source_filename: str
    source_language: str
    target_language: str
    page_count: int
    purpose: str
    priority: str = "standard"
    qa_status: str
    created_at: datetime
    status: str = "pending_review"
    names_count: int = 0


class RetentionInfoResponse(BaseModel):
    job_id: str
    service_tier: ServiceTier
    status: JobStatus
    is_purged: bool
    purged_at: Optional[datetime] = None
    retention_expires_at: Optional[datetime] = None
    seconds_remaining: Optional[int] = None
    policy_ttl_seconds: int


class RetentionCleanupResponse(BaseModel):
    scanned_jobs: int
    purged_jobs: int
    freed_bytes: int
    purged_job_ids: List[str] = Field(default_factory=list)
    dry_run: bool = False
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ImmediateDeletionResponse(BaseModel):
    job_id: str
    purged: bool = True
    freed_bytes: int = 0
    purged_at: datetime
    message: str = "Document binary payloads and segment text purged successfully. Tombstone audit retained."


class CommercialPlanModel(BaseModel):
    id: str
    name: str
    tier: ServiceTier
    price_cents: int
    price_usd: float
    pages_included: int
    price_per_page_usd: float
    mode: str  # payment, subscription
    description: str


class PricingCalculateRequest(BaseModel):
    service_tier: ServiceTier = ServiceTier.INSTANT
    page_count: int = 1
    is_expedited: bool = False
    needs_notarization: bool = False
    needs_apostille: bool = False


class PricingCalculateResponse(BaseModel):
    service_tier: ServiceTier
    page_count: int
    base_price_usd: float
    expedited_fee_usd: float = 0.0
    notarization_fee_usd: float = 0.0
    apostille_fee_usd: float = 0.0
    addons_total_usd: float = 0.0
    total_price_usd: float
    price_per_page_usd: float
    estimated_turnaround_hours: int


class CheckoutSessionRequest(BaseModel):
    plan_id: str
    user_id: str
    success_url: Optional[str] = None
    cancel_url: Optional[str] = None
    job_id: Optional[str] = None


class CheckoutSessionResponse(BaseModel):
    session_id: str
    checkout_url: str
    plan_id: str
    amount_cents: int
    amount_usd: float
    pages_granted: int
    mode: str
    status: str = "open"


class AccountBalanceResponse(BaseModel):
    user_id: str
    credits_available: int
    credits_reserved: int
    lifetime_pages_used: int
    active_jobs_count: int




