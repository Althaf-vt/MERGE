import { Inject, Injectable } from "@nestjs/common";
import { DomainException } from "../../domain/exceptions/domain.exception";
import { ErrorCode } from "../../domain/enums/error-code.enum";
import { type IUserRepository, USER_REPOSITORY } from "../../domain/interfaces/user-repository.interface";
import { BIOMETRIC_SERVICE, type IBiometricService } from "../../domain/interfaces/biometric-service.interface";
import { SelfieVerificationStatus } from "../../domain/enums/user.enums";
import { ISubmitLiveSelfieUseCase } from "../interfaces/submit-live-selfie.use-case.interface";
import { IStorageService, STORAGE_SERVICE } from "../interfaces/storage-service.interface";

@Injectable()
export class SubmitLiveSelfieUseCase implements ISubmitLiveSelfieUseCase {
    constructor(
        @Inject(USER_REPOSITORY) private readonly _userRepository: IUserRepository,
        @Inject(BIOMETRIC_SERVICE) private readonly _biometricService: IBiometricService,
        @Inject(STORAGE_SERVICE) private readonly _s3Service: IStorageService,
    ) { };

    async execute(userId: string, fileBuffer: Buffer) {
        const user = await this._userRepository.findById(userId);
        if (!user) throw new DomainException(ErrorCode.USER_NOT_FOUND, 'User not found');

        // Ensure phase 3-7 (Document PKI) is actually finished first
        if (user.kycVerification?.verificationStatus !== 'APPROVED') {
            throw new DomainException(ErrorCode.KYC_DOCUMENT_INVALID, 'Document verification must be completed first.');
        }

        // 1. Offload the heavy vector math to the Python (Only requesting embedding, no liveness ye)
        const { faceEmbedding, confidence } = await this._biometricService.extractEmbedding(fileBuffer);

        // 2. Mock S3 Upload (To be replaces with actual S3 service later)
        const liveSelfieS3 = await this._s3Service.uploadSelfie(userId, fileBuffer);

        // 3. Save the vector for future continues Authentication
        user.kycVerification.recordSelfie({
            liveSelfieS3,
            selfieFaceEmbedding: faceEmbedding, // 512-dimension array
            selfieConfidence: confidence,
            // reason if confidence is low
            rejectionReason: confidence < 85 ? "Face not clearly visible or poor lighting" : undefined
        });

        // 4. Save the entity state (whether it passed or failed)
        await this._userRepository.update(user);

        // 5. If the entity rejected the selfie, throw an error to trigger the UI retry state
        if (user.kycVerification.selfieVerificationStatus === SelfieVerificationStatus.REJECTED) {
            throw new DomainException(ErrorCode.FACE_MISMATCH, 'Selfie rejected: Face not clearly visible or poor lighting. Please try again.');
        }

        return { success: true, message: "Golden identity baseline established." };
    }
}