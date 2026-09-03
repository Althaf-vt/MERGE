import { BadRequestException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { IExtractionResult, IBiometricService } from "../../domain/interfaces/biometric-service.interface";
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
            if(error.response?.status === 400){
                throw new BadRequestException(error.response.data.detail || "Face not found or invalid image format.");
            }
            throw new InternalServerErrorException('Failed to communicate with the biometric ML worker.')
        }
    }
}