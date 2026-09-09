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

---

### Decision 5: Reference-Driven Masterpiece Client Dashboard (Spyglass Aesthetic + Emil Kowalski Motion)
- **Context**: The user instructed an autonomous rebuild of the client dashboard matching the EXACT visual baseline of the provided reference screenshot (Spyglass / Awwwards aesthetic) elevated with world-class micro-interactions and motion physics.
- **Color Logic & Palette Mapping**:
  - **Decision**: Adopted a hybrid high-contrast stark monochrome baseline directly from the Spyglass reference (`#0A0A0A` / `bg-neutral-950` dark bento block, crisp off-white `#FAFAFA` canvas, `border-neutral-200` and `border-white/10` 1px dividers), accented with vibrant emerald/lime status pips (`text-emerald-400`, `bg-emerald-500`) for live evidentiary telemetry.
  - **Rationale**: The stark monochrome contrast elevates the perceived legal authority of VerifyLingua far above consumer translation agencies. While keeping our core brand ink tones, the deep neutral-950 command center creates an unmistakable institutional feeling.
- **Motion & Interaction Architecture (Emil Kowalski Standard)**:
  - **Spring Physics**: All interactive state transitions (modals, drawers, hover effects) use calibrated spring physics (`stiffness: 380-450`, `damping: 25-32`, `mass: 0.1`). Banned linear and generic CSS ease-ins.
  - **Magnetic Buttons**: CTAs utilize `MagneticButton` and `useMagneticHover` hook, translating within 8-9px radius with 0.4x parallax inner text differential, automatically bypassed on touch devices (`pointer: coarse`) and `prefers-reduced-motion`.
  - **Shared Layout Transitions**: The Order Vault filter tabs use `layoutId="activeVaultTab"` for fluid sliding pill animations across filters (All, Active, Delivered, Proofing).
  - **Staggered Orchestration**: The dashboard mounts with a sophisticated staggered fade-up container (`staggerChildren: 0.08`, `delayChildren: 0.05`).
  - **Morphing Action Feedback**: "Download Receipt" and "Download Deliverable" buttons use `MorphingActionButton` to transition dynamically from idle -> loading spinner -> green checkmark bounce -> reset, paired with non-intrusive spring-animated toasts.

---

### Decision 6: High-Fidelity Document Reconstruction Engine (Spatial Geometry & Zero-Timeout Pipeline)
- **Context**: Document translation cannot rely on simple string replacement, which disrupts document geometry, causes column collapse, and overflows margins when translated text expands (e.g. Spanish +20%). Furthermore, serverless execution mandates zero-timeout asynchronous processing.
- **Architectural Implementation**:
  1. **Stage A: Spatial Extraction & Geometry Parsing**:
     - **PDF**: Decompresses internal content streams (`FlateDecode`), parsing text matrix (`Tm`), displacement (`Td`), font size (`Tf`), and text rendering (`Tj`/`TJ`) operators into discrete `SpatialTextBlock` objects with exact $(X, Y, W, H)$ bounding boxes and column detection.
     - **Scanned Images**: Layout-aware spatial clustering detects text bounding boxes with background luminance sampling.
     - **DOCX**: Groups OpenXML `<w:r>` runs within parent `<w:p>` paragraphs to retain semantic context while strictly preserving formatting (`<w:pPr>`, `<w:rPr>`, `<w:tbl>`, `<w:tcW>`).
  2. **Stage B: Context-Aware Translation Layer**:
     - Transmits structured block payloads with block IDs to Gemini LLM enforcing strict JSON schemas via Zod.
     - Enforces an automatic exponential backoff retry mechanism (200ms, 400ms, 800ms) to gracefully handle 429 rate limits or malformed output, falling back to a deterministic certified legal dictionary offline.
  3. **Stage C: Spatial Reconstruction & Dynamic Fitting**:
     - **Dynamic Font-Size Scaling**: Auto-scales font size down dynamically to strictly fit translated text within the original bounding box without overflowing.
     - **Localized Background Inpainting**: Applies localized background-color patches over original coordinates to mask previous text seamlessly before drawing translated text.
     - **Bidirectional Script Support (RTL)**: Detects Arabic/Hebrew and aligns text to the bounding box right margin with appropriate RTL text flow.
  4. **Zero-Timeout Asynchronous State Machine**:
     - Dispatches processing to an async background job with discrete milestone stages (`queued` -> `extracting` -> `translating` -> `reconstructing` -> `ready`). Clients poll `GET /api/translate/status/[jobId]` without long-running HTTP connection timeouts.

---

### Decision 7: Client Tracker State Machine Overhaul, Notarial Palette Enforcement, and Triage Proximity Flow
- **Context**: The order tracking screen previously presented an overwhelming array of open event logs, chats, and ambiguous buttons, creating high cognitive load and trapping users when their draft was ready for review. In addition, generic SaaS blue buttons failed to convey the seriousness of notarial and legal certification.
- **Architectural & Design Implementation**:
  1. **Strict Notarial Legal Palette Enforcement**:
     - Eliminated generic blue (`#4F46E5`) for primary actions across the funnel and tracking flows.
     - Added dedicated tokens:
       - `--cta: #B45309` (Amber/Burnt Orange): strictly reserved for the next single logical step the user must take.
       - `--sand: #FAF7F2` (Warm Physical Paper): foundational background for documents and workspace.
       - `--ink: #0A2540` (Deep Navy): authoritative text, card borders, and display elements.
       - `--trust: #0F7B4F` (Forest Green): certified stamps, verified badges, and quality gates.
  2. **Tracker State Machine Redesign (`STATE A` vs `STATE B`)**:
     - **STATE A (TRANSLATING - Read-Only Mode)**: Collapses the lengthy event logs and live translator thread into an accordion (`Audit Trail & Translator Messaging Thread`) closed by default. Displays a central aesthetic pulsing radar and progress bar: *"Your certified linguist Elena V. is actively translating your document."* Eliminates confusing CTAs in favor of an explicit "No action required from you right now" guarantee.
     - **STATE B (DRAFT READY - Action Required Mode)**: Shifts the entire page atmosphere with a darkened paper focus overlay (`bg-sand-warm/70`), elevating an unmissable amber hero spotlight with a prominent CTA: **`Action Required: Review & Approve Translation`** linking directly to the side-by-side Proofing Studio (`/order/[id]/proof`).
     - **Framer Motion Layout Transitions**: Smooth spring physics transition between `TRANSLATING` and `DRAFT_READY` states without sudden jumps.
  3. **Triage Proximity Principle (Upload Step)**:
     - When AI quality triage flags an anomaly (e.g. flash reflection or glare) requiring user confirmation, the primary "Continue to Configure" button is dynamically anchored directly below the checkbox confirmation rather than stranded in the right sidebar.
  4. **Pronounced Active State for Receiving Authority Selection (Configure Step)**:
     - Authority cards (USCIS, Court, DMV, etc.) feature an active `--ink` 2.5px border, subtle elevation lift (`-translate-y-1`), elevated shadow, and an active `--trust` checkmark chip.
  5. **Funnel Stepper Alignment**:
     - Standardized global order stepper in `app/order/layout.tsx` to strictly match the actual flow: **Triage -> Configure -> Lock -> Checkout**.


  
---  
  
### Decision 8: High-Fidelity Document Translation Engine - Phase 1-5 Architecture  
- **Context**: The core pipeline must accept PDF/DOCX/PNG/JPG, translate with layout preservation, serve a presigned download, and flag layout_preserved:false on fallback.  
- **Storage**: In-memory Map<string, TranslationJob> with 24h TTL and hourly cleanup. No external database required for Cloudflare Pages edge deployment. Buffers held in memory; R2/Supabase migration path documented.  
- **Translation**: DeepL free-tier (api-free.deepl.com) as primary engine (api key :fx suffix routing). Gemini 1.5 Flash as structured JSON fallback. Deterministic legal glossary as offline/CI fallback.  
- **DOCX**: JSZip unzip, w:t run extraction with XML-entity safe replacement, translateStructuredBlocks batch, re-zip DEFLATE.  
- **PDF**: FlateDecode zlib inflate, Tf/Tm/Td/Tj/TJ operator parsing for bounding boxes, pdf-lib drawRectangle mask + drawText overlay, dynamic font scaling, WinAnsi sanitization.  
- **Images**: Jimp read, dimension-matched spatial presets, fillRect inpaint, 5x7 bitmap glyph atlas render, dynamic scale/wrap, RTL right-align.  
- **Failure Handling**: PDF reconstruction failure triggers text-only PDF fallback (pdf-lib blank page) with layout_preserved:false in quality gate and API response. Non-PDF failures mark job failed. All state exposed via /api/translate/status/[jobId].  
