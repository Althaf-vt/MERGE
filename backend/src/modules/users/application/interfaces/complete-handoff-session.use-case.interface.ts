export const COMPLETE_HANDOFF_SESSION_USE_CASE = Symbol('COMPLETE_HANDOFF_SESSION_USE_CASE');

export interface ICompleteHandoffSessionUseCase {
    execute(sessionId: string): Promise<void>;
}