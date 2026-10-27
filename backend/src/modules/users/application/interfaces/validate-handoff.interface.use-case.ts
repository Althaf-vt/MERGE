export const VALIDATE_HANDOFF_USE_CASE = Symbol('VALIDATE_HANDOFF_USE_CASE');

export interface IValidateHandoffUseCase {
    execute(sessionId: string): Promise<{ accessToken: string; refreshToken: string; userId: string }>;
}