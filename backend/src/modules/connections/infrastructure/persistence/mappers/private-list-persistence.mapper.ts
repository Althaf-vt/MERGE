import { PrivateListAggregate } from "../../../domain/entities/private-list.entity";
import { PrivateListType } from "../../../domain/enums/private-list.enums";
import { PrivateListDocument } from "../private-list.schema";

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
        return {
            userId: entity.userId,
            targetUserId: entity.targetUserId,
            listType: entity.listType,
            createdAt: entity.createdAt,
        };
    }
}