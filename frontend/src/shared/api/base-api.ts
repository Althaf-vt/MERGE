import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { Mutex } from 'async-mutex';
import { logout, setCredentials, type AuthUser } from '../../features/auth/slices/auth.slice';
import type { RootState } from '../../app/store';
import { ErrorCode } from '../enums/ErrorCode';
import { API_ENDPOINTS } from '../constants/api-endpoints.constant';
import type { ApiResponse } from '../types/api-response.types';

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
        const responseData = result.error.data as ApiResponse<unknown>;
        const backendError = responseData.error;

        if (backendError) {
            switch (backendError.code) {
                case ErrorCode.HANDOFF_SESSION_EXPIRED:
                    window.location.href = '/onboarding/kyc?session=expired';
                    break;
                case ErrorCode.INTERNAL_SERVER_ERROR:
                    console.error('System error occurred. Please try again later.');
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
    const isRefreshRequest = requestUrl === API_ENDPOINTS.AUTH.REFRESH;
    const isAuthRequest =
        requestUrl === API_ENDPOINTS.AUTH.LOGIN ||
        requestUrl === API_ENDPOINTS.AUTH.GOOGLE ||
        requestUrl === API_ENDPOINTS.AUTH.REGISTER ||
        requestUrl === API_ENDPOINTS.AUTH.VERIFY_OTP ||
        requestUrl === API_ENDPOINTS.AUTH.FORGOT_PASSWORD ||
        requestUrl === API_ENDPOINTS.AUTH.RESET_PASSWORD;

    if (result.error && result.error.status === 401 && !isRefreshRequest && !isAuthRequest) {
        if (!mutex.isLocked()) {
            const release = await mutex.acquire();
            try {
                const refreshResult = await baseQuery(
                    { url: API_ENDPOINTS.AUTH.REFRESH, method: 'POST' },
                    api,
                    extraOptions
                );

                if (refreshResult.data) {
                    const response = refreshResult.data as ApiResponse<{ accessToken: string; user: AuthUser }>;
                    if (response.success && response.data) {
                        api.dispatch(
                            setCredentials({
                                accessToken: response.data.accessToken,
                                user: response.data.user,
                            })
                        );
                        result = await baseQuery(args, api, extraOptions);
                    } else {
                        throw new Error('Refresh failed payload extraction');
                    }
                } else {
                    api.dispatch(logout());
                    api.dispatch({ type: 'api/resetApiState' });
                    window.location.href = '/login';
                }
            } catch {
                api.dispatch(logout());
                api.dispatch({ type: 'api/resetApiState' });
                window.location.href = '/login';
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
    reducerPath: 'api',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['User', 'Profile', 'Sessions', 'BlockedUsers'],
    endpoints: () => ({}),
});