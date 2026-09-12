import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { RootState } from '../../../app/store';
import type { LoginUserDto, RegisterUserDto, VerifyOtpDto } from '../types';
import { logout, setCredentials } from '../slices/auth.slice';
import { ErrorCode } from '../../../shared/enums/ErrorCode'; // Import your Enum here

// Define the shape of our standard backend error response
interface ApiErrorResponse {
    success: boolean;
    error: {
        code: ErrorCode;
        message: string;
    };
    timestamp: string;
}

// 1. Define the standard base query with the outgoing token injector
export const baseQuery = fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3110/api/v1',
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
        headers.set('ngrok-skip-browser-warning', 'true');
        const token = (getState() as RootState).auth.accessToken;

        if (token) {
            headers.set('authorization', `Bearer ${token}`);
        }
        return headers;
    }
});

// 2. Create the Re-authorization wrapper (The incoming checkpoint & Global Error Handler)
export const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
    args,
    api,
    extraOptions
) => {
    // A. Wait for the initial request to finish
    let result = await baseQuery(args, api, extraOptions);

    // --- GLOBAL DDD ERROR HANDLING ---
    if (result.error && result.error.data) {
    const backendError = (result.error.data as ApiErrorResponse).error;

    if (backendError) {
        switch (backendError.code) {
            case ErrorCode.HANDOFF_SESSION_EXPIRED:
                window.location.href = '/onboarding/kyc?session=expired';
                break;

            case ErrorCode.INTERNAL_SERVER_ERROR:
                console.error("System error occurred. Please try again later.");
                break;

            case ErrorCode.USER_SUSPENDED:
                api.dispatch(logout());
                window.location.href = '/login?status=suspended';
                break;

            // REMOVED LIVENESS_CHECK_FAILED from here so the local component can catch it

            default:
                break;
        }
    }
}
    // --------------------------------------------------------------

    // Determine if the failed request was already a refresh request
    const isRefreshRequest = typeof args === 'string' ? args === '/auth/refresh' : args.url === '/auth/refresh';

    // B. If the request fails with a 401 Unauthorized, the token might be dead
    // We add !isRefreshRequest to prevent an infinite refresh loop!
    if (result.error && result.error.status === 401 && !isRefreshRequest) {

        // Silently call the refresh endpoint
        const refreshResult = await baseQuery(
            {
                url: '/auth/refresh',
                method: 'POST'
            },
            api,
            extraOptions
        );

        if (refreshResult.data) {
            // Success! Store the new access token in Redux
            const data = refreshResult.data as { accessToken: string };
            const rootState = api.getState() as RootState;

            api.dispatch(setCredentials({
                accessToken: data.accessToken,
                user: rootState.auth.user!
            }));

            // Retry the original query
            result = await baseQuery(args, api, extraOptions);
        } else {
            // token is dead or missing, force logout
            api.dispatch(logout());

            // Completely wipe all cached API data from Redux memory
            api.dispatch(authApi.util.resetApiState());
            
            // Optional: Redirect to login if not already there
            window.location.href = '/login'; 
        }
    }

    return result;
};

// 3. Use the new wrapper in your API
export const authApi = createApi({
    reducerPath: 'authApi',
    baseQuery: baseQueryWithReauth,

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
    })
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