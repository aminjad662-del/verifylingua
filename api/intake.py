import io
import re
import struct
import zipfile
from typing import Tuple, Dict, Any, Optional

import defusedxml.ElementTree as ET
from defusedxml.common import DefusedXmlException, EntitiesForbidden, DTDForbidden
from PIL import Image, ImageOps

from api.config import settings

try:
    import pikepdf
except ImportError:
    pikepdf = None

# Configure Pillow decompression bomb ceiling
Image.MAX_IMAGE_PIXELS = settings.MAX_IMAGE_MEGAPIXELS * 1_000_000

# EICAR Antivirus Test Signature
EICAR_SIGNATURE = b"X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*"

class IntakeError(Exception):
    def __init__(self, code: str, message: str, action: str, http_status: int = 422):
        self.code = code
        self.message = message
        self.action = action
        self.http_status = http_status
        super().__init__(message)

def scan_malware(data: bytes):
    """Scans raw file bytes for malware signatures (EICAR standard test pattern)."""
    if EICAR_SIGNATURE in data:
        raise IntakeError(
            code="E_MALWARE",
            message="Malicious software or virus signature detected in file payload.",
            action="Please ensure your file is clean and free of malware before uploading.",
            http_status=422
        )

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

def inspect_and_sanitize_image(data: bytes, declared_format: str) -> Dict[str, Any]:
    """
    Decodes image with memory safeguards:
    - Pre-check header dimensions against decompression bomb threshold.
    - Normalizes EXIF orientation to true upright visual orientation.
    - Strips all EXIF metadata (camera serial, GPS, timestamp).
    - Returns sanitized image bytes and spatial metadata.
    """
    w_hdr, h_hdr = inspect_image_header(data)
    
    try:
        with Image.open(io.BytesIO(data)) as img:
            # Check decompression bomb against Pillow limit
            if img.width * img.height > settings.MAX_IMAGE_MEGAPIXELS * 1_000_000:
                raise IntakeError(
                    code="E_IMAGE_TOO_LARGE",
                    message=f"Image resolution exceeds the {settings.MAX_IMAGE_MEGAPIXELS} MP limit.",
                    action="Please scale down your image before uploading.",
                    http_status=422
                )
            
            # Normalize orientation from EXIF tag 274
            transposed = ImageOps.exif_transpose(img)
            orientation_transposed = (transposed.size != img.size)
            
            # Strip EXIF metadata by writing to clean buffer without exif parameters
            clean_buf = io.BytesIO()
            fmt = "PNG" if declared_format.lower() in ("png",) else "JPEG"
            if fmt == "JPEG":
                # Convert RGBA to RGB for JPEG compatibility
                rgb_img = transposed.convert("RGB") if transposed.mode in ("RGBA", "P") else transposed
                rgb_img.save(clean_buf, format="JPEG", quality=92)
            else:
                transposed.save(clean_buf, format="PNG")
                
            sanitized_bytes = clean_buf.getvalue()
            final_w, final_h = transposed.size
            mp = (final_w * final_h) / 1_000_000
            
            return {
                "width": final_w,
                "height": final_h,
                "megapixels": mp,
                "orientation_transposed": orientation_transposed,
                "exif_stripped": True,
                "sanitized_bytes": sanitized_bytes
            }
    except IntakeError:
        raise
    except Exception as e:
        if "DecompressionBomb" in type(e).__name__:
            raise IntakeError(
                code="E_IMAGE_TOO_LARGE",
                message=f"This image triggers decompression bomb safeguards (exceeds {settings.MAX_IMAGE_MEGAPIXELS} MP limit).",
                action="Please export your image at a lower resolution.",
                http_status=422
            )
        raise IntakeError(
            code="E_IMAGE_CORRUPT",
            message=f"Failed to decode image data: {str(e)}",
            action="Please verify the image is valid and not corrupted.",
            http_status=422
        )

def inspect_and_sanitize_docx(data: bytes) -> Dict[str, Any]:
    """
    Hardened DOCX security inspection:
    - Zip-bomb defense (max 10,000 entries, max 200 MB uncompressed, 100:1 ratio).
    - Path traversal defense (no '..' or leading '/').
    - Macro defense (reject vbaProject.bin).
    - XXE defense: parse all XML entries with defusedxml.
    """
    try:
        zf = zipfile.ZipFile(io.BytesIO(data))
    except Exception:
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
        # Compression ratio check (> 100:1 on entries > 1 MB)
        if entry.compress_size > 0 and (entry.file_size / entry.compress_size) > 100 and entry.file_size > 1024 * 1024:
            raise IntakeError(
                code="E_DOCX_SECURITY_RISK",
                message="Abnormal compression ratio detected (zip bomb defense triggered).",
                action="Please re-save the document with standard compression.",
                http_status=422
            )
            
        # Parse XML entries with defusedxml to block XXE
        if entry.filename.endswith(".xml") or entry.filename.endswith(".rels"):
            try:
                xml_content = zf.read(entry.filename)
                ET.fromstring(xml_content)
            except (DefusedXmlException, EntitiesForbidden, DTDForbidden):
                raise IntakeError(
                    code="E_DOCX_SECURITY_RISK",
                    message="The DOCX archive contains prohibited external entity definitions or XXE payload.",
                    action="Please re-save the document in Microsoft Word without custom XML entity definitions.",
                    http_status=422
                )
            except Exception:
                # Malformed XML inside docx
                pass
            
    if total_uncompressed > 200 * 1024 * 1024:  # 200 MB
        raise IntakeError(
            code="E_DOCX_SECURITY_RISK",
            message="Uncompressed document size exceeds maximum allowed threshold (200 MB).",
            action="Please optimize the embedded media or split the document.",
            http_status=422
        )
        
    return {
        "entry_count": len(entries),
        "uncompressed_bytes": total_uncompressed,
        "sanitized_bytes": data
    }

def sanitize_pdf_document(doc) -> Dict[str, bool]:
    """
    Strips active and potentially dangerous elements from a pikepdf Document:
    - Root catalog: /OpenAction, /AA, /JavaScript, /XFA, /EmbeddedFiles, /Launch
    - /Names dictionary: /JavaScript, /EmbeddedFiles
    - Page-level /AA and /OpenAction
    - Annotations with interactive or executable launch actions (/JavaScript, /Launch, /ImportData)
    """
    stripped = {
        "javascript": False,
        "open_action": False,
        "additional_actions": False,
        "embedded_files": False,
        "xfa": False,
        "launch_actions": False
    }
    
    # 1. Document Root catalog active content
    if "/OpenAction" in doc.Root:
        del doc.Root["/OpenAction"]
        stripped["open_action"] = True
        
    if "/AA" in doc.Root:
        del doc.Root["/AA"]
        stripped["additional_actions"] = True
        
    if "/JavaScript" in doc.Root:
        del doc.Root["/JavaScript"]
        stripped["javascript"] = True
        
    # Check /Names
    if "/Names" in doc.Root:
        names_dict = doc.Root["/Names"]
        if isinstance(names_dict, pikepdf.Dictionary):
            if "/JavaScript" in names_dict:
                del names_dict["/JavaScript"]
                stripped["javascript"] = True
            if "/EmbeddedFiles" in names_dict:
                del names_dict["/EmbeddedFiles"]
                stripped["embedded_files"] = True
            if len(names_dict.keys()) == 0:
                del doc.Root["/Names"]
                
    if "/EmbeddedFiles" in doc.Root:
        del doc.Root["/EmbeddedFiles"]
        stripped["embedded_files"] = True

    # Check /AcroForm for /XFA and form-level /AA
    if "/AcroForm" in doc.Root:
        acro = doc.Root["/AcroForm"]
        if isinstance(acro, pikepdf.Dictionary):
            if "/XFA" in acro:
                del acro["/XFA"]
                stripped["xfa"] = True
            if "/AA" in acro:
                del acro["/AA"]
                stripped["additional_actions"] = True

    # 2. Page-level actions & annotations
    for page in doc.pages:
        if "/AA" in page:
            del page["/AA"]
            stripped["additional_actions"] = True
        if "/OpenAction" in page:
            del page["/OpenAction"]
            stripped["open_action"] = True
            
        if "/Annots" in page:
            clean_annots = []
            for annot in page.Annots:
                if isinstance(annot, pikepdf.Dictionary):
                    # Check /A (Action)
                    if "/A" in annot:
                        action = annot["/A"]
                        if isinstance(action, pikepdf.Dictionary) and "/S" in action:
                            s_name = str(action["/S"])
                            if s_name in ("/JavaScript", "/Launch", "/ImportData", "/SubmitForm", "/ResetForm", "/RichMediaExecute"):
                                if s_name == "/Launch":
                                    stripped["launch_actions"] = True
                                elif s_name == "/JavaScript":
                                    stripped["javascript"] = True
                                continue
                    # Check /AA in annotation
                    if "/AA" in annot:
                        del annot["/AA"]
                        stripped["additional_actions"] = True
                clean_annots.append(annot)
            page.Annots = clean_annots
            
    return stripped

def inspect_and_sanitize_pdf(data: bytes, password: Optional[str] = None) -> Dict[str, Any]:
    """
    Inspects PDF for user encryption, owner restrictions, active scripts, and page limits.
    Utilizes pikepdf (qpdf) to repair recoverable damage and output a sanitized linearized PDF.
    """
    if not data.startswith(b"%PDF"):
        raise IntakeError(
            code="E_PDF_CORRUPT",
            message="File does not have a valid PDF header.",
            action="Please verify the file is an intact PDF document.",
            http_status=422
        )
        
    if pikepdf is None:
        # Fallback if pikepdf is unavailable
        page_matches = re.findall(rb"/Type\s*/Page\b", data)
        page_count = max(1, len(page_matches))
        if page_count > settings.MAX_PAGES:
            raise IntakeError(
                code="E_PAGE_LIMIT_EXCEEDED",
                message=f"This document contains {page_count} pages, which exceeds the {settings.MAX_PAGES}-page limit.",
                action="Please trim the document to 100 pages or fewer.",
                http_status=422
            )
        return {
            "page_count": page_count,
            "is_encrypted": b"/Encrypt" in data,
            "owner_restricted": False,
            "has_active_content": False,
            "stripped_elements": {},
            "sanitized_bytes": data
        }

    # Open with pikepdf
    try:
        doc = pikepdf.Pdf.open(io.BytesIO(data), password=password or "")
    except pikepdf.PasswordError:
        if password:
            raise IntakeError(
                code="E_PDF_PASSWORD",
                message="The provided password could not decrypt the document. Please try again.",
                action="Please enter the correct password to unlock this document.",
                http_status=422
            )
        else:
            raise IntakeError(
                code="E_PDF_PASSWORD",
                message="This PDF is password-protected. Enter the password to continue.",
                action="Please enter the password to unlock this document.",
                http_status=422
            )
    except pikepdf.PdfError as e:
        raise IntakeError(
            code="E_PDF_CORRUPT",
            message=f"The PDF file structure is corrupted and could not be recovered: {str(e)}",
            action="Please re-export or re-save the PDF from the original application and try again.",
            http_status=422
        )
    except Exception as e:
        raise IntakeError(
            code="E_PDF_CORRUPT",
            message=f"Failed to parse PDF document: {str(e)}",
            action="Please ensure the PDF is intact and uncorrupted.",
            http_status=422
        )

    try:
        page_count = len(doc.pages)
        if page_count > settings.MAX_PAGES:
            raise IntakeError(
                code="E_PAGE_LIMIT_EXCEEDED",
                message=f"This document contains {page_count} pages, which exceeds the {settings.MAX_PAGES}-page limit.",
                action="Please trim the document to 100 pages or fewer, or contact enterprise support for bulk processing.",
                http_status=422
            )

        # Check owner restrictions
        owner_restricted = False
        if doc.is_encrypted:
            try:
                if hasattr(doc, "allow") and doc.allow and hasattr(doc.allow, "extract") and not doc.allow.extract:
                    owner_restricted = True
            except Exception:
                pass

        # Check for stream size limits per object (e.g. > 50 MB stream bomb)
        for obj in doc.objects:
            try:
                if isinstance(obj, pikepdf.Stream) and len(obj.read_raw_bytes()) > 50 * 1024 * 1024:
                    raise IntakeError(
                        code="E_MALICIOUS_PAYLOAD",
                        message="PDF contains an oversized internal data stream exceeding security limits.",
                        action="Please optimize the embedded media or re-export the document.",
                        http_status=422
                    )
            except IntakeError:
                raise
            except Exception:
                pass

        # Sanitize active content
        stripped = sanitize_pdf_document(doc)
        has_active = any(stripped.values())

        # Save sanitized copy unencrypted and linearized
        clean_buf = io.BytesIO()
        doc.save(clean_buf, linearize=True)
        sanitized_bytes = clean_buf.getvalue()

        return {
            "page_count": page_count,
            "is_encrypted": doc.is_encrypted,
            "owner_restricted": owner_restricted,
            "has_active_content": has_active,
            "stripped_elements": stripped,
            "sanitized_bytes": sanitized_bytes
        }
    finally:
        doc.close()

def unlock_and_sanitize_pdf(data: bytes, password: str) -> Dict[str, Any]:
    """Unlocks a password-protected PDF and produces sanitized bytes."""
    return inspect_and_sanitize_pdf(data, password=password)

def run_intake_security_check(
    file_bytes: bytes,
    filename: str,
    declared_format: str,
    password: Optional[str] = None
) -> Dict[str, Any]:
    """
    Executes S1 intake and security checks:
    - Scans for malware / viruses
    - Enforces 50 MB file size limit
    - Validates magic bytes against declared format
    - Runs format-specific structural inspection and sanitization
    - Produces clean, sanitized bytes for all downstream stages
    """
    # 1. Malware scan
    scan_malware(file_bytes)

    # 2. File size limit
    file_size = len(file_bytes)
    if file_size > settings.MAX_FILE_SIZE_BYTES:
        raise IntakeError(
            code="E_FILE_TOO_LARGE",
            message=f"The file size ({file_size / (1024*1024):.1f} MB) exceeds the {settings.MAX_FILE_SIZE_BYTES // (1024*1024)} MB limit.",
            action="Please compress your document or split it before uploading.",
            http_status=413
        )
        
    # 3. Magic bytes verification
    real_format = verify_magic_bytes(file_bytes, declared_format)
    meta: Dict[str, Any] = {
        "filename": filename,
        "format": real_format,
        "size_bytes": file_size,
        "page_count": 1,
        "sanitized_bytes": file_bytes
    }
    
    # 4. Format-specific inspection & sanitization
    if real_format == "pdf":
        pdf_info = inspect_and_sanitize_pdf(file_bytes, password=password)
        meta.update(pdf_info)
    elif real_format == "docx":
        docx_info = inspect_and_sanitize_docx(file_bytes)
        meta.update(docx_info)
    elif real_format in ("png", "jpg"):
        img_info = inspect_and_sanitize_image(file_bytes, real_format)
        meta.update(img_info)
        
    return meta
