import { inngest, type DocumentTranslatePayload } from "./client";
import { createAdminClient } from "@/supabase/admin";

/**
 * processTranslationJob
 *
 * Distributed background worker orchestrating document translation lifecycle.
 * In this initial queue orchestration stage:
 * 1. Takes jobId from event.data
 * 2. Updates job status to "processing" in Supabase
 * 3. Waits 2 seconds via durable step.sleep
 * 4. Updates job status to "completed" in Supabase
 */
export const processTranslationJob = inngest.createFunction(
  {
    id: "process-translation-job",
    name: "Process Translation Job",
    triggers: [{ event: "document.translate" }],
  },
  async ({ event, step }) => {
    const { jobId } = event.data as DocumentTranslatePayload;

    // Step 1: Update status in Supabase to "processing"
    await step.run("update-status-to-processing", async () => {
      const supabase = createAdminClient();
      const { error } = await supabase
        .from("translation_jobs")
        .update({
          status: "processing",
          current_phase: "processing",
          updated_at: new Date().toISOString(),
        })
        .eq("id", jobId);

      if (error) {
        throw new Error(`Failed to update job status to processing: ${error.message}`);
      }

      return { status: "processing" };
    });

    // Step 2: Wait 2 seconds (using step.sleep)
    await step.sleep("wait-two-seconds", "2s");

    // Step 3: Update status in Supabase to "completed"
    await step.run("update-status-to-completed", async () => {
      const supabase = createAdminClient();
      const { error } = await supabase
        .from("translation_jobs")
        .update({
          status: "completed",
          current_phase: "completed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", jobId);

      if (error) {
        throw new Error(`Failed to update job status to completed: ${error.message}`);
      }

      return { status: "completed" };
    });

    return {
      jobId,
      status: "completed",
    };
  }
);
