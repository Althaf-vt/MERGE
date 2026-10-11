import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { Mutex } from 'async-mutex';
import { adminLogout, setAdminCredentials, type AdminUser } from '../slices/admin-auth.slice';
import type { RootState } from '../../../../app/store';
import { API_ENDPOINTS } from '../../../../shared/constants/api-endpoints.constant';
import type { ApiResponse } from '../../../../shared/types/api-response.types';

const adminMutex = new Mutex();

const adminBaseQuery = fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3110/api/v1',
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
        headers.set('ngrok-skip-browser-warning', 'true');
        const token = (getState() as RootState).adminAuth.accessToken;
        if (token) {
            headers.set('authorization', `Bearer ${token}`);
        }
        return headers;
    },
});

export const adminBaseQueryWithReauth: BaseQueryFn<
    string | FetchArgs,
    unknown,
    FetchBaseQueryError
> = async (args, api, extraOptions) => {
    await adminMutex.waitForUnlock();
    let result = await adminBaseQuery(args, api, extraOptions);

    const requestUrl = typeof args === 'string' ? args : args.url;
    const isRefreshRequest = requestUrl === API_ENDPOINTS.ADMIN.AUTH.REFRESH;
    const isAuthRequest =
        requestUrl === API_ENDPOINTS.ADMIN.AUTH.LOGIN ||
        requestUrl === API_ENDPOINTS.ADMIN.AUTH.FORGOT_PASSWORD ||
        requestUrl === API_ENDPOINTS.ADMIN.AUTH.RESET_PASSWORD ||
        requestUrl === API_ENDPOINTS.ADMIN.AUTH.VERIFY_RESET_OTP;

    if (result.error && result.error.status === 401 && !isRefreshRequest && !isAuthRequest) {
        if (!adminMutex.isLocked()) {
            const release = await adminMutex.acquire();
            try {
                const refreshResult = await adminBaseQuery(
                    { url: API_ENDPOINTS.ADMIN.AUTH.REFRESH, method: 'POST' },
                    api,
                    extraOptions
                );

                if (refreshResult.data) {
                    const response = refreshResult.data as ApiResponse<{ accessToken: string; admin: AdminUser }>;
                    if (response.success && response.data) {
                        api.dispatch(
                            setAdminCredentials({
                                accessToken: response.data.accessToken,
                                admin: response.data.admin,
                            })
                        );
                        result = await adminBaseQuery(args, api, extraOptions);
                    } else {
                        throw new Error('Admin refresh payload extraction failed');
                    }
                } else {
                    api.dispatch(adminLogout());
                    api.dispatch({ type: 'adminApi/resetApiState' });
                    window.location.href = '/admin/login';
                }
            } catch {
                api.dispatch(adminLogout());
                api.dispatch({ type: 'adminApi/resetApiState' });
                window.location.href = '/admin/login';
            } finally {
                release();
            }
        } else {
            await adminMutex.waitForUnlock();
            result = await adminBaseQuery(args, api, extraOptions);
        }
    }

    return result;
};

export const adminRootApi = createApi({
    reducerPath: 'adminApi',
    baseQuery: adminBaseQueryWithReauth,
    tagTypes: ['AdminAuth', 'AdminUsers', 'AdminManagement', 'Admins', 'AdminUserDetails', 'PhotoTasks'],
    endpoints: () => ({}),
});