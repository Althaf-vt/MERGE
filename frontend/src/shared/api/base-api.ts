import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { ThunkDispatch, UnknownAction } from '@reduxjs/toolkit';
import type { BaseQueryApi, BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { Mutex } from 'async-mutex';
import { logout, setCredentials, type AuthUser } from '../../features/auth/slices/auth.slice';
import type { RootState } from '../../app/store';
import { ErrorCode } from '../enums/ErrorCode';
import { API_ENDPOINTS } from '../constants/api-endpoints.constant';
import type { ApiResponse } from '../types/api-response.types';

const mutex = new Mutex();
let inFlightRefreshPromise: Promise<boolean> | null = null;

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

const resetAllApiCaches = (dispatch: ThunkDispatch<unknown, unknown, UnknownAction>) => {
    dispatch({ type: 'api/resetApiState' });
    dispatch({ type: 'discoveryApi/resetApiState' });
    dispatch({ type: 'connectionsApi/resetApiState' });
    dispatch({ type: 'scenePartnerApi/resetApiState' });
    dispatch({ type: 'billingApi/resetApiState' });
};

/**
 * Executes a single-flight POST /auth/refresh guarded by the shared reauth mutex
 * so PersistLogin boot restoration and 401 reauth never race or double-fire.
 */
export const refreshAuthSession = (
    dispatch: ThunkDispatch<unknown, unknown, UnknownAction>,
    getState: () => unknown,
    extraOptions: Record<string, unknown> = {}
): Promise<boolean> => {
    if (inFlightRefreshPromise) {
        return inFlightRefreshPromise;
    }

    inFlightRefreshPromise = (async () => {
        const release = await mutex.acquire();
        try {
            const controller = new AbortController();
            const apiContext: BaseQueryApi = {
                signal: controller.signal,
                abort: (reason?: string) => controller.abort(reason),
                dispatch,
                getState,
                extra: undefined,
                endpoint: 'refresh',
                type: 'mutation',
            };

            const refreshResult = await baseQuery(
                { url: API_ENDPOINTS.AUTH.REFRESH, method: 'POST' },
                apiContext,
                extraOptions
            );

            if (refreshResult.data) {
                const response = refreshResult.data as ApiResponse<{ accessToken: string; user: AuthUser }>;
                if (response.success && response.data?.accessToken) {
                    dispatch(
                        setCredentials({
                            accessToken: response.data.accessToken,
                            user: response.data.user,
                        })
                    );
                    return true;
                }
            }
            return false;
        } catch {
            return false;
        } finally {
            release();
            inFlightRefreshPromise = null;
        }
    })();

    return inFlightRefreshPromise;
};

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
            const refreshed = await refreshAuthSession(
                api.dispatch,
                api.getState,
                (extraOptions || {}) as Record<string, unknown>
            );

            if (refreshed) {
                result = await baseQuery(args, api, extraOptions);
            } else {
                api.dispatch(logout());
                resetAllApiCaches(api.dispatch);
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
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
