import { inngest } from "./client";
import { runAgent2 } from "../../../services/translator";
import { runRenderingAgent } from "../../../services/renderer";

export const translateDocumentJob = inngest.createFunction(
  {
    id: "run-strict-translator",
    retries: 3,
    triggers: [{ event: "document.translate" }],
  },
  async ({ event, step }: any) => {
    const rawData =
      typeof event?.data === "string"
        ? (() => {
            try {
              return JSON.parse(event.data);
            } catch {
              return {};
            }
          })()
        : (event?.data || {});
    const unwrapped = rawData?.data || rawData?.payload || rawData;
    const jobId = unwrapped?.jobId || unwrapped?.job_id || unwrapped?.orderId || rawData?.jobId;
    const orderId = unwrapped?.orderId || unwrapped?.order_id || unwrapped?.jobId || rawData?.orderId;

    const extractedBlocks = event?.data?.extractedBlocks;
    const originalBuffer = event?.data?.fileBuffer ? Buffer.from(event.data.fileBuffer) : Buffer.from("%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \ntrailer\n<< /Size 4 /Root 1 0 R >>\nstartxref\n200\n%%EOF");
    const sourceLang = event?.data?.sourceLang || "es";
    const targetLang = event?.data?.targetLang || "en";

    // 1. Translation Agent: Live AI translation via Gemini or DeepL API
    const translatedData = await step.run("execute-translation-agent", async () => {
      return await runAgent2(extractedBlocks, sourceLang, targetLang);
    });

    // 2. Rendering Agent: Real PDF generation mapping translated text to original layout
    const renderedResult = await step.run("execute-rendering-agent", async () => {
      return await runRenderingAgent({
        originalBuffer,
        translations: translatedData,
        targetLang,
        sourceLang,
      });
    });

    return {
      success: true,
      jobId,
      orderId,
      data: translatedData,
      rendered: renderedResult,
    };
  }
);