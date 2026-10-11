import { rootApi } from '../../../shared/api/base-api';
import { API_ENDPOINTS } from '../../../shared/constants/api-endpoints.constant';
import type { ApiResponse } from '../../../shared/types/api-response.types';
import type {
    AuthSessionData,
    AuthUser,
    ForgotPasswordDto,
    GoogleLoginDto,
    LoginUserDto,
    RegisterUserDto,
    ResendOtpDto,
    ResetPasswordDto,
    VerifyOtpDto,
} from '../types';

export const authApi = rootApi.injectEndpoints({
    endpoints: (builder) => ({
        registerUser: builder.mutation<ApiResponse<undefined>, RegisterUserDto>({
            query: (credentials) => ({
                url: API_ENDPOINTS.AUTH.REGISTER,
                method: 'POST',
                body: credentials,
            }),
        }),

        verifyOtp: builder.mutation<ApiResponse<AuthUser>, VerifyOtpDto>({
            query: (data) => ({
                url: API_ENDPOINTS.AUTH.VERIFY_OTP,
                method: 'POST',
                body: data,
            }),
        }),

        resendOtp: builder.mutation<ApiResponse<undefined>, ResendOtpDto>({
            query: (data) => ({
                url: API_ENDPOINTS.AUTH.RESEND_OTP,
                method: 'POST',
                body: data,
            }),
        }),

        loginUser: builder.mutation<ApiResponse<AuthSessionData>, LoginUserDto>({
            query: (credentials) => ({
                url: API_ENDPOINTS.AUTH.LOGIN,
                method: 'POST',
                body: credentials,
            }),
        }),

        forgotPassword: builder.mutation<ApiResponse<undefined>, ForgotPasswordDto>({
            query: (data) => ({
                url: API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
                method: 'POST',
                body: data,
            }),
        }),

        resetPassword: builder.mutation<ApiResponse<undefined>, ResetPasswordDto>({
            query: (data) => ({
                url: API_ENDPOINTS.AUTH.RESET_PASSWORD,
                method: 'POST',
                body: data,
            }),
        }),

        googleLogin: builder.mutation<ApiResponse<AuthSessionData>, GoogleLoginDto>({
            query: (data) => ({
                url: API_ENDPOINTS.AUTH.GOOGLE,
                method: 'POST',
                body: data,
            }),
        }),

        refresh: builder.mutation<ApiResponse<AuthSessionData>, void>({
            query: () => ({
                url: API_ENDPOINTS.AUTH.REFRESH,
                method: 'POST',
            }),
        }),

        logoutUser: builder.mutation<ApiResponse<undefined>, void>({
            query: () => ({
                url: API_ENDPOINTS.AUTH.LOGOUT,
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
    useLogoutUserMutation,
} = authApi;