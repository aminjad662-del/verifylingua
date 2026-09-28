import crypto from "crypto";

export const CURRENT_PIPELINE_VERSION = "v2";

export interface CompositeKeyParams {
  buffer: Buffer;
  sourceLang: string;
  targetLang: string;
  pipelineVersion?: string;
  options?: Record<string, any>;
}

export interface CompositeKeyDetails {
  contentHash: string;
  sourceLang: string;
  targetLang: string;
  pipelineVersion: string;
  optionsHash: string;
  compositeKey: string;
  artifactStoragePath: string;
  blocksStoragePath: string;
  verificationStoragePath: string;
}

/**
 * Computes deterministic composite identity key:
 * sha256(contentHash + ":" + sourceLang + ":" + targetLang + ":" + pipelineVersion + ":" + optionsHash)
 */
export function generateCompositeKey(params: CompositeKeyParams): CompositeKeyDetails {
  const contentHash = crypto.createHash("sha256").update(params.buffer).digest("hex");
  const sourceLang = (params.sourceLang || "en").toLowerCase().trim();
  const targetLang = (params.targetLang || "es").toLowerCase().trim();
  const pipelineVersion = params.pipelineVersion || CURRENT_PIPELINE_VERSION;

  // Canonical normalized options hash
  const canonicalOptions = {
    serviceTier: params.options?.serviceTier || "automated",
    register: params.options?.register || "certified_legal",
    layoutPreserved: params.options?.layoutPreserved ?? true,
  };
  const optionsHash = crypto
    .createHash("sha256")
    .update(JSON.stringify(canonicalOptions, Object.keys(canonicalOptions).sort()))
    .digest("hex")
    .slice(0, 16);

  const keyRaw = `${contentHash}:${sourceLang}:${targetLang}:${pipelineVersion}:${optionsHash}`;
  const compositeKey = crypto.createHash("sha256").update(keyRaw).digest("hex");

  const ext = params.options?.format || "pdf";
  const artifactStoragePath = `artifacts/${contentHash}/${sourceLang}_${targetLang}_${pipelineVersion}/output.${ext}`;
  const blocksStoragePath = `artifacts/${contentHash}/${sourceLang}_${targetLang}_${pipelineVersion}/blocks.json`;
  const verificationStoragePath = `artifacts/${contentHash}/${sourceLang}_${targetLang}_${pipelineVersion}/verification.json`;

  return {
    contentHash,
    sourceLang,
    targetLang,
    pipelineVersion,
    optionsHash,
    compositeKey,
    artifactStoragePath,
    blocksStoragePath,
    verificationStoragePath,
  };
}
