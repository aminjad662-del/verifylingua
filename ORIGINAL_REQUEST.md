# Original User Request

## Initial Request — 2026-09-25T19:23:06Z

Redesign the VerifyLingua certified translation web platform into an Awwwards-caliber, high-density legal-tech application, synthesizing the precision layout and 1px borders of Raycast with the fluid typography, spring physics, and interactive canvas previews of Framer, grounded in reference designs from C:\Users\aminj\Downloads\UI and Refero.design.

Working directory: C:\Users\aminj\Downloads\SAAS 7
Integrity mode: development

References:
- Local design references: C:\Users\aminj\Downloads\UI (refero.design raycast.com.jpg, refero.design framer.com.jpg, refero.design arcade.software.jpg, refero.design spyglass.so.jpg, refero.design programa.design.jpg)
- Refero design patterns: https://refero.design/

## Requirements

### R1. Visual Identity & Landing Page Transformation
- Establish a refined, bespoke design language combining editorial display serif headlines, clean geometric sans body typography, and tabular monospace metadata.
- Implement high-density workspace architecture with crisp 1px borders, subtle tactile surface elevations, and zero generic AI clichés (no purple/cyan gradient mesh, no floating blur orbs, no generic rounded cards).
- Build a hero section featuring an interactive document inspection stage with before/after translation toggle, dynamic magnification loupe, and real-time certification metadata.
- Construct a bento grid architecture spotlighting USCIS 8 CFR § 103.2 compliance, ATA seal integrity, instant court acceptance guarantee, and turnaround timelines.

### R2. End-to-End Funnel & Workbench Modernization
- Intake & Triage (/order/triage): Transform the document intake interface into a professional intake studio with multi-page preview carousels, automated DPI/glare inspection tags, and real-time page count extraction, ensuring zero client-side exceptions.
- Document Translation Studio (/translate): Build a dual-pane split inspection workbench with synchronized smooth-scrolling, OCR segment highlight mapping, font matching indicators, and side-by-side comparison tools.
- Client & Counsel Workspace (/dashboard, /counsel): Provide dense filing tables with live status badges, matter grouping, batch download actions, and real-time processing indicators.

### R3. Micro-Interactions, Spring Physics & Accessibility
- Implement physics-based spring transitions (using Framer Motion and Emil Kowalski motion principles) on interactive dialogs, drawers, and tab switches.
- Provide subtle tactile button press dampening and cursor hover interactions.
- Strictly adhere to WCAG AA contrast standards, visible keyboard focus indicators, and full prefers-reduced-motion compliance.

## Acceptance Criteria

### Design System & Visual Quality
- [ ] Visual styling conforms to the Raycast + Framer fusion: high-density layout, crisp 1px borders, calibrated typography contrast, and subtle tactile states.
- [ ] No generic AI design patterns (no purple/cyan gradients, no ambient blur orbs, no oversized rounded-3xl cards).
- [ ] Fully responsive layouts from 360px mobile viewports to 2560px ultra-wide displays without horizontal overflow or clipping.

### Functional Integrity & Verification
- [ ] Zero client-side exceptions on /order/triage and throughout all funnel stages.
- [ ] The full translation workflow (document upload -> language selection -> translation -> preview -> download) functions seamlessly.
- [ ] All 52 Vitest test files and 325 existing automated tests pass with 100% green.
- [ ] npx tsc --noEmit compiles with 0 errors.
- [ ] Production build succeeds and deploys cleanly to Cloudflare Pages (verifylingua.pages.dev).


## Follow-up — 2026-10-20T08:39:39Z

# Teamwork Project Prompt

> Requested team: Full team [specialized in Computer Vision, Inpainting, PDF Content Streams, and Typography Engine]

Architect and build a dual-pipeline document translation and layout reconstruction system: (1) an OpenCV/LaMa stroke-segmentation and inpainting pipeline with median-ink sampling and paper-texture blend for scanned documents and images; and (2) a PyMuPDF (`fitz`) native vector content-stream manipulation pipeline with text operator removal and non-destructive coordinate re-insertion for vector PDFs.

Working directory: `C:\Users\aminj\Downloads\SAAS 7`
Integrity mode: development

## Requirements

### R1. Scanned Documents & Images: Stroke Segmentation Mask & Fast Inpainting
For scanned documents and bitmap images, completely eradicate "white rectangle" bounding box masks. Extract bounding boxes from OCR, crop the localized text region, and apply Adaptive Thresholding (`cv2.adaptiveThreshold`) or Otsu's Binarization (`cv2.threshold`) to isolate only the character stroke pixels. Dilate the stroke mask by 2–3 pixels (`cv2.dilate`) to cover character edges and anti-aliasing. Feed the dilated stroke mask into an inpainting engine:
- For standard scanned documents and single-color paper backgrounds, run `cv2.inpaint` with `INPAINT_TELEA` (<10ms execution, zero GPU requirement).
- For complex textures, official certificates, stamps, seals, and decorative lines, provide a pluggable LaMa (Large Mask Inpainting) ONNX pipeline that fills text regions using surrounding texture without destroying underlying graphic elements.

### R2. Scanned Documents & Images: True Ink Extraction & Font Topology Matching
Extract authentic visual styles from the scanned source text:
- Determine ink color by calculating the median RGB value of pixels strictly within the character stroke mask (capturing scanned paper nuances, dark gray tones, and pen ink tints rather than hardcoded `#000000`).
- Extract font attributes (font size from line height / ascender-descender metrics; classify Serif, Sans-Serif, Monospace, Script, Bold, Italic) and map to an authentic target language typography match (e.g., Times New Roman -> Amiri, Arial/Inter -> Cairo/Noto Sans).

### R3. Scanned Documents & Images: Paper Texture Realism & Blend Integration
Render translated text with realistic document integration using Pillow / Skia / HarfBuzz:
- Dynamically auto-scale font size and letter spacing to guarantee the translated text remains strictly within original bounding box clearance.
- Apply a subtle Gaussian blur ($\sigma \in [0.4, 0.6]$) and composite the rendered text onto the reconstructed background using the "Multiply" blend mode, ensuring translated characters inherit the paper grain, texture, and tonal fidelity of the original scanned document.

### R4. Native Vector PDFs: Stream Manipulation & Zero White Patch Redaction
For native (vector-based) PDF documents generated from digital sources (Word, InDesign), strictly prohibit rasterization or image conversion:
- Parse the document with PyMuPDF (`fitz`), utilizing `page.get_text("dict")` to extract complete span hierarchies: text, bounding box coordinates (`bbox`), font name, font size, font flags, and RGB color.
- Remove source text without leaving white patches by stripping text operators (`Tj` / `TJ`) from the page content streams, or by applying `page.apply_redactions(graphics=0, images=0)` with `fill=None`, preserving 100% of underlying vector tables, gridlines, shapes, background tints, and embedded images.

### R5. Native Vector PDFs: Non-Destructive Coordinate Re-insertion
Re-insert translated text at the exact original spatial coordinates using PyMuPDF `page.insert_htmlbox()` or `page.insert_textbox()`:
- Use corresponding fonts matching the target language (handling Arabic BiDi shaping with `arabic-reshaper`, `python-bidi`, and `uharfbuzz`).
- Maintain exact reading order, margin alignment, line wrapping, and vector resolution.

## Acceptance Criteria

### Scanned Documents & Inpainting Pipeline
- [ ] Stroke segmentation mask isolates character strokes with Adaptive Thresholding/Otsu and 2–3px dilation rather than masking full rectangular bounding boxes.
- [ ] `cv2.inpaint(..., cv2.INPAINT_TELEA)` reconstructs standard document backgrounds with zero white box artifacts in under 20ms.
- [ ] Median RGB calculation samples true ink color from stroke pixels and applies it to rendered text.
- [ ] Rendered text incorporates Gaussian blur ($\sigma = 0.4\text{--}0.6$) and Multiply blend mode to blend seamlessly into paper grain.

### Native Vector PDF Pipeline
- [ ] Native vector PDFs remain 100% vector without rasterizing pages to bitmap images.
- [ ] PyMuPDF extracts full span dictionary (`dict`) with exact font metadata, sizes, colors, and coordinates.
- [ ] Source text is removed via `fill=None` redactions or content stream operator modification without altering underlying vector lines, borders, or graphics.
- [ ] Translated text is inserted via `insert_htmlbox` / `insert_textbox` at matching coordinates with target-language font support.

### System Verification & Integration
- [ ] Both pipelines exposed through clean, testable service interfaces in the application.
- [ ] Full regression test suite passes with automated verification tests for both scanned inpainting and vector PDF stream editing.
