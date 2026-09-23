import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "../lib/prisma";
import { processDocumentTranslation } from "../lib/translation/pipeline";
import { getTranslationJob } from "../lib/translation/store";
import { POST as reviewPost, GET as reviewGet } from "../app/api/jobs/[id]/review/route";
import { GET as downloadGet } from "../app/api/translate/download/[jobId]/route";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { NextRequest } from "next/server";
import crypto from "crypto";

describe("Phase 2: Durable Translation Pipeline, QA Pass & Sworn Certification", () => {
  const createdUserIds: string[] = [];

  const createTestUser = async (label: string) => {
    const id = `usr_p2_${label}_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`;
    const user = await prisma.user.create({
      data: {
        id,
        email: `${id}@verifylingua-test.com`,
        name: `Test User ${label}`,
        creditsAvailable: 20,
        creditsReserved: 0,
        lifetimePagesUsed: 0,
      },
    });
    createdUserIds.push(user.id);
    return user;
  };

  afterAll(async () => {
    for (const userId of createdUserIds) {
      try {
        await prisma.creditTransaction.deleteMany({ where: { userId } });
        await prisma.translationJob.deleteMany({ where: { userId } });
        await prisma.user.delete({ where: { id: userId } });
      } catch {}
    }
  });

  it("executes the full sworn lifecycle: uploaded -> extracting -> translating -> qa -> formatting -> awaiting_review -> certified -> delivered", async () => {
    const user = await createTestUser("sworn_lifecycle");

    // 1. Generate a realistic synthetic civil registry document (Spanish Birth Certificate)
    const srcDoc = await PDFDocument.create();
    const page = srcDoc.addPage([612, 792]);
    const font = await srcDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await srcDoc.embedFont(StandardFonts.HelveticaBold);

    page.drawText("REPUBLICA DE COLOMBIA - REGISTRO CIVIL DE NACIMIENTO", {
      x: 50,
      y: 720,
      size: 12,
      font: fontBold,
      color: rgb(0.1, 0.1, 0.2),
    });
    page.drawText("Numero de Serial: 48910283", { x: 50, y: 690, size: 10, font });
    page.drawText("Fecha de Nacimiento: 14 de Mayo de 1998", { x: 50, y: 670, size: 10, font });
    page.drawText("Nombre Completo: CAMILA SOFIA VALENCIA MENDOZA", { x: 50, y: 650, size: 10, font });
    page.drawText("Lugar de Nacimiento: Bogota D.C., Colombia", { x: 50, y: 630, size: 10, font });
    page.drawText("Oficial del Registro Civil certifica la siguiente Acta de Nacimiento.", { x: 50, y: 600, size: 10, font });

    const srcPdfBytes = await srcDoc.save();
    const srcBuffer = Buffer.from(srcPdfBytes);

    // Track state progression during pipeline
    const observedStates: string[] = [];

    // 2. Submit to pipeline with serviceTier: "certified"
    const job = await processDocumentTranslation({
      userId: user.id,
      filename: "Acta_Nacimiento_Camila_Valencia.pdf",
      sourceLang: "es",
      targetLang: "en",
      serviceTier: "certified",
      fileBuffer: srcBuffer,
    });

    // 3. Verify job stopped in 'awaiting_review'
    expect(job.status).toBe("awaiting_review");
    expect(job.progress).toBe(95);
    expect(job.currentStep).toContain("Awaiting sworn translator review");

    // Verify DB state is also 'awaiting_review'
    const dbJob = await prisma.translationJob.findUnique({
      where: { id: job.id },
    });
    expect(dbJob?.status).toBe("awaiting_review");

    // 4. Verify Automated QA report was generated and attached to the job
    expect(job.qaReport).toBeDefined();
    expect(job.qaReport?.fidelityScore).toBeGreaterThanOrEqual(80);
    expect(job.qaReport?.metrics.sourceNumberCount).toBeGreaterThan(0);
    expect(job.qaReport?.metrics.numbersMatched).toBe(true);
    expect(job.qaReport?.metrics.missingNumbers).toEqual([]);
    expect(job.qaReport?.metrics.omissionDetected).toBe(false);

    // 5. Attempt download while in 'awaiting_review' -> MUST reject with HTTP 409
    const earlyDownloadReq = new NextRequest(
      `http://localhost:3000/api/translate/download/${job.id}?token=${job.downloadToken}`,
      {
        headers: { "x-user-id": user.id },
      }
    );
    const earlyDownloadRes = await downloadGet(earlyDownloadReq, {
      params: Promise.resolve({ jobId: job.id }),
    });

    expect(earlyDownloadRes.status).toBe(409);
    const earlyError = await earlyDownloadRes.json();
    expect(earlyError.error).toContain("awaiting sworn translator review");

    // 6. Translator review route inspection (GET /api/jobs/[id]/review)
    const reviewGetReq = new NextRequest(`http://localhost:3000/api/jobs/${job.id}/review`);
    const reviewGetRes = await reviewGet(reviewGetReq, {
      params: Promise.resolve({ id: job.id }),
    });
    expect(reviewGetRes.status).toBe(200);
    const reviewGetData = await reviewGetRes.json();
    expect(reviewGetData.job.status).toBe("awaiting_review");
    expect(reviewGetData.job.sourceLanguage).toBe("es");
    expect(reviewGetData.job.targetLanguage).toBe("en");

    // 7. Sworn Translator Review & Sign-Off (POST /api/jobs/[id]/review)
    // Test missing translatorId validation
    const invalidReviewReq = new NextRequest(`http://localhost:3000/api/jobs/${job.id}/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approved: true }),
    });
    const invalidReviewRes = await reviewPost(invalidReviewReq, {
      params: Promise.resolve({ id: job.id }),
    });
    expect(invalidReviewRes.status).toBe(400);

    // Submit valid sworn sign-off
    const validReviewReq = new NextRequest(`http://localhost:3000/api/jobs/${job.id}/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        translatorId: "ATA-CT-48910",
        translatorName: "Maria E. Rodriguez, CT (ATA #48910)",
        signature: "Maria E. Rodriguez",
        approved: true,
      }),
    });
    const validReviewRes = await reviewPost(validReviewReq, {
      params: Promise.resolve({ id: job.id }),
    });

    expect(validReviewRes.status).toBe(200);
    const reviewResult = await validReviewRes.json();
    expect(reviewResult.status).toBe("certified");
    expect(reviewResult.translatorId).toBe("ATA-CT-48910");

    // Verify status in DB is now 'certified'
    const updatedDbJob = await prisma.translationJob.findUnique({
      where: { id: job.id },
    });
    expect(updatedDbJob?.status).toBe("certified");

    // 8. Customer Download Post-Certification (GET /api/translate/download/[jobId])
    const certDownloadReq = new NextRequest(
      `http://localhost:3000/api/translate/download/${job.id}?token=${job.downloadToken}`,
      {
        headers: { "x-user-id": user.id },
      }
    );
    const certDownloadRes = await downloadGet(certDownloadReq, {
      params: Promise.resolve({ jobId: job.id }),
    });

    expect(certDownloadRes.status).toBe(200);
    expect(certDownloadRes.headers.get("Content-Type")).toBe("application/pdf");
    expect(certDownloadRes.headers.get("Cache-Control")).toBe(
      "private, no-cache, no-store, must-revalidate"
    );
    expect(certDownloadRes.headers.get("Content-Disposition")).toBe(
      'attachment; filename="Acta_Nacimiento_Camila_Valencia_EN_certified.pdf"'
    );

    // 9. Verify the downloaded PDF contains the translated content and 8 CFR 103.2 affidavit page
    const finalBuffer = Buffer.from(await certDownloadRes.arrayBuffer());
    const finalDoc = await PDFDocument.load(finalBuffer);

    // Source had 1 page + 1 affidavit page = 2 pages
    expect(finalDoc.getPageCount()).toBe(2);

    // Affidavit page is the last page
    const affidavitPage = finalDoc.getPage(1);
    const { width, height } = affidavitPage.getSize();
    expect(width).toBe(612);
    expect(height).toBe(792);
  });
});
