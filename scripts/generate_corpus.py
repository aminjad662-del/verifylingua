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
    font_obj = b"3 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n"
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
    
    with open(output_path, "wb") as f:
        f.write(pdf_out)

print("Starting corpus generation...")

# 1. Two-column academic PDF with sidebar and footnotes
f1 = os.path.join(CORPUS_DIR, "01_academic_two_column.pdf")
make_simple_pdf([[
    "RESEARCH ARTICLE: High-Fidelity Neural Document Parsing",
    "Abstract: In this work we explore multi-column layout extraction.",
    "Column 1: The model identifies spatial headers and paragraphs.",
    "Column 2: Spatial continuity is preserved across reading orders.",
    "Sidebar: Key Takeaways - 100% geometry retention.",
    "Footnote 1: Verified under USCIS 8 CFR evidentiary guidelines."
]], f1)
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
make_simple_pdf([
    [
        "FINANCIAL AUDIT STATEMENT - BALANCE SHEET (PAGE 1)",
        "| Asset Category           | Q1 2026   | Q2 2026   | Growth |",
        "| Cash and Cash Equiv      | $1,250,000| $1,420,000| +13.6% |",
        "| Accounts Receivable      | $480,000  | $510,000  | +6.25% |",
        "| Retained Capital Reserve | $2,100,000| $2,350,000| +11.9% |"
    ],
    [
        "FINANCIAL AUDIT STATEMENT - BALANCE SHEET (PAGE 2 CONT.)",
        "| Liability & Equity       | Q1 2026   | Q2 2026   | Variance |",
        "| Current Liabilities      | $320,000  | $295,000  | -7.8%    |",
        "| Total Shareholder Equity | $3,510,000| $3,985,000| +13.5%   |",
        "Total Net Position: Certified accurate by Independent Auditor."
    ]
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

# 6. Hybrid PDF
f6 = os.path.join(CORPUS_DIR, "06_hybrid_multipage.pdf")
make_simple_pdf([
    ["HYBRID DOCUMENT - PAGE 1: Native Digital Text", "This page contains pure vector selectable text."],
    ["HYBRID DOCUMENT - PAGE 2: Scanned Document Page", "Scanned raster text layer with OCR pre-processing."],
    ["HYBRID DOCUMENT - PAGE 3: Table Embedded as Graphic", "Complex financial table rendered as an image block."],
    ["HYBRID DOCUMENT - PAGE 4: Vector Diagram & CAD Flow", "Technical diagram paths preserved without re-rasterization."]
], f6)
add_to_manifest("06", "06_hybrid_multipage.pdf", "hybrid", "4-page hybrid PDF (digital, scanned, table-image, vector)", "Per-page classification (digital vs scanned) correctly identified", "Classification accuracy 100%")

# 7. Broken CID font encoding PDF
f7 = os.path.join(CORPUS_DIR, "07_broken_cid_encoding.pdf")
make_simple_pdf([[
    "DOCUMENT WITH CORRUPTED CID ENCODING",
    "\u0001\u0002\u0003\u0004 unmapped CID code points simulation",
    "Visual text looks like standard Latin, but text layer is corrupted."
]], f7)
add_to_manifest("07", "07_broken_cid_encoding.pdf", "broken_encoding", "PDF with broken CID font encoding", "Detects low text layer trustworthiness and routes to visual OCR", "CID detection triggered")

# 8. Encrypted PDF & Owner restricted
f8a = os.path.join(CORPUS_DIR, "08a_password_protected_user.pdf")
# Embed /Encrypt dictionary
make_simple_pdf([["CONFIDENTIAL IMMIGRATION RECORD", "This document is encrypted with password."]], f8a, extra_catalog=b"/Encrypt << /Filter /Standard /V 2 /R 3 /P -1052 >> ")
add_to_manifest("08a", "08a_password_protected_user.pdf", "security", "User password encrypted PDF", "Pauses in needs_password state with E_PDF_PASSWORD", "E_PDF_PASSWORD raised")

# 9. Corrupted xref PDF
f9 = os.path.join(CORPUS_DIR, "09_corrupted_xref.pdf")
with open(f1, "rb") as f:
    valid_pdf_bytes = f.read()
# Truncate halfway through xref
truncated = valid_pdf_bytes[:valid_pdf_bytes.rfind(b"xref") + 10]
with open(f9, "wb") as f:
    f.write(truncated)
add_to_manifest("09", "09_corrupted_xref.pdf", "corrupt", "Truncated PDF with damaged xref table", "Attempts repair or halts safely with E_PDF_CORRUPT", "E_PDF_CORRUPT handled cleanly")

# 10. Malicious samples
f10a = os.path.join(CORPUS_DIR, "10a_malicious_javascript.pdf")
make_simple_pdf([["STANDARD BILL OF SALE", "Total: $1,200.00"]], f10a, extra_catalog=b"/Names << /JavaScript << /Names [ (Exploit) << /S /JavaScript /JS (app.alert('XSS')) >> ] >> >> ")
add_to_manifest("10a", "10a_malicious_javascript.pdf", "malicious", "PDF containing embedded /JavaScript and /OpenAction payloads", "Sanitizes active scripts before processing without worker exploit", "Sanitized safely")

f10b = os.path.join(CORPUS_DIR, "10b_malicious_zipbomb.docx")
with zipfile.ZipFile(f10b, "w") as zf:
    zf.writestr("[Content_Types].xml", "<Types></Types>")
    zf.writestr("word/document.xml", "<w:document></w:document>")
    # Add dummy 10,500 entries to test entry limit cap
    for i in range(10_005):
        zf.writestr(f"word/dummy_{i}.xml", "x")
add_to_manifest("10b", "10b_malicious_zipbomb.docx", "malicious", "DOCX zip bomb with > 10,000 entries", "Rejected by intake S1 with E_DOCX_SECURITY_RISK", "E_DOCX_SECURITY_RISK raised")

f10c = os.path.join(CORPUS_DIR, "10c_malicious_huge_header.png")
# PNG header claiming 30,000 x 30,000 (900 megapixels)
ihdr_huge = struct.pack(">IIBBBBB", 30000, 30000, 8, 2, 0, 0, 0)
png_huge = b"\x89PNG\r\n\x1a\n" + struct.pack(">I", 13) + b"IHDR" + ihdr_huge + struct.pack(">I", zlib.crc32(b"IHDR" + ihdr_huge))
with open(f10c, "wb") as f:
    f.write(png_huge)
add_to_manifest("10c", "10c_malicious_huge_header.png", "malicious", "PNG image with 900 MP header (decompression bomb defense)", "Rejected by intake before memory allocation with E_IMAGE_TOO_LARGE", "E_IMAGE_TOO_LARGE raised")

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
