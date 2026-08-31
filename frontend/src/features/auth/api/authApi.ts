import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';

// DTO used to type the data sent to the auth API
import type { LoginUserDto, RegisterUserDto, VerifyOtpDto } from '../types';
import type { RootState } from '../../../app/store'
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { logout, setCredentials } from '../slices/authSlice';

// 1. Define the standard base query with the outgoing token injector
export const baseQuery = fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3110/api/v1',
    credentials: 'include',
    prepareHeaders: (headers, {getState}) => {
        const token = (getState() as RootState).auth.accessToken;

        if(token){
            headers.set('authorization', `Bearer ${token}`);
        }
        return headers;
    }
})

// 2. Create the Re-authorization wrapper (The incoming checkpoint)
export const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async(
    args,
    api,
    extraOptions
) => {
    // A. Wait for the initial request to finish
    let result = await baseQuery(args, api, extraOptions);

    // B. If the request fails with a 401 Unauthorized, the token is dead
    if(result.error && result.error.status === 401){

        // Silently call the refresh endpoint
        // The browser automatically attached the HttpOnly cookie here
        const refreshResult = await baseQuery(
            {
                url: '/auth/refresh',
                method: 'POST'
            },
            api,
            extraOptions
        )

        if(refreshResult.data){
            // Success! Store the new access token in Redux
            const data = refreshResult.data as {accessToken: string};
            const rootState = api.getState() as RootState;

            // Save the new access token
            api.dispatch(setCredentials({
                accessToken: data.accessToken,
                user: rootState.auth.user!
            }));

            // Retry the original query
            result = await baseQuery(args,api, extraOptions);
        }else{
            // token is dead or missing, force logout
            api.dispatch(logout())

            // Completely wipe all cached API data from Redux memory
            api.dispatch(authApi.util.resetApiState());
        }
    }

    return result
}

// 3. Use the new wrapper in your API
export const authApi = createApi({

    // Unique key used by Redux to store RTK Query state for this API
    reducerPath: 'authApi',
    baseQuery: baseQueryWithReauth,

    endpoints: (builder) => ({

        // Sends the registration data to the backend
        registerUser: builder.mutation<any, RegisterUserDto>({ // mutation means changing something on server
            query: (credentials) => ({
                url: '/auth/register',
                method: 'POST',
                body: credentials,
            })
        }),

        // Sends the email and OTP to the backend for verification
        verifyOtp: builder.mutation<any, VerifyOtpDto>({
            query: (data) => ({
                url: '/auth/verify-otp',
                method: 'POST',
                body: data
            })
        }),

        // Sends the login credentials to the backend for verification
        loginUser: builder.mutation<any, LoginUserDto>({
            query: (credentials) => ({
                url: '/auth/login',
                method: 'POST',
                body: credentials
            })
        }),

        refresh: builder.mutation<{accessToken: string, user: any}, void>({
            query: () => ({
                url: '/auth/refresh',
                method: 'POST'
            })
        }),
    })
})

// RTK Query automatically generates hooks for calling these endpoints
export const {useRegisterUserMutation, useVerifyOtpMutation, useLoginUserMutation, useRefreshMutation} = authApi;