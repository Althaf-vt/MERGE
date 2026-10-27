import { rootApi } from '../../../shared/api/base-api';
import { API_ENDPOINTS } from '../../../shared/constants/api-endpoints.constant';
import type { ApiResponse } from '../../../shared/types/api-response.types';
import type {
    BlockUserRequest,
    ConfirmEmailChangeRequest,
    GetBlockedUsersQueryParams,
    InitiateEmailChangeRequest,
    SetPrimaryPhotoRequest,
    UpdateFullPreferencesRequest,
    UpdateFullProfileRequest,
    UpdateMedicalRequest,
    UpdatePrivacyRequest,
    UpdateSecurityPasswordRequest,
    UserSessionData,
    BlockedUser,
    GetProfileData
} from '../types/profile.types';

export const profileApi = rootApi.injectEndpoints({
    endpoints: (builder) => ({
        // --- Profile Data Retrieval ---
        getProfile: builder.query<ApiResponse<GetProfileData>, void>({
            query: () => ({
                url: API_ENDPOINTS.PROFILE.BASE,
                method: 'GET',
            }),
            providesTags: ['Profile'],
        }),

        // --- Core Profile Updates ---
        updateFullProfile: builder.mutation<ApiResponse<undefined>, UpdateFullProfileRequest>({
            query: (body) => ({
                url: API_ENDPOINTS.PROFILE.FULL,
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

        updateMedicalRecord: builder.mutation<ApiResponse<undefined>, UpdateMedicalRequest>({
            query: (body) => ({
                url: API_ENDPOINTS.PROFILE.MEDICAL,
                method: 'PATCH',
                body,
            }),
            invalidatesTags: ['Profile', 'User'],
        }),

        updatePrivacySettings: builder.mutation<ApiResponse<undefined>, UpdatePrivacyRequest>({
            query: (body) => ({
                url: API_ENDPOINTS.PROFILE.PRIVACY,
                method: 'PATCH',
                body,
            }),
            invalidatesTags: ['Profile', 'User'],
        }),

        // --- Photo Management ---
        uploadProfilePhoto: builder.mutation<ApiResponse<undefined>, File>({
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

        setPrimaryPhoto: builder.mutation<ApiResponse<undefined>, SetPrimaryPhotoRequest>({
            query: (body) => ({
                url: API_ENDPOINTS.PROFILE.PHOTOS_PRIMARY,
                method: 'PATCH',
                body,
            }),
            invalidatesTags: ['Profile', 'User'],
        }),

        removeProfilePhoto: builder.mutation<ApiResponse<undefined>, string>({
            query: (photoId) => ({
                url: API_ENDPOINTS.PROFILE.PHOTO_BY_ID(photoId),
                method: 'DELETE',
            }),
            invalidatesTags: ['Profile', 'User'],
        }),

        // --- Security & Account Management ---
        requestSecurityOtp: builder.mutation<ApiResponse<undefined>, void>({
            query: () => ({
                url: API_ENDPOINTS.PROFILE.SECURITY_OTP_REQUEST,
                method: 'POST',
            }),
        }),

        updateSecurityPassword: builder.mutation<ApiResponse<undefined>, UpdateSecurityPasswordRequest>({
            query: (body) => ({
                url: API_ENDPOINTS.PROFILE.SECURITY_PASSWORD,
                method: 'PATCH',
                body,
            }),
        }),

        initiateEmailChange: builder.mutation<ApiResponse<undefined>, InitiateEmailChangeRequest>({
            query: (body) => ({
                url: API_ENDPOINTS.PROFILE.SECURITY_EMAIL_INITIATE,
                method: 'POST',
                body,
            }),
        }),

        confirmEmailChange: builder.mutation<ApiResponse<undefined>, ConfirmEmailChangeRequest>({
            query: (body) => ({
                url: API_ENDPOINTS.PROFILE.SECURITY_EMAIL_CONFIRM,
                method: 'PATCH',
                body,
            }),
            invalidatesTags: ['Profile', 'User'],
        }),

        deactivateAccount: builder.mutation<ApiResponse<undefined>, void>({
            query: () => ({
                url: API_ENDPOINTS.PROFILE.SECURITY_ACCOUNT_DEACTIVATE,
                method: 'PATCH',
            }),
            invalidatesTags: ['Profile', 'User', 'Sessions'],
        }),

        deleteAccount: builder.mutation<ApiResponse<undefined>, void>({
            query: () => ({
                url: API_ENDPOINTS.PROFILE.SECURITY_ACCOUNT_DELETE,
                method: 'DELETE',
            }),
            invalidatesTags: ['Profile', 'User', 'Sessions'],
        }),

        // --- Session Management ---
        getActiveSessions: builder.query<ApiResponse<UserSessionData[]>, void>({
            query: () => ({
                url: API_ENDPOINTS.PROFILE.SECURITY_SESSIONS,
                method: 'GET',
            }),
            providesTags: ['Sessions'],
        }),

        revokeSession: builder.mutation<ApiResponse<undefined>, string>({
            query: (sessionId) => ({
                url: API_ENDPOINTS.PROFILE.SECURITY_SESSIONS_REVOKE(sessionId),
                method: 'DELETE',
            }),
            invalidatesTags: ['Sessions'],
        }),

        revokeOtherSessions: builder.mutation<ApiResponse<undefined>, void>({
            query: () => ({
                url: API_ENDPOINTS.PROFILE.SECURITY_SESSIONS_OTHER,
                method: 'DELETE',
            }),
            invalidatesTags: ['Sessions'],
        }),

        // --- Blocking Management ---
        getBlockedUsers: builder.query<ApiResponse<BlockedUser[]>, GetBlockedUsersQueryParams | void>({
            query: (params) => ({
                url: API_ENDPOINTS.PROFILE.BLOCKED,
                method: 'GET',
                params: params || undefined,
            }),
            providesTags: ['BlockedUsers'],
        }),

        blockUser: builder.mutation<ApiResponse<undefined>, BlockUserRequest>({
            query: (body) => ({
                url: API_ENDPOINTS.PROFILE.BLOCKED,
                method: 'POST',
                body,
            }),
            invalidatesTags: ['BlockedUsers'],
        }),

        unblockUser: builder.mutation<ApiResponse<undefined>, string>({
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
    useUploadProfilePhotoMutation,
    useSetPrimaryPhotoMutation,
    useRemoveProfilePhotoMutation,
    useUpdateMedicalRecordMutation,
    useSaveUserFullPreferencesMutation,
    useUpdatePrivacySettingsMutation,
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