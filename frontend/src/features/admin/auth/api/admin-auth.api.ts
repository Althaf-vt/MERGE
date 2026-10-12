import { API_ENDPOINTS } from '../../../../shared/constants/api-endpoints.constant';
import type { ApiResponse } from '../../../../shared/types/api-response.types';
import type { AdminAuthSessionData, AdminForgotPasswordPayload, AdminLoginPayload, AdminResetPasswordPayload, AdminVerifyResetOtpPayload } from '../types';
import { adminRootApi } from './admin-base-api';



export const adminAuthApi = adminRootApi.injectEndpoints({
    endpoints: (builder) => ({
        adminLogin: builder.mutation<ApiResponse<AdminAuthSessionData>, AdminLoginPayload>({
            query: (credentials) => ({
                url: API_ENDPOINTS.ADMIN.AUTH.LOGIN,
                method: 'POST',
                body: credentials,
            }),
            invalidatesTags: ['AdminAuth'],
        }),

        adminForgotPassword: builder.mutation<ApiResponse<undefined>, AdminForgotPasswordPayload>({
            query: (body) => ({
                url: API_ENDPOINTS.ADMIN.AUTH.FORGOT_PASSWORD,
                method: 'POST',
                body,
            }),
        }),

        adminResetPassword: builder.mutation<ApiResponse<undefined>, AdminResetPasswordPayload>({
            query: (body) => ({
                url: API_ENDPOINTS.ADMIN.AUTH.RESET_PASSWORD,
                method: 'POST',
                body,
            }),
        }),

        adminVerifyResetOtp: builder.mutation<ApiResponse<undefined>, AdminVerifyResetOtpPayload>({
            query: (body) => ({
                url: API_ENDPOINTS.ADMIN.AUTH.VERIFY_RESET_OTP,
                method: 'POST',
                body,
            }),
        }),

        adminLogout: builder.mutation<ApiResponse<undefined>, void>({
            query: () => ({
                url: API_ENDPOINTS.ADMIN.AUTH.LOGOUT,
                method: 'POST',
            }),
            invalidatesTags: ['AdminAuth'],
        }),

        adminRefresh: builder.mutation<ApiResponse<AdminAuthSessionData>, void>({
            query: () => ({
                url: API_ENDPOINTS.ADMIN.AUTH.REFRESH,
                method: 'POST',
            }),
        }),
    }),
    overrideExisting: false,
});

export const {
    useAdminLoginMutation,
    useAdminForgotPasswordMutation,
    useAdminResetPasswordMutation,
    useAdminVerifyResetOtpMutation,
    useAdminLogoutMutation,
    useAdminRefreshMutation,
} = adminAuthApi;