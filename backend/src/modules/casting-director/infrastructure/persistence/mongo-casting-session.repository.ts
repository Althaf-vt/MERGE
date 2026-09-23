import { Injectable } from "@nestjs/common";
import { BaseMongoRepository } from "../../../../shared/infrastructure/persistence/base-mongo.repository";
import { CastingSession } from "../../domain/entities/casting-session.entity";
import { CastingSessionDocument, CastingSessionSchemaClass } from "./casting-session.schema";
import { ICastingSessionRepository } from "../../domain/interfaces/casting-session-repository.interface";
import { Model } from "mongoose";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { CastingSessionPersistenceMapper } from "./mappers/casting-session-persistence.mapper";
import { InjectModel } from "@nestjs/mongoose";

@Injectable()
export class MongoCastingSessionRepository extends BaseMongoRepository<CastingSession, CastingSessionDocument> implements ICastingSessionRepository{
    constructor(
        @InjectModel(CastingSessionSchemaClass.name) model: Model<CastingSessionDocument>,
        eventEmitter: EventEmitter2
    ){
        super(model, eventEmitter);
    }

    protected toDomain(document: CastingSessionDocument): CastingSession {
        return CastingSessionPersistenceMapper.toDomain(document);
    }

    protected toPersistence(entity: CastingSession) {
        return CastingSessionPersistenceMapper.toPersistence(entity);
    }

    // Custom method to fetch an ongoing interview for a specific user
    async findActiveSessionByUserId(userId: string): Promise<CastingSession | null> {
        const document = await this._model.findOne({
            userId,
            status: { $in: ['IN_PROGRESS', 'ANALYZING'] }
        }).exec();

        if(!document) return null;
        return this.toDomain(document as CastingSessionDocument);
    }
}