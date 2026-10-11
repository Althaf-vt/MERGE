import { rootApi } from '../../../shared/api/base-api';
import { API_ENDPOINTS } from '../../../shared/constants/api-endpoints.constant';
import type { ApiResponse } from '../../../shared/types/api-response.types';
import type {
    GenerateBioPayload,
    GenerateBioResponseData,
    SaveBioPayload,
    UpdateLifestylePayload,
    UpdateLifestyleResponseData,
    UpdatePersonaPayload,
    UpdatePersonaResponseData,
    UpdatePreferencesPayload,
    UpdatePreferencesResponseData,
} from '../types';

export const onboardingProfileApi = rootApi.injectEndpoints({
    endpoints: (builder) => ({
        updatePersona: builder.mutation<ApiResponse<UpdatePersonaResponseData>, UpdatePersonaPayload>({
            query: (payload) => ({
                url: API_ENDPOINTS.PROFILE.PERSONA,
                method: 'PATCH',
                body: payload,
            }),
            invalidatesTags: ['Profile', 'User'],
        }),

        updateLifestyle: builder.mutation<ApiResponse<UpdateLifestyleResponseData>, UpdateLifestylePayload>({
            query: (payload) => ({
                url: API_ENDPOINTS.PROFILE.LIFESTYLE,
                method: 'PATCH',
                body: payload,
            }),
            invalidatesTags: ['Profile', 'User'],
        }),

        updatePreferences: builder.mutation<ApiResponse<UpdatePreferencesResponseData>, UpdatePreferencesPayload>({
            query: (payload) => ({
                url: API_ENDPOINTS.PROFILE.PREFERENCES,
                method: 'PATCH',
                body: payload,
            }),
            invalidatesTags: ['Profile', 'User'],
        }),

        generateBio: builder.mutation<ApiResponse<GenerateBioResponseData>, GenerateBioPayload>({
            query: (payload) => ({
                url: API_ENDPOINTS.PROFILE.BIO_GENERATE,
                method: 'POST',
                body: payload,
            }),
        }),

        saveFinalBio: builder.mutation<ApiResponse<undefined>, SaveBioPayload>({
            query: (payload) => ({
                url: API_ENDPOINTS.PROFILE.BIO_SAVE,
                method: 'PATCH',
                body: payload,
            }),
            invalidatesTags: ['Profile', 'User'],
        }),
    }),
    overrideExisting: false,
});

export const {
    useUpdatePersonaMutation,
    useUpdateLifestyleMutation,
    useUpdatePreferencesMutation,
    useGenerateBioMutation,
    useSaveFinalBioMutation,
} = onboardingProfileApi;