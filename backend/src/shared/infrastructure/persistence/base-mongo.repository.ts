import { Document, Model } from "mongoose";
import { IBaseRepository } from "../../domain/interfaces/base-repository.interface";
import { DomainException } from "../../domain/exceptions/domain.exception";
import { ErrorCode } from "../../domain/enums/error-code.enum";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { AggregateRoot } from "../../domain/events/aggregate-root";

export abstract class BaseMongoRepository<TAggregate extends AggregateRoot & { id?: string }, TDocument extends Document> implements IBaseRepository<TAggregate> {

    constructor(
        protected readonly _model: Model<TDocument>,
        protected readonly _eventEmitter: EventEmitter2
    ) { }

    protected abstract toDomain(document: TDocument): TAggregate;
    protected abstract toPersistence(entity: TAggregate): Record<string, unknown>;

    protected async dispatchEvents(entity: TAggregate): Promise<void> {
        const events = entity.domainEvents;
        for (const event of events) {
            await this._eventEmitter.emitAsync(event.eventName, event);
        }
        entity.clearDomainEvents();
    }

    async findById(id: string): Promise<TAggregate | null> {
        const document = await this._model.findById(id).exec();
        if (!document) return null;
        return this.toDomain(document as unknown as TDocument);
    }

    async create(entity: TAggregate): Promise<TAggregate> {
        const persistenceData = this.toPersistence(entity);
        const created = new this._model(persistenceData);
        const document = await created.save();

        await this.dispatchEvents(entity);

        return this.toDomain(document as unknown as TDocument);
    }

    async update(entity: TAggregate): Promise<TAggregate> {
        const persistenceData = this.toPersistence(entity);

        const document = await this._model
            .findByIdAndUpdate(entity.id, persistenceData, { returnDocument: 'after' })
            .exec();

        if (!document) throw new DomainException(ErrorCode.USER_NOT_FOUND, "Entity not found");

        await this.dispatchEvents(entity);

        return this.toDomain(document as unknown as TDocument);
    }
}