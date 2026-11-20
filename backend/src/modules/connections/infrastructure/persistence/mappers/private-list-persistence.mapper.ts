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

    public static toDomainList(documents: PrivateListDocument[]): PrivateListAggregate[] {
        return documents.map((doc) => PrivateListPersistenceMapper.toDomain(doc));
    }

    public static toPersistence(entity: PrivateListAggregate): Record<string, unknown> {
        const snapshot = entity.toJSON();
        return {
            userId: snapshot.userId,
            targetUserId: snapshot.targetUserId,
            listType: snapshot.listType,
            createdAt: snapshot.createdAt,
        };
    }
}