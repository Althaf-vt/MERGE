// frontend/src/features/profile/api/profile.api.ts

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../../../app/store';
import type {
    ConfirmEmailChangeRequest,
    GetActiveSessionsResponse,
    GetProfileResponse,
    InitiateEmailChangeRequest,
    ProfileStandardResponse,
    SetPrimaryPhotoRequest,
    UpdateFullProfileRequest,
    UpdateMedicalRequest,
    UpdatePrivacyRequest,
    UpdateSecurityPasswordRequest
} from '../types/profile.types';

export const profileApi = createApi({
    reducerPath: 'userProfileApi',
    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3110/api/v1',
        prepareHeaders: (headers, { getState }) => {
            const token = (getState() as RootState).auth.accessToken;
            if (token) {
                headers.set('authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ['Profile', 'User', 'Sessions'],
    endpoints: (builder) => ({

        getProfile: builder.query<GetProfileResponse, void>({
            query: () => ({
                url: '/profile',
                method: 'GET',
            }),
            providesTags: ['Profile'],
        }),

        updateFullProfile: builder.mutation<ProfileStandardResponse, UpdateFullProfileRequest>({
            query: (body) => ({
                url: '/profile/full',
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
                    url: '/profile/photos',
                    method: 'POST',
                    body: formData,
                };
            },
            invalidatesTags: ['Profile', 'User'],
        }),

        setPrimaryPhoto: builder.mutation<ProfileStandardResponse, SetPrimaryPhotoRequest>({
            query: (body) => ({
                url: '/profile/photos/primary',
                method: 'PATCH',
                body,
            }),
            invalidatesTags: ['Profile', 'User'],
        }),

        removeProfilePhoto: builder.mutation<ProfileStandardResponse, string>({
            query: (photoId) => ({
                url: `/profile/photos/${photoId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Profile', 'User'],
        }),

        updateMedicalRecord: builder.mutation<ProfileStandardResponse, UpdateMedicalRequest>({
            query: (body) => ({
                url: '/profile/medical',
                method: 'PATCH',
                body,
            }),
            invalidatesTags: ['Profile', 'User'],
        }),

        saveUserFullPreferences: builder.mutation<ProfileStandardResponse, any>({
            query: (body) => ({
                url: '/profile/preferences',
                method: 'PATCH',
                body,
            }),
            invalidatesTags: ['Profile', 'User'],
        }),

        updatePrivacySettings: builder.mutation<ProfileStandardResponse, UpdatePrivacyRequest>({
            query: (body) => ({
                url: '/profile/privacy',
                method: 'PATCH',
                body,
            }),
            invalidatesTags: ['Profile', 'User'],
        }),

        requestSecurityOtp: builder.mutation<ProfileStandardResponse, void>({
            query: () => ({
                url: '/profile/security/request',
                method: 'POST',
            }),
        }),

        updateSecurityPassword: builder.mutation<ProfileStandardResponse, UpdateSecurityPasswordRequest>({
            query: (body) => ({
                url: '/profile/privacy',
                method: 'POST',
                body,
            }),
        }),

        initiateEmailChange: builder.mutation<ProfileStandardResponse, InitiateEmailChangeRequest>({
            query: (body) => ({
                url: '/profile/security/email/initiate',
                method: 'POST',
                body,
            }),
        }),

        confirmEmailChange: builder.mutation<ProfileStandardResponse, ConfirmEmailChangeRequest>({
            query: (body) => ({
                url: '/profile/security/email/confirm',
                method: 'PATCH',
                body,
            }),
            invalidatesTags: ['Profile', 'User'],
        }),

        deactivateAccount: builder.mutation<ProfileStandardResponse, void>({
            query: () => ({
                url: '/profile/security/account/deactivate',
                method: 'PATCH',
            }),
            invalidatesTags: ['Profile', 'User', 'Sessions'],
        }),

        deleteAccount: builder.mutation<ProfileStandardResponse, void>({
            query: () => ({
                url: '/profile/security/account/delete',
                method: 'DELETE',
            }),
            invalidatesTags: ['Profile', 'User', 'Sessions'],
        }),

        getActiveSessions: builder.query<GetActiveSessionsResponse, void>({
            query: () => ({
                url: '/profile/security/sessions',
                method: 'GET',
            }),
            providesTags: ['Sessions'],
        }),

        revokeSession: builder.mutation<ProfileStandardResponse, string>({
            query: (sessionId) => ({
                url: `/profile/security/sessions/${sessionId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Sessions'],
        }),

        revokeOtherSessions: builder.mutation<ProfileStandardResponse, void>({
            query: () => ({
                url: '/profile/security/sessions/other',
                method: 'DELETE',
            }),
            invalidatesTags: ['Sessions'],
        }),
    }),
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
    useRevokeOtherSessionsMutation
} = profileApi;