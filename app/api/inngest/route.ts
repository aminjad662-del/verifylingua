import { serve } from "inngest/next";
import { inngest } from "@/src/inngest/client";
import { processTranslationJob } from "@/src/inngest/functions";

/**
 * Inngest Next.js App Router API Route handler.
 * Serves the Inngest API endpoint exposing the Inngest client and registered functions.
 */
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    processTranslationJob,
  ],
});