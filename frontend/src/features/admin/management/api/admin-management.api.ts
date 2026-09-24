// frontend/src/features/admin/management/api/admin-management.api.ts

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../../../../app/store';
import type { AcceptAdminInviteRequest, AdminManagementResponse, AdminStatusReasonRequest, GetAdminsRequest, GetAdminsResponse, InviteAdminRequest, SuspendAdminRequest, UpdateAdminRequest } from '../types/admin-management.types';

export const adminManagementApi = createApi({
    reducerPath: 'adminManagementApi',
    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3110/api/v1',
        prepareHeaders: (headers, { getState }) => {
            const token = (getState() as RootState).adminAuth.accessToken;
            if (token) {
                headers.set('authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ['Admins'],
    endpoints: (builder) => ({

        getAdmins: builder.query<GetAdminsResponse, GetAdminsRequest>({
            query: (params) => ({
                url: '/admin/management',
                method: 'GET',
                params,
            }),
            // Provides tags to automatically refetch when mutations occur
            providesTags: ['Admins'],
        }),

        inviteAdmin: builder.mutation<AdminManagementResponse, InviteAdminRequest>({
            query: (body) => ({
                url: '/admin/management/invite',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Admins'],
        }),
        
        // This is a public route, so it doesn't strictly need the bearer token, 
        // but it's safe to process through this API slice.
        acceptAdminInvite: builder.mutation<AdminManagementResponse, AcceptAdminInviteRequest>({
            query: (body) => ({
                url: '/admin/management/accept-invite',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Admins'],
        }),

        reinviteAdmin: builder.mutation<AdminManagementResponse, string>({
            query: (adminId) => ({
                url: `/admin/management/${adminId}/reinvite`,
                method: 'POST',
            }),
            invalidatesTags: ['Admins'],
        }),
        
        cancelAdminInvite: builder.mutation<AdminManagementResponse, string>({
            query: (adminId) => ({
                url: `/admin/management/${adminId}/cancel-invite`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Admins'],
        }),
        
        updateAdmin: builder.mutation<AdminManagementResponse, { adminId: string; data: UpdateAdminRequest }>({
            query: ({ adminId, data }) => ({
                url: `/admin/management/${adminId}`,
                method: 'PATCH',
                body: data,
            }),
            invalidatesTags: ['Admins'],
        }),
        
        suspendAdmin: builder.mutation<AdminManagementResponse, SuspendAdminRequest>({
            query: ({ adminId, ...body }) => ({
                url: `/admin/management/${adminId}/suspend`,
                method: 'PATCH',
                body,
            }),
            invalidatesTags: ['Admins'],
        }),
        
        deactivateAdmin: builder.mutation<AdminManagementResponse, AdminStatusReasonRequest>({
            query: ({ adminId, ...body }) => ({
                url: `/admin/management/${adminId}/deactivate`,
                method: 'PATCH',
                body,
            }),
            invalidatesTags: ['Admins'],
        }),
        
        reactivateAdmin: builder.mutation<AdminManagementResponse, AdminStatusReasonRequest>({
            query: ({ adminId, ...body }) => ({
                url: `/admin/management/${adminId}/reactivate`,
                method: 'PATCH',
                body,
            }),
            invalidatesTags: ['Admins'],
        }),
    }),
});

export const {
    useGetAdminsQuery,
    useInviteAdminMutation,
    useAcceptAdminInviteMutation,
    useCancelAdminInviteMutation,
    useReinviteAdminMutation,
    useUpdateAdminMutation,
    useSuspendAdminMutation,
    useDeactivateAdminMutation,
    useReactivateAdminMutation,
} = adminManagementApi;