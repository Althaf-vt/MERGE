import { VerificationStatus } from "../../domain/enums/user.enums";

export const SUBMIT_FINAL_VERIFICATION_USE_CASE = Symbol("SUBMIT_FINAL_VERIFICATION_USE_CASE");

export interface SubmitFinalVerificationResult {
    status: VerificationStatus;
}

export interface ISubmitFinalVerificationUseCase {
    execute(userId: string): Promise<SubmitFinalVerificationResult>;
}