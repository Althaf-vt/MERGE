import { SubscriptionEntitlement, SubscriptionStatus } from '../../../domain/enums/billing.enums';
import { UserSubscription } from '../../../domain/entities/user-subscription.entity';
import { UserSubscriptionDocument } from '../schemas/user-subscription.schema';

export class UserSubscriptionPersistenceMapper {
    public static toDomain(raw: UserSubscriptionDocument): UserSubscription {
        return new UserSubscription({
            id: raw._id ? raw._id.toString() : '',
            userId: raw.userId,
            planId: raw.planId,
            status: raw.status as SubscriptionStatus,
            currentPeriodStart: raw.currentPeriodStart,
            currentPeriodEnd: raw.currentPeriodEnd,
            autoRenew: raw.autoRenew ?? true,
            canceledAt: raw.canceledAt ?? null,
            cancelReason: raw.cancelReason ?? null,
            paymentMethodRef: raw.paymentMethodRef ?? null,
            entitlements: (raw.entitlements ?? []) as SubscriptionEntitlement[],
            createdAt: raw['createdAt'],
            updatedAt: raw['updatedAt'],
        });
    }

    public static toDomainList(rawList: UserSubscriptionDocument[]): UserSubscription[] {
        return rawList.map((raw) => this.toDomain(raw));
    }

    public static toPersistence(entity: UserSubscription): Record<string, unknown> {
        const data = entity.toJSON();
        return {
            _id: data.id,
            userId: data.userId,
            planId: data.planId,
            status: data.status,
            currentPeriodStart: data.currentPeriodStart,
            currentPeriodEnd: data.currentPeriodEnd,
            autoRenew: data.autoRenew,
            canceledAt: data.canceledAt ?? null,
            cancelReason: data.cancelReason ?? null,
            paymentMethodRef: data.paymentMethodRef ?? null,
            entitlements: [...data.entitlements],
        };
    }
}
