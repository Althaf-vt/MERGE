import { SubscriptionEntitlement, SubscriptionStatus } from '../enums/billing.enums';

export interface SubscribeUserParams {
    id: string;
    userId: string;
    planId: string;
    entitlements: SubscriptionEntitlement[];
    periodStart: Date;
    periodEnd: Date;
    autoRenew?: boolean;
    paymentMethodRef?: string | null;
}

export interface RenewSubscriptionParams {
    newPeriodEnd: Date;
    paymentMethodRef?: string | null;
}

export interface SwitchPlanParams {
    newPlanId: string;
    newPeriodEnd: Date;
    newEntitlements: SubscriptionEntitlement[];
    paymentMethodRef?: string | null;
}

export interface UserSubscriptionProps {
    id: string;
    userId: string;
    planId: string;
    status: SubscriptionStatus;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    autoRenew?: boolean;
    canceledAt?: Date | null;
    cancelReason?: string | null;
    paymentMethodRef?: string | null;
    entitlements: SubscriptionEntitlement[];
    createdAt?: Date;
    updatedAt?: Date;
}

export interface UserSubscriptionData {
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
    createdAt: Date;
    updatedAt: Date;
}

export interface UserSubscriptionSnapshot {
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
    createdAt: Date;
    updatedAt: Date;
}
