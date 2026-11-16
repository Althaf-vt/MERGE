export enum SubscriptionStatus {
    INACTIVE = 'INACTIVE',
    TRIALING = 'TRIALING',
    ACTIVE = 'ACTIVE',
    PAST_DUE = 'PAST_DUE',
    CANCELED = 'CANCELED',
    EXPIRED = 'EXPIRED',
}

export enum BillingPeriod {
    MONTHLY = 'MONTHLY',
    QUARTERLY = 'QUARTERLY',
    ANNUAL = 'ANNUAL',
}

export enum BillingTransactionType {
    SUBSCRIPTION_PURCHASE = 'SUBSCRIPTION_PURCHASE',
    SUBSCRIPTION_RENEWAL = 'SUBSCRIPTION_RENEWAL',
    CREDIT_PURCHASE = 'CREDIT_PURCHASE',
    CREDIT_SPENT = 'CREDIT_SPENT',
    REFUND = 'REFUND',
}

export enum TransactionStatus {
    PENDING = 'PENDING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
}

export enum Currency {
    INR = 'INR',
    USD = 'USD',
}

export enum PaymentGatewayProvider {
    RAZORPAY = 'RAZORPAY',
}

export enum BillingItemType {
    PLAN = 'PLAN',
    CREDIT_PACK = 'CREDIT_PACK',
}

export enum PaymentEnvironment {
    TEST = 'TEST',
    LIVE = 'LIVE',
}

export enum SubscriptionEntitlement {
    SCENE_PARTNER_ACCESS = 'SCENE_PARTNER_ACCESS',
    LUMEN_HIGH_QUOTA = 'LUMEN_HIGH_QUOTA',
    ADVANCED_DISCOVERY_FILTERS = 'ADVANCED_DISCOVERY_FILTERS',
}
