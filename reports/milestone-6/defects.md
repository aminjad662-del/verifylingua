# Milestone 6 Defect Log & Resolutions

## Defect 1: OPC Relationship Requirement in python-docx vs Direct OpenXML
- **Symptom**: `python-docx`'s `docx.Document()` throws `KeyError: no relationship of type officeDocument` if `_rels/.rels` is missing in arbitrary user-uploaded or minimal DOCX archives.
- **Root Cause**: `python-docx` expects a full OPC (Open Packaging Conventions) package structure with root relationships.
- **Fix**: Implemented `DocxPipeline` using direct zipfile and `lxml.etree` manipulation. It directly parses `word/document.xml`, `word/header*.xml`, `word/footer*.xml`, and note parts without requiring `_rels/.rels`. Standard OPC packages and minimal non-standard DOCX zips are both supported universally. Verified with Gate 6.5.

## Defect 2: Variable Scope in Tag-to-rPr Template Mapping
- **Symptom**: `UnboundLocalError: cannot access local variable 'prefix' where it is not associated with a value` during run redistribution in `DocxPipeline.reconstruct_docx`.
- **Root Cause**: `prefix = re.sub(r"\d+", "", tag_key)` was positioned after an element lookup during refactoring.
- **Fix**: Re-ordered assignment so `prefix` is computed immediately when `tag_key` is present, before looking up style templates in `tag_rpr_map`.

## Defect 3: Return Statement Omission for Image Branch in `reconstruct_document`
- **Symptom**: `test_gate_5_6_user_test_case_15_ar_fr_en` failed in regression testing because image documents fell through to `pdf_reconstructor.reconstruct_pdf`.
- **Root Cause**: During addition of `elif fmt == "docx":` to `api/render.py`, the return statement for the `if fmt in ("jpg", "jpeg", "png"):` block was accidentally omitted.
- **Fix**: Restored `return rendered_bytes, preview_bytes, qa_records` at line 896 of `api/render.py`. Full test suite re-verified with 52/52 passing tests.
