import { PriorityIntroAggregate } from "../../../domain/entities/priority-intro.entity";
import { PriorityIntroDocument } from "../priority-intro.schema";

export class PriorityIntroPersistenceMapper {
    public static toDomain(raw: PriorityIntroDocument): PriorityIntroAggregate {
        return new PriorityIntroAggregate({
            id: raw._id.toString(),
            senderId: raw.senderId,
            recipientId: raw.recipientId,
            icebreakerMessage: raw.icebreakerMessage,
            createdAt: raw.createdAt,
        });
    }

    public static toPersistence(entity: PriorityIntroAggregate): Record<string, unknown> {
        return {
            senderId: entity.senderId,
            recipientId: entity.recipientId,
            icebreakerMessage: entity.icebreakerMessage,
            createdAt: entity.createdAt,
        };
    }
}

