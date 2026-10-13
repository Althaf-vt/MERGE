import { VerificationStatus } from "../../domain/enums/user.enums";

export const SUBMIT_LIVENESS_CHECK_USE_CASE = Symbol("SUBMIT_LIVENESS_CHECK_USE_CASE");

export interface SubmitLivenessCheckResult {
    status: VerificationStatus;
    livenessScore: number;
}

export interface ISubmitLivenessCheckUseCase {
    execute(userId: string, promptType: string, videoBuffer: Buffer): Promise<SubmitLivenessCheckResult>;
}