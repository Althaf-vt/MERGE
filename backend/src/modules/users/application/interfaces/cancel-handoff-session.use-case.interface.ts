export const CANCEL_HANDOFF_SESSION_USE_CASE = Symbol('CANCEL_HANDOFF_SESSION_USE_CASE');

export interface ICancelHandoffSessionUseCase {
    execute(sessionId: string): Promise<void>;
}