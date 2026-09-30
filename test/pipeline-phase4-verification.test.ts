import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { NextRequest } from "next/server";
import { POST as uploadHandler } from "../app/api/translate/upload/route";
import { GET as statusHandler } from "../app/api/translate/status/[jobId]/route";
import { GET as downloadHandler } from "../app/api/translate/download/[jobId]/route";
import { prisma } from "../lib/prisma";
import { grantWelcomeBonus } from "../lib/services/credit-service";
import { generateCompositeKey, CURRENT_PIPELINE_VERSION } from "../lib/translation/composite-key";
import { verifyTranslationArtifact } from "../lib/translation/verifier";
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

describe("PHASE 4 VERIFICATION: Multi-Language Matrix, Cache Reuse & Security Gateways", () => {
  let testUserId: string;
  const samplePdfPath = path.join(process.cwd(), "fixtures", "sample_birth_cert.pdf");
  const fileBytes = fs.readFileSync(samplePdfPath);

  beforeAll(async () => {
    const user = await prisma.user.create({
      data: {
        email: `phase4_verifier_${Date.now()}@example.com`,
        creditsAvailable: 500,
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

  async function uploadAndAwaitJob(targetLang: string) {
    const form = new FormData();
    form.append("file", new Blob([fileBytes], { type: "application/pdf" }), "sample_birth_cert.pdf");
    form.append("sourceLang", "en");
    form.append("targetLang", targetLang);
    form.append("serviceTier", "automated");
    form.append("userId", testUserId);

    const req = new NextRequest("http://localhost:3000/api/translate/upload", {
      method: "POST",
      body: form,
    });
    const res = await uploadHandler(req);
    const body = await res.json();
    const jobId = body.jobId;

    let poll = 0;
    while (poll < 100) {
      await new Promise((r) => setTimeout(r, 150));
      const sReq = new NextRequest(`http://localhost:3000/api/translate/status/${jobId}`);
      const sRes = await statusHandler(sReq, { params: Promise.resolve({ jobId }) });
      const sBody = await sRes.json();
      if (sBody.status === "ready" || sBody.status === "completed" || sBody.status === "failed") {
        break;
      }
      poll++;
    }

    const dlReq = new NextRequest(
      `http://localhost:3000/api/translate/download/${jobId}?token=${body.downloadToken}&userId=${testUserId}`,
      { headers: { "x-user-id": testUserId } }
    );
    const dlRes = await downloadHandler(dlReq, { params: Promise.resolve({ jobId }) });
    const buffer = Buffer.from(await dlRes.arrayBuffer());

    return {
      res,
      body,
      jobId,
      buffer,
      compositeKeyHeader: dlRes.headers.get("X-VerifyLingua-Composite-Key"),
    };
  }

  it("1. Multi-Language Isolation: Uploading same document to 3 target languages (ES, DE, FR) produces 3 distinct outputs with respective language tokens", async () => {
    // 1. Translate to ES
    const outEs = await uploadAndAwaitJob("es");
    // 2. Translate to DE
    const outDe = await uploadAndAwaitJob("de");
    // 3. Translate to FR
    const outFr = await uploadAndAwaitJob("fr");

    // All three jobs must have unique job IDs
    expect(outEs.jobId).not.toBe(outDe.jobId);
    expect(outDe.jobId).not.toBe(outFr.jobId);
    expect(outEs.jobId).not.toBe(outFr.jobId);

    // Decompress and inspect text tokens
    const textEs = decompressPdfStreams(outEs.buffer);
    const textDe = decompressPdfStreams(outDe.buffer);
    const textFr = decompressPdfStreams(outFr.buffer);

    // Assert German output contains German tokens and no French/Spanish specific translations
    expect(textDe).toMatch(/Geburtsurkunde|Standesamt|REPUBLIK KOLUMBIEN/i);
    expect(textDe).not.toContain("Acte de Naissance");
    expect(textDe).not.toContain("ACTA DE NACIMIENTO");

    // Assert French output contains French tokens
    expect(textFr).toMatch(/Acte de Naissance|État Civil|RÉPUBLIQUE DE COLOMBIE/i);
    expect(textFr).not.toContain("Geburtsurkunde");

    // Assert Spanish output contains Spanish tokens
    expect(textEs).toMatch(/CERTIFICADO DE NACIMIENTO|REGISTRO CIVIL/i);
    expect(textEs).not.toContain("Geburtsurkunde");
    expect(textEs).not.toContain("Acte de Naissance");
  });

  it("2. Legitimate Cache Reuse: Re-requesting the identical document + language pair returns cached result instantly with HIT header", async () => {
    // Submit identical request for German translation
    const form = new FormData();
    form.append("file", new Blob([fileBytes], { type: "application/pdf" }), "sample_birth_cert.pdf");
    form.append("sourceLang", "en");
    form.append("targetLang", "de");
    form.append("serviceTier", "automated");
    form.append("userId", testUserId);

    const startTime = Date.now();
    const req = new NextRequest("http://localhost:3000/api/translate/upload", {
      method: "POST",
      body: form,
    });
    const res = await uploadHandler(req);
    const durationMs = Date.now() - startTime;

    expect(res.status).toBe(200);
    const body = await res.json();

    // Cache hit assertions
    expect(res.headers.get("X-VerifyLingua-Cache")).toBe("HIT");
    expect(body.cached).toBe(true);
    expect(body.status).toBe("ready");
    expect(durationMs).toBeLessThan(100); // Instant response, no pipeline re-run
  });

  it("3. Layout Preservation: Font-size scaling and non-overlapping box geometry verified", async () => {
    const verifiedResult = await verifyTranslationArtifact({
      sourceBuffer: fileBytes,
      renderedBuffer: fileBytes,
      sourceBlocks: [
        { id: "b1", text: "REPÚBLICA DE COLOMBIA", x: 10, y: 10, width: 200, height: 20, page: 1 },
        { id: "b2", text: "REGISTRO CIVIL", x: 10, y: 40, width: 150, height: 20, page: 1 },
      ],
      translatedBlocks: [
        { id: "b1", text: "REPUBLIK KOLUMBIEN", x: 10, y: 10, width: 200, height: 20, page: 1 },
        { id: "b2", text: "STANDESAMT", x: 10, y: 40, width: 150, height: 20, page: 1 },
      ],
      targetLang: "de",
      sourceLang: "es",
    });

    expect(verifiedResult.passed).toBe(true);
    expect(verifiedResult.checks.blockCountMatched).toBe(true);
    expect(verifiedResult.checks.noLayoutOverflowOrCollision).toBe(true);
    expect(verifiedResult.checks.targetLanguageMatched).toBe(true);
    expect(verifiedResult.checks.tokensPreserved).toBe(true);
  });

  it("4. Negative Security Gates: Rejects unsupported language, corrupted file, and flags verification faults", async () => {
    const { POST: preflightHandler } = await import("../app/api/translate/preflight/route");

    // A. Unsupported language pair
    const unsuppForm = new FormData();
    unsuppForm.append("file", new Blob([fileBytes], { type: "application/pdf" }), "sample_birth_cert.pdf");
    unsuppForm.append("sourceLang", "en");
    unsuppForm.append("targetLang", "xx"); // Unsupported
    unsuppForm.append("userId", testUserId);

    const unsuppRes = await preflightHandler(new NextRequest("http://localhost:3000/api/translate/preflight", {
      method: "POST",
      body: unsuppForm,
    }));
    expect(unsuppRes.status).toBe(422);
    const unsuppBody = await unsuppRes.json();
    expect(unsuppBody.waitlistAffordance).toBe(true);

    // B. Corrupted file
    const corruptForm = new FormData();
    corruptForm.append("file", new Blob([Buffer.from("not-a-pdf-corrupt-data")], { type: "application/pdf" }), "corrupted.pdf");
    corruptForm.append("sourceLang", "en");
    corruptForm.append("targetLang", "de");
    corruptForm.append("userId", testUserId);

    const corruptRes = await uploadHandler(new NextRequest("http://localhost:3000/api/translate/upload", {
      method: "POST",
      body: corruptForm,
    }));
    const corruptBody = await corruptRes.json();
    const corruptJobId = corruptBody.jobId;

    // Poll status - Gatekeeper must transition job to failed
    let poll = 0;
    let finalStatus = "";
    let finalError = "";
    while (poll < 20) {
      await new Promise((r) => setTimeout(r, 100));
      const sRes = await statusHandler(new NextRequest(`http://localhost:3000/api/translate/status/${corruptJobId}`), {
        params: Promise.resolve({ jobId: corruptJobId }),
      });
      const sBody = await sRes.json();
      if (sBody.status === "failed") {
        finalStatus = sBody.status;
        finalError = sBody.error || "";
        break;
      }
      poll++;
    }

    expect(finalStatus).toBe("failed");
    expect(finalError).toMatch(/magic bytes|invalid file format|Gatekeeper/i);

    // C. Verifier flags layout collision
    const collisionResult = await verifyTranslationArtifact({
      sourceBuffer: fileBytes,
      renderedBuffer: fileBytes,
      sourceBlocks: [
        { id: "b1", text: "Header", x: 10, y: 10, width: 200, height: 40, page: 1 },
        { id: "b2", text: "Subheader", x: 20, y: 20, width: 100, height: 30, page: 1 }, // Collides with b1!
      ],
      translatedBlocks: [
        { id: "b1", text: "Titel", x: 10, y: 10, width: 200, height: 40, page: 1 },
        { id: "b2", text: "Untertitel", x: 20, y: 20, width: 100, height: 30, page: 1 },
      ],
      targetLang: "de",
      sourceLang: "en",
    });
    expect(collisionResult.passed).toBe(false);
    expect(collisionResult.diagnosticCode).toBe("VERIFY_LAYOUT_OVERFLOW");
  });
});
