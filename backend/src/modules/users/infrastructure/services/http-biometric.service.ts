import { Injectable } from "@nestjs/common";
import { DomainException } from "../../domain/exceptions/domain.exception";
import { ErrorCode } from "../../domain/enums/error-code.enum";
import { IExtractionResult, IBiometricService, ILivenessResult } from "../../domain/interfaces/biometric-service.interface";
import { HttpService } from "@nestjs/axios";
import { lastValueFrom } from "rxjs";
import FormData from "form-data";

@Injectable()
export class HttpBiometricService implements IBiometricService{
    constructor(private readonly _httpService: HttpService){}

    async extractEmbedding(imageBuffer: Buffer): Promise<IExtractionResult> {
        try {
            const formData = new FormData();

            // Attach the raw image buffer as a multipart file
            formData.append('file', imageBuffer, {filename: 'selfie.jpg'})

            // connects to the FastAPI ML Worker inside the Docker network
            const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://biometric-worker:8000/extract-embedding';

            // lastValueFrom converts the Axios Observable into a standard Promise
            const response = await lastValueFrom(
                this._httpService.post(mlServiceUrl, formData, {
                    headers: formData.getHeaders()
                })
            )

            return {
                confidence: response.data.confidence,
                faceEmbedding: response.data.faceEmbedding
            }

        } catch (error: any) {
            // Axios wraps the response under error.response
            const status = error.response?.status;
            const detail = error.response?.data?.detail;

            if (status === 400) {
                throw new DomainException(ErrorCode.LIVENESS_CHECK_FAILED, detail || 'Face validation failed.');
            }
            
            console.error('ML Worker Error Details:', error.message, error.response?.data);
            throw new DomainException(ErrorCode.INTERNAL_SERVER_ERROR, detail || 'Failed to communicate with the biometric ML worker.');
        }
    }

    async analyzeLiveness(videoBuffer: Buffer, promptType: string): Promise<ILivenessResult> {
        try {
            const formData = new FormData();

            formData.append('file', videoBuffer, {filename: 'liveness.webm'});
            formData.append('promptType', promptType); // ADD THIS LINE

            const baseUrl = process.env.ML_SERVICE_URL?.replace('/extract-embedding', '') || 'http://biometric-worker:8000';
            const mlLivenessUrl = `${baseUrl}/analyze-liveness`;

            const response = await lastValueFrom(
                this._httpService.post(mlLivenessUrl, formData, {
                    headers: formData.getHeaders()
                })
            )

            return {
                livenessScore: response.data.livenessScore,
                passed: response.data.passed
            }
        } catch (error: any) {
            const status = error.response?.status;
            const detail = error.response?.data?.detail;

            if (status === 400) {
                throw new DomainException(ErrorCode.LIVENESS_CHECK_FAILED, detail || 'Liveness validation failed.');
            }
            
            console.error('ML Worker Liveness Error Details:', error.message, error.response?.data);
            throw new DomainException(ErrorCode.INTERNAL_SERVER_ERROR, detail || 'Failed to communicate with the liveness ML worker.');
        }
    }
}