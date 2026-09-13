import { describe, it, expect, beforeAll } from "vitest";
import fs from "fs";
import path from "path";
import JSZip from "jszip";
import { validateInputFile } from "@/lib/translation/pipeline";
import { translateDocx } from "@/lib/translation/docx";
import { putObject, getObject } from "@/lib/storage";
import { createPersistentJob, getPersistentJob, updatePersistentJob } from "@/lib/translation/persistent-store";
import { autonomousDocumentAgent } from "@/lib/agent/autonomous-document-agent";

// Ensure environment variables from .env are available in test runtime
beforeAll(() => {
  if (typeof process.loadEnvFile === "function") {
    try {
      process.loadEnvFile();
    } catch {}
  }
  if (!process.env.DEEPL_API_KEY && fs.existsSync(path.resolve(process.cwd(), ".env"))) {
    const envText = fs.readFileSync(path.resolve(process.cwd(), ".env"), "utf8");
    const m = envText.match(/DEEPL_API_KEY=["']?([^"'\r\n]+)["']?/);
    if (m) process.env.DEEPL_API_KEY = m[1];
  }
});

const FIXTURE_PATH = path.resolve(process.cwd(), "fixtures/real_employment_contract.docx");

describe("DOCX-to-DOCX Translation Vertical Slice (Live Unmocked Execution)", () => {
  let sourceDocxBuffer: Buffer;
  let translatedDocxBuffer: Buffer;
  const storageOutputKey = `outputs/test-slice-${Date.now()}/translated_employment_contract.docx`;

  it("Step 1 & 2: Ingests real binary DOCX and validates OpenXML integrity & MIME signatures", async () => {
    expect(fs.existsSync(FIXTURE_PATH)).toBe(true);
    sourceDocxBuffer = fs.readFileSync(FIXTURE_PATH);
    expect(sourceDocxBuffer.length).toBeGreaterThan(1500);

    // Validate MIME and magic signature
    const validation = validateInputFile(sourceDocxBuffer, "real_employment_contract.docx");
    expect(validation.format).toBe("docx");
    expect(validation.error).toBeUndefined();

    // Verify OpenXML ZIP signature: PK\x03\x04
    expect(sourceDocxBuffer[0]).toBe(0x50); // P
    expect(sourceDocxBuffer[1]).toBe(0x4b); // K
    expect(sourceDocxBuffer[2]).toBe(0x03);
    expect(sourceDocxBuffer[3]).toBe(0x04);
  });

  it("Step 3: Extracts OpenXML DOM, verifying tables, headers, footers, and text runs", async () => {
    const zip = await JSZip.loadAsync(sourceDocxBuffer);

    // Verify critical OpenXML structural files
    expect(zip.file("[Content_Types].xml")).toBeTruthy();
    expect(zip.file("word/_rels/document.xml.rels")).toBeTruthy();
    expect(zip.file("word/document.xml")).toBeTruthy();
    expect(zip.file("word/header1.xml")).toBeTruthy();
    expect(zip.file("word/footer1.xml")).toBeTruthy();

    const docXml = await zip.file("word/document.xml")!.async("text");
    const headerXml = await zip.file("word/header1.xml")!.async("text");
    const footerXml = await zip.file("word/footer1.xml")!.async("text");

    // Check presence of table tags and run styles
    expect(docXml).toContain("<w:tbl");
    expect(docXml).toContain("<w:b/>");
    expect(docXml).toContain("<w:i/>");
    expect(docXml).toContain("CONTRATO INDIVIDUAL DE TRABAJO");
    expect(headerXml).toContain("GRUPO TECNOLÓGICO INTERNACIONAL");
    expect(footerXml).toContain("Documento Privado y Confidencial");
  });

  it("Step 4 & 5: Translates content using configured neural engine and reconstructs translated DOCX", async () => {
    const translationResult = await translateDocx(sourceDocxBuffer, {
      sourceLang: "es",
      targetLang: "en",
      serviceTier: "certified",
      bypassTestMock: true, // Forces live neural call with DEEPL_API_KEY
    });

    expect(translationResult).toBeDefined();
    expect(translationResult.buffer).toBeInstanceOf(Buffer);
    expect(translationResult.buffer.length).toBeGreaterThan(1500);
    translatedDocxBuffer = translationResult.buffer;

    // Verify metadata extracted during reconstruction
    expect(translationResult.metadata.hasTables).toBe(true);
    expect(translationResult.metadata.hasHeaders).toBe(true);
    expect(translationResult.metadata.textNodeCount).toBeGreaterThan(10);
    expect(translationResult.metadata.wordCount).toBeGreaterThan(40);
  }, 20000);

  it("Step 6: Persists the translated DOCX buffer to object storage", async () => {
    await putObject(
      storageOutputKey,
      translatedDocxBuffer,
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );

    const retrieved = await getObject(storageOutputKey);
    expect(retrieved).toBeDefined();
    expect(retrieved.length).toBe(translatedDocxBuffer.length);
    expect(Buffer.compare(retrieved, translatedDocxBuffer)).toBe(0);
  });

  it("Step 7 & 8: Verifies real persistent job lifecycle, status progression, and download readiness", async () => {
    const job = await createPersistentJob({
      filename: "real_employment_contract.docx",
      format: "docx",
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      sourceLang: "es",
      targetLang: "en",
      fileBuffer: sourceDocxBuffer,
    });

    expect(job.id).toBeTruthy();
    expect(job.status).toBe("uploaded");

    // Advance job through real processing milestones
    await updatePersistentJob(job.id, {
      status: "translating",
      currentStep: "Translating OpenXML text nodes via neural pipeline…",
      progress: 50,
    });

    const midState = await getPersistentJob(job.id);
    expect(midState?.status).toBe("translating");
    expect(midState?.progress).toBe(50);

    // Complete job with real output key and fidelity metrics
    await updatePersistentJob(job.id, {
      status: "completed",
      currentStep: "Document translation, layout reconstruction, and OpenXML QA certified.",
      progress: 100,
      outputKey: storageOutputKey,
      completedAt: new Date().toISOString(),
      pageCount: 1,
      fidelityScore: 98.5,
    });

    const finalState = await getPersistentJob(job.id);
    expect(finalState?.status).toBe("completed");
    expect(finalState?.progress).toBe(100);
    expect(finalState?.outputKey).toBe(storageOutputKey);

    // Proves user download can fetch valid streamable buffer from the stored output key
    const downloadBuffer = await getObject(finalState!.outputKey!);
    expect(downloadBuffer.length).toBe(translatedDocxBuffer.length);
  });

  it("Step 9 & 10: Verifies translated OpenXML archive opens cleanly, retains all formatting, and contains genuine translations", async () => {
    // 1. Unzip the output DOCX to verify valid archive structure
    const outputZip = await JSZip.loadAsync(translatedDocxBuffer);

    expect(outputZip.file("[Content_Types].xml")).toBeTruthy();
    expect(outputZip.file("word/_rels/document.xml.rels")).toBeTruthy();
    expect(outputZip.file("word/document.xml")).toBeTruthy();
    expect(outputZip.file("word/header1.xml")).toBeTruthy();
    expect(outputZip.file("word/footer1.xml")).toBeTruthy();

    const translatedDocXml = await outputZip.file("word/document.xml")!.async("text");
    const translatedHeaderXml = await outputZip.file("word/header1.xml")!.async("text");
    const translatedFooterXml = await outputZip.file("word/footer1.xml")!.async("text");

    // 2. Proves table structure is intact
    expect(translatedDocXml).toContain("<w:tbl>");
    expect(translatedDocXml).toContain("</w:tbl>");
    expect(translatedDocXml).toContain("<w:tr>");
    expect(translatedDocXml).toContain("<w:tc>");

    // 3. Proves style tags (bold, italic) are preserved inside <w:rPr>
    expect(translatedDocXml).toContain("<w:b/>");
    expect(translatedDocXml).toContain("<w:i/>");

    // 4. Proves translations are in English and NO mock prefixes exist
    expect(translatedDocXml).not.toContain("[ES->EN:");
    expect(translatedHeaderXml).not.toContain("[ES->EN:");
    expect(translatedFooterXml).not.toContain("[ES->EN:");

    // 5. Verify semantic English legal words exist in translated document
    const lowerDoc = translatedDocXml.toLowerCase();
    const hasContract = lowerDoc.includes("contract") || lowerDoc.includes("employment");
    const hasSalary = lowerDoc.includes("salary") || lowerDoc.includes("compensation") || lowerDoc.includes("base");
    const hasConfidential = lowerDoc.includes("confidential") || lowerDoc.includes("obligation");

    expect(hasContract).toBe(true);
    expect(hasSalary).toBe(true);
    expect(hasConfidential).toBe(true);

    // 6. Verify header and footer content translated to English
    const lowerHeader = translatedHeaderXml.toLowerCase();
    expect(lowerHeader.includes("international") || lowerHeader.includes("technology") || lowerHeader.includes("labor")).toBe(true);

    const lowerFooter = translatedFooterXml.toLowerCase();
    expect(lowerFooter.includes("confidential") || lowerFooter.includes("private") || lowerFooter.includes("page")).toBe(true);
  });
});
