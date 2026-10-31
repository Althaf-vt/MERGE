import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { BaseMongoRepository } from "../../../../shared/infrastructure/persistence/base-mongo.repository";
import { PrivateListAggregate } from "../../domain/entities/private-list.entity";
import { PrivateListDocument, PrivateListSchemaClass } from "./private-list.schema";
import { IPrivateListRepository } from "../../domain/interfaces/private-list-repository.interface";
import { PrivateListPersistenceMapper } from "./mappers/private-list-persistence.mapper";
import { PrivateListType } from "../../domain/enums/private-list.enums";


@Injectable()
export class PrivateListRepository extends BaseMongoRepository<PrivateListAggregate, PrivateListDocument> implements IPrivateListRepository {
    constructor(
        @InjectModel(PrivateListSchemaClass.name) model: Model<PrivateListDocument>,
        eventEmitter: EventEmitter2
    ) {
        super(model, eventEmitter);
    }

    protected toDomain(document: PrivateListDocument): PrivateListAggregate {
        return PrivateListPersistenceMapper.toDomain(document);
    }

    protected toPersistence(entity: PrivateListAggregate): Record<string, unknown> {
        return PrivateListPersistenceMapper.toPersistence(entity);
    }

    async findExact(userId: string, targetUserId: string): Promise<PrivateListAggregate | null> {
        const doc = await this._model.findOne({ userId, targetUserId }).exec();

        if (!doc) return null;
        return this.toDomain(doc as unknown as PrivateListDocument);
    }

    async getPaginatedList(userId: string, listType: PrivateListType, page: number, limit: number): Promise<{ data: PrivateListAggregate[]; total: number }> {
        const skip = (page - 1) * limit;
        const query: Record<string, unknown> = { userId, listType };

        const [documents, total] = await Promise.all([
            this._model.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
            this._model.countDocuments(query).exec()
        ]);

        return {
            data: documents.map(doc => this.toDomain(doc as unknown as PrivateListDocument)),
            total
        };
    }

    async deleteExact(userId: string, targetUserId: string): Promise<void> {
        await this._model.deleteOne({ userId, targetUserId }).exec();
    }
}