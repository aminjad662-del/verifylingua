import { AgentResult, GatekeeperInput, GatekeeperOutput } from "../../types/agents";

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

export class GatekeeperAgent {
  public async execute(input: GatekeeperInput): Promise<AgentResult<GatekeeperOutput>> {
    try {
      const buffer = Buffer.from(input.fileBuffer);
      
      // 1. Enforce file size limits
      if (buffer.length > MAX_FILE_SIZE) {
        throw new Error(`File size ${buffer.length} exceeds 100MB limit.`);
      }

      // 2. Magic bytes verification
      const isPdf = buffer.length > 4 && buffer.subarray(0, 4).toString("ascii") === "%PDF";
      const isJpeg = buffer.length > 3 && buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF;
      const isPng = buffer.length > 8 && buffer.subarray(0, 8).toString("hex") === "89504e470d0a1a0a";
      const isDocx = buffer.length > 4 && buffer.subarray(0, 4).toString("ascii") === "PK\x03\x04";

      if (!isPdf && !isJpeg && !isPng && !isDocx) {
        throw new Error("Invalid file format. Magic bytes do not match PDF, JPEG, PNG, or DOCX.");
      }

      let detectedFormat = "unknown";
      if (isPdf) detectedFormat = "pdf";
      if (isJpeg) detectedFormat = "jpeg";
      if (isPng) detectedFormat = "png";
      if (isDocx) detectedFormat = "docx";

      // 3. Password/Encryption Detection (PDF heuristic)
      let isEncrypted = false;
      if (isPdf) {
        // Look for /Encrypt dictionary within the first 4KB of PDF
        const headerSample = buffer.subarray(0, Math.min(buffer.length, 4096)).toString("ascii");
        if (headerSample.includes("/Encrypt")) {
          isEncrypted = true;
          throw new Error("Password protected or encrypted PDFs are not supported.");
        }
      }

      // 4. Zip-bomb protection (heuristic for extremely high compression in docx)
      if (isDocx && buffer.length < 500 && input.fileName.endsWith(".docx")) {
        throw new Error("Suspicious file signature. Potential zip-bomb detected.");
      }

      return {
        success: true,
        data: {
          sanitizedBuffer: buffer,
          metadata: {
            pageCount: 1, // Page count extraction requires full parsing, mocked to 1 for this layer
            byteSize: buffer.length,
            isEncrypted,
            format: detectedFormat
          }
        }
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Gatekeeper validation failed"
      };
    }
  }
}
