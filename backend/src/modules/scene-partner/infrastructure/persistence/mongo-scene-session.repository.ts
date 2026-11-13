import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { Model } from "mongoose";
import { BaseRepository } from "../../../../shared/infrastructure/persistence/base-mongo.repository";
import { SceneSession } from "../../domain/entities/scene-session.entity";
import { SceneSessionStatus } from "../../domain/enums/scene-partner.enums";
import { ISceneSessionRepository, PaginatedSceneSessionsResult } from "../../domain/interfaces/scene-session-repository.interface";
import { SceneSessionDocument, SceneSessionSchemaClass } from "./scene-session.schema";
import { SceneSessionPersistenceMapper } from "./mappers/scene-session-persistence.mapper";

@Injectable()
export class MongoSceneSessionRepository
    extends BaseRepository<SceneSession, SceneSessionDocument> implements ISceneSessionRepository {
    constructor(
        @InjectModel(SceneSessionSchemaClass.name)
        model: Model<SceneSessionDocument>,
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
}
