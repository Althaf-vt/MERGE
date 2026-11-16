import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../../../shared/api/base-api';
import type { ApiResponse } from '../../../shared/types/api-response.types';
import { API_ENDPOINTS } from '../../../shared/constants/api-endpoints.constant';
import type {
    SubscriptionPlanDto,
    UserSubscriptionDto,
    CreditPackDto,
    CreditBalanceDto,
    BillingTransactionDto,
    PaymentOrderResponseDto,
    PaymentVerificationResponseDto,
    GetBillingHistoryQuery,
    CreatePaymentOrderPayload,
    VerifyPaymentPayload,
    ToggleAutoRenewPayload,
    CancelSubscriptionPayload,
} from '../types/billing.types';

export const billingApi = createApi({
    reducerPath: 'billingApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['UserSubscription', 'CreditBalance', 'CreditPacks', 'SubscriptionPlans', 'BillingHistory'],
    endpoints: (builder) => ({
        getPlans: builder.query<ApiResponse<SubscriptionPlanDto[]>, void>({
            query: () => ({
                url: API_ENDPOINTS.BILLING.PLANS,
                method: 'GET',
            }),
            providesTags: ['SubscriptionPlans'],
        }),

        getUserSubscription: builder.query<ApiResponse<UserSubscriptionDto | null>, void>({
            query: () => ({
                url: API_ENDPOINTS.BILLING.SUBSCRIPTION,
                method: 'GET',
            }),
            providesTags: ['UserSubscription'],
        }),

        getCreditPacks: builder.query<ApiResponse<CreditPackDto[]>, void>({
            query: () => ({
                url: API_ENDPOINTS.BILLING.CREDITS_PACKS,
                method: 'GET',
            }),
            providesTags: ['CreditPacks'],
        }),

        getUserCreditBalance: builder.query<ApiResponse<CreditBalanceDto>, void>({
            query: () => ({
                url: API_ENDPOINTS.BILLING.CREDITS_BALANCE,
                method: 'GET',
            }),
            providesTags: ['CreditBalance'],
        }),

        getBillingHistory: builder.query<ApiResponse<BillingTransactionDto[]>, GetBillingHistoryQuery | void>({
            query: (params) => ({
                url: API_ENDPOINTS.BILLING.HISTORY,
                method: 'GET',
                params: params || undefined,
            }),
            providesTags: ['BillingHistory'],
        }),

        toggleAutoRenew: builder.mutation<ApiResponse<UserSubscriptionDto>, ToggleAutoRenewPayload>({
            query: (body) => ({
                url: API_ENDPOINTS.BILLING.AUTO_RENEW,
                method: 'PATCH',
                body,
            }),
            invalidatesTags: ['UserSubscription'],
        }),

        cancelSubscription: builder.mutation<ApiResponse<UserSubscriptionDto>, CancelSubscriptionPayload | void>({
            query: (body) => ({
                url: API_ENDPOINTS.BILLING.CANCEL,
                method: 'POST',
                body: body || {},
            }),
            invalidatesTags: ['UserSubscription'],
        }),

        createPaymentOrder: builder.mutation<ApiResponse<PaymentOrderResponseDto>, CreatePaymentOrderPayload>({
            query: (body) => ({
                url: API_ENDPOINTS.BILLING.PAYMENTS.ORDER,
                method: 'POST',
                body,
            }),
        }),

        verifyPayment: builder.mutation<ApiResponse<PaymentVerificationResponseDto>, VerifyPaymentPayload>({
            query: (body) => ({
                url: API_ENDPOINTS.BILLING.PAYMENTS.VERIFY,
                method: 'POST',
                body,
            }),
            invalidatesTags: ['UserSubscription', 'CreditBalance', 'BillingHistory'],
        }),
    }),
});

export const {
    useGetPlansQuery,
    useGetUserSubscriptionQuery,
    useGetCreditPacksQuery,
    useGetUserCreditBalanceQuery,
    useGetBillingHistoryQuery,
    useToggleAutoRenewMutation,
    useCancelSubscriptionMutation,
    useCreatePaymentOrderMutation,
    useVerifyPaymentMutation,
} = billingApi;
