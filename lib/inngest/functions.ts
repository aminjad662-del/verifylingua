import { inngest } from "./client";
import { executeBackgroundTranslationJob } from "../queue/worker";

export const processDocumentWorkflow = inngest.createFunction(
  {
    id: "process-document-workflow",
    retries: 2,
    triggers: [{ event: "document.processing.requested" }],
  },
  async ({ event, step }) => {
    const { jobId } = (event.data as { jobId: string });

    await step.run("execute-orchestrator-pipeline", async () => {
      await executeBackgroundTranslationJob(jobId);
    });

    return { jobId, status: "completed" };
  }
);

/**
 * Direct execution runner that executes the autonomous pipeline asynchronously
 * for zero-timeout responsiveness without blocking normal web requests.
 */
export async function executeAutonomousDocumentPipeline(jobId: string): Promise<void> {
  setImmediate(async () => {
    try {
      await executeBackgroundTranslationJob(jobId);
    } catch (err: any) {
      if (process.env.NODE_ENV !== "test" && !process.env.VITEST) {
        console.error(`[AutonomousPipeline] Job ${jobId} failed:`, err);
      }
    }
  });
}
