from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from enum import Enum
from datetime import datetime

class JobStatus(str, Enum):
    UPLOADED = "uploaded"
    VALIDATING = "validating"
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
