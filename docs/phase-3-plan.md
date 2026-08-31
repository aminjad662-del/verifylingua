# Phase 3 Implementation Plan: Nano Banana Pro Asset Generation Pipeline

## Objectives
1. Define the complete `/assets-manifest.json` containing the schema: `{ id, prompt, aspect, outPath, sha }`.
2. Set up the idempotent generator script `/scripts/generate-assets.ts`.
3. Create `/lib/asset-alt.ts` storing descriptive, accessible alt text for all images.
4. Execute initial generation for the **first 5 core assets**:
   - Asset 1: `hero-photograph-document` (16:9) — Person photographing document with a phone, calm composition, aligned to UI reference style.
   - Asset 2: `step-upload` (1:1) — Step 1 Upload & Instant AI Quality Triage icon illustration.
   - Asset 3: `step-triage` (1:1) — Step 2 Acceptance Pre-Check & Vision Analysis icon illustration.
   - Asset 4: `step-translate` (1:1) — Step 3 Certified Human Translation & Name-Lock icon illustration.
   - Asset 5: `step-deliver` (1:1) — Step 4 Signed Accuracy Certificate & Public QR Verification icon illustration.
5. Reach ⛔ **HARD GATE 2**: Stop, present the 5 generated images and prompt artifacts to the user for confirmation of visual direction before generating the remaining ~30 assets.
