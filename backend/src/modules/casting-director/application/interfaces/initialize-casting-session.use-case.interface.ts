import { CastingSessionResponseDto } from "../dtos/casting-session-response.dto";

export const INITIALIZE_CASTING_SESSION_USE_CASE = 'INITIALIZE_CASTING_SESSION_USE_CASE';

export interface IInitializeCastingSessionUseCase {
    execute(userId: string): Promise<CastingSessionResponseDto>;
}