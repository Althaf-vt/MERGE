import { rootApi } from '../../../shared/api/base-api';
import { API_ENDPOINTS } from '../../../shared/constants/api-endpoints.constant';
import type { ApiResponse } from '../../../shared/types/api-response.types';
import type {
    BlockUserRequest,
    ConfirmEmailChangeRequest,
    GetActiveSessionsResponse,
    GetBlockedUsersQueryParams,
    GetBlockedUsersResponse,
    GetProfileResponse,
    InitiateEmailChangeRequest,
    ProfileStandardResponse,
    SetPrimaryPhotoRequest,
    UpdateFullPreferencesRequest,
    UpdateFullProfileRequest,
    UpdateMedicalRequest,
    UpdatePrivacyRequest,
    UpdateSecurityPasswordRequest,
} from '../types/profile.types';

export const profileApi = rootApi.injectEndpoints({
    endpoints: (builder) => ({
        getProfile: builder.query<GetProfileResponse, void>({
            query: () => ({
                url: API_ENDPOINTS.PROFILE.BASE,
                method: 'GET',
            }),
            providesTags: ['Profile'],
        }),

        updateFullProfile: builder.mutation<ProfileStandardResponse, UpdateFullProfileRequest>({
            query: (body) => ({
                url: API_ENDPOINTS.PROFILE.FULL,
                method: 'PATCH',
                body,
            }),
            invalidatesTags: ['Profile', 'User'],
        }),

        uploadProfilePhoto: builder.mutation<ProfileStandardResponse, File>({
            query: (file) => {
                const formData = new FormData();
                formData.append('photo', file);
                return {
                    url: API_ENDPOINTS.PROFILE.PHOTOS,
                    method: 'POST',
                    body: formData,
                };
            },
            invalidatesTags: ['Profile', 'User'],
        }),

        setPrimaryPhoto: builder.mutation<ProfileStandardResponse, SetPrimaryPhotoRequest>({
            query: (body) => ({
                url: API_ENDPOINTS.PROFILE.PHOTOS_PRIMARY,
                method: 'PATCH',
                body,
            }),
            invalidatesTags: ['Profile', 'User'],
        }),

        removeProfilePhoto: builder.mutation<ProfileStandardResponse, string>({
            query: (photoId) => ({
                url: API_ENDPOINTS.PROFILE.PHOTO_BY_ID(photoId),
                method: 'DELETE',
            }),
            invalidatesTags: ['Profile', 'User'],
        }),

        updateMedicalRecord: builder.mutation<ProfileStandardResponse, UpdateMedicalRequest>({
            query: (body) => ({
                url: API_ENDPOINTS.PROFILE.MEDICAL,
                method: 'PATCH',
                body,
            }),
            invalidatesTags: ['Profile', 'User'],
        }),

        saveUserFullPreferences: builder.mutation<ApiResponse<undefined>, UpdateFullPreferencesRequest>({
            query: (payload) => ({
                url: API_ENDPOINTS.PROFILE.FULL_PREFERENCES, 
                method: 'PATCH',
                body: payload,
            }),
            invalidatesTags: ['Profile'],
        }),

        updatePrivacySettings: builder.mutation<ProfileStandardResponse, UpdatePrivacyRequest>({
            query: (body) => ({
                url: API_ENDPOINTS.PROFILE.PRIVACY,
                method: 'PATCH',
                body,
            }),
            invalidatesTags: ['Profile', 'User'],
        }),

        requestSecurityOtp: builder.mutation<ProfileStandardResponse, void>({
            query: () => ({
                url: API_ENDPOINTS.PROFILE.SECURITY_OTP_REQUEST,
                method: 'POST',
            }),
        }),

        updateSecurityPassword: builder.mutation<ProfileStandardResponse, UpdateSecurityPasswordRequest>({
            query: (body) => ({
                url: API_ENDPOINTS.PROFILE.SECURITY_PASSWORD,
                method: 'PATCH',
                body,
            }),
        }),

        initiateEmailChange: builder.mutation<ProfileStandardResponse, InitiateEmailChangeRequest>({
            query: (body) => ({
                url: API_ENDPOINTS.PROFILE.SECURITY_EMAIL_INITIATE,
                method: 'POST',
                body,
            }),
        }),

        confirmEmailChange: builder.mutation<ProfileStandardResponse, ConfirmEmailChangeRequest>({
            query: (body) => ({
                url: API_ENDPOINTS.PROFILE.SECURITY_EMAIL_CONFIRM,
                method: 'PATCH',
                body,
            }),
            invalidatesTags: ['Profile', 'User'],
        }),

        deactivateAccount: builder.mutation<ProfileStandardResponse, void>({
            query: () => ({
                url: API_ENDPOINTS.PROFILE.SECURITY_ACCOUNT_DEACTIVATE,
                method: 'PATCH',
            }),
            invalidatesTags: ['Profile', 'User', 'Sessions'],
        }),

        deleteAccount: builder.mutation<ProfileStandardResponse, void>({
            query: () => ({
                url: API_ENDPOINTS.PROFILE.SECURITY_ACCOUNT_DELETE,
                method: 'DELETE',
            }),
            invalidatesTags: ['Profile', 'User', 'Sessions'],
        }),

        getActiveSessions: builder.query<GetActiveSessionsResponse, void>({
            query: () => ({
                url: API_ENDPOINTS.PROFILE.SECURITY_SESSIONS,
                method: 'GET',
            }),
            providesTags: ['Sessions'],
        }),

        revokeSession: builder.mutation<ProfileStandardResponse, string>({
            query: (sessionId) => ({
                url: API_ENDPOINTS.PROFILE.SECURITY_SESSIONS_REVOKE(sessionId),
                method: 'DELETE',
            }),
            invalidatesTags: ['Sessions'],
        }),

        revokeOtherSessions: builder.mutation<ProfileStandardResponse, void>({
            query: () => ({
                url: API_ENDPOINTS.PROFILE.SECURITY_SESSIONS_OTHER,
                method: 'DELETE',
            }),
            invalidatesTags: ['Sessions'],
        }),

        getBlockedUsers: builder.query<GetBlockedUsersResponse, GetBlockedUsersQueryParams | void>({
            query: (params) => ({
                url: API_ENDPOINTS.PROFILE.BLOCKED,
                method: 'GET',
                params: params || undefined,
            }),
            providesTags: ['BlockedUsers'],
        }),

        blockUser: builder.mutation<ProfileStandardResponse, BlockUserRequest>({
            query: (body) => ({
                url: API_ENDPOINTS.PROFILE.BLOCKED,
                method: 'POST',
                body,
            }),
            invalidatesTags: ['BlockedUsers'],
        }),

        unblockUser: builder.mutation<ProfileStandardResponse, string>({
            query: (blockedId) => ({
                url: API_ENDPOINTS.PROFILE.BLOCKED_BY_ID(blockedId),
                method: 'DELETE',
            }),
            invalidatesTags: ['BlockedUsers'],
        }),
    }),
    overrideExisting: false,
});

export const {
    useGetProfileQuery,
    useUpdateFullProfileMutation,
    useSaveUserFullPreferencesMutation,
    useUpdateMedicalRecordMutation,
    useUpdatePrivacySettingsMutation,
    useUploadProfilePhotoMutation,
    useSetPrimaryPhotoMutation,
    useRemoveProfilePhotoMutation,
    useRequestSecurityOtpMutation,
    useUpdateSecurityPasswordMutation,
    useInitiateEmailChangeMutation,
    useConfirmEmailChangeMutation,
    useDeactivateAccountMutation,
    useDeleteAccountMutation,
    useGetActiveSessionsQuery,
    useRevokeSessionMutation,
    useRevokeOtherSessionsMutation,
    useGetBlockedUsersQuery,
    useBlockUserMutation,
    useUnblockUserMutation,
} = profileApi;