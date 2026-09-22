import { IBaseRepository } from "../../../../shared/domain/interfaces/base-repository.interface";
import { CastingSession } from "../entities/casting-session.entity";

export const CASTING_SESSION_REPOSITORY = 'CASTING_SESSION_REPOSITORY';

export interface ICastingSessionRepository extends IBaseRepository<CastingSession> {
    findActiveSessionByUserId(userId: string): Promise<CastingSession | null>
}