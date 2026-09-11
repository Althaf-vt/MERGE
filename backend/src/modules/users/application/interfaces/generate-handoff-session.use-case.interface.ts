export const GENERATE_HANDOFF_SESSION_USE_CASE = Symbol('GENERATE_HANDOFF_SESSION_USE_CASE');

export interface GenerateHandoffResult {
    success: boolean;
    message: string
    data: {
        sessionId: string;
        qrCodeUrl: string;
        expiresAt: string;
    }
}

export interface IGenerateHandoffSessionUseCase {
    execute(userId: string, clientOrigin?: string): Promise<GenerateHandoffResult>;
}