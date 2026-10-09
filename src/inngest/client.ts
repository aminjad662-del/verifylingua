import { Inngest, eventType } from "inngest";
import { z } from "zod";

/**
 * Strict schema definition for "document.translate" event payload.
 * Enforces requirement of jobId (string) and fileUrl (string).
 */
export const documentTranslatePayloadSchema = z.object({
  jobId: z.string().min(1, "jobId must be a non-empty string"),
  fileUrl: z.string().min(1, "fileUrl must be a non-empty string"),
  orderId: z.string().optional(),
});

export type DocumentTranslatePayload = z.infer<typeof documentTranslatePayloadSchema>;

export type DocumentTranslateEvent = {
  name: "document.translate";
  data: DocumentTranslatePayload;
};

export const documentTranslateEvent = eventType("document.translate", {
  schema: documentTranslatePayloadSchema,
});

export type InngestEvents = {
  "document.translate": DocumentTranslateEvent;
};

/**
 * Inngest Client configured for distributed asynchronous document translation workflows.
 */
export const inngest = new Inngest({
  id: "verifylingua-translation-saas",
  eventKey: process.env.INNGEST_EVENT_KEY,
  isDev: process.env.NODE_ENV !== "production" || !process.env.INNGEST_EVENT_KEY,
});
