import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { Mutex } from 'async-mutex';
import { logout, setCredentials } from '../../features/auth/slices/auth.slice';
import type { RootState } from '../../app/store';
import { ErrorCode } from '../enums/ErrorCode';

// Define the shape of our standard backend error response
interface ApiErrorResponse {
    success: boolean;
    error: {
        code: ErrorCode;
        message: string;
    };
    timestamp: string;
}

const mutex = new Mutex();

const baseQuery = fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3110/api/v1',
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
        headers.set('ngrok-skip-browser-warning', 'true');
        const token = (getState() as RootState).auth.accessToken;
        if (token) {
            headers.set('authorization', `Bearer ${token}`);
        }
        return headers;
    },
});

export const baseQueryWithReauth: BaseQueryFn<
    string | FetchArgs,
    unknown,
    FetchBaseQueryError
> = async (args, api, extraOptions) => {
    await mutex.waitForUnlock();
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
                default:
                    break;
            }
        }
    }
    // --------------------------------------------------------------

    const requestUrl = typeof args === 'string' ? args : args.url;
    const isRefreshRequest = requestUrl === '/auth/refresh';
    const isAuthRequest =
        requestUrl === '/auth/login' ||
        requestUrl === '/auth/google' ||
        requestUrl === '/auth/register' ||
        requestUrl === '/auth/verify-otp' ||
        requestUrl === '/auth/forgot-password' ||
        requestUrl === '/auth/reset-password';

    if (result.error && result.error.status === 401 && !isRefreshRequest && !isAuthRequest) {
        if (!mutex.isLocked()) {
            const release = await mutex.acquire();
            try {
                const refreshResult = await baseQuery(
                    { url: '/auth/refresh', method: 'POST' },
                    api,
                    extraOptions
                );

                if (refreshResult.data) {
                    const data = refreshResult.data as any;
                    api.dispatch(setCredentials({
                        accessToken: data.accessToken,
                        user: data.user
                    }));
                    result = await baseQuery(args, api, extraOptions);
                } else {
                    api.dispatch(logout());
                    // We dispatch a generic clear action to wipe the store
                    api.dispatch({ type: 'rootApi/resetApiState' });
                    window.location.href = '/login';
                }
            } finally {
                release();
            }
        } else {
            await mutex.waitForUnlock();
            result = await baseQuery(args, api, extraOptions);
        }
    }

    return result;
};

export const rootApi = createApi({
    reducerPath: 'api', // Note: Name changed to just 'api' to serve as the unified root
    baseQuery: baseQueryWithReauth,
    tagTypes: ['User', 'Profile', 'Sessions', 'BlockedUsers'],
    endpoints: () => ({}),
});