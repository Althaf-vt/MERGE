import { Inject, Injectable } from "@nestjs/common";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import { IStorageService } from "../../application/interfaces/storage-service.interface";
import { DomainException } from "../../domain/exceptions/domain.exception";
import { ErrorCode } from "../../domain/enums/error-code.enum";

export const S3_CLIENT = 'S3_CLIENT';

@Injectable()
export class S3StorageService implements IStorageService {
  private readonly _bucketName: string;
  private readonly _region: string;

  constructor(
    @Inject(S3_CLIENT)
    private readonly _s3Client: S3Client
  ) {
    const region = process.env.AWS_REGION;
    const bucketName = process.env.AWS_S3_BUCKET_NAME;

    if (!region || !bucketName) {
      throw new DomainException(ErrorCode.INTERNAL_SERVER_ERROR, 'Missing required AWS S3 configuration in environment variables.');
    }

    this._region = region;
    this._bucketName = bucketName;
  }

  async uploadSelfie(userId: string, fileBuffer: Buffer, mimeType = 'image/jpeg'): Promise<string> {
    const uniqueFilename = `selfies/${userId}-${uuidv4()}.jpg`;

    await this._s3Client.send(new PutObjectCommand({
      Bucket: this._bucketName,
      Key: uniqueFilename,
      Body: fileBuffer,
      ContentType: mimeType,
    }));

    return `https://${this._bucketName}.s3.${this._region}.amazonaws.com/${uniqueFilename}`;
  }

  async uploadVideo(userId: string, fileBuffer: Buffer, mimeType = 'video/webm'): Promise<string> {
    const extension = mimeType.includes('mp4') ? 'mp4' : 'webm';
    const uniqueFilename = `liveness-video/${userId}-${uuidv4()}.${extension}`;

    await this._s3Client.send(new PutObjectCommand({
      Bucket: this._bucketName,
      Key: uniqueFilename,
      Body: fileBuffer,
      ContentType: mimeType,
    }));

    return `https://${this._bucketName}.s3.${this._region}.amazonaws.com/${uniqueFilename}`;
  }
}