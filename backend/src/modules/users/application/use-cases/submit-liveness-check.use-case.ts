import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { ISubmitLivenessCheckUseCase } from "../interfaces/submit-liveness-check.use-case.interface";
import { IUserRepository, USER_REPOSITORY } from "../../domain/interfaces/user-repository.interface";
import { BIOMETRIC_SERVICE, IBiometricService } from "../../domain/interfaces/biometric-service.interface";
import { VerificationStatus } from "../../domain/enums/user.enums";
import { s3StorageService } from "../../infrastructure/services/s3-storage.service";

@Injectable()
export class SubmitLivenessCheckUseCase implements ISubmitLivenessCheckUseCase{
    constructor(
        @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
        @Inject(BIOMETRIC_SERVICE) private readonly biometricService: IBiometricService,
        private readonly s3Service: s3StorageService,
    ){}

    async execute(userId: string, promptType: string, videoBuffer: Buffer): Promise<{ success: boolean; message: string; livenessScore: number; status: VerificationStatus }> {
        const user = await this.userRepository.findById(userId);
        if(!user) throw new BadRequestException("User not found.");

        const kyc = user.kycVerification;

        if(!kyc || !kyc.selfieFaceEmbedding || kyc.selfieFaceEmbedding.length === 0){
            throw new BadRequestException("Live Selfie is missing. Please complete the live selfie step first.");
        }

        // 1. Pass the target prompt to the ML worker for specific landmark analysis
        const {livenessScore, passed} = await this.biometricService.analyzeLiveness(videoBuffer, promptType);

        // 2. Upload liveness clip to S3
        const livenessVideoS3 = await this.s3Service.uploadVideo(userId, videoBuffer, 'video/webm');

        // 3. Record the prompt result in the domain entity
        kyc.recordLivenessPrompt({
            prompt: promptType,
            score: livenessScore,
            videoS3: livenessVideoS3,
        });

        // 4. Persist aggregate root atomically
        await this.userRepository.addLivenessResult(userId, {
            prompt: promptType,
            score: livenessScore,
            status: passed ? 'PASSED' : 'FAILED',
            videoS3: livenessVideoS3
        });

        if (!passed) {
            throw new BadRequestException(`Liveness check failed for prompt: ${promptType}.`);
        }

        return {
            success: true,
            message: `Prompt ${promptType} verified successfully.`,
            livenessScore,
            status: kyc.verificationStatus!,
        }
    }
}