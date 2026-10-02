import { adminRootApi } from './admin-base-api';

export const adminAuthApi = adminRootApi.injectEndpoints({
    endpoints: (builder) => ({
        adminLogin: builder.mutation<any, { email: string; password: string }>({
            query: (credentials) => ({
                url: '/admin/auth/login',
                method: 'POST',
                body: credentials,
            }),
            invalidatesTags: ['AdminAuth'],
        }),

        adminForgotPassword: builder.mutation<{ message: string }, { email: string }>({
            query: (body) => ({
                url: '/admin/auth/forgot-password',
                method: 'POST',
                body,
            }),
        }),

        adminResetPassword: builder.mutation<{ message: string }, any>({
            query: (body) => ({
                url: '/admin/auth/reset-password',
                method: 'POST',
                body,
            }),
        }),

        adminVerifyResetOtp: builder.mutation<{ message: string }, { email: string; otp: string }>({
            query: (body) => ({
                url: '/admin/auth/verify-reset-otp',
                method: 'POST',
                body,
            }),
        }),

        adminLogout: builder.mutation<{ message: string }, void>({
            query: () => ({
                url: '/admin/auth/logout',
                method: "POST",
            }),
            invalidatesTags: ['AdminAuth'],
        }),

        adminRefresh: builder.mutation<{ accessToken: string, admin: any }, void>({
            query: () => ({
                url: '/admin/auth/refresh',
                method: 'POST'
            })
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
    useAdminRefreshMutation
} = adminAuthApi;