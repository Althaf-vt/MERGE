import { BillingPeriod, Currency, SubscriptionEntitlement } from '../enums/billing.enums';
import { CreateCreditPackProps } from '../interfaces/credit-pack.types';
import { CreateSubscriptionPlanProps } from '../interfaces/subscription-plan.types';
import { BILLING_ID_PREFIXES, generateBillingId } from './billing.constants';

export const createDefaultSubscriptionPlans = (): CreateSubscriptionPlanProps[] => [
    {
        id: generateBillingId(BILLING_ID_PREFIXES.PLAN),
        name: 'Monthly Premium',
        code: 'PLAN_MONTHLY',
        billingPeriod: BillingPeriod.MONTHLY,
        price: {
            amount: 499,
            currency: Currency.INR,
        },
        entitlements: [
            SubscriptionEntitlement.SCENE_PARTNER_ACCESS,
            SubscriptionEntitlement.LUMEN_HIGH_QUOTA,
            SubscriptionEntitlement.ADVANCED_DISCOVERY_FILTERS,
        ],
        offers: [],
        sortOrder: 1,
        isActive: true,
    },
    {
        id: generateBillingId(BILLING_ID_PREFIXES.PLAN),
        name: 'Quarterly Premium',
        code: 'PLAN_QUARTERLY',
        billingPeriod: BillingPeriod.QUARTERLY,
        price: {
            amount: 1299,
            currency: Currency.INR,
        },
        entitlements: [
            SubscriptionEntitlement.SCENE_PARTNER_ACCESS,
            SubscriptionEntitlement.LUMEN_HIGH_QUOTA,
            SubscriptionEntitlement.ADVANCED_DISCOVERY_FILTERS,
        ],
        offers: [],
        sortOrder: 2,
        isActive: true,
    },
    {
        id: generateBillingId(BILLING_ID_PREFIXES.PLAN),
        name: 'Annual VIP',
        code: 'PLAN_ANNUAL',
        billingPeriod: BillingPeriod.ANNUAL,
        price: {
            amount: 3899,
            currency: Currency.INR,
        },
        entitlements: [
            SubscriptionEntitlement.SCENE_PARTNER_ACCESS,
            SubscriptionEntitlement.LUMEN_HIGH_QUOTA,
            SubscriptionEntitlement.ADVANCED_DISCOVERY_FILTERS,
        ],
        offers: [],
        sortOrder: 3,
        isActive: true,
    },
];

export const createDefaultCreditPacks = (): CreateCreditPackProps[] => [
    {
        id: generateBillingId(BILLING_ID_PREFIXES.CREDIT_PACK),
        name: 'Starter Pack',
        code: 'PACK_5',
        creditsCount: 5,
        price: {
            amount: 199,
            currency: Currency.INR,
        },
        offers: [],
        badge: null,
        sortOrder: 1,
        isListed: true,
        isActive: true,
    },
    {
        id: generateBillingId(BILLING_ID_PREFIXES.CREDIT_PACK),
        name: 'Standard Pack',
        code: 'PACK_15',
        creditsCount: 15,
        price: {
            amount: 499,
            currency: Currency.INR,
        },
        offers: [],
        badge: 'POPULAR',
        sortOrder: 2,
        isListed: true,
        isActive: true,
    },
    {
        id: generateBillingId(BILLING_ID_PREFIXES.CREDIT_PACK),
        name: 'Power Pack',
        code: 'PACK_30',
        creditsCount: 30,
        price: {
            amount: 899,
            currency: Currency.INR,
        },
        offers: [],
        badge: 'BEST VALUE',
        sortOrder: 3,
        isListed: true,
        isActive: true,
    },
];
