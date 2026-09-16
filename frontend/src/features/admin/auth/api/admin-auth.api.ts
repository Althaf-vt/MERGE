import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../../../../app/store";

export const adminAuthApi = createApi({
    reducerPath: 'adminAuthApi',
    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3110/api/v1',
        credentials: 'include',
        prepareHeaders: (headers, {getState}) => {
            const token = (getState() as RootState).adminAuth.accessToken;
            if(token){
                headers.set('authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    endpoints: (builder) => ({
        adminLogin: builder.mutation<any, {email: string; password: string}>({
            query: (credentials) => ({
                url: '/admin/auth/login',
                method: 'POST',
                body: credentials,
            }),
        }),

        adminForgotPassword: builder.mutation<{message: string}, {email: string}>({
            query: (body) => ({
                url: '/admin/auth/forgot-password',
                method: 'POST',
                body,
            }),
        }),

        adminResetPassword: builder.mutation<{message: string}, any>({
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
    }),
});

export const {
    useAdminLoginMutation,
    useAdminForgotPasswordMutation,
    useAdminResetPasswordMutation,
    useAdminVerifyResetOtpMutation,
} = adminAuthApi;