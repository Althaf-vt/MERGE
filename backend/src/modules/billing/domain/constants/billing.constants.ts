import { Currency } from '../enums/billing.enums';

export const BILLING_NAME_LIMITS = {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
} as const;

export const BILLING_CATALOG_LIMITS = {
    PLAN_NAME_MIN_LENGTH: 2,
    PLAN_NAME_MAX_LENGTH: 50,
    PLAN_CODE_MIN_LENGTH: 2,
    PLAN_CODE_MAX_LENGTH: 30,
    CREDIT_PACK_NAME_MIN_LENGTH: 2,
    CREDIT_PACK_NAME_MAX_LENGTH: 50,
    CREDIT_PACK_CODE_MIN_LENGTH: 2,
    CREDIT_PACK_CODE_MAX_LENGTH: 30,
} as const;

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
    SUBSCRIPTION_RENEWAL: (planName: string) => `Subscription renewal: ${planName}`,
    CREDIT_PURCHASE: (packName: string, count: number) => `Purchased credit pack: ${packName} (+${count} credits)`,
    PRIORITY_INTRO_SPEND: 'Priority Introduction consumption',
    DEFAULT_CANCEL_REASON: 'User requested cancellation',
} as const;

export const BILLING_ID_PREFIXES = {
    PLAN: 'merge-plan',
    CREDIT_PACK: 'merge-pack',
    SUBSCRIPTION: 'merge-sub',
    CREDIT_ACCOUNT: 'merge-acc',
    TRANSACTION: 'merge-tx',
    OFFER: 'merge-offer',
} as const;

export const generateBillingId = (prefix: string): string => {
    const timestamp = Date.now().toString(36);
    const entropy = Math.random().toString(36).substring(2, 6);
    return `${prefix}-${timestamp}-${entropy}`;
};

export const SUBSCRIPTION_RENEWAL_MESSAGES = {
    PLAN_UNAVAILABLE: 'Subscription plan is inactive or no longer exists.',
    AUTO_RENEW_DISABLED: 'Auto-renewal is disabled; subscription period has expired.',
    NOT_DUE_YET: 'Subscription is active and not yet due for renewal.',
    ALREADY_INACTIVE: 'Subscription is already inactive or expired.',
    UNKNOWN_ERROR: 'An unexpected error occurred during subscription renewal.',
} as const;

export const PAYMENT_MESSAGES = {
    ORDER_CREATED: 'Payment order created successfully.',
    PAYMENT_VERIFIED: 'Payment verified and item successfully activated.',
    PAYMENT_ALREADY_VERIFIED: 'Payment has already been verified and processed.',
} as const;

