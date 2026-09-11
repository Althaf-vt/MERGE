export const SUBMIT_LIVE_SELFIE_USE_CASE = Symbol('SUBMIT_LIVE_SELFIE_USE_CASE');

export interface ISubmitLiveSelfieUseCase {
    execute(userId: string, fileBuffer: Buffer): Promise<{
        success: boolean;
        message: string;
    }>;
}