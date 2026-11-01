import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { BaseMongoRepository } from "../../../../shared/infrastructure/persistence/base-mongo.repository";
import { PriorityIntroAggregate } from "../../domain/entities/priority-intro.entity";
import { PriorityIntroDocument, PriorityIntroSchemaClass } from "./priority-intro.schema";
import { IPriorityIntroRepository } from "../../domain/interfaces/priority-intro-repository.interface";
import { PriorityIntroPersistenceMapper } from "./mappers/priority-intro-persistence.mapper";

@Injectable()
export class MongoPriorityIntroRepository extends BaseMongoRepository<PriorityIntroAggregate, PriorityIntroDocument> implements IPriorityIntroRepository {
    constructor(
        @InjectModel(PriorityIntroSchemaClass.name) model: Model<PriorityIntroDocument>,
        eventEmitter: EventEmitter2
    ) {
        super(model, eventEmitter);
    }

    protected toDomain(document: PriorityIntroDocument): PriorityIntroAggregate {
        return PriorityIntroPersistenceMapper.toDomain(document);
    }

    protected toPersistence(entity: PriorityIntroAggregate): Record<string, unknown> {
        return PriorityIntroPersistenceMapper.toPersistence(entity);
    }

    async findBySenderId(senderId: string): Promise<PriorityIntroAggregate[]> {
        const documents = await this._model.find({ senderId }).sort({ createdAt: -1 }).exec();
        return documents.map(doc => this.toDomain(doc as unknown as PriorityIntroDocument));
    }

    async findByRecipientId(recipientId: string): Promise<PriorityIntroAggregate[]> {
        const documents = await this._model.find({ recipientId }).sort({ createdAt: -1 }).exec();
        return documents.map(doc => this.toDomain(doc as unknown as PriorityIntroDocument));
    }

    async findInteractedUserIds(userId: string): Promise<string[]> {
        const docs = await this._model.find(
            { $or: [{ senderId: userId }, { recipientId: userId }] },
            { senderId: 1, recipientId: 1 }
        ).lean().exec();

        const partnerIds = new Set<string>();
        for (const doc of docs) {
            const docObj = doc as { senderId?: string; recipientId?: string };
            if (docObj.senderId && docObj.senderId !== userId) {
                partnerIds.add(docObj.senderId);
            }
            if (docObj.recipientId && docObj.recipientId !== userId) {
                partnerIds.add(docObj.recipientId);
            }
        }
        return Array.from(partnerIds);
    }
}