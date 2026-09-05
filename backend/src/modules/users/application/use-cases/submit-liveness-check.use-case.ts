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

    async execute(userId: string, videoBuffer: Buffer): Promise<{ success: boolean; message: string; livenessScore: number; status: VerificationStatus }> {
        const user = await this.userRepository.findById(userId);
        if(!user) throw new BadRequestException("User not found.");

        const kyc = user.kycVerification;

        // Ensure the Live-selfie is exists
        if(!kyc ||!kyc.selfieFaceEmbedding || kyc.selfieFaceEmbedding.length === 0){
            throw new BadRequestException("LiveSelife is missing. Please complete the live selfie step first.");
        }

        // 1. Offload liveness video/frames to the Python ML worker
        const {livenessScore, passed} = await this.biometricService.analyzeLiveness(videoBuffer);

        // 2. Upload liveness video to S3 for audit trails
        const livenessVideoS3 = await this.s3Service.uploadVideo(userId, videoBuffer, 'video/webm');

        // 3. Update the Domain Enitity 
        kyc.recordLiveness({
            livenessScore,
            livenessVideoS3,
            rejectionReason: passed ? undefined : `Spoof detected. Liveness Score: ${livenessScore}`,
        });

        // 4. Update aggregate status based on resulting domain state
        if(kyc.verificationStatus === VerificationStatus.APPROVED){
            user.completeKyc();
        }

        // 5. Persist aggregate root atomically
        await this.userRepository.update(user);

        // 6. Return response matching the final verification state
        if(kyc.verificationStatus === VerificationStatus.REJECTED){
            throw new BadRequestException("Liveness check failed. Spoofing attempt detected.");
        }

        const message = kyc.verificationStatus === VerificationStatus.UNDER_REVIEW
            ? "Liveness check flagged for manual review."
            : "Liveness verified successfully. KYC Complete.";


        return {
            success: true,
            message,
            livenessScore,
            status: kyc.verificationStatus!,
        }
    }
}