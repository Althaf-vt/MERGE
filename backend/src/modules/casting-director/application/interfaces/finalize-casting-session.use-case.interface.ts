export const FINALIZE_CASTING_SESSION_USE_CASE = 'FINALIZE_CASTING_SESSION_USE_CASE';

export interface IFinalizeCastingSessionUseCase {
    execute(userId: string): Promise<void>;
}