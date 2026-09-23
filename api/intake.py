import io
import struct
import zipfile
from typing import Tuple, Dict, Any, Optional
from api.config import settings

class IntakeError(Exception):
    def __init__(self, code: str, message: str, action: str, http_status: int = 422):
        self.code = code
        self.message = message
        self.action = action
        self.http_status = http_status
        super().__init__(message)

def verify_magic_bytes(data: bytes, declared_format: str) -> str:
    """Verifies true file type using magic bytes header, rejecting mismatches."""
    if len(data) < 8:
        raise IntakeError(
            code="E_MALICIOUS_PAYLOAD",
            message="Uploaded file is empty or too short to contain valid headers.",
            action="Please select a valid document file.",
            http_status=400
        )
    
    # 1. PDF Magic Bytes: %PDF
    if data.startswith(b"%PDF"):
        detected = "pdf"
    # 2. PNG Magic Bytes: \x89PNG\r\n\x1a\n
    elif data.startswith(b"\x89PNG\r\n\x1a\n"):
        detected = "png"
    # 3. JPEG Magic Bytes: \xff\xd8\xff
    elif data.startswith(b"\xff\xd8\xff"):
        detected = "jpg"
    # 4. OpenXML / ZIP Magic Bytes: PK\x03\x04
    elif data.startswith(b"PK\x03\x04"):
        # Verify it is actually a Word DOCX document
        try:
            with zipfile.ZipFile(io.BytesIO(data)) as zf:
                namelist = zf.namelist()
                if "[Content_Types].xml" in namelist and any(n.startswith("word/") for n in namelist):
                    detected = "docx"
                else:
                    detected = "zip"
        except Exception:
            detected = "zip_corrupt"
    else:
        detected = "unknown"

    declared_norm = declared_format.lower().replace(".", "").replace("jpeg", "jpg")
    if detected != declared_norm:
        if not (declared_norm in ("jpg", "png") and detected in ("jpg", "png")):
            raise IntakeError(
                code="E_TYPE_MISMATCH",
                message=f"The uploaded file format ({detected}) does not match its declared format ({declared_format}).",
                action="Please export your document in a standard PDF, DOCX, PNG, or JPG format and re-upload.",
                http_status=415
            )
            
    return detected

def inspect_image_header(data: bytes) -> Tuple[int, int]:
    """Reads image dimensions from header before decoding to prevent decompression bombs."""
    width, height = 0, 0
    # PNG dimensions: IHDR chunk at offset 16 (4 bytes width, 4 bytes height)
    if data.startswith(b"\x89PNG\r\n\x1a\n"):
        if len(data) >= 24:
            width, height = struct.unpack(">II", data[16:24])
    # JPEG dimensions: parse SOF markers
    elif data.startswith(b"\xff\xd8"):
        i = 2
        while i < len(data) - 4:
            marker, = struct.unpack(">H", data[i:i+2])
            i += 2
            if 0xffc0 <= marker <= 0xffcf and marker not in (0xffc4, 0xffc8, 0xffcc):
                if i + 7 <= len(data):
                    length, bits, h, w = struct.unpack(">H B H H", data[i:i+7])
                    width, height = w, h
                    break
            else:
                if i + 2 <= len(data):
                    length, = struct.unpack(">H", data[i:i+2])
                    i += length
                else:
                    break
                    
    if width > 0 and height > 0:
        megapixels = (width * height) / 1_000_000
        if megapixels > settings.MAX_IMAGE_MEGAPIXELS:
            raise IntakeError(
                code="E_IMAGE_TOO_LARGE",
                message=f"This image is {megapixels:.1f} megapixels; the platform limit is {settings.MAX_IMAGE_MEGAPIXELS} MP.",
                action="Please export or resample your image to under 60 megapixels before uploading.",
                http_status=422
            )
    return width, height

def inspect_docx(data: bytes) -> Dict[str, Any]:
    """Hardened DOCX inspection: zip-bomb defense, macro rejection, path traversal check."""
    try:
        zf = zipfile.ZipFile(io.BytesIO(data))
    except Exception as e:
        raise IntakeError(
            code="E_DOCX_SECURITY_RISK",
            message="Invalid or corrupted DOCX package structure.",
            action="Please save the document as a clean .docx file in Microsoft Word and re-upload.",
            http_status=422
        )
        
    total_uncompressed = 0
    entries = zf.infolist()
    
    if len(entries) > 10_000:
        raise IntakeError(
            code="E_DOCX_SECURITY_RISK",
            message="DOCX package contains excessive entries (zip bomb defense triggered).",
            action="Please re-save the document without excessive embedded sub-objects.",
            http_status=422
        )
        
    for entry in entries:
        # Check path traversal
        if ".." in entry.filename or entry.filename.startswith("/"):
            raise IntakeError(
                code="E_DOCX_SECURITY_RISK",
                message="Suspect file paths detected inside DOCX archive.",
                action="Please re-save the document without custom archive structures.",
                http_status=422
            )
        # Check macro files
        if entry.filename.endswith("vbaProject.bin") or "vba" in entry.filename.lower():
            raise IntakeError(
                code="E_DOCX_SECURITY_RISK",
                message="The document contains macros (.docm features are prohibited for security).",
                action="Please save the file as a clean macro-free .docx document and re-upload.",
                http_status=422
            )
            
        total_uncompressed += entry.file_size
        # Compression ratio check (> 100:1 on large files)
        if entry.compress_size > 0 and (entry.file_size / entry.compress_size) > 100 and entry.file_size > 1024 * 1024:
            raise IntakeError(
                code="E_DOCX_SECURITY_RISK",
                message="Abnormal compression ratio detected (zip bomb defense triggered).",
                action="Please re-save the document with standard compression.",
                http_status=422
            )
            
    if total_uncompressed > 200 * 1024 * 1024:  # 200 MB
        raise IntakeError(
            code="E_DOCX_SECURITY_RISK",
            message="Uncompressed document size exceeds maximum allowed threshold (200 MB).",
            action="Please optimize the embedded media or split the document.",
            http_status=422
        )
        
    return {
        "entry_count": len(entries),
        "uncompressed_bytes": total_uncompressed
    }

def inspect_pdf_security(data: bytes) -> Dict[str, Any]:
    """Inspects PDF for user encryption, active JavaScript, and page count limits."""
    # Check for basic PDF structure
    if not data.startswith(b"%PDF"):
        raise IntakeError(
            code="E_PDF_CORRUPT",
            message="File does not have a valid PDF header.",
            action="Please verify the file is an intact PDF document.",
            http_status=422
        )
        
    # Check for User Password Encryption (/Encrypt dictionary)
    if b"/Encrypt" in data:
        # Check if user password is required
        if b"/Standard" in data and b"/P " in data:
            # We flag this for password decryption in worker
            pass
            
    # Check for prohibited active content
    has_active_script = False
    if b"/JavaScript" in data or b"/JS " in data or b"/OpenAction" in data or b"/Launch" in data:
        has_active_script = True
        
    # Estimate page count from /Type /Page occurrences (accurate for most PDFs before deep pikepdf parse)
    import re
    page_matches = re.findall(rb"/Type\s*/Page\b", data)
    page_count = max(1, len(page_matches))
    
    if page_count > settings.MAX_PAGES:
        raise IntakeError(
            code="E_PAGE_LIMIT_EXCEEDED",
            message=f"This document contains {page_count} pages, which exceeds the {settings.MAX_PAGES}-page limit.",
            action="Please trim the document to 100 pages or fewer, or contact enterprise support for bulk processing.",
            http_status=422
        )
        
    return {
        "estimated_pages": page_count,
        "has_active_content": has_active_script,
        "is_encrypted": b"/Encrypt" in data
    }

def run_intake_security_check(file_bytes: bytes, filename: str, declared_format: str) -> Dict[str, Any]:
    """
    Executes S1 intake and security checks:
    - Enforces 50 MB size limit
    - Validates magic bytes
    - Runs format-specific structural inspection
    """
    file_size = len(file_bytes)
    if file_size > settings.MAX_FILE_SIZE_BYTES:
        raise IntakeError(
            code="E_FILE_TOO_LARGE",
            message=f"The file size ({file_size / (1024*1024):.1f} MB) exceeds the {settings.MAX_FILE_SIZE_BYTES // (1024*1024)} MB limit.",
            action="Please compress your document or split it before uploading.",
            http_status=413
        )
        
    real_format = verify_magic_bytes(file_bytes, declared_format)
    meta: Dict[str, Any] = {
        "filename": filename,
        "format": real_format,
        "size_bytes": file_size,
        "page_count": 1
    }
    
    if real_format == "pdf":
        pdf_info = inspect_pdf_security(file_bytes)
        meta.update(pdf_info)
        meta["page_count"] = pdf_info.get("estimated_pages", 1)
    elif real_format == "docx":
        docx_info = inspect_docx(file_bytes)
        meta.update(docx_info)
    elif real_format in ("png", "jpg"):
        w, h = inspect_image_header(file_bytes)
        meta["width"] = w
        meta["height"] = h
        meta["megapixels"] = (w * h) / 1_000_000 if (w and h) else 0.0
        meta["page_count"] = 1
        
    return meta
