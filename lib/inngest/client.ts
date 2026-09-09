import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "verifylingua-translation-saas",
  eventKey: process.env.INNGEST_EVENT_KEY,
});
