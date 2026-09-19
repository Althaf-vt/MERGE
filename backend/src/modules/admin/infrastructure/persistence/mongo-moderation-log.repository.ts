import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { ModerationLogDocument, ModerationLogSchemaClass } from "./moderation-log.schema";
import { ModerationLog } from "../../domain/entities/moderation-log.entity";
import { ModerationLogPersistenceMapper } from "./mappers/moderation-log-persistence.mapper";
import { Model } from "mongoose";
import { IModerationLogRepository } from "../../domain/interfaces/moderation-log-repository.interface";

@Injectable()
export class MongoModerationLogRepository implements IModerationLogRepository{
    constructor(
        @InjectModel(ModerationLogSchemaClass.name)
        private readonly _model: Model<ModerationLogDocument>
    ){}

    async save(log: ModerationLog): Promise<void>{
        const persistenceData = ModerationLogPersistenceMapper.toPersistence(log);
        const created = new this._model(persistenceData);
        await created.save();
    }

    async findByUserId(userId: string): Promise<ModerationLog[]>{
        const docs = await this._model.find({targetUserId: userId}).sort({createdAt: -1}).exec();
        return docs.map(doc => ModerationLogPersistenceMapper.toDomain(doc));
    }
}