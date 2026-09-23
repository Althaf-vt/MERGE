import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../../../app/store";
import type { CastingResponse } from "../types/casting.types";

export const castingDirectorApi = createApi({
    reducerPath: 'castingDirectorApi',
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
    })
})

export const {
    useInitializeSessionMutation,
    useProcessMessageMutation,
    useFinalizeSessionMutation,
} = castingDirectorApi;