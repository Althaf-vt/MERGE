export const ADMIN_BILLING_TABS = {
    OVERVIEW: 'OVERVIEW',
    PLANS: 'PLANS',
    CREDITS: 'CREDITS',
    HISTORY: 'HISTORY',
} as const;

export type AdminBillingTab = (typeof ADMIN_BILLING_TABS)[keyof typeof ADMIN_BILLING_TABS];

export const ADMIN_BILLING_TAB_CONFIG = [
    {
        key: ADMIN_BILLING_TABS.OVERVIEW,
        label: 'Overview',
        description: 'Global platform monetization metrics and revenue performance',
    },
    {
        key: ADMIN_BILLING_TABS.PLANS,
        label: 'Subscription Plans',
        description: 'Commercial plan tiers, pricing intervals, and promotional offers',
    },
    {
        key: ADMIN_BILLING_TABS.CREDITS,
        label: 'Priority Credits',
        description: 'Credit pack catalog, pricing configurations, and store listings',
    },
    {
        key: ADMIN_BILLING_TABS.HISTORY,
        label: 'Billing History',
        description: 'Complete financial transaction audit ledger and payment records',
    },
] as const;

export const SUBSCRIPTION_ENTITLEMENT_OPTIONS = [
    {
        key: 'SCENE_PARTNER_ACCESS',
        label: 'Scene Partner Access',
        description: 'Unlimited AI dating rehearsal simulations with adaptive behavioral coaching',
    },
    {
        key: 'LUMEN_HIGH_QUOTA',
        label: 'Lumen High Quota',
        description: 'High quota of curated compatibility recommendations and discovery insights',
    },
    {
        key: 'ADVANCED_DISCOVERY_FILTERS',
        label: 'Advanced Discovery Filters',
        description: 'Access to deep compatibility filters (lifestyle, values, medical, etc.)',
    },
] as const;

export const BILLING_PERIOD_OPTIONS = [
    { value: 'MONTHLY', label: 'Monthly (1 Month)' },
    { value: 'QUARTERLY', label: 'Quarterly (3 Months)' },
    { value: 'ANNUAL', label: 'Annual (12 Months)' },
] as const;

export type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'accent' | 'muted';

export const TRANSACTION_TYPE_CONFIG: Record<
    string,
    { label: string; color: string; badgeVariant: BadgeVariant; isCreditDelta: boolean }
> = {
    SUBSCRIPTION_PURCHASE: {
        label: 'Subscription Purchase',
        color: '#a855f7',
        badgeVariant: 'accent',
        isCreditDelta: false,
    },
    SUBSCRIPTION_RENEWAL: {
        label: 'Subscription Renewal',
        color: '#8b5cf6',
        badgeVariant: 'accent',
        isCreditDelta: false,
    },
    CREDIT_PURCHASE: {
        label: 'Credit Pack Purchase',
        color: '#10b981',
        badgeVariant: 'success',
        isCreditDelta: true,
    },
    CREDIT_SPENT: {
        label: 'Credit Consumed',
        color: '#f59e0b',
        badgeVariant: 'warning',
        isCreditDelta: true,
    },
    REFUND: {
        label: 'Refund Issued',
        color: '#ef4444',
        badgeVariant: 'danger',
        isCreditDelta: false,
    },
};

export const TRANSACTION_STATUS_CONFIG: Record<
    string,
    { label: string; badgeVariant: BadgeVariant }
> = {
    COMPLETED: {
        label: 'COMPLETED',
        badgeVariant: 'success',
    },
    PENDING: {
        label: 'PENDING',
        badgeVariant: 'warning',
    },
    FAILED: {
        label: 'FAILED',
        badgeVariant: 'danger',
    },
};

export const PAYMENT_ENVIRONMENT_CONFIG: Record<
    string,
    { label: string; badgeVariant: BadgeVariant }
> = {
    LIVE: {
        label: 'LIVE',
        badgeVariant: 'default',
    },
    TEST: {
        label: 'TEST',
        badgeVariant: 'warning',
    },
};

export const TRANSACTION_TYPE_FILTER_OPTIONS = [
    { value: '', label: 'ALL TYPES' },
    { value: 'SUBSCRIPTION_PURCHASE', label: 'Subscription Purchase' },
    { value: 'SUBSCRIPTION_RENEWAL', label: 'Subscription Renewal' },
    { value: 'CREDIT_PURCHASE', label: 'Credit Pack Purchase' },
    { value: 'CREDIT_SPENT', label: 'Credit Consumed' },
    { value: 'REFUND', label: 'Refund Issued' },
] as const;

export const TRANSACTION_STATUS_FILTER_OPTIONS = [
    { value: '', label: 'ALL STATUSES' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'FAILED', label: 'Failed' },
] as const;

export const ADMIN_BILLING_PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_PAGE_LIMIT: 10,
    PAGE_LIMIT_OPTIONS: [10, 20, 50, 100],
} as const;

export const PLAN_FORM_LIMITS = {
    NAME_MIN: 2,
    NAME_MAX: 50,
    CODE_MIN: 2,
    CODE_MAX: 30,
    MIN_PRICE: 0,
    MAX_PRICE: 1000000,
} as const;

export const CREDIT_PACK_FORM_LIMITS = {
    NAME_MIN: 2,
    NAME_MAX: 50,
    CODE_MIN: 2,
    CODE_MAX: 30,
    MIN_CREDITS: 1,
    MAX_CREDITS: 10000,
    MIN_PRICE: 1,
    MAX_PRICE: 1000000,
} as const;

export const OFFER_FORM_LIMITS = {
    CODE_MIN: 2,
    CODE_MAX: 20,
    MIN_DISCOUNT: 1,
    MAX_DISCOUNT: 100,
} as const;
