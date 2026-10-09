import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { Mutex } from 'async-mutex';
import { adminLogout, setAdminCredentials } from '../slices/admin-auth.slice';
import type { RootState } from '../../../../app/store';

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
    const isRefreshRequest = requestUrl === '/admin/auth/refresh';
    const isAuthRequest =
        requestUrl === '/admin/auth/login' ||
        requestUrl === '/admin/auth/forgot-password' ||
        requestUrl === '/admin/auth/reset-password' ||
        requestUrl === '/admin/auth/verify-reset-otp';

    if (result.error && result.error.status === 401 && !isRefreshRequest && !isAuthRequest) {
        if (!adminMutex.isLocked()) {
            const release = await adminMutex.acquire();
            try {
                const refreshResult = await adminBaseQuery(
                    { url: '/admin/auth/refresh', method: 'POST' },
                    api,
                    extraOptions
                );

                if (refreshResult.data) {
                    const data = refreshResult.data as { accessToken: string; admin: any };
                    api.dispatch(setAdminCredentials({
                        accessToken: data.accessToken,
                        admin: data.admin
                    }));
                    result = await adminBaseQuery(args, api, extraOptions);
                } else {
                    api.dispatch(adminLogout());
                    api.dispatch({ type: 'adminApi/resetApiState' });
                    window.location.href = '/admin/login';
                }
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