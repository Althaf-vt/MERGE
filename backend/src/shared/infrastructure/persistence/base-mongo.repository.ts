import { Document, Model } from "mongoose";
import { IBaseRepository } from "../../../modules/users/domain/interfaces/base-repository.interface";

export abstract class BaseMongoRepository<TAggregate, TDocument extends Document> implements IBaseRepository<TAggregate> {
    
    constructor(protected readonly _model: Model<TDocument>) {}

    // Abstract methods force child classes to define how to map their specific entities
    protected abstract toDomain(document: TDocument): TAggregate;
    protected abstract toPersistence(entity: TAggregate): any;

    async findById(id: string): Promise<TAggregate | null> {
        const document = await this._model.findById(id).exec();
        if (!document) return null;
        return this.toDomain(document as TDocument);
    }

    async create(entity: TAggregate): Promise<TAggregate> {
        const persistenceData = this.toPersistence(entity);
        const created = new this._model(persistenceData);
        const document = await created.save();
        return this.toDomain(document as TDocument);
    }

    async update(entity: TAggregate): Promise<TAggregate> {
        const persistenceData = this.toPersistence(entity);
        
        // Assumes your Domain Aggregate has an 'id' getter. 
        // Cast to any to bypass strict typing on the generic T for the ID field.
        const document = await this._model
            .findByIdAndUpdate((entity as any).id, persistenceData, { returnDocument: 'after' })
            .exec();

        if (!document) throw new Error("Entity not found");
        return this.toDomain(document as TDocument);
    }
}