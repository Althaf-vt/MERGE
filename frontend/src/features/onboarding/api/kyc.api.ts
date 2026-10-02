import { rootApi } from '../../../shared/api/base-api';
import type { LivenessResponse } from '../types';

export const kycApi = rootApi.injectEndpoints({
    endpoints: (builder) => ({
        submitKyc: builder.mutation<any, FormData>({
            query: (formData) => ({
                url: '/kyc/submit',
                method: 'POST',
                body: formData,
            })
        }),

        submitLiveSelfie: builder.mutation<{ success: boolean, message: string }, FormData>({
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

        submitFinalVerification: builder.mutation<{ success: boolean, status: string }, void>({
            query: () => ({
                url: '/kyc/submit-verification',
                method: 'POST'
            })
        })
    }),
    overrideExisting: false,
});

export const { 
    useSubmitKycMutation,
    useSubmitLiveSelfieMutation, 
    useSubmitLivenessMutation,
    useSubmitFinalVerificationMutation
} = kycApi;