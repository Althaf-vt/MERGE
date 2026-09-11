import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { ISubmitFinalVerificationUseCase } from "../interfaces/submit-final-verification.use-case.interface";
import { IUserRepository, USER_REPOSITORY } from "../../domain/interfaces/user-repository.interface";
import { VerificationStatus } from "../../domain/enums/user.enums";


@Injectable()
export class SubmitFinalVerificationUseCase implements ISubmitFinalVerificationUseCase{
    constructor(
        @Inject(USER_REPOSITORY) private readonly _userRepository: IUserRepository,
    ){}

    async execute(userId: string): Promise<{ success: boolean; status: VerificationStatus; message: string; }> {
        const user = await this._userRepository.findById(userId);

        if(!user || !user.kycVerification){
            throw new BadRequestException("User or Kyc record not found.");
        }

        const kyc = user.kycVerification;

        // Trigger the phase 7 domain gate
        try {
            kyc.submitVerification(); // Must match the 4 prompts (BLINK, TURN_LEFT, TURN_RIGHT, SMILE)
        } catch (error: any) {
            throw new BadRequestException(error.message);
        }

        // If the system auto-approves based on thresholds, update the aggregate
        if(kyc.verificationStatus === VerificationStatus.APPROVED){
            user.completeKyc();
        }

        await this._userRepository.update(user);

        return{
            success: true, 
            status: kyc.verificationStatus!,
            message: "Verification submitted successfully."
        }
    }
}