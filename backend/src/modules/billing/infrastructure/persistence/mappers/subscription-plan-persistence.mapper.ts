import { BillingPeriod, SubscriptionEntitlement } from '../../../domain/enums/billing.enums';
import { SubscriptionPlan } from '../../../domain/entities/subscription-plan.entity';
import { SubscriptionPlanDocument } from '../schemas/subscription-plan.schema';

export class SubscriptionPlanPersistenceMapper {
    public static toDomain(raw: SubscriptionPlanDocument): SubscriptionPlan {
        return new SubscriptionPlan({
            id: raw._id ? raw._id.toString() : '',
            name: raw.name,
            code: raw.code,
            billingPeriod: raw.billingPeriod as BillingPeriod,
            price: {
                amount: raw.price.amount,
                currency: raw.price.currency,
            },
            entitlements: (raw.entitlements ?? []) as SubscriptionEntitlement[],
            offers: (raw.offers ?? []).map((o) => ({
                code: o.code,
                discountPercentage: o.discountPercentage,
                validFrom: o.validFrom,
                validUntil: o.validUntil,
                isActive: o.isActive,
            })),
            sortOrder: raw.sortOrder ?? 0,
            isActive: raw.isActive ?? true,
            createdAt: raw['createdAt'],
            updatedAt: raw['updatedAt'],
        });
    }

    public static toDomainList(rawList: SubscriptionPlanDocument[]): SubscriptionPlan[] {
        return rawList.map((raw) => this.toDomain(raw));
    }

    public static toPersistence(entity: SubscriptionPlan): Record<string, unknown> {
        const data = entity.toJSON();
        return {
            _id: data.id,
            name: data.name,
            code: data.code,
            billingPeriod: data.billingPeriod,
            price: {
                amount: data.price.amount,
                currency: data.price.currency,
            },
            entitlements: [...data.entitlements],
            offers: data.offers.map((o) => ({
                code: o.code,
                discountPercentage: o.discountPercentage,
                validFrom: o.validFrom,
                validUntil: o.validUntil,
                isActive: o.isActive,
            })),
            sortOrder: data.sortOrder,
            isActive: data.isActive,
        };
    }
}
