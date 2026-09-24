// frontend/src/features/admin/management/api/admin-management.api.ts

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../../../../app/store';
import type { AcceptAdminInviteRequest, AdminManagementResponse, InviteAdminRequest, UpdateAdminRequest } from '../types/admin-management.types';

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
    endpoints: (builder) => ({
        inviteAdmin: builder.mutation<AdminManagementResponse, InviteAdminRequest>({
            query: (body) => ({
                url: '/admin/management/invite',
                method: 'POST',
                body,
            }),
        }),
        
        // This is a public route, so it doesn't strictly need the bearer token, 
        // but it's safe to process through this API slice.
        acceptAdminInvite: builder.mutation<AdminManagementResponse, AcceptAdminInviteRequest>({
            query: (body) => ({
                url: '/admin/management/accept-invite',
                method: 'POST',
                body,
            }),
        }),
        
        updateAdmin: builder.mutation<AdminManagementResponse, { adminId: string; data: UpdateAdminRequest }>({
            query: ({ adminId, data }) => ({
                url: `/admin/management/${adminId}`,
                method: 'PATCH',
                body: data,
            }),
        }),
    }),
});

export const {
    useInviteAdminMutation,
    useAcceptAdminInviteMutation,
    useUpdateAdminMutation,
} = adminManagementApi;