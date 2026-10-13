import { Injectable } from "@nestjs/common";
import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";
import { IExtractionResult, IBiometricService, ILivenessResult } from "../../domain/interfaces/biometric-service.interface";
import { HttpService } from "@nestjs/axios";
import { lastValueFrom } from "rxjs";
import FormData from "form-data";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";

interface AxiosErrorPayload {
    response?: {
        status?: number;
        data?: {
            detail?: string;
        };
    };
}

function isAxiosErrorObj(err: unknown): err is Error & AxiosErrorPayload {
    return err instanceof Error && 'response' in err;
}

@Injectable()
export class HttpBiometricService implements IBiometricService {
    constructor(private readonly _httpService: HttpService) {}

    async extractEmbedding(imageBuffer: Buffer): Promise<IExtractionResult> {
        try {
            const formData = new FormData();

            // Attach the raw image buffer as a multipart file
            formData.append('file', imageBuffer, { filename: 'selfie.jpg' });

            // connects to the FastAPI ML Worker inside the Docker network
            const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://biometric-worker:8000/extract-embedding';

            // lastValueFrom converts the Axios Observable into a standard Promise
            const response = await lastValueFrom(
                this._httpService.post(mlServiceUrl, formData, {
                    headers: formData.getHeaders()
                })
            );

            return {
                confidence: response.data.confidence,
                faceEmbedding: response.data.faceEmbedding
            };

        } catch (error: unknown) {
            let status: number | undefined;
            let detail: string | undefined;
            let errorMessage = 'Failed to communicate with the biometric ML worker.';

            if (isAxiosErrorObj(error)) {
                status = error.response?.status;
                detail = error.response?.data?.detail;
                errorMessage = error.message;
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }

            if (status === 400) {
                throw new DomainException(ErrorCode.LIVENESS_CHECK_FAILED, detail || 'Face validation failed.');
            }
            
            console.error(`ML Worker Error Details: ${errorMessage}`);
            throw new DomainException(ErrorCode.INTERNAL_SERVER_ERROR, detail || 'Failed to communicate with the biometric ML worker.');
        }
    }

    async extractProfileEmbedding(imageBuffer: Buffer): Promise<IExtractionResult> {
        try {
            const formData = new FormData();
            formData.append('file', imageBuffer, { filename: 'profile.jpg' });

            const baseUrl = process.env.ML_SERVICE_URL?.replace('/extract-embedding', '') || 'http://biometric-worker:8000';
            const mlProfileUrl = `${baseUrl}/extract-profile-embedding`;

            const response = await lastValueFrom(
                this._httpService.post(mlProfileUrl, formData, {
                    headers: formData.getHeaders()
                })
            );

            return {
                confidence: response.data.confidence || 0,
                faceEmbedding: response.data.faceEmbedding || []
            };
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(`ML Worker Profile Error Details: ${errorMessage}`);
            return { confidence: 0, faceEmbedding: [] };
        }
    }

    async analyzeLiveness(videoBuffer: Buffer, promptType: string): Promise<ILivenessResult> {
        try {
            const formData = new FormData();

            formData.append('file', videoBuffer, { filename: 'liveness.webm' });
            formData.append('promptType', promptType);

            const baseUrl = process.env.ML_SERVICE_URL?.replace('/extract-embedding', '') || 'http://biometric-worker:8000';
            const mlLivenessUrl = `${baseUrl}/analyze-liveness`;

            const response = await lastValueFrom(
                this._httpService.post(mlLivenessUrl, formData, {
                    headers: formData.getHeaders()
                })
            );

            return {
                livenessScore: response.data.livenessScore,
                passed: response.data.passed
            };
        } catch (error: unknown) {
            let status: number | undefined;
            let detail: string | undefined;
            let errorMessage = 'Failed to communicate with the liveness ML worker.';

            if (isAxiosErrorObj(error)) {
                status = error.response?.status;
                detail = error.response?.data?.detail;
                errorMessage = error.message;
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }

            if (status === 400) {
                throw new DomainException(ErrorCode.LIVENESS_CHECK_FAILED, detail || 'Liveness validation failed.');
            }
            
            console.error(`ML Worker Liveness Error Details: ${errorMessage}`);
            throw new DomainException(ErrorCode.INTERNAL_SERVER_ERROR, detail || 'Failed to communicate with the liveness ML worker.');
        }
    }
}