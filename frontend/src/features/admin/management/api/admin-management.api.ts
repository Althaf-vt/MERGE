import { API_ENDPOINTS } from '../../../../shared/constants/api-endpoints.constant';
import { adminRootApi } from '../../auth/api/admin-base-api';
import type {
    AcceptAdminInviteRequest,
    AdminManagementResponse,
    AdminStatusReasonRequest,
    GetAdminDetailsResponse,
    GetAdminsRequest,
    GetAdminsResponse,
    InviteAdminRequest,
    SuspendAdminRequest,
    UpdateAdminRequest,
} from '../types/admin-management.types';

export const adminManagementApi = adminRootApi.injectEndpoints({
    endpoints: (builder) => ({
        getAdmins: builder.query<GetAdminsResponse, GetAdminsRequest>({
            query: (params) => ({
                url: API_ENDPOINTS.ADMIN.MANAGEMENT.BASE,
                method: 'GET',
                params,
            }),
            providesTags: ['Admins'],
        }),

        inviteAdmin: builder.mutation<AdminManagementResponse, InviteAdminRequest>({
            query: (body) => ({
                url: API_ENDPOINTS.ADMIN.MANAGEMENT.INVITE,
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Admins'],
        }),

        acceptAdminInvite: builder.mutation<AdminManagementResponse, AcceptAdminInviteRequest>({
            query: (body) => ({
                url: API_ENDPOINTS.ADMIN.MANAGEMENT.ACCEPT_INVITE,
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Admins'],
        }),

        reinviteAdmin: builder.mutation<AdminManagementResponse, string>({
            query: (adminId) => ({
                url: API_ENDPOINTS.ADMIN.MANAGEMENT.REINVITE(adminId),
                method: 'POST',
            }),
            invalidatesTags: ['Admins'],
        }),

        cancelAdminInvite: builder.mutation<AdminManagementResponse, string>({
            query: (adminId) => ({
                url: API_ENDPOINTS.ADMIN.MANAGEMENT.CANCEL_INVITE(adminId),
                method: 'DELETE',
            }),
            invalidatesTags: ['Admins'],
        }),

        updateAdmin: builder.mutation<AdminManagementResponse, { adminId: string; data: UpdateAdminRequest }>({
            query: ({ adminId, data }) => ({
                url: API_ENDPOINTS.ADMIN.MANAGEMENT.BY_ID(adminId),
                method: 'PATCH',
                body: data,
            }),
            invalidatesTags: ['Admins'],
        }),

        suspendAdmin: builder.mutation<AdminManagementResponse, SuspendAdminRequest>({
            query: ({ adminId, ...body }) => ({
                url: API_ENDPOINTS.ADMIN.MANAGEMENT.SUSPEND(adminId),
                method: 'PATCH',
                body,
            }),
            invalidatesTags: ['Admins'],
        }),

        deactivateAdmin: builder.mutation<AdminManagementResponse, AdminStatusReasonRequest>({
            query: ({ adminId, ...body }) => ({
                url: API_ENDPOINTS.ADMIN.MANAGEMENT.DEACTIVATE(adminId),
                method: 'PATCH',
                body,
            }),
            invalidatesTags: ['Admins'],
        }),

        reactivateAdmin: builder.mutation<AdminManagementResponse, AdminStatusReasonRequest>({
            query: ({ adminId, ...body }) => ({
                url: API_ENDPOINTS.ADMIN.MANAGEMENT.REACTIVATE(adminId),
                method: 'PATCH',
                body,
            }),
            invalidatesTags: ['Admins'],
        }),

        getAdminDetails: builder.query<GetAdminDetailsResponse, string>({
            query: (adminId) => ({
                url: API_ENDPOINTS.ADMIN.MANAGEMENT.BY_ID(adminId),
                method: 'GET',
            }),
            providesTags: (_result, _error, id) => [{ type: 'Admins', id }, 'Admins'],
        }),

        forceLogoutAdmin: builder.mutation<AdminManagementResponse, string>({
            query: (adminId) => ({
                url: API_ENDPOINTS.ADMIN.MANAGEMENT.FORCE_LOGOUT(adminId),
                method: 'POST',
            }),
            invalidatesTags: (_result, _error, id) => [{ type: 'Admins', id }],
        }),
    }),
    overrideExisting: false,
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
    useGetAdminDetailsQuery,
    useForceLogoutAdminMutation,
} = adminManagementApi;