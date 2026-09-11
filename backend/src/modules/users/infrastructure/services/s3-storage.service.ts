import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from 'uuid';
import { IStorageService } from "../../application/interfaces/storage-service.interface";

@Injectable()
export class s3StorageService implements IStorageService{
    private readonly _s3Client: S3Client;
    private readonly _bucketName: string;
    private readonly _region: string;

    constructor() {

        const region = process.env.AWS_REGION;
        const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
        const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
        const bucketName = process.env.AWS_S3_BUCKET_NAME;

        if (!region || !accessKeyId || !secretAccessKey || !bucketName) {
            throw new Error('Missing required AWS S3 configuration in environment variables.');
        }

        this._region = region;
        this._bucketName = bucketName;

        this._s3Client = new S3Client({
            region: this._region,
            credentials: {
                accessKeyId,
                secretAccessKey,
            },
            maxAttempts: 2,
        })

    }

    async uploadSelfie(userId: string, fileBUffer: Buffer, mimeType = 'image/jpeg'): Promise<string>{
        const uniqueFilename = `selfies/${userId}-${uuidv4()}.jpg`;

        try {
            // Uploads the buffer directly to your ASW S3 bucket
            await this._s3Client.send(new PutObjectCommand({
                Bucket: this._bucketName,
                Key: uniqueFilename,
                Body: fileBUffer,
                ContentType: mimeType,
            }));

            return `https://${this._bucketName}.s3.${this._region}.amazonaws.com/${uniqueFilename}`;
        } catch (error) {
            console.error('S3 Upload Error: ', error);
            throw new InternalServerErrorException('Failed to securely store identity baseline.');
        }
    }

    async uploadVideo(userId: string, fileBuffer: Buffer, mimeType = 'video/webm'): Promise<string>{
        const extension = mimeType.includes('mp4') ? 'mp4' : 'webm';
        const uniqueFilename = `liveness-video/${userId}-${uuidv4()}.${extension}`;

        try {
            await this._s3Client.send(new PutObjectCommand({
                Bucket: this._bucketName,
                Key: uniqueFilename,
                Body: fileBuffer,
                ContentType: mimeType
            }));

            return `https://${this._bucketName}.s3.${this._region}.amazonaws.com/${uniqueFilename}`;
        } catch (error) {
            console.error('S3 Video Upload Error: ', error);
            throw new InternalServerErrorException("Failed to securely store liveness video audit.");
        }
    }
}