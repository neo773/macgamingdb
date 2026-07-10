import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable } from '@nestjs/common';
import { R2_PUBLIC_URL } from '../constants/r2-public-url.constant';

type GetUploadSignedUrlParams = {
  key: string;
  contentType: string;
  expiresIn?: number;
};

type GetViewSignedUrlParams = {
  key: string;
  expiresIn?: number;
};

const DEFAULT_EXPIRES_IN_SECONDS = 3600;

@Injectable()
export class FileStorageService {
  private readonly s3Client = new S3Client({
    region: 'auto',
    endpoint: process.env.S3_ENDPOINT,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID!,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
    },
  });

  private readonly bucketName = process.env.S3_BUCKET_NAME;

  async getUploadSignedUrl({
    key,
    contentType,
    expiresIn = DEFAULT_EXPIRES_IN_SECONDS,
  }: GetUploadSignedUrlParams): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: contentType,
    });

    return getSignedUrl(this.s3Client, command, { expiresIn });
  }

  async getViewSignedUrl({
    key,
    expiresIn = DEFAULT_EXPIRES_IN_SECONDS,
  }: GetViewSignedUrlParams): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    return getSignedUrl(this.s3Client, command, { expiresIn });
  }

  getPublicUrl(key: string): string {
    return `${R2_PUBLIC_URL}/${key}`;
  }
}
