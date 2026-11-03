import { CastingSessionResponseDto } from "../dtos/casting-session-response.dto";

export const PROCESS_CASTING_MESSAGE_USE_CASE = 'PROCESS_CASTING_MESSAGE_USE_CASE';

export interface IProcessCastingMessageUseCase {
    execute(userId: string, content: string): Promise<CastingSessionResponseDto>;
}