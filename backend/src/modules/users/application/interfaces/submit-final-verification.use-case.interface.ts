import { VerificationStatus } from "../../domain/enums/user.enums";

export const SUBMIT_FINAL_VERIFICATION_USE_CASE = Symbol("SUBMIT_FINAL_VERIFICATION_USE_CASE");

export interface ISubmitFinalVerificationUseCase {
    execute(userId: string): Promise<{
        success: boolean;
        status: VerificationStatus;
        message: string;
    }>
}