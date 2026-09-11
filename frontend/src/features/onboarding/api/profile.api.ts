import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../auth/api/auth.api";

export const profileApi = createApi({
    reducerPath: 'profileApi',
    baseQuery: baseQueryWithReauth,
    endpoints: (builder) => ({
        updatePersona: builder.mutation<any, any>({
            query: (payload) => ({
                url: '/profile/persona',
                method: 'PATCH',
                body: payload
            })
        }),

        updateLifestyle: builder.mutation<any, any>({
            query: (payload) => ({
                url: '/profile/lifestyle',
                method: 'PATCH',
                body: payload
            })
        }),

        updatePreferences: builder.mutation<any, any>({
            query: (payload) => ({
                url: '/profile/preferences',
                method: 'PATCH',
                body: payload
            })
        }),

        generateBio: builder.mutation<any, any>({
            query: (payload) => ({
                url: '/profile/bio/generate',
                method: 'POST',
                body: payload
            })
        }),

        saveFinalBio: builder.mutation<any, any>({
            query: (payload) => ({
                url: '/profile/bio/save',
                method: 'PATCH',
                body: payload
            })
        })
    })
})

export const {
    useUpdatePersonaMutation, 
    useUpdateLifestyleMutation, 
    useUpdatePreferencesMutation,
    useGenerateBioMutation,
    useSaveFinalBioMutation
} = profileApi