import { rootApi } from '../../../shared/api/base-api';
import { API_ENDPOINTS } from '../../../shared/constants/api-endpoints.constant';
import type { ApiResponse } from '../../../shared/types/api-response.types';
import type { LivenessResponse } from '../types';

export interface SubmitKycDocumentData {
    verifiedName?: string;
    verifiedDOB?: string;
    documentType?: string;
    verificationStatus?: string;
}

export interface SubmitLiveSelfieData {
    status: string;
    faceMatchScore?: number;
    photoUrl?: string;
}

export interface SubmitFinalVerificationData {
    status: string;
    kycCompleted?: boolean;
}

export const kycApi = rootApi.injectEndpoints({
    endpoints: (builder) => ({
        submitKyc: builder.mutation<ApiResponse<SubmitKycDocumentData>, FormData>({
            query: (formData) => ({
                url: API_ENDPOINTS.KYC.SUBMIT,
                method: 'POST',
                body: formData,
            }),
            invalidatesTags: ['User', 'Profile'],
        }),

        submitLiveSelfie: builder.mutation<ApiResponse<SubmitLiveSelfieData>, FormData>({
            query: (formData) => ({
                url: API_ENDPOINTS.KYC.SELFIE,
                method: 'POST',
                body: formData,
            }),
            invalidatesTags: ['User', 'Profile'],
        }),

        submitLiveness: builder.mutation<ApiResponse<LivenessResponse>, FormData>({
            query: (formData) => ({
                url: API_ENDPOINTS.KYC.LIVENESS,
                method: 'POST',
                body: formData,
            }),
            invalidatesTags: ['User', 'Profile'],
        }),

        submitFinalVerification: builder.mutation<ApiResponse<SubmitFinalVerificationData>, void>({
            query: () => ({
                url: API_ENDPOINTS.KYC.SUBMIT_VERIFICATION,
                method: 'POST',
            }),
            invalidatesTags: ['User', 'Profile'],
        }),
    }),
    overrideExisting: false,
});

export const {
    useSubmitKycMutation,
    useSubmitLiveSelfieMutation,
    useSubmitLivenessMutation,
    useSubmitFinalVerificationMutation,
} = kycApi;