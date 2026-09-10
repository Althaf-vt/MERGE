import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../auth/api/authApi";

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
        })
    })
})

export const {useUpdatePersonaMutation, useUpdateLifestyleMutation} = profileApi