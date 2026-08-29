import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../auth/api/authApi";
import type { PresignedUrlResponse, SubmitKycPayload } from "../types";
// import type { GetPresignedUrlDto, SubmitKycDto } from "../types";

// use the new wrapper in your API
export const kycApi = createApi({

    // Unique key use by redux to store RTK Query state for this API
    reducerPath: 'kycApi',
    baseQuery: baseQueryWithReauth,
    endpoints: (builder) => ({

        // We use a mutation so we can trigger this exactly when the user clicks submit
        getPresignedUrl: builder.mutation<PresignedUrlResponse, {mimeType: string}>({
            query: (params) => ({
                url: `/kyc/presigned-url?mimeType=${encodeURIComponent(params.mimeType)}`,
                method: 'GET'
            })
        }),

        submitKyc: builder.mutation<any, SubmitKycPayload>({
            query: (data) => ({
                url: '/kyc/submit',
                method: 'POST',
                body: data,
            })
        }),

    })
})

export const { useGetPresignedUrlMutation, useSubmitKycMutation } = kycApi;