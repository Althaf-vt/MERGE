import { BadRequestException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { IOcrResult, IOcrService } from "../../domain/interfaces/kyc-service.interface";
import { AnalyzeIDCommand, IdentityDocumentField, InternalServerError, TextractClient } from "@aws-sdk/client-textract";

@Injectable()
export class AwsOcrService implements IOcrService{
    private readonly textractClient: TextractClient;
    private readonly bucketName = process.env.AWS_S3_KYC_BUCKET;

    constructor(){
        this.textractClient = new TextractClient({
            region: process.env.AWS_REGION,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
            }
        })
    }

    async extractDocumentData(frontFileKey: string, backFileKey?: string): Promise<IOcrResult> {
        try {
            const command = new AnalyzeIDCommand({
                DocumentPages: [
                    {
                        S3Object: {
                            Bucket: this.bucketName,
                            Name: frontFileKey
                        },
                    },
                ]
            })

            const response = await this.textractClient.send(command);

            // AnalyzeID returns an array of IdentityDocuments. We take the first one.
            const idDocument = response.IdentityDocuments?.[0];
            if(!idDocument || !idDocument.IdentityDocumentFields){
                throw new BadRequestException('Could not detect a valid ID in the provided image.');
            }

            return this.mapTextractFieldsToResult(idDocument.IdentityDocumentFields);
        } catch (error) {
            if(error instanceof BadRequestException){
                throw error;
            }
            console.error("Textract Exceution Error: ",error);
            throw new InternalServerErrorException('Failed to process document via OCR');
        }
    }

    private mapTextractFieldsToResult(fields: IdentityDocumentField[]): IOcrResult{
        let firstName = '';
        let lastName = '';
        let dateOfBirthStr = '';
        let documentNumber = '';
        let totalConfidence = 0;
        let fieldCount = 0;

        for (const field of fields){
            const type = field.Type?.Text;
            const value = field.ValueDetection?. Text;
            const confidence = field.ValueDetection?.Confidence || 0;


            if(!value || !type) continue;

            switch(type){
                case 'FIRST_NAME':
                    firstName = value;
                    totalConfidence += confidence;
                    fieldCount ++;
                    break;
                case 'LAST_NAME':
                    lastName = value;
                    totalConfidence += confidence;
                    fieldCount ++;
                    break;
                case 'DATE_OF_BIRTH':
                    dateOfBirthStr = value; // Usually returns in YYYY-MM-DD or mm/dd/yyyy format
                    totalConfidence += confidence;
                    fieldCount ++;
                    break;
                case "DOCUMENT_NUMBER":
                case "ID_NUMBER":
                    documentNumber = value;
                    totalConfidence += confidence;
                    fieldCount ++;
                    break;
            }
        }

        if(!documentNumber || !dateOfBirthStr){
            throw new BadRequestException('Missing critical fields on documet (ID Number or DOB).');
        }

        // Calculate an avg confidence score for the extracted data
        const averageConfidence = fieldCount > 0 ? (totalConfidence / fieldCount) : 0;
        const legalName = `${firstName} ${lastName}`.trim();

        return{
            legalName,
            dateOfBirth: new Date(dateOfBirthStr),
            documentNumber,
            confidenceScore: averageConfidence
        }
    }
}