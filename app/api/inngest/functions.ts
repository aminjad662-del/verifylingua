import { inngest } from "./client";
import { runAgent2 } from "../../../services/translator";

export const translateDocumentJob = inngest.createFunction(
  {
    id: "run-strict-translator",
    retries: 3,
    triggers: [{ event: "document.translate" }],
  },
  async ({ event, step }: any) => {
    const extractedBlocks = event?.data?.extractedBlocks;

    const translatedData = await step.run("execute-translation-agent", async () => {
      return await runAgent2(extractedBlocks);
    });

    return { success: true, data: translatedData };
  }
);