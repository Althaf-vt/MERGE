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

    public static toDomainList(documents: PriorityIntroDocument[]): PriorityIntroAggregate[] {
        return documents.map((doc) => PriorityIntroPersistenceMapper.toDomain(doc));
    }

    public static toPersistence(entity: PriorityIntroAggregate): Record<string, unknown> {
        const snapshot = entity.toJSON();
        return {
            senderId: snapshot.senderId,
            recipientId: snapshot.recipientId,
            icebreakerMessage: snapshot.icebreakerMessage,
            createdAt: snapshot.createdAt,
        };
    }
}

