# BUILD PROMPT — Layout-Preserving Document Translation Service
### (Automated document processing + optional certified human review)

> Paste this whole file into Claude Code at the root of an empty repo (or save it as `docs/BUILD_PROMPT.md` and tell Claude Code: "Read docs/BUILD_PROMPT.md and execute it milestone by milestone.").

---

## 0. Your role and the rules you work under

You are the lead engineer building a **real, production-grade document translation service**. It is not a demo, a mockup, or a research report. Users upload PDF, DOCX, PNG or JPG files, choose a target language, and download a translated file **in the same format**, with layout, fonts, tables, images and structure preserved closely enough that they do not need to redesign anything.

### Non-negotiable working rules

1. **No simulated completion.** Never write "this would work", "in production you would…", placeholder functions, mocked translation calls, or TODOs on the main path. If something is not built, say it is not built.
2. **Evidence or it didn't happen.** Every milestone ends with commands you actually ran and their real output: test results, generated output files, rendered PNG comparisons, and the QA report JSON. Put them in `reports/milestone-N/`.
3. **Fix-and-retest loop.** After each milestone, run the full test suite and the golden-corpus QA (Section 10). If any gate fails, fix the root cause (not the test), rerun everything, and repeat until all gates pass. Log each failure → cause → fix in `reports/milestone-N/defects.md`.
4. **Stop and ask only for things you cannot do yourself:** API keys, paid accounts, DNS, legal decisions (Section 12). For everything else, decide, document the decision in `docs/DECISIONS.md`, and continue.
5. **Measure, don't guess.** Timings, memory peaks, token counts and cost per page are logged per job and summarized in each milestone report.
6. **Keep the main path honest.** If a page cannot be translated to quality, the system says so to the user, per page, with a reason. It never silently ships a broken page.

### Environment

- Development machine is **Windows**. Run all document-processing services in **Docker (Docker Desktop + WSL2)** so behavior matches the Linux production servers. Do not install Tesseract/LibreOffice/etc. natively on Windows.
- The user's real-world test file is at `C:\Users\aminj\Downloads\testtrans`. It may be a single file without extension or a folder. Inspect it first (magic bytes, not the name), copy it into `tests/corpus/user/` (git-ignored), and make it a permanent golden test case (Section 10).

---

## 1. Product definition

### Two service tiers (this is how we beat immitranslate.com and rushtranslate.com)

Those competitors are **human certified translation services** sold per page with turnaround measured in hours or days, and the output is typically a retyped document, not a layout-faithful one. We compete by combining automated document processing with human review only where it adds value:

| | **Instant** (fully automated) | **Certified** (automated + human linguist) |
|---|---|---|
| Output | Same format, layout-preserved | Same, plus signed certification page |
| Time | Seconds to a few minutes | Target: a few hours |
| Use | Business docs, contracts (non-official), manuals, reading | USCIS / immigration / courts / universities |
| Human involved | No | Yes: a qualified translator reviews every segment in our review tool and signs |

Key differentiators to build (all must be real features):
- **Free instant preview** of page 1 (watermarked) before payment, so the user sees quality first.
- **Segment editor:** user (or reviewer) edits any sentence, and only that page is re-rendered in seconds.
- **Name and number protection:** passport numbers, dates, ID numbers, amounts are locked and verified to survive translation unchanged.
- **Name spelling capture:** for Certified orders, the user enters the Latin spelling of every person's name exactly as on their passport; the glossary forces those spellings. (Mismatched name transliteration is the most common real rejection reason for immigration translations.)
- **Per-page transparency:** live progress per stage and per page, with specific error messages.

Use the phrase **"automated document processing"** naturally in marketing copy, page titles and meta descriptions (landing page, pricing, how-it-works). Do not keyword-stuff.

### Scope for v1
- Input: PDF (digital, scanned, hybrid), DOCX, PNG, JPG/JPEG.
- Output: same format as input.
- Languages v1: English, French, Spanish, Arabic, Portuguese, German, Italian, plus Chinese (Simplified) as a CJK stress test. Any pair among them.
- Limits v1: 50 MB, 100 pages, 60 megapixels per image. Limits are enforced with clear messages, and configurable.
- **Not in v1:** PPTX, XLSX, handwriting translation (detected and flagged instead), editable output of scanned PDFs as DOCX.

---

## 2. Architecture (why it looks like this)

Document processing takes from seconds to several minutes and needs heavy native tools (OCR, font shaping, inpainting, LibreOffice). Serverless functions (Vercel, Cloudflare Workers, Supabase Edge) time out and have no room for these tools. So:

```
[Next.js web app]  ──presigned upload──►  [Object storage (S3-compatible, e.g. Cloudflare R2)]
      │  ▲                                            ▲
      │  │ SSE/polling (job + page status)            │ read/write files
      ▼  │                                            │
[API service (FastAPI, Python)] ──enqueue──► [Redis queues] ──► [Worker containers]
      │                                                            │ intake │ analyze/OCR │
      ▼                                                            │ translate (I/O) │ render │ qa │
[Postgres] ◄─────────── source of truth for jobs/pages/segments ───┘
```

- **Web:** Next.js (App Router) + TypeScript + Tailwind. Can be hosted on Vercel or Cloudflare; it only talks to the API and storage.
- **API:** FastAPI (Python). Creates jobs, issues presigned URLs, serves status, handles payments webhooks, review tool endpoints.
- **Workers:** Python, in Docker on a VPS (start with one 8-vCPU/16–32 GB machine; add machines by queue depth). Queue: Redis with Celery (or Dramatiq); separate queues so a flood of OCR work cannot block translation or rendering:
  - `intake` (validation, sanitization), `analyze` (classification, layout, OCR — CPU heavy), `translate` (network-bound, high concurrency, rate-limited), `render` (CPU/memory heavy), `qa`.
- **Postgres** is the source of truth for state; Redis only holds queues, rate-limit buckets and locks. A worker crash must never lose progress.
- **Storage:** S3-compatible bucket with server-side encryption, private by default, short-lived presigned URLs, lifecycle rules for deletion (Section 9).
- Heavy workers run with `--memory` and `--cpus` limits, one heavy task per process, and per-task timeouts, so one hostile or huge file cannot take the server down.

---

## 3. Data model and state machine

Tables (minimum): `users`, `jobs`, `files`, `pages`, `segments`, `glossary_terms`, `job_events`, `cost_ledger`, `reviews`, `orders`.

- `jobs.status`: `uploaded → validating → analyzing → translating → rendering → qa → ready | ready_with_warnings | failed`
- `pages.status`: `pending → analyzed → translated → rendered → qa_passed | qa_warning | failed`, with `pages.kind` ∈ `digital_text | scanned | hybrid | image_only | vector_graphic | blank`, `pages.attempts`, `pages.error_code`.
- `segments`: `id, page_id, block_id, order_index, source_text, source_markup, translated_text, translated_markup, protected_tokens (json), engine, confidence, status, reviewer_edit`.
- Every task is **idempotent** and keyed by `(job_id, page_no, stage)`. Retrying a page never duplicates work or output.
- A failed page is retried up to 3 times with backoff. After that, the job continues; the final output keeps that page in its original form, marks it in the report, and the UI says exactly which page and why. A 100-page job that fails on page 94 still delivers 99 translated pages.

---

## 4. The pipeline, stage by stage

### S1 — Intake and security (before any parser touches the file)
1. Upload goes browser → storage via presigned PUT with a signed `content-length` limit. The API never proxies file bytes.
2. Verify real type by **magic bytes**, not extension. Reject mismatches with `E_TYPE_MISMATCH`.
3. **PDF:** open with `pikepdf` (qpdf) in a sandboxed worker (no network, memory/time limited).
   - Encrypted with a user password → job pauses in `needs_password`; UI asks for the password; it is used in memory only and never stored or logged. Wrong password → `E_PDF_PASSWORD`.
   - Owner-password restrictions only (no-copy/no-extract) → require the user to confirm they have the right to translate the document, then proceed.
   - Strip active content: JavaScript, `/OpenAction`, `/AA`, `/Launch`, embedded files, XFA. Save a sanitized copy; all later stages use only the sanitized copy.
   - Structural damage → try `qpdf` repair; if still broken → `E_PDF_CORRUPT` with a plain explanation.
   - Enforce page count limit and a per-page object/stream size limit.
4. **DOCX:** it is a ZIP. Before extracting: max entries, max total uncompressed size, max compression ratio per entry (zip-bomb defense), reject path traversal names, reject macros (`vbaProject.bin`) or strip them, parse XML with `defusedxml`/hardened lxml (no external entities).
5. **Images:** read header dimensions **before** decoding; reject above the megapixel cap (`E_IMAGE_TOO_LARGE`); set Pillow's `MAX_IMAGE_PIXELS`; apply EXIF orientation; keep DPI and ICC profile for output.
6. Optional ClamAV scan. Log the verdict in `job_events`.

### S2 — Page classification (per page, not per file)
Real files are hybrids: text pages, a scanned page, a page with a table that is really an image. For each PDF page compute:
- area covered by images vs. by extractable text spans;
- **text-layer trustworthiness:** extract text, then render the page at 150 DPI and OCR a sample; compute character-level similarity. Also count Private Use Area code points, `U+FFFD`, and unmapped CID glyphs. If similarity is low or garbage ratio is high, the text layer is **broken encoding** (common with CID fonts): treat the page as `scanned` even though it "has text".
- invisible OCR text layers (text render mode 3 over a scan): treat as `scanned`, but reuse the existing layer only if it passes the similarity check.
Store `kind` and the evidence numbers on the page row.

### S3 — Extraction

**Digital PDF pages:** use a library that gives spans with exact bounding boxes, font name, size, color, flags (bold/italic/serif/mono), and rotation. Keep images and vector drawings untouched; they are never re-drawn.

**Scanned / image regions:** 
- Pre-process: deskew, orientation detection (0/90/180/270), contrast normalization, render at 300 DPI.
- OCR with a detection+recognition engine that returns **line-level boxes and confidence** (e.g., PaddleOCR PP-OCR models; evaluate Surya and Tesseract 5 on the corpus and pick by measured accuracy, recorded in DECISIONS.md).
- Lines with low confidence are sent to a **vision LLM for text correction only, constrained to the boxes the OCR found**. Vision models are good at reading, bad at precise coordinates, so geometry always comes from OCR.
- Detect and **do not translate:** signatures, stamps/seals, handwriting, logos, photos. Record them as `non_text` regions. In Certified mode, reviewers add bracketed notes like `[Official stamp: Ministry of Interior]` in the translation.

**DOCX:** work on the XML directly (python-docx for navigation, lxml for edits). Cover body, tables (incl. merged cells), headers, footers, footnotes/endnotes, text boxes (`w:txbxContent`, including inside `mc:AlternateContent`), comments are left alone. Paragraphs are the translation unit; runs are formatting.

**PNG/JPG:** treated as a single scanned page.

### S4 — Layout understanding and reading order
- Run a layout model (e.g., Docling or a DocLayout-YOLO/Surya-layout model — choose by measured results) to label blocks: title, paragraph, list, table, figure, caption, header, footer, sidebar.
- Reading order: layout model order, validated by a column-aware XY-cut fallback. Sidebars and headers/footers are separate flows, never merged into body sentences.
- Merge lines into paragraphs using geometry (line spacing, indentation, font continuity, hyphenation at line end). Translation must be done on **whole sentences/paragraphs**, never line by line.
- **Tables:** detect cell structure (table-structure model for images; ruling lines + span alignment for digital). Each cell is its own segment with `(row, col, rowspan, colspan)`. Cells are translated with the table's header row as context.

### S5 — Segmentation and protection
- Segment = paragraph, list item, table cell, heading, or text-box. Each keeps an ID and its geometry.
- **Inline formatting** (bold, italic, links, font changes inside a sentence) becomes numbered tags: `<b1>…</b1>`, `<i2>…</i2>`.
- **Protected tokens** are replaced with placeholders before translation and restored after: numbers, dates (format may be localized per rules), IDs, passport/case numbers, emails, URLs, currency amounts, and user-supplied names. Example: `Passport no. ⟦P1⟧ issued ⟦D1⟧`.
- After translation, validation (S7) checks every placeholder and tag returns exactly once.

### S6 — Document-level context and glossary (fixes the "chunking trap")
Before translating any segment:
1. One pass over the whole document (cheap LLM) produces: document type, domain, register, a short summary, and a **glossary**: named entities, organization names, legal/technical terms, and ambiguous words with the chosen translation (e.g., "Board" → "Conseil d'administration" in a corporate document).
2. User-supplied name spellings and a per-customer glossary override everything.
3. Every translation request includes: the summary, the relevant glossary subset (terms present in the chunk), and neighboring segments as read-only context.
4. After translation, a **consistency check** scans all segments for glossary terms and flags any deviation; flagged segments are re-translated with the term forced.

### S7 — Translation engine layer
- Provider-agnostic interface: `translate(batch, src, tgt, context, glossary) -> results`. Implement at least two providers (one LLM API, one fallback: another LLM or a machine translation API such as DeepL/Google). Model names come from config, never hard-coded.
- **Routing to control cost:** plain body text → fast/cheap LLM tier. Tables, legal clauses, low-confidence OCR text, and segments that failed validation once → stronger model. Vision models are used only for OCR correction of flagged lines, never "translate the whole page image".
- **Batching:** send 20–60 segments per request as JSON `{id, text}` with structured-output / JSON-schema enforcement; the response must be `{id, translation}` for exactly the same IDs.
- **Validation of every response (reject and retry if any fails):**
  - same ID set, no missing or extra segments;
  - all placeholders and tags present exactly once and properly nested;
  - output language detected = target language (except for protected tokens);
  - length ratio within bounds per language pair (flag outliers for re-translation — catches omissions and added commentary);
  - no preamble/explanations ("Here is the translation…").
  Retry once with a stricter instruction, then switch provider, then mark the segment failed (page gets `qa_warning`, user sees it).
- **Rate limiting:** a Redis token bucket per provider for requests/min and tokens/min, global concurrency cap, exponential backoff with jitter that honors `Retry-After`, and a circuit breaker that shifts traffic to the fallback provider on sustained 429/5xx.
- **Data policy:** use providers only under terms where API data is not used for training; request zero-data-retention where the provider offers it. The privacy page states exactly what is and isn't guaranteed, and names the subprocessors.

### S8 — Reconstruction (the hard part)

#### Fonts
- Build a font map from original font properties (serif/sans/mono, weight, italic, width) to **open-licensed fonts** (Noto family, IBM Plex, etc., SIL OFL). For each target script pick a matching family: e.g. serif Latin → Noto Serif; Arabic serif-like → Noto Naskh Arabic; Arabic sans → Noto Sans Arabic / IBM Plex Sans Arabic; CJK → Noto Sans/Serif CJK.
- If the original embedded font covers all target characters (check the font's `cmap` with fontTools), reuse it; otherwise substitute.
- **Before rendering**, verify every character of every translated segment is covered by the chosen font; if not, fall back through a chain. This guarantees no tofu boxes or `???`.
- Vendor fonts into the Docker image; subset them at output time to keep files small.

#### Text shaping and direction
- All text measurement and rendering goes through **HarfBuzz shaping** (e.g., `uharfbuzz` for measuring, a HarfBuzz-backed renderer for drawing; Pillow with `libraqm` for raster images). Arabic joining, ligatures, diacritics and BiDi must come from the shaping engine, never from manual character reversal.
- Mixed-direction text (Arabic with numbers, Latin names, codes) uses the Unicode Bidirectional Algorithm; wrap protected Latin tokens in Unicode directional isolates when restoring placeholders.
- **RTL layout policy:** default is *keep geometry, change alignment*: blocks stay where they are, text inside is right-aligned and RTL. This is correct for forms, certificates and official documents. Optional per-job setting *mirror layout* flips column order, table column order and horizontal positions for designed documents. DOCX: set `w:bidi` on paragraphs, `w:rtl` on runs, `w:bidiVisual` on tables when mirroring, and set **complex-script font and size** (`w:rFonts/@w:cs`, `w:szCs`) — Word uses those for Arabic, not the normal font attributes.

#### Fitting text into its box (expansion/contraction)
For each block, with the target box = original block box:
1. Measure shaped text at original size and line height with the real font.
2. If it overflows: binary-search font size down to a floor of 80% of original (configurable); then reduce line height to no less than 1.05×; then letter spacing no less than −2% (never for Arabic or other connected scripts).
3. Still overflowing: grow the box into **free space** measured from the page's occupancy map (areas without text, images or drawings) — right/down for LTR, left/down for RTL.
4. Still overflowing: shrink to an absolute floor (70%) and record `overflow_mitigated` on the page QA; never let text cross into another block or an image.
5. Keep sizes consistent: blocks of the same style on the same page get the same final scale (no random size jumps between neighboring paragraphs).
6. Contraction: keep original size, do not stretch.

#### PDF output
- For digital text: remove the original text spans only (redaction of text, keeping images and vector graphics intact), then write translated text into the same boxes with fitted, shaped, embedded fonts. Preserve link annotations by remapping to the new text positions, keep bookmarks and page size/rotation.
- For scanned pages/regions: **erase original text from the image**:
  - Sample the background ring around each text box. Uniform background (low variance) → fill with the sampled color/gradient.
  - Textured/photo/colored backgrounds → inpainting model (LaMa-class) applied only to the text mask.
  - Then draw translated text as real vector text over the cleaned image (so the output is searchable), matching the original color sampled from the glyph pixels.
- Output page count, page sizes and order equal the input.

#### DOCX output
- Write translated text back into the same paragraph; redistribute text across the original runs according to the returned tags so bold/italic/links survive. Never delete runs containing images, fields, bookmarks or comments anchors.
- Fixed-size containers (text boxes, table cells with fixed row height, shapes): apply the fit algorithm by adjusting `w:sz`/`w:szCs`. Flowing body text is allowed to reflow naturally.
- Update fields' display text but never break field codes (TOC, page numbers).
- Validation: the file opens without repair prompts; convert original and output to PDF with headless LibreOffice and compare (Section 9 QA).

#### PNG/JPG output
- Same pixel dimensions, same format, same DPI and ICC profile. JPEG saved at quality matching the original estimate (≥ 90). Text drawn with Pillow + raqm after inpainting.

### S9 — Automatic QA on every job (not only in tests)
For every output page run:
1. **Completeness:** re-extract text from the output; every translated segment is present; no source-language sentences remain (except protected tokens, names, and intentionally untranslated regions).
2. **Overflow/overlap:** every rendered text box lies inside its allowed area and does not intersect image/figure boxes or other text boxes.
3. **Glyph integrity:** no `.notdef` glyphs, no `U+FFFD`, no `?` substituted characters; for Arabic, verify shaping produced joined forms (glyph IDs differ from isolated forms where expected).
4. **Direction:** for RTL targets, logical-order extraction of output matches the translated string.
5. **Non-text preservation:** render original and output at 100 DPI, mask text regions, compute SSIM on the rest; must be ≥ 0.98 (images, lines, logos unchanged).
6. **Structure:** same page count; for DOCX same number of tables/rows/cells and images; file opens in pdf.js / LibreOffice without errors.
7. **Protected tokens:** every protected token appears in the output exactly as in the source.
Result per page: `qa_passed`, `qa_warning` (shown to the user with reason, e.g. "Text on page 7 was reduced to 78% size to fit"), or `failed`.

### S10 — Delivery and retention
- Output available via presigned download URL (short expiry, e.g. 15 minutes, re-issuable while logged in).
- Default retention: source and outputs deleted **24 hours** after completion for Instant, **30 days** for Certified (user can delete immediately with one button). Implement with storage lifecycle rules **and** a scheduled cleanup job that also deletes DB text content (segments) — document text is personal data too.
- Deletion is logged (what, when) without logging content.

---

## 5. Certified mode workflow
1. User uploads, gets instant automated translation + preview.
2. User enters: names as on passport, purpose (USCIS, university, court), any notes.
3. Pays → order enters a **reviewer queue** (internal tool in the same app, role-based access).
4. Reviewer sees source page image and translation side by side, segment by segment, with glossary and flagged segments highlighted (low OCR confidence, QA warnings, non-text regions needing bracketed notes). Edits re-render only that page.
5. Reviewer approves → system appends a **certification page** (translator name, statement of competence in both languages and accuracy/completeness, date, signature image, contact) and a translation of any stamps/seals as bracketed notes. Keep the wording configurable; have the legal text reviewed before launch (Section 12).
6. Deliver PDF (and original format if requested). Store an audit trail: who reviewed, when, what was changed.

---

## 6. UX requirements
- **Upload:** drag-and-drop, format/size limits shown before upload, client-side checks (type, size) plus server-side truth.
- **Live progress** via SSE (polling fallback every 2 s), driven by real DB state:
  `Validating → Analyzing page 12/40 → Translating 340/812 segments → Rebuilding page 9/40 → Quality check → Ready`.
  Show a per-page strip (thumbnail + status dot). ETA computed from measured throughput of this job, not a fake timer.
- **Errors are specific and actionable.** Maintain an error catalog (`docs/ERRORS.md`) with code, user message, and suggested action, e.g.:
  - `E_PDF_PASSWORD` "This PDF is password-protected. Enter the password to continue."
  - `E_IMAGE_TOO_LARGE` "This image is 94 megapixels; the limit is 60. Please export it at a lower resolution."
  - `E_PAGE_OCR_LOW_CONFIDENCE` "Page 7 is very blurry; some text may be inaccurate. Highlighted lines need checking."
  - `E_PAGE_FAILED` "Page 94 could not be processed and was kept in the original language. [Retry this page]"
  Never show a generic "Something went wrong" without a code and a next step.
- **Result screen:** side-by-side original/translation viewer, per-page warnings, segment editor, download button, "Upgrade to Certified" button.
- Users can leave the page; they get an email when the job is done.
- Full RTL support in the UI itself (Arabic interface), keyboard accessible, mobile-usable upload and download.

---

## 7. Performance and cost controls
- Stream processing page by page; never load a whole 100-page render into memory. Render pages at the DPI each stage needs (OCR 300, QA 100), then discard.
- Worker concurrency per queue from config; heavy queues default to (CPU cores − 1) processes with container memory limits; OOM of one task must not kill others.
- `cost_ledger`: tokens in/out, provider, model, OCR seconds, render seconds per page. Admin page shows cost per page and per job. **Gate:** measured average cost per page on the corpus is reported every milestone; price the Instant tier from real numbers.
- Cache translations by hash of `(segment text, language pair, glossary version, model)` for repeated boilerplate across pages and jobs of the same user.

---

## 8. Security and privacy summary
- Auth for all file access; object keys are unguessable; bucket private; presigned URLs short-lived.
- Encryption at rest (storage + DB) and TLS everywhere.
- Parsers run in sandboxed containers without network access, with CPU/memory/time limits, as non-root.
- No document content in logs, analytics, or error trackers (scrub before sending).
- Rate limit uploads per user/IP; bot protection on the free preview.
- Privacy policy and terms state: retention periods, subprocessors (storage, AI providers), no training on user data, deletion on request.

---

## 9. Licensing check (do this in Milestone 1, record results)
Several popular document libraries are **AGPL** or have **commercial restrictions on model weights**, which matters for a paid SaaS. Examples to verify at build time: PyMuPDF (AGPL or commercial license from Artifex), Ghostscript (AGPL), some OCR/layout model weights (non-commercial or revenue-capped licenses), open-source PDF translators such as BabelDOC/PDFMathTranslate (AGPL; useful as reference designs, do not copy code without accepting the license).
- Produce `docs/LICENSES.md`: every dependency and model with its license and "OK for closed-source SaaS: yes/no/needs purchase".
- If a preferred tool is not OK, either choose a permissive alternative (e.g., pdfium via pypdfium2 for rendering; Apache/MIT OCR models) or flag it to me as a purchase decision. Do not silently use an incompatible license.

---

## 10. Test corpus, quality gates, and the fix-retest loop

### Build the corpus (`tests/corpus/`), with a manifest describing each file and expected behavior
Generate programmatically where possible (so tests are reproducible) plus real-world samples:
1. Two-column academic-style PDF with sidebar and footnotes.
2. Contract PDF with numbered clauses and defined terms ("Board", "Agreement") repeated across 20 pages → consistency test.
3. Table-heavy PDF: merged cells, multi-line cells, numbers, a table spanning two pages.
4. Scanned certificate (birth/marriage-style) at 200 DPI, slightly skewed, with a stamp and a signature.
5. Phone photo of a document: perspective distortion, shadow, JPEG compression.
6. Hybrid PDF: 1 digital page + 1 scanned page + 1 page whose table is an image + 1 vector diagram page.
7. PDF with broken CID font encoding (text looks fine, extraction is garbage).
8. Password-protected PDF (user password) and owner-restricted PDF.
9. Corrupted PDF (truncated xref).
10. Malicious samples: PDF with JavaScript/OpenAction/embedded file; DOCX zip bomb; image with 30,000×30,000 header; DOCX with XXE payload. Expected: safely rejected or sanitized, worker stays healthy.
11. DOCX with headers/footers, text boxes, footnotes, TOC field, tracked styles, a table, images, inline bold/italic inside sentences.
12. Arabic source document (to test Arabic → English/French), and English source translated **to Arabic** containing numbers, dates, Latin brand names, emails (BiDi test).
13. Dense English marketing flyer (text over colored/photo backgrounds) → French (expansion + inpainting test).
14. 100-page PDF (load/timeout test) and 101-page PDF (limit test).
15. **The user's file from `C:\Users\aminj\Downloads\testtrans`** — tested into at least Arabic, French and English (whichever differ from its source language).

### Quality gates (all must pass before a milestone is "done")
| Gate | Threshold |
|---|---|
| Unit + integration tests | 100% pass |
| Automated QA (S9) on corpus | 0 `failed` pages on files expected to succeed; every warning justified in the report |
| Glyph integrity | 0 tofu / `?` / `U+FFFD` in any output |
| Protected tokens | 100% preserved |
| Non-text SSIM | ≥ 0.98 on all pages |
| Glossary consistency | 0 unresolved deviations in file #2 |
| OCR accuracy on #4, #5 | CER measured against ground truth and reported; target ≤ 3% on #4 |
| Malicious files | all rejected/sanitized; no worker crash; memory stays below container limit |
| 100-page PDF | completes; peak worker memory and total time reported; UI progress updated at least every 5 s |
| Crash recovery | kill a render worker mid-job → job resumes and completes without duplicate pages |
| Rate limits | simulated 429 storm → backoff + failover works, job completes |

Additionally, generate `reports/milestone-N/visual/` with side-by-side PNGs (original | translated) for every corpus page, and review them yourself: describe any visible defect in `defects.md` even if automated gates passed. Automated metrics can pass while a page still looks wrong; visual review is required.

### The loop
```
build stage → run all tests + corpus QA → inspect visuals
   └─ any failure/visible defect → root-cause → fix → re-run EVERYTHING (not just the failed test) → repeat
all green → write milestone report → next milestone
```
Never weaken a threshold or delete a corpus file to make a gate pass. If a threshold is genuinely unrealistic, stop and explain with numbers.

---

## 11. Milestones (build in this order)

1. **Foundation:** repo, Docker Compose (web, api, workers, redis, postgres, minio as local S3), DB schema + migrations, job/page state machine, presigned upload, SSE progress, error catalog skeleton, LICENSES.md, DECISIONS.md, corpus generator. *Test: upload → job created → dummy-free status flow runs through intake on real files.*
2. **Intake & security:** S1 complete with malicious and encrypted corpus files. *Gates: security rows.*
3. **Analysis:** S2–S4 for PDF and images (classification, extraction, OCR, layout, reading order, tables). Output an inspection JSON + overlay PNGs of detected blocks and order numbers per page. *Gate: reading order correct on #1, #6; tables correct on #3; CID detection on #7.*
4. **Translation:** S5–S7 with two providers, glossary, validation, rate limiting, cost ledger. *Gates: tokens, consistency, 429 storm.*
5. **PDF + image reconstruction:** S8 fonts, shaping, fitting, RTL, inpainting. *Gates: glyphs, SSIM, overflow, Arabic BiDi on #12, flyer #13, user file #15.*
6. **DOCX pipeline:** extraction + reconstruction + LibreOffice-based comparison. *Gate: #11 all elements preserved, opens without repair.*
7. **QA stage in production path + UX:** S9 on every job, per-page warnings, result viewer, segment editor with single-page re-render, emails.
8. **Certified mode:** name capture, reviewer tool, certification page, audit trail.
9. **Payments, accounts, retention & deletion jobs, marketing pages** (with "automated document processing" copy), privacy/terms drafts.
10. **Production hardening:** deploy workers to a VPS, monitoring (queue depth, failures, memory), backups, load test with 10 concurrent 50 MB files, final full-corpus run.

Each milestone report contains: what was built, commands run, test output, QA summary table, visuals, defects found/fixed, measured cost/time per page, open issues.

---

## 12. Decisions that need me (ask; don't guess)
- API keys and which providers to use in production.
- Purchase of any commercial license flagged in LICENSES.md.
- Certification statement wording and translator credentials (legal review before launch).
- Final pricing (you provide measured cost per page to inform it).
- Hosting provider/region for workers and storage (data residency).

## 13. Definition of done (whole project)
A new user can upload any corpus file or a real document of their own, watch honest per-stage progress, download a translated file in the same format that opens cleanly, reads correctly (including Arabic), keeps images/tables/layout, has no overflowing or overlapping text, and comes with a clear per-page report of anything imperfect — and every one of these claims is backed by test evidence in `reports/`.
