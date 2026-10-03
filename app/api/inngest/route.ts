import { serve } from "inngest/next";
import { inngest } from "./client";
import { translateDocumentJob } from "./functions";

// Hna kanch3lo l-API w kan-3tiwh l-Agent 2 bach y-khdem f l-kawaliss
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    translateDocumentJob, // Zidna l-mouhimma hna
  ],
});