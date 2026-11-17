import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ErrorCode } from '../../../../../shared/domain/enums/error-code.enum';
import { DomainException } from '../../../../../shared/domain/exceptions/domain.exception';
import { BILLING_ERROR_MESSAGES } from '../../../domain/constants/billing-error-messages.constants';
import { SubscriptionStatus } from '../../../domain/enums/billing.enums';
import { UserSubscription } from '../../../domain/entities/user-subscription.entity';
import { IUserSubscriptionRepository } from '../../../domain/interfaces/user-subscription-repository.interface';
import { UserSubscriptionPersistenceMapper } from '../mappers/user-subscription-persistence.mapper';
import { UserSubscriptionDocument, UserSubscriptionSchemaClass } from '../schemas/user-subscription.schema';

@Injectable()
export class MongoUserSubscriptionRepository implements IUserSubscriptionRepository {
    constructor(
        @InjectModel(UserSubscriptionSchemaClass.name) private readonly _model: Model<UserSubscriptionDocument>,
    ) { }

    async findById(id: string): Promise<UserSubscription | null> {
        const document = await this._model.findById(id).exec();
        if (!document) return null;
        return UserSubscriptionPersistenceMapper.toDomain(document);
    }

    async findByUserId(userId: string): Promise<UserSubscription | null> {
        const document = await this._model
            .findOne({ userId })
            .sort({ createdAt: -1 })
            .exec();

        if (!document) return null;
        return UserSubscriptionPersistenceMapper.toDomain(document);
    }

    async findActiveByUserId(userId: string): Promise<UserSubscription | null> {
        const document = await this._model
            .findOne({
                userId,
                status: {
                    $in: [
                        SubscriptionStatus.ACTIVE,
                        SubscriptionStatus.TRIALING,
                        SubscriptionStatus.CANCELED,
                    ],
                },
                currentPeriodEnd: { $gt: new Date() },
            })
            .sort({ currentPeriodEnd: -1 })
            .exec();

        if (!document) return null;
        return UserSubscriptionPersistenceMapper.toDomain(document);
    }

    async findSubscriptionsDueForRenewal(cutoffDate: Date): Promise<UserSubscription[]> {
        const documents = await this._model
            .find({
                status: SubscriptionStatus.ACTIVE,
                autoRenew: true,
                currentPeriodEnd: { $lte: cutoffDate },
            })
            .exec();

        return UserSubscriptionPersistenceMapper.toDomainList(documents);
    }

    async findExpiredSubscriptions(now: Date): Promise<UserSubscription[]> {
        const documents = await this._model
            .find({
                status: {
                    $in: [
                        SubscriptionStatus.ACTIVE,
                        SubscriptionStatus.TRIALING,
                        SubscriptionStatus.CANCELED,
                    ],
                },
                currentPeriodEnd: { $lt: now },
            })
            .exec();

        return UserSubscriptionPersistenceMapper.toDomainList(documents);
    }

    async create(subscription: UserSubscription): Promise<UserSubscription> {
        const persistenceData = UserSubscriptionPersistenceMapper.toPersistence(subscription);
        const created = new this._model(persistenceData);
        const saved = await created.save();
        return UserSubscriptionPersistenceMapper.toDomain(saved);
    }

    async update(subscription: UserSubscription): Promise<UserSubscription> {
        const persistenceData = UserSubscriptionPersistenceMapper.toPersistence(subscription);
        const updated = await this._model
            .findByIdAndUpdate(subscription.id, persistenceData, { returnDocument: 'after' })
            .exec();

        if (!updated) {
            throw new DomainException(ErrorCode.VALIDATION_FAILED, BILLING_ERROR_MESSAGES.SUBSCRIPTION_NOT_FOUND);
        }

        return UserSubscriptionPersistenceMapper.toDomain(updated);
    }
}
