# ROOT_CAUSE.md — Empirical Diagnosis and Causal Trace

## 1. Failing Test Execution Log

The following automated reproduction test (`test/language-switch-reproduction.test.ts`) was executed against the unmodified codebase before making any pipeline fixes.

```text
 RUN  v3.2.7 C:/Users/aminj/Downloads/SAAS 7

 ❯ test/language-switch-reproduction.test.ts (3 tests | 3 failed) 1130ms
   × PHASE 1 REPRODUCTION: Same File Upload With Different Target Language > REPRODUCTION BUG 1: Frontend auto-detection heuristic forces targetLang='es' when re-uploading the same document 30ms
     → expected 'es' to be 'fr' // Object.is equality
   × PHASE 1 REPRODUCTION: Same File Upload With Different Target Language > REPRODUCTION BUG 2: Re-translating same document to German (de) produces German translated content without Language A bleeding 595ms
     → expected '%PDF-1.7\n%\ufffd\ufffd\ufffd\ufffd\n…' to match /Geburtsurkunde|DEUTSCHLAND|Standesam…/i
   × PHASE 1 REPRODUCTION: Same File Upload With Different Target Language > REPRODUCTION BUG 3: Preview endpoint returns Cache-Control allowing stale 5-minute browser cache 270ms
     → expected 'public, max-age=300' not to contain 'public'

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 3 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  test/language-switch-reproduction.test.ts > PHASE 1 REPRODUCTION: Same File Upload With Different Target Language > REPRODUCTION BUG 1: Frontend auto-detection heuristic forces targetLang='es' when re-uploading the same document
AssertionError: expected 'es' to be 'fr' // Object.is equality

Expected: "fr"
Received: "es"

 ❯ test/language-switch-reproduction.test.ts:73:21
     71| 
     72|     // This MUST FAIL on current code because stageFileWithHeuristics …
     73|     expect(targetB).toBe("fr");
       |                     ^
     74|   });
     75| 

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/3]⎯

 FAIL  test/language-switch-reproduction.test.ts > PHASE 1 REPRODUCTION: Same File Upload With Different Target Language > REPRODUCTION BUG 2: Re-translating same document to German (de) produces German translated content without Language A bleeding
AssertionError: expected '%PDF-1.7\n%\ufffd\ufffd\ufffd\ufffd\n…' to match /Geburtsurkunde|DEUTSCHLAND|Standesam…/i

- Expected: 
/Geburtsurkunde|DEUTSCHLAND|Standesamt|Urkunde/i

+ Received: 
"%PDF-1.7 ... (untranslated English text)"

 ❯ test/language-switch-reproduction.test.ts:147:19
    145|     expect(textB).not.toContain("Acta de Nacimiento");
    146|     // Output B must contain German translation
    147|     expect(textB).toMatch(/Geburtsurkunde|DEUTSCHLAND|Standesamt|Urkun…
       |                   ^
    148|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/3]⎯

 FAIL  test/language-switch-reproduction.test.ts > PHASE 1 REPRODUCTION: Same File Upload With Different Target Language > REPRODUCTION BUG 3: Preview endpoint returns Cache-Control allowing stale 5-minute browser cache
AssertionError: expected 'public, max-age=300' not to contain 'public'

Expected: "public"
Received: "public, max-age=300"

 ❯ test/language-switch-reproduction.test.ts:184:30
    182|     // In production certified translation, preview must NEVER be cached publicly with max-age=300
    183|     // because subsequent requests for the same path or reloaded iframes serve the stale language!
    184|     expect(cacheControl).not.toContain("public");
       |                              ^
    185|     expect(cacheControl).toContain("no-store");
    186|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/3]⎯

 Test Files  1 failed (1)
      Tests  3 failed (3)
   Start at  23:32:20
   Duration  5.21s (transform 695ms, setup 0ms, collect 3.13s, tests 1.13s, environment 0ms, prepare 358ms)
```

---

## 2. Causal Trace and Root Cause Breakdown

### Root Cause 1: Frontend Filename Heuristics Overwriting User Selection
- **Location**: `app/translate/page.tsx:261-274`
- **Mechanism**:
  When a file is staged (via `handleStageFile`), the code tests `file.name.toLowerCase()`.
  If the filename contains `"beach"`, `"reading"`, `"worksheet"`, or `"english"`, it forcefully invokes:
  ```typescript
  setSourceLang("en");
  setTargetLang("es");
  ```
- **Why This Caused the Client Bug**:
  In step 1, the client uploads a document (e.g., `worksheet.pdf`) and translates to Spanish (`es`).
  In step 2, the client uploads *the same file again* intending to translate to Language B (French, German, etc.).
  The staging handler triggers on drop and unconditionally resets `targetLang` back to `"es"`. Even if the client selected Language B, the staging handler overwrites it immediately.

### Root Cause 2: Stale HTTP Browser Caching on Preview and Download Endpoints
- **Location**:
  - `app/api/translate/download/[jobId]/route.ts:182`
  - `app/api/jobs/[id]/preview/route.ts:49`
- **Mechanism**:
  Both routes return:
  ```typescript
  "Cache-Control": isInline ? "public, max-age=300" : "private, no-cache, no-store, must-revalidate"
  ```
- **Why This Caused the Client Bug**:
  The browser `<img>` or `<iframe>` preview requests `/api/translate/download/${jobId}?inline=true` or `/api/jobs/${jobId}/preview`.
  Because HTTP caching is set to `public, max-age=300`, the browser caches the visual representation for 5 minutes. When a re-translation or re-preview is rendered, the browser fetches from internal disk/memory cache instead of querying the backend.

### Root Cause 3: Lack of Composite Identity Key in Storage and In-Memory Stores
- **Location**:
  - `lib/translation/store.ts:49-51`
  - `app/api/translate/upload/route.ts:161-164`
  - `lib/translation/persistent-store.ts:138-140`
- **Mechanism**:
  Output artifacts were stored under generic keys:
  ```typescript
  const outputKey = `jobs/${userSegment}/${job.id}/output.pdf`;
  ```
  Neither the document content SHA-256, nor the target language, nor the pipeline version were encoded in the storage artifact path.
  Consequently, there was no deterministic mapping `(content_hash, source_lang, target_lang, pipeline_version) -> artifact_path`.

### Root Cause 4: Cloudflare Edge Worker State and SVG Cache Reuse
- **Location**: `scripts/build-cloudflare.js:1222-1258`
- **Mechanism**:
  Edge worker cached jobs in `globalThis.__vlJobs` and `caches.default` by `jobId` alone.
  When the download route was called:
  ```javascript
  let svgContent = (job && job.svgContent) || '';
  if (!svgContent && job) {
    svgContent = generateTranslatedSvg(job);
  }
  return new Response(svgContent, ...);
  ```
  If `job.svgContent` was already generated for Language A, any subsequent preview for that job ID immediately returned Language A's SVG without regenerating for Language B.

### Root Cause 5: Translation Engine Gaps for Core 4 Matrix (DE / FR)
- **Location**:
  - `lib/translation/translator.ts:526-534`
  - `lib/providers/deepl/index.ts:170-180`
  - `lib/providers/gemini/index.ts:42-74`
- **Mechanism**:
  In offline / test / fallback mode, `mockTranslateDeterministic` and the provider fallbacks only had Spanish translations. When `targetLang === "de"`, the text was returned verbatim without translation, causing Language B outputs to either fail language assertion or show English text.

---

## 3. Why Previous "Fixes" Failed

Previous attempts added a `useEffect` inside `app/translate/page.tsx:168-178` targeting `targetLang`:
```typescript
useEffect(() => {
  if (translatedBlobUrl) {
    URL.revokeObjectURL(translatedBlobUrl);
    setTranslatedBlobUrl(null);
  }
  if (job?.status === "ready") {
    setJob(null);
  }
}, [targetLang]);
```
This was a superficial symptom patch:
1. It did not prevent `handleStageFile` from resetting `targetLang` to `"es"` on every file drop.
2. It did not fix the HTTP 300-second browser cache on `/api/translate/download/${jobId}`.
3. It did not prevent edge worker SVG reuse in `scripts/build-cloudflare.js`.
4. It did not implement a composite identity key for artifact storage.
5. It did not ensure German and French dictionaries were complete in the translation fallback engines.

---

## 4. Required Structural Fixes (Phases 2 & 3)

1. **Composite Identity Key Architecture**:
   - `compositeKey = sha256(fileBuffer) + "_" + sourceLang + "_" + targetLang + "_v" + pipelineVersion + "_" + optionsHash`.
   - Output artifacts stored under `artifacts/${compositeKey}/output.${ext}`.
   - Legitimate cache reuse supported when and only when the full composite key matches.
2. **Frontend State Isolation**:
   - Staging a file must NEVER overwrite the user's explicit target language selection if one is already selected. Auto-detection should only suggest source language, or initialize target language on very first mount.
   - Synchronously clear all preview URLs, blobs, and job IDs when starting a new translation.
3. **HTTP Cache Header Hardening**:
   - Set `Cache-Control: private, no-cache, no-store, must-revalidate` across all preview and download routes.
4. **Edge Worker & Provider Robustness**:
   - Edge worker must key jobs and SVGs by `compositeKey` instead of raw `jobId`.
   - Ensure complete translations for all supported Core 4 languages (EN, ES, FR, DE).
