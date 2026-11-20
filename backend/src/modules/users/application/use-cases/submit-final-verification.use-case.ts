import { Inject, Injectable } from "@nestjs/common";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";
import { USER_ERROR_MESSAGES } from "../../domain/constants/user-error-messages.constant";
import { ISubmitFinalVerificationUseCase, SubmitFinalVerificationResult } from "../interfaces/submit-final-verification.use-case.interface";
import { IUserRepository, USER_REPOSITORY } from "../../domain/interfaces/user-repository.interface";
import { VerificationStatus } from "../../domain/enums/user.enums";

@Injectable()
export class SubmitFinalVerificationUseCase implements ISubmitFinalVerificationUseCase {
    constructor(
        @Inject(USER_REPOSITORY) private readonly _userRepository: IUserRepository,
    ) {}

    async execute(userId: string): Promise<SubmitFinalVerificationResult> {
        const user = await this._userRepository.findById(userId);

        if (!user || !user.kycVerification) {
            throw new DomainException(ErrorCode.USER_NOT_FOUND, USER_ERROR_MESSAGES.USER_OR_KYC_NOT_FOUND);
        }

        const kyc = user.kycVerification;

        // Trigger the phase 7 domain gate (must match required prompts: BLINK, TURN_LEFT, TURN_RIGHT, SMILE)
        kyc.submitVerification();

        // If the system auto-approves based on thresholds, update the aggregate
        if (kyc.verificationStatus === VerificationStatus.APPROVED) {
            user.completeKyc();
        } else if (kyc.verificationStatus === VerificationStatus.UNDER_REVIEW) {
            const livenessResults = kyc.livenessResults ?? [];
            const passedLiveness = livenessResults.filter((r) => r.status === 'PASSED');
            const averageLiveness = passedLiveness.length > 0
                ? passedLiveness.reduce((acc, curr) => acc + curr.score, 0) / passedLiveness.length
                : 0;

            user.escalateKycForManualReview({
                documentType: kyc.documentType || 'UNKNOWN',
                issuingCountry: kyc.issuingCountry || 'UNKNOWN',
                kycSelfieUrl: kyc.liveSelfieS3 || '',
                uploadedDocumentUrl: kyc.liveSelfieS3 || '',
                livenessScore: Math.round(averageLiveness * 100) / 100,
                faceMatchScore: Math.round((kyc.selfieConfidence ?? 0) * 100) / 100,
            });
        }

        await this._userRepository.update(user);

        return {
            status: kyc.verificationStatus!
        };
    }
}