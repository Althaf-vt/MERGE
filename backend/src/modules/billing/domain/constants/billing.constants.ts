import { Currency } from '../enums/billing.enums';

export const BILLING_POLICY = {
    DEFAULT_CURRENCY: Currency.INR,
    PRIORITY_INTRO_CREDIT_COST: 1,
    DEFAULT_LUMEN_FREE_QUOTA: 1,
    DEFAULT_LUMEN_PREMIUM_QUOTA: 5,
    MIN_CREDIT_PACK_COUNT: 1,
    MAX_CREDIT_PACK_COUNT: 1000,
    DEFAULT_TRIAL_PERIOD_DAYS: 0,
    DEFAULT_AUTO_RENEWAL_ENABLED: true,
    AUTO_RENEWAL_GRACE_PERIOD_DAYS: 3,
    AUTO_RENEWAL_RETRY_MAX_ATTEMPTS: 3,
    PAGINATION: {
        DEFAULT_PAGE: 1,
        DEFAULT_LIMIT: 20,
        MAX_LIMIT: 100,
    },
} as const;

export const BILLING_KILL_SWITCHES_DEFAULT = {
    PREMIUM_SUBSCRIPTIONS_ENABLED: true,
    PRIORITY_CREDITS_ENABLED: true,
    PREMIUM_PURCHASES_ENABLED: true,
    CREDIT_PURCHASES_ENABLED: true,
    CREDIT_CONSUMPTION_ENABLED: true,
} as const;

export const BILLING_TRANSACTION_DESCRIPTIONS = {
    SUBSCRIPTION_PURCHASE: (planName: string) => `Subscription purchase: ${planName}`,
    CREDIT_PURCHASE: (packName: string, count: number) => `Purchased credit pack: ${packName} (+${count} credits)`,
    PRIORITY_INTRO_SPEND: 'Priority Introduction consumption',
    DEFAULT_CANCEL_REASON: 'User requested cancellation',
} as const;
