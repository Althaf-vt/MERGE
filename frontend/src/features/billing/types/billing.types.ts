export type SubscriptionStatus =
    | 'INACTIVE'
    | 'TRIALING'
    | 'ACTIVE'
    | 'PAST_DUE'
    | 'CANCELED'
    | 'EXPIRED';

export type BillingPeriod = 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';

export type SubscriptionEntitlement =
    | 'SCENE_PARTNER_ACCESS'
    | 'LUMEN_HIGH_QUOTA'
    | 'LUMEN_RECOMMENDATIONS_HIGH_QUOTA'
    | 'ADVANCED_DISCOVERY_FILTERS'
    | 'UNLIMITED_MESSAGES';

export type BillingTransactionType =
    | 'SUBSCRIPTION_PURCHASE'
    | 'SUBSCRIPTION_RENEWAL'
    | 'CREDIT_PURCHASE'
    | 'CREDIT_SPENT'
    | 'REFUND';

export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

export type Currency = 'INR' | 'USD';

export type BillingItemType = 'PLAN' | 'CREDIT_PACK';

export type PaymentEnvironment = 'TEST' | 'LIVE';

export interface PlanPriceDto {
    amount: number;
    currency: Currency;
    formatted: string;
}

export interface PlanOfferDto {
    code: string;
    discountPercentage: number;
    validFrom: string;
    validUntil: string;
    isActive: boolean;
}

export interface SubscriptionPlanDto {
    id: string;
    name: string;
    code: string;
    billingPeriod: BillingPeriod;
    price: PlanPriceDto;
    effectivePrice: PlanPriceDto;
    entitlements: SubscriptionEntitlement[];
    offers: PlanOfferDto[];
    sortOrder: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface PaginatedSubscriptionPlansDto {
    items: SubscriptionPlanDto[];
    total: number;
}

export interface UserSubscriptionDto {
    id: string;
    userId: string;
    planId: string;
    status: SubscriptionStatus;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    autoRenew: boolean;
    canceledAt: string | null;
    cancelReason: string | null;
    paymentMethodRef: string | null;
    entitlements: SubscriptionEntitlement[];
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreditPackDto {
    id: string;
    name: string;
    code: string;
    creditsCount: number;
    price: PlanPriceDto;
    badge: string | null;
    sortOrder: number;
    isListed: boolean;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface PaginatedCreditPacksDto {
    items: CreditPackDto[];
    total: number;
}

export interface CreditBalanceDto {
    id: string;
    userId: string;
    balance: number;
    updatedAt: string;
}

export interface BillingTransactionAmountDto {
    amount: number;
    currency: Currency;
    formatted: string;
}

export interface BillingTransactionDto {
    id: string;
    userId: string;
    type: BillingTransactionType;
    status: TransactionStatus;
    amount: BillingTransactionAmountDto | null;
    creditsDelta: number;
    description: string;
    referenceId: string | null;
    gatewayPaymentId: string | null;
    gatewayOrderId: string | null;
    receiptNumber: string | null;
    environment: PaymentEnvironment;
    metadata: Record<string, string | number | boolean> | null;
    createdAt: string;
}

export interface PaginatedBillingHistoryDto {
    items: BillingTransactionDto[];
    total: number;
    page: number;
    limit: number;
}

export interface PaymentOrderResponseDto {
    orderId: string;
    amount: number;
    currency: Currency;
    keyId: string;
    itemName: string;
    itemType: BillingItemType;
    receipt: string;
}

export interface PaymentVerificationResponseDto {
    success: boolean;
    referenceId: string;
    transactionId: string;
    itemType: BillingItemType;
    message: string;
}

export interface GetBillingHistoryQuery {
    type?: BillingTransactionType;
    status?: TransactionStatus;
    page?: number;
    limit?: number;
}

export interface CreatePaymentOrderPayload {
    itemId: string;
    itemType: BillingItemType;
    promoCode?: string;
}

export interface VerifyPaymentPayload {
    orderId: string;
    paymentId: string;
    signature: string;
    itemId: string;
    itemType: BillingItemType;
    promoCode?: string;
}

export interface ToggleAutoRenewPayload {
    autoRenew: boolean;
}

export interface CancelSubscriptionPayload {
    reason?: string;
}

// Razorpay SDK types
export interface RazorpayPaymentSuccessResponse {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
}

export interface RazorpayPaymentFailedResponse {
    error: {
        code: string;
        description: string;
        source?: string;
        step?: string;
        reason?: string;
        metadata?: {
            order_id?: string;
            payment_id?: string;
        };
    };
}

export interface RazorpayCheckoutOptions {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description?: string;
    order_id: string;
    handler: (response: RazorpayPaymentSuccessResponse) => void;
    prefill?: {
        name?: string;
        email?: string;
        contact?: string;
    };
    theme?: {
        color?: string;
    };
    modal?: {
        ondismiss?: () => void;
    };
}
