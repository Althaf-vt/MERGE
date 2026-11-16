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
    | 'ADVANCED_DISCOVERY_FILTERS';

export type BillingTransactionType =
    | 'SUBSCRIPTION_PURCHASE'
    | 'SUBSCRIPTION_RENEWAL'
    | 'CREDIT_PURCHASE'
    | 'CREDIT_SPENT'
    | 'REFUND';

export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

export type Currency = 'INR' | 'USD';

export type PaymentEnvironment = 'TEST' | 'LIVE';

export interface AdminPlanPriceDto {
    amount: number;
    currency: Currency;
    formatted: string;
}

export interface AdminPlanOfferDto {
    code: string;
    discountPercentage: number;
    validFrom: string;
    validUntil: string;
    isActive: boolean;
}

export interface AdminSubscriptionPlanDto {
    id: string;
    name: string;
    code: string;
    billingPeriod: BillingPeriod;
    price: AdminPlanPriceDto;
    effectivePrice: AdminPlanPriceDto;
    entitlements: SubscriptionEntitlement[];
    offers: AdminPlanOfferDto[];
    sortOrder: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export type SubscriptionPlanDto = AdminSubscriptionPlanDto;

export interface AdminCreditPackDto {
    id: string;
    name: string;
    code: string;
    creditsCount: number;
    price: AdminPlanPriceDto;
    badge: string | null;
    sortOrder: number;
    isListed: boolean;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export type CreditPackDto = AdminCreditPackDto;

export interface AdminBillingTransactionAmountDto {
    amount: number;
    currency: Currency;
    formatted: string;
}

export interface AdminBillingTransactionDto {
    id: string;
    userId: string;
    type: BillingTransactionType;
    status: TransactionStatus;
    amount: AdminBillingTransactionAmountDto | null;
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

export interface AdminPaginatedTransactionsDto {
    items: AdminBillingTransactionDto[];
    total: number;
    page: number;
    limit: number;
}

export interface PlanPriceInput {
    amount: number;
    currency: Currency;
}

export interface PlanOfferInputPayload {
    code: string;
    discountPercentage: number;
    validFrom: string;
    validUntil: string;
    isActive?: boolean;
}

export interface CreateSubscriptionPlanPayload {
    name: string;
    code: string;
    billingPeriod: BillingPeriod;
    price: PlanPriceInput;
    entitlements: SubscriptionEntitlement[];
    offers?: PlanOfferInputPayload[];
    sortOrder?: number;
    isActive?: boolean;
}

export interface UpdateSubscriptionPlanPayload {
    name?: string;
    price?: PlanPriceInput;
    entitlements?: SubscriptionEntitlement[];
    offers?: PlanOfferInputPayload[];
    sortOrder?: number;
    isActive?: boolean;
}

export interface CreateCreditPackPayload {
    name: string;
    code: string;
    creditsCount: number;
    price: PlanPriceInput;
    badge?: string;
    sortOrder?: number;
    isListed?: boolean;
    isActive?: boolean;
}

export interface UpdateCreditPackPayload {
    name?: string;
    creditsCount?: number;
    price?: PlanPriceInput;
    badge?: string;
    sortOrder?: number;
    isListed?: boolean;
    isActive?: boolean;
}

export interface AdminBillingHistoryQuery {
    userId?: string;
    type?: BillingTransactionType;
    status?: TransactionStatus;
    fromDate?: string;
    toDate?: string;
    page?: number;
    limit?: number;
}

