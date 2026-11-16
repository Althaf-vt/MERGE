import { BillingPeriod, SubscriptionEntitlement } from '../enums/billing.enums';
import { MoneyProps, PlanOfferProps } from './billing-value-objects.types';

export interface CreateSubscriptionPlanProps {
    id: string;
    name: string;
    code: string;
    billingPeriod: BillingPeriod;
    price: MoneyProps;
    entitlements: SubscriptionEntitlement[];
    offers?: PlanOfferProps[];
    sortOrder?: number;
    isActive?: boolean;
}

export interface UpdateSubscriptionPlanProps {
    name: string;
    price: MoneyProps;
    entitlements: SubscriptionEntitlement[];
    offers?: PlanOfferProps[];
    sortOrder?: number;
}

export interface SubscriptionPlanProps {
    id: string;
    name: string;
    code: string;
    billingPeriod: BillingPeriod;
    price: MoneyProps;
    entitlements: SubscriptionEntitlement[];
    offers?: PlanOfferProps[];
    sortOrder?: number;
    isActive?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface SubscriptionPlanData {
    id: string;
    name: string;
    code: string;
    billingPeriod: BillingPeriod;
    price: MoneyProps;
    entitlements: SubscriptionEntitlement[];
    offers: PlanOfferProps[];
    sortOrder: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface SubscriptionPlanSnapshot {
    id: string;
    name: string;
    code: string;
    billingPeriod: BillingPeriod;
    price: MoneyProps;
    entitlements: SubscriptionEntitlement[];
    offers: PlanOfferProps[];
    sortOrder: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
