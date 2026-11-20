import { ConnectionAggregate } from "../../../domain/entities/connection.entity";
import { ConnectionStatus } from "../../../domain/enums/connection.enums";
import { ConnectionDocument } from "../connection.schema";

export class ConnectionPersistenceMapper {
    public static toDomain(raw: ConnectionDocument): ConnectionAggregate {
        return new ConnectionAggregate({
            id: raw._id.toString(),
            requesterId: raw.requesterId,
            recipientId: raw.recipientId,
            status: raw.status as ConnectionStatus,
            respondedAt: raw.respondedAt ?? null,
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt,
        });
    }

    public static toDomainList(documents: ConnectionDocument[]): ConnectionAggregate[] {
        return documents.map((doc) => ConnectionPersistenceMapper.toDomain(doc));
    }

    public static toPersistence(entity: ConnectionAggregate): Record<string, unknown> {
        const snapshot = entity.toJSON();
        return {
            requesterId: snapshot.requesterId,
            recipientId: snapshot.recipientId,
            status: snapshot.status,
            respondedAt: snapshot.respondedAt ?? null,
            updatedAt: snapshot.updatedAt,
        };
    }
}