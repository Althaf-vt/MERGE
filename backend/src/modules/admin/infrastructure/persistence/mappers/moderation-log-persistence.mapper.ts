import { ModerationLog } from "../../../domain/entities/moderation-log.entity";
import { ModerationAction } from "../../../domain/enums/moderation.enums";
import { ModerationLogDocument } from "../moderation-log.schema";

export class ModerationLogPersistenceMapper {
    public static toDomain(raw: ModerationLogDocument): ModerationLog {
        return new ModerationLog({
            id: raw._id.toString(),
            targetUserId: raw.targetUserId,
            adminId: raw.adminId,
            action: raw.action as ModerationAction,
            reason: raw.reason,
            durationContext: raw.durationContext,
            createdAt: raw.createdAt,
        });
    }

    public static toPersistence(entity: ModerationLog): any {
        return {
            targetUserId: entity.targetUserId,
            adminId: entity.adminId,
            action: entity.action,
            reason: entity.reason,
            durationContext: entity.durationContext ?? null,
        };
    }
}