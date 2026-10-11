import { rootApi } from '../../../shared/api/base-api';
import { API_ENDPOINTS } from '../../../shared/constants/api-endpoints.constant';
import type { ApiResponse } from '../../../shared/types/api-response.types';
import type { CastingSession, ProcessCastingMessagePayload } from '../types/casting.types';

export const castingDirectorApi = rootApi.injectEndpoints({
    endpoints: (builder) => ({
        initializeCastingSession: builder.mutation<ApiResponse<CastingSession>, void>({
            query: () => ({
                url: API_ENDPOINTS.CASTING_DIRECTOR.INITIALIZE,
                method: 'POST',
            }),
        }),

        sendCastingMessage: builder.mutation<ApiResponse<CastingSession>, ProcessCastingMessagePayload>({
            query: (body) => ({
                url: API_ENDPOINTS.CASTING_DIRECTOR.MESSAGE,
                method: 'POST',
                body,
            }),
        }),

        finalizeCastingSession: builder.mutation<ApiResponse<undefined>, void>({
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
    useInitializeCastingSessionMutation,
    useSendCastingMessageMutation,
    useFinalizeCastingSessionMutation,
} = castingDirectorApi;