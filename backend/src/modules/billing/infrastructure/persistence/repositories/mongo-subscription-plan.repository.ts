import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ErrorCode } from '../../../../../shared/domain/enums/error-code.enum';
import { DomainException } from '../../../../../shared/domain/exceptions/domain.exception';
import { BILLING_ERROR_MESSAGES } from '../../../domain/constants/billing-error-messages.constants';
import { SubscriptionPlan } from '../../../domain/entities/subscription-plan.entity';
import { BillingPeriod } from '../../../domain/enums/billing.enums';
import { ISubscriptionPlanRepository } from '../../../domain/interfaces/subscription-plan-repository.interface';
import { SubscriptionPlanPersistenceMapper } from '../mappers/subscription-plan-persistence.mapper';
import { SubscriptionPlanDocument, SubscriptionPlanSchemaClass } from '../schemas/subscription-plan.schema';

@Injectable()
export class SubscriptionPlanRepository implements ISubscriptionPlanRepository {
    constructor(
        @InjectModel(SubscriptionPlanSchemaClass.name) private readonly _model: Model<SubscriptionPlanDocument>,
    ) { }

    async findById(id: string): Promise<SubscriptionPlan | null> {
        const document = await this._model.findById(id).exec();
        if (!document) return null;
        return SubscriptionPlanPersistenceMapper.toDomain(document);
    }

    async findByCode(code: string): Promise<SubscriptionPlan | null> {
        const document = await this._model.findOne({ code: code.trim().toUpperCase() }).exec();
        if (!document) return null;
        return SubscriptionPlanPersistenceMapper.toDomain(document);
    }

    async findByNormalizedName(normalizedName: string, billingPeriod: BillingPeriod): Promise<SubscriptionPlan | null> {
        const document = await this._model.findOne({
            normalizedName: normalizedName.trim().toUpperCase(),
            billingPeriod,
        }).exec();
        if (!document) return null;
        return SubscriptionPlanPersistenceMapper.toDomain(document);
    }

    async findActive(): Promise<SubscriptionPlan[]> {
        const documents = await this._model
            .find({ isActive: true })
            .sort({ sortOrder: 1, createdAt: 1 })
            .exec();

        return SubscriptionPlanPersistenceMapper.toDomainList(documents);
    }

    async findAll(): Promise<SubscriptionPlan[]> {
        const documents = await this._model
            .find()
            .sort({ sortOrder: 1, createdAt: 1 })
            .exec();

        return SubscriptionPlanPersistenceMapper.toDomainList(documents);
    }

    async create(plan: SubscriptionPlan): Promise<SubscriptionPlan> {
        const persistenceData = SubscriptionPlanPersistenceMapper.toPersistence(plan);
        const created = new this._model(persistenceData);
        const saved = await created.save();
        return SubscriptionPlanPersistenceMapper.toDomain(saved);
    }

    async update(plan: SubscriptionPlan): Promise<SubscriptionPlan> {
        const persistenceData = SubscriptionPlanPersistenceMapper.toPersistence(plan);
        const updated = await this._model
            .findByIdAndUpdate(plan.id, persistenceData, { returnDocument: 'after' })
            .exec();

        if (!updated) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, BILLING_ERROR_MESSAGES.PLAN_NOT_FOUND);
        }

        return SubscriptionPlanPersistenceMapper.toDomain(updated);
    }

    async count(): Promise<number> {
        return this._model.countDocuments().exec();
    }
}
