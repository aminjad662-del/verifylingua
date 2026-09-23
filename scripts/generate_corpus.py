import os
import json
import struct
import zipfile
import zlib

CORPUS_DIR = os.path.join("tests", "corpus")
os.makedirs(CORPUS_DIR, exist_ok=True)
os.makedirs(os.path.join(CORPUS_DIR, "user"), exist_ok=True)

manifest = {
    "version": "1.0",
    "description": "VerifyLingua Document Translation Service Golden Test Corpus",
    "corpus": []
}

def add_to_manifest(file_id, filename, category, description, expected_behavior, gate_target):
    manifest["corpus"].append({
        "id": file_id,
        "filename": filename,
        "category": category,
        "description": description,
        "expected_behavior": expected_behavior,
        "gate_target": gate_target
    })

def make_simple_pdf(pages_text: list[list[str]], output_path: str, extra_catalog: bytes = b""):
    """Creates a standards-compliant multi-page PDF with exact text streams."""
    objects = []
    
    # Object 1: Catalog
    objects.append(b"") # placeholder
    
    # Object 2: Pages tree
    objects.append(b"") # placeholder
    
    # Object 3: Font
    font_obj = b"3 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj\n"
    objects.append(font_obj)
    
    page_obj_ids = []
    current_obj_id = 4
    
    page_objs = []
    content_objs = []
    
    for page_idx, lines in enumerate(pages_text):
        content_stream_id = current_obj_id + 1
        page_obj = (
            f"{current_obj_id} 0 obj\n"
            f"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] "
            f"/Resources << /Font << /F1 3 0 R >> >> "
            f"/Contents {content_stream_id} 0 R >>\nendobj\n"
        ).encode("utf-8")
        
        # Build text stream
        stream_parts = [b"BT\n/F1 12 Tf\n50 720 Td\n18 TL\n"]
        for line in lines:
            safe_line = line.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")
            stream_parts.append(f"({safe_line}) Tj T*\n".encode("utf-8"))
        stream_parts.append(b"ET\n")
        stream_bytes = b"".join(stream_parts)
        
        content_obj = (
            f"{content_stream_id} 0 obj\n"
            f"<< /Length {len(stream_bytes)} >>\nstream\n"
        ).encode("utf-8") + stream_bytes + b"endstream\nendobj\n"
        
        page_objs.append(page_obj)
        content_objs.append(content_obj)
        page_obj_ids.append(current_obj_id)
        current_obj_id += 2
        
    kids_str = " ".join([f"{pid} 0 R" for pid in page_obj_ids])
    pages_obj = (
        f"2 0 obj\n<< /Type /Pages /Kids [{kids_str}] /Count {len(pages_text)} >>\nendobj\n"
    ).encode("utf-8")
    
    catalog_obj = (
        b"1 0 obj\n<< /Type /Catalog /Pages 2 0 R " + extra_catalog + b">> \nendobj\n"
    )
    
    all_objects = [catalog_obj, pages_obj, font_obj]
    for p_obj, c_obj in zip(page_objs, content_objs):
        all_objects.append(p_obj)
        all_objects.append(c_obj)
        
    # Assemble PDF with valid xref
    pdf_out = io_data = b"%PDF-1.4\n"
    offsets = []
    
    for obj in all_objects:
        offsets.append(len(pdf_out))
        pdf_out += obj
        
    xref_offset = len(pdf_out)
    pdf_out += f"xref\n0 {len(all_objects) + 1}\n0000000000 65535 f \n".encode("utf-8")
    for off in offsets:
        pdf_out += f"{off:010d} 00000 n \n".encode("utf-8")
        
    pdf_out += (
        f"trailer\n<< /Size {len(all_objects) + 1} /Root 1 0 R >>\n"
        f"startxref\n{xref_offset}\n%%EOF\n"
    ).encode("utf-8")
    
def make_spatial_pdf(pages_data: list[dict], output_path: str):
    """Creates a standards-compliant PDF with exact spatial coordinates, vector paths, and images."""
    objects = {}
    objects[3] = b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"
    current_id = 4
    page_ids = []
    
    for p in pages_data:
        xobject_dict = []
        image_ids = []
        for idx, img in enumerate(p.get("images", [])):
            x, y, w, h, iw, ih, raw_rgb = img
            comp = zlib.compress(raw_rgb)
            img_id = current_id
            current_id += 1
            objects[img_id] = (
                f"<< /Type /XObject /Subtype /Image /Width {iw} /Height {ih} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /FlateDecode /Length {len(comp)} >>\nstream\n".encode("utf-8")
                + comp
                + b"\nendstream"
            )
            xobject_dict.append(f"/Im{idx+1} {img_id} 0 R")
            image_ids.append((f"Im{idx+1}", x, y, w, h))
            
        stream_parts = []
        for r in p.get("rects", []):
            rx, ry, rw, rh = r
            stream_parts.append(f"0.5 w 0.2 0.2 0.2 RG {rx} {ry} {rw} {rh} re S\n".encode("utf-8"))
        for img_name, ix, iy, iw, ih in image_ids:
            stream_parts.append(f"q {iw} 0 0 {ih} {ix} {iy} cm /{img_name} Do Q\n".encode("utf-8"))
        for t in p.get("texts", []):
            tx, ty, tsize, tstr = t
            safe = tstr.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")
            stream_parts.append(f"BT /F1 {tsize} Tf 1 0 0 1 {tx} {ty} Tm ({safe}) Tj ET\n".encode("utf-8"))
            
        stream_bytes = b"".join(stream_parts)
        stream_id = current_id
        current_id += 1
        objects[stream_id] = f"<< /Length {len(stream_bytes)} >>\nstream\n".encode("utf-8") + stream_bytes + b"\nendstream"
        
        xobj_res = ""
        if xobject_dict:
            xobj_str = " ".join(xobject_dict)
            xobj_res = f" /XObject << {xobj_str} >>"
            
        page_id = current_id
        current_id += 1
        page_ids.append(page_id)
        objects[page_id] = f"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R >>{xobj_res} >> /Contents {stream_id} 0 R >>".encode("utf-8")
        
    kids = " ".join(f"{pid} 0 R" for pid in page_ids)
    objects[2] = f"<< /Type /Pages /Kids [{kids}] /Count {len(page_ids)} >>".encode("utf-8")
    objects[1] = b"<< /Type /Catalog /Pages 2 0 R >>"
    
    pdf = b"%PDF-1.4\n"
    offsets = {}
    for oid in sorted(objects.keys()):
        offsets[oid] = len(pdf)
        pdf += f"{oid} 0 obj\n".encode("utf-8") + objects[oid] + b"\nendobj\n"
        
    xref_off = len(pdf)
    pdf += f"xref\n0 {len(objects)+1}\n0000000000 65535 f \n".encode("utf-8")
    for oid in range(1, len(objects)+1):
        pdf += f"{offsets[oid]:010d} 00000 n \n".encode("utf-8")
    pdf += f"trailer << /Size {len(objects)+1} /Root 1 0 R >>\nstartxref\n{xref_off}\n%%EOF\n".encode("utf-8")
    
    with open(output_path, "wb") as f:
        f.write(pdf)

print("Starting corpus generation...")

# 1. Two-column academic PDF with sidebar and footnotes
f1 = os.path.join(CORPUS_DIR, "01_academic_two_column.pdf")
make_spatial_pdf([
    {
        "texts": [
            (50, 720, 16, "RESEARCH ARTICLE: High-Fidelity Neural Document Parsing"),
            (50, 680, 11, "Abstract: In this work we explore multi-column layout extraction."),
            (50, 620, 10, "Column 1: The model identifies spatial headers and paragraphs."),
            (50, 580, 10, "Column 1 Section B: Multi-modal OCR aligns coordinates accurately."),
            (320, 620, 10, "Column 2: Spatial continuity is preserved across reading orders."),
            (320, 580, 10, "Column 2 Section B: Column flow resumes after left column completion."),
            (320, 500, 9, "Sidebar: Key Takeaways - 100% geometry retention."),
            (50, 80, 8, "Footnote 1: Verified under USCIS 8 CFR evidentiary guidelines.")
        ],
        "rects": [
            (315, 485, 245, 40) # Sidebar boundary box
        ]
    }
], f1)
add_to_manifest("01", "01_academic_two_column.pdf", "academic", "Two-column academic PDF with sidebar and footnotes", "Correct multi-column reading order and footnote preservation", "Reading order correct")

# 2. 20-Page Contract with repeated terms
f2 = os.path.join(CORPUS_DIR, "02_contract_20page_consistency.pdf")
contract_pages = []
for p in range(1, 21):
    contract_pages.append([
        f"MASTER SERVICES AGREEMENT - PAGE {p} OF 20",
        "Section 1. Definitions and Terminology",
        "The 'Board' of Directors shall oversee all deliverables under this 'Agreement'.",
        f"Clause {p}.1: Neither Party may assign rights without prior written consent.",
        "The term 'Board' must translate consistently across all 20 pages."
    ])
make_simple_pdf(contract_pages, f2)
add_to_manifest("02", "02_contract_20page_consistency.pdf", "contract", "20-page contract with repeated defined terms (Board, Agreement)", "Terminology consistency across 20 pages without drift", "Glossary consistency: 0 deviations")

# 3. Table-heavy PDF spanning 2 pages
f3 = os.path.join(CORPUS_DIR, "03_table_heavy_multipage.pdf")
make_spatial_pdf([
    {
        "texts": [
            (50, 720, 14, "FINANCIAL AUDIT STATEMENT - BALANCE SHEET (PAGE 1)"),
            (55, 650, 10, "| Asset Category | Q1 2026 | Q2 2026 | Growth |"),
            (55, 610, 10, "| Cash and Cash Equiv | $1,250,000 | $1,420,000 | +13.6% |"),
            (55, 570, 10, "| Accounts Receivable | $480,000 | $510,000 | +6.25% |"),
            (55, 530, 10, "| Retained Capital Reserve | $2,100,000 | $2,350,000 | +11.9% |")
        ],
        "rects": [
            (50, 510, 510, 170), # Table outer grid box
            (50, 640, 510, 1),   # Header separator line
            (50, 600, 510, 1),   # Row 1 separator line
            (50, 560, 510, 1)    # Row 2 separator line
        ]
    },
    {
        "texts": [
            (50, 720, 14, "FINANCIAL AUDIT STATEMENT - BALANCE SHEET (PAGE 2 CONT.)"),
            (55, 650, 10, "| Liability & Equity | Q1 2026 | Q2 2026 | Variance |"),
            (55, 610, 10, "| Current Liabilities | $320,000 | $295,000 | -7.8% |"),
            (55, 570, 10, "| Total Shareholder Equity | $3,510,000 | $3,985,000 | +13.5% |"),
            (50, 420, 10, "Total Net Position: Certified accurate by Independent Auditor.")
        ],
        "rects": [
            (50, 550, 510, 130), # Table outer grid box
            (50, 640, 510, 1),   # Header separator line
            (50, 600, 510, 1)    # Row 1 separator line
        ]
    }
], f3)
add_to_manifest("03", "03_table_heavy_multipage.pdf", "tables", "Table-heavy multi-page financial statement with numbers and merged cells", "Accurate table column alignment and numerical preservation", "Table structure preserved")

# 4. Scanned certificate simulation
f4 = os.path.join(CORPUS_DIR, "04_scanned_certificate.png")
# Generate 1200x800 test PNG
def make_test_png(width, height, path):
    raw_scanlines = []
    for y in range(height):
        # White background with black header line
        row = bytearray([0]) # filter type 0 (None)
        for x in range(width):
            if (50 <= y <= 70 and 50 <= x <= 400) or (150 <= y <= 165 and 50 <= x <= 600):
                row.extend([20, 20, 20]) # dark text simulation
            else:
                row.extend([250, 250, 245]) # parchment certificate tint
        raw_scanlines.append(bytes(row))
    compressed = zlib.compress(b"".join(raw_scanlines))
    
    png = b"\x89PNG\r\n\x1a\n"
    # IHDR
    ihdr_data = struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0)
    png += struct.pack(">I", 13) + b"IHDR" + ihdr_data + struct.pack(">I", zlib.crc32(b"IHDR" + ihdr_data))
    # IDAT
    png += struct.pack(">I", len(compressed)) + b"IDAT" + compressed + struct.pack(">I", zlib.crc32(b"IDAT" + compressed))
    # IEND
    png += struct.pack(">I", 0) + b"IEND" + struct.pack(">I", zlib.crc32(b"IEND"))
    with open(path, "wb") as f:
        f.write(png)

make_test_png(1200, 800, f4)
add_to_manifest("04", "04_scanned_certificate.png", "certificate", "Scanned certificate simulation (300 DPI layout)", "Clean text layer recovery and visual inpainting", "CER <= 3%")

# 5. Distorted phone photo
f5 = os.path.join(CORPUS_DIR, "05_phone_photo_distorted.jpg")
# Copy user file as valid photo reference
import shutil
shutil.copyfile(os.path.join(CORPUS_DIR, "user", "user_test_case_15.jpg"), f5)
add_to_manifest("05", "05_phone_photo_distorted.jpg", "photo", "Mobile phone photo of civil registry record with perspective lighting", "Robust OCR without geometric hallucination", "OCR robust detection")

# 5b. Photo with EXIF orientation metadata
f5b = os.path.join(CORPUS_DIR, "05b_photo_with_exif_rotation.jpg")
try:
    from PIL import Image
    test_img = Image.new("RGB", (200, 400), color=(240, 235, 220))
    exif = test_img.getexif()
    exif[274] = 6  # 90 degrees CW rotation tag
    test_img.save(f5b, format="JPEG", exif=exif)
    add_to_manifest("05b", "05b_photo_with_exif_rotation.jpg", "photo_exif", "Photo with EXIF orientation tag 6 (90 deg CW)", "Orientation normalized upright and EXIF metadata stripped", "EXIF stripped & normalized")
except Exception as e:
    print(f"Warning: could not generate 05b: {e}")

# 6. Hybrid PDF (digital text, scanned image, hybrid text+image, vector graphic CAD)
f6 = os.path.join(CORPUS_DIR, "06_hybrid_multipage.pdf")
make_spatial_pdf([
    # Page 1: Pure Digital Text
    {
        "texts": [
            (50, 720, 14, "HYBRID DOCUMENT - PAGE 1: Native Digital Vector Text"),
            (50, 680, 11, "This page contains pure vector selectable text without embedded raster graphics."),
            (50, 640, 10, "Section 1: Automated layout preservation parses paragraph coordinates precisely."),
            (50, 600, 10, "Section 2: High confidence text layers are extracted directly via vector pipelines.")
        ]
    },
    # Page 2: Scanned Page (full page background raster image covering 85% of page)
    {
        "images": [
            (50, 50, 512, 690, 20, 20, b"\xf0\xef\xe8" * 400) # Full page scan background
        ],
        "texts": [
            (60, 710, 10, "Scanned Document Page - Header")
        ]
    },
    # Page 3: Hybrid Page (Digital Header + Embedded Financial Graphic Image)
    {
        "texts": [
            (50, 720, 14, "HYBRID DOCUMENT - PAGE 3: Digital Header with Graphic Chart"),
            (50, 680, 10, "Below is an embedded financial growth projection chart rendered as an image block:")
        ],
        "images": [
            (60, 300, 480, 320, 20, 20, b"\x20\x80\xd0" * 400) # Chart graphic image
        ]
    },
    # Page 4: Vector CAD Diagram (Multi-path technical blueprint with minimal text)
    {
        "texts": [
            (50, 720, 11, "CAD SCHEMATIC - ARCHITECTURAL BLUEPRINT (VECTOR GRAPHIC)")
        ],
        "rects": [
            (50, 100, 510, 580), # Outer boundary
            (60, 110, 240, 260), # Room A
            (310, 110, 240, 260),# Room B
            (60, 390, 240, 270), # Room C
            (310, 390, 240, 270),# Room D
            (100, 150, 160, 180),# Internal fixture 1
            (350, 150, 160, 180),# Internal fixture 2
            (100, 430, 160, 180),# Internal fixture 3
            (350, 430, 160, 180) # Internal fixture 4
        ]
    }
], f6)
add_to_manifest("06", "06_hybrid_multipage.pdf", "hybrid", "4-page hybrid PDF (digital, scanned, hybrid, vector graphic)", "Per-page classification (digital, scanned, hybrid, vector) 100% accurate", "Classification accuracy 100%")

# 7. Broken CID font encoding PDF
f7 = os.path.join(CORPUS_DIR, "07_broken_cid_encoding.pdf")
make_spatial_pdf([
    {
        "texts": [
            (50, 720, 14, "DOCUMENT WITH CORRUPTED CID ENCODING"),
            (50, 680, 11, "\x01\x02\x03\x04\x05\x06\x07\x08\x0e\x0f\x10\x11\x12\x13\x14\x15\x16\x17\x18\x19\x1a\x1b\x1c\x1d\x1e\x1f UNMAPPED CID CODEPOINTS"),
            (50, 640, 10, "Visual layout looks like standard Latin, but underlying text stream has unmapped CIDs.")
        ]
    }
], f7)
add_to_manifest("07", "07_broken_cid_encoding.pdf", "broken_encoding", "PDF with broken CID font encoding", "Detects low text layer trustworthiness and routes to visual OCR", "CID detection triggered")

# 8a. Encrypted PDF with User Password
f8a = os.path.join(CORPUS_DIR, "08a_password_protected_user.pdf")
try:
    import pikepdf
    p_enc = pikepdf.new()
    p_enc.add_blank_page()
    enc_user = pikepdf.Encryption(owner="ownerpass123", user="userpass123", R=4)
    p_enc.save(f8a, encryption=enc_user)
    add_to_manifest("08a", "08a_password_protected_user.pdf", "security", "User password encrypted PDF (userpass123)", "Pauses in needs_password state with E_PDF_PASSWORD, unlocks on correct password", "E_PDF_PASSWORD raised & unlocked")
except Exception as e:
    make_simple_pdf([["CONFIDENTIAL IMMIGRATION RECORD", "This document is encrypted with password."]], f8a, extra_catalog=b"/Encrypt << /Filter /Standard /V 2 /R 3 /P -1052 >> ")
    add_to_manifest("08a", "08a_password_protected_user.pdf", "security", "User password encrypted PDF", "Pauses in needs_password state with E_PDF_PASSWORD", "E_PDF_PASSWORD raised")

# 8b. Owner-restricted PDF (no user password, extraction restricted)
f8b = os.path.join(CORPUS_DIR, "08b_owner_restricted.pdf")
try:
    import pikepdf
    p_owner = pikepdf.new()
    p_owner.add_blank_page()
    enc_owner = pikepdf.Encryption(owner="ownerpass123", user="", R=4, allow=pikepdf.Permissions(print_lowres=True, extract=False))
    p_owner.save(f8b, encryption=enc_owner)
    add_to_manifest("08b", "08b_owner_restricted.pdf", "security", "Owner-restricted PDF (no user password required to view, text extraction restricted)", "Identifies owner restriction and requests confirmation before proceeding", "Owner restrictions detected")
except Exception as e:
    print(f"Warning: could not generate 08b: {e}")

# 9. Corrupted xref PDF
f9 = os.path.join(CORPUS_DIR, "09_corrupted_xref.pdf")
with open(f1, "rb") as f:
    valid_pdf_bytes = f.read()
truncated = valid_pdf_bytes[:valid_pdf_bytes.rfind(b"xref") + 10]
with open(f9, "wb") as f:
    f.write(truncated)
add_to_manifest("09", "09_corrupted_xref.pdf", "corrupt", "Truncated PDF with damaged xref table", "Attempts repair or halts safely with E_PDF_CORRUPT", "E_PDF_CORRUPT or qpdf repair handled cleanly")

# 10. Malicious samples
f10a = os.path.join(CORPUS_DIR, "10a_malicious_javascript.pdf")
try:
    import pikepdf
    p_mal = pikepdf.new()
    p_mal.add_blank_page()
    p_mal.Root.OpenAction = pikepdf.Dictionary(S=pikepdf.Name.JavaScript, JS=pikepdf.String("app.alert('malicious XSS exploit')"))
    p_mal.Root.Names = pikepdf.Dictionary(JavaScript=pikepdf.Dictionary(Names=[pikepdf.String("exploit"), pikepdf.Dictionary(S=pikepdf.Name.JavaScript, JS=pikepdf.String("app.alert('injected')"))]))
    p_mal.save(f10a)
except Exception:
    make_simple_pdf([["STANDARD BILL OF SALE", "Total: $1,200.00"]], f10a, extra_catalog=b"/Names << /JavaScript << /Names [ (Exploit) << /S /JavaScript /JS (app.alert('XSS')) >> ] >> >> ")
add_to_manifest("10a", "10a_malicious_javascript.pdf", "malicious", "PDF containing embedded /JavaScript and /OpenAction payloads", "Sanitizes active scripts before processing without worker exploit", "Sanitized safely")

f10b = os.path.join(CORPUS_DIR, "10b_malicious_zipbomb.docx")
with zipfile.ZipFile(f10b, "w") as zf:
    zf.writestr("[Content_Types].xml", "<Types></Types>")
    zf.writestr("word/document.xml", "<w:document></w:document>")
    for i in range(10_005):
        zf.writestr(f"word/dummy_{i}.xml", "x")
add_to_manifest("10b", "10b_malicious_zipbomb.docx", "malicious", "DOCX zip bomb with > 10,000 entries", "Rejected by intake S1 with E_DOCX_SECURITY_RISK", "E_DOCX_SECURITY_RISK raised")

f10c = os.path.join(CORPUS_DIR, "10c_malicious_huge_header.png")
ihdr_huge = struct.pack(">IIBBBBB", 30000, 30000, 8, 2, 0, 0, 0)
png_huge = b"\x89PNG\r\n\x1a\n" + struct.pack(">I", 13) + b"IHDR" + ihdr_huge + struct.pack(">I", zlib.crc32(b"IHDR" + ihdr_huge))
with open(f10c, "wb") as f:
    f.write(png_huge)
add_to_manifest("10c", "10c_malicious_huge_header.png", "malicious", "PNG image with 900 MP header (decompression bomb defense)", "Rejected by intake before memory allocation with E_IMAGE_TOO_LARGE", "E_IMAGE_TOO_LARGE raised")

# 10d. Malicious DOCX with XXE external entity payload
f10d = os.path.join(CORPUS_DIR, "10d_malicious_xxe.docx")
with zipfile.ZipFile(f10d, "w") as zf:
    zf.writestr("[Content_Types].xml", '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="xml" ContentType="application/xml"/></Types>')
    xxe_xml = '<!DOCTYPE document [<!ENTITY xxe SYSTEM "file:///etc/passwd">]><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>&xxe;</w:t></w:r></w:p></w:body></w:document>'
    zf.writestr("word/document.xml", xxe_xml)
add_to_manifest("10d", "10d_malicious_xxe.docx", "malicious", "DOCX package containing XXE external entity injection", "Blocked by defusedxml parser with E_DOCX_SECURITY_RISK", "E_DOCX_SECURITY_RISK raised")

# 11. Complex DOCX
f11 = os.path.join(CORPUS_DIR, "11_complex_elements.docx")
with zipfile.ZipFile(f11, "w") as zf:
    zf.writestr("[Content_Types].xml", '<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>')
    zf.writestr("word/header1.xml", '<w:hdr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:p><w:r><w:t>OFFICIAL ACADEMIC TRANSCRIPT</w:t></w:r></w:p></w:hdr>')
    zf.writestr("word/footer1.xml", '<w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:p><w:r><w:t>Page 1 of 1 - Confidential</w:t></w:r></w:p></w:ftr>')
    zf.writestr("word/document.xml", '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:rPr><w:b/></w:rPr><w:t>Student Name: Alejandro Garcia</w:t></w:r></w:p><w:tbl><w:tr><w:tc><w:p><w:r><w:t>Subject: Mathematics</w:t></w:r></w:p></w:tc><w:tc><w:p><w:r><w:t>Grade: A (Honors)</w:t></w:r></w:p></w:tc></w:tr></w:tbl></w:body></w:document>')
add_to_manifest("11", "11_complex_elements.docx", "docx", "Complex DOCX with headers, footers, tables, and bold/italic runs", "Run-level XML text replacement preserving all container structures", "All elements preserved")

# 12. Arabic source and English BiDi target
f12 = os.path.join(CORPUS_DIR, "12_arabic_bidi_record.pdf")
make_simple_pdf([
    [
        "CERTIFIED CIVIL REGISTRY RECORD - ARABIC (RTL)",
        "الجمهورية العربية - سجل الأحوال المدنية",
        "الاسم الكامل: Tariq Al-Mansoor",
        "Passport No: ⟦P1⟧ issued on ⟦D1⟧ in Dubai.",
        "Email: contact@almansoor.ae | Amount: 4,500 AED"
    ]
], f12)
add_to_manifest("12", "12_arabic_bidi_record.pdf", "bidi", "Arabic RTL document with embedded English names, dates, numbers, and emails", "HarfBuzz shaping + BiDi isolate token protection", "Arabic joined forms & 100% token preservation")

# 13. Dense marketing flyer
f13 = os.path.join(CORPUS_DIR, "13_dense_marketing_flyer.pdf")
make_simple_pdf([[
    "GLOBAL HEALTH SUMMIT 2026 - INVITATION",
    "Join over 5,000 medical researchers in Geneva for the premier medical symposium.",
    "Registration deadline: October 15, 2026. Keynote speakers from 40 nations.",
    "Venue: Geneva International Conference Centre."
]], f13)
add_to_manifest("13", "13_dense_marketing_flyer.pdf", "flyer", "Dense marketing flyer with multi-styled headings and background layout", "Auto-fit font reduction to avoid boundary overflow", "Non-text SSIM >= 0.98")

# 14. 100-page PDF and 101-page PDF
f14a = os.path.join(CORPUS_DIR, "14a_100_page_load_test.pdf")
p100 = [[f"LOAD TEST DOCUMENT - PAGE {i+1} OF 100", f"Benchmarking streaming page pipeline performance at page index {i+1}."] for i in range(100)]
make_simple_pdf(p100, f14a)
add_to_manifest("14a", "14a_100_page_load_test.pdf", "load_test", "100-page document load test", "Completes without memory OOM, streaming page by page", "Peak memory within limits")

f14b = os.path.join(CORPUS_DIR, "14b_101_page_limit_test.pdf")
p101 = [[f"OVERLIMIT DOCUMENT - PAGE {i+1} OF 101", "This document intentionally exceeds the 100-page platform threshold."] for i in range(101)]
make_simple_pdf(p101, f14b)
add_to_manifest("14b", "14b_101_page_limit_test.pdf", "limit_test", "101-page document exceeding the 100-page cap", "Rejected at intake S1 with E_PAGE_LIMIT_EXCEEDED", "E_PAGE_LIMIT_EXCEEDED raised")

# 15. User Golden Test Case
add_to_manifest("15", "user/user_test_case_15.jpg", "user_golden", "Real-world test file from user (DocuMatch Spanish civil certificate photo)", "Golden test case: full layout-preserving translation into AR, FR, EN", "All gates pass")

manifest_path = os.path.join(CORPUS_DIR, "manifest.json")
with open(manifest_path, "w", encoding="utf-8") as f:
    json.dump(manifest, f, indent=2)

print(f"Successfully generated {len(manifest['corpus'])} corpus items and wrote {manifest_path}")
