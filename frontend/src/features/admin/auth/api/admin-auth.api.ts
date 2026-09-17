import { createApi, fetchBaseQuery, type BaseQueryFn, type FetchArgs, type FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../../../../app/store";
import { adminLogout, setAdminCredentials } from "../slices/admin-auth.slice";

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

const AdminBaseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
    args,
    api,
    extraOptions
) => {
    let result = await adminBaseQuery(args, api, extraOptions);

    const isRefreshRequest = typeof args === 'string' ? args === '/admin/auth/refresh' : args.url === '/admin/auth/refresh';

    if (result.error && result.error.status === 401 && !isRefreshRequest) {
        const refreshResult = await adminBaseQuery(
            { url: '/admin/auth/refresh', method: "POST" },
            api,
            extraOptions
        );

        if (refreshResult.data) {
            const data = refreshResult.data as { accessToken: string, admin: any };
            api.dispatch(setAdminCredentials({
                accessToken: data.accessToken,
                admin: data.admin
            }));
            result = await adminBaseQuery(args, api, extraOptions);
        } else {
            api.dispatch(adminLogout());
            api.dispatch(adminAuthApi.util.resetApiState());
            window.location.href = '/admin/login';
        }
    }
    return result;
}

export const adminAuthApi = createApi({
    reducerPath: 'adminAuthApi',
    baseQuery: AdminBaseQueryWithReauth,
    endpoints: (builder) => ({
        adminLogin: builder.mutation<any, { email: string; password: string }>({
            query: (credentials) => ({
                url: '/admin/auth/login',
                method: 'POST',
                body: credentials,
            }),
        }),

        adminForgotPassword: builder.mutation<{ message: string }, { email: string }>({
            query: (body) => ({
                url: '/admin/auth/forgot-password',
                method: 'POST',
                body,
            }),
        }),

        adminResetPassword: builder.mutation<{ message: string }, any>({
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

        adminLogout: builder.mutation<{ messagel: string }, void>({
            query: () => ({
                url: '/admin/auth/logout',
                method: "POST",
            }),
        }),

        adminRefresh: builder.mutation<{ accessToken: string, admin: any }, void>({
            query: () => ({
                url: '/admin/auth/refresh',
                method: 'POST'
            })
        }),
    }),
});

export const {
    useAdminLoginMutation,
    useAdminForgotPasswordMutation,
    useAdminResetPasswordMutation,
    useAdminVerifyResetOtpMutation,
    useAdminLogoutMutation,
    useAdminRefreshMutation
} = adminAuthApi;