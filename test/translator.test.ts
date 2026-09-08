import { describe, it, expect } from "vitest";
import { GET as getWorkbench, POST as saveWorkbench } from "@/app/api/translator/workbench/[id]/route";
import { POST as submitWorkbench } from "@/app/api/translator/workbench/[id]/submit/route";

describe("Linguist Studio™ Translator & Notary Workbench Suite (Stage 3)", () => {
  const testJobId = "VL-TEST-CAT-1";

  it("1. loads translator CAT workbench with segments, locked terms, and ATA credentials", async () => {
    const req = new Request(`http://localhost:3000/api/translator/workbench/${testJobId}`);
    const res = await getWorkbench(req, { params: Promise.resolve({ id: testJobId }) });
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.job).toBeDefined();
    expect(data.job.publicCode).toBe(testJobId);
    expect(Array.isArray(data.segments)).toBe(true);
    expect(data.segments.length).toBeGreaterThanOrEqual(4);
    expect(data.job.assignedTranslator.credentials).toContain("ATA Member");
  });

  it("2. auto-saves updated translation segments in CAT editor", async () => {
    // Non-array segments payload
    const invalidReq = new Request(`http://localhost:3000/api/translator/workbench/${testJobId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ segments: "not-an-array" }),
    });
    const invalidRes = await saveWorkbench(invalidReq, { params: Promise.resolve({ id: testJobId }) });
    expect(invalidRes.status).toBe(400);

    // Valid segments payload
    const validReq = new Request(`http://localhost:3000/api/translator/workbench/${testJobId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        segments: [
          {
            id: "seg-1",
            section: "HEADER",
            sourceText: "ESTADOS UNIDOS MEXICANOS",
            targetText: "UNITED MEXICAN STATES",
            locked: false,
            status: "TRANSLATED",
          },
        ],
      }),
    });
    const validRes = await saveWorkbench(validReq, { params: Promise.resolve({ id: testJobId }) });
    expect(validRes.status).toBe(200);

    const validData = await validRes.json();
    expect(validData.success).toBe(true);
    expect(validData.segmentCount).toBe(1);
    expect(validData.savedAt).toBeDefined();
  });

  it("3. enforces 8 CFR sworn competence affidavit and wet-ink signature before submission", async () => {
    // Missing affidavit
    const noAffidavitReq = new Request(`http://localhost:3000/api/translator/workbench/${testJobId}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        signatureData: "Elena Volkova",
        translatorAffidavitConfirmed: false,
      }),
    });
    const noAffidavitRes = await submitWorkbench(noAffidavitReq, {
      params: Promise.resolve({ id: testJobId }),
    });
    expect(noAffidavitRes.status).toBe(400);

    // Missing signature
    const noSigReq = new Request(`http://localhost:3000/api/translator/workbench/${testJobId}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        signatureData: "",
        translatorAffidavitConfirmed: true,
      }),
    });
    const noSigRes = await submitWorkbench(noSigReq, {
      params: Promise.resolve({ id: testJobId }),
    });
    expect(noSigRes.status).toBe(400);

    // Valid submission
    const validReq = new Request(`http://localhost:3000/api/translator/workbench/${testJobId}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        signatureData: "Elena Volkova, ATA Member 271892",
        translatorAffidavitConfirmed: true,
        segments: [
          { id: "seg-1", targetText: "UNITED MEXICAN STATES" },
        ],
      }),
    });
    const validRes = await submitWorkbench(validReq, {
      params: Promise.resolve({ id: testJobId }),
    });
    expect(validRes.status).toBe(200);

    const validData = await validRes.json();
    expect(validData.success).toBe(true);
    expect(validData.status).toBe("QA");
    expect(validData.message).toContain("validated under 8 CFR");
  });

  it("4. verifies DeepL neural translation integration and free-tier API routing", async () => {
    const { callDeepLTranslation, callDeepLBatchTranslation } = await import(
      "@/lib/translation/translator"
    );

    // Test with mock fetch to verify payload & authorization header
    const originalFetch = global.fetch;
    let interceptedUrl = "";
    let interceptedHeaders: any = {};
    let interceptedBody: any = {};

    global.fetch = async (url: any, init: any) => {
      interceptedUrl = url.toString();
      interceptedHeaders = init.headers;
      interceptedBody = JSON.parse(init.body);
      return {
        ok: true,
        status: 200,
        json: async () => ({
          translations: [{ text: "CERTIFICATE OF LIVE BIRTH" }],
        }),
      } as any;
    };

    try {
      const translated = await callDeepLTranslation(
        "ACTA DE NACIMIENTO",
        { sourceLang: "es", targetLang: "en" },
        "7dbfa8c2-d1fc-4453-940a-4cfda3861f97:fx"
      );

      expect(translated).toBe("CERTIFICATE OF LIVE BIRTH");
      // Must route to free tier API because of :fx suffix
      expect(interceptedUrl).toBe("https://api-free.deepl.com/v2/translate");
      expect(interceptedHeaders["Authorization"]).toBe(
        "DeepL-Auth-Key 7dbfa8c2-d1fc-4453-940a-4cfda3861f97:fx"
      );
      // Target lang for English must map to EN-US
      expect(interceptedBody.target_lang).toBe("EN-US");
      expect(interceptedBody.source_lang).toBe("ES");
    } finally {
      global.fetch = originalFetch;
    }
  });
});

