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
    UpdateAdminRequest 
} from '../types/admin-management.types';

export const adminManagementApi = adminRootApi.injectEndpoints({
    endpoints: (builder) => ({
        getAdmins: builder.query<GetAdminsResponse, GetAdminsRequest>({
            query: (params) => ({
                url: '/admin/management',
                method: 'GET',
                params,
            }),
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

        getAdminDetails: builder.query<GetAdminDetailsResponse, string>({
            query: (adminId) => ({
                url: `/admin/management/${adminId}`,
                method: 'GET',
            }),
            providesTags: (_result, _error, id) => [{ type: 'Admins', id }, 'Admins'],
        }),

        forceLogoutAdmin: builder.mutation<AdminManagementResponse, string>({
            query: (adminId) => ({
                url: `/admin/management/${adminId}/force-logout`,
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