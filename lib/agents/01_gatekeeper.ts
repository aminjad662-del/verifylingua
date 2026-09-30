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

      // 3. Real Page Count & Encryption Verification for PDFs
      let pageCount = 1;
      let isEncrypted = false;

      if (isPdf) {
        // Scan for /Encrypt dictionary
        const headerSample = buffer.subarray(0, Math.min(buffer.length, 8192)).toString("latin1");
        if (headerSample.includes("/Encrypt")) {
          isEncrypted = true;
          throw new Error("Password-protected or encrypted PDFs are not supported. Please provide an unencrypted document.");
        }

        try {
          const { PDFDocument } = await import("pdf-lib");
          const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: false });
          pageCount = pdfDoc.getPageCount();

          if (pageCount > 100) {
            throw new Error(`Document exceeds maximum limit of 100 pages (found ${pageCount} pages). Please submit in smaller batches.`);
          }
        } catch (pdfErr: any) {
          if (pdfErr.message?.includes("encrypted") || pdfErr.message?.includes("password") || isEncrypted) {
            throw new Error("Password-protected or encrypted PDFs are not supported. Please provide an unencrypted document.");
          }
          // If corrupted or malformed PDF structure
          throw new Error(`Malformed or corrupted PDF file: ${pdfErr.message}`);
        }
      }

      // 4. Zip-bomb / Decompression bomb protection for DOCX
      if (isDocx) {
        try {
          const JSZip = (await import("jszip")).default;
          const zip = await JSZip.loadAsync(buffer);
          let totalUncompressedSize = 0;
          const MAX_UNCOMPRESSED_SIZE = 250 * 1024 * 1024; // 250MB cap

          for (const filename of Object.keys(zip.files)) {
            const fileEntry = zip.files[filename];
            // @ts-ignore
            const uncompressedSize = (fileEntry as any)._data?.uncompressedSize || 0;
            totalUncompressedSize += uncompressedSize;
            if (totalUncompressedSize > MAX_UNCOMPRESSED_SIZE) {
              throw new Error("Suspicious document structure. Potential decompression bomb detected.");
            }
          }
        } catch (zipErr: any) {
          if (zipErr.message?.includes("decompression bomb")) {
            throw zipErr;
          }
          throw new Error("Corrupted or invalid DOCX archive structure.");
        }
      }

      return {
        success: true,
        data: {
          sanitizedBuffer: buffer,
          metadata: {
            pageCount,
            byteSize: buffer.length,
            isEncrypted: false,
            format: detectedFormat,
          },
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Gatekeeper validation failed",
      };
    }
  }
}
