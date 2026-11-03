import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { BaseRepository } from "../../../../shared/infrastructure/persistence/base-mongo.repository";
import { ConnectionAggregate } from "../../domain/entities/connection.entity";
import { ConnectionDocument, ConnectionSchemaClass } from "./connection.schema";
import {
    GetConnectionsFilters,
    IConnectionRepository,
    PaginatedConnectionsResult
} from "../../domain/interfaces/connection-repository.interface";
import { ConnectionPersistenceMapper } from "./mappers/connection-persistence.mapper";
import { ConnectionRole, ConnectionStatus } from "../../domain/enums/connection.enums";

@Injectable()
export class ConnectionRepository extends BaseRepository<ConnectionAggregate, ConnectionDocument> implements IConnectionRepository {
    constructor(
        @InjectModel(ConnectionSchemaClass.name) model: Model<ConnectionDocument>,
        eventEmitter: EventEmitter2
    ) {
        super(model, eventEmitter);
    }

    protected toDomain(document: ConnectionDocument): ConnectionAggregate {
        return ConnectionPersistenceMapper.toDomain(document);
    }

    protected toPersistence(entity: ConnectionAggregate): Record<string, unknown> {
        return ConnectionPersistenceMapper.toPersistence(entity);
    }

    async findExistingInteraction(userIdA: string, userIdB: string): Promise<ConnectionAggregate | null> {
        const doc = await this._model.findOne({
            $or: [
                { requesterId: userIdA, recipientId: userIdB },
                { requesterId: userIdB, recipientId: userIdA }
            ],
            status: { $in: [ConnectionStatus.PENDING, ConnectionStatus.ACCEPTED] }
        }).exec();

        if (!doc) return null;
        return this.toDomain(doc as unknown as ConnectionDocument);
    }

    async findPendingRequest(requesterId: string, recipientId: string): Promise<ConnectionAggregate | null> {
        const doc = await this._model.findOne({
            requesterId,
            recipientId,
            status: ConnectionStatus.PENDING
        }).exec();

        if (!doc) return null;
        return this.toDomain(doc as unknown as ConnectionDocument);
    }

    async getPaginatedByStatus(filters: GetConnectionsFilters): Promise<PaginatedConnectionsResult> {
        const { userId, statuses, page, limit, role } = filters;
        const skip = (page - 1) * limit;
        const query: Record<string, unknown> = { status: { $in: statuses } };

        if (role === ConnectionRole.REQUESTER) {
            query.requesterId = userId;
        } else if (role === ConnectionRole.RECIPIENT) {
            query.recipientId = userId;
        } else {
            query.$or = [{ requesterId: userId }, { recipientId: userId }];
        }

        const [documents, total] = await Promise.all([
            this._model.find(query).sort({ updatedAt: -1 }).skip(skip).limit(limit).exec(),
            this._model.countDocuments(query).exec()
        ]);

        return {
            data: documents.map(doc => this.toDomain(doc as unknown as ConnectionDocument)),
            total
        };
    }

    async findInteractedUserIds(userId: string): Promise<string[]> {
        const docs = await this._model.find(
            {
                $or: [{ requesterId: userId }, { recipientId: userId }],
                status: { $in: [ConnectionStatus.PENDING, ConnectionStatus.ACCEPTED] }
            },
            { requesterId: 1, recipientId: 1 }
        ).lean().exec();

        const partnerIds = new Set<string>();
        for (const doc of docs) {
            const docObj = doc as { requesterId?: string; recipientId?: string };
            if (docObj.requesterId && docObj.requesterId !== userId) {
                partnerIds.add(docObj.requesterId);
            }
            if (docObj.recipientId && docObj.recipientId !== userId) {
                partnerIds.add(docObj.recipientId);
            }
        }
        return Array.from(partnerIds);
    }
}