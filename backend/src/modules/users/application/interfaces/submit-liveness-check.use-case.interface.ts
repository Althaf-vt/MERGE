export const SUBMIT_LIVENESS_CHECK_USE_CASE = Symbol("SUBMIT_LIVENESS_CHECK_USE_CASE");

export interface ISubmitLivenessCheckUseCase{
    execute(userId: string, videoBuffer: Buffer): Promise<{
        success: boolean;
        message: string;
        livenessScore: number
    }>;
}