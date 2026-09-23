# Milestone 3 Defect Log & Root-Cause Resolutions

### Defect 1: Two-Column Interleaved Reading Order in Naive Coordinate Sorting
- **Symptoms**: Naive sorting of bounding boxes solely by `top` coordinate (`y0`) interleaved left-column and right-column text blocks on `#01_academic_two_column.pdf`, destroying document semantic flow.
- **Root Cause**: In multi-column layouts, paragraphs in Column 1 and Column 2 often share identical or overlapping vertical `y` coordinates. A purely vertical sort alternates between left and right paragraphs.
- **Resolution**: Implemented column-aware XY-Cut block partitioning in `api/analyze.py`. The algorithm first isolates spanning full-width elements (title, running header, footnote/footer), then partitions body blocks into Column 0 (`x < width * 0.50`) and Column 1 (`x >= width * 0.50`). Each column is sorted top-to-bottom internally, guaranteeing the left column is completely traversed before reading moves to the right column.

### Defect 2: Broken CID Encoding Detection & False Trust in Corrupted Text Layers
- **Symptoms**: PDF files with missing or corrupted `/ToUnicode` CMap tables (such as `#07_broken_cid_encoding.pdf`) emit gibberish glyph mappings or replacement symbols, misleading parsers into classifying the page as high-confidence digital text.
- **Root Cause**: Basic PDF extractors only check if character strings exist; they do not assess character validity, resulting in broken text being sent to translation and corrupting downstream rendering.
- **Resolution**: Implemented a comprehensive text trustworthiness evaluator in `api/analyze.py`. It inspects Unicode streams for non-printable control characters (`ord(c) < 32` except whitespace), Private Use Area characters (`0xE000` to `0xF8FF`), and `U+FFFD`. When the garbage ratio exceeds 8% (`garbage_ratio > 0.08`) or overall trustworthiness drops below 70%, `is_broken_encoding: True` is flagged and the page is routed to visual OCR (`kind: scanned`), preventing gibberish extraction.

### Defect 3: Gridless Table Cell Association
- **Symptoms**: Tables in digital PDFs often lack explicit table tags, leading to cell fragments being extracted as disconnected, random text lines out of tabular context.
- **Root Cause**: PDF vector streams do not inherently associate text objects with cells or rows without structural tag trees.
- **Resolution**: Implemented vector line and coordinate clustering table extraction in `api/analyze.py`. It detects horizontal and vertical grid lines, groups text blocks within cell bounding boxes, identifies header rows, and constructs clean matrix representations `(row, col, rowspan, colspan, text, is_header)` for downstream layout-preserving table rendering.
