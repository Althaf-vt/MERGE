import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../auth/api/auth.api";
import type { LivenessResponse } from "../types";

// use the new wrapper in your API
export const kycApi = createApi({

    // Unique key use by redux to store RTK Query state for this API
    reducerPath: 'kycApi',
    baseQuery: baseQueryWithReauth,
    endpoints: (builder) => ({

        // Acceps a native FormData object containing the file buffer and text fields
        submitKyc: builder.mutation<any, FormData>({
            query: (formData) => ({
                url: '/kyc/submit',
                method: 'POST',
                body: formData,
            })
        }),
        submitLiveSelfie: builder.mutation<{success: boolean, message: string}, FormData>({
            query: (formData) => ({
                url: '/kyc/selfie',
                method: 'POST',
                body: formData
            })
        }),

        submitLiveness: builder.mutation<LivenessResponse, FormData>({
            query: (formData) => ({
                url: '/kyc/liveness',
                method: 'POST',
                body: formData
            })
        }),

        submitFinalVerification: builder.mutation<{success: boolean, status: string}, void>({
            query: () => ({
                url: '/kyc/submit-verification',
                method: 'POST'
            })
        })

    })
})

export const { 
    useSubmitKycMutation,
    useSubmitLiveSelfieMutation, 
    useSubmitLivenessMutation,
    useSubmitFinalVerificationMutation
} = kycApi;