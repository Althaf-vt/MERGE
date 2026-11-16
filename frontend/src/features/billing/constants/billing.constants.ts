export const BILLING_ROUTES = {
    HUB: '/profile/billing',
    MANAGE: '/profile/billing/manage',
    HISTORY: '/profile/billing/history',
    CREDIT_HISTORY: '/profile/billing/credits/history',
} as const;

export const RAZORPAY_CONFIG = {
    SCRIPT_URL: 'https://checkout.razorpay.com/v1/checkout.js',
    THEME_COLOR: '#7C3AED',
    CURRENCY: 'INR',
    MERCHANT_NAME: 'MERGE Inclusive',
    DESCRIPTION_PREFIX: 'MERGE Payment',
} as const;

export const BILLING_PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_PAGE_SIZE: 10,
    PAGE_SIZE_OPTIONS: [5, 10, 20, 50],
} as const;

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'muted';

export const SUBSCRIPTION_STATUS_CONFIG: Record<string, { label: string; variant: BadgeVariant; description: string }> = {
    ACTIVE: {
        label: 'Active',
        variant: 'success',
        description: 'Your membership is active with full access to all premium features.',
    },
    TRIALING: {
        label: 'Trial',
        variant: 'info',
        description: 'You are currently on an introductory trial period.',
    },
    PAST_DUE: {
        label: 'Past Due',
        variant: 'danger',
        description: 'Payment renewal was unsuccessful. Please update your payment method.',
    },
    CANCELED: {
        label: 'Cancelling',
        variant: 'warning',
        description: 'Auto-renewal is paused. Your access remains active until the end of the current period.',
    },
    EXPIRED: {
        label: 'Expired',
        variant: 'muted',
        description: 'Your subscription has ended. Upgrade anytime to restore premium features.',
    },
    INACTIVE: {
        label: 'Free',
        variant: 'muted',
        description: 'You are currently on the Free tier.',
    },
};

export const ENTITLEMENT_DETAILS: Record<string, { title: string; description: string; icon: string }> = {
    SCENE_PARTNER_ACCESS: {
        title: 'Scene Partner Access',
        description: 'Unlimited AI dating rehearsal simulations with adaptive behavioral coaching.',
        icon: 'theater-masks',
    },
    LUMEN_RECOMMENDATIONS_HIGH_QUOTA: {
        title: '5 Daily Recommendations',
        description: 'Receive up to 5 curated, high-compatibility profile recommendations each day.',
        icon: 'sparkles',
    },
    ADVANCED_DISCOVERY_FILTERS: {
        title: 'Deep Compatibility Filters',
        description: 'Filter matches by lifestyle habits, dietary preferences, education, and adoption views.',
        icon: 'sliders',
    },
    UNLIMITED_MESSAGES: {
        title: 'Priority Messaging',
        description: 'Direct messaging and priority placement in member discovery queues.',
        icon: 'message-circle',
    },
};

export const TRANSACTION_TYPE_CONFIG: Record<string, { label: string; isCredit: boolean; isCreditAddition?: boolean }> = {
    SUBSCRIPTION_PURCHASE: {
        label: 'Subscription Purchase',
        isCredit: false,
    },
    SUBSCRIPTION_RENEWAL: {
        label: 'Subscription Renewal',
        isCredit: false,
    },
    CREDIT_PURCHASE: {
        label: 'Credits Purchased',
        isCredit: true,
        isCreditAddition: true,
    },
    CREDIT_SPENT: {
        label: 'Priority Introduction',
        isCredit: true,
        isCreditAddition: false,
    },
    REFUND: {
        label: 'Payment Refund',
        isCredit: false,
    },
};

export const TRANSACTION_STATUS_CONFIG: Record<string, { label: string; variant: BadgeVariant }> = {
    COMPLETED: {
        label: 'Paid',
        variant: 'success',
    },
    PENDING: {
        label: 'Pending',
        variant: 'warning',
    },
    FAILED: {
        label: 'Failed',
        variant: 'danger',
    },
};

export const BILLING_UI_TEXT = {
    HUB_TITLE: 'Subscription & Credits',
    HUB_SUBTITLE: 'Manage your current plan, auto-renewal preferences, and platform action credits.',
    MANAGE_TITLE: 'Manage Subscription',
    MANAGE_SUBTITLE: 'View and manage your MERGE Premium subscription and billing settings.',
    BILLING_HISTORY_TITLE: 'Billing History',
    BILLING_HISTORY_SUBTITLE: 'View your subscription payments, credit purchases, and transaction receipts.',
    CREDIT_HISTORY_TITLE: 'Credit History',
    CREDIT_HISTORY_SUBTITLE: 'View how your credits were purchased and spent across MERGE.',
    BUY_CREDITS_TITLE: 'Buy Credits',
    BUY_CREDITS_SUBTITLE: 'Bypass the algorithmic queue with Priority Introductions directly to inboxes.',
    PROMO_BANNER_TEXT: 'Need more credits? Grab a credit pack to unlock more meaningful introductions.',
    CANCEL_WARNING: 'If you cancel, your Premium benefits will remain fully available until the end of your current billing period. Auto-renewal will be turned off and no further charges will occur.',
    AUTO_RENEW_ENABLED_TEXT: (renewalDate: string) => `Your subscription will automatically renew on ${renewalDate}.`,
    AUTO_RENEW_DISABLED_TEXT: (expiryDate: string) => `Auto-renewal is paused. Your access remains active until ${expiryDate}.`,
} as const;
