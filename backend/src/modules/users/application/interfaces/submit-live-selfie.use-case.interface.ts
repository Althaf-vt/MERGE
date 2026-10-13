import { VerificationStatus } from "../../domain/enums/user.enums";

export const SUBMIT_LIVE_SELFIE_USE_CASE = Symbol('SUBMIT_LIVE_SELFIE_USE_CASE');

export interface SubmitLiveSelfieResult {
    status: VerificationStatus; 
    faceMatchScore?: number;
    photoUrl?: string;
}

export interface ISubmitLiveSelfieUseCase {
    execute(userId: string, fileBuffer: Buffer): Promise<SubmitLiveSelfieResult>;
}