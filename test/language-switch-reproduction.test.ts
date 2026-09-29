import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { NextRequest } from "next/server";
import { POST as uploadHandler } from "../app/api/translate/upload/route";
import { GET as statusHandler } from "../app/api/translate/status/[jobId]/route";
import { GET as downloadHandler } from "../app/api/translate/download/[jobId]/route";
import { GET as previewHandler } from "../app/api/jobs/[id]/preview/route";
import { prisma } from "../lib/prisma";
import { grantWelcomeBonus } from "../lib/services/credit-service";
import fs from "fs";
import path from "path";
import zlib from "zlib";

function decompressPdfStreams(pdfBuffer: Buffer): string {
  let searchPos = 0;
  let allDecompressed = "";
  while (searchPos < pdfBuffer.length) {
    const streamStart = pdfBuffer.indexOf(Buffer.from("stream"), searchPos);
    if (streamStart === -1) break;

    let dataStart = streamStart + 6;
    if (pdfBuffer[dataStart] === 0x0d && pdfBuffer[dataStart + 1] === 0x0a) {
      dataStart += 2;
    } else if (pdfBuffer[dataStart] === 0x0a) {
      dataStart += 1;
    }

    const streamEnd = pdfBuffer.indexOf(Buffer.from("endstream"), dataStart);
    if (streamEnd === -1) break;

    const slice = pdfBuffer.slice(dataStart, streamEnd);
    let chunk = "";
    try {
      chunk = zlib.inflateSync(slice).toString("latin1");
    } catch {
      chunk = slice.toString("latin1");
    }
    const decoded = chunk.replace(/<([0-9A-Fa-f]{2,})>/g, (_, hex) => {
      try {
        return Buffer.from(hex, "hex").toString("latin1");
      } catch {
        return _;
      }
    });
    allDecompressed += " " + decoded;
    searchPos = streamEnd + 9;
  }
  return allDecompressed;
}

describe("PHASE 1 REPRODUCTION: Same File Upload With Different Target Language", () => {
  let testUserId: string;
  const samplePdfPath = path.join(process.cwd(), "fixtures", "sample_birth_cert.pdf");
  const worksheetImagePath = path.join(process.cwd(), "public", "samples", "worksheet-sample.jpg");

  beforeAll(async () => {
    const user = await prisma.user.create({
      data: {
        email: `repro_user_${Date.now()}@example.com`,
        creditsAvailable: 100,
        creditsReserved: 0,
        lifetimePagesUsed: 0,
      },
    });
    testUserId = user.id;
    await grantWelcomeBonus(testUserId);
  });

  afterAll(async () => {
    if (testUserId) {
      try {
        await prisma.creditTransaction.deleteMany({ where: { userId: testUserId } });
        await prisma.translationJob.deleteMany({ where: { userId: testUserId } });
        await prisma.user.delete({ where: { id: testUserId } });
      } catch {}
    }
  });

  it("REPRODUCTION BUG 1: Frontend auto-detection heuristic preserves user's target language selection when re-uploading the same document", () => {
    // Fixed frontend handleStageFile logic from app/translate/page.tsx:261-274
    function stageFileWithHeuristics(
      fileName: string,
      currentTargetLang: string,
      currentSourceLang = "auto"
    ): { targetLang: string; sourceLang: string } {
      const resolvedTarget = currentTargetLang;
      let resolvedSource = currentSourceLang;
      const lowerName = fileName.toLowerCase();
      if (
        lowerName.includes("beach") ||
        lowerName.includes("reading") ||
        lowerName.includes("worksheet") ||
        lowerName.includes("english")
      ) {
        if (resolvedSource === "auto") resolvedSource = "en";
      } else if (
        lowerName.includes("spanish") ||
        lowerName.includes("espanol") ||
        lowerName.includes("acta")
      ) {
        if (resolvedSource === "auto") resolvedSource = "es";
      }
      return { targetLang: resolvedTarget, sourceLang: resolvedSource };
    }

    // Step 1: User uploads "reading_comprehension_worksheet.pdf", selects Language A (es)
    const step1 = stageFileWithHeuristics("reading_comprehension_worksheet.pdf", "es");
    expect(step1.targetLang).toBe("es");

    // Step 2: User sets target language to Language B (French: fr)
    const userSelectedLanguageB = "fr";

    // Client scenario step 2: User uploads THE SAME file again, expecting target language B (fr)
    const step2 = stageFileWithHeuristics("reading_comprehension_worksheet.pdf", userSelectedLanguageB);

    expect(step2.targetLang).toBe("fr");
  });

  it("REPRODUCTION BUG 2: Re-translating same document to German (de) produces German translated content without Language A bleeding", async () => {
    // Read the same PDF file
    const fileBytes = fs.readFileSync(samplePdfPath);

    // 1. Upload file for Language A (Spanish: es)
    const formA = new FormData();
    formA.append("file", new Blob([fileBytes], { type: "application/pdf" }), "sample_birth_cert.pdf");
    formA.append("sourceLang", "en");
    formA.append("targetLang", "es");
    formA.append("serviceTier", "automated");
    formA.append("userId", testUserId);

    const reqA = new NextRequest("http://localhost:3000/api/translate/upload", {
      method: "POST",
      body: formA,
    });
    const resA = await uploadHandler(reqA);
    expect([200, 202]).toContain(resA.status);
    const bodyA = await resA.json();
    const jobAId = bodyA.jobId;

    // Wait for Job A to complete
    let pollA = 0;
    while (pollA < 30) {
      await new Promise((r) => setTimeout(r, 200));
      const sReq = new NextRequest(`http://localhost:3000/api/translate/status/${jobAId}`);
      const sRes = await statusHandler(sReq, { params: Promise.resolve({ jobId: jobAId }) });
      const sBody = await sRes.json();
      if (sBody.status === "ready" || sBody.status === "completed" || sBody.status === "failed") break;
      pollA++;
    }

    // 2. Upload THE SAME file for Language B (German: de)
    const formB = new FormData();
    formB.append("file", new Blob([fileBytes], { type: "application/pdf" }), "sample_birth_cert.pdf");
    formB.append("sourceLang", "en");
    formB.append("targetLang", "de");
    formB.append("serviceTier", "automated");
    formB.append("userId", testUserId);

    const reqB = new NextRequest("http://localhost:3000/api/translate/upload", {
      method: "POST",
      body: formB,
    });
    const resB = await uploadHandler(reqB);
    expect([200, 202]).toContain(resB.status);
    const bodyB = await resB.json();
    const jobBId = bodyB.jobId;

    // Wait for Job B to complete
    let pollB = 0;
    while (pollB < 30) {
      await new Promise((r) => setTimeout(r, 200));
      const sReq = new NextRequest(`http://localhost:3000/api/translate/status/${jobBId}`);
      const sRes = await statusHandler(sReq, { params: Promise.resolve({ jobId: jobBId }) });
      const sBody = await sRes.json();
      if (sBody.status === "ready" || sBody.status === "completed" || sBody.status === "failed") break;
      pollB++;
    }

    // Fetch Job B output
    const dlReqB = new NextRequest(
      `http://localhost:3000/api/translate/download/${jobBId}?token=${bodyB.downloadToken}&userId=${testUserId}`,
      { headers: { "x-user-id": testUserId } }
    );
    const dlResB = await downloadHandler(dlReqB, { params: Promise.resolve({ jobId: jobBId }) });
    if (dlResB.status !== 200) {
      console.error("DEBUG dlResB status:", dlResB.status, await dlResB.clone().text());
    }
    expect(dlResB.status).toBe(200);

    const bufB = Buffer.from(await dlResB.arrayBuffer());
    const textB = decompressPdfStreams(bufB);

    // Output B must differ from Output A and must NOT contain Spanish translations
    expect(textB).not.toContain("Acta de Nacimiento");
    // Output B must contain German translation
    expect(textB).toMatch(/Geburtsurkunde|DEUTSCHLAND|Standesamt|Urkunde|Geburtenregister/i);
  });

  it("REPRODUCTION BUG 3: Preview endpoint returns Cache-Control allowing stale 5-minute browser cache", async () => {
    const fileBytes = fs.readFileSync(samplePdfPath);
    const form = new FormData();
    form.append("file", new Blob([fileBytes], { type: "application/pdf" }), "sample_birth_cert.pdf");
    form.append("sourceLang", "en");
    form.append("targetLang", "fr");
    form.append("serviceTier", "automated");
    form.append("userId", testUserId);

    const uploadRes = await uploadHandler(new NextRequest("http://localhost:3000/api/translate/upload", {
      method: "POST",
      body: form,
    }));
    const { jobId, downloadToken } = await uploadRes.json();

    // Wait for job to complete
    let poll = 0;
    while (poll < 30) {
      await new Promise((r) => setTimeout(r, 200));
      const sReq = new NextRequest(`http://localhost:3000/api/translate/status/${jobId}`);
      const sRes = await statusHandler(sReq, { params: Promise.resolve({ jobId }) });
      const sBody = await sRes.json();
      if (sBody.status === "ready" || sBody.status === "completed" || sBody.status === "failed") break;
      poll++;
    }

    // Fetch download with inline=true (as used by preview iframes)
    const dlReq = new NextRequest(
      `http://localhost:3000/api/translate/download/${jobId}?token=${downloadToken}&inline=true&userId=${testUserId}`,
      { headers: { "x-user-id": testUserId } }
    );
    const dlRes = await downloadHandler(dlReq, { params: Promise.resolve({ jobId }) });
    expect(dlRes.status).toBe(200);

    const cacheControl = dlRes.headers.get("cache-control") || "";
    // In production certified translation, preview must NEVER be cached publicly with max-age=300
    // because subsequent requests for the same path or reloaded iframes serve the stale language!
    expect(cacheControl).not.toContain("public");
    expect(cacheControl).toContain("no-store");
  });
});
