import { rootApi } from '../../../shared/api/base-api';
import type { CastingResponse } from '../types/casting.types';

export const castingDirectorApi = rootApi.injectEndpoints({
    endpoints: (builder) => ({
        initializeSession: builder.mutation<CastingResponse, void>({
            query: () => ({
                url: '/casting-director/initialize',
                method: 'POST',
            }),
        }),
        processMessage: builder.mutation<CastingResponse, { content: string }>({
            query: (body) => ({
                url: '/casting-director/message',
                method: 'POST',
                body,
            }),
        }),
        finalizeSession: builder.mutation<{ success: boolean; message: string }, void>({
            query: () => ({
                url: '/casting-director/finalize',
                method: 'POST',
            }),
        }),
    }),
    overrideExisting: false,
});

export const {
    useInitializeSessionMutation,
    useProcessMessageMutation,
    useFinalizeSessionMutation,
} = castingDirectorApi;