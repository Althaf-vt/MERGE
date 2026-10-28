import { Injectable, Logger } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { isAxiosError } from "axios";
import { lastValueFrom } from "rxjs";
import FormData from "form-data";
import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { EnvConfig } from "../../../../shared/infrastructure/config/env.config";
import {
    IExtractionResult,
    IBiometricService,
    ILivenessResult
} from "../../domain/interfaces/biometric-service.interface";

interface IMlWorkerErrorResponse {
    detail?: string;
}

@Injectable()
export class HttpBiometricService implements IBiometricService {
    private readonly _logger = new Logger(HttpBiometricService.name);

    constructor(private readonly _httpService: HttpService) {}

    private _handleWorkerError(error: unknown, fallbackMessage: string): never {
        let status: number | undefined;
        let detail: string | undefined;
        let errorMessage = fallbackMessage;

        if (isAxiosError<IMlWorkerErrorResponse>(error)) {
            status = error.response?.status;
            detail = error.response?.data?.detail;
            errorMessage = error.message;
        } else if (error instanceof Error) {
            errorMessage = error.message;
        }

        const errorStack = error instanceof Error ? error.stack : undefined;
        this._logger.error(`ML Worker error: ${errorMessage}`, errorStack);

        if (status === 400) {
            throw new DomainException(ErrorCode.LIVENESS_CHECK_FAILED, detail || 'Biometric validation failed.');
        }

        throw new DomainException(ErrorCode.INTERNAL_SERVER_ERROR, detail || fallbackMessage);
    }

    async extractEmbedding(imageBuffer: Buffer): Promise<IExtractionResult> {
        try {
            const formData = new FormData();

            // Attach the raw image buffer as a multipart file
            formData.append('file', imageBuffer, { filename: 'selfie.jpg' });

            // Connects to the FastAPI ML Worker inside the Docker network
            const mlServiceUrl = EnvConfig.services.mlServiceUrl;

            // lastValueFrom converts the Axios Observable into a standard Promise
            const response = await lastValueFrom(
                this._httpService.post(mlServiceUrl, formData, {
                    headers: formData.getHeaders(),
                })
            );

            return {
                confidence: response.data.confidence,
                faceEmbedding: response.data.faceEmbedding,
            };
        } catch (error: unknown) {
            this._handleWorkerError(error, 'Failed to communicate with the biometric ML worker.');
        }
    }

    async extractProfileEmbedding(imageBuffer: Buffer): Promise<IExtractionResult> {
        try {
            const formData = new FormData();
            formData.append('file', imageBuffer, { filename: 'profile.jpg' });

            const mlProfileUrl = `${EnvConfig.services.mlServiceBaseUrl}/extract-profile-embedding`;
            const response = await lastValueFrom(
                this._httpService.post(mlProfileUrl, formData, {
                    headers: formData.getHeaders(),
                })
            );

            return {
                confidence: response.data.confidence || 0,
                faceEmbedding: response.data.faceEmbedding || [],
            };
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            const errorStack = error instanceof Error ? error.stack : undefined;
            this._logger.warn(`ML Worker profile embedding extraction failed: ${errorMessage}`, errorStack);
            return { confidence: 0, faceEmbedding: [] };
        }
    }

    async analyzeLiveness(videoBuffer: Buffer, promptType: string): Promise<ILivenessResult> {
        try {
            const formData = new FormData();
            formData.append('file', videoBuffer, { filename: 'liveness.webm' });
            formData.append('promptType', promptType);

            const mlLivenessUrl = `${EnvConfig.services.mlServiceBaseUrl}/analyze-liveness`;
            const response = await lastValueFrom(
                this._httpService.post(mlLivenessUrl, formData, {
                    headers: formData.getHeaders(),
                })
            );

            return {
                livenessScore: response.data.livenessScore,
                passed: response.data.passed,
            };
        } catch (error: unknown) {
            this._handleWorkerError(error, 'Failed to communicate with the liveness ML worker.');
        }
    }
}