import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME;

export async function getUploadSignedUrl(
  key: string,
  contentType: string,
  expiresIn: number = 3600,
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });

  return await getSignedUrl(s3Client, command, { expiresIn });
}

export async function getViewSignedUrl(
  key: string,
  expiresIn: number = 3600,
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  return await getSignedUrl(s3Client, command, { expiresIn });
}

export function generateScreenshotKey(
  userId: string,
  gameId: string,
  filename: string,
): string {
  const timestamp = Date.now();
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `screenshots/${userId}/${gameId}/${timestamp}_${sanitizedFilename}`;
}

export function getPublicUrl(key: string): string {
  return `${process.env.S3_ENDPOINT}/${key}`;
}

export function extractKeyFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);

    return urlObj.pathname.substring(1);
  } catch {
    return null;
  }
}
