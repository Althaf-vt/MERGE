import { rootApi } from '../../../shared/api/base-api';
import type { LoginUserDto, RegisterUserDto, VerifyOtpDto } from '../types';

export const authApi = rootApi.injectEndpoints({
    endpoints: (builder) => ({
        registerUser: builder.mutation<any, RegisterUserDto>({
            query: (credentials) => ({
                url: '/auth/register',
                method: 'POST',
                body: credentials,
            })
        }),

        verifyOtp: builder.mutation<any, VerifyOtpDto>({
            query: (data) => ({
                url: '/auth/verify-otp',
                method: 'POST',
                body: data
            })
        }),

        resendOtp: builder.mutation<any, { email: string }>({
            query: (data) => ({
                url: '/auth/resend-otp',
                method: 'POST',
                body: data
            })
        }),

        loginUser: builder.mutation<any, LoginUserDto>({
            query: (credentials) => ({
                url: '/auth/login',
                method: 'POST',
                body: credentials
            })
        }),

        forgotPassword: builder.mutation<any, { email: string }>({
            query: (data) => ({
                url: '/auth/forgot-password',
                method: 'POST',
                body: data
            })
        }),

        resetPassword: builder.mutation<any, any>({
            query: (data) => ({
                url: '/auth/reset-password',
                method: 'POST',
                body: data
            })
        }),

        googleLogin: builder.mutation<any, { idToken: string }>({
            query: (data) => ({
                url: '/auth/google',
                method: 'POST',
                body: data
            })
        }),

        refresh: builder.mutation<{ accessToken: string, user: any }, void>({
            query: () => ({
                url: '/auth/refresh',
                method: 'POST'
            })
        }),

        logoutUser: builder.mutation<{ message: string }, void>({
            query: () => ({
                url: '/auth/logout',
                method: 'POST',
            }),
        }),
    }),
    overrideExisting: false,
});

export const {
    useRegisterUserMutation,
    useVerifyOtpMutation,
    useResendOtpMutation,
    useLoginUserMutation,
    useForgotPasswordMutation,
    useResetPasswordMutation,
    useGoogleLoginMutation,
    useRefreshMutation,
    useLogoutUserMutation
} = authApi;