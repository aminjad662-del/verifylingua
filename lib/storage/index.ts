import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";

// Resilient memory storage fallback when R2/S3 credentials are not configured or in test environments
const memoryStorage = new Map<
  string,
  { buffer: Buffer; contentType: string; createdAt: Date }
>();

declare global {
  // eslint-disable-next-line no-var
  var __memoryStorage: Map<string, { buffer: Buffer; contentType: string; createdAt: Date }> | undefined;
}

const globalStorage = globalThis.__memoryStorage ?? memoryStorage;
globalThis.__memoryStorage = globalStorage;

function getS3Client(): { client: S3Client; bucket: string } | null {
  if (process.env.VITEST) {
    return null;
  }

  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET_NAME || process.env.S3_BUCKET_NAME || "verifylingua-documents";

  if (
    !accessKeyId ||
    !secretAccessKey ||
    accessKeyId.startsWith("your-") ||
    secretAccessKey.startsWith("your-")
  ) {
    return null;
  }

  const endpoint = accountId
    ? `https://${accountId}.r2.cloudflarestorage.com`
    : process.env.S3_ENDPOINT;

  const client = new S3Client({
    region: process.env.AWS_REGION || "auto",
    endpoint,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    forcePathStyle: true,
  });

  return { client, bucket };
}

/**
 * Generates a signed upload URL (PUT) for direct browser-to-R2 upload
 */
export async function generatePresignedUploadUrl(
  key: string,
  contentType: string,
  expiresInSeconds = 3600
): Promise<string> {
  const s3 = getS3Client();

  if (s3) {
    const command = new PutObjectCommand({
      Bucket: s3.bucket,
      Key: key,
      ContentType: contentType,
    });
    return await getSignedUrl(s3.client, command, { expiresIn: expiresInSeconds });
  }

  // Local/dev fallback signed mock URL
  const token = crypto.randomBytes(16).toString("hex");
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${baseUrl}/api/storage/mock-upload?key=${encodeURIComponent(key)}&token=${token}`;
}

/**
 * Generates a signed download URL (GET) for secure file delivery
 */
export async function generatePresignedDownloadUrl(
  key: string,
  downloadFilename?: string,
  expiresInSeconds = 3600
): Promise<string> {
  const s3 = getS3Client();

  if (s3) {
    const command = new GetObjectCommand({
      Bucket: s3.bucket,
      Key: key,
      ResponseContentDisposition: downloadFilename
        ? `attachment; filename="${downloadFilename}"`
        : "attachment",
    });
    return await getSignedUrl(s3.client, command, { expiresIn: expiresInSeconds });
  }

  // Local/dev fallback download URL
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${baseUrl}/api/storage/mock-download?key=${encodeURIComponent(key)}`;
}

/**
 * Stores a binary buffer directly into storage
 */
export async function putObject(
  key: string,
  buffer: Buffer,
  contentType: string
): Promise<void> {
  const s3 = getS3Client();

  if (s3) {
    try {
      const command = new PutObjectCommand({
        Bucket: s3.bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      });
      await s3.client.send(command);
    } catch (err) {
      console.warn("Notice: S3 write error, saving to memory fallback:", err);
    }
  }

  // Always retain in fallback cache
  globalStorage.set(key, {
    buffer,
    contentType,
    createdAt: new Date(),
  });
}

/**
 * Retrieves a binary buffer from storage
 */
export async function getObject(key: string): Promise<Buffer> {
  // Check memory storage first
  const memoryObj = globalStorage.get(key);
  if (memoryObj) {
    return memoryObj.buffer;
  }

  const s3 = getS3Client();
  if (s3) {
    try {
      const command = new GetObjectCommand({
        Bucket: s3.bucket,
        Key: key,
      });
      const res = await s3.client.send(command);
      if (res.Body) {
        const bytes = await res.Body.transformToByteArray();
        const buf = Buffer.from(bytes);
        globalStorage.set(key, {
          buffer: buf,
          contentType: res.ContentType || "application/octet-stream",
          createdAt: new Date(),
        });
        return buf;
      }
    } catch {
      // ignore
    }
  }

  throw new Error(`Object not found in storage: ${key}`);
}

/**
 * Checks metadata of an object in storage
 */
export async function headObject(
  key: string
): Promise<{ size: number; contentType: string } | null> {
  const memoryObj = globalStorage.get(key);
  if (memoryObj) {
    return {
      size: memoryObj.buffer.length,
      contentType: memoryObj.contentType,
    };
  }

  const s3 = getS3Client();
  if (s3) {
    try {
      const command = new HeadObjectCommand({
        Bucket: s3.bucket,
        Key: key,
      });
      const res = await s3.client.send(command);
      return {
        size: res.ContentLength || 0,
        contentType: res.ContentType || "application/octet-stream",
      };
    } catch {
      return null;
    }
  }

  return null;
}

/**
 * Deletes an object from storage
 */
export async function deleteObject(key: string): Promise<void> {
  globalStorage.delete(key);

  const s3 = getS3Client();
  if (s3) {
    try {
      const command = new DeleteObjectCommand({
        Bucket: s3.bucket,
        Key: key,
      });
      await s3.client.send(command);
    } catch (err) {
      console.warn("Notice: S3 deleteObject error:", err);
    }
  }
}
