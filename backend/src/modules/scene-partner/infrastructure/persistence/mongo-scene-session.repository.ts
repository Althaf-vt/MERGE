import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { isValidObjectId, Model } from "mongoose";
import { BaseRepository } from "../../../../shared/infrastructure/persistence/base-mongo.repository";
import { SceneSession } from "../../domain/entities/scene-session.entity";
import { SceneSessionStatus } from "../../domain/enums/scene-partner.enums";
import { AdminSessionsFilter, ISceneSessionRepository, PaginatedSceneSessionsResult } from "../../domain/interfaces/scene-session-repository.interface";
import { SceneSessionDocument, SceneSessionSchemaClass } from "./scene-session.schema";
import { SceneSessionPersistenceMapper } from "./mappers/scene-session-persistence.mapper";

@Injectable()
export class MongoSceneSessionRepository extends BaseRepository<SceneSession, SceneSessionDocument> implements ISceneSessionRepository {
    constructor(
        @InjectModel(SceneSessionSchemaClass.name) model: Model<SceneSessionDocument>,
        eventEmitter: EventEmitter2,
    ) {
        super(model, eventEmitter);
    }

    protected toDomain(document: SceneSessionDocument): SceneSession {
        return SceneSessionPersistenceMapper.toDomain(document);
    }

    protected toPersistence(entity: SceneSession): Record<string, unknown> {
        return SceneSessionPersistenceMapper.toPersistence(entity);
    }

    async findActiveByUserId(userId: string): Promise<SceneSession | null> {
        const document = await this._model
            .findOne({
                userId,
                status: {
                    $in: [
                        SceneSessionStatus.INITIALIZING,
                        SceneSessionStatus.IN_PROGRESS,
                        SceneSessionStatus.PAUSED,
                    ],
                },
            })
            .exec();

        if (!document) return null;
        return this.toDomain(document as SceneSessionDocument);
    }

    async findAllByUserId(userId: string, limit: number = 20, skip: number = 0): Promise<PaginatedSceneSessionsResult> {
        const safeLimit = Math.max(1, limit);
        const safeSkip = Math.max(0, skip);

        const [documents, total] = await Promise.all([
            this._model
                .find({ userId })
                .sort({ createdAt: -1 })
                .skip(safeSkip)
                .limit(safeLimit)
                .exec(),
            this._model.countDocuments({ userId }).exec(),
        ]);

        return {
            data: documents.map((doc) => this.toDomain(doc as SceneSessionDocument)),
            total,
        };
    }

    async findAdminSessions(filter: AdminSessionsFilter): Promise<PaginatedSceneSessionsResult> {
        const query: Record<string, unknown> = {};

        if (filter.userId && filter.userId.trim().length > 0) {
            query.userId = filter.userId.trim();
        }

        if (filter.scenarioId && filter.scenarioId.trim().length > 0) {
            query.scenarioId = filter.scenarioId.trim();
        }

        if (filter.simulationType) {
            query.simulationType = filter.simulationType;
        }

        if (filter.status) {
            query.status = filter.status;
        }

        if (filter.startDate || filter.endDate) {
            const dateQuery: Record<string, Date> = {};
            if (filter.startDate) {
                dateQuery.$gte = filter.startDate;
            }
            if (filter.endDate) {
                dateQuery.$lte = filter.endDate;
            }
            query.createdAt = dateQuery;
        }

        const safeLimit = Math.max(1, filter.limit ?? 20);
        const safeSkip = Math.max(0, filter.skip ?? 0);

        const [documents, total] = await Promise.all([
            this._model
                .find(query)
                .sort({ createdAt: -1 })
                .skip(safeSkip)
                .limit(safeLimit)
                .exec(),
            this._model.countDocuments(query).exec(),
        ]);

        return {
            data: documents.map((doc) => this.toDomain(doc as SceneSessionDocument)),
            total,
        };
    }

    async deleteById(id: string, userId: string): Promise<boolean> {
        if (!isValidObjectId(id)) {
            return false;
        }

        const result = await this._model.deleteOne({ _id: id, userId }).exec();
        return (result.deletedCount ?? 0) > 0;
    }
}
