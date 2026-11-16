// Public API Boundary for the Billing & Monetization Feature

// RTK Query API Slice & Hooks
export {
    billingApi,
    useGetPlansQuery,
    useGetUserSubscriptionQuery,
    useGetCreditPacksQuery,
    useGetUserCreditBalanceQuery,
    useGetBillingHistoryQuery,
    useToggleAutoRenewMutation,
    useCancelSubscriptionMutation,
    useCreatePaymentOrderMutation,
    useVerifyPaymentMutation,
} from './api/billing.api';

// Route Page Components
export { SubscriptionCreditsPage } from './pages/subscription-credits.page';
export { ManageSubscriptionPage } from './pages/manage-subscription.page';
export { BillingHistoryPage } from './pages/billing-history.page';
export { CreditHistoryPage } from './pages/credit-history.page';

// Cross-Feature Trigger Modals
export { UpgradePlanModal } from './components/subscription/upgrade-plan-modal.component';
export type { UpgradePlanModalProps } from './components/subscription/upgrade-plan-modal.component';
export { PaymentSuccessModal } from './components/payment/payment-success-modal.component';
export type { PaymentSuccessModalProps } from './components/payment/payment-success-modal.component';
export { PaymentFailedModal } from './components/payment/payment-failed-modal.component';
export type { PaymentFailedModalProps } from './components/payment/payment-failed-modal.component';

// Public Types and Contracts
export type {
    SubscriptionPlanDto,
    UserSubscriptionDto,
    CreditPackDto,
    CreditBalanceDto,
    BillingTransactionDto,
    SubscriptionStatus,
    BillingPeriod,
    SubscriptionEntitlement,
    BillingTransactionType,
    TransactionStatus,
    BillingItemType,
} from './types/billing.types';

// Constants
export { BILLING_ROUTES } from './constants/billing.constants';
