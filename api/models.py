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

