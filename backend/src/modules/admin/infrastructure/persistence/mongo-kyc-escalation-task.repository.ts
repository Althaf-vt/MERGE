import { Injectable } from "@nestjs/common";
import { BaseRepository } from "../../../../shared/infrastructure/persistence/base-mongo.repository";
import { KycEscalationTask } from "../../domain/entities/kyc-escalation-task.entity";
import { KycEscalationTaskDocument, KycEscalationTaskSchemaClass } from "./kyc-escalation-task.schema";
import { GetKycTasksFilters, IKycEscalationTaskRepository, PaginatedKycTaskResult } from "../../domain/interfaces/kyc-escalation-task-repository.interface";
import { KycTaskStatus } from "../../domain/enums/kyc-task-status.enum";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { KycTaskPersistenceMapper } from "./mappers/kyc-task-persistence.mapper";

@Injectable()
export class KycEscalationTaskRepository extends BaseRepository<KycEscalationTask, KycEscalationTaskDocument> implements IKycEscalationTaskRepository {
    constructor(
        @InjectModel(KycEscalationTaskSchemaClass.name) model: Model<KycEscalationTaskDocument>,
        eventEmitter: EventEmitter2
    ) {
        super(model, eventEmitter);
    }

    protected toDomain(document: KycEscalationTaskDocument): KycEscalationTask {
        return KycTaskPersistenceMapper.toDomain(document);
    }

    protected toPersistence(entity: KycEscalationTask): Record<string, unknown> {
        return KycTaskPersistenceMapper.toPersistence(entity);
    }

    async findAllPaginated(filters: GetKycTasksFilters): Promise<PaginatedKycTaskResult> {
        const skip = (filters.page - 1) * filters.limit;
        const query: Record<string, unknown> = {};

        if (filters.status) query.taskStatus = filters.status;
        if (filters.claimStatus) query['claimDetails.status'] = filters.claimStatus;
        if (filters.claimedBy) query['claimDetails.claimedBy'] = filters.claimedBy;

        const [documents, total] = await Promise.all([
            this._model.find(query).skip(skip).limit(filters.limit).exec(),
            this._model.countDocuments(query).exec()
        ]);

        return {
            data: KycTaskPersistenceMapper.toDomainList(documents as unknown as KycEscalationTaskDocument[]),
            total,
            page: filters.page,
            limit: filters.limit
        };
    }

    async existsForUser(targetUserId: string): Promise<boolean> {
        const count = await this._model.countDocuments({ targetUserId }).exec();
        return count > 0;
    }

    async existsActiveForUser(targetUserId: string): Promise<boolean> {
        const count = await this._model.countDocuments({
            targetUserId,
            taskStatus: KycTaskStatus.PENDING,
        }).exec();
        return count > 0;
    }
}
