import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { type IUserRepository, USER_REPOSITORY } from "../../domain/interfaces/user-repository.interface";
import { BIOMETRIC_SERVICE, type IBiometricService } from "../../domain/interfaces/biometric-service.interface";
import { SelfieVerificationStatus } from "../../domain/enums/user.enums";
import { s3StorageService } from "../../infrastructure/services/s3-storage.service";

@Injectable()
export class SubmitLiveSelfieUseCase{
    constructor(
        @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
        @Inject(BIOMETRIC_SERVICE) private readonly biometricService: IBiometricService,
        private readonly s3Service: s3StorageService
    ){}

    async execute(userId: string, fileBuffer: Buffer){
        const user = await this.userRepository.findById(userId);
        if(!user) throw new BadRequestException('User not found');

        // Ensure phase 3-7 (Document PKI) is actually finished first
        if(user.kycVerfication?.verificationStatus !== 'APPROVED'){
            throw new BadRequestException('Document verification must be completed first.');
        }

        // 1. Offload the heavy vector math to the Python (Only requesting embedding, no liveness ye)
        const {faceEmbedding, confidence} = await this.biometricService.extractEmbedding(fileBuffer);
        
        // 2. Mock S3 Upload (To be replaces with actual S3 service later)
        const liveSelfieS3 = await this.s3Service.uploadSelfie(userId, fileBuffer);

        // 3. Save the vector for future continues Authentication
        user.kycVerfication.recordSelfie({
            liveSelfieS3,
            selfieFaceEmbedding: faceEmbedding, // 512-dimension array
            selfieConfidence: confidence,
            // reason if confidence is low
            rejectionReason: confidence < 85 ? "Face not clearly visible or poor lighting" : undefined
        });

        // 4. Save the entity state (whether it passed or failed)
        await this.userRepository.update(user)
        
        // 5. If the entity rejected the selfie, throw an error to trigger the UI retry state
        if(user.kycVerfication.selfieVerificationStatus === SelfieVerificationStatus.REJECTED){
            throw new BadRequestException('Selfie rejected: Face not clearly visible or poor lighting. Please try again.');
        }

        return {success: true, message: "Golden identity baseline established."};
    }
}