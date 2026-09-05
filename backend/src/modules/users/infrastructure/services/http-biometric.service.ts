import { BadRequestException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { IExtractionResult, IBiometricService, ILivenessResult } from "../../domain/interfaces/biometric-service.interface";
import { HttpService } from "@nestjs/axios";
import { lastValueFrom } from "rxjs";
import FormData from "form-data";

@Injectable()
export class HttpBiometricService implements IBiometricService{
    constructor(private readonly httpService: HttpService){}

    async extractEmbedding(imageBuffer: Buffer): Promise<IExtractionResult> {
        try {
            const formData = new FormData();

            // Attach the raw image buffer as a multipart file
            formData.append('file', imageBuffer, {filename: 'selfie.jpg'})

            // connects to the FastAPI ML Worker inside the Docker network
            const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://biometric-worker:8000/extract-embedding';

            // lastValueFrom converts the Axios Observable into a standard Promise
            const response = await lastValueFrom(
                this.httpService.post(mlServiceUrl, formData, {
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
                throw new BadRequestException(detail || 'Face validation failed.');
            }
            
            console.error('ML Worker Error Details:', error.message, error.response?.data);
            throw new InternalServerErrorException(detail || 'Failed to communicate with the biometric ML worker.');
        }
    }

    async analyzeLiveness(videoBuffer: Buffer): Promise<ILivenessResult> {
        try {
            const formData = new FormData();

            // Attach the video buffer (commonly WebM from browser MediaRecorder)
            formData.append('file', videoBuffer, {filename: 'liveness.webm'});

            const baseUrl = process.env.ML_SERVICE_URL?.replace('/extract-embedding', '') || 'http://biometric-worker:8000';
            const mlLivenessUrl = `${baseUrl}/analyze-liveness`;

            const response = await lastValueFrom(
                this.httpService.post(mlLivenessUrl, formData, {
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
                throw new BadRequestException(detail || 'Liveness validation failed.');
            }
            
            console.error('ML Worker Liveness Error Details:', error.message, error.response?.data);
            throw new InternalServerErrorException(detail || 'Failed to communicate with the liveness ML worker.');
        }
    }
}