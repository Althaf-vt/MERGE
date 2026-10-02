import { adminRootApi } from '../../auth/api/admin-base-api';
import type { ActionReasonPayload, AdminUserDto, GetUsersParams, PaginatedUsersResponse, SuspendUserPayload } from '../types/admin-users.types';

export const adminUsersApi = adminRootApi.injectEndpoints({
    endpoints: (builder) => ({
        getUsers: builder.query<PaginatedUsersResponse, GetUsersParams>({
            query: (params) => ({
                url: '/admin/users',
                params,
            }),
            providesTags: (result) => 
                result
                    ? [
                        ...result.data.map(({ id }) => ({ type: 'AdminUsers' as const, id })),
                        { type: 'AdminUsers', id: 'LIST' }
                      ]
                    : [{ type: 'AdminUsers', id: 'LIST' }],
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
    overrideExisting: false,
});

export const {
    useGetUsersQuery,
    useGetUserDetailsQuery,
    useSuspendUserMutation,
    useUnsuspendUserMutation,
    useBanUserMutation,
    useUnbanUserMutation,
} = adminUsersApi;