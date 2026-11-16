import { adminRootApi } from '../../auth/api/admin-base-api';
import { API_ENDPOINTS } from '../../../../shared/constants/api-endpoints.constant';
import type { ApiResponse } from '../../../../shared/types/api-response.types';
import type {
    AdminSubscriptionPlanDto,
    CreateSubscriptionPlanPayload,
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
    }),
});

export const {
    useGetAdminPlansQuery,
    useCreateAdminPlanMutation,
    useUpdateAdminPlanMutation,
} = adminBillingApi;
