import fs from "fs";
import path from "path";

/**
 * Returns a clean environment variable value, stripped of surrounding quotes.
 * If not present in process.env, attempts to read directly from .env file.
 */
export function getCleanEnv(key: string): string {
  let val = process.env[key];

  if (!val) {
    try {
      const envPath = path.resolve(process.cwd(), ".env");
      if (fs.existsSync(envPath)) {
        const text = fs.readFileSync(envPath, "utf8");
        const match = text.match(new RegExp(`^${key}=\\s*(.*)$`, "m"));
        if (match) {
          val = match[1].trim();
        }
      }
    } catch {}
  }

  if (val) {
    val = val.trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1).trim();
    }
  }

  // Ensure process.env is synced with the clean value
  if (val && !process.env[key]) {
    process.env[key] = val;
  }

  return val || "";
}

export function getGeminiApiKey(): string {
  return getCleanEnv("GEMINI_API_KEY");
}

export function getDeepLApiKey(): string {
  return getCleanEnv("DEEPL_API_KEY");
}
