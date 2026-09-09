import { describe, it, expect, beforeEach } from "vitest";
import {
  isolatedDb,
  generateR2ObjectKey,
} from "../lib/db/data-isolation";

describe("Phase 1: Database Schema & Tenant Data Isolation Gate", () => {
  const userA = "user_clerk_alice_123";
  const userB = "user_clerk_bob_456";

  beforeEach(() => {
    isolatedDb.clear();
  });

  it("1. Generates strictly isolated R2 keys prefixed with userId and documentId", () => {
    const keyA = generateR2ObjectKey(userA, "doc_991", "contract.pdf");
    const keyB = generateR2ObjectKey(userB, "doc_991", "contract.pdf");

    expect(keyA).toBe(`${userA}/doc_991/contract.pdf`);
    expect(keyB).toBe(`${userB}/doc_991/contract.pdf`);
    expect(keyA).not.toBe(keyB);
    expect(keyA.startsWith(userA)).toBe(true);
    expect(keyB.startsWith(userB)).toBe(true);
  });

  it("2. Prohibits cross-tenant document visibility in list queries", async () => {
    // User A creates 2 documents
    const docA1 = await isolatedDb.createDocument(userA, {
      filename: "Alice_Employment_Contract.pdf",
      format: "pdf",
      mimeType: "application/pdf",
      sizeBytes: 1048576,
      sha256Hash: "hash_alice_doc_1",
      pageCount: 4,
      hasTables: true,
    });

    const docA2 = await isolatedDb.createDocument(userA, {
      filename: "Alice_Tax_Return.pdf",
      format: "pdf",
      mimeType: "application/pdf",
      sizeBytes: 524288,
      sha256Hash: "hash_alice_doc_2",
      pageCount: 2,
    });

    // User B creates 1 document
    const docB1 = await isolatedDb.createDocument(userB, {
      filename: "Bob_Medical_Certificate.jpg",
      format: "jpg",
      mimeType: "image/jpeg",
      sizeBytes: 204800,
      sha256Hash: "hash_bob_doc_1",
      pageCount: 1,
    });

    // Verify User A listing
    const userADocs = await isolatedDb.listUserDocuments(userA);
    expect(userADocs).toHaveLength(2);
    expect(userADocs.map((d) => d.id)).toEqual(expect.arrayContaining([docA1.id, docA2.id]));
    expect(userADocs.some((d) => d.id === docB1.id)).toBe(false);

    // Verify User B listing
    const userBDocs = await isolatedDb.listUserDocuments(userB);
    expect(userBDocs).toHaveLength(1);
    expect(userBDocs[0].id).toBe(docB1.id);
    expect(userBDocs.some((d) => d.id === docA1.id)).toBe(false);
    expect(userBDocs.some((d) => d.id === docA2.id)).toBe(false);
  });

  it("3. Strictly prevents User A from reading User B's document by ID", async () => {
    const docB = await isolatedDb.createDocument(userB, {
      filename: "Bob_Confidential_NDAs.pdf",
      format: "pdf",
      mimeType: "application/pdf",
      sizeBytes: 300000,
      sha256Hash: "hash_bob_secret",
    });

    // User B can access their own document
    const bobAccess = await isolatedDb.getDocumentById(userB, docB.id);
    expect(bobAccess).not.toBeNull();
    expect(bobAccess?.id).toBe(docB.id);
    expect(bobAccess?.r2SourceKey.startsWith(userB)).toBe(true);

    // User A attempting to read User B's document gets null
    const aliceBreachAttempt = await isolatedDb.getDocumentById(userA, docB.id);
    expect(aliceBreachAttempt).toBeNull();
  });

  it("4. Prevents User A from creating a translation job for User B's document", async () => {
    const docB = await isolatedDb.createDocument(userB, {
      filename: "Bob_Passport.pdf",
      format: "pdf",
      mimeType: "application/pdf",
      sizeBytes: 150000,
      sha256Hash: "hash_bob_passport",
    });

    // Alice attempts to submit a translation job using Bob's documentId
    await expect(
      isolatedDb.createJob(userA, {
        documentId: docB.id,
        sourceLang: "es",
        targetLang: "ar",
      })
    ).rejects.toThrow(/Access Denied/);
  });

  it("5. Strictly prevents cross-tenant translation job listing and ID retrieval", async () => {
    const docA = await isolatedDb.createDocument(userA, {
      filename: "Alice_Doc.pdf",
      format: "pdf",
      mimeType: "application/pdf",
      sizeBytes: 10000,
      sha256Hash: "hash_a",
    });
    const docB = await isolatedDb.createDocument(userB, {
      filename: "Bob_Doc.pdf",
      format: "pdf",
      mimeType: "application/pdf",
      sizeBytes: 10000,
      sha256Hash: "hash_b",
    });

    const jobA = await isolatedDb.createJob(userA, {
      documentId: docA.id,
      sourceLang: "en",
      targetLang: "ar",
    });
    const jobB = await isolatedDb.createJob(userB, {
      documentId: docB.id,
      sourceLang: "en",
      targetLang: "fr",
    });

    // User A lists jobs -> only jobA
    const aliceJobs = await isolatedDb.listUserJobs(userA);
    expect(aliceJobs).toHaveLength(1);
    expect(aliceJobs[0].id).toBe(jobA.id);

    // User B lists jobs -> only jobB
    const bobJobs = await isolatedDb.listUserJobs(userB);
    expect(bobJobs).toHaveLength(1);
    expect(bobJobs[0].id).toBe(jobB.id);

    // User A queries jobB by ID -> null
    const aliceJobB = await isolatedDb.getJobById(userA, jobB.id);
    expect(aliceJobB).toBeNull();

    // User B queries jobA by ID -> null
    const bobJobA = await isolatedDb.getJobById(userB, jobA.id);
    expect(bobJobA).toBeNull();
  });

  it("6. Strictly isolates job status events and audit logs between tenants", async () => {
    const docB = await isolatedDb.createDocument(userB, {
      filename: "Bob_Patent.pdf",
      format: "pdf",
      mimeType: "application/pdf",
      sizeBytes: 40000,
      sha256Hash: "hash_patent",
    });
    const jobB = await isolatedDb.createJob(userB, {
      documentId: docB.id,
      sourceLang: "de",
      targetLang: "en",
    });

    await isolatedDb.recordJobEvent(userB, jobB.id, "extracting", "Extracting text matrices and layout graph");

    // Bob can read events
    const bobEvents = await isolatedDb.listJobEvents(userB, jobB.id);
    expect(bobEvents.length).toBeGreaterThanOrEqual(2); // queued + extracting

    // Alice querying Bob's job events gets empty array
    const aliceSnoopEvents = await isolatedDb.listJobEvents(userA, jobB.id);
    expect(aliceSnoopEvents).toHaveLength(0);
  });

  it("7. Isolates user retention settings", async () => {
    // User A sets 7 days auto-delete
    await isolatedDb.updateRetentionSettings(userA, {
      autoDeleteEnabled: true,
      retentionDays: 7,
    });

    // User B checks retention -> remains default (keep indefinitely)
    const bobSettings = await isolatedDb.getRetentionSettings(userB);
    expect(bobSettings.autoDeleteEnabled).toBe(false);
    expect(bobSettings.retentionDays).toBe(30);

    const aliceSettings = await isolatedDb.getRetentionSettings(userA);
    expect(aliceSettings.autoDeleteEnabled).toBe(true);
    expect(aliceSettings.retentionDays).toBe(7);
  });
});
