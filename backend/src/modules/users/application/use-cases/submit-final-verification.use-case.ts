import { Inject, Injectable } from "@nestjs/common";
import { DomainException } from "../../../../shared/domain/exceptions/domain.exception";
import { ErrorCode } from "../../../../shared/domain/enums/error-code.enum";
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
            throw new DomainException(ErrorCode.USER_NOT_FOUND, "User or Kyc record not found.");
        }

        const kyc = user.kycVerification;

        // Trigger the phase 7 domain gate (must match required prompts: BLINK, TURN_LEFT, TURN_RIGHT, SMILE)
        kyc.submitVerification();

        // If the system auto-approves based on thresholds, update the aggregate
        if (kyc.verificationStatus === VerificationStatus.APPROVED) {
            user.completeKyc();
        }

        await this._userRepository.update(user);

        return {
            status: kyc.verificationStatus!
        };
    }
}