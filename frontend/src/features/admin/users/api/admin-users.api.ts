import { API_ENDPOINTS } from '../../../../shared/constants/api-endpoints.constant';
import type { ApiResponse } from '../../../../shared/types/api-response.types';
import { adminRootApi } from '../../auth/api/admin-base-api';
import type {
    ActionReasonPayload,
    AdminUserDto,
    GetUsersParams,
    PaginatedUsersResponse,
    SuspendUserPayload,
} from '../types/admin-users.types';

export const adminUsersApi = adminRootApi.injectEndpoints({
    endpoints: (builder) => ({
        getUsers: builder.query<PaginatedUsersResponse, GetUsersParams>({
            query: (params) => ({
                url: API_ENDPOINTS.ADMIN.USERS.BASE,
                method: 'GET',
                params,
            }),
            providesTags: (result) =>
                result?.data
                    ? [
                          ...result.data.map(({ id }) => ({ type: 'AdminUsers' as const, id })),
                          { type: 'AdminUsers', id: 'LIST' },
                      ]
                    : [{ type: 'AdminUsers', id: 'LIST' }],
        }),

        getUserDetails: builder.query<ApiResponse<AdminUserDto>, string>({
            query: (id) => ({
                url: API_ENDPOINTS.ADMIN.USERS.BY_ID(id),
                method: 'GET',
            }),
            providesTags: (_result, _error, id) => [{ type: 'AdminUserDetails', id }],
        }),

        suspendUser: builder.mutation<ApiResponse<undefined>, SuspendUserPayload>({
            query: ({ userId, ...body }) => ({
                url: API_ENDPOINTS.ADMIN.USERS.SUSPEND(userId),
                method: 'POST',
                body,
            }),
            invalidatesTags: (_result, _error, { userId }) => [
                { type: 'AdminUsers', id: userId },
                { type: 'AdminUserDetails', id: userId },
            ],
        }),

        unsuspendUser: builder.mutation<ApiResponse<undefined>, ActionReasonPayload>({
            query: ({ userId, reason }) => ({
                url: API_ENDPOINTS.ADMIN.USERS.UNSUSPEND(userId),
                method: 'POST',
                body: { reason },
            }),
            invalidatesTags: (_result, _error, { userId }) => [
                { type: 'AdminUsers', id: userId },
                { type: 'AdminUserDetails', id: userId },
            ],
        }),

        banUser: builder.mutation<ApiResponse<undefined>, ActionReasonPayload>({
            query: ({ userId, reason }) => ({
                url: API_ENDPOINTS.ADMIN.USERS.BAN(userId),
                method: 'POST',
                body: { reason },
            }),
            invalidatesTags: (_result, _error, { userId }) => [
                { type: 'AdminUsers', id: userId },
                { type: 'AdminUserDetails', id: userId },
            ],
        }),

        unbanUser: builder.mutation<ApiResponse<undefined>, ActionReasonPayload>({
            query: ({ userId, reason }) => ({
                url: API_ENDPOINTS.ADMIN.USERS.UNBAN(userId),
                method: 'POST',
                body: { reason },
            }),
            invalidatesTags: (_result, _error, { userId }) => [
                { type: 'AdminUsers', id: userId },
                { type: 'AdminUserDetails', id: userId },
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