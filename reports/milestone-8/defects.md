# Milestone 8: Defects & Root Cause Analysis

## Defect 1: Typing Import Missing in FastAPI Router
- **Symptom:** `NameError: name 'List' is not defined` on `@app.get("/api/certified/queue", response_model=List[CertifiedQueueItem])` during test collection.
- **Root Cause:** In `api/main.py`, line 7 imported only `from typing import Optional`. `List`, `Dict`, and `Any` were not imported into the router namespace.
- **Fix:** Updated line 7 to `from typing import Optional, List, Dict, Any`. Test suite re-run verified clean collection and 100% test pass.

## Defect 2: Missing Certified Tier Elevation on Order Registration
- **Symptom:** During initial certified order placement, `job.serviceTier` remained `ServiceTier.INSTANT` rather than upgrading to `ServiceTier.CERTIFIED`.
- **Root Cause:** `create_certified_order` stored the order record but did not mutate the parent `job["serviceTier"]`.
- **Fix:** In `JobStore.create_certified_order`, added `job["serviceTier"] = ServiceTier.CERTIFIED` and updated `updatedAt`. Asserted in Gate 8.1.
