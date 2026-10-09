import { Injectable } from "@nestjs/common";
import { BaseMongoRepository } from "../../../../shared/infrastructure/persistence/base-mongo.repository";
import { PhotoVerificationTask } from "../../domain/entities/photo-verification-task.entity";
import { PhotoVerificationTaskDocument, PhotoVerificationTaskSchemaClass } from "./photo-verification-task.schema";
import { GetPhotoTasksFilters, IPhotoVerificationTaskRepository, PaginatedPhotoTasksResult } from "../../domain/interfaces/photo-verification-task-repository.interface";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { PhotoTaskPersistenceMapper } from "./mappers/photo-task-persistence.mapper";

@Injectable()
export class MongoPhotoVerificationTaskRepository extends BaseMongoRepository<PhotoVerificationTask, PhotoVerificationTaskDocument> implements IPhotoVerificationTaskRepository {
    constructor(
        @InjectModel(PhotoVerificationTaskSchemaClass.name) model: Model<PhotoVerificationTaskDocument>,
        eventEmitter: EventEmitter2
    ) {
        super(model, eventEmitter);
    }

    protected toDomain(document: PhotoVerificationTaskDocument): PhotoVerificationTask {
        return PhotoTaskPersistenceMapper.toDomain(document);
    }

    protected toPersistence(entity: PhotoVerificationTask): any {
        return PhotoTaskPersistenceMapper.toPersistence(entity);
    }

    async findAllPaginated(filters: GetPhotoTasksFilters): Promise<PaginatedPhotoTasksResult> {
        const skip = (filters.page - 1) * filters.limit;
        const query: any = {};

        if (filters.status) query.taskStatus = filters.status;
        if (filters.claimStatus) query['claimDetails.status'] = filters.claimStatus;
        if (filters.claimedBy) query['claimDetails.claimedBy'] = filters.claimedBy;

        const [documents, total] = await Promise.all([
            this._model.find(query).skip(skip).limit(filters.limit).exec(),
            this._model.countDocuments(query).exec()
        ]);

        return {
            data: documents.map(doc => this.toDomain(doc as any)),
            total,
            page: filters.page,
            limit: filters.limit
        };
    }

    async existsForPhoto(photoId: string): Promise<boolean> {
        const count = await this._model.countDocuments({ photoId }).exec();
        return count > 0;
    }
}