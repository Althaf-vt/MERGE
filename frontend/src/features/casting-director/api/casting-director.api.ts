import { rootApi } from '../../../shared/api/base-api';
import { API_ENDPOINTS } from '../../../shared/constants/api-endpoints.constant';
import type { ApiResponse } from '../../../shared/types/api-response.types';
import type { CastingSession, ProcessCastingMessagePayload } from '../types/casting.types';

export const castingDirectorApi = rootApi.injectEndpoints({
    endpoints: (builder) => ({
        initializeSession: builder.mutation<ApiResponse<CastingSession>, void>({
            query: () => ({
                url: API_ENDPOINTS.CASTING_DIRECTOR.INITIALIZE,
                method: 'POST',
            }),
        }),

        processMessage: builder.mutation<ApiResponse<CastingSession>, ProcessCastingMessagePayload>({
            query: (body) => ({
                url: API_ENDPOINTS.CASTING_DIRECTOR.MESSAGE,
                method: 'POST',
                body,
            }),
        }),

        finalizeSession: builder.mutation<ApiResponse<undefined>, void>({
            query: () => ({
                url: API_ENDPOINTS.CASTING_DIRECTOR.FINALIZE,
                method: 'POST',
            }),
            invalidatesTags: ['User', 'Profile'],
        }),
    }),
    overrideExisting: false,
});

export const {
    useInitializeSessionMutation,
    useProcessMessageMutation,
    useFinalizeSessionMutation,
} = castingDirectorApi;