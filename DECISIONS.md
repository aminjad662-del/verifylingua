# Architectural & Design Decisions (DECISIONS.md)

This log records every non-obvious decision made during the elevation and production implementation of VerifyLingua.

---

### Decision 1: High-Fidelity Multi-Format Layout-Preserving Translation Engine
- **Context**: The user requires a document translation platform for **PDF, DOCX, PNG, and JPG** where the output matches the input format with strictly preserved layout, tables, formatting, and fonts, downloadable immediately in the exact same format.
- **Architectural Choice**:
  1. **DOCX Preservation**: Use run-level OpenXML extraction. Rather than converting DOCX to HTML and back (which destroys formatting), parse the internal `word/document.xml`, extract only inner `<w:t>` text nodes while maintaining `<w:rPr>` run properties, paragraph alignments, table cell dimensions, headers, and footers, translate the textual runs in context, and write them back into the ZIP container.
  2. **PDF Text Extraction & Direct Overlay Reconstruction**: Use `pdf-parse` / `pdfjs-dist` to extract text blocks along with their exact bounding boxes `(x, y, width, height)` and page coordinates. Rebuild the translated PDF by preserving original vector backgrounds and graphics, masking original text runs cleanly, and rendering translated text directly into the identical bounding boxes using `pdf-lib` with auto-fit shrink-to-fit calculation and proper baseline positioning.
  3. **PNG/JPG OCR & Inpainting Overlay**: Process uploaded scanned images using OCR text detection with bounding boxes. Inpaint/mask original text background cleanly, and composite translated text in place matching font-weight, color, alignment, and size using Node.js canvas rendering.
- **Studio Rationale**: This satisfies the non-negotiable rule that "a PDF comes back as a PDF, a DOCX as a DOCX, an image as an image with translated text rendered in place. No manual redesign or reformatting by the user, ever."

---

### Decision 2: Synthesis of Design References (Synthesia Community + Sunsama)
- **Context**: The user provided two reference designs (`media_1788545235739.jpg` and `media_1788545236329.jpg`).
- **Architectural Choice**:
  - **Hero & Canvas (Synthesia)**: Crisp, luminous background with subtle ambient pastel aura (radial blue/apricot gradient), bold geometric display heading with tinted key phrases, and a central interactive document transformation frame.
  - **Double-Bezel Upload Zone (Taste-Skill / Apple)**: Outer enclosure with hairline ring and subtle tint, encasing an inner drop target with specular highlight, 44px+ touch targets, and tactile `:active:scale-[0.97]`.
  - **Before/After Diagnostic Modules (Sunsama)**: Side-by-side diagnostic cards comparing the "Chaotic / Rejected Legacy Translation" (red warning pills, formatting destroyed, uncertified) vs "VerifyLingua Precision" (green checks, exact layout preserved, USCIS accepted).
  - **Feature Grid & Narrative (Sunsama + Synthesia)**: 2x2 crisp feature cards with single-color SVG icon chips, followed by high-density workflow steps and comparison tables.
  - **Footer (Synthesia)**: Deep midnight dark footer with structured navigation, ATA certification badge, and legal guarantees.

---

### Decision 3: Translation LLM System Prompt & Resilience
- **Context**: Translation must preserve format tokens, legal terminology, dates, numbers, and proper nouns accurately.
- **Architectural Choice**:
  - Built-in translation pipeline uses a specialized system prompt enforcing register, legal terminology preservation, strict tag/placeholder preservation, and context-aware sentence translation.
  - Automatic exponential backoff and retry wrapper to handle rate limits gracefully.
  - Fallback offline translator for deterministic fixtures and integration testing so the test suite can run fully offline in CI/CD without burning external API quotas.

---

### Decision 4: In-Memory Resilience Layer with Prisma Postgres
- **Context**: VerifyLingua supports both production PostgreSQL and offline/local development where a local database might be temporarily unavailable.
- **Architectural Choice**:
  - Maintain a dual-tier storage strategy (`lib/auth/dev-store.ts` and `lib/jobs/store.ts`): queries write to Prisma PostgreSQL when available, while catching connection errors and falling back seamlessly to an in-memory session/job registry. This ensures all routes, uploads, auth flows, and translations work flawlessly out of the box in local environments.
