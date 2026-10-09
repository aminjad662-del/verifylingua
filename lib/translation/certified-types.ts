import { z } from "zod";

export const TranslationRequestedPayloadSchema = z.object({
  orderId: z.string().min(1),
  userId: z.string().min(1),
  sourcePath: z.string().min(1),
  sourceLang: z.string().min(1),
  targetLang: z.string().min(1),
  docType: z.string().min(1),
});

export type TranslationRequestedPayload = z.infer<typeof TranslationRequestedPayloadSchema>;

export const TranslationApprovedPayloadSchema = z.object({
  orderId: z.string().min(1),
  reviewerId: z.string().min(1),
});

export type TranslationApprovedPayload = z.infer<typeof TranslationApprovedPayloadSchema>;
