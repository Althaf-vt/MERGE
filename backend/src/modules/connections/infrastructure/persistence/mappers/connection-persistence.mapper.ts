import { ConnectionAggregate } from "../../../domain/entities/connection.entity";
import { ConnectionStatus } from "../../../domain/enums/connection.enums";
import { ConnectionDocument } from "../persistence/connection.schema";


export class ConnectionPersistenceMapper {
    public static toDomain(raw: ConnectionDocument): ConnectionAggregate {
        return new ConnectionAggregate({
            id: raw._id.toString(),
            requesterId: raw.requesterId,
            recipientId: raw.recipientId,
            status: raw.status as ConnectionStatus,
            isPriority: raw.isPriority,
            icebreakerMessage: raw.icebreakerMessage ?? undefined,
            respondedAt: raw.respondedAt ?? null,
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt,
        });
    }

    public static toPersistence(entity: ConnectionAggregate): Record<string, unknown> {
        const data = entity.toJSON();
        return {
            requesterId: data.requesterId,
            recipientId: data.recipientId,
            status: data.status,
            isPriority: data.isPriority,
            icebreakerMessage: data.icebreakerMessage ?? null,
            respondedAt: data.respondedAt ?? null,
        };
    }
}