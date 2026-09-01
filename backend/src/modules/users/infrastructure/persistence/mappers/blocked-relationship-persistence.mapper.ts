import { BlockedRelationship } from "../../../domain/entities/blocked-relationship.entity";
import { BlockReason } from "../../../domain/enums/user.enums";
import { BlockedRelationshipDocument } from "../blocked-relationship.schema";

export class BlockedRelationshipPersistenceMapper {
    public static toDomain(raw: BlockedRelationshipDocument): BlockedRelationship {
        return new BlockedRelationship({
            id: raw._id.toString(),
            blockerId: raw.blockerId.toString(),
            blockedId: raw.blockedId.toString(),
            reason: raw.reason as BlockReason,
            createdAt: raw.createdAt,
        });
    }

    public static toPersistence(entity: BlockedRelationship): Record<string, unknown> {
        return {
            blockerId: entity.blockerId,
            blockedId: entity.blockedId,
            reason: entity.reason,
        };
    }
}