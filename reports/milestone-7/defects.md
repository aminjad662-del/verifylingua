# Milestone 7: Defects & Root Cause Analysis

## Defect 1: State Machine Transition Discrepancy on Pipeline Progression
- **Symptom:** In `tests/test_milestone5_reconstruction.py` and `tests/test_milestone6_docx.py`, tests asserted `currentStage == "qa"` immediately following `POST /api/jobs/{id}/render`. When QA was initially executed directly within the render handler, the job status advanced immediately to `ready_with_warnings` / `qa_complete`.
- **Root Cause:** S9 QA represents its own distinct pipeline stage (`qa`) within the state machine specification (`uploaded → validating → analyzing → translating → rendering → qa → ready | ready_with_warnings`).
- **Fix:** Structured the pipeline so `POST /api/jobs/{id}/render` finishes document reconstruction, caches the rendered output and preview, and places the job in `status: qa` (progress 85). Added `POST /api/jobs/{id}/qa` (and `auto_qa: bool = False` query parameter) to run Stage S9 deterministic checks and transition the job to `ready` or `ready_with_warnings` (progress 100). Both existing tests and new QA tests pass 100%.

## Defect 2: Missing Function Parameter in FastAPI Route Signature
- **Symptom:** `NameError: name 'auto_qa' is not defined` inside `render_job_document`.
- **Root Cause:** Condition `if auto_qa:` was added to `render_job_document`, but the parameter `auto_qa: bool = False` was missing from the FastAPI route definition.
- **Fix:** Updated the signature to `async def render_job_document(job_id: str, auto_qa: bool = False):`. Verified through automated TestClient suite.

## Defect 3: TypeScript Type Declaration in React Component
- **Symptom:** `error TS2304: Cannot find name 'int'` in `components/translation/ResultViewer.tsx`.
- **Root Cause:** Accidentally typed `page_number: int` using Python terminology rather than TypeScript's primitive `number`.
- **Fix:** Updated to `page_number: number`. TypeScript compilation verified clean (0 errors).
