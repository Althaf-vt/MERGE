import { Inject, Injectable } from "@nestjs/common";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";
import { type IUserRepository, USER_REPOSITORY } from "../../domain/interfaces/user-repository.interface";
import { BIOMETRIC_SERVICE, type IBiometricService } from "../../domain/interfaces/biometric-service.interface";
import { SelfieVerificationStatus } from "../../domain/enums/user.enums";
import { ISubmitLiveSelfieUseCase, SubmitLiveSelfieResult } from "../interfaces/submit-live-selfie.use-case.interface";
import { IStorageService, STORAGE_SERVICE } from "../interfaces/storage-service.interface";

@Injectable()
export class SubmitLiveSelfieUseCase implements ISubmitLiveSelfieUseCase {
    constructor(
        @Inject(USER_REPOSITORY) private readonly _userRepository: IUserRepository,
        @Inject(BIOMETRIC_SERVICE) private readonly _biometricService: IBiometricService,
        @Inject(STORAGE_SERVICE) private readonly _s3Service: IStorageService,
    ) {}

    async execute(userId: string, fileBuffer: Buffer): Promise<SubmitLiveSelfieResult> {
        const user = await this._userRepository.findById(userId);
        if (!user) throw new DomainException(ErrorCode.USER_NOT_FOUND, 'User not found');

        // Ensure phase 3-7 (Document PKI) is actually finished first
        if (user.kycVerification?.verificationStatus !== 'APPROVED') {
            throw new DomainException(ErrorCode.KYC_DOCUMENT_INVALID, 'Document verification must be completed first.');
        }

        // 1. Offload the heavy vector math to the Python worker
        const { faceEmbedding, confidence } = await this._biometricService.extractEmbedding(fileBuffer);

        // 2. Mock S3 Upload
        const liveSelfieS3 = await this._s3Service.uploadSelfie(userId, fileBuffer);

        // 3. Save the vector for future continuous Authentication
        user.kycVerification.recordSelfie({
            liveSelfieS3,
            selfieFaceEmbedding: faceEmbedding,
            selfieConfidence: confidence,
            rejectionReason: confidence < 85 ? "Face not clearly visible or poor lighting" : undefined
        });

        // 4. Save the entity state
        await this._userRepository.update(user);

        // 5. If the entity rejected the selfie, throw an error to trigger the UI retry state
        if (user.kycVerification.selfieVerificationStatus === SelfieVerificationStatus.REJECTED) {
            throw new DomainException(ErrorCode.FACE_MISMATCH, 'Selfie rejected: Face not clearly visible or poor lighting. Please try again.');
        }

        return { 
            status: user.kycVerification.verificationStatus!
        };
    }
}