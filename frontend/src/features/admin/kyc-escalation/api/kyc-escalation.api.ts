import { createApi } from "@reduxjs/toolkit/query/react";
import { adminBaseQueryWithReauth } from "../../auth/api/admin-base-api";
import type { ApiResponse } from "../../../../shared/types/api-response.types";
import type { GetKycTasksQuery, KycEscalationTask, RejectKycTaskPayload } from "../types/kyc-escalation.types";
import { API_ENDPOINTS } from "../../../../shared/constants/api-endpoints.constant";

export const KycEscalationApi = createApi({
    reducerPath: 'kycEscalationApi',
    baseQuery: adminBaseQueryWithReauth,
    tagTypes: ['KycEscalationTask'],
    endpoints: (builder) => ({
        getKycTasks: builder.query<ApiResponse<KycEscalationTask[]>, GetKycTasksQuery>({
            query: (params) => ({
                url: API_ENDPOINTS.ADMIN.KYC_ESCALATION.BASE,
                method: 'GET',
                params,
            }),

            providesTags: (result) => 
                result?.data
                    ? [
                        ...result.data.map(({id}) => ({type: 'KycEscalationTask' as const, id })),
                        {type: 'KycEscalationTask', id: 'LIST'},
                    ]
                    : [{type: 'KycEscalationTask', id: 'LIST'}],
        }),
        claimKycTask: builder.mutation<ApiResponse, string>({
            query: (taskId) => ({
                url: API_ENDPOINTS.ADMIN.KYC_ESCALATION.CLAIM(taskId),
                method: 'POST',
            }),
            invalidatesTags: (_result, _error, id) => [{type: 'KycEscalationTask', id}],
        }),
        releaseKycTask: builder.mutation<ApiResponse, string>({
            query: (taskId) => ({
                url: API_ENDPOINTS.ADMIN.KYC_ESCALATION.RELEASE(taskId),
                method: 'POST',
            }),
            invalidatesTags: (_result, _error, id) => [{type: 'KycEscalationTask', id}],
        }),
        takeoverKycTask: builder.mutation<ApiResponse, string>({
            query: (taskId) => ({
                url: API_ENDPOINTS.ADMIN.KYC_ESCALATION.TAKEOVER(taskId),
                method: 'POST',
            }),
            invalidatesTags: (_result, _error, id) => [{type: 'KycEscalationTask', id}],
        }),
        approveKycTask: builder.mutation<ApiResponse, string>({
            query: (taskId) => ({
                url: API_ENDPOINTS.ADMIN.KYC_ESCALATION.APPROVE(taskId),
                method: 'POST',
            }),
            invalidatesTags: (_result, _error, id) => [{type: 'KycEscalationTask', id}],
        }),
        rejectKycTask: builder.mutation<ApiResponse, RejectKycTaskPayload>({
            query: ({id, reason}) => ({
                url: API_ENDPOINTS.ADMIN.KYC_ESCALATION.REJECT(id),
                method: 'POST',
                body: {reason},
            }),
            invalidatesTags: (_result, _error, arg) => [{type: 'KycEscalationTask', id: arg.id}],
        }),
    }),
});

export const {
    useGetKycTasksQuery,
    useClaimKycTaskMutation,
    useReleaseKycTaskMutation,
    useTakeoverKycTaskMutation,
    useApproveKycTaskMutation,
    useRejectKycTaskMutation,
} = KycEscalationApi