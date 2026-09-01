import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../auth/api/authApi";

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

    })
})

export const { useSubmitKycMutation, useSubmitLiveSelfieMutation } = kycApi;