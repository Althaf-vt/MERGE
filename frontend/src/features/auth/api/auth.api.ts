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

    // --- GLOBAL DDD ERROR HANDLING (Replaces Axios Interceptor) ---
    if (result.error && result.error.data) {
        const backendError = (result.error.data as ApiErrorResponse).error;

        if (backendError) {
            switch (backendError.code) {
                case ErrorCode.HANDOFF_SESSION_EXPIRED:
                    alert("QR Code expired, please generate a new one.");
                    break;
                case ErrorCode.LIVENESS_CHECK_FAILED:
                    // Redirect back to camera screen or show global modal
                    break;
                // Add other non-401 global catches here as needed
            }
        }
    }
    // --------------------------------------------------------------

    // B. If the request fails with a 401 Unauthorized, the token might be dead
    if (result.error && result.error.status === 401) {

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