# Milestone 4 Defect Log & Root-Cause Resolutions

### Defect 1: Greedy Capture of Sentence Terminal Punctuation in URL and Email Masking
- **Symptoms**: In sentence `...visit https://immigration.gov/portal. Click here`, the URL extractor masked `https://immigration.gov/portal.` (including the trailing period), leaving the restored sentence without its punctuation or creating broken links.
- **Root Cause**: The character class `[^\s<>"]+` greedily consumes all non-whitespace characters up to the space, absorbing trailing periods, commas, or semicolons.
- **Resolution**: Implemented trailing punctuation trimming in `mask_protected_tokens` for both URLs and emails:
  ```python
  trailing = ""
  while url_text and url_text[-1] in ".,;:!?":
      trailing = url_text[-1] + trailing
      url_text = url_text[:-1]
  masked = masked[:match.start()] + placeholder + trailing + masked[match.end():]
  ```
  The pure URL is preserved in the token map, while the period remains properly positioned in the surrounding sentence structure.

### Defect 2: Natural Language Label Absorption in Reference Number Extraction
- **Symptoms**: For the phrase `"Case ID: REF-98765-X"`, `RE_CASE_NUM` captured `"Case ID"` as protected token `⟦N1⟧`, shifting `"REF-98765-X"` to `⟦N2⟧`.
- **Root Cause**: The prefix alternation `(?:CASE|ID)` with whitespace delimiter `[-#:\s]` treated the words `"Case ID"` as a reference code itself.
- **Resolution**: Refined `RE_CASE_NUM` to `\b(?:REF|USCIS|CASE|DOC|ID)-[A-Za-z0-9-]+\b|\bClause\s+\d+\.\d+\b`. By strictly enforcing a hyphenated structure after the prefix, natural language labels like `"Case ID:"` remain translatable text while the actual reference code (`REF-98765-X`) is cleanly protected.

### Defect 3: FastAPI Python 3.14 Generic List Body ForwardRef Evaluation
- **Symptoms**: `POST /api/jobs/{id}/glossary` returned HTTP 422 with `"Field required in query"`, or raised `pydantic.errors.PydanticUserError` on `TypeAdapter` forward ref resolution for `List[GlossaryTermModel]`.
- **Root Cause**: In Python 3.14 and FastAPI, unannotated top-level generic list arguments default to query parameters, and wrapping them directly can lead to Pydantic v2 TypeAdapter forward ref resolution issues during request validation.
- **Resolution**: Refactored `add_job_glossary` to accept `request: Request` and inspect `await request.json()`, supporting both direct JSON arrays `[{source, target}]` and wrapped objects `{"terms": [...]}` with explicit model parsing via `GlossaryTermModel(**item)` and `t.model_dump()`.
