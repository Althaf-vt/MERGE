import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../../../../app/store";
import type { ActionReasonPayload, AdminUserDto, GetUsersParams, PaginatedUsersResponse, SuspendUserPayload } from "../types/admin-users.types";

export const adminUsersApi = createApi({
    reducerPath: 'adminUsersApi',
    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3110/api/v1',
        prepareHeaders: (headers, {getState}) => {
            const token = (getState() as RootState).adminAuth.accessToken;
            if(token){
                headers.set('authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ['AdminUsers', 'AdminUserDetails'],
    endpoints: (builder) => ({
        getUsers: builder.query<PaginatedUsersResponse, GetUsersParams>({
            query: (params) => ({
                url: '/admin/users',
                params,
            }),
            providesTags: (result) => 
                result
                    ? [
                        ...result.data.map(({id}) => ({type: 'AdminUsers' as const, id})),
                        {type: 'AdminUsers', id: 'LIST'}
                      ]
                    : [{type: 'AdminUsers', id: 'LIST'}],
        }),

        getUserDetails: builder.query<{ success: boolean; data: AdminUserDto }, string>({
            query: (id) => `/admin/users/${id}`,
            providesTags: (_result, _error, id) => [{ type: 'AdminUserDetails', id }],
        }),

        suspendUser: builder.mutation<{ success: boolean; message: string }, SuspendUserPayload>({
            query: ({ userId, ...body }) => ({
                url: `/admin/users/${userId}/suspend`,
                method: 'POST',
                body,
            }),
            invalidatesTags: (_result, _error, { userId }) => [
                { type: 'AdminUsers', id: userId },
                { type: 'AdminUserDetails', id: userId }
            ],
        }),

        unsuspendUser: builder.mutation<{ success: boolean; message: string }, ActionReasonPayload>({
            query: ({ userId, reason }) => ({
                url: `/admin/users/${userId}/unsuspend`,
                method: 'POST',
                body: { reason },
            }),
            invalidatesTags: (_result, _error, { userId }) => [
                { type: 'AdminUsers', id: userId },
                { type: 'AdminUserDetails', id: userId }
            ],
        }),

        banUser: builder.mutation<{ success: boolean; message: string }, ActionReasonPayload>({
            query: ({ userId, reason }) => ({
                url: `/admin/users/${userId}/ban`,
                method: 'POST',
                body: { reason },
            }),
            invalidatesTags: (_result, _error, { userId }) => [
                { type: 'AdminUsers', id: userId },
                { type: 'AdminUserDetails', id: userId }
            ],
        }),

        unbanUser: builder.mutation<{ success: boolean; message: string }, ActionReasonPayload>({
            query: ({ userId, reason }) => ({
                url: `/admin/users/${userId}/unban`,
                method: 'POST',
                body: { reason },
            }),
            invalidatesTags: (_result, _error, { userId }) => [
                { type: 'AdminUsers', id: userId },
                { type: 'AdminUserDetails', id: userId }
            ],
        }),
    }),
});

export const {
    useGetUsersQuery,
    useGetUserDetailsQuery,
    useSuspendUserMutation,
    useUnsuspendUserMutation,
    useBanUserMutation,
    useUnbanUserMutation,
} = adminUsersApi;