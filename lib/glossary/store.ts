export interface MemoryGlossaryTerm {
  id: string;
  sourceText: string;
  requiredTarget: string;
  locked: boolean;
}

export interface MemoryGlossary {
  id: string;
  userId?: string | null;
  name: string;
  sourceLang: string;
  targetLang: string;
  terms: MemoryGlossaryTerm[];
  createdAt: string;
  updatedAt: string;
}

declare global {
  // eslint-disable-next-line no-var
  var __memoryGlossariesMap: Map<string, MemoryGlossary> | undefined;
}

export const memoryGlossaries: Map<string, MemoryGlossary> =
  globalThis.__memoryGlossariesMap ?? new Map<string, MemoryGlossary>();
globalThis.__memoryGlossariesMap = memoryGlossaries;
