import { BillingPeriod, Currency, SubscriptionEntitlement } from '../../domain/enums/billing.enums';

export interface PlanPriceResponseDto {
    amount: number;
    currency: Currency;
    formatted: string;
}

export interface PlanOfferResponseDto {
    code: string;
    discountPercentage: number;
    validFrom: Date;
    validUntil: Date;
    isActive: boolean;
}

export interface SubscriptionPlanResponseDto {
    id: string;
    name: string;
    code: string;
    billingPeriod: BillingPeriod;
    price: PlanPriceResponseDto;
    effectivePrice: PlanPriceResponseDto;
    entitlements: SubscriptionEntitlement[];
    offers: PlanOfferResponseDto[];
    sortOrder: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface PaginatedSubscriptionPlansResponseDto {
    items: SubscriptionPlanResponseDto[];
    total: number;
}
