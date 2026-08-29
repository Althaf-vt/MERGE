import { Injectable } from "@nestjs/common";
import { IStorageService } from "../../domain/interfaces/kyc-service.interface";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

@Injectable()
export class AwsStorageService implements IStorageService{
    private s3Client: S3Client;
    private bucketName = process.env.AWS_S3_KYC_BUCKET;

    constructor(){
        this.s3Client = new S3Client({
            region: process.env.AWS_REGION,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
            }
        })
    }

    async generatePresignedUploadUrl(
        userId: string, 
        side: "front" | "back", 
        mimeType: string
    ): Promise<{ uploadUrl: string; fileKey: string; }> {
       
        // Generates a standart v4 UUID using Node's internal crypto engine
        const fileKey = `kyc/${userId}/${randomUUID()}-${side}`;

        const command = new PutObjectCommand({
            Bucket: this.bucketName,
            Key: fileKey,
            ContentType: mimeType
        });

        // URL expires in 5 minutes
        const uploadUrl = await getSignedUrl(this.s3Client, command, {expiresIn: 300})

        return {uploadUrl, fileKey}
    }

}