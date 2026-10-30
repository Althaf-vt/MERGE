import { PrivateListAggregate } from "../../../domain/entities/private-list.entity";
import { PrivateListType } from "../../../domain/enums/connection.enums";
import { PrivateListDocument } from "../persistence/private-list.schema";


export class PrivateListPersistenceMapper {
    public static toDomain(raw: PrivateListDocument): PrivateListAggregate {
        return new PrivateListAggregate({
            id: raw._id.toString(),
            userId: raw.userId,
            targetUserId: raw.targetUserId,
            listType: raw.listType as PrivateListType,
            createdAt: raw.createdAt,
        });
    }

    public static toPersistence(entity: PrivateListAggregate): Record<string, unknown> {
        const data = entity.toJSON();
        return {
            userId: data.userId,
            targetUserId: data.targetUserId,
            listType: data.listType,
        };
    }
}