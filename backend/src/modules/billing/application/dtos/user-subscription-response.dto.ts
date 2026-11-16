import { SubscriptionEntitlement, SubscriptionStatus } from '../../domain/enums/billing.enums';

export interface UserSubscriptionResponseDto {
    id: string;
    userId: string;
    planId: string;
    status: SubscriptionStatus;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    autoRenew: boolean;
    canceledAt: Date | null;
    cancelReason: string | null;
    paymentMethodRef: string | null;
    entitlements: SubscriptionEntitlement[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
