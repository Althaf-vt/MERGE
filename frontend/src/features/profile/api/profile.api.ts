// frontend/src/features/profile/api/profile.api.ts

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../../../app/store';
import type { 
    ProfileStandardResponse, 
    SetPrimaryPhotoRequest, 
    UpdateFullProfileRequest, 
    UpdateMedicalRequest, 
    UpdatePrivacyRequest 
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
    tagTypes: ['Profile', 'User'],
    endpoints: (builder) => ({

        updateFullProfile: builder.mutation<ProfileStandardResponse, UpdateFullProfileRequest>({
            query: (body) => ({
                url: '/profile/full',
                method: 'PATCH',
                body,
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

        updatePrivacySettings: builder.mutation<ProfileStandardResponse, UpdatePrivacyRequest>({
            query: (body) => ({
                url: '/profile/privacy',
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

        // Note: You can add updatePersona, updateLifestyle, etc., here mapping to the existing endpoints
    }),
});

export const {
    useUpdateFullProfileMutation,
    useUpdateMedicalRecordMutation,
    useUpdatePrivacySettingsMutation,
    useUploadProfilePhotoMutation,
    useSetPrimaryPhotoMutation,
    useRemoveProfilePhotoMutation
} = profileApi;