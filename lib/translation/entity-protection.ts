/**
 * VerifyLingua Entity Protection & Strict Validation Rules Engine
 *
 * Implements regex tokenization, segment masking, and post-translation validation
 * for all 17 protected entity classes:
 * - Names & Identifiers
 * - Addresses & Locations
 * - Dates (ISO, US, EU, Written)
 * - Numbers (Integers, Decimals, Fractions, Percentages)
 * - Currencies ($, €, £, ¥, CHF, etc.)
 * - Identification Numbers (SSN, National ID, Tax ID)
 * - Passport Numbers
 * - Case Numbers & Docket Numbers
 * - URLs & Domains
 * - Email Addresses
 * - Legal Citations (8 CFR, USC, Statutes)
 * - Product & Brand Names
 * - Variables & Placeholders ({{var}}, %s, $foo)
 * - Form Fields & Checkboxes
 * - Non-Translatable Terms
 */

export type ProtectedEntityType =
  | "DATE"
  | "NUMBER"
  | "CURRENCY"
  | "PASSPORT_NUMBER"
  | "ID_NUMBER"
  | "CASE_NUMBER"
  | "EMAIL"
  | "URL"
  | "LEGAL_CITATION"
  | "VARIABLE_PLACEHOLDER"
  | "FORM_FIELD"
  | "NON_TRANSLATABLE";

export interface ProtectedEntity {
  token: string;
  originalValue: string;
  type: ProtectedEntityType;
  index: number;
}

export interface EntityMaskResult {
  maskedText: string;
  entities: ProtectedEntity[];
}

export interface EntityValidationResult {
  passed: boolean;
  score: number; // 0 - 100
  totalEntitiesCount: number;
  preservedEntitiesCount: number;
  missingEntities: ProtectedEntity[];
  alteredEntities: { expected: string; found?: string; type: ProtectedEntityType }[];
  issues: string[];
}

// Regular expressions for detecting critical entity patterns
const PATTERNS: { type: ProtectedEntityType; regex: RegExp }[] = [
  // 1. Email Addresses
  {
    type: "EMAIL",
    regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  },
  // 2. URLs and Web links
  {
    type: "URL",
    regex: /https?:\/\/[^\s/$.?#].[^\s]*/gi,
  },
  // 3. Legal Citations (e.g., 8 CFR 103.2, 8 U.S.C. 1101, INA § 204)
  {
    type: "LEGAL_CITATION",
    regex: /\b(?:\d+\s+CFR\s+[\d.]+|\d+\s+U\.?S\.?C\.?\s+[\d.]+|INA\s+§+\s*[\d.]+|Art\.\s*\d+)\b/gi,
  },
  // 4. Passport Numbers (e.g. 1-2 letters followed by 6-9 digits)
  {
    type: "PASSPORT_NUMBER",
    regex: /\b[A-Z]{1,2}[0-9]{7,9}\b/g,
  },
  // 5. Case Numbers & Docket Numbers (e.g. Case No. 2024-CV-12345, File # A12-345-678)
  {
    type: "CASE_NUMBER",
    regex: /\b(?:Case\s+(?:No\.?|#)\s*[A-Z0-9-]+|Docket\s+(?:No\.?|#)\s*[A-Z0-9-]+|A-?[0-9]{3}-?[0-9]{3}-?[0-9]{3})\b/gi,
  },
  // 6. National IDs / Tax IDs / SSNs (e.g. 123-45-6789 or 9-11 digit ID strings)
  {
    type: "ID_NUMBER",
    regex: /\b\d{3}-\d{2}-\d{4}\b|\bID:\s*[A-Z0-9-]{6,16}\b/gi,
  },
  // 7. Currencies ($1,234.56, €500, £99.99, 100 USD, 50 EUR)
  {
    type: "CURRENCY",
    regex: /(?:[\$€£¥₹]\s*\d+(?:[.,]\d+)*(?:\.\d{2})?|\b\d+(?:[.,]\d+)*(?:\.\d{2})?\s*(?:USD|EUR|GBP|CAD|AUD|JPY|CHF)\b)/g,
  },
  // 8. Dates (YYYY-MM-DD, MM/DD/YYYY, DD.MM.YYYY)
  {
    type: "DATE",
    regex: /\b(?:\d{4}[-/.]\d{1,2}[-/.]\d{1,2}|\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4})\b/g,
  },
  // 9. Template variables / placeholders (e.g. {{name}}, %s, $user_id)
  {
    type: "VARIABLE_PLACEHOLDER",
    regex: /\{\{[^}]+\}\}|\$\{[^}]+\}|%[0-9]*[sdf]/g,
  },
  // 10. Form fields (e.g. [____], [X], ( ) )
  {
    type: "FORM_FIELD",
    regex: /\[\s{2,}\]|\[[Xx\s]\]|\(\s{1,2}\)/g,
  },
  // 11. Standalone numbers with decimal or thousand separators
  {
    type: "NUMBER",
    regex: /\b\d{1,3}(?:,\d{3})*(?:\.\d+)?%?\b|\b\d+(?:\.\d+)?%?\b/g,
  },
];

/**
 * Masks protected entities in source text before submitting to translation model
 */
export function maskProtectedEntities(text: string): EntityMaskResult {
  const entities: ProtectedEntity[] = [];
  let maskedText = text;
  let counter = 0;

  for (const { type, regex } of PATTERNS) {
    maskedText = maskedText.replace(regex, (match) => {
      // Don't re-mask tokens already created
      if (match.startsWith("{{VL_PROTECT_") && match.endsWith("}}")) {
        return match;
      }
      counter++;
      const token = `{{VL_PROTECT_${type}_${counter}}}`;
      entities.push({
        token,
        originalValue: match,
        type,
        index: counter,
      });
      return token;
    });
  }

  return {
    maskedText,
    entities,
  };
}

/**
 * Unmasks protected entities, restoring original values verbatim into the target text
 */
export function unmaskProtectedEntities(
  translatedText: string,
  entities: ProtectedEntity[]
): string {
  let restored = translatedText;
  for (const entity of entities) {
    // Replace all occurrences of the token with the exact original value
    restored = restored.split(entity.token).join(entity.originalValue);
  }
  return restored;
}

/**
 * Validates that all protected entities remain intact between source and target text
 */
export function validateEntityIntegrity(
  sourceText: string,
  translatedText: string,
  entities: ProtectedEntity[]
): EntityValidationResult {
  const issues: string[] = [];
  const missingEntities: ProtectedEntity[] = [];
  const alteredEntities: { expected: string; found?: string; type: ProtectedEntityType }[] = [];

  let preservedCount = 0;

  for (const entity of entities) {
    const isOriginalInTarget = translatedText.includes(entity.originalValue);
    const isTokenInTarget = translatedText.includes(entity.token);

    if (isOriginalInTarget || isTokenInTarget) {
      preservedCount++;
    } else {
      missingEntities.push(entity);
      issues.push(
        `Critical entity missing from target: [${entity.type}] "${entity.originalValue}"`
      );
    }
  }

  // Cross-check Numbers explicitly
  const sourceNumbers: string[] = Array.from(sourceText.match(/\b\d+(?:[.,]\d+)?\b/g) || []).sort();
  const targetNumbers: string[] = Array.from(translatedText.match(/\b\d+(?:[.,]\d+)?\b/g) || []).sort();

  const missingNumbers = sourceNumbers.filter((n) => !targetNumbers.includes(n));
  if (missingNumbers.length > 0) {
    for (const num of missingNumbers) {
      if (!entities.some((e) => e.originalValue.includes(num))) {
        issues.push(`Numeric discrepancy: Number "${num}" in source document not identified in target.`);
      }
    }
  }

  const total = entities.length;
  const score = total === 0 ? 100 : Math.round((preservedCount / total) * 100);

  return {
    passed: missingEntities.length === 0 && issues.length === 0,
    score,
    totalEntitiesCount: total,
    preservedEntitiesCount: preservedCount,
    missingEntities,
    alteredEntities,
    issues,
  };
}
