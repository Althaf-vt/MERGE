import { rootApi } from '../../../shared/api/base-api';
import { API_ENDPOINTS } from '../../../shared/constants/api-endpoints.constant';
import type { ApiResponse } from '../../../shared/types/api-response.types';

export interface HandoffSessionData {
    sessionId: string;
    qrCodeUrl: string;
    expiresAt: string;
}

export interface ValidateMobileSessionData {
    accessToken: string;
    status: string;
}

export const handoffApi = rootApi.injectEndpoints({
    endpoints: (builder) => ({
        generateSession: builder.mutation<ApiResponse<HandoffSessionData>, void>({
            query: () => ({
                url: API_ENDPOINTS.HANDOFF.SESSION,
                method: 'POST',
            }),
        }),

        cancelSession: builder.mutation<ApiResponse<undefined>, string>({
            query: (sessionId) => ({
                url: API_ENDPOINTS.HANDOFF.CANCEL(sessionId),
                method: 'POST',
            }),
        }),

        validateMobileSession: builder.query<ApiResponse<ValidateMobileSessionData>, string>({
            query: (sessionId) => ({
                url: API_ENDPOINTS.HANDOFF.VALIDATE(sessionId),
                method: 'GET',
            }),
        }),

        completeMobileSession: builder.mutation<ApiResponse<undefined>, string>({
            query: (sessionId) => ({
                url: API_ENDPOINTS.HANDOFF.COMPLETE(sessionId),
                method: 'POST',
            }),
        }),
    }),
    overrideExisting: false,
});

export const {
    useGenerateSessionMutation,
    useCancelSessionMutation,
    useValidateMobileSessionQuery,
    useCompleteMobileSessionMutation,
} = handoffApi;