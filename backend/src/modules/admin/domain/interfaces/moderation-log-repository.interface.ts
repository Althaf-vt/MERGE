import { ModerationLog } from "../entities/moderation-log.entity";

export const MODERATION_LOG_REPOSITORY = 'MODERATION_LOG_REPOSITORY';

export interface IModerationLogRepository {
    save(log: ModerationLog): Promise<void>;
    findByUserId(userId: string): Promise<ModerationLog[]>;
}