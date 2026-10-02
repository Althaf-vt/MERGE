import { rootApi } from '../../../shared/api/base-api';

interface HandoffSessionResponse {
    success: boolean;
    message: string;
    data: {
        sessionId: string;
        qrCodeUrl: string;
        expiresAt: string;
    };
}

export const handoffApi = rootApi.injectEndpoints({
    endpoints: (builder) => ({
        generateSession: builder.mutation<HandoffSessionResponse, void>({
            query: () => ({
                url: '/verification/phone-handoff/session',
                method: 'POST'
            })
        }),

        cancelSession: builder.mutation<{ success: boolean }, string>({
            query: (sessionId) => ({
                url: `/verification/phone-handoff/${sessionId}/cancel`,
                method: 'POST',
            })
        }),

        validateMobileSession: builder.query<{ success: boolean, data: { accessToken: string } }, string>({
            query: (sessionId) => ({
                url: `/verification/phone-handoff/${sessionId}`,
                method: 'GET'
            })
        }),

        completeMobileSession: builder.mutation<{ success: boolean }, string>({
            query: (sessionId) => ({
                url: `verification/phone-handoff/${sessionId}/complete`,
                method: 'POST',
            })
        })
    }),
    overrideExisting: false,
});

export const {
    useGenerateSessionMutation,
    useCancelSessionMutation,
    useValidateMobileSessionQuery,
    useCompleteMobileSessionMutation
} = handoffApi;