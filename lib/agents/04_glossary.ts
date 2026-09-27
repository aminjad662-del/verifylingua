import { AgentResult, GlossaryInput, GlossaryOutput } from "../../types/agents";

export class GlossaryAgent {
  public async execute(input: GlossaryInput): Promise<AgentResult<GlossaryOutput>> {
    try {
      const protectedTokens: Record<string, string> = {};
      const definitions: Record<string, string> = {};

      const DATE_REGEX = /\b(?:\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4}|\d{4}[\/\-.]\d{1,2}[\/\-.]\d{1,2})\b/g;
      const PASSPORT_REGEX = /\b[A-Z0-9]{6,12}\b/g; 

      for (const block of input.blocks) {
        const text = block.originalText;
        
        // Brand Protection
        if (text.includes("VerifyLingua")) {
          protectedTokens["VerifyLingua"] = "VerifyLingua";
          definitions["VerifyLingua"] = "Brand name, do not translate";
        }

        // Date Protection
        const dates = text.match(DATE_REGEX);
        if (dates) {
          for (const d of dates) {
            protectedTokens[d] = d;
            definitions[d] = "Date entity, preserve exact numerical format";
          }
        }

        // Identifier Protection (Looks like passport or ID numbers)
        // Only apply if the string contains a mix of letters and numbers
        const ids = text.match(PASSPORT_REGEX);
        if (ids) {
          for (const id of ids) {
            if (/\d/.test(id) && /[A-Z]/.test(id)) {
              protectedTokens[id] = id;
              definitions[id] = "Alphanumeric identifier (Passport/ID), preserve exactly";
            }
          }
        }
      }

      return {
        success: true,
        data: {
          protectedTokens,
          definitions
        }
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Glossary mapping failed"
      };
    }
  }
}
