import { adminRootApi } from '../../auth/api/admin-base-api';
import { API_ENDPOINTS } from '../../../../shared/constants/api-endpoints.constant';
import type { ApiResponse } from '../../../../shared/types/api-response.types';
import type {
    AdminBillingHistoryQuery,
    AdminBillingTransactionDto,
    AdminCreditPackDto,
    AdminSubscriptionPlanDto,
    CreateCreditPackPayload,
    CreateSubscriptionPlanPayload,
    UpdateCreditPackPayload,
    UpdateSubscriptionPlanPayload,
} from '../types/admin-billing.types';

export const adminBillingApi = adminRootApi.injectEndpoints({
    endpoints: (builder) => ({
        getAdminPlans: builder.query<ApiResponse<AdminSubscriptionPlanDto[]>, void>({
            query: () => ({
                url: API_ENDPOINTS.ADMIN.BILLING.PLANS,
                method: 'GET',
            }),
            providesTags: (result) =>
                result?.data
                    ? [
                          ...result.data.map(({ id }) => ({ type: 'AdminBillingPlan' as const, id })),
                          { type: 'AdminBillingPlan' as const, id: 'LIST' },
                      ]
                    : [{ type: 'AdminBillingPlan' as const, id: 'LIST' }],
        }),

        createAdminPlan: builder.mutation<ApiResponse<AdminSubscriptionPlanDto>, CreateSubscriptionPlanPayload>({
            query: (body) => ({
                url: API_ENDPOINTS.ADMIN.BILLING.PLANS,
                method: 'POST',
                body,
            }),
            invalidatesTags: [{ type: 'AdminBillingPlan', id: 'LIST' }],
        }),

        updateAdminPlan: builder.mutation<
            ApiResponse<AdminSubscriptionPlanDto>,
            { id: string; payload: UpdateSubscriptionPlanPayload }
        >({
            query: ({ id, payload }) => ({
                url: API_ENDPOINTS.ADMIN.BILLING.PLAN_BY_ID(id),
                method: 'PATCH',
                body: payload,
            }),
            invalidatesTags: (_result, _error, { id }) => [
                { type: 'AdminBillingPlan', id },
                { type: 'AdminBillingPlan', id: 'LIST' },
            ],
        }),

        getAdminCreditPacks: builder.query<ApiResponse<AdminCreditPackDto[]>, void>({
            query: () => ({
                url: API_ENDPOINTS.ADMIN.BILLING.CREDIT_PACKS,
                method: 'GET',
            }),
            providesTags: (result) =>
                result?.data
                    ? [
                          ...result.data.map(({ id }) => ({ type: 'AdminCreditPack' as const, id })),
                          { type: 'AdminCreditPack' as const, id: 'LIST' },
                      ]
                    : [{ type: 'AdminCreditPack' as const, id: 'LIST' }],
        }),

        createAdminCreditPack: builder.mutation<ApiResponse<AdminCreditPackDto>, CreateCreditPackPayload>({
            query: (body) => ({
                url: API_ENDPOINTS.ADMIN.BILLING.CREDIT_PACKS,
                method: 'POST',
                body,
            }),
            invalidatesTags: [{ type: 'AdminCreditPack', id: 'LIST' }],
        }),

        updateAdminCreditPack: builder.mutation<
            ApiResponse<AdminCreditPackDto>,
            { id: string; payload: UpdateCreditPackPayload }
        >({
            query: ({ id, payload }) => ({
                url: API_ENDPOINTS.ADMIN.BILLING.CREDIT_PACK_BY_ID(id),
                method: 'PATCH',
                body: payload,
            }),
            invalidatesTags: (_result, _error, { id }) => [
                { type: 'AdminCreditPack', id },
                { type: 'AdminCreditPack', id: 'LIST' },
            ],
        }),

        getAdminTransactions: builder.query<ApiResponse<AdminBillingTransactionDto[]>, AdminBillingHistoryQuery | void>({
            query: (params) => ({
                url: API_ENDPOINTS.ADMIN.BILLING.TRANSACTIONS,
                method: 'GET',
                params: params || undefined,
            }),
            providesTags: (result) =>
                result?.data
                    ? [
                          ...result.data.map(({ id }) => ({ type: 'AdminBillingTransaction' as const, id })),
                          { type: 'AdminBillingTransaction' as const, id: 'LIST' },
                      ]
                    : [{ type: 'AdminBillingTransaction' as const, id: 'LIST' }],
        }),
    }),
});

export const {
    useGetAdminPlansQuery,
    useCreateAdminPlanMutation,
    useUpdateAdminPlanMutation,
    useGetAdminCreditPacksQuery,
    useCreateAdminCreditPackMutation,
    useUpdateAdminCreditPackMutation,
    useGetAdminTransactionsQuery,
} = adminBillingApi;
