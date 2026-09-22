import { CastingSession } from "../../domain/entities/casting-session.entity";

export const INITIALIZE_CASTING_SESSION_USE_CASE = 'INITIALIZE_CASTING_SESSION_USE_CASE';

export interface IInitializeCastingSessionUseCase {
    execute(userId: string): Promise<CastingSession>;
}