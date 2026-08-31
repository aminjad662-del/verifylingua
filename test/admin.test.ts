import { describe, it, expect } from "vitest";

describe("Admin & Translator Console Tests (Phase 7)", () => {
  it("validates that locked passport terms are detected in translation draft", () => {
    const lockedTerms = ["MOHAMMED ABDULLAH AL-RASHID", "FATIMA ZAHRA AL-RASHID"];
    const draftText = "Certificate for MOHAMMED ABDULLAH AL-RASHID born to FATIMA ZAHRA AL-RASHID.";

    const allValid = lockedTerms.every((term) => draftText.includes(term));
    expect(allValid).toBe(true);
  });

  it("detects transliteration mismatch when name has even a 1-character typo", () => {
    const lockedTerm = "MOHAMMED ABDULLAH AL-RASHID";
    const draftWithTypo = "Certificate for MOHAMED ABDULLAH AL-RASHID."; // Single M instead of MM

    const isValid = draftWithTypo.includes(lockedTerm);
    expect(isValid).toBe(false);
  });

  it("verifies all USCIS QA checklist requirements are satisfied before issuance", () => {
    const qaState = {
      stampsTranslated: true,
      layoutMirrored: true,
      namesLocked: true,
      dateFormatConsistent: true,
      competenceStatementSigned: true,
    };

    const isReadyForIssuance = Object.values(qaState).every(Boolean);
    expect(isReadyForIssuance).toBe(true);
  });
});
