import { describe, it, expect, afterAll, beforeAll } from "vitest";
import { prisma } from "../lib/prisma";
import { grantWelcomeBonus } from "../lib/services/credit-service";
import { processDocumentTranslation } from "../lib/translation/pipeline";
import { getTranslationJob, deleteTranslationJob } from "../lib/translation/store";
import { GET as downloadGet } from "../app/api/translate/download/[jobId]/route";
import { NextRequest } from "next/server";
import crypto from "crypto";
import JSZip from "jszip";

const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

describe("Phase 1: IDOR & Concurrent Cross-User Document Isolation", () => {
  const createdUserIds: string[] = [];

  const createTestUser = async (label: string) => {
    const id = `usr_p1_${label}_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`;
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

  it("Criterion 1: Job IDs must be server-generated cryptographically secure UUIDv4", async () => {
    const user = await createTestUser("uuid_check");
    const job = await processDocumentTranslation({
      userId: user.id,
      filename: "test_identity.docx",
      sourceLang: "es",
      targetLang: "en",
      format: "docx",
      fileBuffer: Buffer.from("Certificado de Nacimiento. Nombre: Maria Gomez."),
    });

    // Verify job ID is UUIDv4
    expect(job.id).toMatch(UUID_V4_REGEX);
  });

  it("Criterion 2: Storage keys must strictly follow jobs/{userId}/{jobId}/source.{ext} and jobs/{userId}/{jobId}/output.pdf", async () => {
    const user = await createTestUser("key_check");
    const job = await processDocumentTranslation({
      userId: user.id,
      filename: "birth_cert.docx",
      sourceLang: "es",
      targetLang: "en",
      format: "docx",
      fileBuffer: Buffer.from("Acta de Nacimiento Oficial"),
    });

    const dbRecord = await prisma.translationJob.findUnique({
      where: { id: job.id },
    });

    expect(dbRecord).not.toBeNull();
    const expectedSourceKey = `jobs/${user.id}/${job.id}/source.docx`;
    const expectedOutputKey = `jobs/${user.id}/${job.id}/output.pdf`;

    expect(dbRecord?.sourceKey).toBe(expectedSourceKey);
    expect(dbRecord?.outputKey).toBe(expectedOutputKey);
  });

  it("Criterion 3 & 4: Reject IDOR cross-user access and enforce Cache-Control: private, no-store", async () => {
    const userA = await createTestUser("victim_a");
    const userB = await createTestUser("attacker_b");

    // User A creates a confidential document
    const jobA = await processDocumentTranslation({
      userId: userA.id,
      filename: "confidential_tax_record.docx",
      sourceLang: "es",
      targetLang: "en",
      format: "docx",
      fileBuffer: Buffer.from("Declaracion de Impuestos Confidencial de User A"),
    });

    expect(jobA.status).toBe("completed");

    // Attacker User B attempts to download User A's job with User A's downloadToken
    const reqFromUserB = new NextRequest(
      `http://localhost:3000/api/translate/download/${jobA.id}?token=${jobA.downloadToken}`,
      {
        headers: {
          "x-user-id": userB.id,
        },
      }
    );

    const resForUserB = await downloadGet(reqFromUserB, {
      params: Promise.resolve({ jobId: jobA.id }),
    });

    // IDOR Protection: User B must be rejected even with token!
    expect([401, 403]).toContain(resForUserB.status);

    // Legitimate Owner User A downloads their own job
    const reqFromUserA = new NextRequest(
      `http://localhost:3000/api/translate/download/${jobA.id}?token=${jobA.downloadToken}`,
      {
        headers: {
          "x-user-id": userA.id,
        },
      }
    );

    const resForUserA = await downloadGet(reqFromUserA, {
      params: Promise.resolve({ jobId: jobA.id }),
    });

    expect(resForUserA.status).toBe(200);

    // Cache-Control verification
    const cacheControl = resForUserA.headers.get("Cache-Control") || "";
    expect(cacheControl).toContain("no-store");
    expect(cacheControl).not.toContain("max-age=3600");
  });

  it("Criterion 5: 20 simultaneous jobs from 5 different users — Zero crossover", async () => {
    // 5 distinct users
    const users = await Promise.all([
      createTestUser("u1"),
      createTestUser("u2"),
      createTestUser("u3"),
      createTestUser("u4"),
      createTestUser("u5"),
    ]);

    interface UserJobSpec {
      userId: string;
      userIndex: number;
      jobIndex: number;
      canary: string;
    }

    const jobSpecs: UserJobSpec[] = [];
    for (let u = 0; u < users.length; u++) {
      for (let j = 0; j < 4; j++) {
        const canary = `CANARY_SIG_USER_${u + 1}_JOB_${j + 1}_${crypto.randomBytes(6).toString("hex")}`;
        jobSpecs.push({
          userId: users[u].id,
          userIndex: u,
          jobIndex: j,
          canary,
        });
      }
    }

    expect(jobSpecs.length).toBe(20);

    // Launch all 20 jobs simultaneously
    const jobResults = await Promise.all(
      jobSpecs.map(async (spec) => {
        const content = `Official Record. ${spec.canary}. Certificate of Citizenship.`;
        const job = await processDocumentTranslation({
          userId: spec.userId,
          filename: `record_${spec.userIndex}_${spec.jobIndex}.docx`,
          sourceLang: "en",
          targetLang: "es",
          format: "docx",
          fileBuffer: Buffer.from(content),
        });

        return {
          spec,
          job,
        };
      })
    );

    // Verify all 20 jobs completed with valid UUIDs
    for (const { job, spec } of jobResults) {
      expect(job.status).toBe("completed");
      expect(job.id).toMatch(UUID_V4_REGEX);
    }

    // Now, verify each user downloads their own document and that ZERO cross-over occurred
    for (const { job, spec } of jobResults) {
      const downloadReq = new NextRequest(
        `http://localhost:3000/api/translate/download/${job.id}?token=${job.downloadToken}`,
        {
          headers: {
            "x-user-id": spec.userId,
          },
        }
      );

      const downloadRes = await downloadGet(downloadReq, {
        params: Promise.resolve({ jobId: job.id }),
      });

      expect(downloadRes.status).toBe(200);
      const arrayBuf = await downloadRes.arrayBuffer();
      const zip = await JSZip.loadAsync(Buffer.from(arrayBuf));
      const docXml = await zip.file("word/document.xml")?.async("string");
      const downloadedText = docXml || Buffer.from(arrayBuf).toString("utf-8");

      // Verify the downloaded file belongs to THIS user's job
      expect(downloadedText).toContain(spec.canary);

      // Verify it does NOT contain any OTHER user's canary
      for (const otherSpec of jobSpecs) {
        if (otherSpec.canary !== spec.canary) {
          expect(downloadedText).not.toContain(otherSpec.canary);
        }
      }
    }
  });
});
